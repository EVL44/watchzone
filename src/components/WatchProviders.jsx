// src/components/WatchProviders.jsx
'use client';

import Image from 'next/image';

// List of some popular free, ad-supported providers
// You can add more provider names here if you wish
const FREE_PROVIDERS = [
  'Tubi TV',
  'Pluto TV',
  'Plex',
  'Crackle',
  'The Roku Channel',
  'Freevee',
];

export default function WatchProviders({ providers }) {
  // We'll focus on US providers as it's the most common data point
  const usProviders = providers?.US;

  if (!usProviders) {
    return null;
  }
  
  // Find free, ad-supported providers
  const freeWithAds = usProviders.free?.filter(p => FREE_PROVIDERS.includes(p.provider_name));

  if (!freeWithAds || freeWithAds.length === 0) {
    return null; // Don't show anything if no free options are found
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-foreground mb-3">Watch for Free (with Ads)</h2>
      <div className="flex flex-wrap gap-4">
        {freeWithAds.map((provider) => (
          <a
            key={provider.provider_id}
            href={usProviders.link} // This link goes to the TMDB "justwatch" page
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-secondary p-3 rounded-lg hover:bg-surface transition-colors"
            title={`Watch on ${provider.provider_name}`}
          >
            <Image
              src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
              alt={`${provider.provider_name} logo`}
              width={40}
              height={40}
              className="rounded-md"
              unoptimized={true}
            />
            <span className="font-semibold text-foreground">{provider.provider_name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}