import { NextResponse, NextRequest } from 'next/server';
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from 'axios';
import axiosErrorLogger from '@/components/error/axios_error';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ bannerId: string }> }
) {
    const axioswithIntercept = await axiosIntercept();
    const { bannerId } = await params;

    try {
        const backendRes = await axioswithIntercept.delete(`/banners/${bannerId}`);
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
