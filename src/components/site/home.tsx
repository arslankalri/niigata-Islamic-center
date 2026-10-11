import { ArrowDown } from 'lucide-react';
import { useLanguage } from './language';
import { ActionLink, TextLink, PrayerPreview, NewsSection, AboutSection, VisitSection, FacebookSection } from './sections';
import night from '@/assets/mosque-night.webp.asset.json';
export function HomePage() {
 const {t}=useLanguage();
 return <><section className="home-hero"><img className="hero-image" src={night.url} alt={t.photoNight} fetchPriority="high" width="960" height="720"/><div className="hero-shade"/><div className="hero-content content-width"><p className="hero-eyebrow"><span/>{t.eyebrow}<span/></p><h1 dir="ltr">Islamic Center<br/><span>Niigata</span></h1><div className="hero-rule"><span/>◇<span/></div><h2>{t.welcome}</h2><p className="hero-description">{t.welcomeBody}</p><div className="hero-actions"><ActionLink to="/prayer-times">{t.nav[1]}</ActionLink><ActionLink to="/visit" secondary>{t.nav[5]}</ActionLink></div><TextLink to="/about">{t.aboutLink}</TextLink></div><div className="hero-bottom"><span className="hero-location">{t.location}</span><ArrowDown size={19}/><span className="hero-coordinate" aria-hidden="true">◇</span></div></section><PrayerPreview/><NewsSection/><AboutSection/><VisitSection/><FacebookSection/></>;
}
