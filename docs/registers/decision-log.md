# Decision Log (ADRs)

> Status: `living` · Last updated: 2026-07-02
>
> Lightweight record of **structural decisions** and their rationale, so future agents don't
> reverse a deliberate choice by accident. One entry per decision; newest at top.

---

## ADR-0004 — Keep Discovery (`HomePage`) permanently mounted; toggle visibility via CSS instead of unmount/remount navigation
- **Date:** 2026-07-02
- **Status:** accepted
- **Context:** `App.tsx` switched pages via conditional rendering (`{page === "home" && <HomePage/>}`). `HomePage` owns its generated playlist, mood, pagination cursor, and "For You" picks as local `useState`. Navigating to Favorites/History/song-detail and back destroyed and recreated `HomePage`, silently wiping the just-generated playlist — reported by the user as "the output is no longer there" when returning to Discovery.
- **Alternatives considered:** (a) **Lift state to `App`/context** — move `mood`/`songs`/`nextCursor`/`forYouSongs`/etc. up so they survive `HomePage` unmounting. Rejected: requires enumerating and threading every piece of `HomePage` state (and its loading/error companions) through props or a new context; any future state added to `HomePage` would need the same treatment or silently reintroduce the bug. (b) **Keep `HomePage` mounted permanently, hide via CSS (`display:none`) instead of removing from the tree.** Chosen: preserves *all* current and future `HomePage` state automatically with no enumeration; smaller diff (`App.tsx` only); Favorites/History/SongDetail keep unmount/remount semantics unchanged since their data doesn't need to survive navigation.
- **Decision:** Adopt (b). `App.tsx` now always renders `<HomePage>` inside a wrapper `<div>` toggled with Tailwind's `hidden` class based on `page === "home"`, rather than conditionally rendering `HomePage` in/out of the tree. A companion `useEffect` pauses all `<audio>` elements when `page !== "home"`, since unmounting no longer does that implicitly for any playing preview.
- **Consequences:** Discovery state (playlist, mood, cursor, For You picks, in-flight requests) now survives all in-app navigation, including the previously-unnoticed same bug on the Discovery → song-detail → back path. "For You" is fetched once per session instead of once per Home visit (fewer redundant OpenAI/Deezer calls). Trade-off: `HomePage`'s effects (e.g. the "For You" fetch) now run for the entire app session rather than being torn down between visits — judged safe because that effect is already guarded against redundant fetches by `lastForYouTokenRef` and has no `page` dependency. **Do not** revert `HomePage` back to conditional rendering to "match" the other pages — that would silently reintroduce this bug.
- **Task:** `2026-07-02-01-persist-discovery-state`

## ADR-0003 — Align with the Engineering Constitution via a hybrid/additive docs migration
- **Date:** 2026-06-27
- **Status:** accepted
- **Context:** A new "Engineering Constitution" prescribes a docs taxonomy (`architecture/ api/ deployment/ database/ security/ performance/ testing/ decisions/ tasks/ audits/ onboarding/ changelog/`) and engineering standards. The repo already has the mature WDD traceability system, which meets most of the Constitution's *process* intent. The Constitution says structure "*similar to*" — a guideline, not a literal mandate.
- **Alternatives considered:** (a) **Literal taxonomy** — reorganize `docs/` to match the list exactly, dissolving `reference/`/`registers/`; highest churn, risks breaking the superior process spine. (b) **Minimal gap-fill** — add only net-new docs, ignore the taxonomy; lowest compliance. (c) **Hybrid/additive** — keep the WDD spine, add the missing concern areas, crosswalk in the README.
- **Decision:** Adopt **(c) hybrid/additive**. Preserve `workflow.md`/`templates/`/`reference/`/`registers/`/`performance/`; add `api/ security/ database/ testing/ onboarding/ changelog/` and per-file `decisions/`; make `docs/README.md` a Constitution crosswalk. Audit scope = docs alignment **plus** a code-conformance assessment whose code findings become separate backlog tasks (no implementation in the migration).
- **Consequences:** Full Constitution coverage with zero deletion of existing work; some additive folders are thin index/alias stubs (drift risk mitigated by linking to a single source of truth). ADRs split into per-file form; `decision-log.md` becomes a rolling index.
- **Task:** `2026-06-27-01-constitution-alignment` · **Audit:** [`2026-06-27-constitution-conformance`](../audits/2026-06-27-constitution-conformance.md)

## ADR-0001 — Adopt a plan→report task lifecycle with a `docs/` traceability system
- **Date:** 2026-06-26
- **Status:** accepted
- **Context:** Work needs to be traceable, auditable, and regression-aware. Multiple agents/sessions operate on the repo and must inherit full context cheaply.
- **Decision:** Every task is preceded by a `plan.md` and followed by a `report.md` under `docs/tasks/<task-id>/`; audits, references, performance, and registers are version-controlled Markdown. `CLAUDE.md` makes this binding. See [`../workflow.md`](../workflow.md).
- **Consequences:** Slight up-front overhead per task; large gain in traceability and onboarding. Point-in-time docs are immutable (superseded, not edited).
- **Task:** `2026-06-26-01-docs-traceability-framework`

## ADR-0002 — `reference/architecture.md` supersedes `docs/code-architecture.md`
- **Date:** 2026-06-26
- **Status:** accepted
- **Context:** `code-architecture.md` predates the current code (described single-call, sequential, no-pagination design).
- **Decision:** Keep the old file for history but mark it `superseded`; treat `reference/architecture.md` + `CLAUDE.md` as truth.
- **Consequences:** No history lost; one clear current source.
- **Task:** `2026-06-26-01-docs-traceability-framework`

---

## Template
```
## ADR-NNNN — <title>
- Date: YYYY-MM-DD
- Status: proposed | accepted | superseded by ADR-MMMM
- Context: <forces at play>
- Decision: <what we chose>
- Consequences: <trade-offs, what becomes easier/harder>
- Task: <task-id>
```
