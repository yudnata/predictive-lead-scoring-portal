import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import OutboundService from '../api/outbound-service';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../../utils/formatters';
import ConfirmationModal from '../../../components/ConfirmationModal';

import { useAIContext } from '../../../context/useAIContext';

const OutboundModal = ({ lead, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [method, setMethod] = useState('email');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null });

  const { setOutboundDetailContext } = useAIContext();
  useEffect(() => {
    if (lead) {
      setOutboundDetailContext(lead, history);
    }
  }, [lead, history, setOutboundDetailContext]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await OutboundService.getHistory(lead.lead_id, lead.lead_campaign_id);
        setHistory(res.data || []);
      } catch (error) {
        console.error('Failed to fetch history', error);
        toast.error('Failed to load history');
      } finally {
        setLoadingHistory(false);
      }
    };

    if (lead?.lead_id && activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, lead]);

  if (!lead) return null;

  const handleSubmit = async () => {
    if (!status) return toast.error('Status must be selected');

    setSaving(true);
    try {
      const payload = {
        lead_id: lead.lead_id,
        lead_campaign_id: lead.lead_campaign_id,
        activity_type: method,
        outcome: status,
        duration: parseInt(duration) || 0,
        notes: notes,
        interaction_date: date,
      };

      await OutboundService.logActivity(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to log activity');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async (outcomeType) => {
    setSaving(true);
    try {
      const payload = {
        lead_id: lead.lead_id,
        lead_campaign_id: lead.lead_campaign_id,
        activity_type: method || 'unknown',
        outcome: outcomeType,
        duration: parseInt(duration) || 0,
        notes: notes || `Lead finalized as ${outcomeType}`,
        interaction_date: date,
      };

      await OutboundService.logActivity(payload);
      toast.success(`Lead successfully marked as ${outcomeType}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to finalize lead');
    } finally {
      setSaving(false);
      setConfirmModal({ isOpen: false, type: null });
    }
  };

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div
            className="bg-white dark:bg-[#1E1E1E] w-full max-w-4xl rounded-2xl p-5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 shadow-2xl relative flex flex-col"
            style={{
              maxHeight: '90vh',
            }}
          >
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center text-gray-400 dark:text-[#CFCFCF]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">{lead.lead_name || lead.full_name}</h2>
                  <span className="text-[13px] px-2 py-1 rounded-md bg-[#1F3D26] text-green-300 font-semibold">
                    {lead.score ? `${(parseFloat(lead.score) * 100).toFixed(2)}%` : '0%'}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="bg-red-50 dark:bg-[#3A1F1F] hover:bg-red-100 dark:hover:bg-[#542121] text-red-500 dark:text-red-300 w-8 h-8 rounded-lg flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="flex mb-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
              <button
                className={`pb-2 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Lead Information
              </button>
              <button
                className={`pb-2 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'log'
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('log')}
              >
                Add Log
              </button>
              <button
                className={`pb-2 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('history')}
              >
                Activity History
              </button>
              <button
                className={`pb-2 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'finalize'
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('finalize')}
              >
                Finalize
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              {activeTab === 'info' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-[#2A2A2A] rounded-lg border border-gray-200 dark:border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-bold text-lg text-gray-900 dark:text-white tracking-wide">
                          {lead.lead_phone_number || '-'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-[#2A2A2A] rounded-lg border border-gray-200 dark:border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50"></div>
                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-bold text-base text-gray-900 dark:text-white tracking-wide break-all">
                          {lead.lead_email || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-[#2a2a2a] p-4 rounded-xl border border-gray-200 dark:border-white/5">
                      <div>
                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Job</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {lead.job_name || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Education</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {lead.education_level || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                          Marital Status
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {lead.marital_status || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Age</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {lead.lead_age ? `${lead.lead_age} Years` : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-gray-50 dark:bg-[#2a2a2a] p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-lg">
                      <div className="md:col-span-1 border-r border-gray-200 dark:border-white/10 pr-4">
                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Balance</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                          {lead.lead_balance ? formatCurrency(lead.lead_balance) : '-'}
                        </p>
                      </div>
                      <div className="md:col-span-2 flex flex-wrap gap-6 pl-4">
                        <div>
                          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                            Housing Loan
                          </p>
                          <span
                            className={`text-sm font-bold ${
                              lead.lead_housing_loan
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            {lead.lead_housing_loan ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                            Personal Loan
                          </p>
                          <span
                            className={`text-sm font-bold ${
                              lead.lead_loan
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            {lead.lead_loan ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'log' && (
                <div className="space-y-4 animate-fadeIn px-2">
                  <div>
                    <label className="text-xs text-gray-700 dark:text-gray-300">
                      Contact Method *
                    </label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="mt-1 w-full p-2.5 rounded-lg bg-gray-50 dark:bg-[#2C2C2C] text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-brand outline-none border border-gray-300 dark:border-white/5"
                    >
                      <option value="email">Email</option>
                      <option value="cellular">Cellular</option>
                      <option value="telephone">Telephone</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-700 dark:text-gray-300">
                      Contact Date *
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-1 w-full p-2.5 rounded-lg bg-gray-50 dark:bg-[#2C2C2C] text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-brand outline-none border border-gray-300 dark:border-white/5"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-700 dark:text-gray-300">
                      Call Duration (seconds) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="mt-1 w-full p-2.5 rounded-lg bg-gray-50 dark:bg-[#2C2C2C] text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-brand outline-none border border-gray-300 dark:border-white/5"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-700 dark:text-gray-300">Call Notes</label>
                    <textarea
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1 w-full p-3 rounded-lg bg-gray-50 dark:bg-[#2C2C2C] text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-brand outline-none border border-gray-300 dark:border-white/5"
                      placeholder="Enter detailed notes..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="text-xs text-gray-700 dark:text-gray-300">
                      Call Status *
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="mt-1 w-full p-2.5 rounded-lg bg-gray-50 dark:bg-[#2C2C2C] text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-brand outline-none border border-gray-300 dark:border-white/5"
                    >
                      <option value="">-- Select Status --</option>
                      <option value="Connected">Connected</option>
                      <option value="No Answer">No Answer</option>
                      <option value="Busy">Busy</option>
                      <option value="Wrong Number">Wrong Number</option>
                      <option value="Call Back">Call Back</option>
                    </select>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-[#3A3A3A] hover:bg-gray-300 dark:hover:bg-[#4A4A4A] transition text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={saving || !status}
                      className="px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-hover transition font-semibold text-sm disabled:opacity-50 text-white shadow-lg shadow-brand/20"
                    >
                      {saving ? 'Saving...' : 'Add Outbound Log'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="animate-fadeIn">
                  {loadingHistory ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mb-4"></div>
                      <p>Loading history...</p>
                    </div>
                  ) : history.filter(
                      (h) => !['Accepted', 'Rejected', 'Deal', 'Reject'].includes(h.outcome)
                    ).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                      {history
                        .filter(
                          (h) => !['Accepted', 'Rejected', 'Deal', 'Reject'].includes(h.outcome)
                        )
                        .map((item) => (
                          <div
                            key={item.activity_id}
                            className="bg-gray-50 dark:bg-[#262626] p-4 rounded-xl border border-gray-200 dark:border-white/5 hover:border-brand/30 hover:bg-gray-100 dark:hover:bg-[#2C2C2C] transition-all group relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                            <div className="flex justify-between items-start mb-3 relative z-10">
                              <div>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1 uppercase tracking-wider font-semibold">
                                  {new Date(item.created_at).toLocaleString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900 dark:text-white text-sm bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-md">
                                    {item.activity_type}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border ${
                                  item.outcome === 'Connected'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : item.outcome === 'No Answer'
                                    ? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                    : item.outcome === 'Busy'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : item.outcome === 'Wrong Number'
                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    : 'bg-gray-700/50 text-gray-400 border-gray-600/30'
                                }`}
                              >
                                {item.outcome}
                              </span>
                            </div>

                            <div className="bg-gray-100 dark:bg-black/20 p-3 rounded-lg mb-3 min-h-[60px] relative z-10">
                              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                "{item.notes || 'No notes'}"
                              </p>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-white/5 relative z-10">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-300">
                                  {item.sales_name ? item.sales_name.charAt(0) : '?'}
                                </div>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {item.sales_name}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-xl">
                      <p>No activity history found.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'finalize' && (
                <div className="animate-fadeIn">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Finalize This Lead
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                      Choose the final outcome for this lead. This action is permanent and cannot be
                      undone.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, type: 'Accepted' })}
                        disabled={saving}
                        className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 transition font-semibold text-sm disabled:opacity-50 text-white shadow-lg flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Mark as Deal
                      </button>
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, type: 'Rejected' })}
                        disabled={saving}
                        className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold text-sm disabled:opacity-50 text-white shadow-lg flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Mark as Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null })}
        onConfirm={() => handleFinalize(confirmModal.type)}
        title={confirmModal.type === 'Accepted' ? 'Confirm Deal' : 'Confirm Rejection'}
        message={
          confirmModal.type === 'Accepted'
            ? `Are you absolutely sure you want to close this lead as a DEAL? This action is permanent and cannot be undone. The lead "${
                lead.lead_name || lead.full_name
              }" will be marked as successfully converted.`
            : `Are you absolutely sure you want to REJECT this lead? This action is permanent and cannot be undone. The lead "${
                lead.lead_name || lead.full_name
              }" will be marked as rejected and removed from active pipeline.`
        }
        confirmText={confirmModal.type === 'Accepted' ? 'Yes, Mark as Deal' : 'Yes, Reject Lead'}
        cancelText="Cancel"
        isDangerous={confirmModal.type === 'Rejected'}
      />
    </>
  );
};

export default OutboundModal;
