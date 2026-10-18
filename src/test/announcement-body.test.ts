import { describe, expect, it } from 'vitest';
import { parseBody, pickLang } from '@/lib/announcements-db';

describe('dashboard article text', () => {
  it('splits paragraphs on blank lines and turns "## " lines into headings', () => {
    expect(parseBody('First\n\n## Heading\n\nSecond')).toEqual(['First', { heading: 'Heading' }, 'Second']);
  });
  it('falls back to the main language when the visitor language is missing', () => {
    expect(pickLang({ ur: 'عنوان' }, 'ur', 'en')).toBe('ur');
    expect(pickLang({ ur: 'عنوان', en: 'Title' }, 'ur', 'en')).toBe('en');
  });
});
