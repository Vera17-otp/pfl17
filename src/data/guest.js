export const guests = Array.from({ length: 30 }, (_, i) => ({
    guestId: `GST-${2000 + i}`,
    guestName: [
        "Vera Zakia", "John Doe", "Siti Aminah", "Michael Chen", "Budi Santoso", 
        "Sarah Jenkins", "Ahmad Fauzi", "Elena Rodriguez", "Yuki Tanaka", "David Miller"
    ][i % 10] + (i > 9 ? ` ${Math.floor(i/10)}` : ""),
    email: `guest${i + 1}@example.com`,
    phone: `0812${1000000 + i}`,
    origin: ["Indonesia", "Singapore", "Australia", "Malaysia", "Japan"][i % 5],
    membership: ["Basic", "Silver", "Gold", "Platinum"][i % 4],
    totalStay: [2, 3, 5, 7, 10, 14][i % 6]  // <-- TAMBAHKAN INI
}));