import { createFileRoute } from '@tanstack/react-router';
import { PageIntro, VisitSection } from '@/components/site/sections';
import { pageHead } from '@/lib/translations';
export const Route = createFileRoute('/visit')({ head:()=>pageHead(5), component:Page });
function Page() { return <><PageIntro index={5}/><VisitSection full/></>; }
