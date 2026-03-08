import { NextResponse, NextRequest } from 'next/server';
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from 'axios';
import axiosErrorLogger from '@/components/error/axios_error';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ trash_id: string }> }
) {
    const axioswithIntercept = await axiosIntercept();
    try {
        const { trash_id } = await params;
        const backendRes = await axioswithIntercept.post(`/admin/trash/${trash_id}/restore`);
        return NextResponse.json(backendRes.data, { status: backendRes.status });
    } catch (error: any) {
        axiosErrorLogger({ error });
        if (isAxiosError(error) && error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status ?? 500 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
