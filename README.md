# ADG Coding Challenge

Angular 21 micro-frontend demo composed at runtime through **[Angular Architects Native Federation](https://github.com/angular-architects/module-federation-plugin/blob/main/libs/native-federation/README.md)**: a `shell` host serves global layout + navigation and lazy-loads a `prescription` remote into `/prescriptions`. The remote owns one feature (a server-driven, paginated, sortable, searchable prescriptions table) and ships its own in-memory mock backend so the demo runs without infrastructure. The `sample` project under `projects/` is left untouched as a structural reference; all conventions (standalone components, `OnPush`, signals, `inject()`, feature folder layout) follow it.

## Quick start

```bash
npm install

# Two separate terminals — start the remote first so its remoteEntry.json is reachable
npm run start:prescription      # http://localhost:4201  (standalone runnable)
npm run start:shell             # http://localhost:4200  (composes /prescriptions)
```

Open `http://localhost:4200/prescriptions` to see the federated view. Open `http://localhost:4201/` to see the same view rendered standalone (useful for isolated remote development).

## Screenshots

Shell welcome page (`/home`) with navigation to the federated Prescriptions feature:

![ADG Shell home welcome page](img/Screenshot%202026-05-16%20at%2017.58.45.png)

Prescriptions view (`/prescriptions`) with search, sortable table, and paging. Chrome DevTools shows `Routes.js` served from the prescription remote (`localhost:4201`).

![ADG Shell prescriptions list](img/Screenshot%202026-05-16%20at%2017.59.54.png)

## Other commands

```bash
npm run build:shell             # production build
npm run build:prescription      # production build
npm test                        # 10 spec files / 37 specs (Vitest)
make test <path>     # focused run
```

## Architecture in one paragraph

Two independently buildable Angular applications share **no build-time imports**. Composition happens through Native Federation's runtime: the shell's `federation.manifest.json` references the remote's `remoteEntry.json`, the shell's route definition lazy-loads the remote's exposed `./Routes`, and the remote's feature route brings its own `HttpClient`, mock interceptor, and service via **route-scoped DI** so the shell stays unaware of HTTP and remote-specific types. Both apps still build through `@angular/build:application` (esbuild); Native Federation wraps that builder rather than replacing it.

## Where to read more

- **[SPEC.md](SPEC.md)** — original challenge brief.
- **[ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md)** — chosen approach, Native Federation rationale (including the ESM-vs-MF clarification informed by [Zephyr Cloud's "Module Federation vs Native ESM"](https://zephyr-cloud.io/blog/module-federation-vs-native-esm)), and the trade-offs table.
- **[PLAN.md](PLAN.md)** — the eight-step implementation plan with progress checklist; mirrors the commit history.
- **[SUMMARY.md](SUMMARY.md)** — full architectural and implementation walkthrough: boundaries between shell and remote, mock backend contract, route-scoped DI rationale, testing layering, incremental migration narrative, known limitations, and use of AI tooling.
