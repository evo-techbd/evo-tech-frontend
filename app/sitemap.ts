import { MetadataRoute } from 'next'
import axios from 'axios'

const baseUrl = process.env.NEXT_PUBLIC_FEND_URL || 'https://evo-techbd.com'
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = []

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products-and-accessories`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/about/warranty-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    },
  ]

  sitemap.push(...staticPages)

  try {
    // Fetch products
    if (backendUrl) {
      const productsRes = await axios.get(`${backendUrl}/products?limit=1000&published=true`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (productsRes.data?.data) {
        const products = productsRes.data.data
        products.forEach((product: any) => {
          sitemap.push({
            url: `${baseUrl}/items/${product.slug}`,
            lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          })
        })
      }

      // Fetch categories
      const categoriesRes = await axios.get(`${backendUrl}/categories?limit=100`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (categoriesRes.data?.data) {
        const categories = categoriesRes.data.data
        categories.forEach((category: any) => {
          sitemap.push({
            url: `${baseUrl}/${category.slug}`,
            lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          })
        })
      }

      // Fetch subcategories
      const subcategoriesRes = await axios.get(`${backendUrl}/subcategories?limit=100`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (subcategoriesRes.data?.data) {
        const subcategories = subcategoriesRes.data.data
        subcategories.forEach((subcategory: any) => {
          if (subcategory.category?.slug) {
            sitemap.push({
              url: `${baseUrl}/${subcategory.category.slug}/${subcategory.slug}`,
              lastModified: subcategory.updatedAt ? new Date(subcategory.updatedAt) : new Date(),
              changeFrequency: 'weekly',
              priority: 0.7,
            })
          }
        })
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return sitemap
}
