import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { paths } from '@/lib/translations';
import { PhoneLink } from './sections';
import { LanguageSelector, useLanguage } from './language';
import { HijriDateStrip } from './hijri-date-strip';

export function SiteShell({ children }: { children: ReactNode }) {
 const { t, language } = useLanguage();

 return <div className="site-shell" data-language={language} dir={language === 'ur' ? 'rtl' : 'ltr'}>
  <a className="skip-link" href="#main">{t.skip}</a>
  <HijriDateStrip />
  <header className="site-header">
   <div className="header-inner">
    <Link to="/" className="wordmark" aria-label="Islamic Center Niigata"><span>Islamic Center</span><span>Niigata<span className="wordmark-rule" /></span></Link>
    <nav className="desktop-nav" aria-label={t.explore}>{paths.map((path,i) => <Link key={path} to={path} activeOptions={{exact:true}} activeProps={{className:'nav-active'}}>{t.nav[i]}</Link>)}</nav>
    <div className="desktop-language"><LanguageSelector /></div>
   </div>
   </header>
  <main id="main">{children}</main>
  <footer className="site-footer"><div className="content-width footer-grid"><div><Link to="/" className="wordmark footer-wordmark"><span>Islamic Center</span><span>Niigata<span className="wordmark-rule" /></span></Link><p className="preserve-lines">{t.footerBody}</p><p className="footer-phone">{t.phoneLabel}: <PhoneLink/></p></div><div><h3>{t.explore}</h3>{paths.slice(0,4).map((path,i) => <Link key={path} to={path}>{t.nav[i]}</Link>)}</div><div><h3>{t.connect}</h3>{paths.slice(4).map((path,i) => <Link key={path} to={path}>{t.nav[i+4]}{i===2 && <ArrowUpRight size={14}/>}</Link>)}</div><div><h3>{t.languages}</h3><LanguageSelector /></div></div><div className="content-width footer-bottom"><span>© {new Date().getFullYear()} {t.copyright}</span><span className="footer-location">{t.location}</span></div></footer>
 </div>;
}
