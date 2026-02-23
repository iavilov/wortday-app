---
name: project-status
description: Show Wortday project current state and progress
disable-model-invocation: true
allowed-tools: Read, Bash, Glob
---

# Project Status

Show a concise project status report.

## Steps

1. **Read** these files:
   - `docs/project-status.md` — Roadmap and versions
   - `package.json` — Current version

2. **Show** status in this format:

```
Wortday Project Status

Version: [from package.json]
Stack: React Native (Expo SDK 52) + Supabase + Web PWA
Design: Neobrutalism (IBM Plex Sans)

Recent Progress:
- [from project-status.md current version section]

In Progress / Next:
- [from project-status.md roadmap]

Key Docs:
- docs/coding-conventions.md — Code standards
- docs/auth-flow.md — Auth system
- docs/database-schema.md — DB schema
- docs/pwa-setup.md — PWA config
```

3. **Offer** quick actions:
   - Start next task from roadmap
   - Check specific system docs
   - Update project-status.md
