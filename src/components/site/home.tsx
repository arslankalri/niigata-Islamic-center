import { ArrowDown } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useLanguage } from './language';
import { TextLink, PrayerPreview, NewsSection, AboutSection, VisitSection, FacebookSection } from './sections';
import { CompactEventHighlight } from './events';
import { upcomingEvents } from '@/lib/events';
import night from '@/assets/mosque-night.webp.asset.json';
export function HomePage() {
 const {t}=useLanguage();
 const featured=upcomingEvents()[0];
  return <div className="home-page" style={{ "--home-mosque-background": `url("${night.url}")` } as CSSProperties}>{featured&&<CompactEventHighlight e={featured}/>}<section className="home-hero"><img className="hero-image" src={night.url} alt={t.photoNight} fetchPriority="high" width="960" height="720"/><div className="hero-shade"/><div className="hero-content content-width"><p className="hero-eyebrow"><span/>{t.eyebrow}<span/></p><h1 dir="ltr">Islamic Center<br/><span>Niigata</span></h1><div className="hero-rule"><span/>◇<span/></div><h2>{t.welcome}</h2><p className="hero-description">{t.welcomeBody}</p><TextLink to="/about">{t.aboutLink}</TextLink></div><div className="hero-bottom"><span className="hero-location">{t.location}</span><ArrowDown size={19}/><span className="hero-coordinate" aria-hidden="true">◇</span></div></section><NewsSection kind="announcements"/><PrayerPreview/><AboutSection/><VisitSection/><FacebookSection/></div>;
}
