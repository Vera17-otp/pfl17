export default function PageHeader({ title, breadcrumb, children }) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-4 gap-3">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-700">
                    {title}<span className="text-blue-500">.</span>
                </h1>
                <div className="text-slate-400 text-[9px] font-medium flex items-center gap-2 mt-0.5">
                    {Array.isArray(breadcrumb)
                        ? breadcrumb.map((item, i) => (
                            <span key={i} className="flex items-center gap-2">
                                <span className={i === breadcrumb.length - 1 ? "text-blue-500 font-bold" : ""}>{item}</span>
                                {i < breadcrumb.length - 1 && <span className="text-slate-300">/</span>}
                            </span>
                        ))
                        : breadcrumb}
                </div>
            </div>
            <div>{children}</div>
        </div>
    );
}