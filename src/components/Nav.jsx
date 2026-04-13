export default function Nav({ children, sticky = true, className = "", onLogoClick }) {
  const logo = (
    <div className="flex items-center gap-3">
      <div className="w-[32px] h-[32px] bg-brand-900 flex items-center justify-center transition-transform hover:scale-105" style={{ boxShadow: '0 4px 12px rgba(17,24,82,0.15)' }}>
        <span className="text-white text-[12px] font-bold tracking-clinical">FM</span>
      </div>
      <div>
        <div className="text-[14px] font-bold text-brand-900 leading-tight tracking-tight">ForMen Health</div>
        <div className="text-[10px] text-neutral-500 leading-tight uppercase tracking-wide mt-0.5">Lab Report Explainer</div>
      </div>
    </div>
  );

  return (
    <nav
      className={`glass-nav px-6 py-4 flex items-center justify-between ${sticky ? "sticky top-0 z-50" : ""} ${className}`}
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-10">
        {onLogoClick ? (
          <button onClick={onLogoClick} className="bg-transparent border-none cursor-pointer p-0 flex items-center" aria-label="Go to home">
            {logo}
          </button>
        ) : logo}
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7 mt-1">
          <a href="https://www.formen.health/" target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-gray-500 hover:text-brand-900 uppercase tracking-clinical transition-colors no-underline">Home</a>
          <a href="https://www.formen.health/collections/all" target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-gray-500 hover:text-brand-900 uppercase tracking-clinical transition-colors no-underline">Shop</a>
          <a href="https://www.formen.health/pages/book-doctor-appointment" target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-gray-500 hover:text-brand-900 uppercase tracking-clinical transition-colors no-underline">Consult a Doctor</a>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap items-center">
        {children}
      </div>
    </nav>
  );
}
