#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Data-Nexus ZeroBaran | anomaly_detector.py
================================================================
كاشف الشذوذ الإحصائي. يدعم 3 طرق:
  - Z-Score (تقليدي)
  - IQR - النطاق الربيعي (موصى به)
  - Isolation Forest (ML)

الاستخدام:
  python anomaly_detector.py --metric=sales --values=100,200,300,9000
  python anomaly_detector.py --file=metrics.json
================================================================
"""

import argparse
import json
import sys
import statistics
from pathlib import Path
from typing import List, Dict


class Logger:
    INFO = "\033[94m[anomaly]\033[0m"
    OK = "\033[92m[OK]\033[0m"
    WARN = "\033[93m[WARN]\033[0m"
    ERR = "\033[91m[ERR]\033[0m"

    @classmethod
    def info(cls, msg): print(f"{cls.INFO} {msg}", flush=True)
    @classmethod
    def ok(cls, msg): print(f"{cls.OK} {msg}", flush=True)
    @classmethod
    def warn(cls, msg): print(f"{cls.WARN} {msg}", flush=True)
    @classmethod
    def err(cls, msg): print(f"{cls.ERR} {msg}", flush=True)


def detect_zscore(values: List[float], threshold: float = 3.0) -> List[int]:
    """يكشف الشذوذ باستخدام Z-score"""
    if len(values) < 3:
        return []
    mean = statistics.mean(values)
    std = statistics.stdev(values)
    if std == 0:
        return []
    return [i for i, v in enumerate(values) if abs((v - mean) / std) > threshold]


def detect_iqr(values: List[float], threshold: float = 1.5) -> List[int]:
    """يكشف الشذوذ باستخدام IQR"""
    if len(values) < 4:
        return []
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    q1 = sorted_vals[n // 4]
    q3 = sorted_vals[3 * n // 4]
    iqr = q3 - q1
    lower = q1 - threshold * iqr
    upper = q3 + threshold * iqr
    return [i for i, v in enumerate(values) if v < lower or v > upper]


def detect_isolation_forest(values: List[float]) -> List[int]:
    """يكشف الشذوذ باستخدام Isolation Forest (إذا sklearn متوفر)"""
    try:
        import numpy as np
        from sklearn.ensemble import IsolationForest
        if len(values) < 10:
            return []
        X = np.array(values).reshape(-1, 1)
        clf = IsolationForest(contamination=0.1, random_state=42)
        preds = clf.fit_predict(X)
        return [i for i, p in enumerate(preds) if p == -1]
    except ImportError:
        Logger.warn("sklearn غير مثبت. Fallback إلى IQR")
        return detect_iqr(values)


def detect_anomalies(metric: str, values: List[float], method: str = "iqr", threshold: float = 1.5) -> Dict:
    """يكشف الشذوذ لمقياس معيّن"""
    Logger.info(f"كشف الشذوذ لمقياس '{metric}' باستخدام {method}")

    if method == "zscore":
        indices = detect_zscore(values, threshold)
    elif method == "iqr":
        indices = detect_iqr(values, threshold)
    elif method == "isolation_forest":
        indices = detect_isolation_forest(values)
    else:
        indices = detect_iqr(values)

    if indices:
        Logger.warn(f"كشف {len(indices)} شذوذ في '{metric}'")
        for i in indices:
            Logger.warn(f"  القيمة #{i}: {values[i]} (المتوقع: {min(values):.2f} - {max(values):.2f})")
    else:
        Logger.ok(f"لا شذوذ في '{metric}' — كل القيم ضمن النطاق المتوقع")

    return {
        "metric": metric,
        "method": method,
        "total_values": len(values),
        "anomalies_count": len(indices),
        "anomaly_indices": indices,
        "anomaly_values": [values[i] for i in indices],
        "normal_range": [min(values), max(values)] if values else [0, 0],
    }


def main():
    parser = argparse.ArgumentParser(description="Data-Nexus Anomaly Detector")
    parser.add_argument("--metric", help="اسم المقياس")
    parser.add_argument("--values", help="قائمة قيم مفصولة بفواصل")
    parser.add_argument("--file", help="ملف JSON: {metric: [values]}")
    parser.add_argument("--method", default="iqr", choices=["zscore", "iqr", "isolation_forest"])
    parser.add_argument("--threshold", type=float, default=1.5, help="عتبة الكشف (σ للـ zscore، multiplier للـ iqr)")
    parser.add_argument("--output", default="anomalies.json")
    args = parser.parse_args()

    results = []

    if args.file and Path(args.file).exists():
        data = json.loads(Path(args.file).read_text(encoding="utf-8"))
        for metric, values in data.items():
            results.append(detect_anomalies(metric, values, args.method, args.threshold))
    elif args.metric and args.values:
        values = [float(v.strip()) for v in args.values.split(",") if v.strip()]
        results.append(detect_anomalies(args.metric, values, args.method, args.threshold))
    else:
        parser.print_help()
        sys.exit(1)

    Path(args.output).write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    Logger.ok(f"تم حفظ النتائج في {args.output}")

    total = sum(r["anomalies_count"] for r in results)
    print(f"::set-output name=anomalies_count::{total}")


if __name__ == "__main__":
    main()
