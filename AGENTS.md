# AGENTS.md — Marjoram

Authoritative guidance for AI coding agents (Claude Code, Copilot, Cursor, Codex, etc.) working in this repository. This file is the **single source of truth**; `CLAUDE.md` and `.github/copilot-instructions.md` are symlinks to it.

If a rule here conflicts with code you find in the repo, **the rule wins** — flag the discrepancy in your response rather than silently following the code.

---

## 1. Project Snapshot

**Marjoram** is a pure-functional, signal-based widget SDK for building embeddable interactive components. Ships as ESM/CJS/UMD, **~5KB gzipped**, **zero runtime dependencies**.

- **Public API** (do not break without a major version bump): `createWidget`, `html`, `useViewModel`, `when`, `signal`, `computed`, `effect`, `batch`, `untracked`, and the types `Signal`, `ReadonlySignal`. See [src/index.ts](src/index.ts).
- **Runtime targets**: modern browsers + Node ≥16. No build step required for consumers (UMD via `<script>`).
- **Philosophy**: no classes, no decorators, no dependencies, XSS-safe by construction, Shadow DOM for style isolation.

---

## 2. Commands You Will Need

Run these from the repo root. They are the contract the CI enforces — if any fails locally, do not open a PR.

| Goal | Command |
|---|---|
| Install | `npm install` |
| Type-check | `npm run type-check` |
| Lint | `npm run lint` (use `npm run lint:fix` to auto-fix) |
| Format | `npm run format` (check-only: `npm run format:check`) |
| Unit tests | `npm test` |
| Tests + coverage | `npm run test:coverage` |
| Single test file | `npx jest path/to/file.test.ts` |
| Build | `npm run build` |
| Dev server (rollup watch) | `npm run dev` |

**Before declaring any task done, run the trio:** `npm run type-check && npm run lint && npm test`. CI runs on Node 16/18/20 — keep code compatible with all three.

---

## 3. Repository Map

```
src/
├── index.ts             # Public exports — treat as the API surface
├── widget/              # createWidget — high-level widget factory + lifecycle
├── view/                # html tagged template, view types, internal vs external utils
├── useViewModel/        # useViewModel — standalone reactive view models
├── schema/              # Schema + reactive props (SchemaProp, useSchema, factory)
└── reactivity/          # Low-level signal/computed/effect/batch primitives

__tests__/
├── view/                # html template and rendering tests
├── viewModel/           # useViewModel tests
├── reactivity/          # signal/computed/effect tests
├── edge-cases/          # Bugs caught in the wild — read before changing core paths
└── benchmarks/          # Performance regression suite (see §8)

docs/                    # Long-form docs (TYPED_SCHEMA_PROPS, PERFORMANCE_TESTING)
demo/                    # Working examples consumers may copy
dist/                    # Build output — never edit by hand
```

When adding a new public symbol, export it from [src/index.ts](src/index.ts) **and** add a test under the matching `__tests__/` subdirectory.

---

## 4. Core API Conventions (Memorize These)

These are the conventions consumers depend on. Violating them silently breaks user code.

### 4.1 The `$` prefix rule

- **`vm.$prop`** → returns the reactive `SchemaProp`. Use **inside `html` templates** for reactive binding.
- **`vm.prop`** → returns the plain value. Use in event handlers, effects, and imperative logic.

```ts
// CORRECT — reactive binding
html`<p>${vm.$name}</p>`;

// WRONG — renders once, never updates
html`<p>${vm.name}</p>`;

// CORRECT — value access in logic
vm.name = "Updated";
```

### 4.2 `.compute()` — single-prop transforms inside templates

```ts
html`<span>${vm.$active.compute(v => (v ? "Active" : "Inactive"))}</span>`;
html`<ul>${vm.$items.compute(items => items.map(i => html`<li>${i}</li>`))}</ul>`;
```

### 4.3 `when()` — conditional rendering

```ts
import { when } from "marjoram";
html`<div>${when(vm.$isLoggedIn, () => html`<p>Welcome</p>`, () => html`<p>Log in</p>`)}</div>`;
```

### 4.4 `ref` + `collect()` — element references

```ts
const view = html`<button ref="myBtn">Click</button>`;
const { myBtn } = view.collect();
myBtn.addEventListener("click", handler);
```

### 4.5 Lifecycle — always provide cleanup

`createWidget` returns a `Widget` with `.mount()` and `.destroy()`. **Always call `.destroy()`** when removing a widget — it tears down DOM, observers, and effects. `onMount(vm, refs)` and `onDestroy(vm)` hooks are the consumer extension points.

### 4.6 Computed properties are read-only

In a `model`, functions become computed props derived from other reactive state. They cannot be assigned to — update the source.

```ts
const vm = useViewModel({
  count: 0,
  doubled: vm => vm.count * 2,
});
vm.count = 5;       // ✅
vm.doubled = 10;    // ❌ runtime/type error
```

---

## 5. Anti-Patterns — Refuse to Generate These

| ❌ Don't | ✅ Do | Why |
|---|---|---|
| `html\`${vm.name}\`` | `html\`${vm.$name}\`` | Static binding; will not update |
| `vm.doubled = 10` | Update the source signal | Computed props are read-only |
| `document.body.appendChild(view)` | `view.mount('#target')` or `createWidget` | Skips lifecycle; leaks effects |
| Skipping `widget.destroy()` | Always destroy on teardown | Memory + observer leaks |
| Adding a runtime dependency | Inline the helper | Library is zero-dep by contract |
| Introducing `class` syntax | Use functions + closures | Library is class-free by contract |
| `any` in public types | Generics or explicit unions | ESLint warns; reviewers reject |
| `innerHTML = userInput` | Use `html\`\`` — auto-escapes | XSS safety is non-negotiable |
| Absolute-timing perf assertions | Ratio vs. baseline | See [PERFORMANCE_TESTING_PHILOSOPHY.md](PERFORMANCE_TESTING_PHILOSOPHY.md) |

---

## 6. Code Style

- **TypeScript strict** — see [tsconfig.json](tsconfig.json). Prefer explicit types on public APIs; let inference handle locals.
- **Prettier** owns formatting: 2-space, semicolons, double quotes, trailing comma `es5`, 80-col, `arrowParens: "avoid"`. Don't argue with it — run `npm run format`.
- **ESLint** rules to honor: `prefer-const`, `no-var`, `eqeqeq` (always `===`), `no-console` (warn — strip before merging), `@typescript-eslint/no-explicit-any` (warn), `@typescript-eslint/no-inferrable-types` (error).
- **Naming**: `camelCase` for values, `PascalCase` for types/interfaces, `kebab-case` for files only if multi-word and not a default export. Match the existing file's convention before inventing a new one.
- **Comments**: explain *why*, not *what*. JSDoc public APIs. No commented-out code in PRs.
- **No emojis in source files** unless they already exist in the file's domain (e.g., the README).

---

## 7. Architecture Principles

These are load-bearing — changes that violate them require a design discussion in an issue first.

1. **Zero runtime dependencies.** `devDependencies` are fine; `dependencies` must stay empty. Inline what you need.
2. **Pure-functional surface.** No classes in the public API or internals. Closures, factories, and modules only.
3. **Signal-based reactivity.** Fine-grained updates via the [`reactivity/`](src/reactivity/) primitives. No virtual DOM, no diffing, no proxies leaking out.
4. **XSS-safe templating.** The `html` tagged template auto-escapes interpolations. Never bypass it. Never expose a "raw HTML" escape hatch without a security review.
5. **Style isolation via Shadow DOM** (`shadow: 'open' | 'closed'`). `styles` are scoped to the shadow root.
6. **Bundle-size budget: ~5KB gzipped.** Check `dist/` size after non-trivial changes; flag growth >5% in the PR description.
7. **Side-effect-free package.** `"sideEffects": false` in [package.json](package.json) enables aggressive tree-shaking — don't add top-level side effects.

---

## 8. Testing

- **Framework**: Jest + jsdom + `@testing-library/dom`. Setup in [setupTests.js](setupTests.js).
- **Test location**: mirror `src/` under `__tests__/`. A change in `src/view/view.ts` adds/updates tests in `__tests__/view/`.
- **What to test**:
  - Public-API behavior (every exported symbol has a test).
  - Lifecycle (`mount` → DOM present, `destroy` → DOM cleared + no dangling effects).
  - Reactivity (state change ⇒ DOM update).
  - Edge cases that have bitten us — see [`__tests__/edge-cases/`](__tests__/edge-cases/).
- **Performance tests** (see [PERFORMANCE_TESTING_PHILOSOPHY.md](PERFORMANCE_TESTING_PHILOSOPHY.md)): **never `test.skip` based on environment.** Use ratio-vs-baseline assertions with adaptive thresholds (lenient in CI, strict locally). Always include a warmup iteration and use median, not mean.
- **Coverage**: aim for ≥90% on changed files. `npm run test:coverage` and inspect `coverage/lcov-report/index.html`.

---

## 9. Commits & Pull Requests

- **Conventional Commits** required: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`, `perf:`. Breaking changes get a `!` (e.g. `feat!: rename X`) **and** a `BREAKING CHANGE:` footer.
- **One logical change per PR.** Split refactors from features.
- **PR description must include**:
  - What changed and why (1–3 bullets).
  - Bundle-size impact if any (`dist/` byte diff).
  - Public-API impact (none / additive / breaking).
  - Test plan checklist.
- **Do not commit**: `dist/` (CI builds it), `.env`, `coverage/`, IDE files. `.gitignore` should already cover these — if not, fix it in a separate `chore:` PR.
- **Never** use `--no-verify` to bypass hooks. Fix the failing check.

---

## 10. Security Checklist (before any merge touching `view/` or `widget/`)

- [ ] All user-derived strings flow through `html\`\`` (no `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, `new Function`, `document.write`).
- [ ] No new attribute injection paths (e.g. `onclick=${userInput}` where `userInput` is a string).
- [ ] Shadow DOM boundary still holds — no `document`-wide selectors from inside a widget.
- [ ] No `Function`/`eval` reintroduced.
- [ ] If adding a "raw HTML" path: stop, file an issue, get a second reviewer.

---

## 11. When Working Autonomously

When an AI agent is driving a change end-to-end:

1. **Read before writing.** Check [src/index.ts](src/index.ts) for the public surface, then the relevant submodule's existing tests to learn the conventions.
2. **State assumptions explicitly** when the task is ambiguous — e.g. "I'm treating X as additive and not bumping the major version. Confirm?"
3. **Prefer the smallest diff** that fixes the problem. Don't refactor adjacent code "while you're here."
4. **Run `type-check`, `lint`, and `test` before reporting done.** "I think it works" is not done.
5. **If you change a public symbol's signature**, grep the repo for every usage (including `__tests__/`, `demo/`, `example-usage.ts`, `README.md`) and update them in the same PR.
6. **Flag, don't hide, uncertainty.** If you're guessing about user intent or runtime behavior, say so in the PR description.

---

## 12. References

- [README.md](README.md) — user-facing API docs and examples
- [CONTRIBUTING.md](CONTRIBUTING.md) — human-contributor workflow
- [PERFORMANCE_TESTING_PHILOSOPHY.md](PERFORMANCE_TESTING_PHILOSOPHY.md) — why perf tests never skip
- [docs/TYPED_SCHEMA_PROPS.md](docs/TYPED_SCHEMA_PROPS.md) — schema typing internals
- [docs/PERFORMANCE_TESTING.md](docs/PERFORMANCE_TESTING.md) — perf test implementation details
