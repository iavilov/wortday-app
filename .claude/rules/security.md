# Security Rules

## Supabase
- NEVER expose `service_role` key in client code
- ALL database access through RLS-protected queries
- Validate user ownership in queries: `.eq('user_id', userId)`

## Environment Variables
- Secrets in `.env` only (never hardcoded)
- Only `EXPO_PUBLIC_*` vars accessible in client code
- Never log sensitive data (tokens, passwords, keys)

## Authentication
- Always verify auth state before protected operations
- Handle token refresh gracefully
- Clear sensitive data on sign out

## Input
- Sanitize user input before database operations
- Use parameterized queries (Supabase handles this)
- Validate data shapes at service boundaries
