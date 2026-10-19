import { announcements } from '@/lib/announcements';
import { events } from '@/lib/events';

export type ContentType = 'announcement' | 'article';
export type Status = 'draft' | 'published' | 'archived';

export const ADMIN_SECTIONS = [
  { key: 'overview', label: 'Dashboard Overview' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'articles', label: 'News & Articles' },
  { key: 'events', label: 'Events' },
  { key: 'prayer', label: 'Prayer Times' },
  { key: 'media', label: 'Media Library' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'settings', label: 'Website Settings' },
  { key: 'activity', label: 'Security & Activity History' },
] as const;
export type Section = (typeof ADMIN_SECTIONS)[number]['key'];
export const isSection = (s: unknown): s is Section => ADMIN_SECTIONS.some(x => x.key === s);

/** Slugs owned by the built-in articles; dashboard posts may never reuse them. */
export const builtInSlugs = announcements.map(a => a.slug);

export function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function validatePost(p: { slug: string; title: Partial<Record<string, string>>; primary_language: string }): string | null {
  const slug = slugify(p.slug);
  if (!slug) return 'Please add a web address (for example: eid-gathering-2026).';
  if (builtInSlugs.includes(slug)) return 'This web address is already used by a built-in article. Please choose another.';
  if (!p.title[p.primary_language]?.trim()) return 'Please add a title in the main language.';
  return null;
}

export function staticCounts(now = new Date()) {
  return {
    builtInPosts: announcements.filter(a => a.status === 'published').length,
    events: events.filter(e => e.status === 'published').length,
    upcomingEvents: events.filter(e => e.status === 'published' && new Date(e.end) > now).length,
  };
}
