from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import logging
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': False,  # Set to False for now
        'timestamp': datetime.now().isoformat(),
        'message': 'Backend running in demo mode'
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle CSV file upload and return basic info."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.lower().endswith('.csv'):
            return jsonify({'error': 'Only CSV files are allowed'}), 400
        
        # Read the CSV file
        df = pd.read_csv(file)
        
        # Basic file analysis
        file_info = {
            'filename': file.filename,
            'rows': len(df),
            'columns': len(df.columns),
            'column_names': df.columns.tolist(),
            'sample_data': df.head(5).to_dict('records'),
            'data_types': df.dtypes.astype(str).to_dict(),
            'missing_values': df.isnull().sum().to_dict(),
            'upload_time': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'file_info': file_info,
            'message': 'File uploaded and analyzed successfully'
        })
        
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_data():
    """Analyze uploaded data using mock predictions for demo."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        filename = file.filename
        df = pd.read_csv(file)
        
        # Generate mock analysis results based on file content
        results = generate_mock_analysis(df, filename)
        
        return jsonify({
            'success': True,
            'file_type': f'CSV Analysis: {filename}',
            'results': results,
            'analysis_time': datetime.now().isoformat(),
            'message': f'Demo analysis completed for {filename} - using mock data based on file content'
        })
        
    except Exception as e:
        logger.error(f"Error analyzing data: {str(e)}")
        return jsonify({'error': f'Error analyzing data: {str(e)}'}), 500

def detect_file_type(df, filename=None):
    """Detect the type of CSV file based on columns and filename."""
    columns = [col.lower() for col in df.columns]
    
    # Check if this is the ML features file
    ml_feature_columns = [
        'total_logons', 'unique_devices_logon', 'weekend_logons', 'after_hours_logons',
        'avg_logon_hour', 'std_logon_hour', 'total_emails_sent', 'unique_recipients',
        'avg_email_size', 'total_email_size', 'max_email_size', 'after_hours_emails',
        'total_file_ops', 'unique_files', 'unique_devices_file', 'files_to_removable',
        'files_from_removable', 'after_hours_file_ops', 'total_device_events',
        'unique_devices_used', 'accessed_decoy'
    ]
    
    if all(col.lower() in columns for col in ['total_logons', 'accessed_decoy', 'total_emails_sent']):
        return 'ml_features'
    
    if filename:
        filename_lower = filename.lower()
        if 'ml_features' in filename_lower or 'features' in filename_lower:
            return 'ml_features'
        elif 'logon' in filename_lower:
            return 'logon'
        elif 'email' in filename_lower:
            return 'email'
        elif 'file' in filename_lower and 'decoy' not in filename_lower:
            return 'file'
        elif 'device' in filename_lower:
            return 'device'
        elif 'decoy' in filename_lower:
            return 'decoy'
        elif 'user' in filename_lower:
            return 'users'
    
    # Detect based on column patterns
    if 'user_id' in columns and 'employee_name' in columns:
        return 'users'
    elif 'activity' in columns and ('logon' in str(df.values).lower() or 'logoff' in str(df.values).lower()):
        return 'logon'
    elif 'filename' in columns and 'content' in columns:
        return 'file'
    elif 'file_tree' in columns:
        return 'device'
    elif 'decoy_filename' in columns:
        return 'decoy'
    elif any(col in columns for col in ['to', 'from', 'subject', 'cc', 'bcc']):
        return 'email'
    
    return 'unknown'

def extract_users_by_type(df, file_type):
    """Extract unique users from different file types."""
    users_data = []
    
    try:
        if file_type == 'ml_features':
            # ML features file: each row represents a user, create user IDs
            users_data = [f"User_{i+1:03d}" for i in range(len(df))]
            
        elif file_type == 'users':
            # Users file: extract from user_id column
            if 'user_id' in df.columns:
                users_data = df['user_id'].dropna().unique().tolist()
            elif 'employee_name' in df.columns:
                users_data = df['employee_name'].dropna().unique().tolist()
                
        elif file_type == 'logon':
            # Logon file: extract from user column
            if 'user' in df.columns:
                users_data = df['user'].dropna().unique().tolist()
                
        elif file_type == 'file':
            # File activity: extract from user column
            if 'user' in df.columns:
                users_data = df['user'].dropna().unique().tolist()
                
        elif file_type == 'device':
            # Device activity: extract from user column
            if 'user' in df.columns:
                users_data = df['user'].dropna().unique().tolist()
                
        elif file_type == 'email':
            # Email data: extract from user/from columns
            for col in ['user', 'from', 'sender']:
                if col in df.columns:
                    users_data = df[col].dropna().unique().tolist()
                    break
                    
        elif file_type == 'decoy':
            # Decoy files: extract from pc column (representing users/systems)
            if 'pc' in df.columns:
                users_data = df['pc'].dropna().unique().tolist()
                
        # If no users found, create generic user list
        if not users_data:
            users_data = [f"User_{i+1:03d}" for i in range(min(len(df), 20))]
            
    except Exception as e:
        logger.warning(f"Error extracting users from {file_type}: {e}")
        users_data = [f"User_{i+1:03d}" for i in range(min(len(df), 20))]
    
    return users_data[:100]  # Return up to 100 users for UI display

def calculate_user_risk_score(df, user_id, file_type):
    """Calculate risk score based on user activity patterns in the data."""
    try:
        if file_type == 'ml_features':
            # For ML features, use actual feature values to calculate risk
            user_index = int(user_id.split('_')[1]) - 1  # Extract index from User_001 format
            if user_index < len(df):
                row = df.iloc[user_index]
                
                # Calculate risk based on multiple factors
                risk_factors = []
                
                # Decoy file access (critical indicator)
                if row.get('accessed_decoy', 0) > 0:
                    risk_factors.append(-0.8)  # Very high risk
                
                # After hours activity
                after_hours_logons = row.get('after_hours_logons', 0)
                after_hours_emails = row.get('after_hours_emails', 0)
                after_hours_files = row.get('after_hours_file_ops', 0)
                total_after_hours = after_hours_logons + after_hours_emails + after_hours_files
                if total_after_hours > 50:
                    risk_factors.append(-0.4)
                elif total_after_hours > 20:
                    risk_factors.append(-0.2)
                
                # Removable media usage
                files_to_removable = row.get('files_to_removable', 0)
                files_from_removable = row.get('files_from_removable', 0)
                if files_to_removable > 10 or files_from_removable > 10:
                    risk_factors.append(-0.3)
                elif files_to_removable > 0 or files_from_removable > 0:
                    risk_factors.append(-0.1)
                
                # Unusual device usage
                unique_devices = row.get('unique_devices_logon', 0)
                if unique_devices > 10:
                    risk_factors.append(-0.2)
                elif unique_devices > 5:
                    risk_factors.append(-0.1)
                
                # Weekend activity
                weekend_logons = row.get('weekend_logons', 0)
                if weekend_logons > 10:
                    risk_factors.append(-0.2)
                elif weekend_logons > 0:
                    risk_factors.append(-0.05)
                
                # Calculate final risk score
                if risk_factors:
                    risk_score = min(sum(risk_factors), -0.8)  # Cap at -0.8
                else:
                    risk_score = np.random.uniform(0.0, 0.3)  # Normal behavior
                
                return risk_score
            
        elif file_type == 'logon':
            # Count user activities, unusual hours, etc.
            user_data = df[df['user'] == user_id] if 'user' in df.columns else df
            activity_count = len(user_data)
            # Higher activity might indicate higher risk in some cases
            risk_score = -0.1 if activity_count > df.groupby('user')['user'].count().mean() else 0.1
            
        elif file_type == 'file':
            # File operations - look for removable media usage
            user_data = df[df['user'] == user_id] if 'user' in df.columns else df
            removable_ops = 0
            if 'to_removable_media' in df.columns:
                removable_ops = len(user_data[user_data['to_removable_media'] == True])
            risk_score = -0.3 if removable_ops > 5 else 0.1
            
        elif file_type == 'device':
            # Device connections
            user_data = df[df['user'] == user_id] if 'user' in df.columns else df
            device_count = len(user_data)
            risk_score = -0.2 if device_count > 10 else 0.1
            
        elif file_type == 'decoy':
            # Decoy file access is always high risk
            risk_score = -0.6
            
        elif file_type == 'email':
            # Email patterns
            user_data = df[df.get('user', df.get('from', '')) == user_id] if any(col in df.columns for col in ['user', 'from']) else df
            email_count = len(user_data)
            risk_score = -0.1 if email_count > 100 else 0.1
            
        else:
            # Default risk calculation
            risk_score = np.random.uniform(-0.3, 0.3)
            
    except Exception:
        risk_score = np.random.uniform(-0.3, 0.3)
    
    return risk_score

def generate_features_by_type(df, user_id, file_type, risk_level):
    """Generate realistic features based on file type and user data."""
    features = {}
    
    try:
        if file_type == 'ml_features':
            # For ML features, use the actual feature values from the row
            user_index = int(user_id.split('_')[1]) - 1  # Extract index from User_001 format
            if user_index < len(df):
                row = df.iloc[user_index]
                features = {}
                
                # Map all available columns to features
                for col in df.columns:
                    if col in row:
                        features[col] = float(row[col]) if pd.notna(row[col]) else 0.0
                
                # Add analysis metadata
                features.update({
                    'file_type_analyzed': 'ML_FEATURES',
                    'analysis_confidence': 0.95,  # High confidence for processed features
                    'behavioral_score': abs(float(row.get('accessed_decoy', 0))) + 
                                      (float(row.get('after_hours_logons', 0)) / 100) +
                                      (float(row.get('files_to_removable', 0)) / 50),
                    'risk_indicators': []
                })
                
                # Add specific risk indicators
                if row.get('accessed_decoy', 0) > 0:
                    features['risk_indicators'].append('CRITICAL: Decoy file access detected')
                if row.get('after_hours_logons', 0) > 50:
                    features['risk_indicators'].append('High after-hours activity')
                if row.get('files_to_removable', 0) > 10:
                    features['risk_indicators'].append('Excessive removable media usage')
                if row.get('weekend_logons', 0) > 10:
                    features['risk_indicators'].append('Unusual weekend activity')
                
                return features
                
        elif file_type == 'logon':
            user_data = df[df['user'] == user_id] if 'user' in df.columns else df.head(1)
            features = {
                'total_logons': len(user_data) if len(user_data) > 0 else np.random.randint(20, 200),
                'unique_devices_logon': len(user_data['pc'].unique()) if 'pc' in df.columns and len(user_data) > 0 else np.random.randint(1, 8),
                'weekend_logons': np.random.randint(0, 20),
                'after_hours_logons': np.random.randint(0, 30),
                'avg_logon_hour': np.random.uniform(7, 18),
                'std_logon_hour': np.random.uniform(1, 5),
            }
            
        elif file_type == 'file':
            user_data = df[df['user'] == user_id] if 'user' in df.columns else df.head(1)
            features = {
                'total_file_ops': len(user_data) if len(user_data) > 0 else np.random.randint(100, 1000),
                'unique_files': len(user_data['filename'].unique()) if 'filename' in df.columns and len(user_data) > 0 else np.random.randint(50, 500),
                'removable_to': len(user_data[user_data['to_removable_media'] == True]) if 'to_removable_media' in df.columns and len(user_data) > 0 else np.random.randint(0, 10),
                'removable_from': len(user_data[user_data['from_removable_media'] == True]) if 'from_removable_media' in df.columns and len(user_data) > 0 else np.random.randint(0, 5),
                'after_hours_file_ops': np.random.randint(0, 50),
            }
            
        elif file_type == 'device':
            user_data = df[df['user'] == user_id] if 'user' in df.columns else df.head(1)
            features = {
                'total_device_events': len(user_data) if len(user_data) > 0 else np.random.randint(200, 2000),
                'unique_devices': np.random.randint(1, 6),
                'device_connections': len(user_data) if len(user_data) > 0 else np.random.randint(10, 100),
            }
            
        elif file_type == 'decoy':
            features = {
                'accessed_decoy_files': 1,  # Always 1 for decoy files
                'decoy_access_count': np.random.randint(1, 5),
                'risk_indicator': 'CRITICAL - Decoy File Access Detected'
            }
            
        elif file_type == 'email':
            features = {
                'total_emails': np.random.randint(50, 1000),
                'unique_recipients': np.random.randint(10, 100),
                'avg_email_size': np.random.randint(500, 5000),
                'after_hours_emails': np.random.randint(0, 100),
            }
            
        elif file_type == 'users':
            features = {
                'employee_profile': 'Active',
                'department_risk': risk_level,
                'access_level': np.random.choice(['Standard', 'Elevated', 'Admin']),
            }
            
        # Add common features for all types
        features.update({
            'file_type_analyzed': file_type.upper(),
            'analysis_confidence': np.random.uniform(0.7, 0.95),
            'behavioral_score': np.random.uniform(0.1, 0.9)
        })
        
    except Exception as e:
        logger.warning(f"Error generating features for {file_type}: {e}")
        # Fallback to basic features
        features = {
            'file_type_analyzed': file_type.upper(),
            'analysis_confidence': 0.5,
            'behavioral_score': 0.5
        }
    
    return features

def generate_mock_analysis(df, filename=None):
    """Generate mock analysis results based on actual CSV data and file type."""
    file_type = detect_file_type(df, filename)
    
    # Use file content and filename to seed randomness for consistent but different results per file
    content_hash = hash(str(df.values.tobytes()))
    filename_hash = hash(filename) if filename else 0
    combined_hash = (content_hash + filename_hash) % 1000000
    np.random.seed(combined_hash)  # Seed based on file content and name
    
    # Extract users based on file type
    users_data = extract_users_by_type(df, file_type)
    num_users = min(len(users_data), 100)  # Analyze up to 100 users for UI display
    
    users = []
    anomaly_count = 0
    
    for i, user_id in enumerate(users_data[:num_users]):
        # Generate anomaly score based on user activity patterns in the data
        user_activity_score = calculate_user_risk_score(df, user_id, file_type)
        base_score = user_activity_score
        noise = np.random.uniform(-0.2, 0.2)
        anomaly_score = np.clip(base_score + noise, -0.8, 0.2)
        
        # Determine prediction and risk level
        if anomaly_score < -0.3:
            prediction = 'Anomaly'
            risk_level = 'High' if anomaly_score < -0.5 else 'Medium'
            anomaly_count += 1
        else:
            prediction = 'Normal'
            risk_level = 'Low'
        
        # Generate file-type-specific features
        features = generate_features_by_type(df, user_id, file_type, risk_level)
        
        users.append({
            'user_id': user_id,
            'anomaly_score': float(anomaly_score),
            'prediction': prediction,
            'risk_level': risk_level,
            'features': features
        })
    
    # Calculate summary
    high_risk = sum(1 for u in users if u['risk_level'] == 'High')
    medium_risk = sum(1 for u in users if u['risk_level'] == 'Medium')
    low_risk = sum(1 for u in users if u['risk_level'] == 'Low')
    
    summary = {
        'total_users': num_users,
        'anomalies_detected': anomaly_count,
        'anomaly_rate': (anomaly_count / num_users) * 100,
        'avg_anomaly_score': float(np.mean([u['anomaly_score'] for u in users])),
        'file_type': file_type.upper(),
        'data_source': filename or 'Unknown',
        'risk_distribution': {
            'High': high_risk,
            'Medium': medium_risk,
            'Low': low_risk
        }
    }
    
    return {
        'users': users,
        'summary': summary
    }

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get information about the model (demo version)."""
    feature_names = [
        'total_logons', 'unique_devices_logon', 'weekend_logons', 'after_hours_logons',
        'avg_logon_hour', 'std_logon_hour', 'total_emails', 'unique_recipients',
        'avg_email_size', 'total_email_size', 'max_email_size', 'after_hours_emails',
        'total_file_ops', 'unique_files', 'unique_devices_file', 'removable_to',
        'removable_from', 'after_hours_file_ops', 'total_device_events',
        'unique_devices', 'accessed_decoy_files'
    ]
    
    return jsonify({
        'model_type': 'Isolation Forest (Demo Mode)',
        'features': feature_names,
        'feature_count': len(feature_names),
        'model_loaded': False,
        'description': 'Demo version - generates mock predictions for testing'
    })

if __name__ == '__main__':
    print("=" * 50)
    print("Shield Threat Detection Backend (Demo Mode)")
    print("=" * 50)
    print("Starting Flask server on http://localhost:5000")
    print("Note: Running in demo mode with mock predictions")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    app.run(debug=True, port=5000)
