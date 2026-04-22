import React from "react";

const Admin = ({ data }) => {
  return (
    <div className="p-8 lg:p-12 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-slate-900">Admin Dashboard</h2>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200">
          + Add Fleet
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Specification</th>
                <th className="px-8 py-6">Pricing</th>
                <th className="px-8 py-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img src={item.image} className="w-12 h-12 rounded-xl object-cover" />
                      <p className="font-bold text-slate-800">{item.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-600">
                    {item.details.vehicle.model} ({item.details.vehicle.capacity})
                  </td>
                  <td className="px-8 py-6 font-bold">IDR {item.details.pricing.rate.toLocaleString()}</td>
                  <td className="px-8 py-6 text-center">
                    <button className="text-blue-600 font-bold mr-4">Edit</button>
                    <button className="text-red-500 font-bold">Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;