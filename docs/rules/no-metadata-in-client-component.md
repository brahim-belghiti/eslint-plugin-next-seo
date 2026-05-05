# no-metadata-in-client-component

Disallow `metadata` exports in client components.

## Why

Next.js App Router silently ignores `metadata` and `generateMetadata` exports in files marked `"use client"`. The component renders, the metadata is not applied, and there's no warning at build time or in the browser. This is one of the most common metadata mistakes in App Router codebases.

If you need metadata on a route that uses client-side features, split the file: keep the metadata in a server component (or the parent `layout.tsx`) and extract the interactive part into a separate client component.

## Examples

### ❌ Incorrect

```ts
"use client";

export const metadata = {
  title: "Dashboard",
  description: "User dashboard",
};

export default function DashboardPage() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

```ts
"use client";

export async function generateMetadata() {
  return { title: "Dashboard" };
}
```

### ✅ Correct

```ts
// page.tsx — server component, owns the metadata
export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <DashboardClient />;
}
```

```ts
// dashboard-client.tsx — client component, no metadata
"use client";

export default function DashboardClient() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## When the rule stays silent

- No `"use client"` directive at the top of the file.
- `"use client"` appears mid-file (not in the directive prologue) — not a valid directive placement.

## Options

None.
