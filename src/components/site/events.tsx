import { Link } from '@tanstack/react-router';
import { ArrowRight, CalendarDays, Clock3, MapPin, UserCheck } from 'lucide-react';
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

export function EventHighlight({ e }: { e: SiteEvent }) {
  const { t, language } = useLanguage();
  return <section className="event-highlight" aria-label={t.featuredEvent}><div className="content-width event-highlight-grid">
    <img className="event-poster" src={e.poster.url} alt={e.poster.alt} width={e.poster.width} height={e.poster.height} loading="lazy" />
    <div className="event-highlight-copy">
      <p className="eyebrow"><span />{t.featuredEvent}</p>
      <h2 {...titleProps(language)}>{e.title[language]}</h2>
      {language !== 'ur' && <p className="event-alt-title" lang="ur" dir="rtl">{e.title.ur}</p>}
      <p className="event-reminder"><UserCheck size={18} />{t.receptionReminder} {formatTime(e.reception, language)}</p>
      <ul className="event-facts">
        <li><CalendarDays size={17} /><time dateTime={e.start}>{formatEventDate(e.start, language)}</time></li>
        <li><Clock3 size={17} /><span>{formatTime(e.start, language)}–{formatTime(e.end, language)}</span></li>
        <li><MapPin size={17} /><span>{e.location[language]}</span></li>
      </ul>
      <Link to="/events/$slug" params={{ slug: e.slug }} className="site-action event-cta">{t.viewEvent}<ArrowRight size={17} /></Link>
    </div>
  </div></section>;
}
