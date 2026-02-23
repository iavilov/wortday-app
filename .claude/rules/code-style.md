---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Code Style Rules

## File Naming
- Components: `PascalCase.tsx` (BrutalButton.tsx, WordCard.tsx)
- Services/utils: `kebab-case.ts` (auth-service.ts, date-helpers.ts)
- Stores: `kebab-case-store.ts` (auth-store.ts, settings-store.ts)
- Routes: `kebab-case.tsx` (app/auth/login.tsx)

## Components
- Functional components with arrow functions only (no class components)
- Separate props interface (not inline)
- Explicit return types when not obvious

## File Structure Order
1. React/RN imports
2. Type imports (`import type`)
3. Constants & helpers
4. Component imports
5. Props interface
6. Component definition (State → Hooks → Effects → Handlers → Render)

## Platform Awareness
- Check `Platform.OS` for web vs mobile differences
- Use `Platform.select()` for platform-specific values
- `Alert.alert` does not work on Web — use alternatives
