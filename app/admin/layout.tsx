import AdminShell from '@/components/admin/admin-shell';
import { requireAdmin } from '@/lib/admin/guard';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireAdmin('/admin');

  return <AdminShell>{children}</AdminShell>;
}
