#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""AIOps-ZeroBaran | telegram_alerts.py - تنبيهات الحوادث الفورية عبر Telegram."""
import argparse, json, os, sys, urllib.request

def send_telegram(bot_token, chat_id, text):
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = json.dumps({"chat_id":chat_id,"text":text,"parse_mode":"Markdown","disable_web_page_preview":True}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type":"application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return bool(json.loads(resp.read().decode("utf-8")).get("ok"))
    except Exception as e:
        print(f"[ERR] Telegram: {e}", flush=True)
        return False

def format_incident_alert(incident):
    return f"""⚠️ *تنبيه حادثة AIOps-ZeroBaran*

🚨 *الشدة:* {incident.get('severity','?').upper()}
🖥️ *الخادم:* `{incident.get('server','?')}`
⚡ *النوع:* {incident.get('type','?')}
📋 *العنوان:* {incident.get('title','?')}

🧠 *السبب الجذري (AI):*
{incident.get('rootCause','—')[:500]}

🛠️ *الإجراء المتخذ:*
{incident.get('action','—')}

✅ *الحالة:* {incident.get('status','?')}
⏱️ *المدة:* {incident.get('duration','?')} ثانية

_AIOps-ZeroBaran — مهندس رقمي 24/7_"""

def main():
    parser = argparse.ArgumentParser(description="AIOps-ZeroBaran Telegram Alerts")
    parser.add_argument("--incident", help="JSON file with incident data")
    parser.add_argument("--inline", help="Inline JSON string")
    args = parser.parse_args()
    bot_token = os.environ.get("AIOPS_TG_TOKEN","") or os.environ.get("TELEGRAM_BOT_TOKEN","")
    chat_id = os.environ.get("AIOPS_TG_CHAT","") or os.environ.get("TELEGRAM_CHAT_ID","")
    if not bot_token or not chat_id:
        print("[ERR] AIOPS_TG_TOKEN و AIOPS_TG_CHAT مطلوبان", flush=True)
        sys.exit(1)
    incident = {}
    if args.incident and os.path.exists(args.incident):
        with open(args.incident, encoding="utf-8") as f: incident = json.load(f)
    elif args.inline:
        incident = json.loads(args.inline)
    else:
        parser.print_help(); sys.exit(1)
    text = format_incident_alert(incident)
    ok = send_telegram(bot_token, chat_id, text)
    sys.exit(0 if ok else 1)

if __name__=="__main__": main()
