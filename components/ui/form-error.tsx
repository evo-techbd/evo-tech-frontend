

const ShowFormError = ({ message }: {
    message?: string;
}) => {
    if (!message) return null;
    
    return (
        <div className="flex w-full text-[11px] sm:text-[12px] leading-4 font-[500] text-red-600 bg-red-500/10 p-1.5 rounded-[6px]">
            {message}
        </div>
    );
}

export { ShowFormError };
