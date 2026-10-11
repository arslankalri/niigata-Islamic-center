import { createFileRoute } from '@tanstack/react-router';
import { PageIntro, NewsSection } from '@/components/site/sections';
import { pageHead } from '@/lib/translations';
export const Route = createFileRoute('/events')({ head:()=>pageHead(4), component:Page });
function Page() { return <><PageIntro index={4}/><NewsSection kind="events"/></>; }
