import { createFileRoute } from '@tanstack/react-router';
import { PageIntro, PrayerPreview } from '@/components/site/sections';
import { pageHead } from '@/lib/translations';
export const Route = createFileRoute('/prayer-times')({ head:()=>pageHead(1), component:Page });
function Page() { return <><PageIntro index={1}/><PrayerPreview full/></>; }
