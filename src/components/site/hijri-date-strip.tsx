import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MoonStar } from 'lucide-react';
import { useLanguage } from './language';

const TIME_ZONE = 'Asia/Tokyo';

const labels = {
  en: { hijri: 'Hijri calendar', loading: 'Updating today’s date…', unavailable: 'Date temporarily unavailable' },
  ja: { hijri: 'ヒジュラ暦', loading: '本日の日付を更新中…', unavailable: '日付を一時的に取得できません' },
  ur: { hijri: 'ہجری کیلنڈر', loading: 'آج کی تاریخ اپ ڈیٹ ہو رہی ہے…', unavailable: 'تاریخ عارضی طور پر دستیاب نہیں' },
} as const;

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
  const { language } = useLanguage();
  const copy = labels[language];
  const [gregorianDate, setGregorianDate] = useState(getJapanDate);

  // Re-check Japan's local date so the Hijri calendar rolls over after midnight.
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
    ? `${data.day ?? ''} ${language === 'ur' ? (data.month?.ar ?? data.month?.en ?? '') : (data.month?.en ?? '')} ${data.year ?? ''} ${language === 'ur' ? 'ھ' : data.designation?.abbreviated ?? 'AH'}`.trim()
    : null;

  return (
    <section className="hijri-date-strip" aria-label={copy.hijri} dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <div className="hijri-date-inner">
        <div className="hijri-date-block">
          <span className="hijri-date-label"><MoonStar size={15} aria-hidden="true" />{copy.hijri}</span>
          <span className="hijri-date-value" aria-live="polite">
            {isPending ? copy.loading : isError || !hijriLabel ? copy.unavailable : hijriLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
