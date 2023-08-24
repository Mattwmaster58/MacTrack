export interface TagProps {
  data: string;
  handleDelete: () => void;
}

export interface TagInputProps {
  initialTags?: TagProps["data"][];
  onTagsChange?: (tag: TagProps["data"][]) => void;
  externalErrorMessage?: string;
}
