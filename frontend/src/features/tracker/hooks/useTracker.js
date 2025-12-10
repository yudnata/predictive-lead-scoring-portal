import { useState, useEffect, useCallback } from 'react';
import LeadsTrackerService from '../api/tracker-service';

export const useTracker = (userId) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [search, setSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    campaignId: '',
    minScore: '',
    maxScore: '',
  });
  const [filterSelf, setFilterSelf] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await LeadsTrackerService.getAll(
        1,
        500,
        search,
        appliedFilters,
        userId,
        filterSelf
      );
      setList(res.data || []);
      setTotalResults(res.meta?.total || 0);
    } catch (err) {
      console.error('Gagal memuat leads tracker:', err);
      if (err.response) {
        console.error(err.response.data?.message || 'Gagal memuat data leads tracker.');
      }
    } finally {
      setLoading(false);
    }
  }, [search, appliedFilters, userId, filterSelf]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
  };

  return {
    list,
    setList,
    loading,
    setLoading,
    totalResults,
    search,
    setSearch,
    appliedFilters,
    handleApplyFilters,
    fetchData,
    filterSelf,
    setFilterSelf,
  };
};
