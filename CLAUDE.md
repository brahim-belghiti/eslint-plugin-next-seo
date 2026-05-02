# eslint-plugin-next-seo

## Project Overview
An ESLint plugin (TypeScript) that catches SEO mistakes specific to Next.js App Router at build time. Targets the gap between `@next/eslint-plugin-next` (framework correctness) and SEO-specific static analysis for the metadata API.

## V1 Scope — Tier 1: Metadata Rules Only
All six rules analyze the exported `metadata` object or `generateMetadata` function in a single file:

1. `require-metadata-title` — metadata export must include `title`
2. `require-metadata-description` — must include `description`
3. `require-open-graph` — must include `openGraph`
4. `no-empty-metadata-fields` — no `title: ""` or `description: ""`
5. `no-template-title-on-page` — `title: { template: "..." }` is only valid in `layout.tsx`, not `page.tsx`
6. `og-image-in-metadata` — `openGraph` should include `images`

## Architecture Decisions (already agreed upon)

### Project Structure
```
eslint-plugin-next-seo/
├── src/
│   ├── rules/                          # One file per rule
│   │   ├── require-metadata-title.ts
│   │   ├── require-metadata-description.ts
│   │   ├── require-open-graph.ts
│   │   ├── no-empty-metadata-fields.ts
│   │   ├── no-template-title-on-page.ts
│   │   └── og-image-in-metadata.ts
│   ├── utils/
│   │   └── metadata.ts                 # Shared: find & extract metadata exports
│   └── index.ts                        # Plugin entry point — exports rules + configs
├── tests/
│   └── rules/                          # Mirrors src/rules/
│       ├── require-metadata-title.test.ts
│       └── ...
├── tsconfig.json
├── tsconfig.build.json                 # Excludes tests from build output
├── vitest.config.ts
├── package.json
└── README.md
```

### Tooling
- **TypeScript** — strict mode
- **tsup** — build tool, outputs ESM + CJS
- **vitest** — test runner
- **ESLint flat config only** (no legacy .eslintrc support)
- **@typescript-eslint/utils** — provides `RuleTester` and typed rule creation helpers

### Key Design Decisions
- `src/utils/metadata.ts` is a shared utility all Tier 1 rules use to find the `metadata` export and inspect its properties. Extract this early to avoid duplication.
- `index.ts` exports the plugin object in ESLint's expected shape: `{ rules, configs }`.
- Target ESLint 9+ flat config only.
- Package name `eslint-plugin-next-seo` → users reference as `next-seo` in config.

### TDD Workflow (Red/Green)
Build each rule with strict red/green TDD:
1. **Red** — Write failing test first (code snippet that should trigger the rule)
2. **Green** — Minimum implementation to pass
3. **Refactor** — Extract to utils if shared logic emerges
4. Add edge cases: valid code, `generateMetadata` function variant, different metadata shapes

### AST Context
- ESLint rules are visitor functions on AST nodes
- Metadata detection involves finding: `export const metadata = { ... }` (VariableDeclaration with ExportNamedDeclaration) and `export function generateMetadata() { ... }` or `export async function generateMetadata() { ... }`
- Use https://astexplorer.net with `@typescript-eslint/parser` to inspect node shapes

### What to Build First
1. Scaffold the project (package.json, configs, entry point)
2. Build `src/utils/metadata.ts` — the shared metadata detection utility
3. First rule: `require-metadata-title` with full TDD cycle
4. Remaining 5 rules, one at a time

### NPM Publishing Notes
- Will be published to npm
- Needs proper `package.json` fields: `name`, `main`, `exports`, `files`, `keywords`, `peerDependencies` (eslint >=9)
