import { NextResponse, NextRequest } from 'next/server';
import axios from "@/utils/axios/axios";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from 'axios';
import axiosErrorLogger from '@/components/error/axios_error';

export async function GET(request: NextRequest) {
    try {
        // const { searchParams } = new URL(request.url);

        // TODO: add query params to the backend API for filtering in the future
        // backend API call for getting all categories (public access)
        const backendRes = await axios.get(`/categories`);

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
        // Get FormData from the request (for file uploads)
        const formData = await request.formData();

        // backend API call for creating category (requires admin auth)
        const backendRes = await axioswithIntercept.post(`/categories`, formData, {
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
