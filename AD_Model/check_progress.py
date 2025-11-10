"""Quick script to check pipeline progress"""
import os
from pathlib import Path

# Check cleaned data files
cleaned_dir = Path("Data/Cleaned")
if cleaned_dir.exists():
    print("\n=== CLEANED DATA FILES ===")
    files = list(cleaned_dir.glob("*.csv"))
    if files:
        for f in files:
            size_mb = f.stat().st_size / (1024 * 1024)
            print(f"✓ {f.name:<30} {size_mb:>10.2f} MB")
    else:
        print("No cleaned files yet")
else:
    print("Cleaned directory not found")

# Check feature files
features_dir = Path("Data/Features")
if features_dir.exists():
    print("\n=== FEATURE FILES ===")
    files = list(features_dir.glob("*.csv"))
    if files:
        for f in files:
            size_mb = f.stat().st_size / (1024 * 1024)
            print(f"✓ {f.name:<30} {size_mb:>10.2f} MB")
    else:
        print("No feature files yet")
else:
    print("Features directory not found")

# Check model files
models_dir = Path("Models")
if models_dir.exists():
    print("\n=== MODEL FILES ===")
    files = list(models_dir.glob("*"))
    if files:
        for f in files:
            size_kb = f.stat().st_size / 1024
            print(f"✓ {f.name:<30} {size_kb:>10.2f} KB")
    else:
        print("No model files yet")
else:
    print("Models directory not found")

print("\n" + "="*50)
