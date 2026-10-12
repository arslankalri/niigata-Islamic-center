import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { findAnnouncement, formatDate, paragraphs } from '@/lib/announcements';
import { useLanguage } from '@/components/site/language';
import { dictionaries } from '@/lib/translations';

export const Route = createFileRoute('/announcements_/$slug')({
  loader: ({ params }) => { const a = findAnnouncement(params.slug); if (!a) throw notFound(); return a; },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — Islamic Center Niigata` : 'Announcement — Islamic Center Niigata';
    const description = loaderData ? paragraphs(loaderData)[0] ?? '' : 'Announcement from Islamic Center Niigata.';
    const meta = [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' }];
    if (loaderData?.status === 'draft') meta.push({ name: 'robots', content: 'noindex, nofollow' });
    return { meta };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const a = Route.useLoaderData();
  const { t } = useLanguage();
  const ur = dictionaries.ur;
  const images = [...(a.cover ? [a.cover] : []), ...a.gallery];
  // Newspaper scans awaiting reproduction permission appear only in the editor preview.
  const review = import.meta.env.DEV ? a.reviewImages ?? [] : [];
  return (
    <article className="content-width section-space article-page">
      <Link to="/announcements" className="text-link article-back"><ArrowLeft size={17} />{t.backToAnnouncements}</Link>
      {a.status === 'draft' && <p className="article-lang-note" role="status">Draft — not listed on the website. Awaiting fact and image-permission review.</p>}
      {t.urduOnly && <p className="article-lang-note">{t.urduOnly}</p>}
      <div lang="ur" dir="rtl" className="article-body">
        <p className="article-meta"><span>{a.category ?? ur.articleCategory}</span> · <time dateTime={a.date}>{formatDate(a.date, 'ur')}</time></p>
        <h1>{a.title}</h1>
        {a.author && <p className="article-byline" lang="ur">تحریر: {a.author}</p>}
        {a.cover && <img className="article-cover" src={a.cover.url} alt={a.cover.alt} width={a.cover.width} height={a.cover.height} />}
        {a.body.map((p, i) => typeof p === 'string' ? <p key={i}>{p}</p> : <h2 key={i}>{p.heading}</h2>)}
        {images.length > 0 && <><h2>{ur.gallery}</h2><div className="article-gallery">{images.map(img => <img key={img.url} src={img.url} alt={img.alt} width={img.width} height={img.height} loading="lazy" />)}</div></>}
        {review.length > 0 && <><h2>نیگاتا نیپو — حوالہ جاتی صفحات (صرف جائزے کے لیے)</h2><div className="article-gallery">{review.map(img => <img key={img.url} src={img.url} alt={img.alt} width={img.width} height={img.height} loading="lazy" />)}</div></>}
      </div>
    </article>
  );
}
