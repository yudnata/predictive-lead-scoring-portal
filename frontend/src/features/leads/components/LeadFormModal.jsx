import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import LeadService from '../api/lead-service';
import toast from 'react-hot-toast';

const LeadFormModal = ({ isOpen, onClose, initialData, onSuccess }) => {
  const isEdit = !!initialData;
  const [activeTab, setActiveTab] = useState('manual');
  const [formData, setFormData] = useState({});
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [error, setError] = useState('');

  const jobOptions = [
    { id: 1, name: 'Mahasiswa' },
    { id: 2, name: 'Karyawan' },
  ];
  const maritalOptions = [
    { id: 1, status: 'Single' },
    { id: 2, status: 'Menikah' },
  ];
  const educationOptions = [
    { id: 1, level: 'SMA' },
    { id: 2, level: 'S1' },
  ];

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
      });
      setCsvFile(null);
    }
    setError('');
  }, [initialData, isEdit, isOpen]);

  if (!isOpen) return null;

  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

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
        const detailData = {
          lead_balance: formData.lead_balance ? parseFloat(formData.lead_balance) : 0,
          lead_housing_loan: formData.lead_housing_loan,
          lead_loan: formData.lead_loan,
        };

        if (isEdit) {
          await LeadService.update(initialData.lead_id, leadData, detailData);
          toast.success('Lead updated successfully!');
        } else {
          await LeadService.create(leadData, detailData);
          toast.success('Lead added successfully!');
        }
      } else if (activeTab === 'csv') {
        if (!csvFile) throw new Error('Please select a CSV file first');
        setUploadProgress(true);
        await LeadService.uploadCSV(csvFile);
        toast.success('Upload Successful! Data is being processed in the background.', {
          duration: 5000,
          icon: '🚀',
        });
      }

      onSuccess();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
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
              <h3 className="text-xl font-bold text-white animate-pulse">Uploading Data...</h3>
              <p className="mt-2 text-sm text-gray-400">
                Please do not close this page until upload is complete.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                (AI process will run automatically after this)
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#1E1E1E] w-full max-w-2xl rounded-2xl shadow-2xl p-8 text-white border border-white/10 relative overflow-hidden">
        <h2 className="mb-4 text-2xl font-bold tracking-wide">
          {isEdit ? 'Edit Lead' : 'Add Leads'}
        </h2>
        <div className="mb-6 border-b border-white/10"></div>

        <div className="flex mb-6 border-b border-white/10">
          <button
            type="button"
            className={`px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'manual'
                ? 'border-b-2 border-brand text-brand'
                : 'text-gray-400 hover:text-white'
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
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('csv')}
          >
            Upload CSV
          </button>
        </div>

        {error && (
          <div className="p-3 mb-6 text-sm text-red-200 border rounded-lg border-red-500/50 bg-red-900/20">
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
                <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="lead_name"
                    value={formData.lead_name}
                    onChange={handleChange}
                    placeholder="Full Name*"
                    required
                    className="p-2.5 bg-[#2C2C2C] rounded-lg focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-gray-500"
                  />
                  <input
                    name="lead_email"
                    value={formData.lead_email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Email*"
                    required
                    className="p-2.5 bg-[#2C2C2C] rounded-lg focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-gray-500"
                  />
                  <input
                    name="lead_phone_number"
                    value={formData.lead_phone_number}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="p-2.5 bg-[#2C2C2C] rounded-lg focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-gray-500"
                  />
                  <input
                    name="lead_age"
                    value={formData.lead_age}
                    onChange={handleChange}
                    type="number"
                    placeholder="Age"
                    className="p-2.5 bg-[#2C2C2C] rounded-lg focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg mb-[-20px]">
                <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  Demographic Data
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    name="job_id"
                    value={formData.job_id}
                    onChange={handleChange}
                    className="p-2.5 bg-[#2C2C2C] rounded-lg focus:ring-1 focus:ring-brand outline-none cursor-pointer"
                  >
                    <option value="">-- Job --</option>
                    {jobOptions.map((job) => (
                      <option
                        key={job.id}
                        value={job.id}
                      >
                        {job.name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="marital_id"
                    value={formData.marital_id}
                    onChange={handleChange}
                    className="p-2.5 bg-[#2C2C2C] rounded-lg focus:ring-1 focus:ring-brand outline-none cursor-pointer"
                  >
                    <option value="">-- Status --</option>
                    {maritalOptions.map((m) => (
                      <option
                        key={m.id}
                        value={m.id}
                      >
                        {m.status}
                      </option>
                    ))}
                  </select>
                  <select
                    name="education_id"
                    value={formData.education_id}
                    onChange={handleChange}
                    className="p-2.5 bg-[#2C2C2C] rounded-lg focus:ring-1 focus:ring-brand outline-none cursor-pointer"
                  >
                    <option value="">-- Education --</option>
                    {educationOptions.map((e) => (
                      <option
                        key={e.id}
                        value={e.id}
                      >
                        {e.level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-lg mb-[-20px]">
                <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  Financial Data
                </h3>
                <div className="space-y-5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="font-semibold text-gray-400">$</span>
                    </div>
                    <input
                      name="lead_balance"
                      type="text"
                      value={formData.lead_balance ? formatNumber(formData.lead_balance) : ''}
                      onChange={handleBalanceChange}
                      placeholder="0"
                      className="p-2.5 pl-12 w-full bg-[#2C2C2C] rounded-lg focus:ring-1 focus:ring-brand outline-none font-mono tracking-wide"
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="lead_housing_loan"
                        checked={formData.lead_housing_loan}
                        onChange={handleChange}
                        className="w-4 h-4 border-gray-600 rounded bg-[#2C2C2C] accent-brand focus:ring-0"
                      />
                      <span className="text-sm text-gray-300 transition-colors group-hover:text-white">
                        Housing Loan
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="lead_loan"
                        checked={formData.lead_loan}
                        onChange={handleChange}
                        className="w-4 h-4 border-gray-600 rounded bg-[#2C2C2C] accent-brand focus:ring-0"
                      />
                      <span className="text-sm text-gray-300 transition-colors group-hover:text-white">
                        Other Loan
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'csv' && (
            <div className="p-8 text-center border-2 border-dashed border-white/20 rounded-xl bg-dark-bg/30">
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <svg
                    className="w-12 h-12 mb-3 text-gray-400"
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
                  <label className="block text-sm font-medium text-gray-300">Upload CSV File</label>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvChange}
                  className="block w-full text-sm text-gray-400 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand file:text-white hover:file:bg-brand-hover"
                />
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="text-sm text-brand hover:text-brand-hover hover:underline"
                >
                  Download CSV Template
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-white transition bg-[#3A3A3A] rounded-lg hover:bg-[#4A4A4A]"
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
