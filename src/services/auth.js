export const getUsers = () => {
    return JSON.parse(localStorage.getItem("users")) || [];
};

export const saveUsers = (users) => {
    localStorage.setItem("users", JSON.stringify(users));
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("currentUser"));
};

export const setCurrentUser = (user) => {
    localStorage.setItem("currentUser", JSON.stringify(user));
};

export const logout = () => {
    localStorage.removeItem("currentUser");
};

export const getLikes = () => {
    return JSON.parse(localStorage.getItem("likes")) || {};
};

export const saveLikes = (likes) => {
    localStorage.setItem("likes", JSON.stringify(likes));
};

export const getProperties = () => {
    return JSON.parse(localStorage.getItem("properties")) || [];
};

export const saveProperties = (properties) => {
    localStorage.setItem("properties", JSON.stringify(properties));
};

export const getBookings = () => {
    return JSON.parse(localStorage.getItem("bookings")) || [];
};

export const saveBookings = (bookings) => {
    localStorage.setItem("bookings", JSON.stringify(bookings));
};

export const createBooking = (booking) => {
    const bookings = getBookings();
    bookings.push(booking);
    saveBookings(bookings);
    return booking;
};

export const getChats = () => {
    return JSON.parse(localStorage.getItem("chats")) || [];
};

export const saveChats = (chats) => {
    localStorage.setItem("chats", JSON.stringify(chats));
};

export const createChat = (chat) => {
    const chats = getChats();
    const existing = chats.find(c =>
        (c.userId === chat.userId && c.realtorId === chat.realtorId) ||
        (c.userId === chat.realtorId && c.realtorId === chat.userId)
    );

    if (existing) {
        return existing;
    }

    const newChat = {
        id: Date.now(),
        ...chat,
        messages: [],
        lastMessage: null,
        lastMessageTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        unread: 0
    };

    chats.push(newChat);
    saveChats(chats);
    return newChat;
};

export const addMessageToChat = (chatId, message) => {
    const chats = getChats();
    const chatIndex = chats.findIndex(c => c.id === chatId);

    if (chatIndex !== -1) {
        const newMessage = {
            id: Date.now(),
            ...message,
            timestamp: new Date().toISOString(),
            read: false
        };

        chats[chatIndex].messages.push(newMessage);
        chats[chatIndex].lastMessage = message.text;
        chats[chatIndex].lastMessageTime = new Date().toISOString();
        chats[chatIndex].unread = (chats[chatIndex].unread || 0) + 1;

        saveChats(chats);
        return newMessage;
    }
    return null;
};

export const getChatsForUser = (userId) => {
    const chats = getChats();
    return chats.filter(c => c.userId === userId || c.realtorId === userId);
};

export const markMessagesAsRead = (chatId, userId) => {
    const chats = getChats();
    const chatIndex = chats.findIndex(c => c.id === chatId);

    if (chatIndex !== -1) {
        chats[chatIndex].messages = chats[chatIndex].messages.map(m => {
            if (m.senderId !== userId) {
                return {...m, read: true };
            }
            return m;
        });
        chats[chatIndex].unread = 0;
        saveChats(chats);
    }
};

export const getCompletedDeals = () => {
    return JSON.parse(localStorage.getItem("completedDeals")) || [];
};

export const saveCompletedDeals = (deals) => {
    localStorage.setItem("completedDeals", JSON.stringify(deals));
};

export const completeBooking = (booking, reportData, files = []) => {
    const completedDeals = getCompletedDeals();
    const completedDeal = {
        ...booking,
        status: "completed",
        completedAt: new Date().toISOString(),
        report: {
            ...booking.report,
            ...reportData,
            files: files
        }
    };
    completedDeals.push(completedDeal);
    saveCompletedDeals(completedDeals);

    const bookings = getBookings();
    const updatedBookings = bookings.filter(b => b.id !== booking.id);
    saveBookings(updatedBookings);

    return completedDeal;
};

export const deleteBooking = (bookingId) => {
    const bookings = getBookings();
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    saveBookings(updatedBookings);
};

export const deleteChat = (chatId) => {
    const chats = getChats();
    const updatedChats = chats.filter(c => c.id !== chatId);
    saveChats(updatedChats);
};

export const getUserBookings = () => {
    return JSON.parse(localStorage.getItem("userBookings")) || [];
};

export const saveUserBookings = (bookings) => {
    localStorage.setItem("userBookings", JSON.stringify(bookings));
};

export const addUserBooking = (booking) => {
    const bookings = getUserBookings();
    bookings.push(booking);
    saveUserBookings(bookings);
    return booking;
};

export const cancelUserBooking = (bookingId) => {
    const bookings = getUserBookings();
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    saveUserBookings(updatedBookings);

    const allBookings = getBookings();
    const updatedAllBookings = allBookings.filter(b => b.id !== bookingId);
    saveBookings(updatedAllBookings);

    return updatedBookings;
};


export const getRatings = () => {
    return JSON.parse(localStorage.getItem("ratings")) || [];
};

export const saveRatings = (ratings) => {
    localStorage.setItem("ratings", JSON.stringify(ratings));
};

export const addRating = (rating) => {
    const ratings = getRatings();
    const newRating = {
        id: Date.now(),
        ...rating,
        createdAt: new Date().toISOString()
    };
    ratings.push(newRating);
    saveRatings(ratings);
    return newRating;
};

export const getRealtorRatings = (realtorId) => {
    const ratings = getRatings();
    return ratings.filter(r => r.realtorId === realtorId);
};

export const getRealtorAverageRating = (realtorId) => {
    const ratings = getRatings().filter(r => r.realtorId === realtorId);
    if (ratings.length === 0) return null;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / ratings.length).toFixed(1);
};


export const checkPropertyAvailability = (propertyId, startDate, endDate, excludeBookingId = null) => {
    const bookings = getBookings();
    const userBookings = getUserBookings();
    const allBookings = [...bookings, ...userBookings];

    const start = new Date(startDate);
    const end = new Date(endDate);

    const confirmedBookings = allBookings.filter(b =>
        b.propertyId === propertyId &&
        b.status === "confirmed" &&
        (excludeBookingId === null || b.id !== excludeBookingId)
    );

    for (const booking of confirmedBookings) {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);

        //пересечение дат
        const hasOverlap = (
            (start >= bookingStart && start <= bookingEnd) ||
            (end >= bookingStart && end <= bookingEnd) ||
            (start <= bookingStart && end >= bookingEnd)
        );

        if (hasOverlap) {
            return false;
        }
    }

    return true;
};

export const getPropertyBookedDates = (propertyId) => {
    const bookings = getBookings();
    const userBookings = getUserBookings();
    const allBookings = [...bookings, ...userBookings];

    const confirmedBookings = allBookings.filter(b =>
        b.propertyId === propertyId &&
        b.status === "confirmed"
    );

    return confirmedBookings.map(b => ({
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate)
    }));
};