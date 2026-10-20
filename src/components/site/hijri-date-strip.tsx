import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { MoonStar, ChevronRight } from 'lucide-react';

const TIME_ZONE = 'Asia/Tokyo';

function getJapanDate() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date());
  const part = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  return `${part('day')}-${part('month')}-${part('year')}`;
}

type HijriDateResponse = {
  code: number;
  data?: {
    hijri?: {
      day?: string;
      year?: string;
      month?: { en?: string; ar?: string };
      designation?: { abbreviated?: string };
    };
  };
};

async function fetchHijriDate(date: string) {
  const response = await fetch(
    `https://api.aladhan.com/v1/gToH/${date}?calendarMethod=UAQ`,
    { headers: { Accept: 'application/json' } },
  );
  if (!response.ok) throw new Error('Hijri date service unavailable');
  const result = (await response.json()) as HijriDateResponse;
  if (result.code !== 200 || !result.data?.hijri) throw new Error('Hijri date unavailable');
  return result.data.hijri;
}

export function HijriDateStrip() {
  const [gregorianDate, setGregorianDate] = useState(getJapanDate);

  // Re-check the date in Japan so the strip rolls over after local midnight.
  useEffect(() => {
    const interval = window.setInterval(() => {
      const current = getJapanDate();
      setGregorianDate(previous => previous === current ? previous : current);
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const { data, isError, isPending } = useQuery({
    queryKey: ['hijri-date', gregorianDate],
    queryFn: () => fetchHijriDate(gregorianDate),
    staleTime: 6 * 60 * 60 * 1000,
    retry: 1,
  });

  const hijriLabel = data
    ? `${data.day ?? ''} ${data.month?.en ?? ''} ${data.year ?? ''} ${data.designation?.abbreviated ?? 'AH'}`.trim()
    : null;

  return (
    <div className="hijri-date-strip" aria-label="Today's Hijri date">
      <div className="hijri-date-inner">
        <span className="hijri-date-label"><MoonStar size={14} aria-hidden="true" /> Hijri date</span>
        <span className="hijri-date-value" aria-live="polite">
          {isPending ? 'Loading today’s date…' : isError || !hijriLabel ? 'Date temporarily unavailable' : hijriLabel}
        </span>
        <Link to="/prayer-times" className="hijri-prayer-link">Prayer times <ChevronRight size={13} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
