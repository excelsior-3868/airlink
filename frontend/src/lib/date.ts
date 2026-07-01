import NepaliDate from 'nepali-date-converter';

type DateInput = string | number | Date | null | undefined;

const toValidDate = (value: DateInput): Date | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatEnglishDate = (value: DateInput): string => {
  const date = toValidDate(value);
  if (!date) return 'N/A';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatNepaliDate = (value: DateInput): string => {
  const date = toValidDate(value);
  if (!date) return 'N/A';

  try {
    const nepaliDate = new (NepaliDate as any)(date);
    return nepaliDate.format('YYYY/MM/DD', 'en');
  } catch (error) {
    return 'N/A';
  }
};

export const formatBilingualDate = (value: DateInput): string => {
  const englishDate = formatEnglishDate(value);
  const nepaliDate = formatNepaliDate(value);
  return `${englishDate} | ${nepaliDate}`;
};

export const formatBilingualDateTime = (value: DateInput): string => {
  const date = toValidDate(value);
  if (!date) return 'N/A';

  const englishDateTime = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  let nepaliDateTime = 'N/A';
  try {
    const nepaliDate = new (NepaliDate as any)(date);
    nepaliDateTime = `${nepaliDate.format('YYYY/MM/DD', 'en')}, ${new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)}`;
  } catch (error) {
    // Keep N/A
  }

  return `${englishDateTime} | ${nepaliDateTime}`.replace(/am/g, 'AM').replace(/pm/g, 'PM');
};
