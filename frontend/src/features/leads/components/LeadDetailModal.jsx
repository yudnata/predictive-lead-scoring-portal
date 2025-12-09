import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../../context/ThemeContext';

import LeadService from '../api/lead-service';
import NoteService from '../../notes/api/note-service';
import ConfirmationModal from '../../../components/ConfirmationModal';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';
import {
  formatCurrency,
  getMonthName,
  formatDuration,
  getScoreColor,
} from '../../../utils/formatters';

const LeadDetailModal = ({
  isOpen,
  onClose,
  lead,
  showNotes = false,
  onStatusChange,
  user,
  onTrack,
  allowFinalize = true,
}) => {
  const [activeTab, setActiveTab] = useState('history');
  const [campaignHistory, setCampaignHistory] = useState([]);
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, noteId: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  React.useEffect(() => {
    if (isOpen && lead?.lead_id && activeTab === 'notes') {
      setLoadingNotes(true);
      NoteService.getByLeadId(lead.lead_id)
        .then((data) => setNotes(data || []))
        .catch((err) => console.error('Failed to fetch notes:', err))
        .finally(() => setLoadingNotes(false));
    }
  }, [isOpen, lead, activeTab]);

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    try {
      const savedNote = await NoteService.create(lead.lead_id, newNote);
      setNotes([savedNote, ...notes]);
      setNewNote('');
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const requestDeleteNote = (noteId) => {
    setConfirmModal({ isOpen: true, noteId });
  };

  const executeDeleteNote = async () => {
    if (!confirmModal.noteId) return;
    try {
      await NoteService.delete(lead.lead_id, confirmModal.noteId);
      setNotes(notes.filter((n) => n.notes_id !== confirmModal.noteId));
      setSuccessModal({ isOpen: true, message: 'Successfully deleted note.' });
    } catch (err) {
      console.error('Failed to delete note:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete note.';
      setErrorModal({ isOpen: true, message: errorMessage });
    } finally {
      setConfirmModal({ isOpen: false, noteId: null });
    }
  };

  React.useEffect(() => {
    if (isOpen && lead?.lead_id) {
      LeadService.getCampaignsByLead(lead.lead_id)
        .then((data) => setCampaignHistory(data || []))
        .catch((err) => console.error('Failed to fetch campaign history:', err));
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm h-screen transition-colors duration-300">
      <div className="bg-white dark:bg-[#1E1E1E] border border-gray-300 dark:border-white/10 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-auto transition-colors duration-300">
        <div className="flex items-start justify-between p-6 border-b border-gray-300 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 text-xl font-bold text-gray-900 bg-gray-200 rounded-full dark:text-white dark:bg-gray-700">
              {lead.lead_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {lead.lead_name}
                </h2>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${getScoreColor(
                    lead.score !== undefined ? lead.score : lead.lead_score
                  )}`}
                >
                  {isNaN(lead.score !== undefined ? lead.score : lead.lead_score)
                    ? '0'
                    : ((lead.score !== undefined ? lead.score : lead.lead_score) * 100).toFixed(0)}
                  %
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">ID: #{lead.lead_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 dark:text-gray-400 dark:hover:text-white dark:bg-white/5 dark:hover:bg-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-16 text-gray-600 dark:text-gray-400">Phone:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {lead.lead_phone_number || '-'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-16 text-gray-600 dark:text-gray-400">Email:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {lead.lead_email || '-'}
              </span>
            </div>
          </div>

          <div className="my-4 border-t border-gray-300 dark:border-white/10"></div>
          <div className="grid grid-cols-2 text-sm md:grid-cols-3 gap-y-6 gap-x-4">
            <div>
              <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">Job</p>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                {lead.job_name || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">Education</p>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                {lead.education_level || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">Has Housing Loan?</p>
              <p
                className={`font-semibold ${
                  lead.lead_housing_loan ? 'text-brand' : 'text-gray-900 dark:text-white'
                }`}
              >
                {lead.lead_housing_loan ? 'Yes' : 'No'}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">Marital Status</p>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                {lead.marital_status || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">Age</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {' '}
                {lead.lead_age} Years Old
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">Has Personal Loan?</p>
              <p
                className={`font-semibold ${
                  lead.lead_loan ? 'text-brand' : 'text-gray-900 dark:text-white'
                }`}
              >
                {lead.lead_loan ? 'Yes' : 'No'}
              </p>
            </div>

            <div className="col-span-2 md:col-span-3">
              <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">Balance</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(lead.lead_balance)}
              </p>
            </div>

            <div className="col-span-2 md:col-span-3 border-t border-gray-300 dark:border-white/10 my-2"></div>
            <div>
              <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">Last Contact Date</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {lead.last_contact_day
                  ? `${lead.last_contact_day} ${getMonthName(lead.month_id)} ${
                      lead.detail_updated_at
                        ? new Date(lead.detail_updated_at).getFullYear()
                        : new Date().getFullYear()
                    }`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">Call Duration</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDuration(lead.last_contact_duration_sec)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">Campaign Contacts</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {lead.campaign_count || 0} times
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                Days Since Last Campaign
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {lead.pdays === -1 ? 'Not Contacted' : `${lead.pdays} days`}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">Previous Contacts</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {lead.prev_contact_count || 0} times
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">Previous Outcome</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {lead.poutcome_name || 'Unknown'}
              </p>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex mb-4 border-b border-gray-300 dark:border-white/10">
              <button
                className={`pb-2 px-1 text-sm font-medium mr-6 transition-colors ${
                  activeTab === 'history'
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveTab('history')}
              >
                Campaign History
              </button>
              {showNotes && (
                <button
                  className={`pb-2 px-1 text-sm font-medium transition-colors ${
                    activeTab === 'notes'
                      ? 'text-brand border-b-2 border-brand'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={() => setActiveTab('notes')}
                >
                  Notes
                </button>
              )}
            </div>

            {activeTab === 'history' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {campaignHistory.length > 0 ? (
                  campaignHistory.map((campaign) => (
                    <div
                      key={campaign.campaign_id}
                      className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {campaign.campaign_name}
                      </h4>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-sm text-center text-gray-500 border border-dashed rounded-lg bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/10">
                    No campaign history yet.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-[#2C2C2C] p-4 rounded-lg border border-gray-300 dark:border-white/5">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full text-sm text-gray-900 placeholder-gray-500 bg-transparent resize-none focus:outline-none dark:text-white"
                    rows="3"
                    placeholder="Write a note about this lead..."
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSaveNote}
                      disabled={!newNote.trim()}
                      className="text-xs bg-white text-black px-3 py-1.5 rounded font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Note
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                  {loadingNotes ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      Loading notes...
                    </div>
                  ) : notes.length > 0 ? (
                    notes.map((note) => (
                      <div
                        key={note.notes_id}
                        className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-xs text-gray-900 dark:text-white">
                            {note.sales_name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              {new Date(note.created_at).toLocaleString()}
                            </span>
                            <button
                              onClick={() => requestDeleteNote(note.notes_id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete Note"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {note.note_content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                      No notes yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-5 border-t border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-[#242424] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-white transition-colors bg-gray-500 rounded-lg shadow-lg hover:bg-gray-600"
          >
            Close
          </button>
          {showNotes ? (
            <>
              {(!lead.status || lead.status.toLowerCase() === 'uncontacted') && (
                <button
                  onClick={() => {
                    onStatusChange?.(lead.lead_campaign_id, 4);
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-bold text-white transition-colors bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600"
                >
                  Mark as Contacted
                </button>
              )}
              {lead.status?.toLowerCase() === 'contacted' && (
                <button
                  onClick={() => {
                    navigate('/sales/outbound-detail', { state: { lead } });
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-bold text-white transition-colors bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600"
                >
                  Go to Outbound
                </button>
              )}
              {lead.status?.toLowerCase() === 'contacted' && allowFinalize && (
                <>
                  <button
                    onClick={() => {
                      onStatusChange?.(lead.lead_campaign_id, 6);
                      onClose();
                    }}
                    className="px-4 py-2 text-sm font-bold text-white transition-colors bg-red-500 rounded-lg shadow-lg hover:bg-red-600"
                  >
                    Mark as Reject
                  </button>
                  <button
                    onClick={() => {
                      onStatusChange?.(lead.lead_campaign_id, 5);
                      onClose();
                    }}
                    className="px-4 py-2 text-sm font-bold text-white transition-colors bg-green-500 rounded-lg shadow-lg hover:bg-green-600"
                  >
                    Mark as Deal
                  </button>
                </>
              )}
            </>
          ) : (
            user?.role !== 'admin' && (
              <button
                onClick={() => onTrack?.(lead)}
                className="px-4 py-2 text-sm font-bold text-black transition-colors bg-white rounded-lg shadow-lg hover:bg-gray-200"
              >
                Track This Lead
              </button>
            )
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, noteId: null })}
        onConfirm={executeDeleteNote}
        title="Delete Note"
        message="Are you sure you want to delete this note?"
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        message={errorModal.message}
      />
    </div>,
    document.body
  );
};

export default LeadDetailModal;
