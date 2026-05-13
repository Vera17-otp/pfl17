import { useState } from "react";
import { reservations } from "../data/reservations";

export default function Dashboard({ searchTerm = "" }) {
    const filteredReservations = reservations.filter((res) => {
        const search = searchTerm.toLowerCase();
        return (
            res.guestName.toLowerCase().includes(search) ||
            res.bookingId.toLowerCase().includes(search) ||
            res.roomNumber.includes(search)
        );
    });

    const totalOccupants = reservations.length;
    const checkedIn = reservations.filter(r => r.status === 'Check-in').length;
    const occupancyRate = Math.round((checkedIn / totalOccupants) * 100);

    return (
        <div className="p-4 md:p-6 w-full max-w-full">
            {/* Header - Ukuran Sedang */}
            <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">GroomFolio</h1>
                <p className="text-sm text-slate-500 mt-0.5">Vera Zakia • Manager</p>
            </div>

            {/* Occupants List - Full width */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
                <div className="px-4 py-3 border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Incoming occupants</span>
                    <span className="ml-2 text-xs text-slate-400">({filteredReservations.length} guests)</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {filteredReservations.slice(0, 6).map((res) => (
                        <div key={res.bookingId} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-slate-800 text-sm">{res.guestName}</span>
                                    <span className={`
                                        text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
                                        ${res.roomType === 'Deluxe' ? 'bg-indigo-100 text-indigo-700' : 
                                          res.roomType === 'Suite' ? 'bg-purple-100 text-purple-700' : 
                                          'bg-amber-100 text-amber-700'}
                                    `}>
                                        {res.roomType === 'Deluxe' ? 'GROOMING' : res.roomType === 'Suite' ? 'DAYCARE' : 'BOARDING'}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                    Room {res.roomNumber} • Feb 12 - Feb 14
                                </div>
                            </div>
                            <div className="text-right ml-4">
                                {res.status === 'Check-out' ? (
                                    <div>
                                        <span className="text-xs font-medium text-green-600">✓ $130 Paid</span>
                                    </div>
                                ) : res.status === 'Booked' ? (
                                    <div>
                                        <span className="text-xs font-medium text-rose-500">$120 Unpaid</span>
                                        <button className="block text-xs text-blue-500 hover:text-blue-700 underline mt-0.5">
                                            Send Link →
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-xs font-medium text-amber-600">● Check-in</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2 Kolom: Calendar + Analytics - Full width */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Calendar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-slate-700 text-sm">JANUARY 2026</span>
                        <div className="flex gap-1">
                            <button className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs transition-colors">←</button>
                            <button className="w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs transition-colors">→</button>
                        </div>
                    </div>
                    
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                            <div key={day} className="text-xs font-semibold text-slate-500 py-1">{day}</div>
                        ))}
                    </div>
                    
                    {/* Calendar dates */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {[29,30,31,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28].slice(0, 28).map((date, i) => {
                            const percentages = [75,70,75,75,75,75,75,40,30,30,30,30,95,60,60,60,60,60,60,75,75,75,75,75,75,75,26,15];
                            return (
                                <div key={i} className="bg-slate-50 hover:bg-slate-100 rounded-lg p-1 transition-colors cursor-pointer">
                                    <div className="text-sm font-semibold text-slate-700">{date}</div>
                                    <div className="text-[10px] font-medium text-green-600">{percentages[i]}%</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Analytics */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <span className="font-bold text-slate-700 text-sm block mb-3">Analytics</span>
                    
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-600">Occupancy Rate</span>
                                <span className="font-bold text-green-600">{occupancyRate}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${occupancyRate}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-600">Vacancy Rate</span>
                                <span className="font-bold text-rose-400">{100 - occupancyRate}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${100 - occupancyRate}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <span className="font-bold text-slate-700 text-sm block mt-4 mb-3">Monthly Revenue</span>
                    <div className="flex items-end gap-2 h-24">
                        {['Oct', 'Nov', 'Dec', 'Jan', 'Feb'].map((month, i) => {
                            const heights = [28, 40, 52, 44, 34];
                            return (
                                <div key={month} className="flex-1 text-center group">
                                    <div 
                                        className="bg-blue-400 rounded-md mx-auto hover:bg-blue-500 transition-all cursor-pointer group-hover:scale-105"
                                        style={{ height: `${heights[i]}px`, width: '80%' }}
                                    ></div>
                                    <span className="text-xs text-slate-500 block mt-1 font-medium">{month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Add Button */}
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow-md">
                + Add Occupants
            </button>
        </div>
    );
}