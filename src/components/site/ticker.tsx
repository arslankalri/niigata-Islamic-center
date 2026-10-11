import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowRight, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from './language';
import { announcements, formatDate } from '@/lib/announcements';

export function AnnouncementTicker() {
  const { t, language } = useLanguage();
  const items = announcements;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const multiple = items.length > 1;
  useEffect(() => {
    if (!multiple || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex(i => (i + 1) % items.length), 7000);
    return () => window.clearInterval(id);
  }, [multiple, paused, items.length]);
  if (items.length === 0) return null;
  const a = items[index % items.length];
  const excerpt = a.body[0];
  const go = (d: number) => setIndex(i => (i + d + items.length) % items.length);
  return (
    <section className="announcement-ticker" aria-label={t.tickerLabel} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="content-width ticker-inner">
        <span className="ticker-label"><Bell size={15} aria-hidden="true" />{t.tickerLabel}</span>
        <div className="ticker-body" aria-live={multiple && !paused ? 'off' : 'polite'}>
          <time dateTime={a.date}>{formatDate(a.date, language)}</time>
          <p className="ticker-title" lang={a.language} dir="rtl">{a.title}</p>
          <p className="ticker-excerpt" lang={a.language} dir="rtl">{excerpt}</p>
        </div>
        <div className="ticker-actions">
          {multiple && <><button type="button" onClick={() => go(-1)} aria-label={t.prevUpdate}><ChevronLeft size={16} /></button><button type="button" onClick={() => go(1)} aria-label={t.nextUpdate}><ChevronRight size={16} /></button></>}
          <Link to="/announcements/$slug" params={{ slug: a.slug }} className="ticker-link">{t.readAnnouncement}<ArrowRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
}
