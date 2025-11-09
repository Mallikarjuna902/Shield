import pandas as pd
import numpy as np
import joblib
import logging
from pathlib import Path
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, f1_score, precision_score, recall_score
from Src import config

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class InsiderThreatDetector:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.features = None
        self.labels = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        
    def load_features(self):
        """Load the extracted features."""
        features_path = config.FEATURES_DIR / "all_features.csv"
        if not features_path.exists():
            raise FileNotFoundError(f"Features file not found at {features_path}")
            
        logger.info("Loading features...")
        self.features = pd.read_csv(features_path, parse_dates=['timestamp'])
        logger.info(f"Loaded features with shape: {self.features.shape}")
        
        # Check if we have decoy file access data for labeling
        decoy_path = config.CLEANED_DATA_DIR / "decoy_file_cleaned.csv"
        if decoy_path.exists():
            decoy_df = pd.read_csv(decoy_path, parse_dates=['timestamp'])
            # Mark users who accessed decoy files
            self.features['is_anomaly'] = self.features['user'].isin(decoy_df['user']).astype(int)
            logger.info(f"Found {self.features['is_anomaly'].sum()} anomalous samples")
        else:
            logger.warning("No decoy file data found for labeling anomalies")
            self.features['is_anomaly'] = 0
    
    def preprocess_data(self):
        """Prepare data for training."""
        if self.features is None:
            raise ValueError("Features not loaded. Call load_features() first.")
            
        logger.info("Preprocessing data...")
        
        # Create time-based features
        self.features['hour_sin'] = np.sin(2 * np.pi * self.features['hour_of_day']/24.0)
        self.features['hour_cos'] = np.cos(2 * np.pi * self.features['hour_of_day']/24.0)
        self.features['day_sin'] = np.sin(2 * np.pi * self.features['day_of_week']/7.0)
        self.features['day_cos'] = np.cos(2 * np.pi * self.features['day_of_week']/7.0)
        
        # Select features for training
        numeric_cols = self.features.select_dtypes(include=[np.number]).columns.tolist()
        # Remove non-feature columns
        non_feature_cols = ['user', 'timestamp', 'is_anomaly', 'hour_of_day', 'day_of_week']
        feature_cols = [col for col in numeric_cols if col not in non_feature_cols]
        
        # Scale features
        X = self.features[feature_cols]
        self.X_scaled = self.scaler.fit_transform(X)
        
        # Use decoy file access as labels if available
        self.y = self.features['is_anomaly'].values
        
        # Split into train and test sets
        if len(np.unique(self.y)) > 1:  # If we have both classes
            self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
                self.X_scaled, self.y, test_size=0.2, random_state=42, stratify=self.y
            )
        else:  # If we only have one class (no anomalies found)
            self.X_train, self.X_test = train_test_split(
                self.X_scaled, test_size=0.2, random_state=42
            )
            self.y_train, self.y_test = None, None
            
        logger.info(f"Training set shape: {self.X_train.shape}")
        if self.y_train is not None:
            logger.info(f"Anomaly ratio in training set: {self.y_train.mean():.4f}")
    
    def train_model(self):
        """Train the Isolation Forest model."""
        if self.X_train is None:
            raise ValueError("Data not prepared. Call preprocess_data() first.")
            
        logger.info("Training Isolation Forest model...")
        
        # Initialize model with parameters from config
        self.model = IsolationForest(
            n_estimators=config.MODEL_PARAMS['isolation_forest']['n_estimators'],
            contamination=config.MODEL_PARAMS['isolation_forest']['contamination'],
            random_state=config.MODEL_PARAMS['isolation_forest']['random_state'],
            n_jobs=config.MODEL_PARAMS['isolation_forest']['n_jobs']
        )
        
        # Train the model
        self.model.fit(self.X_train)
        logger.info("Model training completed")
        
        # If we have test labels, evaluate the model
        if hasattr(self, 'X_test') and self.y_test is not None:
            self.evaluate_model()
    
    def evaluate_model(self):
        """Evaluate the model on test data."""
        if self.model is None or not hasattr(self, 'X_test'):
            raise ValueError("Model not trained or test data not available")
            
        logger.info("Evaluating model...")
        
        # Predict anomalies (1 for inliers, -1 for outliers)
        y_pred = self.model.predict(self.X_test)
        
        # Convert to binary (0 for inliers, 1 for outliers) to match our labels
        y_pred_binary = (y_pred == -1).astype(int)
        
        # If we have true labels, calculate metrics
        if hasattr(self, 'y_test') and self.y_test is not None:
            logger.info("\n" + "="*50)
            logger.info("Model Evaluation")
            logger.info("="*50)
            
            # Calculate metrics
            precision = precision_score(self.y_test, y_pred_binary, zero_division=0)
            recall = recall_score(self.y_test, y_pred_binary, zero_division=0)
            f1 = f1_score(self.y_test, y_pred_binary, zero_division=0)
            
            logger.info(f"Precision: {precision:.4f}")
            logger.info(f"Recall:    {recall:.4f}")
            logger.info(f"F1 Score:  {f1:.4f}")
            
            # Full classification report
            report = classification_report(self.y_test, y_pred_binary, target_names=['Normal', 'Anomaly'])
            logger.info("\nClassification Report:")
            logger.info("-" * 50)
            logger.info(report)
            
            return {
                'precision': precision,
                'recall': recall,
                'f1_score': f1
            }
        else:
            logger.warning("No ground truth labels available for evaluation")
            return None
    
    def predict_anomalies(self, X=None):
        """Predict anomalies for new data."""
        if self.model is None:
            raise ValueError("Model not trained. Call train_model() first.")
            
        if X is None and hasattr(self, 'X_test'):
            X = self.X_test
        elif X is None:
            raise ValueError("No data provided for prediction")
            
        # Scale the data if it's not already scaled
        if not hasattr(self, 'X_scaled'):
            X_scaled = self.scaler.transform(X)
        else:
            X_scaled = X
            
        # Predict anomalies (1 for inliers, -1 for outliers)
        y_pred = self.model.predict(X_scaled)
        anomaly_scores = -self.model.decision_function(X_scaled)  # Higher = more anomalous
        
        # Create results dataframe
        results = pd.DataFrame({
            'anomaly_score': anomaly_scores,
            'is_anomaly': (y_pred == -1).astype(int)
        })
        
        # Add user and timestamp if available
        if hasattr(self, 'features') and 'user' in self.features.columns:
            results['user'] = self.features['user'].values
        if hasattr(self, 'features') and 'timestamp' in self.features.columns:
            results['timestamp'] = self.features['timestamp'].values
            
        return results
    
    def save_model(self):
        """Save the trained model and scaler to disk."""
        if self.model is None:
            raise ValueError("Model not trained. Nothing to save.")
            
        # Create models directory if it doesn't exist
        config.MODELS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Save the model
        model_path = config.MODELS_DIR / "insider_threat_detector.joblib"
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'feature_columns': self.features.columns.tolist()
        }, model_path)
        logger.info(f"Model saved to {model_path}")
        
        # Also save predictions for analysis
        if hasattr(self, 'X_test'):
            predictions = self.predict_anomalies()
            predictions_path = config.OUTPUTS_DIR / "anomaly_predictions.csv"
            predictions.to_csv(predictions_path, index=False)
            logger.info(f"Predictions saved to {predictions_path}")
    
    def run(self):
        """Run the full training pipeline."""
        try:
            self.load_features()
            self.preprocess_data()
            self.train_model()
            self.save_model()
            logger.info("Training pipeline completed successfully!")
            return True
        except Exception as e:
            logger.error(f"Error in training pipeline: {str(e)}", exc_info=True)
            return False

if __name__ == "__main__":
    detector = InsiderThreatDetector()
    success = detector.run()
    
    if success:
        print("\nTraining completed successfully!")
    else:
        print("\nTraining failed. Check the logs for details.")
