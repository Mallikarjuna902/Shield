import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
from Src import config
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define column mappings for each file type
COLUMN_MAPPINGS = {
    'users': {
        'id': 'user_id',
        'email': 'email',
        'role': 'role',
        'projects': 'projects',
        'business_unit': 'business_unit',
        'functional_unit': 'functional_unit',
        'department': 'department',
        'team': 'team',
        'supervisor': 'supervisor_id',
        'start_date': 'start_date',
        'end_date': 'end_date'
    },
    'logon': {
        'id': 'logon_id',
        'date': 'timestamp',
        'user': 'user_id',
        'pc': 'device_id',
        'activity': 'logon_type'
    },
    'device': {
        'id': 'device_event_id',
        'date': 'timestamp',
        'user': 'user_id',
        'pc': 'device_id',
        'file_tree': 'file_path',
        'activity': 'activity_type'
    },
    'email': {
        'id': 'email_id',
        'date': 'timestamp',
        'user': 'sender_id',
        'to': 'recipient_id',
        'cc': 'cc_recipients',
        'bcc': 'bcc_recipients',
        'subject': 'subject',
        'body': 'body',
        'attachments': 'has_attachments',
        'size': 'email_size',
        'sensitivity': 'sensitivity',
        'importance': 'importance'
    },
    'file': {
        'id': 'file_event_id',
        'date': 'timestamp',
        'user': 'user_id',
        'pc': 'device_id',
        'filename': 'filename',
        'file_path': 'file_path',
        'activity': 'activity_type',
        'size': 'file_size',
        'sensitivity': 'sensitivity'
    },
    'decoy_file': {
        'decoy_filename': 'decoy_filename',
        'pc': 'device_id'
    }
}

class DataCleaner:
    def __init__(self):
        self.raw_data = {}
        self.cleaned_data = {}
    
    def load_data(self):
        """Load all raw data files."""
        logger.info("Loading raw data...")
        for name, path in config.RAW_FILES.items():
            if path.exists():
                try:
                    # Read CSV with optimized settings for faster loading
                    self.raw_data[name] = pd.read_csv(
                        path, 
                        low_memory=False,
                        engine='c',  # Use faster C engine
                        na_filter=True,  # Enable NA filtering
                        dtype_backend='numpy_nullable'  # Use nullable dtypes
                    )
                    logger.info(f"Loaded {name} with shape {self.raw_data[name].shape}")
                except Exception as e:
                    logger.error(f"Error loading {name}: {str(e)}")
                    raise
            else:
                logger.warning(f"File not found: {path}")
    
    def clean_users_data(self):
        """Clean and preprocess users data."""
        if 'users' not in self.raw_data:
            logger.warning("No users data to clean")
            return
            
        df = self.raw_data['users'].copy()
        logger.info("Cleaning users data...")
        
        try:
            # Rename columns to standard format
            df.rename(columns=COLUMN_MAPPINGS['users'], inplace=True)
            
            # Convert date columns
            df['start_date'] = pd.to_datetime(df['start_date'], errors='coerce')
            df['end_date'] = pd.to_datetime(df['end_date'], errors='coerce')
            
            # Handle missing values
            df['end_date'].fillna(pd.Timestamp('2100-01-01'), inplace=True)
            df['role'] = df['role'].fillna('Employee')
            
            # Add any additional processing needed for users data
            
            self.cleaned_data['users'] = df
            logger.info(f"Cleaned users data: {df.shape}")
            
        except Exception as e:
            logger.error(f"Error cleaning users data: {str(e)}")
            raise
    
    def clean_logon_data(self):
        """Clean logon data."""
        if 'logon' not in self.raw_data:
            logger.warning("No logon data to clean")
            return
            
        df = self.raw_data['logon'].copy()
        logger.info("Cleaning logon data...")
        
        try:
            # Rename columns to standard format
            df.rename(columns=COLUMN_MAPPINGS['logon'], inplace=True)
            
            # Convert timestamp
            df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
            
            # Handle missing values
            df['logon_type'] = df['logon_type'].fillna('Unknown')
            
            # Add any additional processing needed for logon data
            
            self.cleaned_data['logon'] = df
            logger.info(f"Cleaned logon data: {df.shape}")
            
        except Exception as e:
            logger.error(f"Error cleaning logon data: {str(e)}")
            raise
    
    def clean_device_data(self):
        """Clean device access data."""
        if 'device' not in self.raw_data:
            logger.warning("No device data to clean")
            return
            
        df = self.raw_data['device'].copy()
        logger.info("Cleaning device data...")
        
        try:
            # Rename columns to standard format
            df.rename(columns=COLUMN_MAPPINGS['device'], inplace=True)
            
            # Convert timestamp
            df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
            
            # Handle missing values
            df['activity_type'] = df['activity_type'].fillna('Unknown')
            df['file_path'] = df['file_path'].fillna('Unknown')
            
            # Add any additional processing needed for device data
            
            self.cleaned_data['device'] = df
            logger.info(f"Cleaned device data: {df.shape}")
            
        except Exception as e:
            logger.error(f"Error cleaning device data: {str(e)}")
            raise
    
    def clean_email_data(self):
        """Clean email data."""
        if 'email' not in self.raw_data:
            logger.warning("No email data to clean")
            return
            
        df = self.raw_data['email'].copy()
        logger.info("Cleaning email data...")
        
        try:
            # Rename columns to standard format
            df.rename(columns=COLUMN_MAPPINGS['email'], inplace=True)
            
            # Convert timestamp
            df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
            
            # Handle missing values
            df['cc_recipients'] = df['cc_recipients'].fillna('')
            df['bcc_recipients'] = df['bcc_recipients'].fillna('')
            df['has_attachments'] = df['has_attachments'].fillna(False)
            df['sensitivity'] = df['sensitivity'].fillna('Normal')
            df['importance'] = df['importance'].fillna('Normal')
            
            # Convert email size to MB if the column exists
            if 'email_size' in df.columns:
                df['email_size_mb'] = pd.to_numeric(df['email_size'], errors='coerce') / (1024 * 1024)
            
            self.cleaned_data['email'] = df
            logger.info(f"Cleaned email data: {df.shape}")
            
        except Exception as e:
            logger.error(f"Error cleaning email data: {str(e)}")
            raise
    
    def clean_file_data(self):
        """Clean file access data."""
        if 'file' not in self.raw_data:
            logger.warning("No file access data to clean")
            return
            
        df = self.raw_data['file'].copy()
        logger.info("Cleaning file access data...")
        
        try:
            # Rename columns to standard format
            df.rename(columns=COLUMN_MAPPINGS['file'], inplace=True)
            
            # Convert timestamp
            df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
            
            # Handle missing values
            df['activity_type'] = df['activity_type'].fillna('Unknown')
            df['sensitivity'] = df['sensitivity'].fillna('Normal')
            
            # Extract file extension
            df['file_extension'] = df['filename'].str.extract(r'\.(\w+)$', expand=False)
            
            # Convert file size to MB if the column exists
            if 'file_size' in df.columns:
                df['file_size_mb'] = pd.to_numeric(df['file_size'], errors='coerce') / (1024 * 1024)
            
            self.cleaned_data['file'] = df
            logger.info(f"Cleaned file access data: {df.shape}")
            
        except Exception as e:
            logger.error(f"Error cleaning file data: {str(e)}")
            raise
    
    def clean_decoy_data(self):
        """Clean decoy file access data."""
        if 'decoy_file' not in self.raw_data:
            logger.warning("No decoy file data to clean")
            return
            
        df = self.raw_data['decoy_file'].copy()
        logger.info("Cleaning decoy file data...")
        
        try:
            # Rename columns to standard format
            df.rename(columns=COLUMN_MAPPINGS['decoy_file'], inplace=True)
            
            # Mark all accesses as suspicious
            df['is_suspicious'] = True
            
            self.cleaned_data['decoy_file'] = df
            logger.info(f"Cleaned decoy file data: {df.shape}")
            
        except Exception as e:
            logger.error(f"Error cleaning decoy file data: {str(e)}")
            raise
    
    def save_cleaned_data(self):
        """Save all cleaned data to CSV files."""
        if not self.cleaned_data:
            logger.warning("No cleaned data to save")
            return
            
        logger.info("Saving cleaned data...")
        
        try:
            # Create output directory if it doesn't exist
            os.makedirs(config.CLEANED_DATA_DIR, exist_ok=True)
            
            for name, df in self.cleaned_data.items():
                if df is not None and not df.empty:
                    output_path = os.path.join(config.CLEANED_DATA_DIR, f'{name}_cleaned.csv')
                    # Use faster CSV writing with optimized settings
                    df.to_csv(output_path, index=False, chunksize=100000)
                    logger.info(f"Saved {name} data to {output_path} (shape: {df.shape})")
                else:
                    logger.warning(f"No data to save for {name}")
                    
            logger.info("Finished saving all cleaned data")
            
        except Exception as e:
            logger.error(f"Error saving cleaned data: {str(e)}")
            raise
    
    def run(self):
        """Run the data cleaning pipeline."""
        try:
            logger.info("Starting data cleaning pipeline...")
            
            # Load raw data
            self.load_data()
            
            # Clean each dataset
            self.clean_users_data()
            self.clean_logon_data()
            self.clean_device_data()
            self.clean_email_data()
            self.clean_file_data()
            self.clean_decoy_data()
            
            # Save cleaned data
            self.save_cleaned_data()
            
            logger.info("Data cleaning completed successfully!")
            return self.cleaned_data
            
        except Exception as e:
            logger.error(f"Error during data cleaning: {str(e)}", exc_info=True)
            raise

if __name__ == "__main__":
    cleaner = DataCleaner()
    cleaned_data = cleaner.run()
