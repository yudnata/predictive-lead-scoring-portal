import { useState, useEffect, useCallback } from 'react';
import UserService from '../../users/api/user-service';

export const useSales = () => {
  const [salesUsers, setSalesUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(14);
  const [appliedFilters, setAppliedFilters] = useState({
    isActive: '',
    minLeadsHandled: '',
    maxLeadsHandled: '',
  });

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const result = await UserService.getAllSales(currentPage, limit, search, appliedFilters);
      setSalesUsers(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalResults(result.meta.total);
    } catch (err) {
      console.error('Failed to load Sales data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, limit, appliedFilters]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  };

  return {
    salesUsers,
    setSalesUsers,
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
    fetchSales,
  };
};
