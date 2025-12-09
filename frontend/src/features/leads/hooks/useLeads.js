import { useState, useEffect, useCallback } from 'react';
import LeadService from '../api/lead-service';

export const useLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState({
    minScore: '',
    maxScore: '',
    jobId: '',
    maritalId: '',
    educationId: '',
    crmStatus: '',
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: currentPage,
        limit,
        search,
        ...appliedFilters,
      };

      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === '' || queryParams[key] === null) {
          delete queryParams[key];
        }
      });

      if (queryParams.minScore) {
        queryParams.minScore = parseFloat(queryParams.minScore) / 100;
      }
      if (queryParams.maxScore) {
        queryParams.maxScore = parseFloat(queryParams.maxScore) / 100;
      }

      const result = await LeadService.getAll(
        queryParams.page,
        queryParams.limit,
        queryParams.search,
        queryParams
      );
      setLeads(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalResults(result.meta.total);
    } catch (error) {
      console.error('Failed to load leads:', error);
      setLeads([]);
    } finally {
      setTimeout(() => setLoading(false), 300);
      setLoading(false);
    }
  }, [currentPage, search, limit, appliedFilters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  };

  return {
    leads,
    setLeads,
    loading,
    search,
    setSearch,
    limit,
    setLimit,
    currentPage,
    setCurrentPage,
    totalPages,
    totalResults,
    appliedFilters,
    handleApplyFilters,
    fetchLeads,
  };
};
