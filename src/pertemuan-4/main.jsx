import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import FrameworkListSearchFilter from './FrameworkListSearchFilter' // Sesuaikan path-nya
import Admin from './Admin'
import frameworkData from './framework.json'
import './tailwind.css'

function App() {
  const [view, setView] = useState('guest');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-slate-900 text-white p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-black text-blue-400">AIRPORT GO</h1>
        <div className="flex flex-col gap-2 mt-10">
          <button 
            onClick={() => setView('guest')}
            className={`p-4 rounded-2xl font-bold text-left transition-all ${view === 'guest' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            🏠 Guest View
          </button>
          <button 
            onClick={() => setView('admin')}
            className={`p-4 rounded-2xl font-bold text-left transition-all ${view === 'admin' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            ⚙️ Admin Panel
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {view === 'guest' ? <FrameworkListSearchFilter /> : <Admin data={frameworkData} />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)