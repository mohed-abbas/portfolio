import type { MetadataRoute } from 'next';
import { siteMetadata, getCaseStudySlugs } from '@/data';

// Required for output: 'export' — emits a static sitemap.xml at build time.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteMetadata.siteUrl;
  const now = new Date();
  return [
    { url: base, lastModified: now },
    { url: `${base}/work`, lastModified: now },
    { url: `${base}/work2`, lastModified: now },
    ...getCaseStudySlugs().map((slug) => ({
      url: `${base}/work/${slug}`,
      lastModified: now,
    })),
  ];
}
