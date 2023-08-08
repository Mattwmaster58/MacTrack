import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { AuctionLot } from "../../types/AuctionLot";
import { Stack } from "@mui/system";
interface Props {
    auctionInfo: AuctionLot
}
const AuctionLotCard = ({auctionInfo}: Props) => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia sx={{ height: 140 }} image={auctionInfo.image_url} />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {auctionInfo.product_name}
        </Typography>
      </CardContent>
      <Stack>
        <Typography>Retail: {auctionInfo.retail_price}</Typography>
        <Typography>Sold for: {auctionInfo.winning_bid_amount}</Typography>
      </Stack>
    </Card>
  );
};

export { AuctionLotCard };
