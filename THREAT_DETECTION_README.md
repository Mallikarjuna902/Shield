# Shield - AI Threat Detection Integration

## Overview

Shield now includes an integrated AI-powered insider threat detection system using machine learning to analyze user behavior patterns and identify potential security risks.

## Features

- **File Upload Interface**: Upload CSV files containing user activity data
- **Real-time Analysis**: Process data using trained Isolation Forest model
- **Interactive Dashboard**: View analysis results with detailed user insights
- **Risk Classification**: Automatic categorization of users into High, Medium, Low risk levels
- **Behavioral Analytics**: 21 different behavioral features analyzed
- **Matrix Background**: Cyberpunk-themed UI with animated background

## Architecture

### Frontend (React)
- **ThreatDetection.js**: Main page with upload and analytics tabs
- **FileUpload.jsx**: Drag-and-drop CSV file upload component
- **ThreatAnalytics.jsx**: Interactive dashboard for viewing results
- **MatrixBackground.jsx**: Animated Matrix-style background

### Backend (Flask)
- **app.py**: Flask API server with model integration
- **Model Integration**: Direct integration with AD_Model pipeline
- **File Processing**: Automatic feature extraction from various CSV formats
- **Real-time Predictions**: On-demand analysis using trained models

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher
- Trained AD_Model (should be in `AD_Model/` directory)

### Installation

1. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**
   
   **Quick Start (Recommended)**
   ```bash
   # Use the simple backend with demo mode
   .\start_simple_backend.bat
   ```

3. **Verify Model Files (Optional for Demo)**
   For full model functionality, ensure these files exist in `AD_Model/Models/`:
   - `isolation_forest_model.pkl`
   - `scaler.pkl`
   - `feature_names.pkl` (optional)
   
   **Note**: The system works in demo mode without these files.

### Running the Application

#### Option 1: Run Both Frontend and Backend Together
```bash
npm run dev
```

#### Option 2: Run Separately

**Backend:**
```bash
# Quick start with demo mode (Recommended)
.\start_simple_backend.bat

# Or full backend (if model files are available)
cd backend
python app.py
```

**Frontend:**
```bash
npm start
```

### Access Points
- **Frontend**: http://localhost:3001 (or 3000)
- **Backend API**: http://localhost:5000
- **Threat Detection**: http://localhost:3001/threat-detection

## Usage

### 1. Upload Data
- Navigate to the Threat Detection page
- Upload a CSV file containing user activity data
- Supported formats:
  - User activity logs (logon, device, email, file access)
  - Pre-computed behavioral features
  - Individual activity type files

### 2. Analysis
- Click "Analyze for Threats" after upload
- The system will:
  - Detect file type automatically
  - Extract behavioral features
  - Apply the trained model
  - Generate risk scores and classifications

### 3. View Results
- Switch to the Analytics tab
- Review summary statistics
- Explore individual user details
- Filter by risk level
- Sort by anomaly score

## Supported Data Formats

### Raw Activity Data
- **Logon Data**: User login records with timestamps, devices
- **Email Data**: Email metadata with sizes, recipients
- **File Access**: File operation logs with paths, devices
- **Device Events**: Hardware interaction logs
- **Decoy Files**: Honeypot file access indicators

### Pre-computed Features
CSV with columns matching the 21 behavioral features:
- Logon behavior (6 features)
- Email behavior (6 features)  
- File access behavior (6 features)
- Device usage (2 features)
- Security indicators (1 feature)

## API Endpoints

### Backend API
- `GET /api/health` - Health check
- `POST /api/upload` - Upload and analyze file info
- `POST /api/analyze` - Perform threat analysis
- `GET /api/model-info` - Get model information

## Model Details

### Algorithm
- **Isolation Forest**: Unsupervised anomaly detection
- **Features**: 21 behavioral indicators
- **Training**: Based on CERT insider threat dataset
- **Performance**: ~10% anomaly detection rate

### Risk Levels
- **High Risk**: Anomaly score < -0.5
- **Medium Risk**: -0.5 ≤ score < -0.2  
- **Low Risk**: Score ≥ -0.2

## Troubleshooting

### Common Issues

1. **Pandas Installation Error (Windows)**
   ```
   ERROR: Could not find C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe
   ```
   **Solution**: Use the simple backend instead:
   ```bash
   .\start_simple_backend.bat
   ```
   This runs in demo mode with mock predictions.

2. **Model Not Loading**
   - Use demo mode if model files are missing
   - Verify model files exist in `AD_Model/Models/`
   - Check Python dependencies are installed
   - Review backend logs for errors

3. **File Upload Fails**
   - Ensure file is CSV format
   - Check file size (max 50MB)
   - Verify backend is running on port 5000

4. **CORS Errors**
   - Backend includes CORS headers
   - Check if both frontend and backend are running
   - Verify ports are correct

5. **Python Dependencies Issues**
   - Try installing packages individually:
   ```bash
   pip install Flask
   pip install Flask-CORS
   pip install pandas
   pip install numpy
   ```

### Logs
- Backend logs: Console output and `pipeline.log`
- Frontend logs: Browser developer console

## Integration with Existing Features

The threat detection system integrates seamlessly with Shield's existing features:

- **Dashboard**: Quick access card for threat detection
- **Navigation**: New route `/threat-detection`
- **Authentication**: Protected by existing auth system
- **UI Theme**: Consistent with Shield's design system

## Future Enhancements

- Real-time streaming analysis
- Integration with existing alert system
- Advanced visualization charts
- Model retraining capabilities
- SIEM system integration
- API key authentication for production

## File Structure

```
shield/
├── src/
│   ├── components/
│   │   ├── FileUpload.jsx
│   │   ├── ThreatAnalytics.jsx
│   │   └── MatrixBackground.jsx
│   └── pages/
│       └── ThreatDetection.js
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── start_backend.py
├── AD_Model/
│   ├── Models/
│   │   ├── isolation_forest_model.pkl
│   │   └── scaler.pkl
│   └── Src/
└── start_backend.bat
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend and frontend logs
3. Verify all dependencies are installed
4. Ensure model files are present and accessible
