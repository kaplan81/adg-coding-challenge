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

Webpack Module Federation, Rspack MF, Vite federation, single-spa, or other orchestrators may be cited in **architecture notes** as **explicitly out of scope for the delivered demo** unless intentionally proposed as a phased migration.

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

| Topic                               | Brief note                                                                                                                                                                                                                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Native Federation vs classic MF** | Native Federation favors **browser ESM/import-map style** composition; classic Webpack MF uses bundler-centric runtime semantics. Bridging approaches exist ([combining NF and MF](https://www.angulararchitects.io/en/blog/combining-native-federation-and-module-federation/)). |
| **Interop**                         | Libraries that ship only as non-ESM may need wrappers or exclusions in shared boundaries; worthwhile to mention when listing assumptions.                                                                                                                                         |
| **Dynamic loading / diagnostics**   | ESM loads differ from richer bundler runtimes regarding where failures surface—acceptable to document mitigation (retries, user messaging, observability assumptions).                                                                                                            |
| **Scale edge cases**                | Very high churn of dynamically loaded modules can stress browsers in ways orthogonal to federation choice document if relevant to your storyline.                                                                                                                                 |

For productized delivery and rollout, **[Module Federation docs](https://module-federation.io/)** and **Zephyr-style** deployment patterns remain relevant comparison points rather than substitutes for SPEC’s Angular-centric demo scope.
