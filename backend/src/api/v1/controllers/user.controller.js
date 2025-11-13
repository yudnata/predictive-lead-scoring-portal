// Kerangka Controller untuk User Management (Admin)

exports.getAllSalesUsers = async (req, res, next) => {
  res.status(200).json({ message: 'getAllSalesUsers not implemented', data: [] });
};
exports.createSalesUser = async (req, res, next) => {
  res.status(201).json({ message: 'createSalesUser not implemented' });
};
exports.getSalesUserById = async (req, res, next) => {
  res.status(200).json({ message: `getSalesUserById ${req.params.userId} not implemented` });
};
exports.updateSalesUser = async (req, res, next) => {
  res.status(200).json({ message: `updateSalesUser ${req.params.userId} not implemented` });
};
exports.deleteSalesUser = async (req, res, next) => {
  res.status(204).json({ message: `deleteSalesUser ${req.params.userId} not implemented` });
};