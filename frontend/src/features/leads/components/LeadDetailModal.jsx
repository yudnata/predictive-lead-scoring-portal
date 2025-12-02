import React, { useState } from 'react';

const LeadDetailModal = ({ isOpen, onClose, lead }) => {
  const [activeTab, setActiveTab] = useState('notes'); // Default tab

  if (!isOpen || !lead) return null;

  // Helper untuk format mata uang (IDR)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Helper untuk warna skor
  const getScoreColor = (score) => {
    const val = score * 100;
    if (val >= 80) return 'text-[#66BB6A] bg-[#66BB6A]/10'; // Hijau
    if (val >= 50) return 'text-[#FFCA28] bg-[#FFCA28]/10'; // Kuning
    if (val > 0) return 'text-[#EF5350] bg-[#EF5350]/10';   // Merah
    return 'text-gray-400 bg-gray-700/50';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="bg-[#1E1E1E] border border-white/10 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 text-xl font-bold text-white bg-gray-700 rounded-full">
              {lead.lead_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{lead.lead_name}</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${getScoreColor(lead.lead_score)}`}>
                  {(lead.lead_score * 100).toFixed(0)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">ID: #{lead.lead_id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* BODY - SCROLLABLE */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Contact Info */}
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-16 text-gray-400">Phone:</span>
              <span className="font-medium text-white">{lead.lead_phone_number || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-16 text-gray-400">Email:</span>
              <span className="font-medium text-white truncate">{lead.lead_email || '-'}</span>
            </div>
          </div>

          <div className="my-4 border-t border-white/10"></div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 text-sm md:grid-cols-3 gap-y-6 gap-x-4">
            <div>
              <p className="mb-1 text-xs text-gray-400">Job</p>
              <p className="font-semibold text-white capitalize">{lead.job_name || 'Unknown'}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-400">Education</p>
              <p className="font-semibold text-white capitalize">{lead.education_level || 'Unknown'}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-400">Has Housing Loan?</p>
              <p className={`font-semibold ${lead.lead_housing_loan ? 'text-brand' : 'text-white'}`}>
                {lead.lead_housing_loan ? 'Yes' : 'No'}
              </p>
            </div>
            
            <div>
              <p className="mb-1 text-xs text-gray-400">Marital Status</p>
              <p className="font-semibold text-white capitalize">{lead.marital_status || 'Unknown'}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-400">Age</p>
              <p className="font-semibold text-white">{lead.lead_age} Years Old</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-400">Has Personal Loan?</p>
              <p className={`font-semibold ${lead.lead_loan ? 'text-brand' : 'text-white'}`}>
                {lead.lead_loan ? 'Yes' : 'No'}
              </p>
            </div>

            <div className="col-span-2 md:col-span-3">
              <p className="mb-1 text-xs text-gray-400">Average Balance</p>
              <p className="text-lg font-bold text-white">{formatCurrency(lead.lead_balance)}</p>
            </div>
          </div>

          {/* TABS SECTION (Optional visual placeholder based on reference) */}
          <div className="mt-8">
            <div className="flex mb-4 border-b border-white/10">
              <button 
                className={`pb-2 px-1 text-sm font-medium mr-6 transition-colors ${activeTab === 'history' ? 'text-brand border-b-2 border-brand' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('history')}
              >
                Campaign History
              </button>
              <button 
                className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'notes' ? 'text-brand border-b-2 border-brand' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('notes')}
              >
                Notes
              </button>
            </div>

            {activeTab === 'history' ? (
               <div className="py-8 text-sm text-center text-gray-500 border border-dashed rounded-lg bg-white/5 border-white/10">
                 No campaign history yet.
               </div>
            ) : (
              <div className="bg-[#2C2C2C] p-4 rounded-lg border border-white/5">
                <textarea 
                  className="w-full text-sm text-white placeholder-gray-500 bg-transparent resize-none focus:outline-none"
                  rows="3"
                  placeholder="Write a note about this lead..."
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button className="text-xs bg-white text-black px-3 py-1.5 rounded font-bold hover:bg-gray-200">
                    Save Note
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-white/10 bg-[#242424] flex justify-end gap-3">
           <button
            onClick={onClose} 
            className="px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg hover:bg-white/10"
          >
            Close
          </button>
          <button className="px-4 py-2 text-sm font-bold text-black transition-colors bg-white rounded-lg shadow-lg hover:bg-gray-200">
            Track This Lead
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;