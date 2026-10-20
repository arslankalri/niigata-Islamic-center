import { Link } from '@tanstack/react-router';
import { ArrowRight, Bell } from 'lucide-react';
import { useLanguage } from './language';
import { formatDate, paragraphs } from '@/lib/announcements';
import { useAnnouncements } from '@/lib/announcements-db';

export function AnnouncementTicker() {
  const { t, language } = useLanguage();
  const items = useAnnouncements(language);
  if (items.length === 0) return null;

  // Show only the newest published item, whether it is a news article or an announcement.
  const a = items[0];
  if (!a) return null;
  const excerpt = paragraphs(a)[0];

  return (
    <section className="announcement-ticker" aria-label={t.tickerLabel}>
      {a.cover && <img key={a.slug} className="ticker-cover" src={a.cover.url} alt="" aria-hidden="true" width={a.cover.width} height={a.cover.height} />}
      <div className="ticker-shade" aria-hidden="true" />
      <div className="content-width ticker-inner">
        <span className="ticker-label"><Bell size={15} aria-hidden="true" />{t.tickerLabel}</span>
        <div className="ticker-body">
          <time dateTime={a.date}>{formatDate(a.date, language)}</time>
          <p className="ticker-title" lang={a.language} dir={a.language === 'ur' ? 'rtl' : 'ltr'}>{a.title}</p>
          {excerpt && <p className="ticker-excerpt" lang={a.language} dir={a.language === 'ur' ? 'rtl' : 'ltr'}>{excerpt}</p>}
        </div>
        <div className="ticker-actions">
          <Link to="/announcements/$slug" params={{ slug: a.slug }} className="ticker-link">{t.readArticle}<ArrowRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
}
