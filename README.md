# Garimzap

Garimzap is a backend platform for transforming high-volume group chat messages into structured business information.

The MVP focuses on real estate listings and follows a provider-agnostic, asynchronous processing architecture. The current implementation is **Milestone 5: Query APIs and Product Metrics**.

## Current Milestone

Milestone 5 provides:

- Runnable TypeScript backend service.
- `GET /health` endpoint.
- Environment-based configuration.
- Basic structured HTTP logging.
- Docker Compose services for local PostgreSQL and Redis.
- PostgreSQL-backed raw message persistence.
- Provider-agnostic `POST /webhooks/messages` ingestion.
- Raw message query APIs through `GET /messages` and `GET /messages/:id`.
- Idempotent duplicate handling by `externalMessageId` and `groupId`.
- BullMQ and Redis-backed asynchronous processing.
- Separate API and worker processes.
- Raw message lifecycle transitions from `accepted` to `processing` to `processed` or `failed`.
- Deterministic real estate message parsing.
- Parser Result creation for every processed message.
- Parser Result statuses: `listing_created`, `unstructured`, and `rejected`.
- Property Listing creation when strict listing requirements are met.
- Traceability from Property Listing to Parser Result and Raw Message.
- Property Listing query APIs through `GET /property-listings` and `GET /property-listings/:id`.
- Listing filters for city, neighborhood, property type, and price range.
- Product statistics through `GET /statistics`.
- Quality gates for tests, typechecking, linting, and formatting.

Milestone 5 does not include pagination, sorting, full-text search, semantic search, saved filters, alerts, authentication, provider integrations, AI extraction, multi-domain parsing, multi-tenancy, or a frontend dashboard.

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

Run database migrations:

```bash
npm run db:migrate
```

Start the backend in development mode:

```bash
npm run dev
```

In another terminal, start the worker:

```bash
npm run dev:worker
```

The worker runs the deterministic real estate parser in this milestone. Parser outcomes are stored separately from the raw message technical lifecycle.

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

## Message Ingestion API

Submit a normalized incoming message:

```bash
curl -X POST http://localhost:3000/webhooks/messages \
  -H "Content-Type: application/json" \
  -d '{
    "externalMessageId": "msg_123",
    "groupId": "group_456",
    "groupName": "Imoveis Londrina",
    "senderId": "user_789",
    "senderName": "Maria",
    "text": "VENDO CASA\n3 quartos\nJardim Europa\nLondrina - PR\nR$ 320.000",
    "sentAt": "2026-07-01T10:00:00.000Z"
  }'
```

Successful ingestion returns `201 Created`:

```json
{
  "created": true,
  "message": {
    "id": "generated-message-id",
    "externalMessageId": "msg_123",
    "groupId": "group_456",
    "groupName": "Imoveis Londrina",
    "senderId": "user_789",
    "senderName": "Maria",
    "text": "VENDO CASA\n3 quartos\nJardim Europa\nLondrina - PR\nR$ 320.000",
    "sentAt": "2026-07-01T10:00:00.000Z",
    "receivedAt": "generated-received-timestamp",
    "processingStartedAt": null,
    "processedAt": null,
    "processingFailedAt": null,
    "lastProcessingError": null,
    "processingStatus": "accepted"
  }
}
```

Submitting the same `externalMessageId` and `groupId` again also returns `201 Created`, but with `created: false` and the existing message.

With the worker running, the raw message should move through this technical lifecycle:

```text
accepted -> processing -> processed
```

If a technical processing error occurs after retries, the public lifecycle is:

```text
accepted -> processing -> failed
```

Parser-specific outcomes are stored as Parser Results:

```text
complete real estate listing -> listing_created + Property Listing
incomplete real estate message -> unstructured
non-real-estate message -> rejected
```

List raw messages:

```bash
curl http://localhost:3000/messages
```

Retrieve one raw message:

```bash
curl http://localhost:3000/messages/generated-message-id
```

## Property Listing API

List extracted property listings:

```bash
curl http://localhost:3000/property-listings
```

Filter extracted property listings:

```bash
curl "http://localhost:3000/property-listings?city=Londrina&propertyType=house&minPrice=300000&maxPrice=500000"
```

Successful responses use the consistent read response shape:

```json
{
  "data": [
    {
      "id": "generated-listing-id",
      "rawMessageId": "generated-message-id",
      "parserResultId": "generated-parser-result-id",
      "intent": "sale",
      "propertyType": "house",
      "priceAmount": 320000,
      "locationText": "Jardim Europa, Londrina - PR",
      "city": "Londrina",
      "neighborhood": "Jardim Europa",
      "state": "PR",
      "bedrooms": 3,
      "contactPhone": "(43) 99999-9999",
      "createdAt": "generated-created-timestamp"
    }
  ]
}
```

Retrieve one property listing:

```bash
curl http://localhost:3000/property-listings/generated-listing-id
```

If a listing does not exist, the API returns `404 Not Found`.

## Statistics API

Retrieve product statistics:

```bash
curl http://localhost:3000/statistics
```

Example response:

```json
{
  "data": {
    "totalReceivedMessages": 10,
    "totalPropertyListings": 4,
    "extractionSuccessRate": 40,
    "totalUnstructuredMessages": 3,
    "totalRejectedMessages": 2,
    "totalMessagesCurrentlyProcessing": 1
  }
}
```

`extractionSuccessRate` is calculated as:

```text
listing_created parser results / processed raw messages * 100
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
