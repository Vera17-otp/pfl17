export const reservations = Array.from({ length: 30 }, (_, i) => ({
    bookingId: `BOK-${5000 + i}`,
    guestName: [
        "Vera Zakia", "John Doe", "Siti Aminah", "Michael Chen", "Budi Santoso", 
        "Sarah Jenkins", "Ahmad Fauzi", "Elena Rodriguez", "Yuki Tanaka", "David Miller"
    ][i % 10] + (i > 9 ? ` ${Math.floor(i/10)}` : ""),
    roomNumber: `${100 + i}`,
    roomType: ["Deluxe Room", "Suite Room", "Double Bed", "Penthouse", "Single Room"][i % 5],
    status: ["Check-in", "Booked", "Check-out", "Cancelled"][i % 4],
    checkIn: `2026-05-${(i % 25) + 1}`,
    checkOut: `2026-05-${(i % 25) + 3}`,
    totalPayment: 550000 + (i * 125000) // Nama properti disamakan dengan Dashboard
}));