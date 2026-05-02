import { requireMetadataField } from "../utils/require-metadata-field";

export const requireMetadataTitle = requireMetadataField({
  name: "require-metadata-title",
  field: "title",
  description:
    "Require that the Next.js `metadata` export includes a `title` property",
});
