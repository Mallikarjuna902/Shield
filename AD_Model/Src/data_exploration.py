import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

# Set paths
import os
BASE_DIR = Path(__file__).parent.parent  # This points to AD_Model directory
DATA_DIR = os.path.join(BASE_DIR, "Data")
RAW_DATA_DIR = os.path.join(DATA_DIR, "Raw")

# Function to load and display basic info about a CSV file
def explore_csv(file_name):
    print(f"\n{'='*50}")
    print(f"Exploring {file_name}")
    print("="*50)
    
    file_path = os.path.join(RAW_DATA_DIR, file_name)
    try:
        df = pd.read_csv(file_path)
        print(f"\nShape: {df.shape}")
        print("\nFirst 5 rows:")
        print(df.head())
        print("\nData types:")
        print(df.dtypes)
        print("\nMissing values:")
        print(df.isnull().sum())
        print("\nBasic statistics:")
        print(df.describe(include='all'))
        
        # Save sample visualizations
        exploratory_dir = os.path.join(DATA_DIR, "Exploratory")
        if not os.path.exists(exploratory_dir):
            os.makedirs(exploratory_dir)
            
        # Plot histograms for numeric columns
        numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
        if len(numeric_cols) > 0:
            plt.figure(figsize=(15, 10))
            df[numeric_cols].hist()
            plt.tight_layout()
            plt.savefig(os.path.join(DATA_DIR, "Exploratory", f"{file_name.replace('.csv', '')}_histograms.png"))
            plt.close()
            
    except Exception as e:
        print(f"Error processing {file_name}: {str(e)}")

# List of all CSV files to explore
csv_files = [f for f in os.listdir(RAW_DATA_DIR) if f.endswith('.csv')]

# Explore each file
for csv_file in csv_files:
    explore_csv(csv_file)
    
print("\nExploration complete! Check the 'Exploratory' folder for visualizations.")
