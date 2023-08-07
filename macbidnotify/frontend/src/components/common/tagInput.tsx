import { Chip, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { useRef, useState } from "react";
import { TagInputProps, TagProps } from "../types/TagInput";

const Tag = ({ data, handleDelete }: TagProps) => {
  return <Chip sx={{ marginRight: 1 }} label={data} onDelete={handleDelete} />;
};

const TagInput = ({ value, onTagsChange }: TagInputProps) => {
  const [tags, setTags] = useState<TagProps["data"][]>(value ?? []);
  const [errorText, setErrorText] = useState("");
  const tagRef = useRef<HTMLInputElement>();

  const handleDelete = (value: TagProps["data"]) =>
    setTags(tags.filter((val) => val !== value));
  const resetErrorText = () => setErrorText("");

  function updateTags(newTagList: TagProps["data"][]) {
    setTags(newTagList);
    onTagsChange && onTagsChange(newTagList);
  }

  function updateTagsFromRef() {
    if (tagRef.current) {
      let newTag = tagRef.current.value;
      if (newTag) {
        if (tags.includes(newTag)) {
          console.warn("ignoring tag: it has already been specified", newTag);
          setErrorText(`Already added the term "${newTag}"`);
        } else {
          updateTags([...tags, newTag]);
          tagRef.current.value = "";
        }
      }
    }
  }

  const handleKeypress = (e: any) => {
    resetErrorText();
    const inputVal = tagRef.current?.value;
    if (["Enter", "Comma"].includes(e.code)) {
      updateTagsFromRef();
      e.preventDefault();
    } else if (e.code === "Backspace" && !tagRef.current?.value) {
      updateTags(tags.slice(0, tags.length - 1));
    } else if (
      e.code !== "Backspace" &&
      inputVal &&
      inputVal[inputVal.length - 1] === "*"
    ) {
      setErrorText("Wildcards can only appear at the end of a term");
      e.preventDefault();
    }
  };

  return (
    //   todo: make the corner rounding the chip match the corner rounding of the input box
    <TextField
      multiline
      onKeyDown={handleKeypress}
      onBlur={updateTagsFromRef}
      inputRef={tagRef}
      variant="outlined"
      size="medium"
      error={errorText.length > 0}
      helperText={errorText}
      placeholder={!tags.length ? "enter terms" : ""}
      InputProps={{
        startAdornment: (
          <Box sx={{ display: "flex" }}>
            {tags.map((data, index) => {
              return (
                <Tag
                  key={index}
                  data={data}
                  handleDelete={() => handleDelete(data)}
                />
              );
            })}
          </Box>
        ),
      }}
    />
  );
};

export { TagInput };
