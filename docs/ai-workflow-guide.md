# AI Workflow Optimization Guide

**Last Updated:** 16.01.2026
**Purpose:** Recommendations for efficient collaboration with Claude Code and other AI tools

---

## Overview

This guide provides best practices for working with AI assistants on the Vocade project. Following these recommendations will make AI interactions more efficient and reduce context misunderstandings.

---

## Documentation Structure (Current)

### ✅ What We Have Now

```
vocade/
├── CLAUDE.md                    # Main router for AI context
└── docs/
    ├── project-status.md        # Project history and roadmap
    ├── auth-flow.md             # Authentication system
    ├── database-schema.md       # Database structure
    ├── tech-stack.md            # Technology decisions
    ├── coding-conventions.md    # Coding standards
    ├── supabase-words-integration.md  # Integration guide
    └── ai-workflow-guide.md     # This file
```

### 📋 Why This Structure Works

1. **CLAUDE.md as Router**: AI reads this first to understand project structure
2. **Kebab-case Naming**: Consistent, predictable file names
3. **Separation of Concerns**: Each doc has a specific purpose
4. **Cross-references**: Docs link to each other for context

---

## Best Practices for AI Interactions

### 1. Always Reference Documentation

When starting a new task:

```
✅ Good:
"I need to add a new settings screen. Check docs/coding-conventions.md
for component structure and docs/tech-stack.md for used libraries."

❌ Bad:
"Add a new settings screen"
```

**Why:** AI gets full context without having to guess patterns.

### 2. Be Specific About Scope

```
✅ Good:
"Update only the getTodayWord function in lib/word-service.ts so that it
returns a fallback to the first word if sequence_number is too large"

❌ Bad:
"Fix the word loading bug"
```

**Why:** Prevents AI from making unnecessary changes to other files.

### 3. Mention Constraints Upfront

```
✅ Good:
"Add a new button to Settings. Important: use design tokens from
constants/design-tokens.ts, do not hardcode colors. Follow the BrutalButton pattern."

❌ Bad:
"Add a new button"
```

**Why:** AI follows project conventions from the start.

### 4. Request Verification Steps

```
✅ Good:
"After changes, verify:
1. TypeScript compiles without errors
2. All texts use translations
3. Loading states are handled
4. Works on iOS, Android, Web"

❌ Bad:
"Do it and check if it works"
```

**Why:** AI knows what to test and document.

---

## Project-Specific Context

### Key Files AI Should Always Be Aware Of

When making changes, remind AI to check:

1. **constants/design-tokens.ts** - Before adding any styles
2. **constants/translations.ts** - Before adding user-facing text
3. **types/*.ts** - Before creating new interfaces
4. **docs/coding-conventions.md** - Before writing new code

### Architecture Reminders

When AI suggests changes, verify:

- ✅ Uses service layer (`lib/*-service.ts`)
- ✅ Never accesses Supabase directly from components
- ✅ Loading and error states are handled
- ✅ Platform differences are considered (iOS/Android/Web)
- ✅ Design tokens are used (no hardcoded values)

---

## Common Pitfalls & How to Avoid Them

### Pitfall 1: AI Hardcodes Values

**Problem:** AI uses `#FFE347` instead of `Colors.primary`

**Prevention:**
```
"Use only design tokens from constants/design-tokens.ts,
no hardcoded color or size values"
```

### Pitfall 2: AI Creates Inline Types

**Problem:** AI defines interfaces directly in components

**Prevention:**
```
"Add types to types/word.ts, do not create inline interfaces"
```

### Pitfall 3: AI Forgets Translations

**Problem:** AI uses hardcoded strings like "Sign Out"

**Prevention:**
```
"All texts must use the t() helper with keys in constants/translations.ts"
```

### Pitfall 4: AI Ignores Platform Differences

**Problem:** AI uses Alert.alert() on Web (doesn't work)

**Prevention:**
```
"Check Platform.OS and use window.confirm on Web, Alert.alert on mobile"
```

### Pitfall 5: AI Breaks Auth Flow

**Problem:** AI modifies navigation without considering Auth Guard

**Prevention:**
```
"Any navigation changes must consider the Auth Guard in app/_layout.tsx"
```

---

## Effective Prompting Patterns

### Pattern 1: Context + Task + Constraints

```
Context: The project uses Zustand for state management
Task: Add a new store for notification preferences
Constraints:
- Follow the pattern from store/settings-store.ts
- Add persist with AsyncStorage
- TypeScript types in types/notifications.ts
```

### Pattern 2: Example-Driven

```
Look at how word-store.ts is implemented and create a similar
favorite-store.ts with the same patterns:
- async actions
- error handling
- loading states
```

### Pattern 3: Incremental Changes

```
✅ Good:
1. First add the NotificationSettings type to types/
2. Then create the store
3. Then integrate into Settings screen
4. Then add tests

❌ Bad:
"Implement the full notification system"
```

**Why:** Easier to review, test, and roll back if needed.

---

## Documentation Maintenance

### When to Update CLAUDE.md

Update after:
- Major architectural changes
- New core patterns introduced
- Critical gotchas discovered
- File structure changes

### When to Update Other Docs

- **project-status.md** - After completing features, changing roadmap
- **auth-flow.md** - After auth system changes
- **database-schema.md** - After schema migrations
- **tech-stack.md** - After adding/removing major dependencies
- **coding-conventions.md** - After establishing new patterns

### Keep Docs Synchronized

When you change code, update docs in the same commit:

```bash
git add app/auth/login.tsx docs/auth-flow.md
git commit -m "feat: Add Google OAuth to login screen

Updated auth-flow.md with Google OAuth setup instructions"
```

---

## AI Code Review Checklist

When AI completes a task, verify:

- [ ] Code follows conventions in `docs/coding-conventions.md`
- [ ] All imports use `@/` alias
- [ ] No hardcoded colors/sizes (uses design tokens)
- [ ] All text uses translations (no hardcoded strings)
- [ ] Types are defined in `types/` directory
- [ ] Service layer is used (no direct Supabase in components)
- [ ] Loading states are shown
- [ ] Errors are handled gracefully
- [ ] Platform differences are handled
- [ ] Comments are in English
- [ ] Console logs use prefixes (e.g., `[Auth Service]`)

---

## Recommended AI Workflows

### For Feature Development

1. **Planning Phase**
   ```
   Prompt: "Read CLAUDE.md and docs/project-status.md.
   I want to add [feature]. Propose an implementation plan considering
   the current architecture."
   ```

2. **Implementation Phase**
   ```
   Prompt: "Implement [feature] according to the plan. Follow docs/coding-conventions.md.
   Explain what changed after each file."
   ```

3. **Testing Phase**
   ```
   Prompt: "Verify that:
   1. npm run lint passes
   2. TypeScript compiles
   3. All platforms work
   4. Translations are added"
   ```

### For Bug Fixes

1. **Investigation**
   ```
   Prompt: "Examine app/auth/login.tsx and lib/auth-service.ts.
   Explain why [bug happens]."
   ```

2. **Fix**
   ```
   Prompt: "Fix the bug with minimal changes.
   Do not refactor adjacent code."
   ```

3. **Verification**
   ```
   Prompt: "Write down how to test the fix on all platforms"
   ```

### For Refactoring

1. **Analysis**
   ```
   Prompt: "Analyze store/word-store.ts and propose improvements
   that won't break existing code"
   ```

2. **Step-by-Step**
   ```
   Prompt: "Refactor gradually:
   1. First extract helper functions
   2. Then improve typing
   3. Then optimize queries

   After each step verify that everything works"
   ```

---

## Future Improvements

### Planned Documentation Enhancements

- [ ] Add diagrams for auth flow
- [ ] Add component hierarchy diagram
- [ ] Create troubleshooting guide
- [ ] Add performance optimization guide
- [ ] Document deployment process

### Planned Code Improvements for AI Context

- [ ] Add inline JSDoc comments to complex functions
- [ ] Create type guards for better type narrowing
- [ ] Add more detailed error messages
- [ ] Create reusable component templates

---

## Tips for Long Conversations with AI

### Refresh Context Periodically

Every ~10 messages, remind AI:

```
"Reminder: we are working on Vocade, a React Native app with Expo.
Architecture is described in CLAUDE.md. We follow patterns from
docs/coding-conventions.md."
```

### Ask for Reasoning

```
✅ Good:
"Why did you choose this approach? What alternatives did you consider?"

❌ Bad:
"Ok" (AI doesn't know if you understood)
```

### Split Complex Tasks

```
✅ Good:
"First update types, then we discuss changes in the store"

❌ Bad:
"Do it all at once" (harder to review, higher chance of errors)
```

---

## Debugging AI Mistakes

### If AI Breaks Something

1. **Don't panic** - Use git to see what changed
2. **Identify root cause** - Was prompt unclear? Missing context?
3. **Provide specific feedback**:
   ```
   "You added inline styles, but docs/coding-conventions.md
   states to use design tokens. Fix using Colors.*"
   ```

### If AI Doesn't Understand

1. **Provide more context** - Link to specific docs
2. **Show examples** - Reference existing code
3. **Break down task** - Smaller, clearer steps

---

## Conclusion

### Key Takeaways

1. **Documentation is AI's memory** - Keep it updated
2. **Be specific** - Vague prompts → unpredictable results
3. **Reference standards** - Point to conventions explicitly
4. **Verify outputs** - AI can make mistakes
5. **Iterate** - Refine approach based on results

### Success Metrics

You're doing it right when:
- ✅ AI rarely breaks existing patterns
- ✅ Generated code passes lint without changes
- ✅ Minimal back-and-forth needed
- ✅ Code is consistent with project style
- ✅ Documentation stays up-to-date

---

**Last Updated:** 16.01.2026
**Status:** ✅ Active guide
**Next Review:** After v1.1.0 release
