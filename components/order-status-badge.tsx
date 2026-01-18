type OrderStatusBadgeProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${style}`}>
      {status}
    </span>
  );
}
