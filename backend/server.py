from fastapi import FastAPI, Request
from starlette.responses import Response
import httpx
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("proxy")

app = FastAPI()

NEXTJS_URL = "http://localhost:3000"

@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy_to_nextjs(request: Request, path: str):
    url = f"{NEXTJS_URL}/api/{path}"
    logger.info(f"PROXY {request.method} /api/{path}")

    # Forward headers, preserving original host info for auth callbacks
    fwd_headers = {}
    original_host = None
    for key, value in request.headers.items():
        lower = key.lower()
        if lower == "host":
            original_host = value
            continue
        if lower == "content-length":
            continue
        fwd_headers[key] = value

    # Set forwarded headers so Next.js knows the real origin
    if original_host:
        fwd_headers["x-forwarded-host"] = original_host
        fwd_headers["host"] = original_host
    if "x-forwarded-proto" not in fwd_headers:
        fwd_headers["x-forwarded-proto"] = "https"

    body = await request.body()

    try:
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=False) as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=fwd_headers,
                content=body,
                params=dict(request.query_params),
            )
    except Exception as e:
        logger.error(f"PROXY ERROR: {e}")
        return Response(content=str(e), status_code=502)

    logger.info(f"PROXY RESPONSE {response.status_code} for /api/{path}")

    resp = Response(
        content=response.content,
        status_code=response.status_code,
    )

    for key, value in response.headers.multi_items():
        lower = key.lower()
        if lower in ("transfer-encoding", "content-encoding", "content-length"):
            continue
        resp.headers.append(key, value)

    return resp
