import { NextResponse, NextRequest } from 'next/server';
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from 'axios';
import axiosErrorLogger from '@/components/error/axios_error';

export async function GET(request: NextRequest) {
    const axioswithIntercept = await axiosIntercept();
    try {
        const searchParams = request.nextUrl.searchParams.toString();
        const backendRes = await axioswithIntercept.get(`/admin/trash${searchParams ? `?${searchParams}` : ''}`);
        return NextResponse.json(backendRes.data, { status: backendRes.status });
    } catch (error: any) {
        axiosErrorLogger({ error });
        if (isAxiosError(error) && error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status ?? 500 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const axioswithIntercept = await axiosIntercept();
    try {
        const searchParams = request.nextUrl.searchParams.toString();
        const backendRes = await axioswithIntercept.delete(`/admin/trash/clear${searchParams ? `?${searchParams}` : ''}`);
        return NextResponse.json(backendRes.data, { status: backendRes.status });
    } catch (error: any) {
        axiosErrorLogger({ error });
        if (isAxiosError(error) && error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status ?? 500 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
