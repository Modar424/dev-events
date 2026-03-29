import type { Metadata } from 'next';
import { PageTransition } from '@/components/PageTransition';

export const metadata: Metadata = {
  title: 'Admin | DevEvent',
  description: 'DevEvent Admin Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
}
