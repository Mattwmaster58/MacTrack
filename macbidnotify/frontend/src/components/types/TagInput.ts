export interface TagProps {
    data: string;
    handleDelete: () => void;
}

export interface TagInputProps {
    value?: TagProps["data"][];
    onTagsChange?: (tag: TagProps["data"][]) => void;
}