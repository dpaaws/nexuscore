# NexusCore

A production-grade multi-language backend platform.

```
nexuscore/
├── services/
│   ├── gateway/   TypeScript  — API Gateway with rate limiting & auth
│   ├── loader/    Go          — High-performance HTTP load tester
│   └── webhook/   PHP         — Webhook dispatcher with retry queue
├── docs/
└── scripts/
```

## Quick Start

```bash
# Gateway (TypeScript)
cd services/gateway && npm install && npm run dev

# Loader (Go)
cd services/loader && go mod tidy && go run . attack https://example.com -c 50 -d 10s

# Webhook (PHP)
cd services/webhook && composer install
```

## Architecture

Each service is independently deployable and communicates over HTTP.
The gateway acts as the single entry point, proxying requests to internal services
while enforcing auth and rate limits.

```
Client → [Gateway:3000] → [Loader:4000]
                        → [Webhook:5000]
```
