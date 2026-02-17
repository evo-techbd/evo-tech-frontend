import { UpdateProductForm } from "@/components/admin/products/update-product-form";
import { ProductSectionsWrapper } from "@/components/admin/products/product-sections-wrapper";
import { currentRouteProps } from "@/utils/types_interfaces/shared_types";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import axiosErrorLogger from "@/components/error/axios_error";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

const AdminUpdateProductsPage = async ({ params }: currentRouteProps) => {
  const axioswithIntercept = await axiosIntercept();
  const resolvedParams = await params;

  // fetch item data from backend
  noStore();
  const itemInfo = await axioswithIntercept
    .get(`/api/products/slug/${resolvedParams.itemslug}`)
    .then((res) => {
      const product = res.data.data || res.data.item_data;

      // Transform backend data to frontend format
      if (product) {
        return {
          itemid: product._id,
          i_name: product.name,
          i_slug: product.slug,
          i_price: product.price,
          i_buyingprice: product.buyingPrice || 0,
          i_prevprice: product.previousPrice || 0,
          i_rating: product.rating || 0,
          i_reviews: product.reviewCount || 0,
          i_instock: product.inStock,
          i_features: product.features || [],
          i_colors: product.colors || [],
          i_mainimg: product.mainImage,
          i_category: product.category?._id || product.category,
          i_subcategory: product.subcategory?._id || product.subcategory || "",
          i_brand: product.brand?._id || product.brand || "",
          i_weight: product.weight?.toString() || "",
          landing_section_id: product.landingpageSectionId?.toString() || "",
          i_images:
            product.images?.map((img: any) => ({
              imgid: img._id,
              imgsrc: img.imageUrl,
              imgtitle: img.title || "",
              ismain: false,
            })) || [],
          i_description: product.description || "",
          i_shortdescription: product.shortDescription || "",
          i_sku: product.sku || "",
          i_stock: product.stock || 0,
          i_lowstockthreshold: product.lowStockThreshold || 10,
          i_isfeatured: product.isFeatured || false,
          i_ispreorder: product.isPreOrder || false,
          i_preorderdate: product.preOrderDate || "",
          i_preorderprice: product.preOrderPrice || 0,
          i_published:
            product.published !== undefined ? product.published : true,
          i_seotitle: product.seoTitle || "",
          i_seodescription: product.seoDescription || "",
          i_featurebanner: product.featureBanner || "",
          i_faq: product.faqs || [],
          i_sectionsdata: {
            features_section: {
              header: product.featureHeaders || [],
              subsections: product.featureSubsections || [],
            },
            specifications_section: product.specifications || [],
            color_variations: product.colorVariations || [],
          },
        };
      }
      return null;
    })
    .catch((error: any) => {
      axiosErrorLogger({ error });
      return null;
    });

  if (!itemInfo) {
    return null;
  }

  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
          Update Product
        </h2>
      </div>

      <UpdateProductForm itemInfo={itemInfo} />

      <ProductSectionsWrapper
        initialData={{
          itemid: itemInfo.itemid,
          itemname: itemInfo.i_name,
          headers: itemInfo.i_sectionsdata?.features_section?.header || [],
          subsections:
            itemInfo.i_sectionsdata?.features_section?.subsections || [],
          specifications: itemInfo.i_sectionsdata?.specifications_section || [],
          colorVariations: itemInfo.i_sectionsdata?.color_variations || [],
          reviews: [],
        }}
      />

      {/* Action Buttons */}
      <div className="pt-10 w-full flex justify-end gap-2">
        <Link
          href="/control/products"
          className="px-5 py-2 bg-stone-300 text-stone-800 rounded text-xs md:text-sm hover:bg-stone-200 transition-colors duration-100 ease-linear shadow"
        >
          Back
        </Link>
        <button
          type="submit"
          form="updateproductform"
          aria-label="update item"
          className="px-7 py-2 bg-stone-800 text-white rounded text-xs md:text-sm hover:bg-stone-900 disabled:bg-stone-600"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default AdminUpdateProductsPage;
