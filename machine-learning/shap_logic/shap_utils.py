import numpy as np

FEATURE_LABELS = {
    'duration': ('Call Duration', 'Long call shows strong engagement', 'Short call indicates lack of interest'),
    'age': ('Customer Age', 'Age profile matches target demographic', 'Age group typically has lower conversion'),
    'balance': ('Account Balance', 'High balance indicates financial capacity', 'Lower balance might limit options'),
    'campaign': ('Campaign Contacts', 'Follow-up helped build interest', 'Too many contacts may have caused fatigue'),
    'pdays': ('Days Since Last Contact', 'Recent engagement keeps interest fresh', 'Too long since last contact'),
    'previous': ('Previous Contacts', 'Prior relationship builds trust', 'Limited prior engagement'),
    'day': ('Contact Day', 'Good timing for financial decisions', 'Timing was suboptimal'),
    'poutcome_success': ('Previous Campaign Success', 'Already showed interest in our products', 'N/A'),
    'poutcome_failure': ('Previous Campaign Rejection', 'N/A', 'Previously declined similar offers'),
    'poutcome_unknown': ('First-Time Contact', 'Fresh prospect with no negative history', 'No prior data to predict behavior'),
    'poutcome_other': ('Previous Campaign Other', 'Has prior campaign history', 'Unclear prior outcome'),
    'housing_yes': ('Has Housing Loan', 'Shows trust in financial institutions', 'Existing debt may limit new commitments'),
    'housing_no': ('No Housing Loan', 'More capacity for new products', 'May be less engaged with banking'),
    'loan_yes': ('Has Personal Loan', 'Active banking relationship', 'Existing debt reduces appetite'),
    'loan_no': ('No Personal Loan', 'Lower debt, more flexibility', 'Less active banking relationship'),
    'default_yes': ('Credit Default History', 'N/A', 'Past default indicates financial difficulties'),
    'default_no': ('Clean Credit History', 'Good financial responsibility', 'N/A'),
    'contact_cellular': ('Mobile Contact', 'Personal mobile shows accessibility', 'N/A'),
    'contact_telephone': ('Landline Contact', 'Traditional contact established', 'May be harder to reach'),
    'contact_unknown': ('Unknown Contact Method', 'N/A', 'Missing contact info limits engagement'),
    'job_retired': ('Retired', 'Stable income and time for planning', 'May be more conservative with spending'),
    'job_management': ('Management Role', 'Higher income and decision power', 'May be too busy'),
    'job_technician': ('Technical Professional', 'Stable employment, good income', 'N/A'),
    'job_admin.': ('Administrative Role', 'Regular income', 'Limited disposable income'),
    'job_blue-collar': ('Blue-Collar Work', 'Steady employment', 'Variable income levels'),
    'job_services': ('Services Sector', 'Customer-facing experience', 'Variable income'),
    'job_entrepreneur': ('Entrepreneur', 'Risk-tolerant mindset', 'Variable income may limit commitment'),
    'job_self-employed': ('Self-Employed', 'Independent decision maker', 'Unpredictable income'),
    'job_unemployed': ('Unemployed', 'May be seeking financial solutions', 'Limited financial capacity'),
    'job_student': ('Student', 'Future potential customer', 'Limited current income'),
    'job_housemaid': ('Domestic Worker', 'Steady work', 'Lower income bracket'),
    'job_unknown': ('Unknown Job', 'N/A', 'Incomplete profile data'),
    'marital_married': ('Married', 'Stable household finances', 'Joint decisions may slow process'),
    'marital_single': ('Single', 'Quick individual decisions', 'May have other priorities'),
    'marital_divorced': ('Divorced', 'Independent decision maker', 'May be financially cautious'),
    'education_tertiary': ('University Educated', 'Understands complex products', 'May be more skeptical'),
    'education_secondary': ('High School Education', 'Straightforward communication works', 'May need simpler explanations'),
    'education_primary': ('Primary Education', 'Values simple, clear offers', 'May distrust complex products'),
    'education_unknown': ('Unknown Education', 'N/A', 'Incomplete profile data'),
    'month_jan': ('January Contact', 'New year financial planning mindset', 'Post-holiday financial strain'),
    'month_feb': ('February Contact', 'Quiet month for decisions', 'Low engagement period'),
    'month_mar': ('March Contact', 'Q1 planning still active', 'N/A'),
    'month_apr': ('April Contact', 'Spring financial review', 'Tax concerns may distract'),
    'month_may': ('May Contact', 'Optimistic spring mindset', 'Pre-summer distractions'),
    'month_jun': ('June Contact', 'Mid-year review timing', 'Summer vacation planning'),
    'month_jul': ('July Contact', 'N/A', 'Peak vacation season'),
    'month_aug': ('August Contact', 'N/A', 'Holiday distractions continue'),
    'month_sep': ('September Contact', 'Back-to-business mindset', 'Back-to-school expenses'),
    'month_oct': ('October Contact', 'Year-end planning begins', 'N/A'),
    'month_nov': ('November Contact', 'Year-end financial review', 'Pre-holiday budget concerns'),
    'month_dec': ('December Contact', 'Year-end decisions and bonuses', 'Holiday busyness'),
}

def fmt_val(val, raw):
    try:
        if raw == 'duration':
            m = int(val // 60)
            s = int(val % 60)
            return f"{m}m {s}s"
        if raw == 'pdays':
            return f"{val} days" if val != -1 else "Not Contacted"
        if raw == 'day':
            return f"Day {val}"
        if raw == 'balance':
            return f"€{val}"
        if raw == 'previous':
            return f"{val} times"
        return str(val)
    except:
        return str(val)

def shap_value_to_prob_delta(shap_value, base_value):
    p0 = 1 / (1 + np.exp(-base_value))
    p1 = 1 / (1 + np.exp(-(base_value + shap_value)))
    return (p1 - p0) * 100

def generate_narrative(raw, val, formatted_val, label, feature_value, context):
    narrative = ""
    raw = raw.lower()

    def clean(text):
        return text.strip().rstrip('.')

    if context:
        ctx = clean(context)
        
        if raw == 'duration':
            narrative = f"This Lead has {formatted_val} call duration. {ctx}."
        elif raw == 'age':
            narrative = f"This Lead is {formatted_val} years old. {ctx}."
        elif raw == 'balance':
            narrative = f"This Lead has a balance of {formatted_val}. {ctx}."
        elif raw == 'campaign':
            narrative = f"This Lead has been contacted {formatted_val} times. {ctx}."
        elif raw == 'pdays':
             if val == -1 or str(val) == '-1':
                 narrative = f"This Lead has not been contacted recently. {ctx}."
             else:
                 narrative = f"It has been {formatted_val} since the last contact. {ctx}."
        elif raw == 'previous':
            narrative = f"This Lead was contacted {formatted_val} previously. {ctx}."
        elif raw == 'day':
            narrative = f"Contact was made on {formatted_val} of the month. {ctx}."
        elif 'housing' in raw:
             narrative = f"This Lead {'has' if 'yes' in raw else 'does not have'} a housing loan. {ctx}."
        elif 'loan' in raw:
             narrative = f"This Lead {'has' if 'yes' in raw else 'does not have'} a personal loan. {ctx}."
        elif 'default' in raw:
             narrative = f"This Lead {'has' if 'yes' in raw else 'does not have'} credit in default. {ctx}."
        elif 'poutcome' in raw:
             outcome = raw.split('_')[1] if '_' in raw else raw
             narrative = f"Previous campaign outcome was {outcome}. {ctx}."
        elif 'contact' in raw:
             method = raw.split('_')[1] if '_' in raw else raw
             narrative = f"This Lead was contacted via {method}. {ctx}."
        elif 'job' in raw:
             job = raw.split('_')[1] if '_' in raw else raw
             narrative = f"This Lead works as a {job}. {ctx}."
        elif 'marital' in raw:
             status = raw.split('_')[1] if '_' in raw else raw
             narrative = f"This Lead is {status}. {ctx}."
        elif 'education' in raw:
             edu = raw.split('_')[1] if '_' in raw else raw
             narrative = f"This Lead has {edu} education. {ctx}."
        elif 'month' in raw:
             mon = raw.split('_')[1] if '_' in raw else raw
             narrative = f"Last contact was in {mon.capitalize()}. {ctx}."
        else:
            if feature_value:
                narrative = f"This Lead's {label} is {feature_value}. {ctx}."
            else:
                narrative = f"{label}. {ctx}."
    else:
         narrative = f"{label}: {feature_value}."

    return narrative

def build_explanation(feature_names, shap_values, base_value, single_data):
    """
    Transform SHAP values into rich structured explanation for the UI.
    Requires single_data (raw feature values) to generate narratives.
    """
    base_prob = 1 / (1 + np.exp(-base_value)) * 100

    numeric_cols = {"age", "balance", "day", "duration", "campaign", "pdays", "previous"}
    cat_keys = ["job", "marital", "education", "default", "housing", "loan", "contact", "month", "poutcome"]

    active_cats = {}
    for k in cat_keys:
        if k in single_data:
            active_cats[k] = str(single_data[k]).lower()

    impacts = []

    for feature, shap_val in zip(feature_names, shap_values):
        fname_norm = feature.lower()

        is_active = False
        matched_cat_key = None

        if fname_norm in numeric_cols:
            is_active = True
        else:
            for cat, active_val in active_cats.items():
                prefix = f"{cat}_"
                if fname_norm.startswith(prefix):
                    matched_cat_key = cat
                    suffix = fname_norm[len(prefix):]
                    s_norm = suffix.replace('.', '').replace('-', '').replace(' ', '')
                    v_norm = active_val.replace('.', '').replace('-', '').replace(' ', '')

                    if s_norm == v_norm:
                        is_active = True
                    break

        if not is_active:
            continue

        impact_pct = shap_value_to_prob_delta(shap_val, base_value)
        impacts.append({
            "raw_feature": feature,
            "shap_value": float(shap_val),
            "impact_pct": float(impact_pct),
            "cat_key": matched_cat_key
        })

    impacts_sorted = sorted(impacts, key=lambda x: abs(x["impact_pct"]), reverse=True)

    def get_feature_value_and_formatted(raw, cat_key, single_data):
        val = None
        formatted_val = ""
        feature_value = ""

        if raw in single_data:
            val = single_data[raw]
            formatted_val = fmt_val(val, raw)
            if raw == 'age':
                feature_value = f"{formatted_val} Years"
            else:
                feature_value = str(formatted_val)
        elif cat_key and cat_key in single_data:
            val = single_data[cat_key]
            formatted_val = str(val)
            feature_value = str(val).title()

        return val, formatted_val, feature_value

    top_explanations = []
    for item in impacts_sorted[:5]:
        raw = item['raw_feature'].lower()
        impact = item['impact_pct']
        cat_key = item.get('cat_key')

        if raw in FEATURE_LABELS:
            label_data = FEATURE_LABELS[raw]
            label = label_data[0]
            context = label_data[1] if impact > 0 else label_data[2]
            if context == 'N/A':
                context = ""
        else:
            label = item['raw_feature'].replace('_', ' ').title()
            context = ""

        val, formatted_val, feature_value = get_feature_value_and_formatted(raw, cat_key, single_data)
        narrative = generate_narrative(raw, val, formatted_val, label, feature_value, context)

        top_explanations.append({
            "feature": label,
            "feature_value": feature_value,
            "narrative": narrative,
            "impact": impact,
            "impact_pct": impact,
            "direction": "positive" if impact > 0 else "negative",
            "context": context,
        })

    all_impacts_simplified = []
    for item in impacts_sorted:
        raw = item['raw_feature'].lower()
        cat_key = item.get('cat_key')

        if raw in FEATURE_LABELS:
            label = FEATURE_LABELS[raw][0]
        else:
            label = item['raw_feature'].replace('_', ' ').title()

        val, formatted_val, feature_value = get_feature_value_and_formatted(raw, cat_key, single_data)

        all_impacts_simplified.append({
            "feature": label,
            "feature_value": feature_value,
            "impact_pct": item['impact_pct']
        })

    return {
        "base_value": float(base_value),
        "base_prob_pct": float(base_prob),
        "top_explanations": top_explanations,
        "all_impacts": all_impacts_simplified
    }