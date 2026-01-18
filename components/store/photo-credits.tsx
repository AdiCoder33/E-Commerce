type AttributionPhoto = {
  name?: string;
  profile?: string;
  link?: string;
};

type AttributionData = {
  source?: string;
  photos?: AttributionPhoto[];
};

type PhotoCreditsProps = {
  attribution?: AttributionData | null;
};

export default function PhotoCredits({ attribution }: PhotoCreditsProps) {
  const photos = attribution?.photos || [];
  if (!photos.length) {
    return null;
  }

  const unique = Array.from(
    new Map(photos.map((photo) => [photo.name, photo])).values()
  ).filter((photo) => photo.name && photo.profile);

  if (unique.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 text-xs text-black/50">
      Photo credits:{' '}
      {unique.map((photo, index) => (
        <span key={`${photo.name}-${index}`}>
          <a
            href={photo.profile}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {photo.name}
          </a>
          {index < unique.length - 1 ? ', ' : ''}
        </span>
      ))}{' '}
      (Unsplash)
    </div>
  );
}
