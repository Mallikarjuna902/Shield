import pandas as pd
import numpy as np
from datetime import datetime, time
import os
from Src import config
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FeatureExtractor:
    def __init__(self):
        self.cleaned_data = {}
        self.features = {}
        
    def load_cleaned_data(self):
        """Load cleaned data files."""
        logger.info("Loading cleaned data...")
        cleaned_files = {
            'users': 'users_cleaned.csv',
            'logon': 'logon_cleaned.csv',
            'device': 'device_cleaned.csv',
            'email': 'email_cleaned.csv',
            'file': 'file_cleaned.csv',
            'decoy': 'decoy_file_cleaned.csv'
        }
        
        for name, filename in cleaned_files.items():
            file_path = config.CLEANED_DATA_DIR / filename
            if file_path.exists():
                self.cleaned_data[name] = pd.read_csv(file_path, parse_dates=True, infer_datetime_format=True)
                # Convert timestamp columns to datetime if they exist
                for col in self.cleaned_data[name].columns:
                    if 'time' in col.lower() or 'date' in col.lower():
                        self.cleaned_data[name][col] = pd.to_datetime(self.cleaned_data[name][col])
                logger.info(f"Loaded {name} with shape {self.cleaned_data[name].shape}")
            else:
                logger.warning(f"Cleaned data file not found: {file_path}")
    
    def extract_user_activity_features(self):
        """Extract user activity features from logon data."""
        if 'logon' not in self.cleaned_data:
            logger.error("Logon data not available for feature extraction")
            return
            
        logon_df = self.cleaned_data['logon'].copy()
        
        # Set timestamp as index for time-based operations
        logon_df = logon_df.set_index('timestamp').sort_index()
        
        # Feature 1: Logon counts by time window
        features_list = []
        for window in config.FEATURE_PARAMS['time_windows']:
            # Count logons per user per time window
            logon_counts = logon_df.groupby(['user', pd.Grouper(freq=window)])['action'].count().reset_index()
            logon_counts = logon_counts.rename(columns={'action': f'logon_count_{window}'})
            features_list.append(logon_counts)
        
        # Merge all features
        features = features_list[0]
        for df in features_list[1:]:
            features = pd.merge(features, df, on=['user', 'timestamp'], how='outer')
        
        # Fill NaN values with 0
        features = features.fillna(0)
        
        # Feature 2: Session duration statistics
        # For each logon, find the next logoff for the same user
        logon_events = logon_df[logon_df['action'] == 'Logon']
        logoff_events = logon_df[logon_df['action'] == 'Logoff']
        
        session_durations = []
        for user in logon_events['user'].unique():
            user_logons = logon_events[logon_events['user'] == user]
            user_logoffs = logoff_events[logoff_events['user'] == user]
            
            for _, logon in user_logons.iterrows():
                next_logoff = user_logoffs[user_logoffs.index > logon.name]
                if not next_logoff.empty:
                    duration = (next_logoff.index[0] - logon.name).total_seconds() / 60  # in minutes
                    session_durations.append({
                        'user': user,
                        'timestamp': logon.name,
                        'session_duration_min': duration
                    })
        
        if session_durations:
            session_df = pd.DataFrame(session_durations)
            session_features = session_df.groupby('user')['session_duration_min'].agg(
                ['mean', 'std', 'max', 'min']
            ).reset_index()
            session_features.columns = ['user', 'avg_session_duration', 'std_session_duration', 
                                      'max_session_duration', 'min_session_duration']
            
            # Merge with existing features
            features = pd.merge(features, session_features, on='user', how='left')
        
        self.features['user_activity'] = features
        logger.info(f"Extracted user activity features: {features.shape}")
    
    def extract_file_access_features(self):
        """Extract file access patterns."""
        if 'file' not in self.cleaned_data:
            logger.error("File access data not available for feature extraction")
            return
            
        file_df = self.cleaned_data['file'].copy()
        file_df['timestamp'] = pd.to_datetime(file_df['timestamp'])
        file_df = file_df.set_index('timestamp').sort_index()
        
        features_list = []
        
        # Feature 1: File access counts by time window
        for window in config.FEATURE_PARAMS['time_windows']:
            # Count file operations per user per time window
            file_counts = file_df.groupby(['user', pd.Grouper(freq=window)])['action'].count().reset_index()
            file_counts = file_counts.rename(columns={'action': f'file_ops_count_{window}'})
            features_list.append(file_counts)
        
        # Feature 2: Unique files accessed
        unique_files = file_df.groupby(['user', pd.Grouper(freq='1D')])['filename'].nunique().reset_index()
        unique_files = unique_files.rename(columns={'filename': 'unique_files_accessed'})
        features_list.append(unique_files)
        
        # Feature 3: File operation types
        op_types = pd.get_dummies(file_df['action'], prefix='file_op')
        op_types['user'] = file_df['user'].values
        op_types['timestamp'] = file_df.index
        op_aggregated = op_types.groupby(['user', pd.Grouper(key='timestamp', freq='1D')]).sum().reset_index()
        features_list.append(op_aggregated)
        
        # Merge all features
        features = features_list[0]
        for df in features_list[1:]:
            features = pd.merge(features, df, on=['user', 'timestamp'], how='outer')
        
        # Fill NaN values with 0
        features = features.fillna(0)
        
        self.features['file_access'] = features
        logger.info(f"Extracted file access features: {features.shape}")
    
    def extract_email_features(self):
        """Extract email communication patterns."""
        if 'email' not in self.cleaned_data:
            logger.error("Email data not available for feature extraction")
            return
            
        email_df = self.cleaned_data['email'].copy()
        email_df['timestamp'] = pd.to_datetime(email_df['timestamp'])
        email_df = email_df.set_index('timestamp').sort_index()
        
        features_list = []
        
        # Feature 1: Email counts by time window
        for window in config.FEATURE_PARAMS['time_windows']:
            email_counts = email_df.groupby(['from', pd.Grouper(freq=window)])['to'].count().reset_index()
            email_counts = email_counts.rename(columns={
                'from': 'user',
                'to': f'emails_sent_{window}'
            })
            features_list.append(email_counts)
        
        # Feature 2: Unique recipients
        email_df['recipients'] = email_df['to'] + ',' + email_df['cc'].fillna('') + ',' + email_df['bcc'].fillna('')
        email_df['num_recipients'] = email_df['recipients'].apply(lambda x: len([r for r in str(x).split(',') if r.strip()]))
        
        recipient_stats = email_df.groupby(['from', pd.Grouper(freq='1D')])['num_recipients'].agg(
            ['sum', 'mean', 'max']
        ).reset_index()
        recipient_stats.columns = ['user', 'timestamp', 'total_recipients', 'avg_recipients', 'max_recipients']
        features_list.append(recipient_stats)
        
        # Feature 3: Email sizes
        if 'size' in email_df.columns:
            size_stats = email_df.groupby(['from', pd.Grouper(freq='1D')])['size'].agg(
                ['sum', 'mean', 'max']
            ).reset_index()
            size_stats.columns = ['user', 'timestamp', 'total_email_size', 'avg_email_size', 'max_email_size']
            features_list.append(size_stats)
        
        # Merge all features
        features = features_list[0]
        for df in features_list[1:]:
            features = pd.merge(features, df, on=['user', 'timestamp'], how='outer')
        
        # Fill NaN values with 0
        features = features.fillna(0)
        
        self.features['email_activity'] = features
        logger.info(f"Extracted email activity features: {features.shape}")
    
    def extract_device_usage_features(self):
        """Extract device usage patterns."""
        if 'device' not in self.cleaned_data:
            logger.error("Device data not available for feature extraction")
            return
            
        device_df = self.cleaned_data['device'].copy()
        device_df['timestamp'] = pd.to_datetime(device_df['timestamp'])
        device_df = device_df.set_index('timestamp').sort_index()
        
        # Feature 1: Device connect/disconnect counts
        device_events = pd.get_dummies(device_df['action'])
        device_events['user'] = device_df['user'].values
        device_events['timestamp'] = device_df.index
        
        # Aggregate by user and time window
        features_list = []
        for window in config.FEATURE_PARAMS['time_windows']:
            device_agg = device_events.groupby(['user', pd.Grouper(key='timestamp', freq=window)]).sum().reset_index()
            device_agg = device_agg.rename(columns={
                'Connect': f'device_connects_{window}',
                'Disconnect': f'device_disconnects_{window}'
            })
            features_list.append(device_agg)
        
        # Feature 2: Unique devices used
        unique_devices = device_df.groupby(['user', pd.Grouper(freq='1D')])['device'].nunique().reset_index()
        unique_devices = unique_devices.rename(columns={
            'device': 'unique_devices_used'
        })
        features_list.append(unique_devices)
        
        # Merge all features
        features = features_list[0]
        for df in features_list[1:]:
            features = pd.merge(features, df, on=['user', 'timestamp'], how='outer')
        
        # Fill NaN values with 0
        features = features.fillna(0)
        
        self.features['device_usage'] = features
        logger.info(f"Extracted device usage features: {features.shape}")
    
    def combine_all_features(self):
        """Combine all extracted features into a single DataFrame."""
        if not self.features:
            logger.error("No features extracted yet")
            return
        
        # Start with user activity features as base
        if 'user_activity' in self.features:
            all_features = self.features['user_activity']
        else:
            logger.error("User activity features not available")
            return
        
        # Merge with other feature sets
        for feature_name, feature_df in self.features.items():
            if feature_name != 'user_activity':
                all_features = pd.merge(
                    all_features,
                    feature_df,
                    on=['user', 'timestamp'],
                    how='outer'
                )
        
        # Fill NaN values with appropriate defaults
        numeric_cols = all_features.select_dtypes(include=[np.number]).columns
        all_features[numeric_cols] = all_features[numeric_cols].fillna(0)
        
        # Sort by user and timestamp
        all_features = all_features.sort_values(['user', 'timestamp'])
        
        # Add time-based features
        all_features['hour_of_day'] = all_features['timestamp'].dt.hour
        all_features['day_of_week'] = all_features['timestamp'].dt.dayofweek
        all_features['is_weekend'] = all_features['day_of_week'].isin([5, 6]).astype(int)
        
        # Mark business hours (9 AM to 5 PM)
        all_features['is_business_hours'] = all_features['hour_of_day'].between(9, 17).astype(int)
        
        self.combined_features = all_features
        logger.info(f"Combined all features: {all_features.shape}")
    
    def save_features(self):
        """Save extracted features to disk."""
        if not hasattr(self, 'combined_features'):
            logger.error("No features to save. Run combine_all_features() first.")
            return
        
        # Create features directory if it doesn't exist
        config.FEATURES_DIR.mkdir(parents=True, exist_ok=True)
        
        # Save combined features
        output_path = config.FEATURES_DIR / "all_features.csv"
        self.combined_features.to_csv(output_path, index=False)
        logger.info(f"Saved combined features to {output_path}")
        
        # Also save individual feature sets for reference
        for name, df in self.features.items():
            output_path = config.FEATURES_DIR / f"{name}_features.csv"
            df.to_csv(output_path, index=False)
            logger.info(f"Saved {name} features to {output_path}")
    
    def run(self):
        """Run the feature extraction pipeline."""
        self.load_cleaned_data()
        
        # Extract different types of features
        self.extract_user_activity_features()
        self.extract_file_access_features()
        self.extract_email_features()
        self.extract_device_usage_features()
        
        # Combine all features
        self.combine_all_features()
        
        # Save features to disk
        self.save_features()
        
        logger.info("Feature extraction completed successfully!")
        return self.combined_features

if __name__ == "__main__":
    extractor = FeatureExtractor()
    features = extractor.run()
