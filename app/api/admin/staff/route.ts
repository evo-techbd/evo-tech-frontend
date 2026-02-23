import { NextResponse, NextRequest } from 'next/server';
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from 'axios';
import axiosErrorLogger from '@/components/error/axios_error';

export async function GET(request: NextRequest) {
    const axioswithIntercept = await axiosIntercept();

    try {
        const { searchParams } = new URL(request.url);

        // Extract query parameters
        const search = searchParams.get('search');
        const isActive = searchParams.get('isActive');
        const userType = searchParams.get('userType'); // Can be 'admin' or 'employee'
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');

        // Build query string for backend
        const backendParams = new URLSearchParams();

        // Filter to only get staff members (userType = 'admin' or 'employee')
        if (userType && (userType === 'admin' || userType === 'employee')) {
            backendParams.set('userType', userType);
        } else {
            // Get both admin and employee if no specific type provided
            backendParams.set('userType', 'admin,employee');
        }

        if (search) {
            backendParams.set('search', search);
        }

        if (isActive) {
            backendParams.set('isActive', isActive);
        }

        if (page) {
            backendParams.set('page', page);
        }

        if (limit) {
            backendParams.set('limit', limit);
        }

        const backendQueryString = backendParams.toString();

        // Backend API call for getting all staff
        const backendRes = await axioswithIntercept.get(
            `/users${backendQueryString ? `?${backendQueryString}` : ""}`,
            {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }
        );

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
        const body = await request.json();

        // Backend API call for creating a new staff member
        const backendRes = await axioswithIntercept.post('/users/staff', body);

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
