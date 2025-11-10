"""
Quick model training for insider threat detection
Trains Isolation Forest for anomaly detection
"""
import pandas as pd
import numpy as np
import joblib
import os
import sys
import logging
from pathlib import Path
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import matplotlib.pyplot as plt
import seaborn as sns

sys.path.insert(0, str(Path(__file__).parent))
from Src import config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_features():
    """Load ML-ready features."""
    logger.info("Loading features...")
    
    features_path = config.FEATURES_DIR / 'ml_features.csv'
    if not features_path.exists():
        raise FileNotFoundError(f"Features file not found: {features_path}")
    
    df = pd.read_csv(features_path)
    logger.info(f"  Loaded features: {df.shape}")
    logger.info(f"  Columns: {list(df.columns)}")
    
    return df

def prepare_data(df):
    """Prepare data for training."""
    logger.info("\nPreparing data for training...")
    
    # Separate features and labels
    if 'accessed_decoy' in df.columns:
        y = df['accessed_decoy'].values
        X = df.drop('accessed_decoy', axis=1)
        logger.info(f"  Found {y.sum()} anomalous samples ({y.sum()/len(y)*100:.2f}%)")
    else:
        y = None
        X = df
        logger.info("  No labels found - unsupervised learning only")
    
    # Handle any remaining non-numeric columns
    X = X.select_dtypes(include=[np.number])
    
    # Fill any NaN values
    X = X.fillna(0)
    
    logger.info(f"  Final feature matrix: {X.shape}")
    logger.info(f"  Features used: {list(X.columns)}")
    
    return X, y

def train_model(X, y=None):
    """Train Isolation Forest model."""
    logger.info("\nTraining Isolation Forest model...")
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    logger.info("  Features scaled")
    
    # Train Isolation Forest
    # contamination = expected proportion of outliers
    contamination = 0.1 if y is None else min(0.1, y.sum() / len(y))
    
    model = IsolationForest(
        n_estimators=100,
        contamination=contamination,
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    
    logger.info(f"  Training with contamination={contamination:.4f}")
    model.fit(X_scaled)
    logger.info("  ✓ Model trained successfully")
    
    return model, scaler

def evaluate_model(model, scaler, X, y, feature_names):
    """Evaluate model performance."""
    logger.info("\nEvaluating model...")
    
    # Scale features
    X_scaled = scaler.transform(X)
    
    # Predict anomalies (-1 for anomaly, 1 for normal)
    predictions = model.predict(X_scaled)
    anomaly_scores = model.score_samples(X_scaled)  # Lower scores = more anomalous
    
    # Convert predictions to binary (1 for anomaly, 0 for normal)
    y_pred = (predictions == -1).astype(int)
    
    logger.info(f"  Detected {y_pred.sum()} anomalies ({y_pred.sum()/len(y_pred)*100:.2f}%)")
    
    # If we have ground truth labels
    if y is not None:
        logger.info("\n  Performance Metrics:")
        logger.info(f"  True anomalies: {y.sum()}")
        logger.info(f"  Predicted anomalies: {y_pred.sum()}")
        
        # Classification report
        print("\n" + classification_report(y, y_pred, target_names=['Normal', 'Anomaly']))
        
        # Confusion matrix
        cm = confusion_matrix(y, y_pred)
        logger.info(f"\n  Confusion Matrix:")
        logger.info(f"  TN: {cm[0,0]}, FP: {cm[0,1]}")
        logger.info(f"  FN: {cm[1,0]}, TP: {cm[1,1]}")
        
        # ROC AUC score
        try:
            auc = roc_auc_score(y, -anomaly_scores)  # Negative because lower scores = anomaly
            logger.info(f"\n  ROC AUC Score: {auc:.4f}")
        except:
            logger.warning("  Could not calculate ROC AUC")
    
    return y_pred, anomaly_scores

def generate_alerts(X, y_pred, anomaly_scores, feature_names):
    """Generate alert table with anomaly details."""
    logger.info("\nGenerating alerts...")
    
    # Create alerts dataframe
    alerts = pd.DataFrame({
        'user_id': range(len(y_pred)),
        'is_anomaly': y_pred,
        'anomaly_score': anomaly_scores,
        'risk_level': pd.cut(-anomaly_scores, bins=3, labels=['Low', 'Medium', 'High'])
    })
    
    # Add top features for each user
    X_array = X.values if isinstance(X, pd.DataFrame) else X
    
    # For anomalies, identify top contributing features
    anomaly_indices = np.where(y_pred == 1)[0]
    
    reasons = []
    for idx in range(len(y_pred)):
        if y_pred[idx] == 1:
            # Get top 3 features with highest values
            user_features = X_array[idx]
            top_indices = np.argsort(user_features)[-3:][::-1]
            top_features = [f"{feature_names[i]}: {user_features[i]:.2f}" for i in top_indices]
            reasons.append("; ".join(top_features))
        else:
            reasons.append("Normal behavior")
    
    alerts['reason'] = reasons
    
    # Filter to show only anomalies
    anomaly_alerts = alerts[alerts['is_anomaly'] == 1].sort_values('anomaly_score')
    
    logger.info(f"  Generated {len(anomaly_alerts)} alerts")
    
    return alerts, anomaly_alerts

def save_results(model, scaler, alerts, anomaly_alerts, feature_names):
    """Save model and results."""
    logger.info("\nSaving results...")
    
    # Create output directories
    os.makedirs(config.MODELS_DIR, exist_ok=True)
    os.makedirs(config.OUTPUTS_DIR, exist_ok=True)
    
    # Save model
    model_path = config.MODELS_DIR / 'isolation_forest_model.pkl'
    joblib.dump(model, model_path)
    logger.info(f"  ✓ Saved model to {model_path}")
    
    # Save scaler
    scaler_path = config.MODELS_DIR / 'scaler.pkl'
    joblib.dump(scaler, scaler_path)
    logger.info(f"  ✓ Saved scaler to {scaler_path}")
    
    # Save feature names
    features_path = config.MODELS_DIR / 'feature_names.pkl'
    joblib.dump(feature_names, features_path)
    logger.info(f"  ✓ Saved feature names to {features_path}")
    
    # Save all alerts
    alerts_path = config.OUTPUTS_DIR / 'all_alerts.csv'
    alerts.to_csv(alerts_path, index=False)
    logger.info(f"  ✓ Saved all alerts to {alerts_path}")
    
    # Save anomaly alerts only
    anomaly_path = config.OUTPUTS_DIR / 'anomaly_alerts.csv'
    anomaly_alerts.to_csv(anomaly_path, index=False)
    logger.info(f"  ✓ Saved anomaly alerts to {anomaly_path}")
    
    # Create summary report
    summary_path = config.OUTPUTS_DIR / 'detection_summary.txt'
    with open(summary_path, 'w') as f:
        f.write("="*60 + "\n")
        f.write("INSIDER THREAT DETECTION SUMMARY\n")
        f.write("="*60 + "\n\n")
        f.write(f"Total users analyzed: {len(alerts)}\n")
        f.write(f"Anomalies detected: {len(anomaly_alerts)}\n")
        f.write(f"Detection rate: {len(anomaly_alerts)/len(alerts)*100:.2f}%\n\n")
        
        f.write("Risk Level Distribution:\n")
        risk_dist = anomaly_alerts['risk_level'].value_counts()
        for level, count in risk_dist.items():
            f.write(f"  {level}: {count}\n")
        
        f.write("\n" + "="*60 + "\n")
        f.write("TOP 10 HIGHEST RISK USERS\n")
        f.write("="*60 + "\n\n")
        
        top_10 = anomaly_alerts.head(10)
        for idx, row in top_10.iterrows():
            f.write(f"User {row['user_id']} - Risk: {row['risk_level']} - Score: {row['anomaly_score']:.4f}\n")
            f.write(f"  Reason: {row['reason']}\n\n")
    
    logger.info(f"  ✓ Saved summary report to {summary_path}")
    
    return model_path, alerts_path, anomaly_path

def create_visualizations(alerts, anomaly_alerts):
    """Create visualization plots."""
    logger.info("\nCreating visualizations...")
    
    try:
        os.makedirs(config.OUTPUTS_DIR, exist_ok=True)
        
        # 1. Anomaly score distribution
        plt.figure(figsize=(10, 6))
        plt.hist(alerts['anomaly_score'], bins=50, edgecolor='black', alpha=0.7)
        plt.axvline(alerts[alerts['is_anomaly']==1]['anomaly_score'].max(), 
                   color='red', linestyle='--', label='Anomaly Threshold')
        plt.xlabel('Anomaly Score')
        plt.ylabel('Frequency')
        plt.title('Distribution of Anomaly Scores')
        plt.legend()
        plt.tight_layout()
        plt.savefig(config.OUTPUTS_DIR / 'anomaly_score_distribution.png', dpi=300)
        plt.close()
        logger.info("  ✓ Saved anomaly score distribution plot")
        
        # 2. Risk level pie chart
        if len(anomaly_alerts) > 0:
            plt.figure(figsize=(8, 8))
            risk_counts = anomaly_alerts['risk_level'].value_counts()
            plt.pie(risk_counts.values, labels=risk_counts.index, autopct='%1.1f%%',
                   colors=['#ff9999', '#ffcc99', '#ffff99'])
            plt.title('Anomalies by Risk Level')
            plt.tight_layout()
            plt.savefig(config.OUTPUTS_DIR / 'risk_level_distribution.png', dpi=300)
            plt.close()
            logger.info("  ✓ Saved risk level distribution plot")
        
        logger.info("  Visualizations created successfully")
        
    except Exception as e:
        logger.warning(f"  Could not create visualizations: {str(e)}")

def main():
    """Run model training pipeline."""
    logger.info("="*60)
    logger.info("STARTING MODEL TRAINING")
    logger.info("="*60)
    
    try:
        # Load features
        df = load_features()
        
        # Prepare data
        X, y = prepare_data(df)
        feature_names = list(X.columns)
        
        # Train model
        model, scaler = train_model(X, y)
        
        # Evaluate model
        y_pred, anomaly_scores = evaluate_model(model, scaler, X, y, feature_names)
        
        # Generate alerts
        alerts, anomaly_alerts = generate_alerts(X, y_pred, anomaly_scores, feature_names)
        
        # Save results
        save_results(model, scaler, alerts, anomaly_alerts, feature_names)
        
        # Create visualizations
        create_visualizations(alerts, anomaly_alerts)
        
        # Print summary
        logger.info("\n" + "="*60)
        logger.info("MODEL TRAINING COMPLETED SUCCESSFULLY!")
        logger.info("="*60)
        logger.info(f"Total users: {len(alerts)}")
        logger.info(f"Anomalies detected: {len(anomaly_alerts)}")
        logger.info(f"Detection rate: {len(anomaly_alerts)/len(alerts)*100:.2f}%")
        logger.info("\nOutput files:")
        logger.info(f"  - Model: {config.MODELS_DIR / 'isolation_forest_model.pkl'}")
        logger.info(f"  - Alerts: {config.OUTPUTS_DIR / 'anomaly_alerts.csv'}")
        logger.info(f"  - Summary: {config.OUTPUTS_DIR / 'detection_summary.txt'}")
        logger.info("="*60)
        
        return True
        
    except Exception as e:
        logger.error(f"\nModel training failed: {str(e)}", exc_info=True)
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
