# Plan — 2026-07-02-01-persist-discovery-state · Preserve Discovery playlist across page navigation

| Field | Value |
| :--- | :--- |
| Task ID | `2026-07-02-01-persist-discovery-state` |
| Status | `done` — see [report.md](report.md) |
| Opened | `2026-07-02T00:30+02:00` |
| Author | agent (Claude Code) |
| Requested by | user |

---

## Goal
Navigating from Discovery ("home") to Favorites, History, or a song's detail page, then back to Discovery, must show the same generated playlist / mood / "For You" picks that were on screen before navigating away, instead of a blank state.

## Non-goals
- No persistence across a full browser reload (that would need `localStorage`/`sessionStorage` and is a separate concern).
- No router library adoption; `page` state switching in `App.tsx` stays as-is.
- No change to how Favorites/History fetch their own data (they already own their state independently — `useFavorites` lives in `App.tsx`; `HistoryPage` refetches fresh each visit, which is desired for freshness).
- No lifting of `HomePage`'s internal state (`mood`, `songs`, `nextCursor`, `forYouSongs`, …) up into `App`/context. Rejected in favor of the approach below — see Context.

## Context
- Diagnosed root cause (this session, no code changed yet): `App.tsx:82` conditionally renders `{page === "home" && <HomePage .../>}`. Switching `page` away from `"home"` unmounts `HomePage`, destroying its local `useState` (`HomePage.tsx:42-52`: `mood`, `songs`, `nextCursor`, `forYouSongs`, etc.). Returning to `"home"` mounts a fresh instance seeded from `initialMood`/`initialSongs` props, which are `undefined` on a plain sidebar nav click (they're only populated by the History "reopen" flow, `App.tsx:38-42`). Same unmount also happens today on Discovery → song-detail → back.
- Two fix shapes were considered:
  - (A) Lift `HomePage`'s state up to `App`/a context.
  - (B) Keep `HomePage` permanently mounted and toggle visibility with CSS instead of conditional rendering; leave Favorites/History/SongDetail mounting behavior unchanged.
  - Chose **(B)**: it preserves every piece of `HomePage` state automatically with no risk of missing one, and is a much smaller diff. Confirmed via `advisor` review of the diagnosis before starting.
- Side-effect requiring a small companion fix: unmounting `HomePage` today implicitly stops any playing 30s preview `<audio>` (`SongCard.tsx:33,226,239`) because the DOM node is removed. With persistent mount, that no longer happens automatically, so playback would silently continue after navigating away. Fix: pause all `<audio>` elements when `page` changes away from `"home"`.
- Verified interaction to protect: `HomePage.tsx:55-65` — `initialMood`/`initialSongs` effects still restore a *different* history entry correctly even with persistent mount, because `HistoryPage` remounts and refetches on every visit, producing a fresh prop reference each time.
- Affected code paths: `frontend/src/App.tsx`.
- Reference: [architecture](../../reference/architecture.md) (frontend structure section — prop-drilled state, no router).

## Plan (checklist)
- [ ] In `App.tsx`, change `HomePage` from conditionally-rendered (`page === "home" && <HomePage/>`) to always-mounted, wrapped in a container toggled via Tailwind `hidden` class based on `page === "home"`.
- [ ] Leave `FavoritesPage`, `HistoryPage`, `SongDetailPage` conditionally mounted/unmounted exactly as today.
- [ ] Add a `useEffect` in `App.tsx` keyed on `page` that pauses all `<audio>` elements when `page !== "home"`, to prevent background playback introduced by no-longer-unmounting `HomePage`.
- [ ] Manually verify in a running dev server (see Test intent below).
- [ ] Run `bun run build` and `bun run lint` in `frontend/` to confirm no type/lint regressions.
- [ ] Write `report.md` and register the task.

## Risks & rollback
| Risk | Likelihood | Mitigation / how to roll back |
| :--- | :--- | :--- |
| `HomePage`'s "For You" fetch effect or other mount-time effects behave unexpectedly when kept alive for the whole app session instead of per-visit | low | Effect is already guarded by `lastForYouTokenRef` against re-fetching for the same token; no dependency on `page`. Verified by reading `HomePage.tsx:67-98`. |
| Hidden (but mounted) Home page keeps interactive/focusable elements reachable via keyboard when on another page | low | Tailwind `hidden` sets `display:none`, which removes the subtree from the accessibility tree and tab order in all major browsers — no extra `aria-hidden`/`inert` needed. |
| Reopening a *different* history entry while a generated playlist is showing doesn't overwrite it, since remount-driven `useState(initialSongs)` no longer runs | low | `HomePage.tsx:61-65` effect already reacts to `initialSongs` prop changes independent of mount; explicitly covered in test plan below. |
| Rollback | — | Single-file change in `App.tsx`; revert the diff if any issue surfaces. |

## Test & performance intent
No frontend test runner is configured (per `CLAUDE.md`); verification is manual in a running dev server plus static build/lint checks.
- Verification:
  1. `bun run dev`, generate a Discovery playlist for a mood, navigate to Favorites, navigate back to Discovery → playlist and mood still shown.
  2. Same, but navigate via a song's detail page and back → playlist still shown (covers the same bug on the song-detail path).
  3. Play a 30s preview on Discovery, navigate to Favorites → audio stops (no background playback).
  4. Generate playlist Z, go to History, reopen a *different* entry Y → Discovery shows Y, not Z (discriminating check for the reopen-from-history interaction).
  5. `bun run build` and `bun run lint` — must pass with no new errors/warnings.
- Metric(s): none of the M1–M7 baselines apply (frontend behavior change, not measured perf path); `bun run build` output checked only for pass/fail, not timed against M6 (no baseline captured yet).
