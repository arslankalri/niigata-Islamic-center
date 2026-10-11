import cover from '@/assets/visit-cover.webp.asset.json';
import lunch from '@/assets/visit-lunch.webp.asset.json';
import banner from '@/assets/visit-banner.webp.asset.json';

export type Announcement = {
  slug: string;
  /** Language the article is written in; it is never shown as a translation. */
  language: 'ur';
  date: string; // ISO date of the event
  title: string;
  body: string[];
  cover: { url: string; alt: string; width: number; height: number };
  gallery: { url: string; alt: string; width: number; height: number }[];
};

export const announcements: Announcement[] = [
  {
    slug: 'japanese-volunteer-teachers-visit',
    language: 'ur',
    date: '2026-10-10',
    title: 'جاپانی رضاکار اساتذہ اور طلبہ کا نیگاتا اسلامک سینٹر کا دورہ — باہمی ہم آہنگی کی خوبصورت مثال',
    body: [
      'نیگاتا تویوساکا کے مقامی جاپانی زبان کے رضاکار اساتذہ اور طلبہ و طالبات نے نیگاتا اسلامک سینٹر کا دورہ کیا۔ اس موقع پر مہمانوں نے نمازِ ظہر میں شرکت کی اور بنیادی اسلامی تعلیمات سے آگاہی حاصل کی۔',
      'تقریب کے دوران جناب حافظ منظور احمد صاحب نے اسلام کی بنیادی تعلیمات کا تعارف پیش کیا۔ پاکستانی کمیونٹی کے سینئر اراکین جناب عارف سائتو، جناب ملک رضوان اور جناب عبدالمتین نے امام صاحب کی گفتگو کا جاپانی زبان میں آسان اور عام فہم انداز میں ترجمہ کیا، تاکہ جاپانی مہمان اسلامی تعلیمات کو بہتر طور پر سمجھ سکیں۔',
      'نیگاتا اسلامک سینٹر کی انتظامیہ اور صدر جناب محمد رضوان کی جانب سے تمام مہمانوں کا پرتپاک استقبال کیا گیا۔ انتظامیہ نے تمام شرکاء کے لیے پرتکلف ظہرانے کا بھی اہتمام کیا، جس سے باہمی گفتگو، میل جول اور دوستانہ تعلقات کو فروغ دینے کا موقع ملا۔',
      'اس موقع پر مقامی کمیونٹی کی جانب سے نیگاتا اسلامک سینٹر کی ان کوششوں کو سراہا گیا جو جاپانی باشندوں، غیر مسلم افراد اور مسلم کمیونٹی کے درمیان بہتر تعلقات، باہمی احترام اور ثقافتی ہم آہنگی کے فروغ کے لیے کی جا رہی ہیں۔',
      'دورے پر آنے والے جاپانی پروفیسر، رضاکار اساتذہ اور طلبہ و طالبات نے سینٹر میں موجود پاکستانی، بنگلہ دیشی اور جاپانی مسلم کمیونٹی کے اراکین کا ان کی مہمان نوازی، تعاون اور گرم جوشی پر شکریہ ادا کیا۔',
      'یہ ملاقات اس بات کی خوبصورت مثال تھی کہ باہمی گفتگو، اسلامی تعلیمات سے آگاہی اور مہمان نوازی کے ذریعے مختلف ثقافتوں اور عقائد سے تعلق رکھنے والے افراد کے درمیان اعتماد، احترام اور دوستی کو مضبوط بنایا جا سکتا ہے۔',
      'نیگاتا اسلامک سینٹر تمام معزز مہمانوں، رضاکار اساتذہ، مترجمین اور کمیونٹی کے اراکین کا تہِ دل سے شکریہ ادا کرتا ہے۔ سینٹر مستقبل میں بھی مقامی جاپانی معاشرے اور مسلم کمیونٹی کے درمیان مثبت تعلقات اور ثقافتی ہم آہنگی کے فروغ کے لیے اپنی کوششیں جاری رکھے گا۔',
    ],
    cover: { url: cover.url, alt: 'نیگاتا اسلامک سینٹر کی عمارت کے سامنے جاپانی مہمانوں اور کمیونٹی اراکین کی گروپ تصویر', width: 1600, height: 1200 },
    gallery: [
      { url: lunch.url, alt: 'مسجد کے ہال میں مہمان اور کمیونٹی اراکین ظہرانے کے لیے اکٹھے بیٹھے ہیں', width: 1200, height: 1600 },
      { url: banner.url, alt: 'جاپانی زبان کی کلاس کا بینر تھامے مہمانوں اور کمیونٹی اراکین کی قریبی گروپ تصویر', width: 1600, height: 1200 },
    ],
  },
];

export function findAnnouncement(slug: string) { return announcements.find(a => a.slug === slug); }

export function formatDate(iso: string, language: 'en' | 'ja' | 'ur') {
  const locale = language === 'ja' ? 'ja-JP' : language === 'ur' ? 'ur-PK' : 'en-GB';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Tokyo' }).format(new Date(iso + 'T12:00:00+09:00'));
}
