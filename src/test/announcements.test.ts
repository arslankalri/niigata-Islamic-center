import { describe, expect, it } from 'vitest';
import { findAnnouncement, publishedAnnouncements } from '@/lib/announcements';

const slug = 'niigata-muslim-community-newspaper-coverage';

describe('Approved newspaper article', () => {
  it('is published with today’s publication date', () => {
    const article = findAnnouncement(slug);
    expect(article?.status).toBe('published');
    expect(article?.date).toBe('2026-10-12');
    expect(publishedAnnouncements.some(a => a.slug === slug)).toBe(true);
  });

  it('makes all three permission-approved newspaper images public', () => {
    const article = findAnnouncement(slug);
    expect(article?.cover?.url).toContain('nippo-1.webp');
    expect(article?.gallery.map(image => image.url.split('/').pop())).toEqual(['nippo-2.webp', 'nippo-3.webp']);
    expect(article?.reviewImages ?? []).toEqual([]);
  });

  it('puts today’s article first in the public lists and ticker', () => {
    expect(publishedAnnouncements[0]?.slug).toBe(slug);
    expect(publishedAnnouncements[1]?.date).toBe('2026-10-10');
  });
});