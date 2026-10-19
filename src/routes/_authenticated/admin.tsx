import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BUCKET, parseBody, type Lang } from '@/lib/announcements-db';
import { announcements as builtIn } from '@/lib/announcements';
import { events } from '@/lib/events';
import { ADMIN_SECTIONS, isSection, slugify, staticCounts, validatePost, type ContentType, type Section, type Status } from '@/lib/cms';

export const Route = createFileRoute('/_authenticated/admin')({
  validateSearch: (s: Record<string, unknown>): { section?: Section } => (isSection(s['section']) ? { section: s['section'] } : {}),
  head: () => ({ meta: [
    { title: 'Dashboard — Islamic Center Niigata' },
    { name: 'description', content: 'Manage announcements for Islamic Center Niigata.' },
    { property: 'og:title', content: 'Dashboard — Islamic Center Niigata' },
    { property: 'og:description', content: 'Manage announcements for Islamic Center Niigata.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: Dashboard,
});

const LANGS: { key: Lang; label: string; dir: 'rtl' | 'ltr' }[] = [
  { key: 'ur', label: 'Urdu', dir: 'rtl' }, { key: 'en', label: 'English', dir: 'ltr' }, { key: 'ja', label: 'Japanese', dir: 'ltr' },
];
type Texts = Partial<Record<Lang, string>>;
type Img = { id: string; storage_path: string; sort_order: number; url?: string };
type Row = { id: string; slug: string; status: Status; content_type: ContentType; publish_date: string; primary_language: string; title: Texts; body: Texts; category: Texts; excerpt: Texts; seo_title: Texts; seo_description: Texts; author: string | null; cover_image_id: string | null; updated_at: string; announcement_images: Img[] };
type Draft = { id?: string; content_type: ContentType; slug: string; status: Status; publish_date: string; primary_language: Lang; title: Texts; body: Texts; category: Texts; excerpt: Texts; seo_title: Texts; seo_description: Texts; author: string; cover_image_id: string | null; images: Img[] };
const SELECT = '*, announcement_images!announcement_images_announcement_id_fkey(id, storage_path, sort_order)';
const STATUS_LABEL: Record<Status, string> = { draft: 'Draft', published: 'Published', archived: 'Archived' };

const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const empty = (content_type: ContentType): Draft => ({ content_type, slug: '', status: 'draft', publish_date: today(), primary_language: 'ur', title: {}, body: {}, category: {}, excerpt: {}, seo_title: {}, seo_description: {}, author: '', cover_image_id: null, images: [] });

async function shrink(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise<Blob>((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('image')), 'image/webp', 0.82));
  return { blob, width: w, height: h };
}

async function logActivity(action: string, entity: string, entity_id: string | null, summary: string) {
  const { data: u } = await supabase.auth.getUser();
  await supabase.from('admin_activity').insert({ action, entity, entity_id, summary, actor_email: u.user?.email ?? null });
}

function Dashboard() {
  const navigate = useNavigate();
  const { section = 'overview' } = Route.useSearch();
  const qc = useQueryClient();
  const role = useQuery({ queryKey: ['is-admin'], queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', u.user!.id).eq('role', 'admin');
    return { admin: (data?.length ?? 0) > 0, email: u.user?.email ?? '' };
  } });
  const list = useQuery({ enabled: !!role.data?.admin, queryKey: ['admin-announcements'], queryFn: async () => {
    const { data, error } = await supabase.from('announcements').select(SELECT).order('publish_date', { ascending: false });
    if (error) throw error;
    return data as unknown as Row[];
  } });

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: '/admin/login', replace: true });
  }

  if (role.isLoading) return <section className="content-width section-space"><p>Loading…</p></section>;
  if (!role.data?.admin) return (
    <section className="content-width section-space" style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: '1.8rem' }}>Not authorised</h1>
      <p>{role.data?.email} does not have admin access.</p>
      <Button onClick={signOut} style={{ marginTop: '1rem' }}>Sign out</Button>
    </section>
  );

  const rows = list.data ?? [];
  return (
    <section className="content-width section-space admin-dash">
      <div className="admin-top">
        <div><h1>Admin</h1><p>{role.data.email}</p></div>
        <Button variant="outline" onClick={signOut}>Sign out</Button>
      </div>
      <nav className="admin-nav" aria-label="Admin sections">
        {ADMIN_SECTIONS.map(s => (
          <Link key={s.key} to="/admin" search={{ section: s.key }} className={s.key === section ? 'active' : ''}>{s.label}</Link>
        ))}
      </nav>
      {section === 'overview' && <Overview rows={rows} />}
      {section === 'announcements' && <PostManager key="a" type="announcement" rows={rows} />}
      {section === 'articles' && <PostManager key="n" type="article" rows={rows} />}
      {section === 'events' && <EventsInfo />}
      {section === 'prayer' && <PrayerScheduleManager />}
      {section === 'media' && <Media rows={rows} />}
      {section === 'analytics' && <Info title="Analytics">Visitor statistics (visitors, page views, top pages, sources, devices) are collected by the website hosting and can be viewed in the Lovable project's analytics panel. They are not yet shown inside this dashboard, because reading them here would need a secure server connection that is not set up. No numbers are shown here so nothing is guessed.</Info>}
      {section === 'settings' && <SettingsManager />}
      {section === 'activity' && <Activity />}
    </section>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="admin-card"><h2>{title}</h2><p>{children}</p><span className="admin-badge">Read-only — not editable here yet</span></div>;
}

function Overview({ rows }: { rows: Row[] }) {
  const s = staticCounts();
  const count = (t: ContentType, st?: Status) => rows.filter(r => r.content_type === t && (!st || r.status === st)).length;
  const stats: [string, number, string][] = [
    ['Dashboard announcements', count('announcement'), `${count('announcement', 'published')} published`],
    ['Dashboard articles', count('article'), `${count('article', 'published')} published`],
    ['Built-in articles', s.builtInPosts, 'part of the website code, always shown'],
    ['Events', s.events, `${s.upcomingEvents} upcoming · built-in`],
  ];
  return (
    <div className="admin-stats">
      {stats.map(([l, n, sub]) => <div key={l} className="admin-card"><span>{l}</span><strong>{n}</strong><small>{sub}</small></div>)}
    </div>
  );
}

function EventsInfo() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<any>(null); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const q = useQuery({ queryKey: ['admin-site-events'], queryFn: async () => { const { data, error } = await (supabase as any).from('site_events').select('*').order('start_at', { ascending: true }); if (error) throw error; return data ?? []; } });
  const blank = () => ({ slug: '', status: 'draft', start_at: '', end_at: '', reception_at: '', content: { title: { en: '', ja: '', ur: '' }, summary: { en: '', ja: '', ur: '' }, location: { en: '', ja: '', ur: '' }, weather: { en: '', ja: '', ur: '' }, parking: '', bodyText: '' } });
  function edit(e: any) { setDraft({ ...e, content: { ...blank().content, ...(e.content ?? {}), title: { ...blank().content.title, ...(e.content?.title ?? {}) }, summary: { ...blank().content.summary, ...(e.content?.summary ?? {}) }, location: { ...blank().content.location, ...(e.content?.location ?? {}) }, weather: { ...blank().content.weather, ...(e.content?.weather ?? {}) } } }); setMsg(''); }
  async function save() { if (!draft) return; if (!draft.slug.trim() || !draft.content.title.en.trim() || !draft.start_at || !draft.end_at) { setMsg('Slug, English title, start time and end time are required.'); return; } if (new Date(draft.end_at) <= new Date(draft.start_at)) { setMsg('End time must be after start time.'); return; } setBusy(true); setMsg(''); try { const { data: auth } = await supabase.auth.getUser(); const payload = { slug: draft.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''), status: draft.status, start_at: new Date(draft.start_at).toISOString(), end_at: new Date(draft.end_at).toISOString(), reception_at: draft.reception_at ? new Date(draft.reception_at).toISOString() : null, content: draft.content, poster_path: draft.poster_path ?? null, updated_by: auth.user?.id ?? null, updated_at: new Date().toISOString() }; const res = draft.id ? await (supabase as any).from('site_events').update(payload).eq('id', draft.id) : await (supabase as any).from('site_events').insert(payload); if (res.error) throw res.error; await logActivity(draft.id ? 'update' : 'create', 'event', draft.id ?? null, draft.content.title.en); await qc.invalidateQueries({ queryKey: ['admin-site-events'] }); setDraft(null); setMsg('Event saved.'); } catch (e) { setMsg(e instanceof Error ? e.message : 'Could not save event. Apply migration 0003 first.'); } finally { setBusy(false); } }
  async function archive(e: any) { if (!e.id || !confirm('Archive this event?')) return; const { error } = await (supabase as any).from('site_events').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', e.id); if (error) setMsg(error.message); else { await qc.invalidateQueries({ queryKey: ['admin-site-events'] }); await logActivity('archive', 'event', e.id, e.content?.title?.en ?? e.slug); } }
  const dt = (v: string) => v ? new Date(new Date(v).getTime() - new Date(v).getTimezoneOffset()*60000).toISOString().slice(0,16) : '';
  return <div className="admin-card"><div className="admin-top"><div><h2>Events</h2><p>Create, edit, publish, draft or archive events with English, Japanese and Urdu content.</p></div><Button onClick={() => { setDraft(blank()); setMsg(''); }}>New event</Button></div>{q.error && <p role="alert">Could not load events: {q.error.message}. Apply migration 0003 first.</p>}<ul className="admin-list">{(q.data ?? []).map((e: any) => <li key={e.id} className="admin-item"><span className="admin-badge">{e.status}</span><strong>{e.content?.title?.en || e.slug}</strong><span>{e.start_at ? new Date(e.start_at).toLocaleString() : ''}</span><Button size="sm" variant="outline" onClick={() => edit(e)}>Edit</Button><Button size="sm" variant="outline" disabled={e.status === 'archived'} onClick={() => archive(e)}>Archive</Button></li>)}</ul>{(q.data?.length ?? 0) === 0 && !q.isLoading && <p>No saved events yet. Existing code-based events are preserved and are not removed.</p>}
  {draft && <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}><h3>{draft.id ? 'Edit event' : 'New event'}</h3><label>Slug<Input value={draft.slug} onChange={e => setDraft({ ...draft, slug: e.target.value })} /></label><label>Status<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label>Start date/time<Input type="datetime-local" value={dt(draft.start_at)} onChange={e => setDraft({ ...draft, start_at: e.target.value })} /></label><label>End date/time<Input type="datetime-local" value={dt(draft.end_at)} onChange={e => setDraft({ ...draft, end_at: e.target.value })} /></label><label>Reception date/time<Input type="datetime-local" value={dt(draft.reception_at)} onChange={e => setDraft({ ...draft, reception_at: e.target.value })} /></label>
  {(['en','ja','ur'] as Lang[]).map(lang => <div key={lang} style={{ display: 'grid', gap: '.5rem' }}><h4>{lang === 'en' ? 'English' : lang === 'ja' ? 'Japanese' : 'Urdu'}</h4><label>Title<Input value={draft.content.title?.[lang] ?? ''} onChange={e => setDraft({ ...draft, content: { ...draft.content, title: { ...draft.content.title, [lang]: e.target.value } } })} /></label><label>Summary<Textarea value={draft.content.summary?.[lang] ?? ''} onChange={e => setDraft({ ...draft, content: { ...draft.content, summary: { ...draft.content.summary, [lang]: e.target.value } } })} /></label><label>Location<Input value={draft.content.location?.[lang] ?? ''} onChange={e => setDraft({ ...draft, content: { ...draft.content, location: { ...draft.content.location, [lang]: e.target.value } } })} /></label><label>Weather notes<Textarea value={draft.content.weather?.[lang] ?? ''} onChange={e => setDraft({ ...draft, content: { ...draft.content, weather: { ...draft.content.weather, [lang]: e.target.value } } })} /></label></div>)}
  <label>Parking / address<Input value={draft.content.parking ?? ''} onChange={e => setDraft({ ...draft, content: { ...draft.content, parking: e.target.value } })} /></label><label>Full description<Textarea rows={8} value={draft.content.bodyText ?? ''} onChange={e => setDraft({ ...draft, content: { ...draft.content, bodyText: e.target.value } })} /></label>{msg && <p role="status">{msg}</p>}<div style={{ display: 'flex', gap: '.5rem' }}><Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save event'}</Button><Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button></div></div>}</div>;
}
function Media({ rows }: { rows: Row[] }) {
  const n = rows.reduce((a, r) => a + r.announcement_images.length, 0);
  return <Info title="Media Library">{`${n} photo(s) are uploaded with dashboard posts. Photos are added, removed and chosen as covers inside each post's editor. A shared library to reuse photos across posts is not available yet.`}</Info>;
}

function SettingsManager() {
  const qc = useQueryClient();
  const [value, setValue] = useState<Record<string, string>>({ address: '', phone: '', email: '', website: '', instagram: '', facebook: '', youtube: '', notice_en: '', notice_ja: '', notice_ur: '' });
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const q = useQuery({ queryKey: ['admin-site-settings'], queryFn: async () => { const { data, error } = await (supabase as any).from('site_settings').select('value').eq('key', 'public').maybeSingle(); if (error) throw error; return data?.value ?? {}; } });
  React.useEffect(() => { if (q.data) setValue(v => ({ ...v, ...q.data })); }, [q.data]);
  async function save() { setBusy(true); setMsg(''); try { const { data: auth } = await supabase.auth.getUser(); const { error } = await (supabase as any).from('site_settings').upsert({ key: 'public', value, updated_at: new Date().toISOString(), updated_by: auth.user?.id ?? null }); if (error) throw error; await logActivity('update', 'settings', null, 'Updated public website settings'); await qc.invalidateQueries({ queryKey: ['admin-site-settings'] }); setMsg('Saved to the database. Public pages still need to be connected to these values before the live site changes.'); } catch (e) { setMsg(e instanceof Error ? e.message : 'Could not save settings. Apply migration 0003 first.'); } finally { setBusy(false); } }
  const fields: [string, string][] = [['address','Address'],['phone','Phone'],['email','Email'],['website','Website URL'],['instagram','Instagram URL'],['facebook','Facebook URL'],['youtube','YouTube URL'],['notice_en','Homepage notice (English)'],['notice_ja','Homepage notice (Japanese)'],['notice_ur','Homepage notice (Urdu)']];
  return <div className="admin-card"><h2>Website Settings</h2><p>Edit contact details, social links and homepage notices. Values are stored persistently; public page wiring is still required.</p>{q.error && <p role="alert">Could not load settings: {q.error.message}</p>}<div style={{ display: 'grid', gap: '1rem', maxWidth: 760 }}>{fields.map(([key, label]) => <label key={key}>{label}{key.startsWith('notice_') ? <Textarea rows={3} value={value[key] ?? ''} onChange={e => setValue({ ...value, [key]: e.target.value })} /> : <Input value={value[key] ?? ''} onChange={e => setValue({ ...value, [key]: e.target.value })} />}</label>)}</div>{msg && <p role="status">{msg}</p>}<Button onClick={save} disabled={busy || q.isLoading}>{busy ? 'Saving…' : 'Save settings'}</Button></div>;
}

function PrayerScheduleManager() {
  const qc = useQueryClient();
  const [schedule, setSchedule] = useState<Record<string, string>>({ fajr: '', sunrise: '', dhuhr: '', asr: '', maghrib: '', isha: '', jumuah: '' });
  const [sourceNote, setSourceNote] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const q = useQuery({ queryKey: ['admin-prayer-schedule'], queryFn: async () => { const { data, error } = await (supabase as any).from('site_prayer_schedule').select('*').eq('id', true).maybeSingle(); if (error) throw error; return data; } });
  React.useEffect(() => { if (q.data) { setSchedule(s => ({ ...s, ...(q.data.schedule ?? {}) })); setSourceNote(q.data.source_note ?? ''); } }, [q.data]);
  async function save() { setBusy(true); setMsg(''); try { const { data: auth } = await supabase.auth.getUser(); const { error } = await (supabase as any).from('site_prayer_schedule').upsert({ id: true, schedule, source_note: sourceNote, updated_at: new Date().toISOString(), updated_by: auth.user?.id ?? null }); if (error) throw error; await logActivity('update', 'prayer_schedule', null, 'Updated draft prayer schedule'); await qc.invalidateQueries({ queryKey: ['admin-prayer-schedule'] }); setMsg('Saved as a draft. The public prayer display remains on the official external schedule until these times are verified.'); } catch (e) { setMsg(e instanceof Error ? e.message : 'Could not save. Apply migration 0003 first.'); } finally { setBusy(false); } }
  const names: [string, string][] = [['fajr','Fajr'],['sunrise','Sunrise'],['dhuhr','Dhuhr'],['asr','Asr'],['maghrib','Maghrib'],['isha','Isha'],['jumuah','Jumu’ah']];
  return <div className="admin-card"><h2>Prayer Times</h2><p>Enter mosque-approved times in 24-hour format. This saves an admin-maintained draft and does not override the official live display.</p><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>{names.map(([key, label]) => <label key={key}>{label}<Input type="time" value={schedule[key] ?? ''} onChange={e => setSchedule({ ...schedule, [key]: e.target.value })} /></label>)}</div><label>Source / verification note<Textarea rows={3} value={sourceNote} onChange={e => setSourceNote(e.target.value)} placeholder="Who confirmed these times and for which date/season?" /></label>{q.error && <p role="alert">Could not load schedule: {q.error.message}</p>}{msg && <p role="status">{msg}</p>}<Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save prayer schedule draft'}</Button></div>;
}
function Activity() {
  const q = useQuery({ queryKey: ['admin-activity'], queryFn: async () => {
    const { data, error } = await supabase.from('admin_activity').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return data;
  } });
  return (
    <div className="admin-card">
      <h2>Activity history</h2>
      <p>Changes made in this dashboard (last 100). Only administrators can see this. Sign-ins are protected by Google; admin rights are checked by the database.</p>
      <ul className="admin-list">
        {(q.data ?? []).map(a => <li key={a.id} className="admin-item"><span className="admin-badge">{a.action}</span><strong dir="auto">{a.summary}</strong><span>{new Date(a.created_at).toLocaleString()} · {a.actor_email}</span></li>)}
        {q.data?.length === 0 && <li className="admin-empty">No activity recorded yet.</li>}
      </ul>
    </div>
  );
}

function PostManager({ type, rows }: { type: ContentType; rows: Row[] }) {
  const qc = useQueryClient();
  const noun = type === 'article' ? 'article' : 'announcement';
  const [draft, setDraft] = useState<Draft | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [preview, setPreview] = useState<Lang | null>(null);

  const visible = rows.filter(r => r.content_type === type && (filter === 'all' || r.status === filter) &&
    (!search || [r.slug, ...Object.values(r.title ?? {})].join(' ').toLowerCase().includes(search.toLowerCase())));
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ['admin-announcements'] }), qc.invalidateQueries({ queryKey: ['public-announcements'] }), qc.invalidateQueries({ queryKey: ['admin-activity'] })]);

  async function edit(r: Row) {
    const imgs = [...r.announcement_images].sort((a, b) => a.sort_order - b.sort_order);
    if (imgs.length) {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrls(imgs.map(i => i.storage_path), 3600);
      imgs.forEach(i => { const u = data?.find(d => d.path === i.storage_path)?.signedUrl; if (u) i.url = u; });
    }
    setFiles([]); setMsg(''); setPreview(null);
    setDraft({ id: r.id, content_type: r.content_type, slug: r.slug, status: r.status, publish_date: r.publish_date, primary_language: (r.primary_language as Lang) || 'ur', title: r.title ?? {}, body: r.body ?? {}, category: r.category ?? {}, excerpt: r.excerpt ?? {}, seo_title: r.seo_title ?? {}, seo_description: r.seo_description ?? {}, author: r.author ?? '', cover_image_id: r.cover_image_id, images: imgs });
  }

  async function save(status: Status) {
    if (!draft) return;
    const err = validatePost(draft);
    if (err) return setMsg(err);
    const d = { ...draft, status, slug: slugify(draft.slug) };
    setBusy(true); setMsg('');
    try {
      const fields = { content_type: type, slug: d.slug, status: d.status, publish_date: d.publish_date, primary_language: d.primary_language, title: d.title, body: d.body, category: d.category, excerpt: d.excerpt, seo_title: d.seo_title, seo_description: d.seo_description, author: d.author.trim() || null };
      const res = d.id
        ? await supabase.from('announcements').update(fields).eq('id', d.id).select('id').single()
        : await supabase.from('announcements').insert(fields).select('id').single();
      if (res.error) throw res.error.code === '23505' ? new Error('this web address is already used') : res.error;
      const id = res.data.id;
      let cover = d.cover_image_id;
      let order = d.images.length;
      for (const f of files) {
        const { blob, width, height } = await shrink(f);
        const path = `${id}/${crypto.randomUUID()}.webp`;
        const up = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/webp' });
        if (up.error) throw up.error;
        const ins = await supabase.from('announcement_images').insert({ announcement_id: id, storage_path: path, width, height, sort_order: order++ }).select('id').single();
        if (ins.error) throw ins.error;
        cover ??= ins.data.id;
      }
      if (cover !== d.cover_image_id || !d.id) await supabase.from('announcements').update({ cover_image_id: cover }).eq('id', id);
      setFiles([]);
      await logActivity(d.id ? status : 'create', noun, id, `${STATUS_LABEL[status]}: ${d.title[d.primary_language] ?? d.slug}`);
      await refresh();
      const fresh = (await supabase.from('announcements').select(SELECT).eq('id', id).single()).data as unknown as Row;
      await edit(fresh);
      setMsg(status === 'published' ? 'Saved and published on the website.' : status === 'archived' ? 'Archived (hidden from the website).' : 'Saved as draft (not visible on the website).');
    } catch (e) {
      setMsg('Could not save: ' + (e instanceof Error ? e.message : 'unknown error'));
    } finally { setBusy(false); }
  }

  async function removeImage(img: Img) {
    if (!draft?.id || !confirm('Remove this photo?')) return;
    if (draft.cover_image_id === img.id) await supabase.from('announcements').update({ cover_image_id: null }).eq('id', draft.id);
    await supabase.from('announcement_images').delete().eq('id', img.id);
    await supabase.storage.from(BUCKET).remove([img.storage_path]);
    setDraft({ ...draft, cover_image_id: draft.cover_image_id === img.id ? null : draft.cover_image_id, images: draft.images.filter(i => i.id !== img.id) });
    refresh();
  }

  async function setCover(img: Img) {
    if (!draft?.id) return;
    await supabase.from('announcements').update({ cover_image_id: img.id }).eq('id', draft.id);
    setDraft({ ...draft, cover_image_id: img.id });
    refresh();
  }

  async function remove() {
    if (!draft?.id || !confirm(`Delete this ${noun} permanently? This cannot be undone. Tip: use "Archive" to hide it instead.`)) return;
    await supabase.from('announcements').update({ cover_image_id: null }).eq('id', draft.id);
    const paths = draft.images.map(i => i.storage_path);
    await supabase.from('announcement_images').delete().eq('announcement_id', draft.id);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    await supabase.from('announcements').delete().eq('id', draft.id);
    await logActivity('delete', noun, draft.id, `Deleted: ${draft.title[draft.primary_language] ?? draft.slug}`);
    setDraft(null);
    refresh();
  }

  const set = (patch: Partial<Draft>) => draft && setDraft({ ...draft, ...patch });
  type TextField = 'title' | 'body' | 'category' | 'excerpt' | 'seo_title' | 'seo_description';
  const setText = (field: TextField, lang: Lang, v: string) => draft && setDraft({ ...draft, [field]: { ...draft[field], [lang]: v } });

  if (!draft) return (
    <div>
      <div className="admin-row" style={{ marginBottom: '1rem' }}>
        <Button onClick={() => { setDraft(empty(type)); setFiles([]); setMsg(''); setPreview(null); }}>New {noun}</Button>
        <Input placeholder="Search by title or web address" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="admin-select" value={filter} onChange={e => setFilter(e.target.value as typeof filter)} aria-label="Filter by status">
          <option value="all">All</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
        </select>
      </div>
      <ul className="admin-list">
        {visible.map(r => (
          <li key={r.id}>
            <button type="button" onClick={() => edit(r)}>
              <span className={r.status === 'published' ? 'admin-badge live' : 'admin-badge'}>{STATUS_LABEL[r.status]}</span>
              <strong dir="auto">{r.title?.[(r.primary_language as Lang) || 'ur'] || r.slug}</strong>
              <span>{r.publish_date}</span>
            </button>
          </li>
        ))}
        {visible.length === 0 && <li className="admin-empty">No {noun}s here yet.</li>}
      </ul>
      {type === 'announcement' && (
        <div className="admin-card" style={{ marginTop: '1.5rem' }}>
          <h2>Built-in articles (read-only)</h2>
          <p>These are part of the website code and always stay published. They cannot be edited here, and their web addresses are reserved.</p>
          <ul className="admin-list">{builtIn.map(a => <li key={a.slug} className="admin-item"><span className="admin-badge live">{a.status}</span><strong dir="auto">{a.title}</strong><span>{a.date}</span></li>)}</ul>
        </div>
      )}
    </div>
  );

  const pl = preview;
  return (
    <div className="admin-form">
      <div className="admin-row">
        <Button variant="ghost" onClick={() => setDraft(null)}>← Back to list</Button>
        <span className={draft.status === 'published' ? 'admin-badge live' : 'admin-badge'}>{draft.id ? STATUS_LABEL[draft.status] : 'New'}</span>
      </div>
      <div className="admin-grid">
        <label>Web address<Input value={draft.slug} onChange={e => set({ slug: e.target.value })} placeholder="eid-gathering-2026" /></label>
        <label>Date<Input type="date" value={draft.publish_date} onChange={e => set({ publish_date: e.target.value })} /></label>
        <label>Main language
          <select value={draft.primary_language} onChange={e => set({ primary_language: e.target.value as Lang })}>
            {LANGS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
          </select>
        </label>
        <label>Author (optional)<Input value={draft.author} onChange={e => set({ author: e.target.value })} dir="auto" /></label>
      </div>
      {draft.slug && <p className="admin-empty">Will appear at /announcements/{slugify(draft.slug)}</p>}
      {LANGS.map(l => (
        <fieldset key={l.key} className="admin-lang">
          <legend>{l.label}{l.key === draft.primary_language ? ' (main)' : ' (optional)'}</legend>
          <label>Title<Input dir={l.dir} value={draft.title[l.key] ?? ''} onChange={e => setText('title', l.key, e.target.value)} /></label>
          <label>Category (optional)<Input dir={l.dir} value={draft.category[l.key] ?? ''} onChange={e => setText('category', l.key, e.target.value)} /></label>
          <label>Short summary (optional)<Textarea dir={l.dir} rows={2} value={draft.excerpt[l.key] ?? ''} onChange={e => setText('excerpt', l.key, e.target.value)} /></label>
          <label>Text — leave an empty line between paragraphs; start a line with "## " for a heading
            <Textarea dir={l.dir} rows={8} value={draft.body[l.key] ?? ''} onChange={e => setText('body', l.key, e.target.value)} />
          </label>
          <details>
            <summary>Search engine & sharing (optional)</summary>
            <label>Search title<Input dir={l.dir} value={draft.seo_title[l.key] ?? ''} onChange={e => setText('seo_title', l.key, e.target.value)} /></label>
            <label>Search description<Textarea dir={l.dir} rows={2} value={draft.seo_description[l.key] ?? ''} onChange={e => setText('seo_description', l.key, e.target.value)} /></label>
          </details>
          <Button type="button" variant="outline" size="sm" onClick={() => setPreview(pl === l.key ? null : l.key)}>{pl === l.key ? 'Hide preview' : `Preview ${l.label}`}</Button>
          {pl === l.key && (
            <article className="admin-preview" dir={l.dir} lang={l.key}>
              {draft.category[l.key] && <small>{draft.category[l.key]}</small>}
              <h2>{draft.title[l.key] || '(no title)'}</h2>
              {draft.author && <p><em>{draft.author}</em></p>}
              {parseBody(draft.body[l.key] ?? '').map((b, i) => typeof b === 'string' ? <p key={i}>{b}</p> : 'heading' in b ? <h3 key={i}>{b.heading}</h3> : null)}
            </article>
          )}
        </fieldset>
      ))}
      <fieldset className="admin-lang">
        <legend>Photos</legend>
        <p className="admin-empty">The cover photo is also used when the post is shared on social media.</p>
        <div className="admin-photos">
          {draft.images.map(img => (
            <figure key={img.id}>
              {img.url && <img src={img.url} alt="" />}
              <figcaption>
                {draft.cover_image_id === img.id ? <strong>Cover</strong> : <button type="button" onClick={() => setCover(img)}>Make cover</button>}
                <button type="button" onClick={() => removeImage(img)}>Remove</button>
              </figcaption>
            </figure>
          ))}
        </div>
        <label>Add photos (resized automatically; the first becomes the cover if none is set)
          <input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files ?? []))} />
        </label>
        {files.length > 0 && <p>{files.length} photo(s) will upload when you save.</p>}
      </fieldset>
      <div className="admin-row">
        <Button disabled={busy} onClick={() => save('published')}>{busy ? 'Saving…' : draft.status === 'published' ? 'Save (stays published)' : 'Save & publish'}</Button>
        <Button disabled={busy} variant="outline" onClick={() => save('draft')}>{draft.status === 'published' ? 'Unpublish (draft)' : 'Save as draft'}</Button>
        {draft.id && draft.status !== 'archived' && <Button disabled={busy} variant="outline" onClick={() => save('archived')}>Archive</Button>}
        {draft.id && <Button disabled={busy} variant="destructive" onClick={remove}>Delete</Button>}
      </div>
      {msg && <p role="status" className="admin-msg">{msg}</p>}
    </div>
  );
}
