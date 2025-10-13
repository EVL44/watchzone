export default function WatchPage({ params }) {
  const { type, id } = params;
  const embedUrl = `https://vidsrc.to/embed/${type}/${id}`;
  const title = type === 'movie' ? 'Movie' : 'Series';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
        Now Playing
      </h1>
      <div className="w-full max-w-5xl aspect-video bg-black rounded-lg shadow-2xl shadow-primary/20">
        <iframe
          src={embedUrl}
          frameBorder="0"
          allowFullScreen
          className="w-full h-full rounded-lg"
          title={`Watch ${title} ${id}`}
        ></iframe>
      </div>
    </div>
  );
}