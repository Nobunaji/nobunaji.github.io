# Project Guidelines

## Project Context

- This repository is a static portfolio built with Astro 5. It is organized as a
  single package with pages in `src/pages`, shared components in
  `src/components`, layouts in `src/layouts`, styles in `src/styles`, and scripts
  in `src/scripts`.
- Cybersecurity content lives primarily in `src/data/root-me-challenges` and
  `src/pages/cyber-codex`. Preserve the existing French/English conventions:
  localized Root-Me files use `.fr.md` and `.en.md`, where applicable.
- Shared generated data is stored in `src/data/category-stats.json`. The build
  refreshes it through `update-category-stats.mjs`; do not hand-edit generated
  values unless updating the generator too.

## Critical Safety Rules

- Do not create explainer documents or other documentation unless explicitly
  requested.
- Never make git commits unless the user explicitly asks for it.
- Never delete files or folders without asking first. For cleanup, prefer
  targeted removal of clearly temporary artifacts after confirmation.
- Preserve unrelated working-tree changes. Do not revert, reset, or overwrite
  user work.

## Development Commands

- Before running any npm command, check whether a development server is already
  available on `http://localhost:4321`.
- Start a development server with `npm run dev`.
- Run `npm run build` to refresh category statistics and produce the static
  Astro build.
- Run `npm run preview` only to preview an existing build.
- Use `npm run update-stats` for the category-statistics generator alone.
- There is currently no test script; use the smallest relevant build or browser
  verification for a change.

## Astro and Code Conventions

- Follow the patterns in nearby `.astro`, `.js`, `.mjs`, and CSS files. Keep
  frontmatter imports, component props, and HTML structure consistent.
- Keep pages accessible: preserve language metadata, viewport metadata,
  descriptive labels, keyboard navigation, and semantic HTML.
- Prefer scoped styles for component-specific presentation and existing shared
  CSS files for global or cross-page styles.
- Avoid introducing frameworks or dependencies for simple static behavior.
- Use relative imports consistent with the surrounding file.
- For bilingual UI content, preserve both French and English values when the
  existing feature provides a language toggle.
- Do not break static routes under `/root-me` or `/cyber-codex`; use
  filesystem-based Astro pages and existing navigation data.

## Change Workflow

- Inspect the relevant page, layout, component, styles, and data before editing.
- Make surgical changes and preserve existing behavior outside the requested
  scope.
- After a code change, run the smallest validation covering the modified area.
  For site-wide or route/build changes, run `npm run build`.
- Check generated diffs before finishing, especially after `npm run build`,
  because it can update category statistics.