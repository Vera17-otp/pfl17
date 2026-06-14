export const rooms = Array.from({ length: 20 }, (_, i) => {
    const types = ["Standard", "Deluxe", "Suite", "Family"];
    const type = types[i % 4];
    const floor = Math.floor(i / 5) + 1; // 1 to 4 floors
    const capacity = [1, 2, 4, 4][i % 4];
    const price = 300000 + (i % 4 * 150000);
    const status = ["Available", "Occupied", "Dirty", "Maintenance"][i % 4];
    
    // default facilities based on type
    const facilities = ["WiFi", "AC"];
    if (type === "Deluxe" || type === "Suite" || type === "Family") {
        facilities.push("TV");
    }
    if (type === "Suite" || type === "Family") {
        facilities.push("Bathtub", "Minibar");
    }
    if (type === "Family") {
        facilities.push("Extra Bed");
    }
    
    return {
        roomId: `RM-${100 + i}`,
        roomNumber: `${floor}0${(i % 5) + 1}`, // e.g. 101, 102, 103, 104, 105, 201...
        type,
        floor,
        capacity,
        facilities,
        price,
        status,
        image: [
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2070&auto=format&fit=crop"
        ][i % 4]
    };
});