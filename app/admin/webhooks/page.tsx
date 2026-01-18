import { requireAdmin } from '@/lib/admin/guard';
import AdminTable from '@/components/admin/admin-table';
import { formatDateTime } from '@/lib/format';

export default async function AdminWebhooksPage() {
  const { supabase } = await requireAdmin('/admin/webhooks');

  const { data: events } = await supabase
    .from('payment_events')
    .select('id, provider, event_type, event_id, processing_status, error, received_at')
    .eq('processing_status', 'failed')
    .order('received_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-black/50">Admin</p>
        <h1 className="font-display text-3xl font-semibold">Webhook failures</h1>
      </div>

      {events && events.length > 0 ? (
        <AdminTable>
          <thead className="bg-black/5 text-xs uppercase tracking-[0.2em] text-black/50">
            <tr>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Event ID</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-black/5">
                <td className="px-4 py-3 text-sm">{event.provider}</td>
                <td className="px-4 py-3 text-sm">{event.event_type}</td>
                <td className="px-4 py-3 text-xs text-black/60">{event.event_id}</td>
                <td className="px-4 py-3 text-xs text-black/60">
                  {formatDateTime(event.received_at)}
                </td>
                <td className="px-4 py-3 text-xs text-red-600">
                  {event.error || 'Unknown error'}
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : (
        <div className="rounded-3xl border border-dashed border-black/20 bg-white/80 p-8 text-center text-sm text-black/60">
          No failed webhook events.
        </div>
      )}
    </div>
  );
}
