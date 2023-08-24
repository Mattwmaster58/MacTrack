import { z } from "zod";
import { pydanticDatetimeParsedNullable } from "./pydantic";

const AuctionLotCondition = z.enum(["LIKE NEW", "OPEN BOX", "DAMAGED"]);

const AuctionLotSchema = z.object({
  id: z.number(),
  auction_id: z.number().nullable(),
  closed_date: pydanticDatetimeParsedNullable,
  expected_close_date: pydanticDatetimeParsedNullable,
  inventory_id: z.number().nullable(),
  date_created: pydanticDatetimeParsedNullable,
  lot_number: z.number().nullable(),
  listing_url: z.string().nullable(),
  title: z.string().nullable(),
  is_open: z.boolean().nullable(),
  is_transferrable: z.boolean().nullable(),
  total_bids: z.number().nullable(),
  winning_customer_id: z.number().nullable(),
  winning_bid_id: z.string().nullable(),
  winning_bid_amount: z.number().nullable(),
  unique_bidders: z.number().nullable(),
  product_name: z.string().nullable(),
  upc: z.string().nullable(),
  description: z.string().nullable(),
  quantity: z.number().nullable(),
  is_pallet: z.boolean().nullable(),
  is_shippable: z.boolean().nullable(),
  current_location_id: z.number().nullable(),
  shipping_height: z.number().nullable(),
  shipping_width: z.number().nullable(),
  shipping_length: z.number().nullable(),
  warehouse_location: z.string().nullable(),
  shipping_weight: z.number().nullable(),
  case_packed_qty: z.number().nullable(),
  retail_price: z.number().nullable(),
  condition_name: AuctionLotCondition,
  category: z.string().nullable(),
  image_url: z.string().nullable(),
});

export type AuctionLot = z.infer<typeof AuctionLotSchema>;
export { AuctionLotSchema };
