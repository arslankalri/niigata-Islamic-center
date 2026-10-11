import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/site/home';
import { pageHead } from '@/lib/translations';
export const Route = createFileRoute('/')({ head:()=>pageHead(0), component:HomePage });
