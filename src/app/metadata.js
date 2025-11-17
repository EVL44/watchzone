// We move the metadata to its own file to keep layout.jsx clean
// and to easily import it into other files like sitemap.js

// IMPORTANT: Change this to your app's production domain
const siteUrl = 'https://watchzone.dev'; // Or your custom domain

export const metadata = {
  // Use 'metadataBase' to set the base URL for all relative Open Graph images and canonical URLs
  metadataBase: new URL(siteUrl),

  title: {
    // The default title for the site (e.g., on the homepage)
    default: 'Watchzone - Discover, Track, and Watch Movies & TV Series',
    // The template for all other pages (e.g., "Movie Name | watchzone")
    template: '%s - Watchzone',
  },
  description: "watchzone is your ultimate destination for discovering, tracking, and watching your favorite movies and TV series. Create watchlists, follow users, and join the conversation.",
  
  // Keywords to help search engines understand your site's content
  keywords: [
    'watchzone',
    'movies',
    'series',
    'tv shows',
    'discover movies',
    'track movies',
    'movie watchlist',
    'tv show watchlist',
    'imdb',
    'tmdb',
    'letterboxd',
    'watch trailers',
    'movie recommendations'
  ],

  // Open Graph (for social media sharing)
  openGraph: {
    title: 'Watchzone - Discover, Track, and Watch Movies & TV Series',
    description: 'Your ultimate destination for discovering and tracking movies and TV shows.',
    url: siteUrl,
    siteName: 'Watchzone',
    images: [
      {
        url: '/wz1.png', // Relative to metadataBase (e.g., https://your-domain.com/wz1.png)
        width: 1200,
        height: 630,
        alt: 'Watchzone Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter Card (for Twitter sharing)
  twitter: {
    card: 'summary_large_image',
    title: 'Watchzone - Discover, Track, and Watch Movies & TV Series',
    description: 'Your ultimate destination for discovering and tracking movies and TV shows.',
    images: ['/wz1.png'], // Relative to metadataBase
  },

  // Icons and Manifest
  icons: {
    icon: "/wzmax.png", // Favicon
    apple: "/wzmax.png", // Apple touch icon
  },
  manifest: "/manifest.json", // Points to your PWA manifest
};