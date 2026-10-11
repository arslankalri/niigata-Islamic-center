import { createFileRoute } from '@tanstack/react-router';
import { PageIntro, AboutSection } from '@/components/site/sections';
import { pageHead } from '@/lib/translations';
export const Route = createFileRoute('/about')({ head:()=>pageHead(2), component:Page });
function Page() { return <><PageIntro index={2}/><AboutSection full/></>; }
