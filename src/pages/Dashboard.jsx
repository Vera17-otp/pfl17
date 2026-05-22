import React from 'react';

const Dashboard = () => {
  const revenueData = [
    { month: "Oct 2021", height: "40%", color: "bg-[#94a3b8]" },
    { month: "Nov 2021", height: "55%", color: "bg-[#818cf8]" },
    { month: "Dec 2021", height: "85%", color: "bg-[#a78bfa]" },
    { month: "Jan 2022", height: "70%", color: "bg-[#c084fc]" },
    { month: "Feb 2022", height: "95%", color: "bg-[#a5f3fc]" },
  ];

  return (
    // Wrapper utama dengan background abu-abu muda agar card putih terlihat
    <div className="bg-[#f8fafc] min-h-screen w-full p-4 lg:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* --- HEADER UTAMA (Yang Tadi Tidak Muncul) --- */}
        <div className="flex justify-between items-center mb-8 bg-transparent">
          <div>
            <h2 className="text-2xl font-bold text-[#1e293b] block">Hotel Occupants</h2>
            {/* Search bar kecil di bawah judul sesuai gambar 2 */}
            <div className="mt-4 relative w-64">
              <input 
                type="text" 
                placeholder="Search hotel occupants" 
                className="w-full bg-white border border-slate-100 rounded-lg py-2 px-4 text-xs shadow-sm focus:outline-none"
              />
              <span className="absolute right-3 top-2 text-slate-400 text-xs">🔍</span>
            </div>
          </div>
          <button className="bg-[#7dd3fc] hover:bg-[#38bdf8] text-white text-[11px] font-black px-6 py-2.5 rounded-xl transition-all shadow-md">
            + ADD OCCUPANTS
          </button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          
          {/* --- KOLOM KIRI & TENGAH --- */}
          <div className="col-span-12 lg:col-span-8 space-y-10">
            
            {/* Section: Incoming Occupants */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Incoming occupants</h3>
                <div className="flex gap-2 text-slate-300 font-bold cursor-pointer">
                  <span>&lt;</span> <span className="text-slate-400">&gt;</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Card Jonathan (Biru Muda) */}
                <div className="bg-[#e0faff] rounded-[45px] p-10 border border-cyan-50 flex flex-col items-center text-center shadow-sm">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4 overflow-hidden bg-white">
                    <img src="https://i.pravatar.cc/150?u=jonathan" alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Jonathan D.</h4>
                  <span className="bg-[#7dd3fc] text-white text-[10px] font-extrabold px-5 py-1 rounded-md mb-4 uppercase">Grooming</span>
                  <p className="text-[11px] text-slate-400 font-bold mb-3">Feb 12 - Feb 14</p>
                  <p className="text-[11px] text-slate-500 font-bold mb-6">Unpaid balance: $120</p>
                  <button className="w-full bg-[#0ea5e9] text-white text-[11px] font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 uppercase tracking-wider">
                    Send Payment Link
                  </button>
                </div>

                {/* Card Jassica (Putih) */}
                <div className="bg-white rounded-[45px] p-10 border border-slate-100 flex flex-col items-center text-center shadow-sm">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4 overflow-hidden bg-slate-50">
                    <img src="https://i.pravatar.cc/150?u=jassica" alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Jassica P.</h4>
                  <span className="bg-[#7dd3fc] text-white text-[10px] font-extrabold px-5 py-1 rounded-md mb-6 uppercase">Daycare</span>
                  <p className="text-[11px] text-slate-400 font-bold mb-8">Feb 12 - Feb 14</p>
                  <div className="mt-auto">
                    <p className="text-3xl font-black text-slate-800 leading-none">$130</p>
                    <p className="text-[10px] font-bold text-green-500 uppercase mt-2 tracking-widest">Paid</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Current Occupants */}
            <div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Current occupants</h3>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-[35px] p-5 flex justify-between items-center shadow-sm border border-slate-50">
                    <div className="flex items-center gap-6">
                      <img src={`https://i.pravatar.cc/150?u=lilly${i}`} className="w-14 h-14 rounded-full border-2 border-white shadow-sm" alt="avatar" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">Lilliana M.</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[9px] font-black px-3 py-0.5 rounded uppercase ${i === 1 ? 'bg-cyan-100 text-cyan-600' : 'bg-blue-100 text-blue-600'}`}>
                            {i === 1 ? 'Grooming' : 'Daycare'}
                          </span>
                          <p className="text-[10px] text-slate-400 font-bold">Feb 12 - Feb 14</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right pr-6">
                      <p className="text-2xl font-black text-slate-800">$150</p>
                      <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Paid</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- KOLOM KANAN (ANALYTICS) --- */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            
            {/* Kalender */}
            <div className="bg-white rounded-[45px] p-8 shadow-sm border border-slate-50">
              <div className="flex justify-between items-center mb-8 px-2">
                <span className="text-cyan-400 font-black cursor-pointer text-xl">{"<"}</span>
                <span className="text-[11px] font-black text-slate-800 tracking-[0.3em]">JANUARY 2022</span>
                <span className="text-cyan-400 font-black cursor-pointer text-xl">{">"}</span>
              </div>
              <div className="grid grid-cols-7 text-center text-[10px] font-black text-cyan-500 mb-6 uppercase">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-y-4 text-center">
                {[...Array(31)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className={`w-8 h-8 flex items-center justify-center text-[11px] font-black rounded-xl ${i+1 === 14 ? 'bg-[#00AEEF] text-white shadow-lg shadow-blue-200' : 'text-slate-700'}`}>
                      {i + 1}
                    </span>
                    <span className="text-[8px] font-bold text-cyan-200 mt-1">75%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics & Grafik Revenue */}
            <div className="bg-white rounded-[45px] p-10 shadow-sm border border-slate-50">
              <h3 className="text-[13px] font-black text-slate-800 mb-10">Analytics</h3>
              <div className="flex items-center gap-10 mb-12">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                    <circle className="text-[#00D1FF]" strokeWidth="4" strokeDasharray="75, 100" strokeLinecap="round" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-slate-800">75%</span>
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Occupancy</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Occupancy rate: <span className="text-cyan-500 ml-1">75%</span></p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Vacancy: <span className="text-cyan-500 ml-1">25%</span></p>
                </div>
              </div>

              {/* GRAFIK REVENUE (Solusi untuk grafik kosong) */}
              <h3 className="text-[13px] font-black text-slate-800 mb-8">Monthly Revenue</h3>
              <div className="flex items-end justify-between gap-3 h-32 mb-10 px-1 border-b border-slate-50 pb-2">
                {revenueData.map((data, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 h-full group">
                    <div className="flex-1 w-full flex items-end relative">
                      <div 
                        className={`w-full rounded-t-xl transition-all duration-500 group-hover:brightness-95 shadow-sm ${data.color}`} 
                        style={{ height: data.height }}
                      />
                    </div>
                    <span className="text-[8px] text-slate-400 mt-4 font-black uppercase text-center leading-tight tracking-tighter w-full">
                      {data.month}
                    </span>
                  </div>
                ))}
              </div>
              
              <button className="w-full bg-[#dcfaff] text-[#0891b2] text-[11px] font-black py-5 rounded-[25px] uppercase tracking-[0.2em] transition-all hover:bg-cyan-200">
                + ADD OCCUPANTS
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;