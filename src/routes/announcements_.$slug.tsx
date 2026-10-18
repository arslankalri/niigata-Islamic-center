import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { findAnnouncement, formatDate, paragraphs } from '@/lib/announcements';
import { useAnnouncements } from '@/lib/announcements-db';
import { useLanguage } from '@/components/site/language';
import { dictionaries } from '@/lib/translations';

export const Route = createFileRoute('/announcements_/$slug')({
  // Built-in articles load instantly; dashboard articles are looked up in the browser.
  loader: ({ params }) => findAnnouncement(params.slug) ?? null,
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
  const staticA = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { t, language } = useLanguage();
  const all = useAnnouncements(language);
  const a = all.find(x => x.slug === slug) ?? staticA;
  if (!a) return <div className="content-width section-space article-page"><Link to="/announcements" className="text-link article-back"><ArrowLeft size={17} />{t.backToAnnouncements}</Link><p>{t.noAnnouncements}</p></div>;
  const d = dictionaries[a.language];
  const rtl = a.language === 'ur';
  const images = [...(a.cover ? [a.cover] : []), ...a.gallery];
  const review = import.meta.env.DEV ? a.reviewImages ?? [] : [];
  return (
    <article className="content-width section-space article-page">
      <Link to="/announcements" className="text-link article-back"><ArrowLeft size={17} />{t.backToAnnouncements}</Link>
      {a.status === 'draft' && <p className="article-lang-note" role="status">Draft — not listed on the website. Awaiting fact and image-permission review.</p>}
      {rtl && t.urduOnly && <p className="article-lang-note">{t.urduOnly}</p>}
      <div lang={a.language} dir={rtl ? 'rtl' : 'ltr'} className="article-body">
        <p className="article-meta"><span>{a.category ?? d.articleCategory}</span> · <time dateTime={a.date}>{formatDate(a.date, a.language)}</time></p>
        <h1>{a.title}</h1>
        {a.author && <p className="article-byline">{rtl ? 'تحریر: ' : language === 'ja' ? '文：' : 'By '}{a.author}</p>}
        {a.cover && <img className="article-cover" src={a.cover.url} alt={a.cover.alt} width={a.cover.width} height={a.cover.height} />}
        {a.body.map((p, i) => typeof p === 'string' ? <p key={i}>{p}</p> : <h2 key={i}>{p.heading}</h2>)}
        {images.length > 0 && <><h2>{d.gallery}</h2><div className="article-gallery">{images.map(img => <img key={img.url} src={img.url} alt={img.alt} width={img.width} height={img.height} loading="lazy" />)}</div></>}
        {review.length > 0 && <><h2>نیگاتا نیپو — حوالہ جاتی صفحات (صرف جائزے کے لیے)</h2><div className="article-gallery">{review.map(img => <img key={img.url} src={img.url} alt={img.alt} width={img.width} height={img.height} loading="lazy" />)}</div></>}
      </div>
    </article>
  );
}
