import { NextResponse, NextRequest } from 'next/server';
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from 'axios';
import axiosErrorLogger from '@/components/error/axios_error';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ staffId: string }> }
) {
    const axioswithIntercept = await axiosIntercept();
    const { staffId } = await params;

    try {
        const body = await request.json();

        // Backend API call for updating a staff member
        const backendRes = await axioswithIntercept.put(`/users/${staffId}`, body);

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
    { params }: { params: Promise<{ staffId: string }> }
) {
    const axioswithIntercept = await axiosIntercept();
    const { staffId } = await params;

    try {
        // Backend API call for deleting a staff member
        const backendRes = await axioswithIntercept.delete(`/users/${staffId}`);

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
