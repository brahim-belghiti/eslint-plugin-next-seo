import { ESLintUtils } from "@typescript-eslint/utils";

export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/brahim-belghiti/eslint-plugin-next-seo/blob/main/docs/rules/${name}.md`,
);
