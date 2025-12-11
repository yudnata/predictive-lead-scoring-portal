import shap
import numpy as np

from .shap_utils import build_explanation


class LeadScoringSHAPService:
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

    def explain(self, X, single_data):
        """
        Generate SHAP explanation for a SINGLE row of processed data.

        Parameters:
        - X : np.array shape (1, n_features) - The processed features for the model
        - single_data : dict - The raw feature values (for narrative generation)

        Returns:
        - dict JSON-friendly explanation
        """
        if isinstance(X, np.ndarray) and X.ndim == 1:
            X = X.reshape(1, -1)

        shap_values = self.explainer.shap_values(X)

        # Handle various SHAP output formats (list of arrays vs single tensor)
        if isinstance(shap_values, list):
            # Binary/Multiclass: List of [n_samples, n_features] per class
            # We assume binary and take index 1 (Positive class)
            if len(shap_values) > 1:
                vals = shap_values[1]
            else:
                vals = shap_values[0]
        elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
             # (n_samples, n_features, n_classes) -> Take class 1
             if shap_values.shape[2] > 1:
                 vals = shap_values[:, :, 1]
             else:
                 vals = shap_values[:, :, 0]
        else:
            # (n_samples, n_features) - e.g. regression or specific binary opt
            vals = shap_values
        
        # Ensure 1D array (n_features,)
        shap_vals_row = np.array(vals).reshape(-1)

        explained = build_explanation(
            feature_names=self.feature_names,
            shap_values=shap_vals_row,
            base_value=self.base_value,
            single_data=single_data
        )

        return explained