import { NextResponse, NextRequest } from 'next/server';
import axios from "@/utils/axios/axios";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from 'axios';
import axiosErrorLogger from '@/components/error/axios_error';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ category_id: string }> }
) {
    try {

        // backend API call for getting category details (public access)
        const { category_id } = await params;
        const backendRes = await axios.get(`/categories/${category_id}`);

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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ category_id: string }> }
) {
    const axioswithIntercept = await axiosIntercept();

    try {
        // Get FormData from the request (for file uploads)
        const formData = await request.formData();

        // backend API call for updating category
        const { category_id } = await params;
        const backendRes = await axioswithIntercept.put(`/categories/${category_id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ category_id: string }> }
) {
    const axioswithIntercept = await axiosIntercept();

    try {

        // backend API call for deleting category
        const { category_id } = await params;
        const backendRes = await axioswithIntercept.delete(`/categories/${category_id}`);

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
