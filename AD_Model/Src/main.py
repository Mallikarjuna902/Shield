import sys
import logging
from pathlib import Path

# Add the parent directory to the path so we can import our modules
sys.path.append(str(Path(__file__).parent.parent))

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
    """Run the complete insider threat detection pipeline."""
    try:
        logger.info("="*50)
        logger.info("Starting Insider Threat Detection Pipeline")
        logger.info("="*50)
        
        # Step 1: Data Cleaning
        logger.info("\n" + "="*50)
        logger.info("Step 1: Data Cleaning")
        logger.info("="*50)
        cleaner = DataCleaner()
        cleaner.run()
        
        # Step 2: Feature Engineering
        logger.info("\n" + "="*50)
        logger.info("Step 2: Feature Engineering")
        logger.info("="*50)
        extractor = FeatureExtractor()
        extractor.run()
        
        # Step 3: Model Training
        logger.info("\n" + "="*50)
        logger.info("Step 3: Model Training")
        logger.info("="*50)
        detector = InsiderThreatDetector()
        success = detector.run()
        
        if success:
            logger.info("\n" + "="*50)
            logger.info("Pipeline completed successfully!")
            logger.info("="*50)
        else:
            logger.error("\nPipeline failed. Check the logs for details.")
            
    except Exception as e:
        logger.error(f"Pipeline failed with error: {str(e)}", exc_info=True)
        return False
    
    return True

if __name__ == "__main__":
    run_pipeline()
