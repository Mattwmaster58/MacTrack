import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { FilterCoreOutputValues } from "../types/filterCoreSchema";
import { Centered } from "./centered";
import { useSearchQuery } from "../hooks/useSearchQuery";
import { AuctionLotCard } from "./auctionLotCard";
import Grid2 from "@mui/material/Unstable_Grid2";

type Props = {
  open: boolean;
  handleClose: () => void;
  title: string;
  data: FilterCoreOutputValues;
};
const FilterPreviewModel = ({ open, handleClose, title, data }: Props) => {
  const { data: auctionLotData, isLoading, isError } = useSearchQuery(data);
  const loadingElem = (
    <Centered>
      <CircularProgress />
    </Centered>
  );
  const cardsContainer = (
    <Grid2 container direction={"row"} spacing={2}>
      {(auctionLotData ?? []).map((lot, idx) => (
        <Grid2 key={idx}>
          <AuctionLotCard auctionInfo={lot} />
        </Grid2>
      ))}
    </Grid2>
  );

  return (
    <Dialog open={open} onClose={handleClose} scroll={"paper"} maxWidth={false}>
      <DialogTitle id={"scroll-dialog-title"}>
        {"Historical Filter Analysis"}
        <div>
          <Typography variant={"subtitle2"}>{title}</Typography>
        </div>
      </DialogTitle>
      <DialogContent
        dividers={true}
        sx={{
          height: "60vh",
          width: "80vw",
        }}
      >
        {isLoading ? loadingElem : cardsContainer}
      </DialogContent>
    </Dialog>
  );
};

export { FilterPreviewModel };
