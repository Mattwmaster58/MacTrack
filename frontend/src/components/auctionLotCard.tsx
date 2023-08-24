import { Launch } from "@mui/icons-material";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { AuctionLot } from "../types/AuctionLot";
import { formatDistanceToNow } from "date-fns";

interface Props {
  auctionInfo: AuctionLot;
}

function getDatetimeDistanceDescription(auctionInfo: AuctionLot) {
  let datetimeInfo: string;
  if (auctionInfo.is_open) {
    if (auctionInfo.expected_close_date) {
      datetimeInfo = `Closing in ${formatDistanceToNow(
        auctionInfo.expected_close_date,
      )}`;
    } else {
      datetimeInfo = `Closing eventually`;
    }
  } else {
    const bestClosedGuess =
      auctionInfo.closed_date ?? auctionInfo.expected_close_date;
    if (bestClosedGuess) {
      datetimeInfo = `Closed ${formatDistanceToNow(bestClosedGuess)} ago`;
    } else {
      datetimeInfo = "Closed some time ago";
    }
  }
  return datetimeInfo;
}

const AuctionLotCard = ({ auctionInfo }: Props) => {
  let discountRate: number | string;
  if (auctionInfo.winning_bid_amount && auctionInfo.retail_price) {
    discountRate = Math.round(
      (1 - auctionInfo.winning_bid_amount / auctionInfo.retail_price) * 100,
    );
  } else {
    discountRate = "?";
  }
  const datetimeDescription = getDatetimeDistanceDescription(auctionInfo);

  return (
    <Card sx={{ width: "18rem", height: "24rem" }}>
      <CardMedia
        sx={{
          height: "10rem",
          objectFit: "contain",
          backgroundPosition: "center",
          backgroundSize: "contain",
          position: "relative",
          //   yes, we set background twice on purpose here
          background: `url("${auctionInfo.image_url}")`,
        }}
        component={"img"}
        image={auctionInfo.image_url ?? undefined}
      />
      <CardContent>
        <Typography
          sx={(theme) => ({
            overflow: "hidden",
            lineClamp: 2,
            textOverflow: "ellipsis",
            height: `${
              (theme.typography.subtitle1.lineHeight as number) * 2
            }em`,
          })}
          textAlign={"left"}
          gutterBottom
          variant={"subtitle1"}
        >
          {auctionInfo.product_name}
        </Typography>
        <Stack
          direction={"row"}
          justifyContent={"center"}
          divider={<Divider orientation={"vertical"} flexItem />}
          spacing={2}
        >
          <Typography>
            {"$"}
            {/*todo: shouldn't show if we don't know*/}
            {parseInt(Math.round(auctionInfo.retail_price ?? 0).toString())}
          </Typography>
          <Typography>
            {"$"}
            {auctionInfo.winning_bid_amount ?? "?"}
          </Typography>
          <Typography>
            {discountRate}
            {"%"}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions>
        <Typography>{datetimeDescription}</Typography>
        <IconButton
          href={`https://mac.bid/lot/${auctionInfo.id}`}
          target={"_blank"}
          size={"small"}
        >
          <Launch />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export { AuctionLotCard };
