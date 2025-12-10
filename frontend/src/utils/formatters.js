export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

export const getMonthName = (monthId) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months[monthId - 1] || '-';
};

export const formatDuration = (seconds) => {
  if (!seconds) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

export const getScoreColor = (score) => {
  const val = score * 100;
  if (val >= 70) return 'text-[#66BB6A]';
  if (val >= 30) return 'text-[#FFCA28]';
  if (val >= 0) return 'text-[#EF5350]';
  return 'text-gray-500 dark:text-gray-400';
};

export const getStatusBadge = (status) => {
  const base = 'px-3 py-1 text-xs font-semibold rounded-full border';
  const s = (status || '').toLowerCase();

  if (s === 'tracked') return `${base} bg-blue-500/10 text-blue-400 border-none`;
  if (s === 'available') return `${base} bg-[#FFCA28]/10 text-[#FFCA28] border-none`;

  if (s === 'connected') return `${base} bg-blue-500/10 text-blue-400 border-none`;
  if (s === 'no answer' || s === 'no-answer')
    return `${base} bg-gray-500/10 text-gray-400 border-none`;
  if (s === 'busy') return `${base} bg-red-500/10 text-red-400 border-none`;
  if (s === 'wrong number') return `${base} bg-yellow-500/10 text-yellow-400 border-none`;

  if (s === 'contacted') return `${base} bg-blue-500/10 text-blue-400 border-none`;
  if (s === 'uncontacted') return `${base} bg-gray-500/10 text-gray-400 border-none`;
  if (s === 'deal') return `${base} bg-green-500/10 text-green-400 border-none`;
  if (s === 'reject') return `${base} bg-red-500/10 text-red-400 border-none`;

  return `${base} bg-gray-100 dark:bg-gray-600/30 text-gray-600 dark:text-gray-300 border-none`;
};

export const formatNumber = (num) => {
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
