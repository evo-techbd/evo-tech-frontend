

const ShowFormSuccess = ({ message }: {
    message?: string;
}) => {
    if (!message) return null;
    
    return (
        <div className="flex w-full text-[11px] sm:text-[12px] leading-4 font-[500] text-emerald-600 bg-emerald-600/10 p-1.5 rounded-[6px]">
            {message}
        </div>
    );
}

export { ShowFormSuccess };
