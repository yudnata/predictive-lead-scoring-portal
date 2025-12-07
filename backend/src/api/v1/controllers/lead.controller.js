/* eslint-disable camelcase */
const leadService = require('../services/lead.service');
const ApiError = require('../utils/apiError');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const getJobId = (job) => {
  const jobs = [
    'admin.',
    'blue-collar',
    'entrepreneur',
    'housemaid',
    'management',
    'retired',
    'self-employed',
    'services',
    'student',
    'technician',
    'unemployed',
    'unknown',
  ];
  if (!job) return 12;
  const idx = jobs.indexOf(String(job).toLowerCase().trim());
  return idx !== -1 ? idx + 1 : 12;
};

const getMaritalId = (marital) => {
  const ms = ['divorced', 'married', 'single'];
  if (!marital) return 3;
  const idx = ms.indexOf(String(marital).toLowerCase().trim());
  return idx !== -1 ? idx + 1 : 3;
};

const getEducationId = (edu) => {
  const eds = ['primary', 'secondary', 'tertiary', 'unknown'];
  if (!edu) return 4;
  const idx = eds.indexOf(String(edu).toLowerCase().trim());
  return idx !== -1 ? idx + 1 : 4;
};

const mapMonthToId = (m) => {
  const months = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];
  if (!m) return 5;
  const idx = months.indexOf(String(m).toLowerCase().trim());
  return idx !== -1 ? idx + 1 : 5;
};

const mapPoutcomeToId = (p) => {
  const po = ['failure', 'other', 'success', 'unknown'];
  if (!p) return 4;
  const idx = po.indexOf(String(p).toLowerCase().trim());
  return idx !== -1 ? idx + 1 : 4;
};

exports.uploadLeadsCSV = async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'File CSV tidak ditemukan'));

  const uploadsDir = path.join(__dirname, '../../../../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const tempFilePath = path.join(uploadsDir, `temp-${Date.now()}-${req.file.originalname}`);

  try {
    fs.writeFileSync(tempFilePath, req.file.buffer);
  } catch (err) {
    return next(new ApiError(500, 'Gagal menyimpan file temporary'));
  }

  res.status(201).json({
    status: 'success',
    message: 'File diterima. Data sedang diproses di background.',
    data: { in_progress: true },
  });

  (async () => {
    try {
      console.log('🚀 Sending request to ML API:', tempFilePath);
      const response = await axios.post('http://localhost:5001/predict', {
        file_path: tempFilePath,
      });

      const processedData = response.data;

      if (processedData.error) {
        console.error('❌ ML API Error:', processedData.error);
        return;
      }

      if (!Array.isArray(processedData)) {
        console.error('❌ Invalid output format from ML API');
        return;
      }

      const leadsToInsert = processedData.map((row, index) => {
        const realName = row.lead_name || row.nama || row.name || `Lead ${index + 1}`;
        const realPhone = row.lead_phone_number || row.phone || row.nomor_telepon || row.telephone || null;

        const realEmail =
          row.lead_email || row.email || `noemail-${Date.now()}-${index}@missing.com`;

        const isDefault =
          String(row.default || '')
            .toLowerCase()
            .trim() === 'yes';
        const isHousing =
          String(row.housing || '')
            .toLowerCase()
            .trim() === 'yes';
        const isLoan =
          String(row.loan || '')
            .toLowerCase()
            .trim() === 'yes';

        return {
          lead_name: realName,
          lead_phone_number: realPhone,
          lead_email: realEmail,
          lead_age: row.age ? parseInt(row.age) : 30,

          job_id: getJobId(row.job),
          marital_id: getMaritalId(row.marital),
          education_id: getEducationId(row.education),

          lead_default: isDefault,
          lead_balance: row.balance ? parseInt(row.balance) : 0,
          lead_housing_loan: isHousing,
          lead_loan: isLoan,

          last_contact_day: row.day ? parseInt(row.day) : null,
          month_id: mapMonthToId(row.month),
          last_contact_duration_sec: row.duration ? parseInt(row.duration) : 0,
          campaign_count: row.campaign ? parseInt(row.campaign) : 1,
          pdays: row.pdays ? parseInt(row.pdays) : -1,
          prev_contact_count: row.previous ? parseInt(row.previous) : 0,
          poutcome_id: mapPoutcomeToId(row.poutcome),

          lead_score: row.ml_score !== undefined ? parseFloat(row.ml_score) : 0.0,
        };
      });

      const result = await leadService.bulkInsertWithScore(leadsToInsert);

      if (result.errors.length > 0) {
        console.log('Sampel Error DB:', result.errors.slice(0, 3));
      }
    } catch (err) {
      console.error('❌ ML API Request Failed:', err.message);
      if (err.response) {
        console.error('API Response:', err.response.data);
      }
    } finally {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
  })();
};

exports.createLead = async (req, res, next) => {
  try {
    const { leadData, detailData } = req.body;
    if (!leadData) {
      const lead = await leadService.createLead(req.body, req.body);
      return res.status(201).json({ status: 'success', data: lead });
    }
    const lead = await leadService.createLead(leadData, detailData);
    return res.status(201).json({ status: 'success', data: lead });
  } catch (error) {
    next(error);
  }
};

exports.getAllLeads = async (req, res, next) => {
  try {
    const result = await leadService.queryLeads(req.query);
    return res.status(200).json({ status: 'success', ...result });
  } catch (error) {
    next(error);
  }
};

exports.getLeadById = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.leadId);
    return res.status(200).json({ status: 'success', data: lead });
  } catch (error) {
    next(error);
  }
};

exports.updateLead = async (req, res, next) => {
  try {
    const lead = await leadService.updateLeadById(
      req.params.leadId,
      req.body.leadData || req.body,
      req.body.detailData || req.body
    );
    return res.status(200).json({ status: 'success', data: lead });
  } catch (error) {
    next(error);
  }
};

exports.deleteLead = async (req, res, next) => {
  try {
    await leadService.deleteLeadById(req.params.leadId);
    return res.status(200).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

exports.getCampaignsByLeadId = async (req, res, next) => {
  try {
    const campaigns = await leadService.getCampaignsByLeadId(req.params.leadId);
    return res.status(200).json({ status: 'success', data: campaigns });
  } catch (error) {
    next(error);
  }
};

exports.batchDeleteLeads = async (req, res, next) => {
  try {
    const { leadIds } = req.body;
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res
        .status(400)
        .json({ status: 'error', message: 'leadIds must be a non-empty array' });
    }
    const result = await leadService.batchDeleteLeads(leadIds);
    return res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};
