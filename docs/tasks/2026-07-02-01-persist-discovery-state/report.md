# Report — 2026-07-02-01-persist-discovery-state · Preserve Discovery playlist across page navigation

| Field | Value |
| :--- | :--- |
| Task ID | `2026-07-02-01-persist-discovery-state` |
| Status | `done` |
| Plan | [`plan.md`](plan.md) |
| Started | `2026-07-02T00:30+02:00` |
| Completed | `2026-07-02T01:35+02:00` |
| Author | agent (Claude Code) |

---

## Checklist results
- [x] `HomePage` in `App.tsx` changed from conditionally-rendered to always-mounted, visibility toggled via Tailwind `hidden` class on `page === "home"`.
- [x] `FavoritesPage`, `HistoryPage`, `SongDetailPage` left conditionally mounted/unmounted, unchanged.
- [x] Added `useEffect` in `App.tsx` pausing all `<audio>` elements when `page !== "home"`.
- [x] Manual verification in a running dev server — dev server started by the agent and confirmed reachable; static code tracing done first (see "Tests & verification"); live click-through was then performed **by the user** at `http://localhost:5173` (the agent's environment has no browser-automation tool), who confirmed at `2026-07-02T01:35+02:00`: "done and it worked."
- [x] `bun run build` and `bun run lint` run in `frontend/`.
- [x] Report written and task registered.

## What was done
- `frontend/src/App.tsx:87-104` — the block that rendered `HomePage` was `{page === "home" && <HomePage ... />}`. Replaced with a permanently-rendered `<HomePage>` wrapped in `<div className={page === "home" ? undefined : "hidden"}>`. `HomePage` (and therefore its local `mood`/`songs`/`nextCursor`/`forYouSongs` state, `HomePage.tsx:42-52`) is now mounted once for the app's lifetime instead of being destroyed and recreated on every navigation away from and back to Discovery. `FavoritesPage`/`HistoryPage`/`SongDetailPage` still use `{page === "x" && ...}` and mount/unmount as before — they don't need to survive navigation (their data lives in `App`-level `useFavorites`, or is intentionally refetched fresh each visit).
- `frontend/src/App.tsx:49-53` — added `useEffect(() => { if (page !== "home") document.querySelectorAll("audio").forEach(a => a.pause()); }, [page])`. Before this change, navigating away from Discovery unmounted `HomePage`, which implicitly stopped any playing 30s preview by removing the `<audio>` DOM node (`SongCard.tsx:226,239`). Since `HomePage` no longer unmounts, that free side-effect is gone, so it's now done explicitly.

## Deviations from plan
- The "Manual verification in a running dev server" step could not be executed as originally planned — no browser-automation tool is available in this environment. Flagged explicitly rather than silently skipped; see Follow-ups.
- Added a step not in the original plan: recorded the persistent-mount-over-lift-state choice as [`ADR-0004`](../../registers/decision-log.md#adr-0004--keep-discovery-homepage-permanently-mounted-toggle-visibility-via-css-instead-of-unmountremount-navigation) in the decision log. `CLAUDE.md` requires structural decisions to be logged there; the plan only captured the rationale in `plan.md`'s Context section, which isn't the durable location for it.

## Tests & verification

| What | Command | Result | Test-log |
| :--- | :--- | :--- | :--- |
| Type-check + production build | `bun run build` (in `frontend/`) | pass — `tsc -b && vite build` succeeded, `dist/` emitted, only a pre-existing "chunk >500kB" advisory warning (unrelated to this change) | [row](../../registers/test-log.md) |
| Lint parity check | `bun run lint` before vs. after the change (`git stash` / `git stash pop`) | identical: 17 problems (14 errors, 3 warnings) both before and after — all pre-existing (`FavoritesPage.tsx:11` `no-explicit-any`; `HomePage.tsx:57,63,72` `react-hooks/set-state-in-effect`; none in `App.tsx`) | [row](../../registers/test-log.md) |
| Dev server boot | `bun run dev` | pass — Vite ready on `http://localhost:5173/`, no console errors in the startup log | [row](../../registers/test-log.md) |
| Static trace: reopen-different-history-entry interaction | read `HomePage.tsx:55-65`, `HistoryPage` remount behavior | pass (reasoned, not executed) — `initialMood`/`initialSongs` effects fire on prop-reference change independent of mount, and `HistoryPage` remounts + refetches on every visit, so reopening entry Y after generating Z still produces a fresh `initialSongs` reference and overwrites `songs` | [row](../../registers/test-log.md) |
| Live click-through (generate → navigate away → back) | manual, by user, at `http://localhost:5173` | pass — user confirmed "done and it worked" | [row](../../registers/test-log.md) |

**Honesty note (per project convention on UI changes):** the code change is small and uses a well-understood React/CSS pattern (persistent mount + `display:none`); it was reviewed by the agent via static tracing (build/lint parity, reopen-different-entry interaction) but the live browser click-through was performed by the **user**, not the agent — this session had no browser-automation tool. The user's confirmation was a general "it worked," not an itemized pass of every scenario listed in `plan.md` (e.g. the reopen-a-different-history-entry edge case and the audio-pause behavior weren't separately called out) — recorded as such rather than overclaiming full coverage.

## Performance
Not applicable — this is a frontend state-lifecycle fix with no measured perf path in `docs/performance/baselines.md` (M1–M5 are backend; M6/M7 have no captured baseline yet, per that file's own "not yet measured" status). `bun run build` completed in 2.44s with no new bundle-size concern beyond the pre-existing >500kB chunk warning.

| Metric | Baseline | This run | Δ | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| M6 — frontend build | not yet measured | 2.44s (`vite build` only) | n/a | no regression (no baseline to compare) |

Baseline updated? No.

## Follow-ups
- **Gap (still open):** this session has no browser-automation/screenshot tool, so the agent cannot self-verify UI changes end-to-end and depends on the user for live confirmation. File a backlog task to wire one (or reuse `2026-06-26-06-test-harness`, which already covers adding Vitest — could extend to Playwright/RTL for exactly this kind of navigation-state regression).
- Not separately confirmed by the user: the reopen-a-different-history-entry edge case, and the audio-pause-on-navigate behavior. Both are covered by static trace / code reading only. Low risk, but worth a look if either area is touched again.

## Artifact SHA (optional)
Not captured — single small source-file diff, reviewable directly via `git diff frontend/src/App.tsx`.
