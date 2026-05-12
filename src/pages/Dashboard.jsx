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
        <div className="p-3">
            {/* Header */}
            <div className="mb-3">
                <h1 className="text-base font-bold text-slate-700">GroomFolio</h1>
                <p className="text-[9px] text-slate-400">Vera Zakia</p>
            </div>

            {/* Occupants List - Full width */}
            <div className="bg-white rounded-lg border border-slate-100 shadow-sm mb-3">
                <div className="px-3 py-2 border-b border-slate-100">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Incoming occupants</span>
                </div>
                <div className="divide-y divide-slate-50">
                    {filteredReservations.slice(0, 6).map((res) => (
                        <div key={res.bookingId} className="px-3 py-2 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-700 text-xs">{res.guestName}</span>
                                    <span className="text-[7px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                                        {res.roomType === 'Deluxe' ? 'GROOMING' : res.roomType === 'Suite' ? 'DAYCARE' : 'BOARDING'}
                                    </span>
                                </div>
                                <div className="text-[8px] text-slate-400">Feb 12 - Feb 14</div>
                            </div>
                            <div className="text-right">
                                {res.status === 'Check-out' ? (
                                    <span className="text-[8px] font-medium text-green-600">$130 Paid</span>
                                ) : res.status === 'Booked' ? (
                                    <div>
                                        <span className="text-[8px] font-medium text-rose-500">Unpaid: $120</span>
                                        <button className="block text-[7px] text-blue-500 underline">Send Link</button>
                                    </div>
                                ) : (
                                    <span className="text-[8px] font-medium text-amber-600">Check-in</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2 Kolom: Calendar + Analytics */}
            <div className="grid grid-cols-2 gap-3">
                {/* Calendar */}
                <div className="bg-white rounded-lg border border-slate-100 p-2 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-600 text-[9px]">JANUARY 2022</span>
                        <div className="flex gap-0.5">
                            <button className="w-5 h-5 rounded bg-slate-100 text-[8px]">‹</button>
                            <button className="w-5 h-5 rounded bg-blue-500 text-white text-[8px]">›</button>
                        </div>
                    </div>
                    
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                        {['Mo','Tu','We','Th','Fr','Sa','Su'].map(day => (
                            <div key={day} className="text-[6px] font-bold text-slate-400 py-0.5">{day}</div>
                        ))}
                    </div>
                    
                    {/* Calendar dates */}
                    <div className="grid grid-cols-7 gap-0.5 text-center">
                        {[29,30,31,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28].slice(0, 28).map((date, i) => {
                            const percentages = [75,70,75,75,75,75,75,40,30,30,30,30,95,60,60,60,60,60,60,75,75,75,75,75,75,75,26,15];
                            return (
                                <div key={i} className="bg-slate-50 rounded p-0.5">
                                    <div className="text-[7px] font-bold text-slate-600">{date}</div>
                                    <div className="text-[6px] text-green-600">{percentages[i]}%</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Analytics */}
                <div className="bg-white rounded-lg border border-slate-100 p-2 shadow-sm">
                    <span className="font-bold text-slate-600 text-[9px] block mb-2">Analytics</span>
                    
                    <div className="space-y-2">
                        <div>
                            <div className="flex justify-between text-[8px] mb-0.5">
                                <span className="text-slate-500">Occupancy</span>
                                <span className="font-bold text-green-600">{occupancyRate}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${occupancyRate}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[8px] mb-0.5">
                                <span className="text-slate-500">Vacancy</span>
                                <span className="font-bold text-rose-400">{100 - occupancyRate}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-400 rounded-full" style={{ width: `${100 - occupancyRate}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <span className="font-bold text-slate-600 text-[9px] block mt-3 mb-2">Monthly Revenue</span>
                    <div className="flex items-end gap-2 h-16">
                        {['Oct','Nov','Dec','Jan','Feb'].map((month, i) => {
                            const heights = [28, 40, 52, 44, 34];
                            return (
                                <div key={month} className="flex-1 text-center">
                                    <div className="bg-blue-200 rounded-sm mx-auto hover:bg-blue-400 transition-all" style={{ height: `${heights[i]}px`, width: '90%' }}></div>
                                    <span className="text-[6px] text-slate-400 block mt-1">{month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Add Button */}
            <div className="mt-3">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-[9px] font-bold py-2 rounded-lg transition-all">
                    + ADD OCCUPANTS
                </button>
            </div>
        </div>
    );
}