# Starting a service

A service adds Trellis as a git submodule. The screen blocks and the agent skill live in the submodule, and while you build the service you can fix Trellis in place and commit the fix to the Trellis repository. An app that only uses the components can install them from npm instead ([Installation](install.md)).

## New service

```bash
# In the Trellis repository
node scripts/create-service.mjs ~/dev/Projects/my-service --title "내 서비스"
cd ~/dev/Projects/my-service
pnpm dev
```

The script creates the following.

- `apps/web`, a Vite · React · React Router app. It contains the app shell, menu, notifications, theme, density and screen settings
- The `trellis/` submodule, in the same pnpm workspace
- `.claude/skills/trellis/`, the service-side agent skill, and `CLAUDE.md`
- `pnpm lint` (eslint with the Trellis rules), `pnpm check` (screen check) and `.trellis/requests.md` (the request table)
- A first commit, made after installing, building Trellis and running the checks

## Cloning on another computer

```bash
git clone --recurse-submodules <service repository>
pnpm install
pnpm build
```

## Read Trellis source directly during development

The app's Vite and TypeScript configs turn on the `@terracelab/source` condition. So when you edit `trellis/packages/react/src`, the change shows on screen right away without a rebuild. You need `pnpm ds:build` only when you change the token JSON.

## Screen blocks

```bash
pnpm ds:add --list
pnpm ds:add erp/tax/invoice-list
```

The block source is copied into `apps/web/src/blocks/` and its import paths are changed to package paths. The source commit is recorded in `.trellis/blocks.lock`.

Blocks get screen ids and URL values from the platform. With a browser router, pass `screens`, `screenHref` and `navigate` to `PlatformProvider`, and pass the URL values from the layout route.

```tsx
// layout route (inside the router)
const [search] = useSearchParams();
return (
  <ScreenParamsProvider params={search}>
    <Outlet />
  </ScreenParamsProvider>
);
```

Blocks read `?id=` and `?tab=` from it. The parts you may change sit between `slot: <name>` and `slot: <name> end` comments in the block code.

### Two sample companies

Copied blocks read their sample data from `@terracelab/trellis-blocks/data`. The company name, today's date, people and warehouses come from its `profile`, the Trellis sample company. If your service has its own sample company, one app ends up with two companies. Three rules:

1. While you copy a block and fit the screen, leave the import as it is. Get the structure and behavior right first.
2. When you finish that screen, switch the block's sample import to your service's sample module. If the service file exports the same names in the same shape (types), only the import line changes. If the block shows values your samples don't have (warehouses, industry terms), rewrite those parts in your service's words.
3. One screen shows one company. If the menu, notifications and user area show the service company, so does the page body.

Check with `grep -rn "@terracelab/trellis-blocks/data" apps/web/src`. When only type imports are left, you are done.

## Commands

| Command | What it does |
|---|---|
| `pnpm ds:doctor` | CSS order · values outside tokens (hex · px · fonts · primitive colors · color functions · overriding inner parts · onClick) · theme scope · outdated theme.css · skill version |
| `pnpm lint` | eslint with the Trellis rules |
| `pnpm check` | Screen check: every menu screen × 344 · 720 · 1024 · 1440 × light · dark with 0 critical or serious axe issues, 0 horizontal overflow and 0 console errors. Screenshots go to `check-results/` |
| `pnpm ds:theme` | Company theme (theme.css) |
| `pnpm ds:docs <component>` | Docs for the installed Trellis |
| `pnpm ds:update` | Moves Trellis to the latest main, rebuilds, regenerates theme.css with the current generator (`ds:theme --refresh`) and lists blocks that changed |
| `pnpm ds:add --outdated` | Blocks that changed in Trellis after you copied them. See the changes with `--diff <block id>` |

### Two apps in one repository

If the service repository also holds an app that does not use Trellis (for example `apps/studio`), narrow the checks to the Trellis app.

| Check | What it looks at | What to do |
|---|---|---|
| `pnpm ds:doctor` | One app folder. `apps/web` by default (the repository root if there is none) | Leave it. Run `pnpm ds:doctor --app apps/<name>` separately for each other Trellis app. Don't run it on an app that does not use Trellis |
| Trellis rules in `pnpm lint` | The starter applies them to all of `apps/*/src/**` | Change `files` in the Trellis block of `eslint.config.js` to the Trellis app. Keep the base JS and TS rules on every app |
| `pnpm check` | The screens in `apps/web/src/nav.ts` | Leave it. Give the other app its own checks |

```js
// eslint.config.js: Trellis rules only on the Trellis app
{
  files: ['apps/web/src/**/*.{ts,tsx,js,jsx}'],
  plugins: { trellis },
  rules: tokenRules,
},
```

## Updating to the latest Trellis

```bash
pnpm ds:update                               # move to main · install · build · skills · theme.css · changed blocks
git -C trellis log --oneline $(git rev-parse HEAD:trellis)..HEAD  # incoming commits
pnpm typecheck && pnpm build && pnpm ds:doctor && pnpm check
git add trellis && git commit -m "chore: update Trellis"
```

Copied blocks do not change on their own. Review them with `pnpm ds:add --diff <block id>` and move over only the parts you need. To pin a specific commit, run `git -C trellis checkout <commit>` and then `git add trellis`.

## Adding Trellis to an existing project

It takes a submodule, three lines in `pnpm-workspace.yaml`, `workspace:*` dependencies and the `ds:*` commands, the CSS order, and the `@terracelab/source` condition in Vite and TypeScript. The steps and code are in the `기존 프로젝트에 붙이기` (Adding to an existing project) section of the Trellis repository README.

## If something is missing

For a small fix, run `git -C trellis switch main`, fix it directly in `trellis/` and commit inside that folder. For something larger, such as a new component or a token value, add one row to the table in `.trellis/requests.md` in the service repository. The starter creates this file with only the header row. Requests go only in this file, and you do not change the `trellis/` submodule for them. The columns and how to fill them are in `references/request.md` in the skill.

On the Trellis side, requests from several services are collected and moved to the Trellis work list. Rows that were already moved are left out.

```bash
# In the Trellis repository
node scripts/collect-requests.mjs ~/dev/Projects/my-service ~/dev/Projects/other-service
```
