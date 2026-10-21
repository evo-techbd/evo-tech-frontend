import { MetadataRoute } from 'next'
import { siteURL } from '@/lib/site-config'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteURL
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/control/',
          '/employee/',
          '/user/dashboard/',
          '/api/',
          '/checkout/',
          '/admin/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/control/',
          '/employee/',
          '/user/dashboard/',
          '/api/',
          '/checkout/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
