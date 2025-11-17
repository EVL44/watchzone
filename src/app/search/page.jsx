import { Suspense } from 'react';
import SearchResults from '@/components/SearchResults';
import HeroSearch from "@/components/HeroSearch";

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-foreground text-2xl">Loading search results...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}