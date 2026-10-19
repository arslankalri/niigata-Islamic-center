import { describe, expect, it } from 'vitest';
import { builtInSlugs, isSection, slugify, staticCounts, validatePost } from '@/lib/cms';

describe('admin CMS rules', () => {
  it('keeps both built-in article addresses reserved', () => {
    expect(builtInSlugs).toEqual(expect.arrayContaining(['japanese-volunteer-teachers-visit', 'niigata-muslim-community-newspaper-coverage']));
    expect(validatePost({ slug: 'japanese-volunteer-teachers-visit', title: { ur: 'x' }, primary_language: 'ur' })).toMatch(/built-in/);
  });
  it('requires a title in the main language', () => {
    expect(validatePost({ slug: 'eid-2026', title: { en: 'Eid' }, primary_language: 'ur' })).toMatch(/title/);
    expect(validatePost({ slug: 'eid-2026', title: { ur: 'عید' }, primary_language: 'ur' })).toBeNull();
  });
  it('makes clean web addresses', () => {
    expect(slugify(' Eid Gathering 2026! ')).toBe('eid-gathering-2026');
  });
  it('counts the two built-in posts and recognises sections', () => {
    expect(staticCounts().builtInPosts).toBe(2);
    expect(isSection('articles')).toBe(true);
    expect(isSection('nope')).toBe(false);
  });
});
