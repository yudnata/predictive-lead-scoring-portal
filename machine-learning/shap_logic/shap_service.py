import shap
import numpy as np

from .shap_utils import build_explanation

def extract_tree_model(model):
    try:
        from imblearn.pipeline import Pipeline as ImbPipeline
        if isinstance(model, ImbPipeline):
            return model.steps[-1][1]
    except ImportError:
        pass
    try:
        from sklearn.pipeline import Pipeline as SkPipeline
        if isinstance(model, SkPipeline):
            return model.steps[-1][1]
    except ImportError:
        pass
    return model

class LeadScoringSHAPService:
    def __init__(self, model, feature_names):
        self.model = model
        self.feature_names = feature_names

        tree_model = extract_tree_model(model)
        print(f"   ℹ️ Extracted model type for SHAP: {type(tree_model).__name__}")
        self.explainer = shap.TreeExplainer(tree_model)

        if isinstance(self.explainer.expected_value, list) or isinstance(self.explainer.expected_value, np.ndarray):
            self.base_value = self.explainer.expected_value[1]
        else:
            self.base_value = self.explainer.expected_value

    def explain(self, X, single_data):
        if isinstance(X, np.ndarray) and X.ndim == 1:
            X = X.reshape(1, -1)

        shap_values = self.explainer.shap_values(X)

        if isinstance(shap_values, list):
            if len(shap_values) > 1:
                vals = shap_values[1]
            else:
                vals = shap_values[0]
        elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
             if shap_values.shape[2] > 1:
                 vals = shap_values[:, :, 1]
             else:
                 vals = shap_values[:, :, 0]
        else:
            vals = shap_values

        shap_vals_row = np.array(vals).reshape(-1)

        explained = build_explanation(
            feature_names=self.feature_names,
            shap_values=shap_vals_row,
            base_value=self.base_value,
            single_data=single_data
        )

        return explained