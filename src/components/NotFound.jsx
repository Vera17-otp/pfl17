export default function NotFound() {
    return (
        <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-white z-[9999]">
            <div className="text-center">
                <h1 className="text-9xl font-black text-slate-100 absolute inset-0 flex items-center justify-center -z-10">404</h1>
                <h2 className="text-2xl font-bold text-slate-800">Page Not Found</h2>
                <p className="text-slate-400 mt-2">The suite you are looking for doesn't exist.</p>
                <a href="/" className="mt-6 inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase shadow-lg shadow-indigo-100">Back to Dashboard</a>
            </div>
        </div>
    );
}