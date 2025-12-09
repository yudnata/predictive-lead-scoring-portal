import { useState, useEffect, useCallback } from 'react';
import HistoryService from '../api/history-service';

export const useHistory = () => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [search, setSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '',
    endDate: '',
    campaignId: '',
    statusId: '',
  });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await HistoryService.getAll(currentPage, limit, search, appliedFilters);
      setHistoryList(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalResults(res.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load history:', err);
      setHistoryList([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search, appliedFilters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  };

  return {
    historyList,
    setHistoryList,
    loading,
    setLoading,
    currentPage,
    setCurrentPage,
    limit,
    setLimit,
    totalPages,
    totalResults,
    search,
    setSearch,
    appliedFilters,
    handleApplyFilters,
    fetchHistory,
  };
};
