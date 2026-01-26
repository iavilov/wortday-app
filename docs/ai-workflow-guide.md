# AI Workflow Quick Reference

**Last Updated:** 2026-01-26
**Purpose:** Essential prompting patterns for working with Claude Code on Wortday

---

## 🎯 Golden Rules

1. **Always reference docs** - Link to specific files (`docs/coding-conventions.md`, `docs/auth-flow.md`)
2. **Be specific about scope** - "Update only X function in Y file" vs "Fix the bug"
3. **Mention constraints upfront** - "Use design tokens, no hardcoded colors"
4. **Verify compliance** - Check that AI follows `coding-conventions.md` patterns

---

## 🚨 Common Pitfalls & Prevention

| Pitfall | Prevention |
|---------|-----------|
| **Hardcoded values** | "Use only `Colors.*` from design-tokens.ts" |
| **Inline types** | "Add types to types/word.ts, not inline" |
| **Missing translations** | "All text via t() helper from translations.ts" |
| **Platform issues** | "Check Platform.OS for web vs mobile" |
| **Direct Supabase** | "Use lib/*-service.ts, never direct Supabase" |

---

## 📋 Effective Prompting Patterns

### Pattern 1: Context + Task + Constraints
```
Context: We use Zustand for state management
Task: Add notification preferences store
Constraints:
- Follow pattern from store/settings-store.ts
- Use AsyncStorage persist
- Types in types/notifications.ts
```

### Pattern 2: Example-Driven
```
Look at word-store.ts implementation and create similar
favorite-store.ts with same patterns:
- async actions
- error handling
- loading states
```

### Pattern 3: Incremental
```
1. First add NotificationSettings type to types/
2. Then create the store
3. Then integrate into Settings screen
4. Then add tests
```

---

## ✅ Pre-Commit Checklist

Before accepting AI changes:

- [ ] Follows `docs/coding-conventions.md` patterns
- [ ] Uses design tokens (no hardcoded `#FFE347`)
- [ ] All text uses `t()` translations
- [ ] Types defined in `types/` directory
- [ ] Service layer used (no direct Supabase)
- [ ] Loading/error states handled
- [ ] Platform differences considered
- [ ] ESLint passes

---

## 🔄 Recommended Workflows

### Feature Development
1. **Plan:** "Read CLAUDE.md. I want to add [feature]. Propose implementation plan."
2. **Implement:** "Follow the plan. Explain changes after each file."
3. **Verify:** "Check: lint passes, TS compiles, all platforms work"

### Bug Fixes
1. **Investigate:** "Examine app/auth/login.tsx. Why does [bug] happen?"
2. **Fix:** "Fix with minimal changes. Don't refactor adjacent code."
3. **Test:** "Verify fix works on iOS/Android/Web"

### Refactoring
1. **Analyze:** "Review store/word-store.ts. Propose improvements without breaking changes."
2. **Gradual:** "Refactor step-by-step. Verify after each change."

---

## 💡 Key Files to Reference

When making changes, remind AI to check:

- `constants/design-tokens.ts` - Before adding styles
- `constants/translations.ts` - Before adding text
- `types/*.ts` - Before creating interfaces
- `docs/coding-conventions.md` - Before writing code
- `lib/*-service.ts` - For data access patterns

---

## 📝 Documentation Updates

Update these after changes:

- `docs/memory.md` - After every session (use "Финиш" to trigger)
- `docs/project-status.md` - After completing features
- `docs/auth-flow.md` - After auth system changes
- `docs/database-schema.md` - After migrations
- `CLAUDE.md` - After major architectural changes

---

**Pro Tip:** Use `/plan` for complex features, `/code-review` to audit changes, and always update `docs/memory.md` before exiting with "Финиш".
