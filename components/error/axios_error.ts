
interface AnyAxiosError {
    response?: {
        status: number;
        statusText: string;
        data: any;
    };
    message?: string;
    code: string;
}


const getSafeErrorDetails = (error: AnyAxiosError) => {
    if (!error || typeof error !== 'object') {
        return {
            message: 'Unknown error',
            status: 'N/A',
            statusText: 'N/A',
            data: 'Error object is empty or invalid'
        };
    }
    
    return {
        message: error.message || error.code || 'No Message',
        status: error.response?.status || 'Unknown Status',
        statusText: error.response?.statusText || 'No Status Text',
        data: error.response?.data || 'No additional data available, check for network/server issues',
    };
};

const axiosErrorLogger = ({ error }: { error: any; }) => {
    const errorDetails = getSafeErrorDetails(error);
    
    // Only log if there's actual error information
    if (errorDetails.message !== 'Unknown error' || errorDetails.data !== 'Error object is empty or invalid') {
        console.error('Error Occurred:', errorDetails);
    }
}

export default axiosErrorLogger;
