type TimeUnit = {
  value: number;
  unit: string;
};

export function getTimeAgo(dateString: string): string {
  const diffInMs = Date.now() - new Date(dateString).getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  const timeUnits: TimeUnit[] = [
    { value: Math.floor(diffInDays / 365), unit: 'year' },
    { value: Math.floor(diffInDays / 30), unit: 'month' },
    { value: Math.floor(diffInDays / 7), unit: 'week' },
    { value: diffInDays, unit: 'day' },
    { value: Math.floor(diffInMs / (1000 * 60 * 60)), unit: 'hour' },
    { value: Math.floor(diffInMs / (1000 * 60)), unit: 'minute' },
  ];

  for (const { value, unit } of timeUnits) {
    if (value > 0) {
      return formatTimeUnit(value, unit);
    }
  }
  
  return 'just now';
}

function formatTimeUnit(value: number, unit: string): string {
  const plural = value > 1 ? 's' : '';
  
  switch (unit) {
    case 'year':
    case 'month':
    case 'week':
    case 'day':
    case 'hour':
    case 'minute':
      return `${value} ${unit}${plural} ago`;
    default:
      return 'just now';
  }
}