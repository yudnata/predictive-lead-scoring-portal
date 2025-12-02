import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const OutboundModal = ({ lead, onClose, onSuccess }) => {
  const [method, setMethod] = useState('Email');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');

  if (!lead) return null;

  const handleSubmit = () => {
    if (!status) return alert('Status must be selected');

    const payload = {
      lead_id: lead.lead_id,
      method,
      date,
      duration,
      notes,
      status,
    };

    onSuccess(payload);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div
        className="bg-[#1E1E1E] w-full max-w-3xl rounded-2xl p-5 text-white border border-white/10 shadow-2xl relative"
        style={{
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2A2A2A] flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
                  fill="#CFCFCF"
                />
              </svg>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{lead.full_name}</h2>
              <span className="text-[13px] px-2 py-1 rounded-md bg-[#1F3D26] text-green-300 font-semibold">
                {lead.score ?? '99%'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-[#3A1F1F] hover:bg-[#542121] text-red-300 w-8 h-8 rounded-lg flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <div className="text-[13px] flex gap-8 text-gray-300 mb-3">
          <p>
            Phone:&nbsp; <span className="text-white">{lead.phone}</span>
          </p>
          <p>
            Email:&nbsp; <span className="text-white">{lead.email}</span>
          </p>
        </div>

        <div className="border-t border-white/10 mb-3"></div>
        <div className="text-[13px] flex flex-wrap gap-x-6 gap-y-1 text-gray-300">
          <p>
            Job:&nbsp; <span className="text-white">{lead.pekerjaan ?? 'Student'}</span>
          </p>

          <p>
            Education:&nbsp; <span className="text-white">{lead.pendidikan ?? 'High School'}</span>
          </p>

          <p>
            Has Housing Loan:&nbsp; <span className="text-white">{lead.kpr ?? 'Yes'}</span>
          </p>

          <p>
            Average Balance:&nbsp;
            <span className="text-white">{lead.saldo ?? 'Rp 50.000.000'}</span>
          </p>

          <p>
            Status:&nbsp; <span className="text-white">{lead.status ?? 'Married'}</span>
          </p>

          <p>
            Age:&nbsp; <span className="text-white">{lead.umur ?? '21'}</span>
          </p>

          <p>
            Has Loan?:&nbsp; <span className="text-white">{lead.pinjaman ?? 'No'}</span>
          </p>
        </div>

        <div className="border-t border-white/10 mt-3 mb-4"></div>
        <h3 className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wider">
          Add Outbound Detail
        </h3>
        <div className="mb-6 border-b border-white/10"></div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-300">Contact Method *</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 w-full p-2 rounded-lg bg-[#2C2C2C] text-white text-sm focus:ring-1 focus:ring-brand outline-none"
            >
              <option>Email</option>
              <option>Whatsapp</option>
              <option>Telepon</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-300">Contact Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full p-2 rounded-lg bg-[#2C2C2C] text-white text-sm focus:ring-1 focus:ring-brand outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300">Call Duration *</label>
            <input
              type="number"
              placeholder="ex: 195s"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 w-full p-2 rounded-lg bg-[#2C2C2C] text-white text-sm focus:ring-1 focus:ring-brand outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300">Call Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full p-2 rounded-lg bg-[#2C2C2C] text-white text-sm focus:ring-1 focus:ring-brand outline-none"
              placeholder="Enter call notes..."
            ></textarea>
          </div>

          <div>
            <label className="text-xs text-gray-300">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full p-2 rounded-lg bg-[#0F2A17] text-[#C3FFB5] text-sm border border-[#2EE370]/40 focus:ring-1 focus:ring-[#2EE370] outline-none"
            >
              <option value="">-- Select Status --</option>
              <option value="Sedang Dihubungi">Contacting</option>
              <option value="Hubungi Lagi">Call Again</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#3A3A3A] hover:bg-[#4A4A4A] transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover transition font-semibold text-sm"
          >
            Add Outbound
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OutboundModal;
