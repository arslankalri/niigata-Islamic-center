import cover from '@/assets/visit-cover.webp.asset.json';
import lunch from '@/assets/visit-lunch.webp.asset.json';
import banner from '@/assets/visit-banner.webp.asset.json';
import nippo1 from '@/assets/nippo-1.webp.asset.json';
import nippo2 from '@/assets/nippo-2.webp.asset.json';
import nippo3 from '@/assets/nippo-3.webp.asset.json';

export type Announcement = {
  slug: string;
  /** Language the article is written in; it is never shown as a translation. */
  language: 'ur' | 'en' | 'ja';
  date: string;
  title: string;
  status: 'draft' | 'published';
  category?: string;
  author?: string;
  body: (string | { heading: string })[];
  cover?: { url: string; alt: string; width: number; height: number };
  reviewImages?: { url: string; alt: string; width: number; height: number }[];
  gallery: { url: string; alt: string; width: number; height: number }[];
};

/**
 * Article text, dates, status, titles, authors and categories now live in Supabase.
 * These legacy image references are retained temporarily because the original image
 * files are hosted as application assets, not yet in the Supabase Storage bucket.
 * They are media-only fallbacks for the two imported records.
 */
const legacyArticleMedia: Pick<Announcement, 'slug' | 'cover' | 'gallery'>[] = [
  {
    slug: 'japanese-volunteer-teachers-visit',
    cover: { url: cover.url, alt: 'نیگاتا اسلامک سینٹر کی عمارت کے سامنے جاپانی مہمانوں اور کمیونٹی اراکین کی گروپ تصویر', width: 1600, height: 1200 },
    gallery: [
      { url: lunch.url, alt: 'مسجد کے ہال میں مہمان اور کمیونٹی اراکین ظہرانے کے لیے اکٹھے بیٹھے ہیں', width: 1200, height: 1600 },
      { url: banner.url, alt: 'جاپانی زبان کی کلاس کا بینر تھامے مہمانوں اور کمیونٹی اراکین کی قریبی گروپ تصویر', width: 1600, height: 1200 },
    ],
  },
  {
    slug: 'niigata-muslim-community-newspaper-coverage',
    cover: { url: nippo1.url, alt: 'نیگاتا نیپو میں نیگاتا کی مسلم کمیونٹی سے متعلق رپورٹ — نمازِ جمعہ اور مسجد', width: 814, height: 771 },
    gallery: [
      { url: nippo2.url, alt: 'نیگاتا نیپو میں نیگاتا کی مسلم کمیونٹی سے متعلق رپورٹ — حلال خوراک', width: 813, height: 699 },
      { url: nippo3.url, alt: 'نیگاتا نیپو میں نیگاتا کی مسلم کمیونٹی سے متعلق رپورٹ — سوشل میڈیا اور تعصب', width: 813, height: 777 },
    ],
  },
];

/** No article content is hard-coded here; public posts are loaded from Supabase. */
export const announcements: Announcement[] = [];
export const publishedAnnouncements: Announcement[] = [];
export const paragraphs = (a: Announcement) => a.body.filter((b): b is string => typeof b === 'string');

export function findAnnouncement(slug: string): Announcement | undefined {
  const media = legacyArticleMedia.find(a => a.slug === slug);
  if (!media) return undefined;
  return {
    slug: media.slug,
    language: 'ur',
    date: '',
    title: '',
    status: 'published',
    body: [],
    cover: media.cover,
    gallery: media.gallery,
  };
}

export function formatDate(iso: string, language: 'en' | 'ja' | 'ur') {
  const locale = language === 'ja' ? 'ja-JP' : language === 'ur' ? 'ur-PK' : 'en-GB';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Tokyo' }).format(new Date(iso + 'T12:00:00+09:00'));
}
