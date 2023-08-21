import { z } from "zod";
import { pydanticDatetimeParsedOptional } from "./pydantic";

const AuctionLotCondition = z.enum(["LIKE NEW", "OPEN BOX", "DAMAGED"]);

const AuctionLotSchema = z.object({
  id: z.number(),
  auction_id: z.number().optional(),
  closed_date: pydanticDatetimeParsedOptional,
  expected_close_date: pydanticDatetimeParsedOptional,
  inventory_id: z.number().optional(),
  date_created: pydanticDatetimeParsedOptional,
  lot_number: z.number().optional(),
  listing_url: z.string().optional(),
  title: z.string().optional(),
  is_open: z.boolean().optional(),
  is_transferrable: z.boolean().optional(),
  total_bids: z.number().optional(),
  winning_customer_id: z.number().optional(),
  winning_bid_id: z.string().optional(),
  winning_bid_amount: z.number().optional(),
  unique_bidders: z.number().optional(),
  product_name: z.string().optional(),
  upc: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().optional(),
  is_pallet: z.boolean().optional(),
  is_shippable: z.boolean().optional(),
  current_location_id: z.number().optional(),
  shipping_height: z.number().optional(),
  shipping_width: z.number().optional(),
  shipping_length: z.number().optional(),
  warehouse_location: z.string().optional(),
  shipping_weight: z.number().optional(),
  case_packed_qty: z.number().optional(),
  retail_price: z.number().optional(),
  condition_name: AuctionLotCondition,
  category: z.string().optional(),
  image_url: z.string().optional(),
});

export type AuctionLot = z.infer<typeof AuctionLotSchema>;
export { AuctionLotSchema };
