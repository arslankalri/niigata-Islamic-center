import { createFileRoute } from '@tanstack/react-router';
import { PageIntro, NewsSection } from '@/components/site/sections';
import { pageHead } from '@/lib/translations';
export const Route = createFileRoute('/announcements')({ head:()=>pageHead(3), component:Page });
function Page() { return <><PageIntro index={3}/><NewsSection kind="announcements"/></>; }
