import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import LeadService from '../api/lead-service';
import { ThemeContext } from '../../../context/ThemeContext';
import { useLeadOptions } from '../hooks/useLeadOptions';
import { formatNumber } from '../../../utils/formatters';

const LeadFormModal = ({ isOpen, onClose, initialData, onSuccess }) => {
  const isEdit = !!initialData;
  const [activeTab, setActiveTab] = useState('manual');
  const [formData, setFormData] = useState({});
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [error, setError] = useState('');

  const { jobOptions, maritalOptions, educationOptions, poutcomeOptions, contactMethodOptions } =
    useLeadOptions();

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        lead_name: initialData.lead_name || '',
        lead_phone_number: initialData.lead_phone_number || '',
        lead_email: initialData.lead_email || '',
        lead_age: initialData.lead_age || '',
        job_id: initialData.job_id || '',
        marital_id: initialData.marital_id || '',
        education_id: initialData.education_id || '',
        lead_balance: initialData.lead_balance || '',
        lead_housing_loan: initialData.lead_housing_loan || false,
        lead_loan: initialData.lead_loan || false,
        contactmethod_id: initialData.contactmethod_id || '',
        last_contact_day:
          typeof initialData.last_contact_day === 'string' && initialData.last_contact_day.includes('-')
            ? initialData.last_contact_day.split('T')[0]
            : '',
        last_contact_duration_sec: initialData.last_contact_duration_sec || '',
        campaign_count: initialData.campaign_count || '',
        pdays: initialData.pdays || '',
        prev_contact_count: initialData.prev_contact_count || '',
        poutcome_id: initialData.poutcome_id || '',
      });
    } else {
      setFormData({
        lead_name: '',
        lead_phone_number: '',
        lead_email: '',
        lead_age: '',
        job_id: '',
        marital_id: '',
        education_id: '',
        lead_balance: '',
        lead_housing_loan: false,
        lead_loan: false,
        contactmethod_id: '',
        last_contact_day: '',
        last_contact_duration_sec: '',
        campaign_count: '',
        pdays: '',
        prev_contact_count: '',
        poutcome_id: '',
      });
      setCsvFile(null);
    }
    setError('');
  }, [initialData, isEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleBalanceChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, lead_balance: rawValue });
  };

  const handleCsvChange = (e) => {
    setCsvFile(e.target.files[0] || null);
  };

  const downloadTemplate = () => {
    const headers = [
      'lead_name',
      'lead_phone_number',
      'lead_email',
      'lead_age',
      'job_id',
      'marital_id',
      'education_id',
      'lead_balance',
      'lead_housing_loan',
      'lead_loan',
    ];
    const csvContent = [headers.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'lead_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'manual') {
        const leadData = {
          lead_name: formData.lead_name,
          lead_phone_number: formData.lead_phone_number,
          lead_email: formData.lead_email,
          lead_age: formData.lead_age ? parseInt(formData.lead_age) : null,
          job_id: formData.job_id ? parseInt(formData.job_id) : null,
          marital_id: formData.marital_id ? parseInt(formData.marital_id) : null,
          education_id: formData.education_id ? parseInt(formData.education_id) : null,
        };

        const contactDate = new Date(formData.last_contact_day || new Date());

        const detailData = {
          lead_balance: formData.lead_balance ? parseFloat(formData.lead_balance) : 0,
          lead_housing_loan: formData.lead_housing_loan,
          lead_loan: formData.lead_loan,

          last_contact_day: contactDate.getDate(),
          month_id: contactDate.getMonth() + 1,
          last_contact_duration_sec:
            formData.last_contact_duration_sec !== ''
              ? parseInt(formData.last_contact_duration_sec)
              : 0,
          campaign_count: formData.campaign_count !== '' ? parseInt(formData.campaign_count) : 0,
          pdays: formData.pdays !== '' ? parseInt(formData.pdays) : 0,
          prev_contact_count:
            formData.prev_contact_count !== '' ? parseInt(formData.prev_contact_count) : 0,
          poutcome_id: formData.poutcome_id ? parseInt(formData.poutcome_id) : null,
          contactmethod_id: formData.contactmethod_id ? parseInt(formData.contactmethod_id) : null,
        };

        if (isEdit) {
          await LeadService.update(initialData.lead_id, leadData, detailData);
          onSuccess('Successfully updated lead.');
        } else {
          await LeadService.create(leadData, detailData);
          onSuccess('Successfully added lead.');
        }
      } else if (activeTab === 'csv') {
        if (!csvFile) throw new Error('Please select a CSV file first');
        setUploadProgress(true);
        await LeadService.uploadCSV(csvFile);
        onSuccess('Successfully uploaded and processed leads.');
      }

      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'An error occurred while saving data.'
      );
    } finally {
      setLoading(false);
      setUploadProgress(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-colors duration-300">
      {uploadProgress && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 rounded-2xl backdrop-blur-md">
          <div className="flex flex-col items-center p-6 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 rounded-full border-brand/30 animate-spin border-t-brand"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-white animate-pulse">
                Processing lead scoring with AI/ML...
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Please do not close this page until upload is complete.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-2xl rounded-2xl shadow-2xl p-8 text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 relative overflow-hidden transition-colors duration-300 max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 text-2xl font-bold tracking-wide text-gray-900 dark:text-white">
          {isEdit ? 'Edit Lead' : 'Add Leads'}
        </h2>
        <div className="mb-6 border-b border-gray-300 dark:border-white/10"></div>

        <div className="flex mb-6 border-b border-gray-300 dark:border-white/10">
          <button
            type="button"
            className={`px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'manual'
                ? 'border-b-2 border-brand text-brand'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('manual')}
          >
            Add Manual
          </button>
          <button
            type="button"
            className={`px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'csv'
                ? 'border-b-2 border-brand text-brand'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('csv')}
          >
            Upload CSV
          </button>
        </div>

        {error && (
          <div className="p-3 mb-6 text-sm text-red-700 border rounded-lg border-red-500/50 bg-red-100 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-0"
        >
          {activeTab === 'manual' && (
            <>
              <div className="p-3.5 rounded-lg mt-3">
                <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-600 dark:text-gray-400 uppercase">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="lead_name"
                    value={formData.lead_name}
                    onChange={handleChange}
                    placeholder="Full Name*"
                    required
                    className="p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-gray-500 dark:bg-[#2C2C2C] dark:text-white border border-gray-300 dark:border-white/10"
                  />
                  <input
                    name="lead_email"
                    value={formData.lead_email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Email*"
                    required
                    className="p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-gray-500 dark:bg-[#2C2C2C] dark:text-white border border-gray-300 dark:border-white/10"
                  />
                  <input
                    name="lead_phone_number"
                    value={formData.lead_phone_number}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-gray-500 dark:bg-[#2C2C2C] dark:text-white border border-gray-300 dark:border-white/10"
                  />
                  <input
                    name="lead_age"
                    type="number"
                    value={formData.lead_age}
                    onChange={handleChange}
                    placeholder="Age"
                    min="18"
                    max="120"
                    className="p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-gray-500 dark:bg-[#2C2C2C] dark:text-white border border-gray-300 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg mb-[-20px]">
                <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-600 dark:text-gray-400 uppercase">
                  Demographic Data
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    name="job_id"
                    value={formData.job_id}
                    onChange={handleChange}
                    className="p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none cursor-pointer border border-gray-300 dark:border-white/10 dark:bg-[#2C2C2C] dark:text-white"
                  >
                    <option value="">-- Job --</option>
                    {jobOptions.map((job) => (
                      <option
                        key={job.job_id}
                        value={job.job_id}
                        className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white"
                      >
                        {job.job_name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="marital_id"
                    value={formData.marital_id}
                    onChange={handleChange}
                    className="p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none cursor-pointer border border-gray-300 dark:border-white/10 dark:bg-[#2C2C2C] dark:text-white"
                  >
                    <option value="">-- Status --</option>
                    {maritalOptions.map((m) => (
                      <option
                        key={m.marital_id}
                        value={m.marital_id}
                        className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white"
                      >
                        {m.marital_status}
                      </option>
                    ))}
                  </select>
                  <select
                    name="education_id"
                    value={formData.education_id}
                    onChange={handleChange}
                    className="p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none cursor-pointer border border-gray-300 dark:border-white/10 dark:bg-[#2C2C2C] dark:text-white"
                  >
                    <option value="">-- Education --</option>
                    {educationOptions.map((e) => (
                      <option
                        key={e.education_id}
                        value={e.education_id}
                        className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white"
                      >
                        {e.education_level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-lg mb-[-20px]">
                <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-600 dark:text-gray-400 uppercase">
                  Financial Data
                </h3>
                <div className="space-y-5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="font-semibold text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      name="lead_balance"
                      type="text"
                      value={formData.lead_balance ? formatNumber(formData.lead_balance) : ''}
                      onChange={handleBalanceChange}
                      placeholder="0"
                      className="p-2.5 pl-12 w-full bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none font-mono tracking-wide dark:bg-[#2C2C2C] dark:text-white border border-gray-300 dark:border-white/10"
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="lead_housing_loan"
                        checked={formData.lead_housing_loan}
                        onChange={handleChange}
                        className="w-4 h-4 border-gray-400 rounded bg-white accent-brand focus:ring-0 dark:bg-[#2C2C2C] dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors group-hover:text-gray-900 dark:group-hover:text-white">
                        Housing Loan
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="lead_loan"
                        checked={formData.lead_loan}
                        onChange={handleChange}
                        className="w-4 h-4 border-gray-400 rounded bg-white accent-brand focus:ring-0 dark:bg-[#2C2C2C] dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors group-hover:text-gray-900 dark:group-hover:text-white">
                        Personal Loan
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg mb-[-20px]">
                <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-600 dark:text-gray-400 uppercase">
                  Campaign History (Optional)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Last Contact Date
                    </label>
                    <input
                      name="last_contact_day"
                      type="date"
                      value={formData.last_contact_day}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none transition-all dark:bg-[#2C2C2C] dark:text-white border border-gray-300 dark:border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Call Duration (sec)
                    </label>
                    <input
                      name="last_contact_duration_sec"
                      type="number"
                      placeholder="0"
                      value={formData.last_contact_duration_sec}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none transition-all dark:bg-[#2C2C2C] dark:text-white border border-gray-300 dark:border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Campaign Contacts
                    </label>
                    <input
                      name="campaign_count"
                      type="number"
                      placeholder="0"
                      value={formData.campaign_count}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none transition-all dark:bg-[#2C2C2C] dark:text-white border border-gray-300 dark:border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Days Since Last Campaign
                    </label>
                    <input
                      name="pdays"
                      type="number"
                      placeholder="0"
                      value={formData.pdays}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none transition-all dark:bg-[#2C2C2C] dark:text-white border border-gray-300 dark:border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Previous Contacts
                    </label>
                    <input
                      name="prev_contact_count"
                      type="number"
                      placeholder="0"
                      value={formData.prev_contact_count}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none transition-all dark:bg-[#2C2C2C] dark:text-white border border-gray-300 dark:border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Previous Outcome
                    </label>
                    <select
                      name="poutcome_id"
                      value={formData.poutcome_id}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none cursor-pointer border border-gray-300 dark:border-white/10 dark:bg-[#2C2C2C] dark:text-white"
                    >
                      <option value="">-- Unknown --</option>
                      {poutcomeOptions.map((p) => (
                        <option
                          key={p.poutcome_id}
                          value={p.poutcome_id}
                          className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white"
                        >
                          {p.poutcome_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Contact Method
                    </label>
                    <select
                      name="contactmethod_id"
                      value={formData.contactmethod_id}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-gray-100 text-gray-900 rounded-lg focus:ring-1 focus:ring-brand outline-none cursor-pointer border border-gray-300 dark:border-white/10 dark:bg-[#2C2C2C] dark:text-white"
                    >
                      <option value="">-- Unknown --</option>
                      {contactMethodOptions.map((c) => (
                        <option
                          key={c.contactmethod_id}
                          value={c.contactmethod_id}
                          className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white"
                        >
                          {c.contact_method_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'csv' && (
            <div className="p-8 text-center border-2 border-dashed border-gray-300/50 dark:border-white/20 rounded-xl bg-gray-100/50 dark:bg-dark-bg/30 transition-colors">
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <svg
                    className="w-12 h-12 mb-3 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload CSV File
                  </label>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Download CSV Template
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-300 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-900 transition bg-gray-400 rounded-lg hover:bg-gray-500 dark:bg-[#3A3A3A] dark:text-white dark:hover:bg-[#4A4A4A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white transition rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Data'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default LeadFormModal;
