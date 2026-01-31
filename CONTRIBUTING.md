# Contributing to KeyWrit Hub

## Prerequisites

- [Bun](https://bun.sh/) (latest version)

## Setup

```bash
git clone https://github.com/keywrit/KeyWrit-Hub.git
cd KeyWrit-Hub
bun install
```

## Development Commands

```bash
bun run dev           # Start development server
bun run build         # Build for production
bun run preview       # Preview production build
bun run test          # Run tests (watch mode)
bun run test:run      # Run tests once
bun run test:coverage # Run tests with coverage
bun run typecheck     # Type check with TypeScript
bun run lint          # Run linter and formatter
bun run lint:fix      # Auto-fix linting and formatting issues
bun run check         # Run all checks (lint + typecheck + tests)
```

## Project Structure

```
src/
├── App.tsx            # Main application component
├── main.tsx           # Entry point
├── index.css          # Global styles (Tailwind)
└── lib/
    ├── jwt.ts         # JWT generation with jose
    └── utils.ts       # Utility functions (cn helper)
```

## Code Style

- TypeScript with strict mode
- Follow existing patterns in the codebase
- Use the `@` path alias for imports from `src/`
- Use the `cn()` utility for combining Tailwind classes

## Pull Request Process

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Run `bun run check` to verify linting, types, and tests pass
5. Submit a pull request with a clear description
