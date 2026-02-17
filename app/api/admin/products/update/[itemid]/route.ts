import { NextResponse, NextRequest } from 'next/server';
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from 'axios';
import axiosErrorLogger from '@/components/error/axios_error';


export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ itemid: string }> }
) {
    const axioswithIntercept = await axiosIntercept();
    const { itemid } = await params;

    console.log('Update product API called with itemid:', itemid);

    try {
        const formdata = await request.formData();

        // Transform frontend field names to backend field names
        const backendFormData = new FormData();
        
        // Field name mappings
        const fieldMappings: Record<string, string> = {
            'item_name': 'name',
            'item_slug': 'slug',
            'item_price': 'price',
            'item_prevprice': 'previousPrice',
            'item_instock': 'inStock',
            'item_features[]': 'features',
            'item_colors[]': 'colors',
            'item_newmainimg': 'mainImage',
            'item_category': 'category',
            'item_subcategory': 'subcategory',
            'item_brand': 'brand',
            'item_weight': 'weight',
            'landing_section_id': 'landingpageSectionId',
            'stock': 'stock',
            'lowStockThreshold': 'lowStockThreshold',
            'sku': 'sku',
            'description': 'description',
            'shortDescription': 'shortDescription',
            'isFeatured': 'isFeatured',
            'published': 'published',
            'isPreOrder': 'isPreOrder',
            'preOrderDate': 'preOrderDate',
            'preOrderPrice': 'preOrderPrice',
            'seoTitle': 'seoTitle',
            'seoDescription': 'seoDescription',
        };

        // Transform the form data
        for (const [key, value] of formdata.entries()) {
            // Handle array fields
            if (key.endsWith('[]')) {
                const baseKey = key.slice(0, -2);
                const mappedKey = fieldMappings[key] || baseKey;
                backendFormData.append(`${mappedKey}[]`, value);
            }
            // Handle main image file
            else if (key === 'item_newmainimg' && value instanceof File) {
                backendFormData.append('mainImage', value);
            }
            // Handle regular fields
            else if (fieldMappings[key]) {
                backendFormData.append(fieldMappings[key], value);
            }
            // Keep unmapped fields as-is
            else {
                backendFormData.append(key, value);
            }
        }

        // Use PUT method to match the backend endpoint
        const backendRes = await axioswithIntercept.put(`/products/${itemid}`,
            backendFormData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        const data = backendRes.data;
        
        // Transform response back to frontend format if needed
        if (data.data) {
            const product = data.data;
            return NextResponse.json({
                ...data,
                item_name: product.name,
                item_slug: product.slug,
            }, { status: backendRes.status });
        }

        return NextResponse.json(data, { status: backendRes.status });

    } catch (error: any) {
        axiosErrorLogger({ error });
        if (isAxiosError(error) && error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status ?? 500 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
