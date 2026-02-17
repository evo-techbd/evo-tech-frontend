import { NextResponse, NextRequest } from 'next/server';
import axios from "@/utils/axios/axios";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from 'axios';
import axiosErrorLogger from '@/components/error/axios_error';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subcat_id: string }> }
) {
    try {
        // backend API call for getting subcategory details (public access)
        const { subcat_id } = await params;
        const backendRes = await axios.get(`/subcategories/${subcat_id}`);

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
    { params }: { params: Promise<{ subcat_id: string }> }
) {
    const axioswithIntercept = await axiosIntercept();

    try {
        const reqBody = await request.json();
        
        // backend API call for updating subcategory
        const { subcat_id } = await params;
        const backendRes = await axioswithIntercept.put(`/subcategories/${subcat_id}`, reqBody);

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
    { params }: { params: Promise<{ subcat_id: string }> }
) {
    const axioswithIntercept = await axiosIntercept();

    try {
        // backend API call for deleting subcategory
        const { subcat_id } = await params;
        const backendRes = await axioswithIntercept.delete(`/subcategories/${subcat_id}`);

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
