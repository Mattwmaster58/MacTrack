import { Pagination } from "@mui/material";
import { Stack } from "@mui/system";

interface Props {
  limit: number;
  offset: number;
  total: number;
  onChange: (limit: number, offset: number) => void;
}

const PageRow = ({ limit, offset, total, onChange }: Props) => {
  const count = Math.ceil(total / limit);
  const page = Math.ceil(offset / limit);

  const onChangeWrap = (event: any, page: number) => {
    onChange(limit, limit * (page - 1));
  };

  return (
    <Stack direction={"row"} justifyContent={"center"}>
      <Pagination count={count} defaultPage={page} onChange={onChangeWrap} />
    </Stack>
  );
};

export { PageRow };
