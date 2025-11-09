"""
Quick feature extraction for insider threat detection
Extracts behavioral features from cleaned data
"""
import pandas as pd
import numpy as np
import os
import sys
import logging
from pathlib import Path
from datetime import time

sys.path.insert(0, str(Path(__file__).parent))
from Src import config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_cleaned_data():
    """Load all cleaned data files."""
    logger.info("Loading cleaned data...")
    data = {}
    
    files = {
        'users': 'users_cleaned.csv',
        'logon': 'logon_cleaned.csv',
        'device': 'device_cleaned.csv',
        'email': 'email_cleaned.csv',
        'file': 'file_cleaned.csv',
        'decoy': 'decoy_cleaned.csv'
    }
    
    for name, filename in files.items():
        file_path = config.CLEANED_DATA_DIR / filename
        if file_path.exists():
            data[name] = pd.read_csv(file_path)
            # Convert timestamp columns
            if 'timestamp' in data[name].columns:
                data[name]['timestamp'] = pd.to_datetime(data[name]['timestamp'])
            logger.info(f"  Loaded {name}: {data[name].shape}")
        else:
            logger.warning(f"  File not found: {filename}")
    
    return data

def extract_logon_features(logon_df):
    """Extract features from logon data."""
    logger.info("Extracting logon features...")
    
    features = logon_df.groupby('user_id').agg({
        'logon_id': 'count',  # Total logons
        'device_id': 'nunique',  # Unique devices used
        'logon_type': lambda x: x.value_counts().to_dict()  # Logon type distribution
    }).reset_index()
    
    features.columns = ['user_id', 'total_logons', 'unique_devices_logon', 'logon_types']
    
    # Add time-based features
    logon_df['hour'] = logon_df['timestamp'].dt.hour
    logon_df['day_of_week'] = logon_df['timestamp'].dt.dayofweek
    logon_df['is_weekend'] = logon_df['day_of_week'].isin([5, 6]).astype(int)
    logon_df['is_after_hours'] = ((logon_df['hour'] < 8) | (logon_df['hour'] > 18)).astype(int)
    
    time_features = logon_df.groupby('user_id').agg({
        'is_weekend': 'sum',
        'is_after_hours': 'sum',
        'hour': ['mean', 'std']
    }).reset_index()
    
    time_features.columns = ['user_id', 'weekend_logons', 'after_hours_logons', 
                             'avg_logon_hour', 'std_logon_hour']
    
    features = pd.merge(features, time_features, on='user_id', how='left')
    
    logger.info(f"  Logon features shape: {features.shape}")
    return features

def extract_email_features(email_df):
    """Extract features from email data."""
    logger.info("Extracting email features...")
    
    features = email_df.groupby('sender_id').agg({
        'email_id': 'count',  # Total emails sent
        'recipient_id': 'nunique',  # Unique recipients
        'has_attachments': 'sum',  # Emails with attachments
        'email_size': ['mean', 'sum', 'max']  # Email size statistics
    }).reset_index()
    
    features.columns = ['user_id', 'total_emails_sent', 'unique_recipients', 
                       'emails_with_attachments', 'avg_email_size', 
                       'total_email_size', 'max_email_size']
    
    # Add time-based features
    email_df['hour'] = email_df['timestamp'].dt.hour
    email_df['is_after_hours'] = ((email_df['hour'] < 8) | (email_df['hour'] > 18)).astype(int)
    
    time_features = email_df.groupby('sender_id').agg({
        'is_after_hours': 'sum'
    }).reset_index()
    time_features.columns = ['user_id', 'after_hours_emails']
    
    features = pd.merge(features, time_features, on='user_id', how='left')
    
    logger.info(f"  Email features shape: {features.shape}")
    return features

def extract_file_features(file_df):
    """Extract features from file access data."""
    logger.info("Extracting file features...")
    
    features = file_df.groupby('user_id').agg({
        'file_event_id': 'count',  # Total file operations
        'filename': 'nunique',  # Unique files accessed
        'device_id': 'nunique',  # Unique devices for file access
        'activity_type': lambda x: x.value_counts().to_dict()  # Activity distribution
    }).reset_index()
    
    features.columns = ['user_id', 'total_file_ops', 'unique_files', 
                       'unique_devices_file', 'file_activities']
    
    # Add removable media features if available
    if 'to_removable_media' in file_df.columns:
        file_df['to_removable_media'] = pd.to_numeric(file_df['to_removable_media'], errors='coerce').fillna(0)
        file_df['from_removable_media'] = pd.to_numeric(file_df['from_removable_media'], errors='coerce').fillna(0)
        
        removable_features = file_df.groupby('user_id').agg({
            'to_removable_media': 'sum',
            'from_removable_media': 'sum'
        }).reset_index()
        removable_features.columns = ['user_id', 'files_to_removable', 'files_from_removable']
        features = pd.merge(features, removable_features, on='user_id', how='left')
    
    # Add time-based features
    file_df['hour'] = file_df['timestamp'].dt.hour
    file_df['is_after_hours'] = ((file_df['hour'] < 8) | (file_df['hour'] > 18)).astype(int)
    
    time_features = file_df.groupby('user_id').agg({
        'is_after_hours': 'sum'
    }).reset_index()
    time_features.columns = ['user_id', 'after_hours_file_ops']
    
    features = pd.merge(features, time_features, on='user_id', how='left')
    
    logger.info(f"  File features shape: {features.shape}")
    return features

def extract_device_features(device_df):
    """Extract features from device data."""
    logger.info("Extracting device features...")
    
    features = device_df.groupby('user_id').agg({
        'device_event_id': 'count',  # Total device events
        'device_id': 'nunique',  # Unique devices
        'activity_type': lambda x: x.value_counts().to_dict()  # Activity distribution
    }).reset_index()
    
    features.columns = ['user_id', 'total_device_events', 'unique_devices_used', 'device_activities']
    
    logger.info(f"  Device features shape: {features.shape}")
    return features

def mark_decoy_access(features, decoy_df, file_df):
    """Mark users who accessed decoy files."""
    logger.info("Marking decoy file access...")
    
    if decoy_df is not None and not decoy_df.empty:
        # Get decoy filenames
        decoy_files = set(decoy_df['decoy_filename'].unique())
        
        # Find users who accessed decoy files
        if 'filename' in file_df.columns:
            decoy_access = file_df[file_df['filename'].isin(decoy_files)]
            suspicious_users = set(decoy_access['user_id'].unique())
            
            features['accessed_decoy'] = features['user_id'].isin(suspicious_users).astype(int)
            logger.info(f"  Found {len(suspicious_users)} users who accessed decoy files")
        else:
            features['accessed_decoy'] = 0
    else:
        features['accessed_decoy'] = 0
    
    return features

def combine_features(data):
    """Combine all features into a single dataframe."""
    logger.info("\nCombining all features...")
    
    # Extract features from each data source
    logon_features = extract_logon_features(data['logon']) if 'logon' in data else None
    email_features = extract_email_features(data['email']) if 'email' in data else None
    file_features = extract_file_features(data['file']) if 'file' in data else None
    device_features = extract_device_features(data['device']) if 'device' in data else None
    
    # Start with user list
    all_features = data['users'][['user_id']].copy()
    
    # Merge all features
    if logon_features is not None:
        all_features = pd.merge(all_features, logon_features, on='user_id', how='left')
    
    if email_features is not None:
        all_features = pd.merge(all_features, email_features, on='user_id', how='left')
    
    if file_features is not None:
        all_features = pd.merge(all_features, file_features, on='user_id', how='left')
    
    if device_features is not None:
        all_features = pd.merge(all_features, device_features, on='user_id', how='left')
    
    # Mark decoy access
    if 'decoy' in data and 'file' in data:
        all_features = mark_decoy_access(all_features, data['decoy'], data['file'])
    else:
        all_features['accessed_decoy'] = 0
    
    # Fill NaN values with 0
    numeric_cols = all_features.select_dtypes(include=[np.number]).columns
    all_features[numeric_cols] = all_features[numeric_cols].fillna(0)
    
    # Drop non-numeric columns for ML
    ml_features = all_features.select_dtypes(include=[np.number])
    
    logger.info(f"\nFinal feature shape: {ml_features.shape}")
    logger.info(f"Features: {list(ml_features.columns)}")
    
    return all_features, ml_features

def save_features(all_features, ml_features):
    """Save extracted features."""
    logger.info("\nSaving features...")
    
    os.makedirs(config.FEATURES_DIR, exist_ok=True)
    
    # Save all features (including categorical)
    all_path = config.FEATURES_DIR / 'all_features.csv'
    all_features.to_csv(all_path, index=False)
    logger.info(f"  Saved all features to {all_path}")
    
    # Save ML-ready features (numeric only)
    ml_path = config.FEATURES_DIR / 'ml_features.csv'
    ml_features.to_csv(ml_path, index=False)
    logger.info(f"  Saved ML features to {ml_path}")
    
    return all_path, ml_path

def main():
    """Run feature extraction pipeline."""
    logger.info("="*60)
    logger.info("STARTING FEATURE EXTRACTION")
    logger.info("="*60)
    
    try:
        # Load cleaned data
        data = load_cleaned_data()
        
        # Extract and combine features
        all_features, ml_features = combine_features(data)
        
        # Save features
        save_features(all_features, ml_features)
        
        logger.info("\n" + "="*60)
        logger.info("FEATURE EXTRACTION COMPLETED SUCCESSFULLY!")
        logger.info("="*60)
        
        return True
        
    except Exception as e:
        logger.error(f"\nFeature extraction failed: {str(e)}", exc_info=True)
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
