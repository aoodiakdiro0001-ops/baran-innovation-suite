#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Data-Nexus ZeroBaran | etl_pipeline.py
================================================================
محرك ETL (Extract, Transform, Load) لتنظيف ومعالجة البيانات.
يقوم بـ:
  - استخراج البيانات من CSV/JSON/SQL/API
  - إزالة القيم المفقودة والمكررة
  - تحويل الأنواع والتطبيع
  - كشف القيم الشاذة (Outliers)
  - تصدير البيانات النظيفة

الاستخدام:
  python etl_pipeline.py --input=sales.csv --output=sales_clean.parquet
  python etl_pipeline.py --source=api --url=https://api.example.com/data
================================================================
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Any


class Logger:
    INFO = "\033[94m[ETL]\033[0m"
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


def ensure_deps() -> bool:
    """يتحقق من تثبيت pandas"""
    try:
        import pandas  # noqa
        import numpy  # noqa
        return True
    except ImportError:
        Logger.err("pandas و numpy غير مثبتين. ثبّتهما:")
        print("  pip install pandas numpy", flush=True)
        return False


# ============================================================
# استخراج البيانات (Extract)
# ============================================================
def extract_csv(file_path: str) -> "pandas.DataFrame":
    import pandas as pd
    Logger.info(f"قراءة CSV: {file_path}")
    df = pd.read_csv(file_path)
    Logger.ok(f"تم استخراج {len(df)} صف و {len(df.columns)} عمود")
    return df


def extract_json(file_path: str) -> "pandas.DataFrame":
    import pandas as pd
    Logger.info(f"قراءة JSON: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    df = pd.json_normalize(data) if isinstance(data, list) else pd.DataFrame([data])
    Logger.ok(f"تم استخراج {len(df)} صف و {len(df.columns)} عمود")
    return df


def extract_api(url: str, headers: Optional[Dict] = None) -> "pandas.DataFrame":
    """يستخرج بيانات من API endpoint"""
    import urllib.request
    import pandas as pd

    Logger.info(f"جلب من API: {url}")
    req = urllib.request.Request(url, headers=headers or {"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        # تطبيع البنية
        if isinstance(data, dict):
            # ابحث عن مفتاح يحوي قائمة
            for k in ("data", "results", "items", "records"):
                if k in data and isinstance(data[k], list):
                    data = data[k]
                    break
            else:
                data = [data]
        df = pd.json_normalize(data)
        Logger.ok(f"تم جلب {len(df)} صف من API")
        return df
    except Exception as e:
        Logger.err(f"فشل جلب API: {e}")
        raise


# ============================================================
# تنظيف البيانات (Transform)
# ============================================================
def drop_missing(df, threshold: float = 0.5) -> "pandas.DataFrame":
    """يزيل الأعمدة التي تتجاوز نسبة القيم المفقودة فيها threshold"""
    missing_pct = df.isnull().sum() / len(df)
    cols_to_drop = missing_pct[missing_pct > threshold].index.tolist()
    if cols_to_drop:
        Logger.warn(f"إزالة {len(cols_to_drop)} أعمدة (> {threshold*100}% مفقودة): {cols_to_drop}")
        df = df.drop(columns=cols_to_drop)
    return df


def drop_duplicates(df) -> "pandas.DataFrame":
    """يزيل الصفوف المكررة تماماً"""
    before = len(df)
    df = df.drop_duplicates()
    diff = before - len(df)
    if diff > 0:
        Logger.ok(f"إزالة {diff} صف مكرر")
    return df


def type_cast(df) -> "pandas.DataFrame":
    """يحاول تحويل الأعمدات إلى أنواعها الصحيحة تلقائياً"""
    import pandas as pd
    converted = 0
    for col in df.columns:
        if df[col].dtype == object:
            # جرّب numeric
            try:
                df[col] = pd.to_numeric(df[col], errors="ignore")
                if df[col].dtype != object:
                    converted += 1
                    continue
            except Exception:
                pass
            # جرّب datetime
            try:
                df[col] = pd.to_datetime(df[col], errors="ignore")
                if df[col].dtype != object:
                    converted += 1
            except Exception:
                pass
    if converted > 0:
        Logger.ok(f"تحويل {converted} عمود إلى نوع صحيح")
    return df


def detect_outliers(df, method: str = "iqr", threshold: float = 1.5) -> Dict[str, int]:
    """يكشف القيم الشاذة باستخدام IQR أو Z-score"""
    import numpy as np
    outliers = {}
    numeric_cols = df.select_dtypes(include=[np.number]).columns

    for col in numeric_cols:
        if method == "iqr":
            q1, q3 = df[col].quantile(0.25), df[col].quantile(0.75)
            iqr = q3 - q1
            lower, upper = q1 - threshold * iqr, q3 + threshold * iqr
            count = ((df[col] < lower) | (df[col] > upper)).sum()
        elif method == "zscore":
            mean, std = df[col].mean(), df[col].std()
            if std > 0:
                z = (df[col] - mean) / std
                count = (z.abs() > threshold).sum()
            else:
                count = 0
        else:
            count = 0
        if count > 0:
            outliers[col] = int(count)

    if outliers:
        Logger.warn(f"كشف {len(outliers)} أعمدة فيها قيم شاذة: {outliers}")
    return outliers


def normalize_strings(df) -> "pandas.DataFrame":
    """يطبّع النصوص (trim whitespace، توحيد الحالة للأيميلات)"""
    import pandas as pd
    str_cols = df.select_dtypes(include=["object"]).columns
    for col in str_cols:
        df[col] = df[col].astype(str).str.strip() if not df[col].isna().all() else df[col]
        if "email" in col.lower():
            df[col] = df[col].str.lower() if hasattr(df[col], "str") else df[col]
    Logger.ok(f"تطبيع {len(str_cols)} عمود نصي")
    return df


def fill_missing(df, strategy: str = "smart") -> "pandas.DataFrame":
    """يملأ القيم المفقودة بذكاء (متوسط للأرقام، أعلى تكرار للفئات)"""
    import numpy as np
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    cat_cols = df.select_dtypes(include=["object"]).columns

    filled = 0
    for col in numeric_cols:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].median())
            filled += df[col].isnull().sum() == 0

    for col in cat_cols:
        if df[col].isnull().any():
            mode = df[col].mode()
            if len(mode) > 0:
                df[col] = df[col].fillna(mode[0])
                filled += 1

    if filled > 0:
        Logger.ok(f"ملء القيم المفقودة في {filled} عمود")
    return df


# ============================================================
# الحفظ (Load)
# ============================================================
def load_to_parquet(df, output_path: str) -> None:
    """يحفظ البيانات في Parquet (مضغوط)"""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(output_path, index=False, compression="snappy")
    Logger.ok(f"تم حفظ {len(df)} صف في {output_path}")


def load_to_csv(df, output_path: str) -> None:
    """يحفظ البيانات في CSV"""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False, encoding="utf-8")
    Logger.ok(f"تم حفظ {len(df)} صف في {output_path}")


# ============================================================
# خط المعالجة الكامل
# ============================================================
def run_pipeline(input_path: str, output_path: str, source: str = "csv", api_url: str = None) -> Dict:
    """ينفّذ خط ETL الكامل"""
    Logger.info("=" * 60)
    Logger.info("Data-Nexus ZeroBaran — ETL Pipeline")
    Logger.info(f"  المدخل: {input_path or api_url}")
    Logger.info(f"  المخرج: {output_path}")
    Logger.info("=" * 60)

    start = time.time()

    # 1) استخراج
    if source == "csv":
        df = extract_csv(input_path)
    elif source == "json":
        df = extract_json(input_path)
    elif source == "api" and api_url:
        df = extract_api(api_url)
    else:
        raise ValueError("مصدر غير مدعوم")

    initial_rows = len(df)

    # 2) تنظيف
    df = drop_duplicates(df)
    df = type_cast(df)
    df = normalize_strings(df)
    df = drop_missing(df, threshold=0.7)
    df = fill_missing(df)

    # 3) كشف الشذوذ
    outliers = detect_outliers(df, method="iqr")

    # 4) حساب جودة البيانات
    missing_pct = (df.isnull().sum().sum() / (df.size if df.size > 0 else 1)) * 100
    quality_score = max(0, 100 - int(missing_pct) - len(outliers) * 2)

    # 5) حفظ
    if output_path.endswith(".parquet"):
        load_to_parquet(df, output_path)
    else:
        load_to_csv(df, output_path)

    duration_ms = int((time.time() - start) * 1000)
    Logger.ok(f"اكتمل ETL في {duration_ms}ms — جودة البيانات: {quality_score}%")

    return {
        "input": input_path or api_url,
        "output": output_path,
        "initial_rows": initial_rows,
        "final_rows": len(df),
        "columns": len(df.columns),
        "quality_score": quality_score,
        "outliers": outliers,
        "duration_ms": duration_ms,
    }


def main():
    parser = argparse.ArgumentParser(description="Data-Nexus ZeroBaran ETL Pipeline")
    parser.add_argument("--input", help="مسار ملف المدخل")
    parser.add_argument("--output", default="output_clean.parquet", help="مسار المخرج")
    parser.add_argument("--source", default="csv", choices=["csv", "json", "sql", "api"], help="نوع المصدر")
    parser.add_argument("--url", help="رابط API (إذا source=api)")
    args = parser.parse_args()

    if not ensure_deps():
        sys.exit(1)

    if args.source == "api" and args.url:
        result = run_pipeline(None, args.output, args.source, args.url)
    elif args.input:
        result = run_pipeline(args.input, args.output, args.source)
    else:
        parser.print_help()
        sys.exit(1)

    # حفظ تقرير
    report_path = args.output.replace(".parquet", "").replace(".csv", "") + "_report.json"
    Path(report_path).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    Logger.ok(f"تقرير ETL محفوظ في: {report_path}")


if __name__ == "__main__":
    main()
