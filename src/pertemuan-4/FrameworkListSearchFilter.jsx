import React, { useState } from "react";
import frameworkData from "./framework.json";

// Gunakan 'export default' di sini
export default function FrameworkListSearchFilter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const allTags = [...new Set(frameworkData.flatMap((f) => f.tags || []))];

  const filteredData = frameworkData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag ? item.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Airport <span className="text-blue-600">Transfer</span></h1>
        <p className="text-slate-500">Pilih armada jemputan bandara terbaik untuk kenyamanan Anda.</p>
      </div>

      {/* Search & Filter */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Cari armada..."
          className="flex-1 p-4 rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none"
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
        </select>
      </div>

      {/* Grid Card (Materi Pertemuan 4) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredData.map((item) => (
          <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 group">
            <div className="h-52 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{item.name}</h3>
              <p className="text-slate-500 text-xs mb-4 line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <span className="font-black text-blue-600 text-lg">IDR {item.details.pricing.rate.toLocaleString()}</span>
                <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold">Booking</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}