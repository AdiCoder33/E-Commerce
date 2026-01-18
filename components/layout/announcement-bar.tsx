type AnnouncementBarProps = {
  announcement?: string | null;
};

export default function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  const message =
    announcement?.trim() ||
    'Free shipping above INR 1999 - COD available - Easy returns';
  return (
    <div className="bg-ink text-paper">
      <div className="container flex flex-wrap items-center justify-center gap-3 py-2 text-xs uppercase tracking-[0.2em]">
        <span>{message}</span>
      </div>
    </div>
  );
}
