# KeyWrit Hub - AI Assistant Context

See @README.md for project overview and @CONTRIBUTING.md for development setup.

## Package Manager

Use `bun` to run any command.

## After Commits

Always run `bun run check` after making changes. This runs linting (Biome), type checking, and tests.

## Architecture

React web application for generating JWT license tokens.

- **src/App.tsx** - Main application component
- **src/lib/** - Utility functions
  - `jwt.ts` - JWT generation using jose library
  - `utils.ts` - Helper functions (cn for Tailwind class merging)

## Testing

Uses Vitest. Run with `bun run test` (watch mode) or `bun run test:run` (single run).

Test files are in `tests/` directory.

## Building

Uses [Vite](https://vite.dev/) for bundling and development server. Run with `bun run build`.

Outputs to `dist/` and deploys to GitHub Pages at `/KeyWrit-Hub/`.

## Path Aliases

- `@` maps to `./src`
