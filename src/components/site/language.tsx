import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { dictionaries, isLanguage, type Language } from '@/lib/translations';
const LanguageContext = createContext({ language: 'en' as Language, setLanguage: (_: Language) => {}, t: dictionaries.en });
export function LanguageProvider({ children }: { children: ReactNode }) {
 const [language, setLanguage] = useState<Language>('en');
 useEffect(() => { try { const stored = localStorage.getItem('icn-language'); if (isLanguage(stored)) setLanguage(stored); } catch {} }, []);
 useEffect(() => { document.documentElement.lang = language; document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr'; try { localStorage.setItem('icn-language', language); } catch {} }, [language]);
 return <LanguageContext.Provider value={{ language, setLanguage, t: dictionaries[language] }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { return useContext(LanguageContext); }
export function LanguageSelector() {
 const { language, setLanguage, t } = useLanguage();
 return <label className="language-control"><span className="sr-only">{t.languages}</span><select aria-label={t.languages} value={language} onChange={e => { if (isLanguage(e.target.value)) setLanguage(e.target.value); }}><option value="en">English</option><option value="ja">日本語</option><option value="ur">اردو</option></select></label>;
}
