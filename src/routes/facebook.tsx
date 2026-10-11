import { createFileRoute } from '@tanstack/react-router';
import { PageIntro, FacebookSection } from '@/components/site/sections';
import { pageHead } from '@/lib/translations';
export const Route = createFileRoute('/facebook')({ head:()=>pageHead(6), component:Page });
function Page() { return <><PageIntro index={6}/><FacebookSection full/></>; }
