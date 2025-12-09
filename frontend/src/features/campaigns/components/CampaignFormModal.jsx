import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import CampaignService from '../api/campaign-service';

import UserService from '../../users/api/user-service';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CampaignFormModal = ({ isOpen, onClose, initialData, onSuccess }) => {
  const isEdit = !!initialData;
  const [salesList, setSalesList] = useState([]);
  const [selectedSales, setSelectedSales] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);

  const [formData, setFormData] = useState({
    campaign_name: '',
    campaign_desc: '',
    campaign_status: true,
  });

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSales = async () => {
      try {
        const sales = await UserService.getAllOnlySales();
        setSalesList(sales);

        if (isEdit && initialData?.assigned_sales) {
          setSelectedSales(initialData.assigned_sales.map((s) => s.user_id));
        }
      } catch (err) {
        console.error('Failed to load sales:', err);
      }
    };

    if (isOpen) loadSales();
  }, [isOpen, isEdit, initialData]);

  const parseDateSafe = (dateString) => {
    if (!dateString) return null;
    const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFormData({
          campaign_name: initialData.campaign_name || '',
          campaign_desc: initialData.campaign_desc || '',
          campaign_status: initialData.campaign_is_active,
        });

        const start = parseDateSafe(initialData.campaign_start_date);
        const end = parseDateSafe(initialData.campaign_end_date);
        setDateRange([start, end]);

        setSelectedSales(initialData.assigned_sales?.map((s) => s.user_id) || []);
      } else {
        setFormData({
          campaign_name: '',
          campaign_desc: '',
          campaign_status: true,
        });
        setDateRange([null, null]);
        setSelectedSales([]);
      }
      setError('');
    }
  }, [initialData, isEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleStatus = () => {
    setFormData((prev) => ({
      ...prev,
      campaign_status: !prev.campaign_status,
    }));
  };

  const isFormValid =
    formData.campaign_name.trim() && startDate && endDate && formData.campaign_desc.trim();

  const formatDateToString = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        campaign_start_date: formatDateToString(startDate),
        campaign_end_date: formatDateToString(endDate),
        campaign_is_active: formData.campaign_status,
        assigned_sales: selectedSales,
      };

      if (isEdit) {
        await CampaignService.update(initialData.campaign_id, payload);
        onSuccess('Successfully updated campaign.');
      } else {
        await CampaignService.create(payload);
        onSuccess('Successfully added campaign.');
      }

      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while saving data.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-xl rounded-2xl shadow-2xl p-8 text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 relative overflow-visible transition-colors"> 
        <h2 className="mb-4 text-2xl font-bold tracking-wide text-gray-900 dark:text-white">
            {isEdit ? 'Edit Campaign' : 'Add Campaign'}
        </h2>
      <div className="mb-6 border-b border-gray-300 dark:border-white/10"></div>

        {error && (
          <div className="p-3 mb-6 text-sm text-red-700 border rounded-lg border-red-500/50 bg-red-100 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Campaign Name*</label>
            <input
              name="campaign_name"
              placeholder="Enter campaign name"
              value={formData.campaign_name}
              onChange={handleChange}
              required
              className="w-full p-2.5 bg-gray-100 text-gray-900 rounded-lg dark:bg-[#2C2C2C] dark:text-white focus:ring-1 focus:ring-brand outline-none border border-transparent dark:border-white/10"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Campaign Duration*
            </label>
            <div className="relative w-full">
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setDateRange(update);
                }}
                isClearable={true}
                placeholderText="Select date range"
                className="w-full p-2.5 bg-gray-100 text-gray-900 rounded-lg dark:bg-[#2C2C2C] dark:text-white focus:ring-1 focus:ring-brand outline-none cursor-pointer border border-transparent dark:border-white/10"
                wrapperClassName="w-full"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Description*</label>
            <textarea
              name="campaign_desc"
              rows="3"
              placeholder="Enter campaign description"
              value={formData.campaign_desc}
              onChange={handleChange}
              required
              className="w-full p-2.5 bg-gray-100 text-gray-900 rounded-lg dark:bg-[#2C2C2C] dark:text-white focus:ring-1 focus:ring-brand outline-none border border-transparent dark:border-white/10"
            ></textarea>
          </div>
          <div className="relative">
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Assign Sales</label>

            <button
              type="button"
              onClick={() => setOpenDropdown((prev) => !prev)}
              className="w-full p-2.5 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 flex justify-between items-center dark:bg-[#2C2C2C] dark:text-white dark:border-white/20"
            >
              {selectedSales.length > 0
                ? `${selectedSales.length} sales selected`
                : 'Select sales...'}
              <span>▼</span>
            </button>

            {openDropdown && (
              <div className="absolute z-40 w-full mt-1 bg-white dark:bg-[#2C2C2C] border border-gray-300 rounded-lg max-h-48 overflow-y-auto shadow-lg dark:border-white/20">
                {salesList.length === 0 ? (
                  <p className="p-3 text-gray-500 text-sm dark:text-gray-400">No sales available.</p>
                ) : (
                  salesList.map((s) => (
                    <label
                      key={s.user_id}
                      className="flex items-center gap-2 p-2 text-gray-800 hover:bg-gray-200 cursor-pointer dark:text-white dark:hover:bg-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSales.includes(s.user_id)}
                        onChange={() =>
                          setSelectedSales((prev) =>
                            prev.includes(s.user_id)
                              ? prev.filter((id) => id !== s.user_id)
                              : [...prev, s.user_id]
                          )
                        }
                      />
                      {s.full_name || s.user_email}
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="flex items-center pt-2 space-x-3">
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                type="checkbox"
                checked={formData.campaign_status}
                onChange={handleToggleStatus}
                className="absolute block w-5 h-5 bg-white border-4 rounded-full appearance-none cursor-pointer"
                style={{
                  right: formData.campaign_status ? '0' : 'auto',
                  left: formData.campaign_status ? 'auto' : '0',
                }}
              />
              <label
                className={`block overflow-hidden h-5 rounded-full cursor-pointer ${
                  formData.campaign_status ? 'bg-brand' : 'bg-gray-600'
                }`}
              ></label>
            </div>
            <span className="text-sm text-gray-900 dark:text-white">Active Campaign</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-300 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-gray-900 transition bg-gray-400 rounded-lg hover:bg-gray-500 dark:bg-[#3A3A3A] dark:text-white dark:hover:bg-[#4A4A4A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="px-6 py-2.5 text-sm font-semibold text-white transition rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CampaignFormModal;
