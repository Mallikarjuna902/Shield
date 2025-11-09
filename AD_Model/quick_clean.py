"""
Quick data cleaning with sampling for faster processing
Use this for development/testing with large datasets
"""
import os
import pandas as pd
import logging
from pathlib import Path
import sys

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))
from Src import config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Sample sizes for large files (set to None to process all data)
SAMPLE_SIZES = {
    'users': None,  # Small file, process all
    'logon': 500000,  # Sample 500k rows instead of 3.5M
    'device': 300000,  # Sample 300k rows instead of 1.5M
    'email': 1000000,  # Sample 1M rows instead of 11M
    'file': 500000,  # Sample 500k rows instead of 2M
    'decoy_file': None  # Small file, process all
}

def quick_clean():
    """Quick data cleaning with sampling."""
    logger.info("Starting QUICK data cleaning with sampling...")
    
    os.makedirs(config.CLEANED_DATA_DIR, exist_ok=True)
    
    for name, path in config.RAW_FILES.items():
        if not path.exists():
            logger.warning(f"File not found: {path}")
            continue
            
        logger.info(f"\nProcessing {name}...")
        
        # Determine sample size
        sample_size = SAMPLE_SIZES.get(name)
        
        try:
            # Read with sampling if specified
            if sample_size:
                logger.info(f"  Sampling {sample_size:,} rows from {name}")
                df = pd.read_csv(path, nrows=sample_size, low_memory=False)
            else:
                logger.info(f"  Loading all data from {name}")
                df = pd.read_csv(path, low_memory=False)
            
            logger.info(f"  Loaded: {df.shape}")
            
            # Apply column renaming based on file type
            if name == 'users':
                df.rename(columns={
                    'employee_name': 'name',
                    'supervisor': 'supervisor_id'
                }, inplace=True)
                df['start_date'] = pd.to_datetime(df['start_date'], errors='coerce')
                df['end_date'] = pd.to_datetime(df['end_date'], errors='coerce')
                df['end_date'].fillna(pd.Timestamp('2100-01-01'), inplace=True)
                df['role'] = df['role'].fillna('Employee')
                
            elif name == 'logon':
                df.rename(columns={
                    'id': 'logon_id',
                    'date': 'timestamp',
                    'user': 'user_id',
                    'pc': 'device_id',
                    'activity': 'logon_type'
                }, inplace=True)
                df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
                df['logon_type'] = df['logon_type'].fillna('Unknown')
                
            elif name == 'device':
                df.rename(columns={
                    'id': 'device_event_id',
                    'date': 'timestamp',
                    'user': 'user_id',
                    'pc': 'device_id',
                    'file_tree': 'file_path',
                    'activity': 'activity_type'
                }, inplace=True)
                df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
                df['activity_type'] = df['activity_type'].fillna('Unknown')
                df['file_path'] = df['file_path'].fillna('Unknown')
                
            elif name == 'email':
                df.rename(columns={
                    'id': 'email_id',
                    'date': 'timestamp',
                    'user': 'sender_id',
                    'to': 'recipient_id',
                    'cc': 'cc_recipients',
                    'bcc': 'bcc_recipients',
                    'attachments': 'has_attachments',
                    'size': 'email_size'
                }, inplace=True)
                df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
                df['cc_recipients'] = df['cc_recipients'].fillna('')
                df['bcc_recipients'] = df['bcc_recipients'].fillna('')
                df['has_attachments'] = df['has_attachments'].fillna(False)
                
            elif name == 'file':
                df.rename(columns={
                    'id': 'file_event_id',
                    'date': 'timestamp',
                    'user': 'user_id',
                    'pc': 'device_id',
                    'activity': 'activity_type',
                    'size': 'file_size'
                }, inplace=True)
                df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
                df['activity_type'] = df['activity_type'].fillna('Unknown')
                if 'filename' in df.columns:
                    df['file_extension'] = df['filename'].str.extract(r'\.(\w+)$', expand=False)
                
            elif name == 'decoy_file':
                df.rename(columns={
                    'decoy_filename': 'decoy_filename',
                    'pc': 'device_id'
                }, inplace=True)
                df['is_suspicious'] = True
            
            # Save cleaned data
            output_path = os.path.join(config.CLEANED_DATA_DIR, f'{name}_cleaned.csv')
            df.to_csv(output_path, index=False)
            logger.info(f"  ✓ Saved to {output_path} (shape: {df.shape})")
            
        except Exception as e:
            logger.error(f"  ✗ Error processing {name}: {str(e)}")
            continue
    
    logger.info("\n" + "="*60)
    logger.info("QUICK DATA CLEANING COMPLETED!")
    logger.info("="*60)
    logger.info(f"Cleaned data saved to: {config.CLEANED_DATA_DIR}")
    logger.info("\nNote: Large files were sampled for faster processing.")
    logger.info("For production, use the full data cleaning script.")

if __name__ == "__main__":
    quick_clean()
