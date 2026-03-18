const HomeMaintenancePage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 font-inter px-4">
      <div className="w-full max-w-lg flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-brand-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-[28px] sm:text-[34px] font-bold text-white leading-tight tracking-tight">
            Evo-Tech Bangladesh
          </h1>
          <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase">
            Under Maintenance
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-stone-300 text-[15px] sm:text-[17px] leading-7">
            Our website is currently under maintenance. We&apos;ll be back
            shortly!
          </p>
          <p className="text-stone-400 text-[13px] sm:text-[14px] leading-6">
            In the meantime, you can still place orders directly via our social
            handles below. We&apos;re fully operational!
          </p>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-4">
          <a
            href="https://www.facebook.com/evotech.bd2022"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center gap-4 p-4 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/30 hover:bg-[#1877F2]/20 transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1877F2] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-[14px]">Facebook</p>
              <p className="text-stone-400 text-[12px]">
                Message us for orders
              </p>
              <p className="text-[#1877F2] text-[12px] font-medium">
                Evo-Tech Bangladesh
              </p>
            </div>
          </a>

          <a
            href="https://wa.me/8801799424854"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center gap-4 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-[14px]">WhatsApp</p>
              <p className="text-stone-400 text-[12px]">
                Place your order instantly
              </p>
              <p className="text-[#25D366] text-[12px] font-medium">
                +880 1799-424854
              </p>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-stone-700/50 border border-stone-600/50">
          <svg
            className="w-4 h-4 text-stone-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z"
            />
          </svg>
          <p className="text-stone-300 text-[13px]">
            Call us:{" "}
            <span className="text-white font-semibold">+880 1799-424854</span>
          </p>
        </div>

        <p className="text-stone-500 text-[12px]">
          © {new Date().getFullYear()} Evo-Tech Bangladesh · All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default HomeMaintenancePage;
