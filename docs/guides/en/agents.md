# Developing with agents

Trellis ships docs for agents (Claude Code and others) inside its packages. Agents read **only the docs of the installed version**. They look at the latest docs when upgrading.

## Where the docs are

| Where | What |
| --- | --- |
| `node_modules/@terracelab/trellis-react/dist/docs/llms.txt` | Starting point. Rules · installation · doc list (6 KB or less) |
| `…/dist/docs/llms-full.txt` | Everything in one file (1.5 MB or less, without the changelog) |
| `…/dist/docs/manifest.json` | Machine-readable. Components · props · states · tokens · modules · example names |
| `…/dist/docs/components/<Name>.md` | One component. Purpose · Props table · states · accessibility · example code |
| `…/dist/docs/guides/*.md` | The same text as the guides on this site (Korean edition) |
| `https://trellis.terracelab.co.kr/llms.txt` | Latest version (site) |
| `https://trellis.terracelab.co.kr/api/latest/manifest.json` | Latest manifest. Per version under `/api/v<major.minor>/` |

In code, you can also read it with `import manifest from '@terracelab/trellis-react/docs/manifest.json' with { type: 'json' }`.

## Workflow

1. Check the installed `@terracelab/trellis-react` version and read `llms.txt`.
2. Translate the request into Trellis vocabulary. Screen types follow [Screen patterns](patterns.md), numbers follow [Choosing a chart](charts.md), parts come only from `manifest.components`, and words follow [Content](content.md).
3. Build only with tokens and components ([Principles and rules](principles.md)).
4. Run the checks (`npx @terracelab/trellis-skill doctor`), types and tests. For screens, look at screenshots at 1440 and 390 in light and dark. A service that uses the submodule runs `pnpm ds:doctor` and `pnpm check` (every screen × 4 widths × light · dark).
5. Report the patterns and components used, new needs that came up (missing components or tokens) with the requests you left, and the verification results.

## If you need a component that does not exist

Do not build it in the app. Add one row to the table in `.trellis/requests.md` in the service repository (date · service · kind · content · workaround · status). In the content, write what was missing and on which screen it blocked you, the props and states it needs, and similar existing components. Until then, use the closest combination of existing components. Requests go only in this file. On the Trellis side, `node scripts/collect-requests.mjs <service path>` collects them, and Trellis handles them in the order spec → contract → implementation → release. The steps are in `references/request.md` in the skill.

## Skill

`@terracelab/trellis-skill` puts the agent skill in a service repository and checks the service. It runs in services that install Trellis from npm and in services that add it as a git submodule. Run it from the root of the service repository.

```bash
npx @terracelab/trellis-skill install        # installs .claude/skills/trellis/ and records the version in .trellis/skill.lock
npx @terracelab/trellis-skill doctor         # checks the install · CSS order · font · values outside tokens · skill version
npx @terracelab/trellis-skill docs TrendChart   # prints the docs of the installed Trellis (offline)
npx @terracelab/trellis-skill add dashboard  # copies the dashboard starter screen to src/dashboard/
```

| Command | What it does |
| --- | --- |
| `install` | Copies the SKILL.md and references that match how Trellis is installed. If the app is not at the repository root, pass `--app <app folder>` once |
| `doctor` | Exits with code 1 when a check fails. For missing packages and CSS imports it prints the command and lines to add, and for hex and px values it prints token candidates. Values in files that do not use Trellis count as warnings, or as failures with `--strict` |
| `docs` | `docs list` prints names, `docs guide <name>` a guide, `docs tokens` the token table and `docs path` the docs folder |
| `add` | Starter screens use only the packages on npm. After copying, the files are service code |

Ask the agent for the screen in plain words. The skill fixes the order: check, read the docs, copy the starter screen, map the request to parts, verify.

In a service that uses the submodule, the service starter in [Starting a service](service.md) puts the same tool in the root package.json as these commands.

```bash
pnpm ds:skill              # installs .claude/skills/trellis/ and records the Trellis commit in .trellis/skill.lock
pnpm ds:doctor             # checks the build · CSS order · values outside tokens · theme scope · skill version
pnpm ds:docs TrendChart    # prints the docs of the installed Trellis (offline)
pnpm check                 # checks every screen: axe · horizontal overflow · console errors
```
