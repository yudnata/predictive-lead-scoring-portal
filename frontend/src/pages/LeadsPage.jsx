import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../layouts/Sidebar';
import LeadFormModal from '../features/leads/components/LeadFormModal'; 
import LeadService from '../services/LeadService'; 
import axios from 'axios';

// Sidebar Component
const API_BASE_URL_AUTH = 'http://localhost:5000/api/v1/auth';
// const userRole = userProfile?.role_name;

// Dropdown Component
const ActionDropdown = ({ leadId, onEdit, onDelete, userRole }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = React.useRef(null); 

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async () => {
        setDropdownOpen(false);
        if (window.confirm('Yakin ingin menghapus Lead ini?')) {
            try {
                await LeadService.delete(leadId);
                alert('Lead berhasil dihapus.');
                onDelete();
            } catch (error) {
                alert('Gagal menghapus Lead.');
            }
        }
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="text-gray-400 hover:text-white px-2"
            >
                ...
            </button>
            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-20">
                    <button onClick={() => { setDropdownOpen(false); onEdit(); }} className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700">
                        Edit Lead
                    </button>
                    <button onClick={handleDelete} className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700">
                        Hapus Lead
                    </button>
                </div>
            )}
        </div>
    );
};

const LeadsPage = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null); 
    
    const limit = 14; 
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true); 

    const fetchProfile = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) { setLoadingProfile(false); return; }
        try {
            const response = await axios.get(`${API_BASE_URL_AUTH}/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserProfile(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil profil user:", error);
        } finally {
            setLoadingProfile(false);
        }
    };
    useEffect(() => { fetchProfile(); }, []);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const result = await LeadService.getAll(currentPage, limit, search);
            setLeads(result.data);
            setTotalPages(result.meta.totalPages);
            setTotalResults(result.meta.total);
        } catch (error) {
            console.error("Gagal memuat leads:", error);
            setLeads([]); 
        } finally {
            setLoading(false);
        }
    }, [currentPage, search, limit]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleOpenAddModal = () => {
        setEditingLead(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = async (leadId) => {
        setLoading(true);
        try {
            const lead = await LeadService.getById(leadId); 
            setEditingLead(lead); 
            setModalOpen(true);
        } catch (error) {
            alert('Gagal memuat detail Lead.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1); 
    };
    
    const getStatusBadge = (status) => {
        const base = "px-3 py-1 text-xs font-semibold rounded-full";
        if (status === 'Tracked') return `${base} bg-green-900 text-green-300`;
        if (status === 'Available') return `${base} bg-yellow-900 text-yellow-300`;
        return `${base} bg-gray-600 text-gray-300`;
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'bg-red-800/70 text-white';
        if (score >= 70) return 'bg-orange-800/70 text-white';
        if (score >= 50) return 'bg-yellow-800/70 text-white';
        return 'bg-gray-700/70 text-white';
    };

    if (loadingProfile) {
        return <div className="flex justify-center items-center min-h-screen bg-black text-white"><p>Memuat profil...</p></div>;
    }
    
    const userRole = userProfile?.role;
    const startResult = (currentPage - 1) * limit + 1;
    const endResult = Math.min(currentPage * limit, totalResults);

    return (
        <div className="bg-[#121212] min-h-screen">
            <Sidebar user={userProfile} />
            <main className="p-8 overflow-y-auto" style={{ paddingLeft: '290px' }}>
                <header className="mb-8">
                    <div className="flex items-center">
                        <h1 className="text-3xl font-bold text-white">All Leads</h1>

                        <div className="flex items-center space-x-4 ml-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-80 p-2 pl-10 bg-[#242424] text-white rounded-lg 
                                            border border-gray-700 focus:border-gray-500"
                                />
                                <img src="/search.png" className="h-4 w-auto absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>

                            <button className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600">
                                Filter
                            </button>

                            <button className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600">
                                Sort-by
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex justify-end mb-6">
                    {userRole === 'admin' && (
                        <button
                        onClick={handleOpenAddModal}
                        className="px-4 py-2 bg-white 
                                    text-black rounded-lg font-semibold shadow 
                                    hover:bg-gray-100 transition-all flex items-center gap-2"
                        >
                        Add Leads
                        </button>
                    )}
                </div>

                {/* LEADS TABLE */}
                <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800">
                    {loading ? (
                        <p className="text-white p-4">Memuat data...</p>
                    ) : leads.length === 0 ? (
                        <p className="text-gray-400 p-4">Tidak ada Leads ditemukan.</p>
                    ) : (
                        <table className="min-w-full text-white">
                            <thead>
                                <tr className="text-gray-400 text-sm border-b border-gray-700 uppercase">
                                    {['Skor', 'Nama Lead & ID', 'Pekerjaan', 'Age', 'Status', 'Action'].map(header => (
                                        <th key={header} className="py-3 px-4 text-left">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr key={lead.lead_id} className="border-b border-gray-800 text-sm">
                                        <td className="py-2 px-4">
                                            <span className={`px-2 py-1 rounded-md text-sm ${getScoreColor(lead.lead_score)}`}>
                                                {lead.lead_score}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4">
                                            <p className="font-semibold">{lead.lead_name}</p>
                                            <p className="text-xs text-gray-500">#{lead.lead_id}</p>
                                        </td>
                                        <td className="py-2 px-4">{lead.job_name}</td>
                                        <td className="py-2 px-4">{lead.lead_age}</td>
                                        <td className="py-2 px-4">
                                            <span className={getStatusBadge(lead.pOutcome_name === 'success' ? 'Tracked' : 'Available')}>
                                                {lead.pOutcome_name || 'Available'}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4">
                                            <ActionDropdown 
                                                leadId={lead.lead_id} 
                                                onEdit={() => handleOpenEditModal(lead.lead_id)}
                                                onDelete={fetchLeads}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* PAGINATION & RESULT INFO */}
                <div className="mt-6 flex justify-between items-center text-gray-400 text-sm">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border border-gray-700 rounded-lg disabled:opacity-30 hover:bg-gray-700">Back</button>
                        {[1, 2, 3, 4].map(page => (
                            <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 flex items-center justify-center rounded-md text-sm ${currentPage === page ? 'bg-gray-700 text-white' : 'border border-gray-700 hover:bg-gray-700'}`}>{page}</button>
                        ))}
                        {totalPages > 4 && <span>...</span>}
                        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-700 rounded-lg disabled:opacity-30 hover:bg-gray-700">Next</button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span>{startResult} to {endResult} of {totalResults} Result</span>
                        <select className="bg-[#242424] border border-gray-700 rounded-lg p-1 text-white">
                            <option value="14">Show {limit}</option>
                            <option value="25">Show 25</option>
                        </select>
                    </div>
                </div>
            </main>
            
            <LeadFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                initialData={editingLead}
                onSuccess={fetchLeads}
            />
        </div>
    );
};

export default LeadsPage;