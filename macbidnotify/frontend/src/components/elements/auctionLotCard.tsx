import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { AuctionLot } from "../../types/AuctionLot";
import { Stack } from "@mui/system";

const AuctionLotCard = (props: AuctionLot) => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia sx={{ height: 140 }} image={props.image_url} />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {props.product_name}
        </Typography>
      </CardContent>
      <Stack>
        <Typography>Retail: {props.retail_price}</Typography>
        <Typography>Sold for: {props.winning_bid_amount}</Typography>
      </Stack>
    </Card>
  );
};

export { AuctionLotCard };
