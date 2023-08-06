import {Cancel} from "@mui/icons-material";
import {Chip, Stack, TextField, Typography} from "@mui/material";
import {Box} from "@mui/system";
import {useRef, useState} from "react";

interface TagProps {
    data: string;
    handleDelete: (a: TagProps["data"]) => void;
}

const Tag = ({data, handleDelete}: TagProps) => {
    return (
        <Chip label={data} onDelete={() => handleDelete(data)}/>
    );
};

interface TagInputProps {
    initialTags?: TagProps["data"][];
    onTagsChange?: (tag: TagProps["data"][]) => void;
}

const TagInput = ({initialTags, onTagsChange}: TagInputProps) => {
    const [tags, setTags] = useState<TagProps["data"][]>(initialTags ?? []);
    const tagRef = useRef<HTMLInputElement>();

    const handleDelete = (value: TagProps["data"]) => setTags(tags.filter(val => val !== value));

    const handleKeypress = (e: any) => {
        if (["Enter", "Comma"].includes(e.code) && tagRef.current) {
            let newTag = tagRef.current.value;
            if (newTag) {
                if (tags.includes(newTag)) {
                    console.warn("ignoring tag: it has already been specified", newTag)
                } else {
                    let newTagList = [...tags, newTag];
                    setTags(newTagList);
                    onTagsChange && onTagsChange(newTagList);
                }
            }
            tagRef.current.value = "";
            e.preventDefault();
        }
    }


    return (
        <TextField
            onKeyDown={handleKeypress}
            inputRef={tagRef}
            variant='outlined'
            size='medium'
            placeholder={!tags.length ? "Enter terms" : ""}
            InputProps={{
                startAdornment: (
                    <Box sx={{display: "flex"}}>
                        {tags.map((data, index) => {
                            return (
                                <Tag key={index} data={data} handleDelete={handleDelete}/>
                            );
                        })}
                    </Box>
                ),
            }}
        />
    );
}

export {TagInput};

