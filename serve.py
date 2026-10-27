#!/usr/bin/env python3
"""Local static server with proxy for ebook/udebook assets from production."""

from __future__ import annotations

import mimetypes
import os
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.abspath(__file__))
UPSTREAM = "https://ugconclave.mp.gov.in"
PORT = int(os.environ.get("PORT", "8080"))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "public, max-age=300")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def do_GET(self):
        if self._should_proxy():
            self._proxy_upstream()
            return
        super().do_GET()

    def do_HEAD(self):
        if self._should_proxy():
            self._proxy_upstream(head_only=True)
            return
        super().do_HEAD()

    def _should_proxy(self):
        path = self.path.split("?", 1)[0]
        if not path.startswith("/ebook/udebook/"):
            return False
        local = os.path.join(ROOT, path.lstrip("/"))
        return not os.path.isfile(local)

    def _proxy_upstream(self, head_only=False):
        path = self.path.split("?", 1)[0]
        url = UPSTREAM + path
        req = urllib.request.Request(
            url,
            method="HEAD" if head_only else "GET",
            headers={"User-Agent": "UrbanConclave-LocalProxy/1.0"},
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                data = b"" if head_only else resp.read()
                content_type = resp.headers.get("Content-Type")
                if not content_type:
                    content_type = mimetypes.guess_type(path)[0] or "application/octet-stream"
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                if not head_only:
                    self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                if not head_only:
                    self.wfile.write(data)
        except urllib.error.HTTPError as err:
            body = err.read() if not head_only else b""
            self.send_response(err.code)
            self.send_header("Content-Type", err.headers.get("Content-Type", "text/plain"))
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if body:
                self.wfile.write(body)
        except Exception as err:
            message = ("Proxy error: %s" % err).encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(message)))
            self.end_headers()
            self.wfile.write(message)

    def log_message(self, fmt, *args):
        sys_stderr = __import__("sys").stderr
        sys_stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))


def main():
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print("Urban Conclave local server")
    print("  http://127.0.0.1:%s/ebook.html" % PORT)
    print("  Proxying missing /ebook/udebook/* from %s" % UPSTREAM)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
