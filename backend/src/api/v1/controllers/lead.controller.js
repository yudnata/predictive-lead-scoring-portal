const leadService = require('../services/lead.service');
const ApiError = require('../utils/apiError');

// @desc    Membuat Lead baru
// @route   POST /api/v1/leads
// @access  Private (Admin)
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

// @desc    Meng-update Lead
// @route   PATCH /api/v1/leads/:leadId
// @access  Private (Admin)
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

// @desc    Menghapus Lead
// @route   DELETE /api/v1/leads/:leadId
// @access  Private (Admin)
exports.deleteLead = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    await leadService.deleteLeadById(leadId);
    res.status(204).json({
      status: 'success',
      data: null, // 204 No Content
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mengambil semua Leads
// @route   GET /api/v1/leads
// @access  Private (Admin, Sales)
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

// @desc    Mengambil detail satu Lead
// @route   GET /api/v1/leads/:leadId
// @access  Private (Admin, Sales)
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

// @desc    Upload Leads via CSV
// @route   POST /api/v1/leads/upload-csv
// @access  Private (Admin)
exports.uploadLeadsCSV = async (req, res, next) => {
  try {
    // Logika upload CSV akan ditambahkan di sini
    // Ini memerlukan 'multer' untuk file handling
    // dan 'fast-csv' untuk parsing
    res.status(501).json({
      status: 'info',
      message: 'Endpoint /upload-csv belum diimplementasikan',
    });
  } catch (error) {
    next(error);
  }
};