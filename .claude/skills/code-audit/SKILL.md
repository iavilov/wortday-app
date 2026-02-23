---
name: code-audit
description: Verify code follows Wortday project conventions
disable-model-invocation: true
allowed-tools: Read, Glob, Grep
---

# Code Audit

Audit the file or changes specified by `$ARGUMENTS`.

## Steps

1. **Identify target:**
   - If file path provided (`$ARGUMENTS[0]`): audit that file
   - If no args: audit recent changes via `git diff --name-only HEAD~1`

2. **Read** target file(s) and `docs/coding-conventions.md`

3. **Check against conventions:**

### Design Tokens
Search for hardcoded values:
- Hex colors: `#[0-9A-Fa-f]{6}`
- Hardcoded radius: `borderRadius: [0-9]+`
- Hardcoded font sizes: `fontSize: [0-9]+`
- Hardcoded font names: `fontFamily: '...'`

### Translations
- Hardcoded text in JSX: `<Text>English text</Text>`
- Hardcoded placeholders: `placeholder="..."`

### Type Safety
- `any` types: `: any`, `as any`
- Inline interfaces instead of `types/` definitions

### Service Layer
- Direct `supabase.` calls outside `lib/*-service.ts`

### Error Handling
- Missing loading states
- Missing error states
- Console logs without `[Prefix]`

4. **Report** findings in this format:

```
Code Audit: [file-name]

PASS:
- [What's correct]

ISSUES:
- Line XX: [Problem] -> [Fix suggestion]

SUMMARY: X issues found, Y passes
```

5. **Offer** to fix issues if user confirms.
