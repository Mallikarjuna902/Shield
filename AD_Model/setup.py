from setuptools import setup, find_packages

setup(
    name="insider_threat_detection",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'pandas',
        'numpy',
        'scikit-learn',
        'matplotlib',
        'seaborn',
        'joblib'
    ],
    python_requires='>=3.6',
)
