import { NextResponse, NextRequest } from 'next/server';
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from 'axios';
import axiosErrorLogger from '@/components/error/axios_error';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    const axioswithIntercept = await axiosIntercept();
    const { orderId } = await params;

    try {

        // Backend API call for getting single order
        const backendRes = await axioswithIntercept.get(`/orders/${orderId}`);

        const data = backendRes.data;
        
        return NextResponse.json(data, { status: backendRes.status });

    } catch (error: any) {
        console.error('❌ Error in GET /api/admin/orders/[orderId]:', error.response?.data || error.message);
        axiosErrorLogger({ error });
        if (isAxiosError(error) && error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status ?? 500 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    const axioswithIntercept = await axiosIntercept();
    const { orderId } = await params;

    try {
        const reqBody = await request.json();
        // backend API call for updating order statuses
        const backendRes = await axioswithIntercept.put(`/orders/${orderId}`, reqBody);

        const data = backendRes.data;

        return NextResponse.json(data, { status: backendRes.status });

    } catch (error: any) {
        console.error('❌ Error updating order:', error.response?.data || error.message);
        axiosErrorLogger({ error });
        if (isAxiosError(error) && error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status ?? 500 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    const axioswithIntercept = await axiosIntercept();
    const { orderId } = await params;

    try {

        // Backend API call for deleting order
        const backendRes = await axioswithIntercept.delete(`/orders/${orderId}`);

        const data = backendRes.data;
        return NextResponse.json(data, { status: backendRes.status });

    } catch (error: any) {
        console.error('❌ Error deleting order:', error.response?.data || error.message);
        axiosErrorLogger({ error });
        if (isAxiosError(error) && error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status ?? 500 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
