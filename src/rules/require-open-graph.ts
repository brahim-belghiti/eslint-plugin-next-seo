import { requireMetadataField } from "../utils/require-metadata-field";

export const requireOpenGraph = requireMetadataField({
  name: "require-open-graph",
  field: "openGraph",
  description:
    "Require that the Next.js `metadata` export includes an `openGraph` property",
});
