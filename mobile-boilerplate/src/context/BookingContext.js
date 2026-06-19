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
  // App Roles: 'customer' or 'worker'
  const [userRole, setUserRole] = useState('customer');

  // Worker availability state
  const [isWorkerOnline, setIsWorkerOnline] = useState(false);

  // Active customer booking: null, or { service, subService, address, slot, description, status, price, provider }
  // Status stages: 'pending' (searching worker) -> 'assigned' (worker accepted) -> 'in_progress' -> 'completed'
  const [activeBooking, setActiveBooking] = useState(null);

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
        customerName: 'Ayesha Khan',
        customerPhone: '+92 321 9876543',
        distance: '1.2 km away',
      };
      setJobInvites([newInvite]);
      addLog(`Job dispatched to nearby workers: ${activeBooking.service} - ${activeBooking.subService}`);
    } else if (!activeBooking) {
      setJobInvites([]);
    }
  }, [activeBooking]);

  // Method to toggle roles (Customer vs Worker) for a unified view
  const switchRole = (role) => {
    setUserRole(role);
    addLog(`Switched user role view to: "${role.toUpperCase()}"`);
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
    addLog(`Customer raised new request ${newBooking.id} for "${newBooking.service}"`);
    return newBooking;
  };

  // Cancel current booking
  const cancelBooking = () => {
    if (activeBooking) {
      addLog(`Booking ${activeBooking.id} cancelled by Customer.`);
      setActiveBooking(null);
      setJobInvites([]);
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
  };

  return (
    <BookingContext.Provider
      value={{
        userRole,
        switchRole,
        isWorkerOnline,
        toggleWorkerOnline,
        activeBooking,
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
