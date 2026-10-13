import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft, CalendarDays, Car, Clock3, CloudRain, MapPin, UserCheck } from 'lucide-react';
import { findEvent, formatEventDate, formatTime } from '@/lib/events';
import { useLanguage } from '@/components/site/language';

export const Route = createFileRoute('/events_/$slug')({
  loader: ({ params }) => { const e = findEvent(params.slug); if (!e) throw notFound(); return e; },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title.en} — Islamic Center Niigata` : 'Event — Islamic Center Niigata';
    const description = loaderData ? loaderData.summary.en : 'Event from Islamic Center Niigata.';
    return { meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' }, ...(loaderData ? [] : [{ name: 'robots', content: 'noindex' }])] };
  },
  component: EventPage,
});

function EventPage() {
  const e = Route.useLoaderData();
  const { t, language } = useLanguage();
  const dir = language === 'ur' ? 'rtl' : 'ltr';
  return (
    <article className="content-width section-space article-page event-page">
      <Link to="/events" className="text-link article-back"><ArrowLeft size={17} />{t.backToEvents}</Link>
      <header lang={language} dir={dir} className="event-page-head">
        <h1>{e.title[language]}</h1>
        <p>{e.summary[language]}</p>
        <p className="event-reminder"><UserCheck size={18} />{t.receptionReminder} {formatTime(e.reception, language)}</p>
        <ul className="event-facts">
          <li><CalendarDays size={17} /><span><strong>{formatEventDate(e.start, language)}</strong></span></li>
          <li><Clock3 size={17} /><span>{t.eventTime}: {formatTime(e.start, language)}–{formatTime(e.end, language)}</span></li>
          <li><MapPin size={17} /><span>{t.eventLocation}: {e.location[language]}</span></li>
          <li><Car size={17} /><span>{t.eventParking}: <span dir="ltr">{e.parking}</span></span></li>
          <li><CloudRain size={17} /><span>{t.eventWeather}: {e.weather[language]}</span></li>
        </ul>
      </header>
      <img className="event-page-poster" src={e.poster.url} alt={e.poster.alt} width={e.poster.width} height={e.poster.height} />
      {t.eventUrduNote && <p className="article-lang-note">{t.eventUrduNote}</p>}
      <div lang="ur" dir="rtl" className="article-body">
        <h2>{e.title.ur}</h2>
        {e.body.map((b, i) => typeof b === 'string' ? <p key={i}>{b}</p> : 'heading' in b ? <h2 key={i}>{b.heading}</h2> : <ul key={i} className="event-list">{b.list.map(x => <li key={x}>{x}</li>)}</ul>)}
      </div>
    </article>
  );
}
