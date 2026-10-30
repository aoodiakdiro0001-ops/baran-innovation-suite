#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AIOps-ZeroBaran | auto_remediation.py
طبقة الاستعادة الذاتية — تنفّذ أوامر الإصلاح آلياً (Self-Healing).

الوظائف:
  - يستقبل الحادثة + اقتراح AI
  - يحاكي تنفيذ أوامر الإصلاح (systemctl restart, clear cache, kill process, etc.)
  - يعيد: { status (success|failed), output, duration_ms, action }
  - يسجّل كل الإجراءات في log file

Usage:
  python auto_remediation.py --incident-id=INC-014 --action=restart_service --service=nginx
  python auto_remediation.py --action=clear_cache --service=redis --dry-run
"""
import argparse, json, os, sys, subprocess, time, shlex
from datetime import datetime, timezone


class Logger:
    INFO = "\033[92m[heal]\033[0m"
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


# Templates للأوامر — تُحاكى (simulated) لتفادي الإضرار بالخوادم أثناء التجارب.
REMEDIATION_ACTIONS = {
    "auto_restart": {
        "cmd": "systemctl restart {service}",
        "desc": "إعادة تشغيل الخدمة عبر systemd",
        "simulated_output": "● {service}.service restarted successfully",
    },
    "clear_cache": {
        "cmd": "redis-cli FLUSHDB --async",
        "desc": "مسح الذاكرة المؤقتة Redis (async)",
        "simulated_output": "OK (memory freed: ~6.2GB)",
    },
    "kill_process": {
        "cmd": "kill -9 {pid} && systemctl restart {service}",
        "desc": "إيقاف العملية المُستهلكة وإعادة تشغيل الخدمة",
        "simulated_output": f"Killed PID {{pid}}, restarted {{service}}",
    },
    "scale_up": {
        "cmd": "docker-compose up -d --scale {service}=3",
        "desc": "زيادة النسخ لتوزيع الحمل",
        "simulated_output": "Scaling {service}... 1 → 3 replicas active",
    },
    "failover": {
        "cmd": "docker-compose up -d {backup_service}",
        "desc": "تفعيل الخادم الاحتياطي",
        "simulated_output": "Started {backup_service} (failover active)",
    },
    "log_rotate": {
        "cmd": "logrotate -f /etc/logrotate.d/{service}",
        "desc": "تدوير السجلات لتحرير مساحة القرص",
        "simulated_output": "rotated 3 log files, freed 1.4GB",
    },
    "notify": {
        "cmd": "# notify-only (no action)",
        "desc": "تنبيه فقط دون تنفيذ",
        "simulated_output": "Notification sent (no action performed)",
    },
    "custom": {
        "cmd": "{action}",
        "desc": "أمر مخصّص",
        "simulated_output": "Custom command executed",
    },
}


def log_action(incident_id, action_type, cmd, status, duration_ms, output):
    """تسجيل الإجراء في ملف log دائم."""
    log_path = os.environ.get("AIOPS_LOG_FILE", "scanner/aiops/remediation.log")
    try:
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
    except Exception:
        pass
    entry = {
        "incident_id": incident_id,
        "action_type": action_type,
        "cmd": cmd,
        "status": status,
        "duration_ms": duration_ms,
        "output": (output or "")[:500],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception as e:
        Logger.warn(f"تعذّر كتابة log: {e}")


def execute_remediation(action_type, service="", pid="", backup_service="", incident_id="", dry_run=False, custom_cmd=""):
    """تنفيذ أو محاكاة أمر الإصلاح."""
    action = REMEDIATION_ACTIONS.get(action_type, REMEDIATION_ACTIONS["notify"])
    cmd = action["cmd"].format(service=service, pid=pid, backup_service=backup_service, action=custom_cmd)

    Logger.info(f"الإجراء: {action['desc']}")
    Logger.info(f"الأمر: {cmd}")

    if dry_run:
        Logger.warn(f"[DRY RUN] محاكاة فقط")
        return {
            "status": "skipped",
            "action_type": action_type,
            "cmd": cmd,
            "duration_ms": 0,
            "output": "[dry-run] no execution",
            "dry_run": True,
        }

    start = time.time()
    try:
        # Simulate execution (حماية من الإضرار بالخادم أثناء التجارب)
        # في بيئة الإنتاج: result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        simulated_out = action["simulated_output"].format(service=service, pid=pid, backup_service=backup_service)
        elapsed_ms = int((time.time() - start) * 1000) + 800  # محاكاة زمن تنفيذ واقعي

        # Random success (90% success rate for demo)
        import random
        success = random.random() < 0.9

        if success:
            Logger.ok(f"نجح في {elapsed_ms}ms — {simulated_out}")
            log_action(incident_id, action_type, cmd, "success", elapsed_ms, simulated_out)
            return {
                "status": "success",
                "action_type": action_type,
                "cmd": cmd,
                "duration_ms": elapsed_ms,
                "output": simulated_out,
                "success": True,
            }
        else:
            Logger.err(f"فشل: exit code 1")
            log_action(incident_id, action_type, cmd, "failed", elapsed_ms, "exit code 1")
            return {
                "status": "failed",
                "action_type": action_type,
                "cmd": cmd,
                "duration_ms": elapsed_ms,
                "output": "exit code 1 (simulated failure)",
                "success": False,
            }
    except subprocess.TimeoutExpired:
        elapsed_ms = int((time.time() - start) * 1000)
        Logger.err("انتهى الوقت (30s)")
        log_action(incident_id, action_type, cmd, "failed", elapsed_ms, "timeout")
        return {
            "status": "failed",
            "action_type": action_type,
            "cmd": cmd,
            "duration_ms": elapsed_ms,
            "error": "timeout",
            "success": False,
        }
    except Exception as e:
        elapsed_ms = int((time.time() - start) * 1000)
        Logger.err(f"خطأ: {e}")
        log_action(incident_id, action_type, cmd, "failed", elapsed_ms, str(e))
        return {
            "status": "failed",
            "action_type": action_type,
            "cmd": cmd,
            "duration_ms": elapsed_ms,
            "error": str(e),
            "success": False,
        }


def main():
    parser = argparse.ArgumentParser(
        description="AIOps-ZeroBaran Auto-Remediation — self-healing execution engine."
    )
    parser.add_argument("--incident-id", default="INC-UNKNOWN", help="Incident identifier")
    parser.add_argument(
        "--action",
        required=True,
        choices=list(REMEDIATION_ACTIONS.keys()),
        help="Remediation action type",
    )
    parser.add_argument("--service", default="", help="Service name (e.g., nginx)")
    parser.add_argument("--pid", default="", help="Process ID (for kill_process)")
    parser.add_argument("--backup", default="", help="Backup service name (for failover)")
    parser.add_argument("--cmd", default="", help="Custom command (for action=custom)")
    parser.add_argument("--dry-run", action="store_true", help="Simulate without executing")
    parser.add_argument("--output", default="remediation.json", help="Output JSON file")
    args = parser.parse_args()

    result = execute_remediation(
        action_type=args.action,
        service=args.service,
        pid=args.pid,
        backup_service=args.backup,
        incident_id=args.incident_id,
        dry_run=args.dry_run,
        custom_cmd=args.cmd,
    )
    result["incident_id"] = args.incident_id
    result["timestamp"] = datetime.now(timezone.utc).isoformat()

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    Logger.ok(f"تقرير: {args.output}")


if __name__ == "__main__":
    main()
