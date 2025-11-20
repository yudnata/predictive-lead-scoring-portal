import React, { useState, useEffect } from 'react';
import LeadService from '../api/lead-service';
import toast from 'react-hot-toast';

const LeadFormModal = ({ isOpen, onClose, initialData, onSuccess }) => {
  const isEdit = !!initialData;
  const [activeTab, setActiveTab] = useState('manual'); // manual | csv
  const [formData, setFormData] = useState({});
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dropdown placeholders
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
        lead_balance: initialData.lead_balance || 0,
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
        lead_balance: 0,
        lead_housing_loan: false,
        lead_loan: false,
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
          toast.success('Lead berhasil diupdate!');
        } else {
          await LeadService.create(leadData, detailData);
          toast.success('Lead berhasil ditambahkan!');
        }
      } else if (activeTab === 'csv') {
        if (!csvFile) throw new Error('Silahkan pilih file CSV terlebih dahulu');
        await LeadService.uploadCSV(csvFile);
        toast.success('CSV berhasil diupload!');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan data.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1E1E1E] w-full max-w-2xl rounded-2xl shadow-xl p-8 text-white">
        <h2 className="mb-4 text-2xl font-bold">{isEdit ? 'Edit Lead' : 'Add Leads'}</h2>
        <div className="mb-6 border-b border-gray-700"></div>

        {/* Tabs */}
        <div className="flex mb-4 border-b border-gray-600">
          <button
            type="button"
            className={`px-4 py-2 font-semibold ${
              activeTab === 'manual' ? 'border-b-2 border-brand' : ''
            }`}
            onClick={() => setActiveTab('manual')}
          >
            Add Manual
          </button>
          <button
            type="button"
            className={`px-4 py-2 font-semibold ${
              activeTab === 'csv' ? 'border-b-2 border-brand' : ''
            }`}
            onClick={() => setActiveTab('csv')}
          >
            Upload CSV
          </button>
        </div>

        {error && <div className="p-3 mb-4 text-red-300 rounded bg-red-900/40">{error}</div>}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {activeTab === 'manual' && (
            <>
              <h3 className="text-lg font-semibold">Informasi Dasar</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="lead_name"
                  value={formData.lead_name}
                  onChange={handleChange}
                  placeholder="Nama Lengkap*"
                  required
                  className="p-2 bg-[#2C2C2C] rounded"
                />
                <input
                  name="lead_email"
                  value={formData.lead_email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Email*"
                  required
                  className="p-2 bg-[#2C2C2C] rounded"
                />
                <input
                  name="lead_phone_number"
                  value={formData.lead_phone_number}
                  onChange={handleChange}
                  placeholder="Nomor HP"
                  className="p-2 bg-[#2C2C2C] rounded"
                />
                <input
                  name="lead_age"
                  value={formData.lead_age}
                  onChange={handleChange}
                  type="number"
                  placeholder="Usia"
                  className="p-2 bg-[#2C2C2C] rounded"
                />
              </div>

              <h3 className="pt-4 text-lg font-semibold">Data Demografi</h3>
              <div className="grid grid-cols-3 gap-4">
                <select
                  name="job_id"
                  value={formData.job_id}
                  onChange={handleChange}
                  className="p-2 bg-[#2C2C2C] rounded"
                >
                  <option value="">-- Pekerjaan --</option>
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
                  className="p-2 bg-[#2C2C2C] rounded"
                >
                  <option value="">-- Status Pernikahan --</option>
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
                  className="p-2 bg-[#2C2C2C] rounded"
                >
                  <option value="">-- Pendidikan --</option>
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

              <h3 className="pt-4 text-lg font-semibold">Data Finansial</h3>
              <div className="space-y-3">
                <input
                  name="lead_balance"
                  value={formData.lead_balance}
                  onChange={handleChange}
                  type="number"
                  placeholder="Saldo (Balance)"
                  className="p-2 w-full bg-[#2C2C2C] rounded"
                />
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="lead_housing_loan"
                      checked={formData.lead_housing_loan}
                      onChange={handleChange}
                      className="accent-brand"
                    />
                    <span className="text-sm">Punya Pinjaman Rumah</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="lead_loan"
                      checked={formData.lead_loan}
                      onChange={handleChange}
                      className="accent-brand"
                    />
                    <span className="text-sm">Punya Pinjaman Lain</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {activeTab === 'csv' && (
            <div className="space-y-3">
              <label className="block mb-2 text-sm font-medium">Pilih file CSV</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvChange}
                className="p-2 w-full bg-[#2C2C2C] rounded"
              />
              <button
                type="button"
                onClick={downloadTemplate}
                className="px-2 py-2 mt-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Download Template CSV
              </button>
              <p className="mt-2 text-sm text-gray-400">
                Pastikan file CSV sesuai format yang didukung
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-white transition bg-gray-600 rounded-full hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 font-semibold text-white transition rounded-full bg-brand hover:bg-brand-hover disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadFormModal;
