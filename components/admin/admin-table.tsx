type AdminTableProps = {
  children: React.ReactNode;
};

export default function AdminTable({ children }: AdminTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/90">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">{children}</table>
      </div>
    </div>
  );
}
