import { Link } from '@tanstack/react-router';
import { ArrowRight, CalendarDays, UserCheck } from 'lucide-react';
import { useLanguage } from './language';
import { formatEventDate, formatTime, type SiteEvent } from '@/lib/events';

function titleProps(language: 'en' | 'ja' | 'ur') { return { lang: language, dir: language === 'ur' ? 'rtl' : 'ltr' } as const; }

export function EventCard({ e }: { e: SiteEvent }) {
  const { t, language } = useLanguage();
  return <Link to="/events/$slug" params={{ slug: e.slug }} className="news-item news-article event-card">
    <img src={e.poster.url} alt={e.poster.alt} loading="lazy" width="120" height="180" />
    <div>
      <p className="article-meta"><time dateTime={e.start}>{formatEventDate(e.start, language)}</time></p>
      <h3 {...titleProps(language)}>{e.title[language]}</h3>
      <p>{t.receptionReminder} {formatTime(e.reception, language)} · {formatTime(e.start, language)}–{formatTime(e.end, language)}</p>
      <span className="text-link">{t.viewEvent}<ArrowRight size={17} /></span>
    </div>
  </Link>;
}

/** Compact event teaser placed alongside the latest-announcement ticker. */
export function CompactEventHighlight({ e }: { e: SiteEvent }) {
  const { t, language } = useLanguage();
  return <section className="compact-event-strip" aria-label={t.featuredEvent}>
    <div className="content-width compact-event-inner">
      <img className="compact-event-poster" src={e.poster.url} alt="" aria-hidden="true" width="72" height="96" />
      <div className="compact-event-copy">
        <p className="compact-event-label"><CalendarDays size={14} />{t.featuredEvent}</p>
        <h2 {...titleProps(language)}>{e.title[language]}</h2>
        <p className="compact-event-meta"><time dateTime={e.start}>{formatEventDate(e.start, language)}</time><span aria-hidden="true">·</span><span><UserCheck size={14} />{t.receptionReminder} {formatTime(e.reception, language)}</span></p>
      </div>
      <Link to="/events/$slug" params={{ slug: e.slug }} className="compact-event-link">{t.viewEvent}<ArrowRight size={16} /></Link>
    </div>
  </section>;
}
