

// import axios from "@/utils/axios/axios";
import DynamicProductSlider from "@/components/carousels/dynamic-product-slider";
// import axiosErrorLogger from "@/components/error/axios_error";

const getFeaturedSections = async () => {
  // Use native fetch with ISR caching to save Vercel CPU limits
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL 
    const res = await fetch(`${backendUrl}/products/featured-sections`, {
      next: { revalidate: 3600 }, // Cache statically for 1 hour
      headers: { "Content-Type": "application/json" }
    });
    
    if (!res.ok) throw new Error("Failed to fetch featured sections");
    
    const data = await res.json();
    return data?.data || [];
  } catch (error) {
     console.error("Failed to fetch featured sections:", error);
     return [];
  }
};

const FeaturedSectionsRenderer = async () => {
  const sections = await getFeaturedSections();
  

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map((section: any) => {
        
        if (!section.isActive) {
          return null;
        }

        if (!section.products || section.products.length === 0) {
          return null;
        }
        
        // Use category or subcategory slug for view more with filter query parameter
        let viewMoreUrl = "/products-and-accessories";
        if (section.category?.slug) {
            viewMoreUrl = `/products-and-accessories?category=${section.category.slug}`;
        } else if (section.subcategory?.slug) {
            viewMoreUrl = `/products-and-accessories?subcategory=${section.subcategory.slug}`;
        }

        const formattedProducts = section.products.map((p: any) => ({
             id: p._id,
             name: p.name,
             slug: p.slug,
             price: p.price,
             prevPrice: p.previousPrice,
             preOrderPrice: p.preOrderPrice || null,
             image: p.mainImage,
             rating: 0 
        }));

        return (
          <DynamicProductSlider
            key={section._id}
            title={section.title}
            products={formattedProducts}
            viewMoreUrl={viewMoreUrl}
          />
        );
      })}
    </>
  );
};

export default FeaturedSectionsRenderer;
