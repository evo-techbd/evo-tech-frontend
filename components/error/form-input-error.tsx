
interface EvoFormInputErrorProps {
    children?: React.ReactNode;
    error?: {
        message?: string;
    };
}

const EvoFormInputError = ({ children, error }: EvoFormInputErrorProps) => {
    const message = error?.message || children;
    
    if (!message) return null;
    
    return (
        <div className="flex flex-col w-full h-fit text-red-500 text-[11px] sm:text-[12px] leading-4 tracking-tight font-[500] mt-1">
            {message}
        </div>
    );
}

export { EvoFormInputError };
