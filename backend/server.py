from fastapi import FastAPI, Request
from starlette.responses import Response
import httpx

app = FastAPI()

NEXTJS_URL = "http://localhost:3000"

@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy_to_nextjs(request: Request, path: str):
    url = f"{NEXTJS_URL}/api/{path}"

    fwd_headers = {}
    for key, value in request.headers.items():
        if key.lower() not in ("host", "content-length"):
            fwd_headers[key] = value

    body = await request.body()

    async with httpx.AsyncClient(timeout=60.0, follow_redirects=False) as client:
        response = await client.request(
            method=request.method,
            url=url,
            headers=fwd_headers,
            content=body,
            params=dict(request.query_params),
        )

    # Create response and manually append headers (preserves multiple Set-Cookie)
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
