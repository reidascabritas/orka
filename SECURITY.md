# Orka — Security Architecture

## Authentication
- JWT (HS256) with access tokens (60 min) + refresh tokens (7 days)
- Token blacklist via in-memory set (jti-based revocation)
- Login lockout: 5 failures → 15 min block per email
- Password policy: min 8 chars, 1 uppercase, 1 digit

## Authorization
- All authenticated endpoints require valid Bearer token
- Organization-scoped data: every DB query filters by org_id from JWT
- Resources validated for ownership before access

## Data Protection
- OAuth tokens encrypted at rest with Fernet (AES-128-CBC + HMAC)
- Passwords hashed with bcrypt (passlib)
- Sensitive fields never logged in plaintext

## API Security
- CORS: only FRONTEND_URL origin allowed
- Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- Request IDs on every response for traceability
- Global error handler: stack traces never reach the client

## Secrets Management
- All secrets via environment variables (never hardcoded)
- Startup validation: fails fast if required secrets missing in production
- Required env vars: SECRET_KEY, REFRESH_TOKEN_SECRET, FERNET_KEY

## Audit Logging
- Structured JSON logs for: auth events, billing events, decision changes
- Logs include: timestamp, event, user_id, org_id, ip, result

## Reporting Vulnerabilities
Email: security@orka.com.br (placeholder)
