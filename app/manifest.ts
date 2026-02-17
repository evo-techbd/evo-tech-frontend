import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Evo-Tech Bangladesh - Tech Products & 3D Printing Services',
    short_name: 'Evo-TechBD',
    description: 'Premium tech products, 3D printers, filaments, and professional 3D printing services in Bangladesh. Quality electronics and accessories.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
