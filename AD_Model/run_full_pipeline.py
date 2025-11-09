"""
Complete Insider Threat Detection Pipeline
Runs: Data Cleaning -> Feature Engineering -> Model Training
"""
import sys
import os
from pathlib import Path
import logging
import time

# Add project root to path
project_root = str(Path(__file__).parent)
sys.path.insert(0, project_root)

from Src import config
from Src.Preprocessing.data_cleaning import DataCleaner
from Src.Feature_engineering.feature_extraction import FeatureExtractor
from Src.model_training import InsiderThreatDetector

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("pipeline.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def run_pipeline():
    """Execute the complete insider threat detection pipeline."""
    start_time = time.time()
    
    try:
        logger.info("="*80)
        logger.info("STARTING INSIDER THREAT DETECTION PIPELINE")
        logger.info("="*80)
        
        # Step 1: Data Cleaning
        logger.info("\n" + "="*80)
        logger.info("STEP 1: DATA CLEANING")
        logger.info("="*80)
        cleaner = DataCleaner()
        cleaned_data = cleaner.run()
        logger.info("✓ Data cleaning completed successfully")
        
        # Step 2: Feature Engineering
        logger.info("\n" + "="*80)
        logger.info("STEP 2: FEATURE ENGINEERING")
        logger.info("="*80)
        extractor = FeatureExtractor()
        features = extractor.run()
        logger.info("✓ Feature engineering completed successfully")
        
        # Step 3: Model Training
        logger.info("\n" + "="*80)
        logger.info("STEP 3: MODEL TRAINING")
        logger.info("="*80)
        detector = InsiderThreatDetector()
        detector.load_features()
        detector.preprocess_data()
        detector.train_model()
        detector.evaluate_model()
        detector.save_model()
        logger.info("✓ Model training completed successfully")
        
        # Pipeline Summary
        elapsed_time = time.time() - start_time
        logger.info("\n" + "="*80)
        logger.info("PIPELINE COMPLETED SUCCESSFULLY!")
        logger.info("="*80)
        logger.info(f"Total execution time: {elapsed_time/60:.2f} minutes")
        logger.info(f"Cleaned data saved to: {config.CLEANED_DATA_DIR}")
        logger.info(f"Features saved to: {config.FEATURES_DIR}")
        logger.info(f"Model saved to: {config.MODELS_DIR}")
        logger.info(f"Outputs saved to: {config.OUTPUTS_DIR}")
        logger.info("="*80)
        
        return True
        
    except Exception as e:
        logger.error(f"\n{'='*80}")
        logger.error(f"PIPELINE FAILED: {str(e)}")
        logger.error(f"{'='*80}")
        logger.exception("Full error traceback:")
        return False

if __name__ == "__main__":
    success = run_pipeline()
    sys.exit(0 if success else 1)
