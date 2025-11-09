from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent

# Data directories
DATA_DIR = BASE_DIR / "Data"
RAW_DATA_DIR = DATA_DIR / "Raw"
CLEANED_DATA_DIR = DATA_DIR / "Cleaned"
PROCESSED_DATA_DIR = DATA_DIR / "Processed"
FEATURES_DIR = DATA_DIR / "Features"
MODELS_DIR = BASE_DIR / "Models"
OUTPUTS_DIR = BASE_DIR / "Outputs"

# Create directories if they don't exist
for directory in [CLEANED_DATA_DIR, PROCESSED_DATA_DIR, FEATURES_DIR, MODELS_DIR, OUTPUTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# File paths
RAW_FILES = {
    'users': RAW_DATA_DIR / 'users.csv',
    'logon': RAW_DATA_DIR / 'logon.csv',
    'device': RAW_DATA_DIR / 'device.csv',
    'email': RAW_DATA_DIR / 'email.csv',
    'file': RAW_DATA_DIR / 'file.csv',
    'decoy': RAW_DATA_DIR / 'decoy_file.csv'
}

# Model parameters
MODEL_PARAMS = {
    'isolation_forest': {
        'n_estimators': 100,
        'contamination': 0.1,  # Expected proportion of anomalies
        'random_state': 42,
        'n_jobs': -1
    }
}

# Feature engineering parameters
FEATURE_PARAMS = {
    'time_windows': ['1H', '1D', '7D'],  # Time windows for aggregation
    'activity_thresholds': {
        'login_frequency': 3,  # Max logins per hour
        'file_access_frequency': 20,  # Max file accesses per hour
        'email_volume': 30,  # Max emails per hour
        'after_hours_activity': True  # Flag for after-hours activity
    }
}

# Alert thresholds
ALERT_THRESHOLDS = {
    'high_risk': 0.8,  # Anomaly score threshold for high risk
    'medium_risk': 0.6,  # Anomaly score threshold for medium risk
    'low_risk': 0.4   # Anomaly score threshold for low risk
}
