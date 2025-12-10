/* eslint-disable camelcase */
const leadService = require('../services/lead.service');
const ApiError = require('../utils/apiError');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const uploadSession = require('../utils/uploadSession');

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

const getContactMethodId = (contact) => {
  if (!contact) return 3;
  const c = String(contact).toLowerCase().trim();
  if (c === 'cellular' || c === 'mobile') return 1;
  if (c === 'telephone' || c === 'landline') return 2;
  return 3;
};

exports.uploadLeadsCSV = async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'CSV file not found'));

  if (req.file.size > 10 * 1024 * 1024) {
    return next(new ApiError(400, 'File too large. Maximum 10MB'));
  }

  const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

  try {
    await axios.get(ML_API_URL, { timeout: 2000 });
  } catch (err) {
    console.error('[Health Check] ML Service unavailable:', err.message);
    return next(new ApiError(503, 'ML Service is unavailable. Please check the Python server.'));
  }

  const getSegmentId = (segmentName) => {
    const map = {
      'stable productive': 1,
      'high-income senior': 2,
      'responsive young': 3,
    };
    if (!segmentName) return null;
    return map[String(segmentName).toLowerCase().trim()] || null;
  };

  const sessionId = uploadSession.createSession();
  uploadSession.updateSession(sessionId, { status: 'processing', total: 0 });

  const parseCSV = (buffer) => {
    const content = buffer.toString();
    const rows = content.split(/\r?\n/).filter(row => row.trim() !== '');
    if (rows.length < 2) return [];

    const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^"|"$/g, ''));
      if (values.length === headers.length) {
        const obj = {};
        headers.forEach((h, index) => obj[h] = values[index]);
        data.push(obj);
      }
    }
    return data;
  };

  res.status(201).json({
    status: 'success',
    message: 'File accepted. Processing in background.',
    data: { in_progress: true, sessionId },
  });

  (async () => {
    try {
      let rawData = [];
      try {
        rawData = parseCSV(req.file.buffer);
      } catch (e) {
        console.error('❌ CSV Parsing Error:', e.message);
        uploadSession.updateSession(sessionId, { status: 'error', error: 'Failed to parse CSV file' });
        return;
      }

      if (rawData.length === 0) {
        uploadSession.updateSession(sessionId, { status: 'error', error: 'CSV file is empty or contains only headers' });
        return;
      }

      const limit = req.body.limit ? parseInt(req.body.limit, 10) : null;
      let finalData = rawData;

      if (limit && limit < rawData.length) {
         console.log(`Doing random sampling: ${limit} from ${rawData.length} leads.`);
         for (let i = rawData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rawData[i], rawData[j]] = [rawData[j], rawData[i]];
         }
         finalData = rawData.slice(0, limit);
      }

      console.log(`🚀 Sending ${finalData.length} leads (from original ${rawData.length}) to ML API.`);

      const headers = Object.keys(finalData[0]).join(',');
      const csvRows = finalData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
      const newCsvContent = [headers, ...csvRows].join('\n');
      const newBuffer = Buffer.from(newCsvContent, 'utf-8');

      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', newBuffer, {
        filename: 'sampled_leads.csv',
        contentType: 'text/csv',
      });

      const response = await axios.post(`${ML_API_URL}/predict`, form, {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 300000,
      });

      const processedData = response.data;

      if (processedData.error) {
        console.error('❌ ML API Error:', processedData.error);
        uploadSession.updateSession(sessionId, { status: 'error', error: processedData.error });
        return;
      }

      if (!Array.isArray(processedData)) {
        console.error('❌ Invalid output format from ML API');
        uploadSession.updateSession(sessionId, {
          status: 'error',
          error: 'Invalid data format from ML API',
        });
        return;
      }

      console.log(`✅ Received ${processedData.length} records from ML API. Inserting to DB...`);
      uploadSession.updateSession(sessionId, { total: processedData.length });

      const leadsToInsert = processedData.map((row, index) => {
        const realName = row.lead_name || row.nama || row.name || `Lead ${index + 1}`;
        const realPhone =
          row.lead_phone_number || row.phone || row.nomor_telepon || row.telephone || null;

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
          segment_id: getSegmentId(row.segment),

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
          contactmethod_id: getContactMethodId(row.contact),

          lead_score: row.ml_score !== undefined ? parseFloat(row.ml_score) : 0.0,
        };
      });

      const result = await leadService.bulkInsertWithScore(leadsToInsert, (progress) => {
        uploadSession.updateSession(sessionId, {
          saved: progress.saved,
          total: progress.total,
        });
      });

      if (result.errors.length > 0) {
        console.log('Sampel Error DB:', result.errors.slice(0, 3));
        uploadSession.updateSession(sessionId, {
          status: 'complete',
          saved: result.successCount,
          error: `${result.failureCount} records failed`,
        });
      } else {
        console.log('🎉 Bulk Insert Success!');
        uploadSession.updateSession(sessionId, {
          status: 'complete',
          saved: result.successCount,
        });
      }
    } catch (err) {
      console.error('❌ ML API Request Failed:', err.message);
      uploadSession.updateSession(sessionId, { status: 'error', error: err.message });
      if (err.response) {
        console.error('API Response:', err.response.data);
      }
    }
  })();
};

exports.getUploadStatus = (req, res) => {
  const { sessionId } = req.params;

  const session = uploadSession.getSession(sessionId);
  if (!session) {
    return res.status(404).json({ status: 'error', message: 'Session not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  res.write(
    `data: ${JSON.stringify({
      status: session.status,
      saved: session.saved,
      total: session.total,
      error: session.error,
    })}\n\n`
  );

  uploadSession.addClient(sessionId, res);
  const heartbeat = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    uploadSession.removeClient(sessionId, res);
  });
};

exports.createLead = async (req, res, next) => {
  try {
    const { leadData, detailData } = req.body;
    let finalLeadData = leadData || req.body;
    let finalDetailData = detailData || req.body;

    const lead = await leadService.createLead(finalLeadData, finalDetailData);

    return res.status(201).json({ status: 'success', data: lead });
  } catch (error) {
    next(error);
  }
};

exports.getSegments = async (req, res, next) => {
  try {
    const segments = await leadService.getAllSegments();
    return res.status(200).json({ status: 'success', data: segments });
  } catch (error) {
    next(error);
  }
};

exports.getLeadExplanation = async (req, res, next) => {
  try {
    const { leadId } = req.params;

    const lead = await leadService.getLeadById(leadId);
    if (!lead) {
      return res.status(404).json({ status: 'error', message: 'Lead not found' });
    }

    const monthNames = [
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

    const explanationPayload = {
      age: lead.lead_age || 30,
      balance: lead.lead_balance || 0,
      day: lead.last_contact_day || 1,
      duration: lead.last_contact_duration_sec || 0,
      campaign: lead.campaign_count || 0,
      pdays: lead.pdays !== undefined && lead.pdays !== null ? lead.pdays : 999,
      previous: lead.prev_contact_count || 0,
      job: lead.job_name?.toLowerCase() || 'unknown',
      marital: lead.marital_status?.toLowerCase() || 'unknown',
      education: lead.education_level?.toLowerCase() || 'unknown',
      default: lead.lead_default ? 'yes' : 'no',
      housing: lead.lead_housing_loan ? 'yes' : 'no',
      loan: lead.lead_loan ? 'yes' : 'no',
      contact: lead.contact_method_name?.toLowerCase() || 'unknown',
      month: lead.last_contact_date
        ? monthNames[new Date(lead.last_contact_date).getMonth()]
        : monthNames[(lead.month_id || 1) - 1] || 'jan',
      poutcome: lead.poutcome_name?.toLowerCase() || 'unknown',
    };

    const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';
    const mlResponse = await axios.post(`${ML_API_URL}/explain`, explanationPayload, {
      timeout: 30000,
    });

    if (mlResponse.data && mlResponse.data.success) {
      return res.status(200).json({
        status: 'success',
        data: {
          lead_id: lead.lead_id,
          lead_name: lead.lead_name,
          prediction_pct: mlResponse.data.prediction_pct,
          base_probability: mlResponse.data.base_probability,
          top_explanations: mlResponse.data.top_explanations,
          all_impacts: mlResponse.data.all_impacts,
        },
      });
    } else {
      return res.status(500).json({ status: 'error', message: 'ML API explanation failed' });
    }
  } catch (error) {
    console.error('[Lead Explanation] Error:', error.message);
    next(error);
  }
};

exports.getSegmentStats = async (req, res, next) => {
  try {
    const stats = await leadService.getSegmentStats();
    return res.status(200).json({ status: 'success', data: stats });
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
