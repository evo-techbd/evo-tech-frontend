import { NextResponse, NextRequest } from 'next/server';
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from 'axios';
import axiosErrorLogger from '@/components/error/axios_error';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ couponId: string }> }
) {
    const axioswithIntercept = await axiosIntercept();
    const { couponId } = await params;

    try {
        const backendRes = await axioswithIntercept.delete(`/coupons/${couponId}`);
        const data = backendRes.data;
        
        return NextResponse.json(data, { status: backendRes.status });
    } catch (error: any) {
        axiosErrorLogger({ error });
        if (isAxiosError(error) && error.response) {
            return NextResponse.json(
                error.response.data,
                { status: error.response.status ?? 500 }
            );
        }
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ couponId: string }> }
) {
    const axioswithIntercept = await axiosIntercept();
    const { couponId } = await params;

    try {
        const reqBody = await request.json();
        const backendRes = await axioswithIntercept.patch(`/coupons/${couponId}`, reqBody);
        const data = backendRes.data;
        
        return NextResponse.json(data, { status: backendRes.status });
    } catch (error: any) {
        axiosErrorLogger({ error });
        if (isAxiosError(error) && error.response) {
            return NextResponse.json(
                error.response.data,
                { status: error.response.status ?? 500 }
            );
        }
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ couponId: string }> }
) {
    const axioswithIntercept = await axiosIntercept();
    const { couponId } = await params;

    try {
        const backendRes = await axioswithIntercept.get(`/coupons/${couponId}`);
        const data = backendRes.data;
        
        return NextResponse.json(data, { status: backendRes.status });
    } catch (error: any) {
        axiosErrorLogger({ error });
        if (isAxiosError(error) && error.response) {
            return NextResponse.json(
                error.response.data,
                { status: error.response.status ?? 500 }
            );
        }
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
