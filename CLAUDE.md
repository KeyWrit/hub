# KeyWrit Hub - AI Assistant Context

See @README.md for project overview and @CONTRIBUTING.md for development setup.

## Package Manager

Use `bun` to run any command.

## After Commits

Always run `bun run check` after making changes. This runs linting (Biome), type checking, and tests.

## KeyWrit Library

KeyWrit is **signing-method agnostic**. It uses public key infrastructure (PKI) for license validation but does not depend on any specific signing algorithm. The current implementation uses Ed25519 for key generation, but this is an implementation detail, not a library requirement. Do not document or describe KeyWrit as being tied to Ed25519 or any specific algorithm.

## Architecture

React web application for generating JWT license tokens.

- **src/App.tsx** - Main application with layout
- **src/lib/** - Utility functions
  - `types.ts` - TypeScript interfaces (Realm, Client, License, KeyPair, Storage)
  - `crypto/keys.ts` - Key pair generation using jose
  - `storage/storage.ts` - localStorage operations
  - `storage/migrations.ts` - Schema versioning
  - `jwt.ts` - JWT generation using jose library
  - `license.ts` - License utilities
  - `utils.ts` - Helper functions (cn for Tailwind class merging)
- **src/context/** - React Context providers
  - `RealmContext.tsx` - Realm state management
  - `ThemeContext.tsx` - Theme state management
- **src/hooks/** - Custom React hooks
  - `useRealms.ts` - Hook for realm context
  - `useTheme.ts` - Hook for theme context
- **src/components/** - UI components
  - `layout/` - Header, Sidebar, ThemeToggle
  - `realm/` - RealmList, RealmCard, RealmForm, ExportDialog, ImportDialog
  - `client/` - ClientList, ClientCard, ClientForm, ClientSelector, ManageClientDialog
  - `license/` - LicenseList, LicenseCard, LicenseForm, LicenseSection
  - `ui/` - shadcn/ui components

## Testing

Uses Vitest. Run with `bun run test` (watch mode) or `bun run test:run` (single run).

Test files are in `tests/` directory.

## Building

Uses [Vite](https://vite.dev/) for bundling and development server. Run with `bun run build`.

Outputs to `dist/` and deploys to GitHub Pages at `/KeyWrit-Hub/`.

## Path Aliases

- `@` maps to `./src`
