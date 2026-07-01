# Garimzap

Garimzap is a backend platform for transforming high-volume group chat messages into structured business information.

The MVP focuses on real estate listings and follows a provider-agnostic, asynchronous processing architecture. The current implementation is **Milestone 1: Project Foundation**.

## Current Milestone

Milestone 1 provides:

- Runnable TypeScript backend service.
- `GET /health` endpoint.
- Environment-based configuration.
- Basic structured HTTP logging.
- Docker Compose services for local PostgreSQL and Redis.
- Quality gates for tests, typechecking, linting, and formatting.

Milestone 1 does not include message ingestion, persistence usage, queue processing, parser behavior, property listings, authentication, provider integrations, or a frontend dashboard.

## Requirements

- Node.js 22 or newer.
- npm.
- Docker, for local PostgreSQL and Redis.

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Start local dependencies:

```bash
docker compose up -d
```

If your Docker installation uses the legacy Compose command:

```bash
docker-compose up -d
```

Start the backend in development mode:

```bash
npm run dev
```

Check service health:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "environment": "development",
  "status": "ok"
}
```

## Quality Gates

Run tests:

```bash
npm test
```

Run typechecking:

```bash
npm run typecheck
```

Run linting:

```bash
npm run lint
```

Check formatting:

```bash
npm run format:check
```

Build the project:

```bash
npm run build
```

## Project Documents

- [Product Requirements](./PRODUCT_REQUIREMENTS.md)
- [Architecture](./ARCHITECTURE.md)
- [Development Roadmap](./DEVELOPMENT_ROADMAP.md)
