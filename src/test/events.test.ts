import { describe, expect, it } from 'vitest';
import { findEvent, upcomingEvents } from '@/lib/events';

const e = findEvent('east-port-clean-up-campaign-2026')!;
describe('East Port clean-up event', () => {
  it('runs 9:30–11:00 JST on 17 Oct 2026 with reception at 9:00', () => {
    expect(e.reception).toBe('2026-10-17T09:00:00+09:00');
    expect(e.start).toBe('2026-10-17T09:30:00+09:00');
    expect(e.end).toBe('2026-10-17T11:00:00+09:00');
  });
  it('is upcoming before it ends and gone after', () => {
    expect(upcomingEvents(new Date('2026-10-13T00:00:00Z')).map(x => x.slug)).toContain(e.slug);
    expect(upcomingEvents(new Date('2026-10-17T03:00:00Z'))).toHaveLength(0);
  });
});
