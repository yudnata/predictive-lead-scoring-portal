import shap
import numpy as np

from shap_utils import build_explanation


class SHAPService:
    def __init__(self, model, feature_names):
        """
        Create SHAP explainer service for Tree-based models (RandomForest, XGBoost, CatBoost, LightGBM)

        Parameters:
        - model : trained tree model
        - feature_names : list of feature names after preprocessing (encoder, scaler)
        """
        self.model = model
        self.feature_names = feature_names

        self.explainer = shap.TreeExplainer(model)

        if isinstance(self.explainer.expected_value, list) or isinstance(self.explainer.expected_value, np.ndarray):
            self.base_value = self.explainer.expected_value[1]
        else:
            self.base_value = self.explainer.expected_value

    def explain(self, X):
        """
        Generate SHAP explanation for a SINGLE row of processed data.

        Parameters:
        - X : np.array shape (1, n_features)

        Returns:
        - dict JSON-friendly explanation
        """
        if isinstance(X, np.ndarray) and X.ndim == 1:
            X = X.reshape(1, -1)

        shap_values = self.explainer.shap_values(X)

        if isinstance(shap_values, list) or isinstance(shap_values, np.ndarray):
            shap_vals_row = shap_values[1][0]
        else:
            shap_vals_row = shap_values[0]

        explained = build_explanation(
            feature_names=self.feature_names,
            shap_values=shap_vals_row,
            base_value=self.base_value
        )

        return explained