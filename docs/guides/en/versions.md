# Version policy

- All packages (`@terracelab/trellis-*`, PyPI `terracelab-trellis`) are released **together under one version number**.
- **major**: renaming or removing tokens, removing or renaming component props. An automatic migration script (codemod) ships with it.
- **minor**: token value changes, new components and tokens.
- **patch**: bug fixes.
- **1.0.0** is the first public release. The 0.x versions before it were previews and could change even in a minor version.

## Docs versions

- The docs bundled in a package (`dist/docs/`) always match that package's version.
- The site's `/docs/` is the latest stable release. For each release, that version's manifest, llms.txt and component docs stay at `/api/v<major.minor>/`.

## Upgrading

Consuming repositories update all Trellis packages at once with a Renovate group PR. Minor and patch updates merge automatically when the consuming repository's visual regression tests pass. Major updates need human approval and a codemod run.
