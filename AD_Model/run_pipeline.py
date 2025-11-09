import sys
import os
from pathlib import Path
import logging

# Add the project root to the path so we can import our modules
project_root = str(Path(__file__).parent)
sys.path.insert(0, project_root)

# Import config from the Src module
from Src import config

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
        
        # Step 1: Data Exploration
        logger.info("\n" + "="*50)
        logger.info("Step 1: Data Exploration")
        logger.info("="*50)
        from Src.data_exploration import explore_csv, RAW_DATA_DIR, DATA_DIR
        
        # List all CSV files in the Raw directory
        csv_files = [f for f in os.listdir(RAW_DATA_DIR) if f.endswith('.csv')]
        for csv_file in csv_files:
            explore_csv(csv_file)
        
        # Step 2: Data Cleaning
        logger.info("\n" + "="*50)
        logger.info("Step 2: Data Cleaning")
        logger.info("="*50)
        from Src.Preprocessing.data_cleaning import DataCleaner
        cleaner = DataCleaner()
        cleaner.run()
        
        # Step 3: Feature Engineering
        logger.info("\n" + "="*50)
        logger.info("Step 3: Feature Engineering")
        logger.info("="*50)
        from Src.Feature_engineering.feature_extraction import FeatureExtractor
        extractor = FeatureExtractor()
        extractor.run()
        
        # Step 4: Model Training
        logger.info("\n" + "="*50)
        logger.info("Step 4: Model Training")
        logger.info("="*50)
        from Src.model_training import InsiderThreatDetector
        detector = InsiderThreatDetector()
        success = detector.run()
        
        if success:
            logger.info("\n" + "="*50)
            logger.info("Pipeline completed successfully!")
            logger.info("="*50)
            print("\nPipeline completed successfully! Check the following directories:")
            print(f"- Cleaned data: {os.path.join('Data', 'Cleaned')}")
            print(f"- Extracted features: {os.path.join('Data', 'Features')}")
            print(f"- Trained model: {os.path.join('Models')}")
            print(f"- Outputs: {os.path.join('Outputs')}")
        else:
            logger.error("\nPipeline failed. Check the logs for details.")
            print("\nPipeline failed. Please check the pipeline.log file for details.")
            
    except Exception as e:
        logger.error(f"Pipeline failed with error: {str(e)}", exc_info=True)
        print(f"\nAn error occurred: {str(e)}\nCheck the pipeline.log file for details.")
        return False
    
    return True

if __name__ == "__main__":
    run_pipeline()
