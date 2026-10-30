#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AIOps-ZeroBaran | health_monitor.py
محرك رصد صحة الخوادم — فحص دوري للـ HTTP/HTTPS endpoints و TCP ports.

الوظائف:
  - فحص HTTP/HTTPS عبر urllib (يستقبل 200/204/301 افتراضياً، قابل للتخصيص)
  - فحص TCP port عبر socket
  - يعيد الحالة (up/down/degraded) + زمن الاستجابة (ms)
  - يدعم --url, --timeout, --expected-code, --interval, --port

Usage:
  python health_monitor.py --url=https://api.example.com/health --timeout=10 --expected-code=200 --interval=60
  python health_monitor.py --url=db.example.com --port=5432 --timeout=5 --interval=30
"""
import argparse, json, os, sys, time, socket
import urllib.request, urllib.error
from datetime import datetime, timezone


class Logger:
    INFO = "\033[94m[monitor]\033[0m"
    OK = "\033[92m[OK]\033[0m"
    WARN = "\033[93m[WARN]\033[0m"
    ERR = "\033[91m[ERR]\033[0m"

    @classmethod
    def info(cls, m): print(f"{cls.INFO} {m}", flush=True)

    @classmethod
    def ok(cls, m): print(f"{cls.OK} {m}", flush=True)

    @classmethod
    def warn(cls, m): print(f"{cls.WARN} {m}", flush=True)

    @classmethod
    def err(cls, m): print(f"{cls.ERR} {m}", flush=True)


def check_http(url, timeout=10, expected_code=200):
    """فحص HTTP/HTTPS endpoint عبر urllib."""
    start = time.time()
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "AIOps-ZeroBaran/1.0"},
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            elapsed_ms = int((time.time() - start) * 1000)
            if resp.status == expected_code or (expected_code == 200 and 200 <= resp.status < 400):
                return {
                    "status": "up",
                    "code": resp.status,
                    "response_ms": elapsed_ms,
                    "method": "http",
                }
            # Response code mismatch → degraded
            return {
                "status": "degraded",
                "code": resp.status,
                "response_ms": elapsed_ms,
                "error": f"unexpected_code {resp.status} (expected {expected_code})",
                "method": "http",
            }
    except urllib.error.HTTPError as e:
        elapsed_ms = int((time.time() - start) * 1000)
        # 5xx → down, 4xx → degraded
        status = "down" if e.code >= 500 else "degraded"
        return {
            "status": status,
            "code": e.code,
            "response_ms": elapsed_ms,
            "error": f"HTTP {e.code}",
            "method": "http",
        }
    except urllib.error.URLError as e:
        elapsed_ms = int((time.time() - start) * 1000)
        return {
            "status": "down",
            "code": 0,
            "response_ms": elapsed_ms,
            "error": f"URLError: {e.reason}",
            "method": "http",
        }
    except Exception as e:
        elapsed_ms = int((time.time() - start) * 1000)
        return {
            "status": "down",
            "code": 0,
            "response_ms": elapsed_ms,
            "error": str(e),
            "method": "http",
        }


def check_tcp(host, port, timeout=10):
    """فحص اتصال TCP على منفذ معيّن."""
    start = time.time()
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect((host, int(port)))
        elapsed_ms = int((time.time() - start) * 1000)
        sock.close()
        return {
            "status": "up",
            "code": 0,
            "response_ms": elapsed_ms,
            "method": "tcp",
        }
    except socket.timeout:
        elapsed_ms = int((time.time() - start) * 1000)
        return {
            "status": "down",
            "code": 0,
            "response_ms": elapsed_ms,
            "error": "tcp_timeout",
            "method": "tcp",
        }
    except Exception as e:
        elapsed_ms = int((time.time() - start) * 1000)
        return {
            "status": "down",
            "code": 0,
            "response_ms": elapsed_ms,
            "error": str(e),
            "method": "tcp",
        }


def monitor_once(url, port=None, timeout=10, expected_code=200):
    """تنفيذ فحص واحد."""
    if port:
        # TCP mode: extract host from URL or use URL itself
        host = url.replace("https://", "").replace("http://", "").split("/")[0]
        return check_tcp(host, port, timeout)
    elif url.startswith("http://") or url.startswith("https://"):
        return check_http(url, timeout, expected_code)
    else:
        # Bare hostname → try TCP on common ports
        return check_tcp(url, 80, timeout)


def main():
    parser = argparse.ArgumentParser(
        description="AIOps-ZeroBaran Health Monitor — uptime monitoring for HTTP/HTTPS/TCP services."
    )
    parser.add_argument("--url", required=True, help="URL or hostname to monitor (e.g., https://api.example.com/health)")
    parser.add_argument("--timeout", type=int, default=10, help="Timeout in seconds (default: 10)")
    parser.add_argument("--expected-code", type=int, default=200, help="Expected HTTP status code (default: 200)")
    parser.add_argument("--interval", type=int, default=60, help="Check interval in seconds (default: 60)")
    parser.add_argument("--port", type=int, default=None, help="TCP port to check (enables TCP mode)")
    parser.add_argument("--count", type=int, default=3, help="Number of checks to perform (default: 3)")
    parser.add_argument("--output", default="health-report.json", help="Output JSON file")
    args = parser.parse_args()

    Logger.info(f"بدء مراقبة: {args.url} (timeout={args.timeout}s, interval={args.interval}s)")

    report = {
        "target": args.url,
        "port": args.port,
        "timeout": args.timeout,
        "expected_code": args.expected_code,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "checks": [],
        "summary": {"up": 0, "degraded": 0, "down": 0, "avg_response_ms": 0},
    }

    total_ms = 0
    for i in range(args.count):
        check = monitor_once(args.url, args.port, args.timeout, args.expected_code)
        check["timestamp"] = datetime.now(timezone.utc).isoformat()
        report["checks"].append(check)
        total_ms += check["response_ms"]
        report["summary"][check["status"]] = report["summary"].get(check["status"], 0) + 1

        if check["status"] == "up":
            Logger.ok(f"[{i + 1}/{args.count}] {check.get('code', 'OK')} — {check['response_ms']}ms")
        elif check["status"] == "degraded":
            Logger.warn(f"[{i + 1}/{args.count}] {check.get('code', '?')} — {check.get('error', '')}")
        else:
            Logger.err(f"[{i + 1}/{args.count}] DOWN — {check.get('error', '')}")

        if i < args.count - 1:
            time.sleep(args.interval)

    report["summary"]["avg_response_ms"] = (
        int(total_ms / args.count) if args.count else 0
    )
    report["finished_at"] = datetime.now(timezone.utc).isoformat()

    # Final status: majority vote
    final = max(
        ["up", "degraded", "down"],
        key=lambda s: report["summary"].get(s, 0),
    )
    report["final_status"] = final
    Logger.info(f"الحالة النهائية: {final.upper()} (avg {report['summary']['avg_response_ms']}ms)")

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    Logger.ok(f"تقرير: {args.output}")


if __name__ == "__main__":
    main()
