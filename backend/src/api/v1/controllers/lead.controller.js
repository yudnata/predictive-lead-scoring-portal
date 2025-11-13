// Ini adalah kerangka. Logika akan ditambahkan nanti.

exports.getAllLeads = async (req, res, next) => {
  try {
    // TODO: Tambahkan logika service untuk mengambil leads
    // TODO: Terapkan pagination, search, filter
    res.status(200).json({
      status: 'success',
      message: 'Fitur getAllLeads belum diimplementasi',
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

exports.createLead = async (req, res, next) => {
  try {
    // TODO: Logika service untuk membuat lead baru
    res.status(201).json({
      status: 'success',
      message: 'Fitur createLead belum diimplementasi',
      data: req.body,
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadLeadsCSV = async (req, res, next) => {
  try {
    // TODO: Logika untuk handling upload file CSV
    res.status(200).json({
      status: 'success',
      message: 'Fitur uploadLeadsCSV belum diimplementasi',
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeadById = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    // TODO: Logika service untuk mengambil detail lead
    res.status(200).json({
      status: 'success',
      message: `Fitur getLeadById (${leadId}) belum diimplementasi`,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLead = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    // TODO: Logika service untuk update lead
    res.status(200).json({
      status: 'success',
      message: `Fitur updateLead (${leadId}) belum diimplementasi`,
      data: req.body,
    });
  } catch (error) {
    next(error);
  }
};