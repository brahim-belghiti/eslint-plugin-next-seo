import { requireMetadataField } from "../utils/require-metadata-field";

export const requireMetadataDescription = requireMetadataField({
  name: "require-metadata-description",
  field: "description",
  description:
    "Require that the Next.js `metadata` export includes a `description` property",
});
