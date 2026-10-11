import { Link } from '@tanstack/react-router';
import { ArrowRight, Bell, CalendarDays, Clock3, MapPin, Users, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from './language';
import { facebookUrl, type PagePath } from '@/lib/translations';
import day from '@/assets/mosque-day.webp.asset.json';
import entrance from '@/assets/mosque-entrance.webp.asset.json';
import type { ReactNode } from 'react';
export function ActionLink({to,children,secondary=false}: {to:PagePath;children:ReactNode;secondary?:boolean}) { return <Button asChild size="lg" className={secondary?'site-action secondary-action':'site-action'}><Link to={to}>{children}<ArrowRight /></Link></Button>; }
export function TextLink({to,children}: {to:PagePath;children:ReactNode}) { return <Link to={to} className="text-link">{children}<ArrowRight size={17}/></Link>; }
export function Eyebrow({children}: {children:ReactNode}) { return <p className="eyebrow"><span/>{children}</p>; }
export function Pending({children}: {children:ReactNode}) { return <span className="pending-label"><span/>{children}</span>; }
export function PrayerPreview({full=false}: {full?:boolean}) {
 const { t } = useLanguage();
 return <section className={full?'prayer-section full-prayer':'prayer-section'}><div className="content-width"><div className="section-heading prayer-heading"><div><div className="heading-icon"><Clock3 size={19}/><h2>{t.prayer}</h2></div><p>{t.prayerBody}</p></div><Pending>{t.pending}</Pending></div>
 {full ? <div className="prayer-table-wrap"><table className="prayer-table"><thead><tr><th>{t.prayer}</th><th>{t.adhan}</th><th>{t.iqamah}</th></tr></thead><tbody>{t.prayers.map(p=><tr key={p}><th scope="row">{p}</th><td aria-label={t.notAvailable}>—</td><td aria-label={t.notAvailable}>—</td></tr>)}</tbody></table></div> : <div className="prayer-grid">{t.prayers.map((p,i)=><div key={p} className="prayer-item"><span className="prayer-symbol">{i===0?'◔':i===1?'☀':i===2?'◑':i===3?'◒':i===4?'☾':'◇'}</span><h3>{p}</h3><span className="prayer-time" aria-label={t.notAvailable}>— : —</span></div>)}</div>}
 <div className="schedule-note"><Info size={16}/><p>{t.scheduleNotice}</p>{!full && <TextLink to="/prayer-times">{t.nav[1]}</TextLink>}</div>
 {full && <div className="schedule-source"><div className="qr-placeholder"><Clock3 size={30}/></div><div><h3>{t.source}</h3><p>{t.sourceBody}</p></div></div>}
 </div></section>;
}
export function NewsSection({kind='both'}: {kind?:'both'|'announcements'|'events'}) {
 const {t}=useLanguage();
 const render=(event:boolean)=><div className="news-column"><div className="section-heading"><h2>{event?t.events:t.announcements}</h2><TextLink to={event?'/events':'/announcements'}>{event?t.allEvents:t.allAnnouncements}</TextLink></div><article className="news-item news-empty"><div className="news-icon">{event?<CalendarDays size={25}/>:<Bell size={25}/>}</div><div><h3>{event?t.noEvents:t.noAnnouncements}</h3><p>{event?t.eventBody:t.announcementBody}</p></div></article></div>;
 return <section className="content-width section-space news-section">{kind==='both'&&<Eyebrow>{t.latest}</Eyebrow>}<div className={kind==='both'?'news-grid':'news-single'}>{kind!=='events'&&render(false)}{kind!=='announcements'&&render(true)}</div></section>;
}
export function AboutSection({full=false}: {full?:boolean}) {
 const {t}=useLanguage();
 return <section className="about-section"><div className="content-width about-grid"><div className="arch-photo"><img src={day.url} alt={t.photoDay} loading="lazy" width="960" height="960"/><span className="arch-border"/></div><div className="about-copy"><Eyebrow>{t.aboutEyebrow}</Eyebrow><h2 className="display-heading preserve-lines">{t.aboutTitle}</h2><p>{t.aboutBody}</p><div className="ornament-divider"><span/>◇<span/></div>{!full?<ActionLink to="/about">{t.more}</ActionLink>:<div className="about-details"><h3>{t.history}</h3><p>{t.historyBody}</p><h3>{t.leadership}</h3><p>{t.leadershipBody}</p></div>}</div></div></section>;
}
export function VisitSection({full=false}: {full?:boolean}) {
 const {t}=useLanguage();
 return <section className="visit-section"><div className="content-width visit-grid"><div><Eyebrow>{t.visitEyebrow}</Eyebrow><h2 className="display-heading">{t.visitTitle}</h2><p>{t.visitBody}</p>{!full&&<ActionLink to="/visit">{t.planVisit}</ActionLink>}{full&&<div className="visit-details">{[[t.address,t.addressBody],[t.transport,t.transportBody],[t.guidance,t.guidanceBody]].map(([title,body])=><div key={title}><h3>{title}</h3><p>{body}</p></div>)}</div>}</div><div className="location-panel"><MapPin size={30}/><h3>{t.map}</h3><p>{t.mapBody}</p><Pending>{t.confirmedPending}</Pending></div></div></section>;
}
export function FacebookSection({full=false}: {full?:boolean}) {
 const {t}=useLanguage();
 const visit=<Button asChild size="lg" className="site-action secondary-action"><a href={facebookUrl} target="_blank" rel="noopener noreferrer">{t.facebookVisit}<ExternalLink size={16}/></a></Button>;
 return <section className={full?'facebook-section facebook-full':'facebook-section'}><div className="content-width facebook-grid"><span className="facebook-mark" aria-hidden="true">f</span><div><Eyebrow>{t.facebookEyebrow}</Eyebrow><h2>{t.facebookTitle}</h2><p>{t.facebookBody}</p>{full&&<div className="facebook-cta">{visit}</div>}{full&&<div className="facebook-source"><h3>{t.facebookSource}</h3><p>{t.facebookSourceBody}</p></div>}</div>{!full&&<div className="facebook-actions"><ActionLink to="/facebook" secondary>{t.nav[6]}</ActionLink>{visit}</div>}</div></section>;
}
export function PageIntro({index}: {index:number}) {
 const {t}=useLanguage();
 const descriptions=[t.welcomeBody,t.scheduleNotice,t.aboutBody,t.announcementBody,t.eventBody,t.visitBody,t.facebookBody];
 return <section className="page-intro"><div className="content-width"><Eyebrow>Islamic Center Niigata</Eyebrow><h1>{t.nav[index]}</h1><p>{descriptions[index]}</p><span className="intro-ornament" aria-hidden="true">✧</span></div></section>;
}
export function EntrancePhoto() { const {t}=useLanguage();return <div className="entrance-strip content-width"><img src={entrance.url} alt={t.photoEntrance} loading="lazy" width="900" height="1600"/></div>; }
