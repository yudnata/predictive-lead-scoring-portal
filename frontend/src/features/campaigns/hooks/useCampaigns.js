import { useState, useEffect, useCallback } from 'react';
import CampaignService from '../api/campaign-service';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(14);
  const [appliedFilters, setAppliedFilters] = useState({
    isActive: '',
    startDate: '',
    endDate: '',
  });

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const result = await CampaignService.getAll(currentPage, limit, search, appliedFilters);
      setCampaigns(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalResults(result.meta.total);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, limit, appliedFilters]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  };

  return {
    campaigns,
    setCampaigns,
    loading,
    setLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalResults,
    search,
    setSearch,
    limit,
    setLimit,
    appliedFilters,
    handleApplyFilters,
    fetchCampaigns,
  };
};
