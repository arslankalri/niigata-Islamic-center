import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { findAnnouncement, formatDate } from '@/lib/announcements';
import { useLanguage } from '@/components/site/language';
import { dictionaries } from '@/lib/translations';

export const Route = createFileRoute('/announcements_/$slug')({
  loader: ({ params }) => { const a = findAnnouncement(params.slug); if (!a) throw notFound(); return a; },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — Islamic Center Niigata` : 'Announcement — Islamic Center Niigata';
    const description = loaderData ? loaderData.body[0] : 'Announcement from Islamic Center Niigata.';
    return { meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' }] };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const a = Route.useLoaderData();
  const { t } = useLanguage();
  const ur = dictionaries.ur;
  return (
    <article className="content-width section-space article-page">
      <Link to="/announcements" className="text-link article-back"><ArrowLeft size={17} />{t.backToAnnouncements}</Link>
      {t.urduOnly && <p className="article-lang-note">{t.urduOnly}</p>}
      <div lang="ur" dir="rtl" className="article-body">
        <p className="article-meta"><span>{ur.articleCategory}</span> · <time dateTime={a.date}>{formatDate(a.date, 'ur')}</time></p>
        <h1>{a.title}</h1>
        <img className="article-cover" src={a.cover.url} alt={a.cover.alt} width={a.cover.width} height={a.cover.height} />
        {a.body.map((p, i) => <p key={i}>{p}</p>)}
        <h2>{ur.gallery}</h2>
        <div className="article-gallery">
          {[a.cover, ...a.gallery].map(img => <img key={img.url} src={img.url} alt={img.alt} width={img.width} height={img.height} loading="lazy" />)}
        </div>
      </div>
    </article>
  );
}
