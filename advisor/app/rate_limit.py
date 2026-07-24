import time

from fastapi import HTTPException, Request


class RateLimiter:
    """按 key（一般是 IP）限制每分钟请求次数。"""

    def __init__(self, limit_per_minute=30):
        self.limit = limit_per_minute
        # key -> [时间戳, 时间戳, ...]
        self._hits = {}

    def check(self, key):
        now = time.time()
        window = 60.0

        if key not in self._hits:
            self._hits[key] = []

        old_list = self._hits[key]
        new_list = []
        for t in old_list:
            if now - t <= window:
                new_list.append(t)

        if len(new_list) >= self.limit:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again shortly.",
            )

        new_list.append(now)
        self._hits[key] = new_list


def client_key(request: Request):
    """尽量用真实客户端 IP 做限流 key。"""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        parts = forwarded.split(",")
        return parts[0].strip()

    if request.client is not None:
        return request.client.host

    return "unknown"
