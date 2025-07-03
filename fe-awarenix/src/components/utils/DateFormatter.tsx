export const formatUserDate = (dateString: string | Date, locale = 'en-GB', timeZone = 'Asia/Jakarta') => {
  if (!dateString) {
    return '';
  }

  const date = dateString instanceof Date ? dateString : new Date(dateString);

  // Periksa apakah tanggal yang dibuat valid
  if (isNaN(date.getTime())) {
    console.error("Invalid date provided to formatUserDate:", dateString);
    return '';
  }

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24-hour format
    timeZone: timeZone,
  });
};