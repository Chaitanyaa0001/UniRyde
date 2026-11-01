# UniRyde backend chat

## REST

All chat routes require the HTTP-only `sid` cookie.

- `GET /api/v1/chat/conversations` lists the authenticated user's conversations, members, carpool summary, and last message.
- `GET /api/v1/chat/conversations/:id/messages?limit=30&cursor=<messageId>` returns newest-first messages and a `nextCursor`.

## Socket.IO

Connect to the backend with credentials enabled so the `sid` cookie is sent:

```ts
const socket = io("http://localhost:5050", { withCredentials: true });
```

Events use acknowledgement callbacks:

```ts
socket.emit("message:send", { conversationId, content: "Hello" }, console.log);
socket.emit("typing:start", { conversationId }, console.log);
socket.emit("typing:stop", { conversationId }, console.log);
socket.emit("conversation:join", { conversationId }, console.log);
```

Successful acknowledgements have `{ ok: true, data }`; failures have
`{ ok: false, error }`. The server emits `message:new`, `typing`, and
`conversation:created`. A conversation is created automatically when a carpool
owner accepts a join request. Cancelled carpools remain readable but reject new
messages.

## Verification

```bash
pnpm run build
pnpm test
pnpm prisma validate
```

The test suite is in `tests/backend.test.ts` and uses mocked Redis and Prisma
boundaries, so it can validate the application contract without a local
database. Run the server against PostgreSQL and Redis separately for a full
environment smoke test.
