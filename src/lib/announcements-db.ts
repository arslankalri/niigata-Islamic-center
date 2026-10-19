import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { findAnnouncement, publishedAnnouncements, type Announcement } from '@/lib/announcements';

export type Lang = 'en' | 'ja' | 'ur';
type Texts = Partial<Record<Lang, string>>;

export const BUCKET = 'announcement-media';

/** Turns editor text into article blocks: blank lines split paragraphs, "## " starts a heading. */
export function parseBody(text: string): Announcement['body'] {
  return text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean).map(s => s.startsWith('## ') ? { heading: s.slice(3).trim() } : s);
}

/** Visitor's language when the article has it, otherwise the article's main language. */
export function pickLang(title: Texts, primary: Lang, wanted: Lang): Lang {
  return title[wanted]?.trim() ? wanted : primary;
}

type Row = {
  id: string; slug: string; publish_date: string; primary_language: string; title: unknown; body: unknown;
  category: unknown; author: string | null; cover_image_id: string | null;
  announcement_images: { id: string; storage_path: string; alt: unknown; width: number | null; height: number | null; sort_order: number }[];
};

async function fetchPublished(): Promise<{ row: Row; urls: Record<string, string> }[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('id, slug, publish_date, primary_language, title, body, category, author, cover_image_id, announcement_images!announcement_images_announcement_id_fkey(id, storage_path, alt, width, height, sort_order)')
    .eq('status', 'published')
    .eq('content_type', 'announcement');
  if (error) throw error;
  const rows = (data ?? []) as unknown as Row[];
  const paths = rows.flatMap(r => r.announcement_images.map(i => i.storage_path));
  const urls: Record<string, string> = {};
  if (paths.length) {
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60 * 24);
    signed?.forEach(s => { if (s.path && s.signedUrl) urls[s.path] = s.signedUrl; });
  }
  return rows.map(row => ({ row, urls }));
}

function toAnnouncement({ row, urls }: { row: Row; urls: Record<string, string> }, wanted: Lang): Announcement {
  const title = (row.title ?? {}) as Texts;
  const body = (row.body ?? {}) as Texts;
  const cat = (row.category ?? {}) as Texts;
  const lang = pickLang(title, (row.primary_language as Lang) || 'ur', wanted);
  const imgs = [...row.announcement_images].sort((a, b) => a.sort_order - b.sort_order)
    .filter(i => urls[i.storage_path])
    .map(i => ({ id: i.id, url: urls[i.storage_path]!, alt: ((i.alt ?? {}) as Texts)[lang] ?? '', width: i.width ?? 1200, height: i.height ?? 900 }));
  const cover = imgs.find(i => i.id === row.cover_image_id) ?? imgs[0];
  const a: Announcement = {
    slug: row.slug, language: lang, status: 'published', date: row.publish_date,
    title: title[lang] ?? '', body: parseBody(body[lang] ?? ''), gallery: imgs.filter(i => i !== cover),
  };
  if (cat[lang]) a.category = cat[lang];
  if (row.author) a.author = row.author;
  if (cover) a.cover = cover;
  // Existing code-managed articles may be moved into the database from the admin editor.
  // Retain their already-published static media until an admin adds replacement uploads.
  const legacy = findAnnouncement(row.slug);
  if (!a.cover && legacy?.cover) a.cover = legacy.cover;
  if (a.gallery.length === 0 && legacy?.gallery?.length) a.gallery = legacy.gallery;
  return a;
}

const query = { queryKey: ['public-announcements'], queryFn: fetchPublished, staleTime: 5 * 60 * 1000 };

/** Built-in articles plus ones published from the dashboard, newest first. */
export function useAnnouncements(language: Lang): Announcement[] {
  const { data } = useQuery(query);
  const fromDb = (data ?? []).map(d => toAnnouncement(d, language));
  const slugs = new Set(fromDb.map(a => a.slug));
  return [...fromDb, ...publishedAnnouncements.filter(a => !slugs.has(a.slug))].sort((a, b) => b.date.localeCompare(a.date));
}
