interface AuctionLot {
  id: number;
  auction_id: number;
  closed_date: string;
  expected_close_date: null;
  inventory_id: number;
  date_created: string; // deserialize to date string later :) "2019-06-19T15:45:00"
  lot_number: number;
  listing_url: string;
  title: string;
  is_open: boolean;
  is_transferrable: boolean;
  total_bids: number;
  winning_customer_id: number;
  winning_bid_id: string;
  winning_bid_amount: number;
  unique_bidders: number;
  product_name: string;
  upc: string;
  description: string;
  quantity: number;
  is_pallet: boolean;
  is_shippable: boolean;
  current_location_id: number;
  shipping_height: number;
  shipping_width: number;
  shipping_length: number;
  warehouse_location: string;
  shipping_weight: number;
  case_packed_qty: number;
  retail_price: number;
  condition_name: "LIKE NEW" | "DAMAGED" | "OPEN BOX";
  category: string;
  image_url: string;
}

export type { AuctionLot };
