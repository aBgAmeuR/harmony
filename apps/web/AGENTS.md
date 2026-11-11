# Web code style

- KISS: write the minimum. No speculative code, no single-use helper or type.
- `type`, never `interface`. `const x = () =>`, never `function`. Named exports only.
- Let TypeScript infer. No return types, no callback parameter types, no type that only exists to annotate.
- Lookup tables use `as const`, not a `Record<…>` annotation.
- Never cast or narrow by annotation. Validate unknown values.
- No nested ternaries. Use a lookup table.
- Tailwind classes go inline on the element, never in a constant. A reused style is a variant in `@harmony/ui`.
- No arbitrary values, no `!`, no selectors into another component's internals.
- No comment that restates the code. Comment only a non-obvious why.
- No `aria-label` when the element has visible text.
- No special-case fallback. Read the value from its source.
- Business logic lives in `data/`. Components render and forward events.
- URL and storage serialization belongs to the state layer, not to components.
- One name per concept across types, props and labels.
- Sibling components share the same props shape and callback names.
- Import widgets by file path, never through an `index.ts` barrel.
- Only `data/` imports `@harmony/duckdb`. Its query functions end with `Fn`.
