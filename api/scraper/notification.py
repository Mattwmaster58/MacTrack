from data.user import Filter, Notification
from data.user.models import NotificationItem
from routes.data.search import query_statement_from_filter_core
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
    # todo: we must do the
    query = query_statement_from_filter_core(filter_.payload).limit(FILTER_ITEM_LIMIT + 1)
    auction_lot_ids = [x.id for x in (await session.execute(query)).scalars()]
    exceeded_item_limit = len(auction_lot_ids) > FILTER_ITEM_LIMIT
    notification = Notification(filter_id=filter_.id, exceeded_item_limit=exceeded_item_limit)
    session.add(notification)
    await session.flush()
    breakpoint()  # should have notification.id
    session.add_all(
        NotificationItem(notification_id=notification.id, lot_id=lid) for lid in auction_lot_ids[:FILTER_ITEM_LIMIT]
    )
    await session.commit()


async def attempt_notification_dispatch(notification: Notification) -> None:
    """
    mailersend: 9k/mo, heavy KYC, custom domain required, free, python SDK
    brevo: 9k/mo, light KYC, SMTP API, emails sent as FROM your own google account :(
    email octupus: 10k/mo, heavy KYC, bad API

    Args:
        notification:

    Returns:

    """
    pass
