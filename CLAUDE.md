@AGENTS.md

# Fahrklar — working agreement

> **The site is called Stromstrecke.** Renamed 13.09.2026 because "Fahrklar"
> was already taken; it is to be hosted at stromstrecke.de. Only the visible
> name changed. The repository, the npm package and the localStorage key
> `fahrklar-draft-v1` still say fahrklar on purpose: renaming the storage key
> would throw away every saved draft, and the other two are invisible to
> readers. Do not "tidy" that up without a reason.

Orientation for buying a **new electric car** in Germany. Honest Autobahn range
as a span — month, speed, temperature — against WLTP's laboratory number.
No selling, no leasing comparison, no certified advice.

The whole product is one claim: **we tell you what we do not know.** Every
number is a range, every assumed value is marked as assumed. A screen that
prints a confident single figure has broken the product, not just the design.

## Who this is for

Someone who has **never owned an electric car** and does not know what to
expect. They are not comparing trim levels; they are trying to find out whether
this works for their life at all, and which handful of models are worth a closer
look. **Long distance is the thing they are anxious about** — that is where the
fear lives and where the laboratory figure misleads most.

Two consequences that outrank any design preference:

- **Explain, do not just display.** A figure the reader cannot interpret is
  worse than no figure: it looks like information and carries none. "77 kWh"
  means nothing to a beginner; "reicht im Winter für rund 300 km Autobahn"
  does. Where a technical term is unavoidable, the sentence that explains it
  travels with it.
- **The answer to "what should I expect?" comes before the answer to "which
  car?"** Someone who leaves knowing what a winter Autobahn trip actually looks
  like has been served, even if they pick no car at all.

---

## Layout

```
app/                 routes: / (landing), /berater, /datenschutz, /impressum
components/advisor/  the journey: questions, control bar, result
components/showroom/ the route map, the landing illustration, body icons
components/ui/       shared primitives — chips, fields, range bars
lib/engine/          the calculation. Pure. No I/O, no LLM, no Date.now()
lib/copy.ts          German product language, locked
data/                seed JSON: cars, climate, routes. Every file carries asOf
public/.htaccess     lima-city server config: headers, www redirect, caching
```

The 3D showroom (react-three-fiber, GLB models, their Python generator) was
removed on 22.09.2026. Nothing had rendered it since the landing page switched
to a drawn illustration on 13.09. It is in git history if it is ever wanted
back, and so are the traps it caused.

## The loop

```bash
pwsh ./verify.ps1 -Quick     # types + tests, ~40 s, run constantly
pwsh ./verify.ps1            # adds lint + build - stop `next dev` first, see trap 3
npx next dev -p 3001         # then actually look at it
```

Looking at the page is part of the loop, not an optional last step. Two of the
three worst bugs so far were invisible in the code and obvious on screen.

## Deploy

stromstrecke.de is a static export on lima-city. `npx next build` writes it to
`out/`; the **contents** of `out/` go into the web root, including the hidden
`.htaccess`, which carries the security headers, the www redirect and the cache
rules. There is no Node server in production, so `headers()` in
`next.config.ts` only applies to `next dev`; `lib/htaccess.test.ts` keeps the
two in step.

Until 22.09.2026 the export settings were in no commit, and the live site was
built from somewhere outside this repository: on 22.09. it still served the
state of 14.09. while this branch had four days more. Build what is
committed, and after a deploy check `/impressum/` and `/datenschutz/` live.

## Rules that are not style preferences

1. **Ranges are the product.** If a bound cannot be defended, widen it. Never
   narrow a span to look more competent — that is the one dishonesty this app
   cannot afford.

2. **An assumed value is marked where it can be corrected.** Not in a footnote,
   not in a drawer. The control holding the assumption says so itself.

3. **The engine is pure and reproducible.** No I/O, no `eval`, no LLM, no
   `Date.now()` inside the calculation. Same inputs, same output, always.

4. **Copy lives in `lib/copy.ts` and is locked.** `intake-lock.md` fixes which
   question sits in which slot and which words the UI may use;
   `ladekurve-lock.md` fixes the charging claims. Changing a lock is a
   deliberate act with a stated reason. Drifting away from one quietly is not.

5. **Nothing is fetched at runtime.** CSP is `connect-src 'self'`. No CDN, no
   Google Fonts, no HDRI from a third party. System fonts, in-scene lighting.

6. **`localStorage` only with opt-in**, and nothing leaves the browser. No
   account, no database, no tracker.

## Division of labour

`.claude/agents/` — each agent owns a file set and may write nothing else.
That boundary is the whole mechanism; parallel work without it eats itself.

| Agent | Owns |
|---|---|
| `design-system` | `globals.css`, `layout.tsx`, chrome, `components/ui/**` |
| `advisor-ux` | `components/advisor/**`, `app/berater/` |
| `engine` | `lib/engine/**`, `lib/advisor/**`, `data/**` |
| `copy-guard` | `lib/copy.ts`, `labels.ts`, the lock documents |
| `showroom` | `components/showroom/**` |
| `quality` | read-only auditor; writes only `docs/` |

Open work is in `docs/backlog.md`.

## Traps this project already fell into

**1. Two agents, one working tree, nothing committed.** On 12.09. a second
process restored the tree from an archive and an hour of finished work vanished
— every file except the one that process had no record of. Forty-eight files of
work had been sitting uncommitted for hours. **Commit before handing the tree
to anyone else**, and never run two writers over one file set.

**2. A union grew a variant and the build died.** `BodyStyle` gained `compact`
in `types.ts` and in `cars.de.json`, but the 3D model generator still produced
three models. A new variant means every consumer changes in the same commit:
the zod enum in `lib/schema.ts`, the list in `lib/storage.ts`, `BODY_CHIP`, the
icon. None of them is checked against the union by the compiler, which is why
`lib/bodystyle.test.ts` and `lib/speed.test.ts` walk the chain instead.

Three more traps were about the 3D showroom (`ContactShadows` drawing a
diamond, half-metal paint reading as plastic, `<Bounds clip>` leaving an empty
canvas). They left with it on 22.09.2026; if 3D ever comes back, read them in
this file's history first.

**3. This machine runs out of RAM before it runs out of patience.** 7.4 GB
total, and a dev server plus a production build plus a couple of agents is over
the line: Turbopack dies with `memory allocation of 16777216 bytes failed` and
exit code 127, which reads like a missing binary and is nothing of the sort.
**Do not run the full `verify.ps1` while `next dev` is up** — use `-Quick`
(types + tests, no build) during development, and stop the dev server before the
full gate. Same reason parallel agents are capped at a handful rather than a
fleet. On Windows, stopping the shell that ran `next dev` does not always stop
its node process: check that port 3001 is free before trusting that it is gone.

## One false alarm, so nobody chases it twice

The `hydration mismatch` warning naming `data-gr-ext-installed` and
`data-new-gr-c-s-check-loaded` comes from the **Grammarly browser extension**
rewriting the DOM before React loads. It is not an application bug.
