const userModel = require('../models/user.model');
const { hashPassword } = require('../utils/password.helper');
const ApiError = require('../utils/apiError');

const createSalesUser = async (userBody) => {
  const { user_email, password, full_name, is_active, campaign_ids } = userBody;

  if (!user_email || !password || !full_name) {
    throw new ApiError(400, 'Email, password, and full name are required');
  }

  const existingUser = await userModel.findByEmail(user_email);
  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  const hashedPassword = await hashPassword(password);

  const newUserdata = {
    ...userBody,
    password: hashedPassword,
    roles_id: 2,
    is_active: is_active !== undefined ? is_active : true,
  };

  const newUser = await userModel.create(newUserdata);

  if (campaign_ids && Array.isArray(campaign_ids) && campaign_ids.length > 0) {
    await userModel.assignCampaigns(newUser.user_id, campaign_ids);
  }

  delete newUser.password;
  return newUser;
};

const querySalesUsers = async (queryOptions) => {
  const page = parseInt(queryOptions.page, 10) || 1;
  const limit = parseInt(queryOptions.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = queryOptions.search || '';

  const isActive = queryOptions.is_active || queryOptions.isActive;
  const minLeadsHandled = queryOptions.min_leads || queryOptions.minLeadsHandled;
  const maxLeadsHandled = queryOptions.max_leads || queryOptions.maxLeadsHandled;

  const options = { limit, offset, search, isActive, minLeadsHandled, maxLeadsHandled };

  const users = await userModel.findAllSales(options);
  const totalUsers = await userModel.countAllSales(options);
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    data: users,
    meta: {
      total: totalUsers,
      page,
      limit,
      totalPages,
    },
  };
};

const getSalesUserById = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user || user.role_name !== 'sales') {
    throw new ApiError(404, 'Sales user not found');
  }

  const assignedCampaignIds = await userModel.getAssignments(userId);

  delete user.password;
  return { ...user, campaign_ids: assignedCampaignIds };
};

const updateSalesUserById = async (userId, updateBody) => {
  const { campaign_ids, ...userData } = updateBody;

  await getSalesUserById(userId);

  if (userData.user_email) {
    const existingUser = await userModel.findByEmail(userData.user_email);
    if (existingUser && existingUser.user_id !== parseInt(userId, 10)) {
      throw new ApiError(400, 'Email already used by another user');
    }
  }

  if (userData.password) {
    userData.password = await hashPassword(userData.password);
  } else {
    delete userData.password;
  }

  delete userData.roles_id;

  const updatedUser = await userModel.update(userId, userData);

  if (campaign_ids && Array.isArray(campaign_ids)) {
    await userModel.deleteAssignments(userId);
    if (campaign_ids.length > 0) {
      await userModel.assignCampaigns(userId, campaign_ids);
    }
  }

  delete updatedUser.password;
  return updatedUser;
};

const deleteSalesUserById = async (userId) => {
  await getSalesUserById(userId);
  await userModel.deleteAssignments(userId);
  await userModel.deleteById(userId);
};

module.exports = {
  createSalesUser,
  querySalesUsers,
  getSalesUserById,
  updateSalesUserById,
  deleteSalesUserById,
};
