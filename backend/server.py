from fastapi import FastAPI, Request
from fastapi.responses import Response
import httpx

app = FastAPI()

NEXTJS_URL = "http://localhost:3000"

@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy_to_nextjs(request: Request, path: str):
    url = f"{NEXTJS_URL}/api/{path}"
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None)
    body = await request.body()

    async with httpx.AsyncClient(timeout=60.0, follow_redirects=False) as client:
        response = await client.request(
            method=request.method,
            url=url,
            headers=headers,
            content=body,
            params=dict(request.query_params),
        )

    # Build response headers preserving all Set-Cookie headers
    resp_headers = {}
    for key, value in response.headers.multi_items():
        if key.lower() in ("transfer-encoding", "content-encoding", "content-length"):
            continue
        if key.lower() == "set-cookie":
            # Append to existing or create new
            if "set-cookie" in resp_headers:
                resp_headers["set-cookie"] += f", {value}"
            else:
                resp_headers["set-cookie"] = value
        else:
            resp_headers[key] = value

    return Response(
        content=response.content,
        status_code=response.status_code,
        headers=resp_headers,
    )
