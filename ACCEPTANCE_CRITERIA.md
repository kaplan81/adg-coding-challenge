# Acceptance criteria

This document defines acceptance criteria for the task in [`SPEC.md`](SPEC.md) and records the chosen micro-frontend approach for implementation.

---

## Builder and toolchain risk

**Question:** Is it “too risky” for this challenge to use Vite or Rspack paths instead of the default Angular CLI application build?

**Short answer:** It is reasonable to prefer **Angular CLI’s default application builder** (esbuild-based) plus a thin integration layer **over swapping the core Angular build runtime** for Vite/Rspack—especially for a time-boxed interview task—because upgrade paths, Angular release notes, and first-party tooling assume the `@angular/build:application`-style pipeline.

**Native Federation (@angular-architects/native-federation)** is deliberately described by its authors as wrapping the **Angular CLI Application Builder and dev server**, so federated shells/remotes tend to stay on the **same builder Angular ships for greenfield apps** ([announcement](https://www.angulararchitects.io/en/blog/announcing-native-federation-for-angular-17-1/)). That does **not** mean Vite/Rspack are inherently wrong for production teams with strong platform ownership; it means **non-default builders shift maintenance and breakage risk onto your integration stack** (plugins, Nx executors, framework-specific presets), which is a real constraint for a **2–4 hour** exercise.

**Zephyr Cloud** and **[Module Federation](https://module-federation.io/)** tooling focus more on **deployment and runtime composition** aligned with federation standards; choosing Native Federation **today** does not block a later move toward **Webpack/Rspack-style Module Federation** or **mixed runtimes** if product needs dictate it ([Angular Architects: combining Native and Module Federation](https://www.angulararchitects.io/en/blog/combining-native-federation-and-module-federation/), [Zephyr Cloud](https://zephyr-cloud.io/)).

---

## Chosen approach for this repository

For this coding challenge implementation, acceptance includes using **Angular Architects Native Federation** as the federation mechanism so that:

- Shell and remote(s) remain **buildable and runnable with the standard Angular CLI workflow** advocated in current Native Federation docs.
- References for implementation and interview discussion align with:
  - [`native-federation` README](https://github.com/angular-architects/module-federation-plugin/blob/main/libs/native-federation/README.md)
  - [Native Federation for Angular 17.1+ (Application Builder)](https://www.angulararchitects.io/en/blog/announcing-native-federation-for-angular-17-1/)
  - [Combining Native Federation and Module Federation](https://www.angulararchitects.io/en/blog/combining-native-federation-and-module-federation/)
  - [Native Federation improvements (performance, DX, sharing)](https://www.angulararchitects.io/en/blog/native-federation-just-got-better-performance-dx-and-simplicity/)
  - [Module Federation vs Native ESM (Zephyr Cloud, Néstor López, Oct 2025)](https://zephyr-cloud.io/blog/module-federation-vs-native-esm) — production framing of why a federation **runtime** layer is needed even when the **transport** is plain ESM.

Webpack Module Federation, Rspack MF, Vite federation, single-spa, or other orchestrators may be cited in **architecture notes** as **explicitly out of scope for the delivered demo** unless intentionally proposed as a phased migration.

---

## Why Native Federation is the right choice for this stack

**Native Federation by Angular Architects is the deliberate, primary federation mechanism for this repository.** It is not a lightweight alternative to classic Webpack/Rspack Module Federation, and not an attempt to replicate raw ESM + import maps by hand. It is the federation **runtime** that fits cleanly inside the Angular CLI's `@angular/build:application` (esbuild) pipeline this monorepo already runs on, and it implements the same federation **contract** classic Module Federation popularized: singleton-aware shared dependencies, semver-based version negotiation, runtime composition, and a manifest-driven preload graph.

Two related questions surface when this choice is reviewed; both are answered head-on below.

### Question 1 — Why a federation runtime at all, when browsers already ship ESM and import maps?

Pure ESM + import maps solve the **loading** problem; they do not solve the **management** problem. The framing in [Module Federation vs Native ESM](https://zephyr-cloud.io/blog/module-federation-vs-native-esm) (Zephyr Cloud, Oct 2025) catalogues the gap in production terms — singleton enforcement, semver negotiation, dynamic registration, error recovery, performance-aware chunking. Native Federation keeps those management primitives on top of a browser-native ESM/import-map transport, so the artefacts shipped to users are standards-aligned **and** the runtime behaves like federation rather than like a static script-tag composition.

Capabilities **gained** in this implementation by choosing Native Federation over a DIY native-ESM approach:

- **Singleton enforcement and semver negotiation.** `shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })` in each `federation.config.js` prevents two `@angular/core` instances on the page when shell and remote pin different patch versions — which would silently break `EnvironmentInjector` propagation, RxJS `Subject` identity across the boundary, and any singleton service relying on root-level instance equality.
- **Manifest-driven preload graph.** The `remoteEntry.json` and `importmap.json` emitted by the Native Federation builder give the host a typed dependency map up front, so shared chunks can be requested in parallel rather than discovered hop-by-hop through static import waterfalls.
- **First-class runtime composition.** `loadRemoteModule({ remoteName, exposedModule })` is one async API that hosts wrap with retries, fallbacks, telemetry, and feature flags. Building the equivalent on top of `<script type="importmap">` requires a custom dynamic loader and lifecycle code per host.

### Question 2 — Why Native Federation rather than classic Webpack/Rspack Module Federation?

For an Angular monorepo on the standard CLI builder, Native Federation is the more conservative and lower-risk option, not the lighter one:

- It **rides on the same `@angular/build:application` (esbuild) pipeline** the rest of an Angular workspace already uses (the `sample` project in this repo included). No alternate bundler to maintain, no Nx/CLI executors to swap, no parallel upgrade path against Angular release notes.
- It implements the **same federation contract** (shared singletons + semver, manifest, dynamic loading) as classic MF — they are different transports of the same idea, not different tiers of capability.
- The Angular Architects team explicitly designed Native Federation as the federation entry point for Angular 17.1+ greenfield apps ([announcement](https://www.angulararchitects.io/en/blog/announcing-native-federation-for-angular-17-1/)) and ships a documented [combining-Native-and-Module-Federation pattern](https://www.angulararchitects.io/en/blog/combining-native-federation-and-module-federation/) for the cases where additional Webpack/Rspack-specific runtime surface is genuinely needed later.

Classic Module Federation is the right call when a team **needs bundler-runtime capabilities not yet exposed by Native Federation** (force-replace remotes for memory recovery, layered singletons across major-version migrations, the broader loader-hook ecosystem) **and** is prepared to take ownership of a non-default bundler stack. None of those constraints apply to this challenge: a single Angular 21 monorepo, single Angular major version, a single remote in the manifest, no long-lived multi-tab admin shell. **Native Federation is the natural fit; reaching for classic MF here would import operational risk for capabilities the demo would not exercise.**

### Capabilities deliberately out of scope (and the documented escape hatch)

Three federation capabilities are out of scope for this demo. The documented [combining-Native-and-Module-Federation pattern](https://www.angulararchitects.io/en/blog/combining-native-federation-and-module-federation/) keeps every one of them reachable without rearchitecture if a future product need ever requires them:

- **Programmatic remote unload for long-lived shells.** ESM lacks unload semantics, so memory recovery in multi-remote, multi-tab admin shells uses the broader Module Federation runtime APIs (`registerRemotes(..., { force: true })`, `removeRemote()`). Not relevant for a single-remote demo.
- **Layered singletons across breaking major versions.** Sharing the same specifier as **different** singletons per layer (for example two Angular major versions side-by-side during a brownfield consolidation) is currently a classic-MF capability. Not relevant for a single-major-version monorepo.
- **The wider loader-hook ecosystem** (`beforeLoadRemote`, `errorLoadRemote`, `afterResolve`, `beforeInit`). Native Federation exposes the hooks needed for retries, fallbacks, and telemetry; the broader MF hook surface is reachable through the combination pattern when richer orchestration is justified.

### Constraints that apply equally to any federation choice

Inherent to federated micro-frontends regardless of which runtime is used; flagged here so readers do not infer they are Native-Federation-specific:

- **Bundlers are still required in production.** Tree-shaking, code splitting, CSS extraction, TypeScript compilation, source maps, and budget enforcement all live in the bundler. Both shell and remote in this repo build through `@angular/build:application` (esbuild). Switching transports does not remove the bundler.
- **Cross-origin posture.** Federated chunks are fetched cross-origin (`:4201` → `:4200`). Angular's dev server permits it locally; non-dev environments need explicit CORS headers, caching rules, and SBOM/audit coverage of every origin. Documented in [SUMMARY.md](SUMMARY.md).
- **Cross-origin DX cost.** When shell and remote ship from different domains, source maps live on different origins, DevTools shows files from multiple origins, and stack traces straddle them. A unified delivery layer (per-team prefixes on a single CDN, or platforms like Zephyr Cloud) materially reduces this debugging tax in many-team production deployments.

---

## Functional acceptance (from SPEC)

These items **must** be satisfied for the task outcome described in SPEC:

### Shell application

- [ ] Acts as the **host** application with **global layout and navigation**.
- [ ] **Integrates** the remote Prescription frontend (not only linking out to a separate URL without composition).
- [ ] Runs as a **separate, independently buildable** Angular project (own `ng build` target / workspace project).
- [ ] Routing delivers the remote experience **inside host navigation** per SPEC (route-level composition).

### Remote: “Prescription”

- [ ] Runs as **one** runnable **remote** application, **independently buildable** from the shell.
- [ ] Presents **a single view** with a **table** showing at least:

  Medication name | Insurant name | Insurant birth date | Insurant id | Prescription date

- [ ] Implements **backend-style** search, filter, and paging **against HTTP**; the SPEC allows a **mock** REST backend (stub service, interceptor, JSON server, etc.) as long as the contract is plausible and documented.

### Repo and UX expectations

- [ ] Repository **structure is clear**: host vs remote boundaries, shared types or contracts if any, and where federation config lives.
- [ ] **README** states key **architectural decisions**, how to run host and remote locally, assumptions, and (per SPEC) how **AI tooling** was used if applicable.
- [ ] UI may be minimal; emphasis is **clean structure** and **justified trade-offs**.

### Interview-facing material (coverage, not necessarily all automated)

Aligned with SPEC presentation bullets, the README or brief notes should make it possible to discuss:

- [ ] Responsibilities and **boundaries** between shell and remote.
- [ ] **Testing strategy**: unit vs integration vs e2e; isolating remote tests; validating shell ↔ remote wiring.
- [ ] **Incremental migration**: what to carve out first from a monolith, how to reduce disruption—coherent narrative even if depth is reduced for time.

---

## Technical acceptance for Native Federation alignment

Implementation is **accepted** relative to SPEC when federation-specific behavior meets these bars:

- [ ] Manifest / federation config distinguishes **shell** vs **remote** roles (expose vs consume) per Native Federation conventions.
- [ ] Remote is **lazy-loaded by the shell** via routing (or equivalent documented pattern).
- [ ] Sharing policy for Angular core and shared libs is **intentional** (not accidental duplicate bundles where avoidable)—document shortcuts taken for time.
- [ ] **`ng serve` / `ng build`** workflows work for host and remote with **documented ports** or environment notes.

---

## Explicit non-requirements (from SPEC)

- No authentication or authorization.
- Polish on error UX, styling, accessibility, and documentation may stay **thin** but **assumptions must be stated**.

---

## Trade-offs worth documenting (interview hooks)

Summarized from practitioner discussion—not hard acceptance gates, but good **risk transparency** alongside Native Federation choice:

| Topic                                   | Brief note                                                                                                                                                                                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Native Federation as chosen runtime** | Same federation contract (singleton + semver-aware sharing, manifest, dynamic remote loading) as classic Webpack/Rspack Module Federation, on top of standards-aligned ESM/import-map artefacts and the standard Angular `@angular/build:application` pipeline. Lowest-risk fit for an Angular CLI monorepo. |
| **Native Federation vs raw ESM**        | NF keeps the management layer (singleton, semver, manifest, hooks) on top of ESM transport — directly addressing the gaps Zephyr articulates between "loading" and "managing" federated code at scale.                                                                                                       |
| **Singleton & version negotiation**     | `shareAll({ singleton: true, strictVersion: true })` prevents duplicate Angular instances. Required for `EnvironmentInjector`, NG Zone, and RxJS subjects to behave correctly across the host/remote boundary.                                                                                               |
| **Memory & lifecycle**                  | ESM lacks unload semantics. Long-lived multi-remote shells that need programmatic memory recovery can reach those APIs via the [combining-NF-and-MF pattern](https://www.angulararchitects.io/en/blog/combining-native-federation-and-module-federation/); out of scope for this single-remote demo.         |
| **CORS / origin posture**               | Remote `remoteEntry.json` and shared chunks are fetched cross-origin from the shell. Dev server allows it; production needs explicit CORS headers, caching rules, and SBOM/audit coverage of every origin. Inherent to any federated runtime, not NF-specific.                                               |
| **DX cost across origins**              | Source maps and DevTools see two domains when shell and remote ship from different origins. Acceptable for a small demo; in many-team setups a unified delivery layer materially reduces debugging time. Inherent to any federated runtime, not NF-specific.                                                 |
| **Build still required**                | The "no-bundler" pitch of pure ESM does not apply to any federation choice. Both apps still build through `@angular/build:application` (esbuild). Tree-shaking, CSS pipelines, TS, code splitting, source maps, and budgets all live in the bundler.                                                         |
| **Interop**                             | Libraries that ship only as non-ESM may need wrappers or exclusions in shared boundaries; worthwhile to mention when listing assumptions.                                                                                                                                                                    |
| **Dynamic loading / diagnostics**       | Where remote-load failures surface differs slightly across federation runtimes; document mitigation (retries, user messaging, observability assumptions) regardless of choice.                                                                                                                               |
| **Scale edge cases**                    | Very high churn of dynamically loaded modules can stress browsers in ways orthogonal to federation choice; document if relevant to your storyline.                                                                                                                                                           |

For productized delivery and rollout, **[Module Federation docs](https://module-federation.io/)** and **Zephyr-style** deployment patterns are relevant **complementary** references — additional reading and migration paths from the Native Federation foundation chosen here, not substitutes for it within SPEC's Angular-centric demo scope.
