export default function Nav({ children, sticky = false, className = "" }) {
  return (
    <nav
      className={`bg-white border-b border-sand-200 px-5 py-3 flex items-center justify-between ${sticky ? "sticky top-0 z-50" : ""} ${className}`}
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-[30px] h-[30px] rounded-lg bg-brand-600 flex items-center justify-center text-sm"
          aria-hidden="true"
        >
          🔬
        </div>
        <div>
          <div className="text-[13px] font-bold text-brand-600 leading-tight">ForMen Health</div>
          <div className="text-[11px] text-gray-400 leading-tight">Lab Report Explainer</div>
        </div>
      </div>
      {children && <div className="flex gap-2 flex-wrap">{children}</div>}
    </nav>
  );
}
