import poster from '@/assets/cleanup-poster.webp.asset.json';

type Localized = { en: string; ja: string; ur: string };
export type SiteEvent = {
  slug: string;
  status: 'draft' | 'published';
  /** Start and end in Japan Standard Time (ISO with +09:00). */
  start: string;
  end: string;
  reception: string;
  title: Localized;
  summary: Localized;
  location: Localized;
  parking: string;
  weather: Localized;
  /** Primary full description, Urdu. Strings are paragraphs, `list` items are bullets. */
  body: (string | { heading: string } | { list: string[] })[];
  poster: { url: string; alt: string; width: number; height: number };
};

export const events: SiteEvent[] = [
  {
    slug: 'east-port-clean-up-campaign-2026',
    status: 'published',
    start: '2026-10-17T09:30:00+09:00',
    end: '2026-10-17T11:00:00+09:00',
    reception: '2026-10-17T09:00:00+09:00',
    title: {
      ur: 'نیگاتا ایسٹ پورٹ کے علاقے میں صفائی کی مہم',
      en: 'East Port Clean-Up Campaign (Niigata)',
      ja: '新潟東港地区 清掃活動',
    },
    summary: {
      en: 'Join a community clean-up at Prefectural Shimami Green Space (Wanpaku Hiroba). Reception opens at 9:00 AM; the clean-up runs 9:30–11:00 AM.',
      ja: '県立島見緑地（わんぱく広場）での地域清掃活動です。受付は午前9時から、清掃は午前9時30分〜11時です。',
      ur: 'پریفیکچرل شیما می گرین اسپیس (وانپاکو ہیروبا) میں کمیونٹی صفائی مہم۔ ریسپشن صبح 9:00 بجے، صفائی صبح 9:30 سے 11:00 بجے تک۔',
    },
    location: {
      en: 'Prefectural Shimami Green Space — Wanpaku Hiroba (playground), Niigata City',
      ja: '県立島見緑地 わんぱく広場（新潟市）',
      ur: 'پریفیکچرل شیما می گرین اسپیس، وانپاکو ہیروبا (کھیل کا میدان)، نیگاتا سٹی',
    },
    parking: '3462-70 Shimami-cho, Kita-ku, Niigata City',
    weather: {
      en: 'Held even in rain; cancelled only if a severe weather warning is issued.',
      ja: '雨天決行。暴風警報などの警報発令時は中止します。',
      ur: 'بارش کے باوجود تقریب ہوگی۔ شدید موسم کی وارننگ پر منسوخ کی جائے گی۔',
    },
    body: [
      'آئیے مل کر اپنے علاقے کو ایک شاندار جگہ بنائیں! ایک محفوظ اور پرامن کمیونٹی کی جانب — جہاں نہ کوڑا کرکٹ ہو اور نہ ہی جرائم!',
      { heading: 'تاریخ اور وقت' },
      { list: ['ہفتہ، 17 اکتوبر 2026', 'ریسپشن کا آغاز: صبح 9:00 بجے', 'صفائی مہم: صبح 9:30 بجے سے 11:00 بجے تک', 'بارش کے باوجود تقریب ہوگی۔ شدید موسم کی وارننگ پر منسوخ کی جائے گی۔'] },
      { heading: 'مقام اور پتہ' },
      { list: ['مقام: پریفیکچرل شیما می گرین اسپیس (Prefectural Shimami Green Space)، وانپاکو ہیروبا (کھیل کا میدان)', 'پارکنگ لاٹ کا پتہ: 3462-70 Shimami-cho, Kita-ku, Niigata City'] },
      { heading: 'پروگرام کا شیڈول' },
      { list: ['صبح 9:00 بجے: ریسپشن کا آغاز', 'صبح 9:30 بجے: افتتاحی تقریب اور منتظمین کے خیالات', 'صبح 9:55 بجے: صفائی مہم کا آغاز، شرکاء کو تین راستوں میں تقسیم کیا جائے گا', 'صبح 11:00 بجے: اختتام اور آگاہی فراہم کرنے والی اشیاء کی تقسیم'] },
      { heading: 'ضروری ہدایات' },
      { list: ['ریسپشن ڈیسک سے کوڑے کے تھیلے، کوڑا اٹھانے والے آلات (ٹونگز) اور کام کے دستانے حاصل کریں۔', 'صفائی کے دوران گاڑیوں کی آمدورفت جاری رہے گی، لہٰذا احتیاط برتیں۔', 'کوڑے کو جلنے والے اور نہ جلنے والے زمروں میں الگ کرکے مخصوص جمع کرنے کے مقامات تک پہنچائیں۔', 'اپنی استطاعت سے زیادہ مشقت نہ کریں اور حادثات سے بچنے کے لیے احتیاط سے کام کریں۔'] },
      { heading: 'منتظمین، تعاون اور سیکرٹریٹ' },
      'منتظمین:',
      { list: ['نیگاتا سٹی ہیگاشی کو سیفٹی نیٹ ورک', 'نیگاتا سٹی', 'نیگاتا کیٹا پولیس اسٹیشن'] },
      'سیکرٹریٹ: نیگاتا سٹی کیٹا وارڈ آفس، شعبہ رہائشی امور، سیکشن برائے ماحولیاتِ رہائش',
      'ٹیلی فون: 025-387-1295',
      'تعاون:',
      { list: ['نیگاتا اسلامک سینٹر', 'مقامی جامعات', 'کمیونٹی کونسلز', 'غیر ملکی رہائشی', 'مقامی کاروبار'] },
      { heading: 'نیگاتا اسلامک سینٹر کی طرف سے خصوصی اعلان' },
      'نیگاتا اسلامک سینٹر کے پاکستانی، بنگلہ دیشی، افغانی، انڈونیشین اور ملیشین بھائی ہمیشہ کی طرح اس بار بھی اس تقریب میں بھرپور شرکت کریں گے، ان شاء اللہ۔ پروگرام کے اختتام پر تمام شرکاء کے لیے اسلامک سینٹر میں پرتکلف لنچ کا انتظام کیا جا رہا ہے۔',
      'رابطے اور معلومات کے لیے:',
      { list: ['جناب کوجیما مجاہد', 'اشفاق بھائی', 'ملک اللہ یار خان'] },
    ],
    poster: { url: poster.url, alt: 'نیگاتا ایسٹ پورٹ صفائی مہم کا پوسٹر — East Port Clean-Up Campaign (Niigata), 17 October 2026', width: 1024, height: 1536 },
  },
];

/** Published events that have not yet ended, soonest first. */
export function upcomingEvents(now: Date = new Date()) {
  return events.filter(e => e.status === 'published' && new Date(e.end) > now).sort((a, b) => a.start.localeCompare(b.start));
}
export const findEvent = (slug: string) => events.find(e => e.slug === slug && e.status === 'published');

export function formatTime(iso: string, language: 'en' | 'ja' | 'ur') {
  const locale = language === 'ja' ? 'ja-JP' : language === 'ur' ? 'ur-PK' : 'en-US';
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Tokyo' }).format(new Date(iso));
}
export function formatEventDate(iso: string, language: 'en' | 'ja' | 'ur') {
  const locale = language === 'ja' ? 'ja-JP' : language === 'ur' ? 'ur-PK' : 'en-GB';
  const d = new Date(iso);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'Asia/Tokyo' }).format(d);
  const date = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Tokyo' }).format(d);
  return language === 'ja' ? `${date}（${weekday}）` : language === 'ur' ? `${weekday}، ${date}` : `${weekday}, ${date}`;
}
