const leadService = require('../services/lead.service');
const ApiError = require('../utils/apiError');

exports.createLead = async (req, res, next) => {
  try {
    const { leadData, detailData } = req.body;
    if (!leadData || !detailData) {
      throw new ApiError(400, 'Format body salah, harus ada leadData dan detailData');
    }
    const lead = await leadService.createLead(leadData, detailData);
    res.status(201).json({
      status: 'success',
      message: 'Lead berhasil dibuat',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLead = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const { leadData, detailData } = req.body;
    
    const lead = await leadService.updateLeadById(leadId, leadData, detailData);
    res.status(200).json({
      status: 'success',
      message: 'Lead berhasil diupdate',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteLead = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    await leadService.deleteLeadById(leadId);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllLeads = async (req, res, next) => {
  try {
    const result = await leadService.queryLeads(req.query);
    res.status(200).json({
      status: 'success',
      message: 'Data leads berhasil diambil',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeadById = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const lead = await leadService.getLeadById(leadId);
    res.status(200).json({
      status: 'success',
      message: 'Detail lead berhasil diambil',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadLeadsCSV = async (req, res, next) => {
  try {
    res.status(501).json({
      status: 'info',
      message: 'Endpoint /upload-csv belum diimplementasikan',
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadLeadsCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'File CSV tidak ditemukan');
    }

    const fileBuffer = req.file.buffer;
    const result = await leadService.bulkCreateLeadsFromCSV(fileBuffer);
    
    res.status(201).json({
      status: 'success',
      message: 'Upload CSV berhasil diproses',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};