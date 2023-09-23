import smtplib
import traceback
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from sqlalchemy import select

from data.config_model import SMTPOptions
from data.mac_bid import AuctionGroup, AuctionLotIdx
from data.user import Filter, Notification
from data.user.models import NotificationItem, User, NotificationStatus
from routes.data.search import query_statement_from_filter_core, query_clauses_from_filter_core
from typings import AsyncDbSession

FILTER_ITEM_LIMIT = 100


async def run_filter(session: AsyncDbSession, filter_: Filter) -> None:
    """
    Runs a given filter, inserting Notification and NotificationItem items into the database
    Notably, DOES NOT dispatch the notification

    In the future:
    todo: we can make this smarter to use the last successful invocation of the filter to
    filter out by date. we must do this if we want to avoid.

    Also, we could look at at auctiongroup_scraped date.

    In both cases will need to be careful

    Args:
        session: AsyncDbSession to execute queries on
        filter_: Filter instance to run

    Returns:
        None
    """
    base_clauses = query_clauses_from_filter_core(filter_.payload)
    notification_items_query = select(AuctionLotIdx.id).where(*base_clauses)
    last_filter_run = (
        await session.execute(select(Notification.created_at).order_by(Notification.created_at.desc()))
    ).one_or_none()
    if last_filter_run is not None:
        # todo: log this is happening
        notification_items_query = notification_items_query.join(
            AuctionGroup, AuctionGroup.id == AuctionLotIdx.auction_id
        ).where(AuctionGroup.date_scraped > last_filter_run)

    augmented_query = notification_items_query.limit(FILTER_ITEM_LIMIT + 1)
    auction_lot_ids = (await session.execute(notification_items_query)).scalars()

    exceeded_item_limit = len(auction_lot_ids) > FILTER_ITEM_LIMIT
    notification = Notification(filter_id=filter_.id, exceeded_item_limit=exceeded_item_limit)
    session.add(notification)
    await session.flush()
    breakpoint()  # should have notification.id
    session.add_all(
        NotificationItem(notification_id=notification.id, lot_id=lid) for lid in auction_lot_ids[:FILTER_ITEM_LIMIT]
    )
    await session.commit()


async def dispatch_notification(session: AsyncDbSession, notification: Notification, smtp_options: SMTPOptions) -> None:
    """
    Args:
        notification:

    Returns:

    """
    filter = (await session.execute(select(Filter).where(Filter.id == notification.filter_id))).scalar_one()
    recipient_email = (await session.execute(select(User.email).where(User.id == filter.user_id))).scalar_one()

    subject = f'MacTrack: "{notification.filter_id}" has matched new items!'
    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = smtp_options.smtp_from
    msg["To"] = recipient_email

    # todo
    # Plain text version (optional)
    # plain_text = "This is a plain text email."
    # msg.attach(MIMEText(plain_text, "plain"))

    # HTML version
    html_text = """
    <html>
    <head></head>
    <body>
        <p>This is an <b>HTML</b> email example.</p>
    </body>
    </html>
    """
    msg.attach(MIMEText(html_text, "html"))

    # Establish a secure connection to the SMTP server
    try:
        server = smtplib.SMTP(smtp_options.smtp_server, smtp_options.smtp_port)
        server.starttls()
        server.login(smtp_options.smtp_username, smtp_options.smtp_password)
        server.sendmail(smtp_options.smtp_username, recipient_email, msg.as_string())
    except Exception as e:
        notification.status = NotificationStatus.FAILED
        notification.status_text = traceback.format_exc()
    else:
        notification.status = NotificationStatus.SUCCESS
    finally:
        server.quit()  # Quit the server connection
        session.add(notification)
        await session.commit()
