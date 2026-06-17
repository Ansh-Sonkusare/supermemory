# Running the Web App Against a Local Backend

## Prerequisites

- Backend running on `localhost:6767` (run `supermemory-server`)
- API key from the backend (printed on first boot)
- Bun installed

## Step 1: Start the CORS proxy

The backend has no CORS headers. A standard proxy doesn't work because the app uses `credentials: "include"` on every request, which the browser rejects if `Access-Control-Allow-Origin` is `*`.

```bash
node cors-proxy.js
```

This proxy forwards requests to the backend and echoes back the request origin instead of `*`, so the browser accepts credentialed requests.

## Step 2: Set env vars

```bash
export NEXT_PUBLIC_API_KEY=sm_xxx
export NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

The middleware bypasses session checks when `NEXT_PUBLIC_API_KEY` is set. The app injects `Authorization: Bearer` into all API requests. The auth context stubs a fake session/org so `ensure-workspace` doesn't hang.

## Step 3: Start the dev server

```bash
cd apps/web && next dev
```

## How It Works

| File | What it does |
|------|-------------|
| `cors-proxy.js` | Proxies `:8080` → `:6767`, echoes origin for CORS |
| `dev-mode.ts` | Config hub: `isApiKeyMode`, `API_KEY`, `BACKEND_URL` |
| `middleware.ts` | Skips session check when API key is set |
| `auth-context.tsx` | Stubs session/org for API key mode |
| `api.ts` | Injects `Authorization: Bearer` header |
| `auth.ts` | Omits credentials in API key mode |
