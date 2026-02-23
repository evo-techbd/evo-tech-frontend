import { NextResponse, NextRequest } from 'next/server';
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from 'axios';
import axiosErrorLogger from '@/components/error/axios_error';


export async function DELETE(
    request: NextRequest, // even if the request is not in use, it's required to keep it as the 1st parameter in Next.js route handler
    { params }: { params: Promise<{ itemid: string }> }
) {
    const axioswithIntercept = await axiosIntercept();
    const { itemid } = await params;

    try {
        const backendRes = await axioswithIntercept.delete(`/api/admin/item/${itemid}/features/deleteall`);

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
