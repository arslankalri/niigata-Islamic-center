import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paths } from '@/lib/translations';
import { PhoneLink } from './sections';
import { LanguageSelector, useLanguage } from './language';

export function SiteShell({ children }: { children: ReactNode }) {
 const { t, language } = useLanguage();
 const [open, setOpen] = useState(false);
 const pathname = useRouterState({ select: state => state.location.pathname });
 const toggleRef = useRef<HTMLButtonElement>(null);
 useEffect(() => { setOpen(false); }, [pathname]);
 useEffect(() => { if (!open) return; const listener = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); } }; document.addEventListener('keydown', listener); return () => document.removeEventListener('keydown', listener); }, [open]);
 return <div className="site-shell" data-language={language} dir={language === 'ur' ? 'rtl' : 'ltr'}>
  <a className="skip-link" href="#main">{t.skip}</a>
  <header className="site-header">
   <div className="header-inner">
    <Link to="/" className="wordmark" aria-label="Islamic Center Niigata"><span>Islamic Center</span><span>Niigata<span className="wordmark-rule" /></span></Link>
    <nav className="desktop-nav" aria-label={t.explore}>{paths.slice(0,6).map((path,i) => <Link key={path} to={path} activeOptions={{exact:true}} activeProps={{className:'nav-active'}}>{t.nav[i]}</Link>)}</nav>
    <div className="desktop-language"><LanguageSelector /></div>
    <Button ref={toggleRef} className="menu-toggle" variant="ghost" size="icon" aria-label={open ? t.close : t.menu} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
   </div>
   {open && <nav id="mobile-navigation" className="mobile-nav" aria-label={t.explore}>{paths.map((path,i) => <Link key={path} to={path} activeOptions={{exact:true}} activeProps={{className:'nav-active'}} onClick={() => setOpen(false)}>{t.nav[i]}</Link>)}<LanguageSelector /></nav>}
  </header>
  <main id="main">{children}</main>
  <footer className="site-footer"><div className="content-width footer-grid"><div><Link to="/" className="wordmark footer-wordmark"><span>Islamic Center</span><span>Niigata<span className="wordmark-rule" /></span></Link><p className="preserve-lines">{t.footerBody}</p><p className="footer-phone">{t.phoneLabel}: <PhoneLink/></p></div><div><h3>{t.explore}</h3>{paths.slice(0,4).map((path,i) => <Link key={path} to={path}>{t.nav[i]}</Link>)}</div><div><h3>{t.connect}</h3>{paths.slice(4).map((path,i) => <Link key={path} to={path}>{t.nav[i+4]}{i===2 && <ArrowUpRight size={14}/>}</Link>)}</div><div><h3>{t.languages}</h3><LanguageSelector /></div></div><div className="content-width footer-bottom"><span>© {new Date().getFullYear()} {t.copyright}</span><span className="footer-location">{t.location}</span></div></footer>
 </div>;
}
