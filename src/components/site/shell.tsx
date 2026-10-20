import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { paths } from '@/lib/translations';
import logoUrl from '@/assets/Niigata Islamic Center logo.png';
import { PhoneLink } from './sections';
import { LanguageSelector, useLanguage } from './language';
import { HijriDateStrip } from './hijri-date-strip';

export function SiteShell({ children }: { children: ReactNode }) {
 const { t, language } = useLanguage();

 useEffect(() => {
  const main = document.querySelector<HTMLElement>('#main');
  if (!main || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const revealObserver = new IntersectionObserver((entries, observer) => {
   entries.forEach(entry => {
    if (entry.isIntersecting) {
     entry.target.classList.add('is-revealed');
     observer.unobserve(entry.target);
    }
   });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  const revealTargets = [
   '.section-space',
   '.about-section',
   '.visit-section',
   '.facebook-section',
   '.event-highlight',
   '.news-item',
   '.compact-event-strip',
  ].join(',');

  const scanForRevealTargets = () => {
   main.querySelectorAll<HTMLElement>(revealTargets).forEach(element => {
    if (element.classList.contains('scroll-reveal-item')) return;
    element.classList.add('scroll-reveal-item');
    revealObserver.observe(element);
   });
  };

  scanForRevealTargets();
  main.classList.add('scroll-reveal-ready');
  const mutationObserver = new MutationObserver(scanForRevealTargets);
  mutationObserver.observe(main, { childList: true, subtree: true });

  return () => {
   mutationObserver.disconnect();
   revealObserver.disconnect();
   main.classList.remove('scroll-reveal-ready');
   main.querySelectorAll('.scroll-reveal-item').forEach(element => {
    element.classList.remove('scroll-reveal-item', 'is-revealed');
   });
  };
 }, []);

 return <div className="site-shell" data-language={language} dir={language === 'ur' ? 'rtl' : 'ltr'}>
  <a className="skip-link" href="#main">{t.skip}</a>
  <HijriDateStrip />
  <header className="site-header">
   <div className="header-inner">
    <Link to="/" className="wordmark logo-wordmark" aria-label="Islamic Center Niigata"><img src={logoUrl} alt="Islamic Center Niigata logo" /></Link>
    <nav className="desktop-nav" aria-label={t.explore}>{paths.map((path,i) => <Link key={path} to={path} activeOptions={{exact:true}} activeProps={{className:'nav-active'}}>{t.nav[i]}</Link>)}</nav>
    <div className="desktop-language"><LanguageSelector /></div>
   </div>
   </header>
  <main id="main">{children}</main>
  <footer className="site-footer"><div className="content-width footer-grid"><div><Link to="/" className="wordmark footer-wordmark"><span>Islamic Center</span><span>Niigata<span className="wordmark-rule" /></span></Link><p className="preserve-lines">{t.footerBody}</p><p className="footer-phone">{t.phoneLabel}: <PhoneLink/></p></div><div><h3>{t.explore}</h3>{paths.slice(0,4).map((path,i) => <Link key={path} to={path}>{t.nav[i]}</Link>)}</div><div><h3>{t.connect}</h3>{paths.slice(4).map((path,i) => <Link key={path} to={path}>{t.nav[i+4]}{i===2 && <ArrowUpRight size={14}/>}</Link>)}</div><div><h3>{t.languages}</h3><LanguageSelector /></div></div><div className="content-width footer-bottom"><span>© {new Date().getFullYear()} {t.copyright}</span><span className="footer-location">{t.location}</span></div></footer>
 </div>;
}
