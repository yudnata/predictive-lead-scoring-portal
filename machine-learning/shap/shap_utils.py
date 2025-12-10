import numpy as np


def shap_value_to_prob_delta(shap_value, base_value):
    """
    Convert SHAP log-odds output into probability delta (%).
    This helps explain exactly how each feature influences the final probability.

    Parameters:
    - shap_value : float
    - base_value : float

    Returns:
    - delta (float): in percentage (+/-)
    """
    p0 = 1 / (1 + np.exp(-base_value))
    p1 = 1 / (1 + np.exp(-(base_value + shap_value)))
    return (p1 - p0) * 100


def build_explanation(feature_names, shap_values, base_value):
    """
    Transform SHAP values into structured explanation:
    - base probability
    - impact of each feature in %
    - sorted list for dashboard
    """

    base_prob = 1 / (1 + np.exp(-base_value)) * 100

    impacts = []
    for feature, shap_val in zip(feature_names, shap_values):
        impact_pct = shap_value_to_prob_delta(shap_val, base_value)
        impacts.append({
            "feature": feature,
            "shap_value": float(shap_val),
            "impact_pct": float(impact_pct)
        })

    # Sort berdasarkan pengaruh terbesar
    impacts_sorted = sorted(impacts, key=lambda x: abs(x["impact_pct"]), reverse=True)

    # Buat narasi ringkas (top 3)
    top_sentences = [
        f"{item['feature']}: {item['impact_pct']:+.2f}%"
        for item in impacts_sorted[:3]
    ]

    return {
        "base_value": float(base_value),
        "base_prob_pct": float(base_prob),
        "feature_impacts": impacts_sorted,
        "top_sentences": top_sentences
    }