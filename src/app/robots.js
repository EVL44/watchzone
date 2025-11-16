// src/app/robots.js

// IMPORTANT: Change this to your app's production domain
const siteUrl = 'https://watchzone.dev';

/**
 * This file tells search engine crawlers which pages they can or cannot crawl.
 * It's good practice to disallow admin/profile pages and allow everything else.
 * It also points crawlers to your sitemap.
 */
export default function robots() {
  return {
    rules: {
      userAgent: '*', // Applies to all search engines
      allow: '/', // Allow crawling of all pages by default
      disallow: [
        '/profile/', // Disallow personal profile settings
        '/admin/', // Disallow admin area
        '/api/', // Disallow API routes
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`, // Points to your sitemap
  };
}