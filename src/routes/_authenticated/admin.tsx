import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BUCKET, type Lang } from '@/lib/announcements-db';

export const Route = createFileRoute('/_authenticated/admin')({
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
type Row = { id: string; slug: string; status: string; publish_date: string; primary_language: string; title: Texts; body: Texts; category: Texts; author: string | null; cover_image_id: string | null; announcement_images: Img[] };
type Draft = { id?: string; slug: string; status: 'draft' | 'published'; publish_date: string; primary_language: Lang; title: Texts; body: Texts; category: Texts; author: string; cover_image_id: string | null; images: Img[] };

const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const empty = (): Draft => ({ slug: '', status: 'draft', publish_date: today(), primary_language: 'ur', title: {}, body: {}, category: {}, author: '', cover_image_id: null, images: [] });

async function shrink(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise<Blob>((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('image')), 'image/webp', 0.82));
  return { blob, width: w, height: h };
}

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const role = useQuery({ queryKey: ['is-admin'], queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', u.user!.id).eq('role', 'admin');
    return { admin: (data?.length ?? 0) > 0, email: u.user?.email ?? '' };
  } });
  const list = useQuery({ enabled: !!role.data?.admin, queryKey: ['admin-announcements'], queryFn: async () => {
    const { data, error } = await supabase.from('announcements').select('*, announcement_images!announcement_images_announcement_id_fkey(id, storage_path, sort_order)').order('publish_date', { ascending: false });
    if (error) throw error;
    return data as unknown as Row[];
  } });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: '/admin/login', replace: true });
  }

  async function edit(r: Row) {
    const imgs = [...r.announcement_images].sort((a, b) => a.sort_order - b.sort_order);
    if (imgs.length) {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrls(imgs.map(i => i.storage_path), 3600);
      imgs.forEach(i => { i.url = data?.find(d => d.path === i.storage_path)?.signedUrl ?? undefined; });
    }
    setFiles([]); setMsg('');
    setDraft({ id: r.id, slug: r.slug, status: r.status as Draft['status'], publish_date: r.publish_date, primary_language: (r.primary_language as Lang) || 'ur', title: r.title ?? {}, body: r.body ?? {}, category: r.category ?? {}, author: r.author ?? '', cover_image_id: r.cover_image_id, images: imgs });
  }

  async function save(status?: Draft['status']) {
    if (!draft) return;
    const d = { ...draft, status: status ?? draft.status };
    const slug = d.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) return setMsg('Please add a web address (for example: eid-gathering-2026).');
    if (!d.title[d.primary_language]?.trim()) return setMsg('Please add a title in the main language.');
    setBusy(true); setMsg('');
    try {
      const fields = { slug, status: d.status, publish_date: d.publish_date, primary_language: d.primary_language, title: d.title, body: d.body, category: d.category, author: d.author.trim() || null };
      const res = d.id
        ? await supabase.from('announcements').update(fields).eq('id', d.id).select('id').single()
        : await supabase.from('announcements').insert(fields).select('id').single();
      if (res.error) throw res.error;
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
      await qc.invalidateQueries({ queryKey: ['admin-announcements'] });
      await qc.invalidateQueries({ queryKey: ['public-announcements'] });
      const fresh = (await supabase.from('announcements').select('*, announcement_images!announcement_images_announcement_id_fkey(id, storage_path, sort_order)').eq('id', id).single()).data as unknown as Row;
      await edit(fresh);
      setMsg(d.status === 'published' ? 'Saved and published on the website.' : 'Saved as draft (not visible on the website).');
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
    qc.invalidateQueries({ queryKey: ['public-announcements'] });
  }

  async function setCover(img: Img) {
    if (!draft?.id) return;
    await supabase.from('announcements').update({ cover_image_id: img.id }).eq('id', draft.id);
    setDraft({ ...draft, cover_image_id: img.id });
    qc.invalidateQueries({ queryKey: ['public-announcements'] });
  }

  async function remove() {
    if (!draft?.id || !confirm('Delete this announcement permanently?')) return;
    await supabase.from('announcements').update({ cover_image_id: null }).eq('id', draft.id);
    const paths = draft.images.map(i => i.storage_path);
    await supabase.from('announcement_images').delete().eq('announcement_id', draft.id);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    await supabase.from('announcements').delete().eq('id', draft.id);
    setDraft(null);
    qc.invalidateQueries({ queryKey: ['admin-announcements'] });
    qc.invalidateQueries({ queryKey: ['public-announcements'] });
  }

  if (role.isLoading) return <section className="content-width section-space"><p>Loading…</p></section>;
  if (!role.data?.admin) return (
    <section className="content-width section-space" style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: '1.8rem' }}>Not authorised</h1>
      <p>{role.data?.email} does not have admin access.</p>
      <Button onClick={signOut} style={{ marginTop: '1rem' }}>Sign out</Button>
    </section>
  );

  const set = (patch: Partial<Draft>) => draft && setDraft({ ...draft, ...patch });
  const setText = (field: 'title' | 'body' | 'category', lang: Lang, v: string) => draft && setDraft({ ...draft, [field]: { ...draft[field], [lang]: v } });

  return (
    <section className="content-width section-space admin-dash">
      <div className="admin-top">
        <div><h1>Announcements</h1><p>{role.data.email}</p></div>
        <div className="admin-row">
          <Button onClick={() => { setDraft(empty()); setFiles([]); setMsg(''); }}>New announcement</Button>
          <Button variant="outline" onClick={signOut}>Sign out</Button>
        </div>
      </div>

      {!draft && (
        <ul className="admin-list">
          {(list.data ?? []).map(r => (
            <li key={r.id}>
              <button type="button" onClick={() => edit(r)}>
                <span className={r.status === 'published' ? 'admin-badge live' : 'admin-badge'}>{r.status === 'published' ? 'Published' : 'Draft'}</span>
                <strong dir="auto">{r.title?.[(r.primary_language as Lang) || 'ur'] || r.slug}</strong>
                <span>{r.publish_date}</span>
              </button>
            </li>
          ))}
          {list.data?.length === 0 && <li className="admin-empty">No announcements yet. The two articles already on the site are built in and stay as they are.</li>}
        </ul>
      )}

      {draft && (
        <div className="admin-form">
          <Button variant="ghost" onClick={() => setDraft(null)}>← Back to list</Button>
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
          {LANGS.map(l => (
            <fieldset key={l.key} className="admin-lang">
              <legend>{l.label}{l.key === draft.primary_language ? ' (main)' : ' (optional)'}</legend>
              <label>Title<Input dir={l.dir} value={draft.title[l.key] ?? ''} onChange={e => setText('title', l.key, e.target.value)} /></label>
              <label>Category (optional)<Input dir={l.dir} value={draft.category[l.key] ?? ''} onChange={e => setText('category', l.key, e.target.value)} /></label>
              <label>Text — leave an empty line between paragraphs; start a line with "## " for a heading
                <Textarea dir={l.dir} rows={8} value={draft.body[l.key] ?? ''} onChange={e => setText('body', l.key, e.target.value)} />
              </label>
            </fieldset>
          ))}
          <fieldset className="admin-lang">
            <legend>Photos</legend>
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
            <Button disabled={busy} onClick={() => save('published')}>{busy ? 'Saving…' : 'Save & publish'}</Button>
            <Button disabled={busy} variant="outline" onClick={() => save('draft')}>Save as draft</Button>
            {draft.id && <Button disabled={busy} variant="destructive" onClick={remove}>Delete</Button>}
          </div>
          {msg && <p role="status" className="admin-msg">{msg}</p>}
        </div>
      )}
    </section>
  );
}
