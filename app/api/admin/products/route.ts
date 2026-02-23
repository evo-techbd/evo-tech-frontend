import { NextResponse, NextRequest } from 'next/server';
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from 'axios';
import axiosErrorLogger from '@/components/error/axios_error';

export async function GET(request: NextRequest) {
    const axioswithIntercept = await axiosIntercept();

    try {
        const { searchParams } = new URL(request.url);

        // Extract query parameters
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const brand = searchParams.get('brand');
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');

        // Build query string for Laravel backend
        const backendParams = new URLSearchParams();

        if (search) {
            backendParams.set('search', search);
        }

        if (category) {
            backendParams.set('category', category);
        }

        if (subcategory) {
            backendParams.set('subcategory', subcategory);
        }

        if (brand) {
            backendParams.set('brand', brand);
        }

        if (page) {
            backendParams.set('page', page);
        }

        if (limit) {
            backendParams.set('limit', limit);
        }

        const backendQueryString = backendParams.toString();

        // Backend API call for getting all products
        const backendRes = await axioswithIntercept.get(
            `/products${backendQueryString ? `?${backendQueryString}` : ""}`,
            {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }
        );

        const data = backendRes.data;
        return NextResponse.json(data, { status: backendRes.status });

    } catch (error: any) {
        axiosErrorLogger({ error });
        if (isAxiosError(error) && error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status ?? 500 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const axioswithIntercept = await axiosIntercept();

    try {
        const formdata = await request.formData();

        const backendRes = await axioswithIntercept.post(`/products`,
            formdata,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        const data = backendRes.data;
        
        // Transform response to include item_name for frontend toast
        if (data.data) {
            return NextResponse.json({
                ...data,
                item_name: data.data.name,
                item_slug: data.data.slug,
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
