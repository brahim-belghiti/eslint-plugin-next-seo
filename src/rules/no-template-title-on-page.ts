import path from "node:path";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";
import { findMetadataExport, findProperty } from "../utils/metadata";

const PAGE_FILE_RE = /^page\.(tsx|ts|jsx|js)$/;

export const noTemplateTitleOnPage = createRule({
  name: "no-template-title-on-page",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow `title.template` in page files; templates only belong in layout files",
    },
    messages: {
      templateOnPage:
        "`title.template` belongs in `layout.tsx`, not page files. Use a plain string instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const basename = path.basename(context.filename);
    if (!PAGE_FILE_RE.test(basename)) return {};

    return {
      Program(program) {
        const result = findMetadataExport(program);
        if (!result || !result.object) return;

        const titleProp = findProperty(result.object, "title");
        if (!titleProp) return;
        if (titleProp.value.type !== AST_NODE_TYPES.ObjectExpression) return;

        const templateProp = findProperty(titleProp.value, "template");
        if (!templateProp) return;

        context.report({
          node: templateProp,
          messageId: "templateOnPage",
        });
      },
    };
  },
});
