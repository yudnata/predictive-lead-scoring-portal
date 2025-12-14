import pandas as pd
import numpy as np
import joblib

df = pd.read_csv('data/bank-full.csv', sep=';')

numeric_cols = ["age", "balance", "day", "duration", "campaign", "pdays", "previous"]

if "pdays" in df.columns:
    df["pdays"] = df["pdays"].replace(999, -1)

iqr_bounds = {}
for col in numeric_cols:
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    iqr_bounds[col] = {'lower': float(lower), 'upper': float(upper)}

joblib.dump(iqr_bounds, 'model/iqr_bounds.pkl')
print("IQR bounds saved to model/iqr_bounds.pkl")
print(iqr_bounds)
