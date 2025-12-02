DROP TABLE IF EXISTS tb_lead_status_history, tb_notes, tb_campaign_leads, tb_campaign_assignments, tb_leads_score, tb_models, tb_leads_detail, tb_leads, tb_campaigns, tb_users, tb_roles, tb_status, tb_job, tb_marital, tb_education, tb_poutcome, tb_contact_method CASCADE;

CREATE TABLE tb_roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE tb_job (
    job_id SERIAL PRIMARY KEY,
    job_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE tb_marital (
    marital_id SERIAL PRIMARY KEY,
    marital_status VARCHAR(50) NOT NULL
);

CREATE TABLE tb_education (
    education_id SERIAL PRIMARY KEY,
    education_level VARCHAR(100) NOT NULL
);

CREATE TABLE tb_poutcome (
    poutcome_id SERIAL PRIMARY KEY,
    poutcome_name VARCHAR(100) NOT NULL
);

CREATE TABLE tb_contact_method (
    contactmethod_id SERIAL PRIMARY KEY,
    contact_method_name VARCHAR(100) NOT NULL
);

CREATE TABLE tb_status (
    status_id SERIAL PRIMARY KEY,
    status VARCHAR(100) NOT NULL
);

CREATE TABLE tb_models (
    model_id SERIAL PRIMARY KEY,
    model_name VARCHAR(100),
    model_desc VARCHAR(255),
    model_endpoint_url VARCHAR(255),
    model_version VARCHAR(50)
);

CREATE TABLE tb_users (
    user_id SERIAL PRIMARY KEY,
    roles_id INT NOT NULL REFERENCES tb_roles(role_id),
    user_email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    country VARCHAR(100),
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tb_campaigns (
    campaign_id SERIAL PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_start_date DATE,
    campaign_end_date DATE,
    campaign_desc TEXT,
    campaign_status VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tb_leads (
    lead_id SERIAL PRIMARY KEY,
    lead_name VARCHAR(255) NOT NULL,
    lead_phone_number VARCHAR(50),
    lead_email VARCHAR(255) UNIQUE,
    lead_age INT,
    job_id INT REFERENCES tb_job(job_id),
    marital_id INT REFERENCES tb_marital(marital_id),
    education_id INT REFERENCES tb_education(education_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tb_leads_detail (
    leads_detail_id SERIAL PRIMARY KEY,
    lead_id INT NOT NULL REFERENCES tb_leads(lead_id) ON DELETE CASCADE,
    lead_default BOOLEAN,
    lead_balance INT,
    lead_housing_loan BOOLEAN,
    lead_loan BOOLEAN,
    last_contact_date DATE,
    last_contact_duration_sec INT,
    pDays INT,
    poutcome_id INT REFERENCES tb_poutcome(poutcome_id),
    prev_contact_count INT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tb_leads_score (
    lead_score_id SERIAL PRIMARY KEY,
    lead_id INT NOT NULL REFERENCES tb_leads(lead_id) ON DELETE CASCADE,
    lead_score NUMERIC(5, 4),
    model_id INT REFERENCES tb_models(model_id),
    predicted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tb_campaign_assignments (
    assignment_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES tb_users(user_id),
    campaign_id INT NOT NULL REFERENCES tb_campaigns(campaign_id),
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tb_campaign_leads (
    campaignleads_id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL REFERENCES tb_campaigns(campaign_id),
    lead_id INT NOT NULL REFERENCES tb_leads(lead_id) ON DELETE CASCADE, -- <<< PERUBAHAN DI SINI
    user_id INT REFERENCES tb_users(user_id), -- Sales user
    contactmethod_id INT REFERENCES tb_contact_method(contactmethod_id),
    status_id INT NOT NULL REFERENCES tb_status(status_id),
    contact_this_campaign_num INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tb_notes (
    notes_id SERIAL PRIMARY KEY,
    lead_id INT NOT NULL REFERENCES tb_leads(lead_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES tb_users(user_id),
    campaign_id INT REFERENCES tb_campaigns(campaign_id),
    note_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tb_lead_status_history (
    history_id SERIAL PRIMARY KEY,
    lead_id INT NOT NULL REFERENCES tb_leads(lead_id) ON DELETE CASCADE, -- <<< PERUBAHAN DI SINI
    campaign_id INT REFERENCES tb_campaigns(campaign_id),
    status_id INT NOT NULL REFERENCES tb_status(status_id),
    changed_by INT NOT NULL REFERENCES tb_users(user_id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);


INSERT INTO tb_roles (role_name) VALUES ('admin'), ('sales');

INSERT INTO tb_status (status) VALUES ('Belum Dihubungi'), ('Sedang Dihubungi'), ('Deal'), ('Reject'), ('Hubungi Kembali');

-- password123
INSERT INTO tb_users (roles_id, user_email, password, full_name, is_active)
VALUES
(1, 'admin@accenture.com', '$2b$10$GQzLACGkxGXlqyLlW8MKeODQJkpoid3by5RRO.P.ggaE7X.q0Zymy', 'Admin Utama', true),
(2, 'yudhinata04@gmail.com', '$2b$10$GQzLACGkxGXlqyLlW8MKeODQJkpoid3by5RRO.P.ggaE7X.q0Zymy', 'Sales Satu', true),
(2, 'salesfalse@accenture.com', '$2b$10$GQzLACGkxGXlqyLlW8MKeODQJkpoid3by5RRO.P.ggaE7X.q0Zymy', 'Sales Dua', false);

INSERT INTO tb_job (job_name) VALUES ('Mahasiswa'), ('Karyawan Swasta'), ('Wiraswasta'), ('PNS'), ('Tidak Bekerja');
INSERT INTO tb_marital (marital_status) VALUES ('Menikah'), ('Belum Menikah'), ('Cerai');
INSERT INTO tb_education (education_level) VALUES ('SMA'), ('D3'), ('S1'), ('S2'), ('Lainnya');