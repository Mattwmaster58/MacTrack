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
import { AuctionLot } from "../../types/AuctionLot";

interface Props {
  auctionInfo: AuctionLot;
}

const AuctionLotCard = ({ auctionInfo }: Props) => {
  let discountRate: number | string;
  if (auctionInfo.winning_bid_amount) {
    discountRate = Math.round(
      (1 - auctionInfo.winning_bid_amount / auctionInfo.retail_price) * 100,
    );
  } else {
    discountRate = "?";
  }
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
        component="img"
        image={auctionInfo.image_url}
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
          variant="subtitle1"
        >
          {auctionInfo.product_name}
        </Typography>
      </CardContent>

      <Stack
        direction={"row"}
        justifyContent={"center"}
        divider={<Divider orientation="vertical" flexItem />}
        spacing={2}
      >
        <Typography>
          ${parseInt(Math.round(auctionInfo.retail_price).toString())}
        </Typography>
        <Typography>${auctionInfo.winning_bid_amount ?? "?"}</Typography>
        <Typography>{discountRate}%</Typography>
      </Stack>
      <CardActions>
        <IconButton href={`https://mac.bid/lot/${auctionInfo.id}`} size="small">
          <Launch />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export { AuctionLotCard };
