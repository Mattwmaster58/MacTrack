import { Stack } from "@mui/system";
import { MenuItem, Select, Typography } from "@mui/material";
import React, { useState } from "react";
import { TagInput } from "./common/tagInput";

enum MatchType {
  ANY = "any",
  ALL = "all",
}

const FilterContent: React.FC = () => {
  const [matchType, setMatchType] = useState(MatchType.ANY);

  return (
    <Stack flexDirection="column" useFlexGap spacing={2}>
      <Stack flexDirection="column" alignItems="center" useFlexGap spacing={2}>
        <Stack flexDirection="row" alignItems="center">
          <Typography alignItems={"center"}>Include items where</Typography>
          <Select
            value={matchType}
            onChange={(e) => setMatchType(e.target.value as MatchType)}
          >
            <MenuItem value={MatchType.ANY}>{MatchType.ANY}</MenuItem>
            <MenuItem value={MatchType.ALL}>{MatchType.ALL}</MenuItem>
          </Select>
          of the following terms match
        </Stack>
        <TagInput />
      </Stack>
      <Stack flexDirection="row" alignItems="center" useFlexGap spacing={2}>
        <Typography alignItems={"center"}>
          and exclude those that contain any of the following
        </Typography>
        <TagInput />
      </Stack>
    </Stack>
  );
};

export { FilterContent };
