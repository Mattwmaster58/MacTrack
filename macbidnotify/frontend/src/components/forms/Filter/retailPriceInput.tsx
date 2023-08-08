import {TextField, Typography} from "@mui/material";
import {Stack} from "@mui/system";
import React from "react";
import {Control, Controller} from "react-hook-form";
import { ItemFilterValues } from "./types/itemFilterValues";

export function RetailPriceInput<TFieldArrayValues>(
    control: Control<ItemFilterValues, any>
) {
    return (
        <Stack>
            <Typography>Retail price</Typography>
            <Stack flexDirection="row" useFlexGap spacing={2}>
                <Controller
                    name="max_retail_price"
                    control={control}
                    render={({field}) => (
                        <TextField
                            label="Maximum"
                            inputProps={{inputMode: "numeric", pattern: "[0-9]*"}}
                            {...field}
                        />
                    )}
                />
                <Controller
                    name="min_retail_price"
                    control={control}
                    render={({field}) => (
                        <TextField
                            label="Minimum"
                            inputProps={{inputMode: "numeric", pattern: "[0-9]*"}}
                            {...field}
                        />
                    )}
                />
            </Stack>
        </Stack>
    );
}