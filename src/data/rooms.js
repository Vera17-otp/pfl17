export const rooms = Array.from({ length: 20 }, (_, i) => ({
    roomId: `RM-${100 + i}`,
    roomNumber: `${101 + i}`,
    type: ["Single", "Double", "Deluxe", "Suite"][i % 4],
    price: 500000 + (i % 4 * 250000), // Harga variasi
    status: ["Available", "Occupied", "Dirty"][i % 3],
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop"
}));