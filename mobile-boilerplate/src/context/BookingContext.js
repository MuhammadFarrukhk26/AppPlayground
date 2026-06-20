import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context for managing booking and session state globally
export const BookingContext = createContext();

// Mock initial configurations
const SERVICES = {
  electrician: { title: 'Electrician', basePrice: 15, rating: 4.8 },
  plumber: { title: 'Plumber', basePrice: 18, rating: 4.7 },
  cctv: { title: 'CCTV Specialist', basePrice: 25, rating: 4.9 },
  appliance: { title: 'Appliance Repair', basePrice: 20, rating: 4.6 },
};

const MOCK_WORKER = {
  id: 'WKR-401',
  name: 'Ahmed Kamal',
  avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80',
  phone: '+92 300 1234567',
  rating: 4.88,
  trips: 342,
  specialty: 'Electrician & HVAC Specialist',
};

export const BookingProvider = ({ children }) => {
  // Current logged in User (null if signed out)
  const [currentUser, setCurrentUser] = useState({
    name: 'Ayesha Khan',
    phone: '+92 321 9876543',
    role: 'customer',
    email: 'ayesha@gmail.com',
  });

  // App Roles: 'customer' or 'worker'
  const [userRole, setUserRole] = useState('customer');

  // Worker availability state
  const [isWorkerOnline, setIsWorkerOnline] = useState(false);

  // Active customer booking: null, or { service, subService, address, slot, description, status, price, provider }
  // Status stages: 'pending' (searching worker) -> 'assigned' (worker accepted) -> 'in_progress' -> 'completed'
  const [activeBooking, setActiveBooking] = useState(null);

  // Chat message stream for active booking
  const [chatMessages, setChatMessages] = useState([]);

  // Incoming job applications/invitations for the service provider
  const [jobInvites, setJobInvites] = useState([]);

  // Completed bookings history (local log)
  const [bookingHistory, setBookingHistory] = useState([]);

  // Log summary of state transitions to feed the visualizer log
  const [actionLogs, setActionLogs] = useState([
    { id: '1', time: new Date().toLocaleTimeString(), message: 'Haazir Systems online. Welcome to On-Demand Service App.' }
  ]);

  const addLog = (message) => {
    setActionLogs((prev) => [
      { id: Date.now().toString(), time: new Date().toLocaleTimeString(), message },
      ...prev,
    ]);
  };

  // Auth helper methods
  const loginUser = (name, phone, role, email) => {
    const freshUser = {
      name: name || 'User',
      phone: phone || '+92 300 0000000',
      role: role || 'customer',
      email: email || 'user@haazir.com',
    };
    setCurrentUser(freshUser);
    setUserRole(role);
    addLog(`User logged in: "${freshUser.name}" as ${role.toUpperCase()}`);
  };

  const logoutUser = () => {
    const oldName = currentUser?.name || 'User';
    setCurrentUser(null);
    setChatMessages([]);
    setJobInvites([]);
    setIsWorkerOnline(false);
    addLog(`User "${oldName}" logged out.`);
  };

  // Sync state: When a new pending booking is created, make it available as a Job Invite for the Worker Flow
  useEffect(() => {
    if (activeBooking && activeBooking.status === 'pending') {
      const newInvite = {
        id: activeBooking.id,
        service: activeBooking.service,
        subService: activeBooking.subService,
        address: activeBooking.address,
        slot: activeBooking.slot,
        description: activeBooking.description,
        price: activeBooking.price,
        customerName: currentUser?.name || 'Ayesha Khan',
        customerPhone: currentUser?.phone || '+92 321 9876543',
        distance: '1.2 km away',
      };
      setJobInvites([newInvite]);
      addLog(`Job dispatched to nearby workers: ${activeBooking.service} - ${activeBooking.subService}`);
    } else if (!activeBooking) {
      setJobInvites([]);
    }
  }, [activeBooking, currentUser]);

  // Method to toggle roles (Customer vs Worker) for a unified view
  const switchRole = (role) => {
    setUserRole(role);
    if (currentUser) {
      setCurrentUser(prev => ({ ...prev, role }));
    }
    addLog(`Switched user role view to: "${role.toUpperCase()}"`);
  };

  // Chat support handler which triggers a realistic simulated technician reply after sending messages
  const sendChatMessage = (sender, text) => {
    if (!text.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMessage]);
    addLog(`[Chat] ${sender === 'customer' ? 'Customer' : 'Worker'}: "${text}"`);

    // Simulated response logic
    if (sender === 'customer' && activeBooking && activeBooking.provider) {
      setTimeout(() => {
        let replyText = "Ji, I am on my way. Be there in a few minutes.";
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('price') || lowerText.includes('rate') || lowerText.includes('money') || lowerText.includes('charges')) {
          replyText = "The base visit rate is PKR 1,500. Any extra materials/repair tasks will be quoted after diagnosing the site.";
        } else if (lowerText.includes('hello') || lowerText.includes('aoa') || lowerText.includes('assalam') || lowerText.includes('hi')) {
          replyText = "Assalam-o-Alaikum! Hope you are doing well. I have gathered my gear and am heading to your location.";
        } else if (lowerText.includes('where') || lowerText.includes('time') || lowerText.includes('late') || lowerText.includes('reaching')) {
          replyText = "I'm passing through the nearby boulevard in DHA, should reach your street in about 5 to 10 minutes.";
        } else if (lowerText.includes('ac') || lowerText.includes('fan') || lowerText.includes('leak') || lowerText.includes('short')) {
          replyText = "Understood. Please keep the main power switch turned off on that board for safety while I travel.";
        }

        setChatMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'worker',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        addLog(`[Chat] Worker Ahmed Kamal: "${replyText}"`);
      }, 1400);
    }
  };

  // Create a new Booking (initiated by customer)
  const createBooking = (serviceKey, subService, address, slot, description) => {
    const serviceInfo = SERVICES[serviceKey] || { title: serviceKey, basePrice: 20 };
    const basePrice = serviceInfo.basePrice;
    const workPrice = Math.floor(Math.random() * 15) + 15; // Simulated service fee
    const taxPrice = Math.round((basePrice + workPrice) * 0.05);
    const totalPrice = basePrice + workPrice + taxPrice;

    const newBooking = {
      id: `HZ-${Math.floor(100000 + Math.random() * 90000) || '92831'}`,
      service: serviceInfo.title,
      serviceKey,
      subService: subService || 'General Maintenance',
      address: address || 'DHA Phase 5, Lahore, Pakistan',
      slot: slot || 'As soon as possible',
      description: description || 'No comments provided.',
      status: 'pending',
      price: {
        base: basePrice,
        work: workPrice,
        tax: taxPrice,
        total: totalPrice,
      },
      provider: null,
      createdAt: new Date().toISOString(),
    };

    setActiveBooking(newBooking);
    setChatMessages([]);
    addLog(`Customer raised new request ${newBooking.id} for "${newBooking.service}"`);
    return newBooking;
  };

  // Cancel current booking
  const cancelBooking = () => {
    if (activeBooking) {
      addLog(`Booking ${activeBooking.id} cancelled by Customer.`);
      setActiveBooking(null);
      setJobInvites([]);
      setChatMessages([]);
    }
  };

  // Toggle Worker status (Online/Offline)
  const toggleWorkerOnline = () => {
    const nextState = !isWorkerOnline;
    setIsWorkerOnline(nextState);
    addLog(`Service Provider toggled availability to: ${nextState ? 'ONLINE' : 'OFFLINE'}`);
  };

  // Worker flow: Accept an incoming Job Invitation
  const acceptJobInvite = (inviteId) => {
    if (!activeBooking || activeBooking.id !== inviteId) return;

    // Transition booking condition to 'assigned' and assign mock provider
    const updatedBooking = {
      ...activeBooking,
      status: 'assigned',
      provider: MOCK_WORKER,
    };

    setActiveBooking(updatedBooking);
    setJobInvites([]); // Clear the invitation card now that it's accepted

    // Populate the beautiful initial chat log Welcome text
    setChatMessages([
      {
        id: 'welcome-msg',
        sender: 'worker',
        text: `Assalam-o-Alaikum! My name is ${MOCK_WORKER.name}. I have accepted your request. I am gathering my tools and will head to your location shortly.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);

    addLog(`Worker "${MOCK_WORKER.name}" ACCEPT_JOB for request ${inviteId}`);
  };

  // Worker flow: Decline an incoming invite
  const declineJobInvite = (inviteId) => {
    setJobInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    addLog(`Worker rejected/declined job offer ${inviteId}`);
  };

  // Worker advances job stages: 'assigned' -> 'in_progress' -> 'completed'
  const advanceJobStatus = () => {
    if (!activeBooking) return;

    let nextStatus = 'assigned';
    let message = '';

    if (activeBooking.status === 'assigned') {
      nextStatus = 'in_progress';
      message = `Worker "${MOCK_WORKER.name}" has ARRIVED and marked session: "IN_PROGRESS"`;
    } else if (activeBooking.status === 'in_progress') {
      nextStatus = 'completed';
      message = `Worker completed work. Session status updated to "COMPLETED"`;
    }

    setActiveBooking((prev) => ({
      ...prev,
      status: nextStatus,
    }));

    addLog(message);
  };

  // Customer rates the service, resolving the booking and archiving it
  const submitCustomerRating = (rating, feedback) => {
    if (!activeBooking) return;

    const completedRecord = {
      ...activeBooking,
      rating: rating,
      feedback: feedback || 'No written response.',
      completedAt: new Date().toISOString(),
    };

    setBookingHistory((prev) => [completedRecord, ...prev]);
    addLog(`Customer rated service (${rating} Stars). Transaction ${activeBooking.id} archived successfully.`);
    setActiveBooking(null); // Reset active state for next cycle
    setChatMessages([]);
  };

  return (
    <BookingContext.Provider
      value={{
        currentUser,
        loginUser,
        logoutUser,
        userRole,
        switchRole,
        isWorkerOnline,
        toggleWorkerOnline,
        activeBooking,
        chatMessages,
        sendChatMessage,
        jobInvites,
        bookingHistory,
        actionLogs,
        createBooking,
        cancelBooking,
        acceptJobInvite,
        declineJobInvite,
        advanceJobStatus,
        submitCustomerRating,
        addLog,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// Specialized custom hook to consume context with built-in runtime safety check
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be executed within a functional BookingProvider tree');
  }
  return context;
};
