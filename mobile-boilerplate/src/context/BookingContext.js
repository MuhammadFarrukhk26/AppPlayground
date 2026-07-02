import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../services/api';
import { connectSocket, getSocket, disconnectSocket } from '../services/socket';

const SESSION_KEY = 'haazir_session'; // key used to store { token, user } in AsyncStorage

async function saveSession(token, user) {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
  } catch (err) {
    console.warn('[session] Failed to persist session:', err.message);
  }
}

async function loadSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('[session] Failed to load session:', err.message);
    return null;
  }
}

async function clearSession() {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.warn('[session] Failed to clear session:', err.message);
  }
}

// Create the context for managing booking and session state globally
export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  // Current logged in User (null if signed out). Comes from the backend after login/register.
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  // true while we're checking AsyncStorage for a saved session on first launch.
  // Screens should show a splash/loader instead of the auth form while this is true.
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  // App Roles: 'customer' or 'worker' (mirrors currentUser.role once logged in)
  const [userRole, setUserRole] = useState('customer');

  // Worker availability state (synced with backend via socket worker:goOnline/goOffline)
  const [isWorkerOnline, setIsWorkerOnline] = useState(false);

  // Active booking for this user, kept in sync in real time via the 'booking:updated' socket event.
  // Status stages: 'pending' (searching worker) -> 'assigned' -> 'in_progress' -> 'completed'
  const [activeBooking, setActiveBooking] = useState(null);

  // Chat message stream for the active booking, synced via 'chat:message' socket events.
  const [chatMessages, setChatMessages] = useState([]);

  // Incoming job invitations for the worker, populated via the 'job:new' socket event
  // (broadcast server-side to every online worker the instant a customer creates a booking).
  const [jobInvites, setJobInvites] = useState([]);

  // Completed bookings history, fetched from the backend.
  const [bookingHistory, setBookingHistory] = useState([]);

  // Local debug/log feed shown in the UI (kept client-side, not networked).
  const [actionLogs, setActionLogs] = useState([
    { id: '1', time: new Date().toLocaleTimeString(), message: 'Haazir Systems online. Welcome to On-Demand Service App.' }
  ]);

  // Keep a ref to currentUser/activeBooking for use inside socket handlers without re-subscribing.
  const currentUserRef = useRef(currentUser);
  const activeBookingRef = useRef(activeBooking);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  useEffect(() => { activeBookingRef.current = activeBooking; }, [activeBooking]);

  // On first mount: check AsyncStorage for a saved session and silently restore it,
  // so the user stays logged in across app restarts and device reboots.
  useEffect(() => {
    (async () => {
      try {
        const saved = await loadSession();
        if (saved?.token && saved?.user) {
          await afterAuthSuccess({ token: saved.token, user: saved.user });
        }
      } catch (err) {
        console.warn('[session] Restore failed:', err.message);
      } finally {
        setIsRestoringSession(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  const addLog = useCallback((message) => {
    setActionLogs((prev) => [
      { id: Date.now().toString(), time: new Date().toLocaleTimeString(), message },
      ...prev,
    ]);
  }, []);

  // ---------------------------------------------------------------------------
  // SOCKET WIRING — runs once we have a logged-in user with a token
  // ---------------------------------------------------------------------------
  const wireSocketListeners = useCallback((socket) => {
    socket.on('connect', () => {
      addLog('Realtime connection established with server.');
    });

    socket.on('disconnect', () => {
      addLog('Realtime connection lost. Attempting to reconnect...');
    });

    // A new job was broadcast to all online workers
    socket.on('job:new', ({ booking }) => {
      setJobInvites((prev) => {
        if (prev.some((inv) => inv.id === booking._id)) return prev;
        return [
          {
            id: booking._id,
            service: booking.service,
            subService: booking.subService,
            address: booking.address,
            slot: booking.slot,
            description: booking.description,
            price: booking.price,
            customerName: booking.customer?.name,
            customerPhone: booking.customer?.phone,
            distance: '1.2 km away',
          },
          ...prev,
        ];
      });
      addLog(`New job available: ${booking.service} - ${booking.subService || ''}`);
    });

    // Another worker accepted a job — remove it from this worker's invite list
    socket.on('job:taken', ({ bookingId }) => {
      setJobInvites((prev) => prev.filter((inv) => inv.id !== bookingId));
    });

    // The active booking changed status (assigned/in_progress/completed) on the server,
    // pushed to whichever participant (customer or worker) is connected — across any device.
    socket.on('booking:updated', ({ booking }) => {
      setActiveBooking(mapBookingFromServer(booking));
      setJobInvites((prev) => prev.filter((inv) => inv.id !== booking._id));
      addLog(`Booking ${booking._id} status changed to "${booking.status.toUpperCase()}"`);
    });

    // Real-time chat message from the other participant, delivered to whichever device they're on.
    socket.on('chat:message', (message) => {
      const mine = currentUserRef.current && message.sender === currentUserRef.current.id;
      setChatMessages((prev) => [
        ...prev,
        {
          id: message.id,
          sender: message.senderRole,
          text: message.text,
          time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (!mine) addLog(`[Chat] New message received.`);
    });

  }, [addLog]);

  // ---------------------------------------------------------------------------
  // AUTH
  // ---------------------------------------------------------------------------
  const afterAuthSuccess = useCallback(async ({ token, user }) => {
    setAuthToken(token);
    setCurrentUser(user);
    setUserRole(user.role);
    setAuthError(null);

    // Persist the session so the next app launch doesn't require re-login
    await saveSession(token, user);

    const socket = connectSocket(token);
    wireSocketListeners(socket);

    addLog(`User logged in: "${user.name}" as ${user.role.toUpperCase()}`);

    // Pull any in-flight booking/history this user already has, so a fresh app
    // launch on a second device immediately reflects current real state.
    try {
      const { booking } = await api.getActiveBooking();
      if (booking) setActiveBooking(mapBookingFromServer(booking));

      if (user.role === 'worker') {
        const { bookings } = await api.getJobInvites();
        setJobInvites(
          bookings.map((b) => ({
            id: b._id,
            service: b.service,
            subService: b.subService,
            address: b.address,
            slot: b.slot,
            description: b.description,
            price: b.price,
            customerName: b.customer?.name,
            customerPhone: b.customer?.phone,
            distance: '1.2 km away',
          }))
        );
      }

      const { bookings: history } = await api.getBookingHistory();
      setBookingHistory(history.map(mapBookingFromServer));
    } catch (err) {
      addLog(`Could not sync existing state: ${err.message}`);
    }
  }, [addLog, wireSocketListeners]);

  const loginUser = async (email, password) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const result = await api.login({ email, password });
      await afterAuthSuccess(result);
    } catch (err) {
      setAuthError(err.message);
      addLog(`Login failed: ${err.message}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const registerUser = async ({ name, phone, email, password, role, specialty }) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const result = await api.register({ name, phone, email, password, role, specialty });
      await afterAuthSuccess(result);
    } catch (err) {
      setAuthError(err.message);
      addLog(`Registration failed: ${err.message}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logoutUser = () => {
    const oldName = currentUser?.name || 'User';
    disconnectSocket();
    setAuthToken(null);
    clearSession();
    setCurrentUser(null);
    setChatMessages([]);
    setJobInvites([]);
    setActiveBooking(null);
    setIsWorkerOnline(false);
    addLog(`User "${oldName}" logged out.`);
  };

  // Method to toggle roles for local testing/demo purposes only.
  // NOTE: in production each account has a fixed role from registration;
  // this is kept for the existing "Switch to Worker View" UI affordance.
  const switchRole = (role) => {
    setUserRole(role);
    if (currentUser) {
      setCurrentUser((prev) => ({ ...prev, role }));
    }
    addLog(`Switched user role view to: "${role.toUpperCase()}"`);
  };

  // ---------------------------------------------------------------------------
  // CHAT — sent over the socket, persisted server-side, delivered to both participants
  // on whichever devices they're connected from.
  // ---------------------------------------------------------------------------
  const sendChatMessage = (sender, text) => {
    if (!text.trim() || !activeBooking) return;
    const socket = getSocket();
    if (!socket) {
      addLog('Cannot send message: not connected to server.');
      return;
    }

    socket.emit('chat:send', { bookingId: activeBooking.id, text }, (response) => {
      if (response?.error) {
        addLog(`Failed to send message: ${response.error}`);
      }
    });
  };

  // ---------------------------------------------------------------------------
  // BOOKINGS
  // ---------------------------------------------------------------------------
  const createBooking = async (serviceKey, subService, address, slot, description) => {
    try {
      const { booking } = await api.createBooking({
        service: serviceKey,
        subService: subService || 'General Maintenance',
        address: address || '',
        slot: slot || 'As soon as possible',
        description: description || '',
      });
      const mapped = mapBookingFromServer(booking);
      setActiveBooking(mapped);
      setChatMessages([]);
      addLog(`Customer raised new request ${mapped.id} for "${mapped.service}"`);
      return mapped;
    } catch (err) {
      addLog(`Failed to create booking: ${err.message}`);
      throw err;
    }
  };

  const cancelBooking = async () => {
    if (!activeBooking) return;
    try {
      await api.updateBookingStatus(activeBooking.id, 'cancelled');
      addLog(`Booking ${activeBooking.id} cancelled.`);
      setActiveBooking(null);
      setJobInvites([]);
      setChatMessages([]);
    } catch (err) {
      addLog(`Failed to cancel booking: ${err.message}`);
    }
  };

  // Toggle worker availability — optimistically updates local state immediately so
  // the switch responds instantly, then tells the server via socket. If the socket
  // isn't connected yet (e.g. still polling on Vercel), the UI still reflects intent.
  const toggleWorkerOnline = () => {
    const next = !isWorkerOnline;
    setIsWorkerOnline(next); // optimistic update — don't wait for server ack
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(next ? 'worker:goOnline' : 'worker:goOffline');
    } else {
      addLog('Socket not connected yet — status will sync when connection is established.');
    }
    addLog(`Worker toggled ${next ? 'ONLINE' : 'OFFLINE'}`);
  };

  // Worker flow: Accept an incoming Job Invitation
  const acceptJobInvite = async (inviteId) => {
    try {
      const { booking } = await api.acceptJob(inviteId);
      const mapped = mapBookingFromServer(booking);
      setActiveBooking(mapped);
      setJobInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
      setChatMessages([
        {
          id: 'welcome-msg',
          sender: 'worker',
          text: `Assalam-o-Alaikum! My name is ${mapped.provider?.name}. I have accepted your request. I am gathering my tools and will head to your location shortly.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      addLog(`Accepted job request ${inviteId}`);
    } catch (err) {
      addLog(`Failed to accept job: ${err.message}`);
    }
  };

  const declineJobInvite = (inviteId) => {
    setJobInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    addLog(`Declined job offer ${inviteId}`);
  };

  // Worker advances job stages: 'assigned' -> 'in_progress' -> 'completed'
  const advanceJobStatus = async () => {
    if (!activeBooking) return;
    const nextStatus = activeBooking.status === 'assigned' ? 'in_progress' : 'completed';
    try {
      await api.updateBookingStatus(activeBooking.id, nextStatus);
      addLog(`Booking status advanced to "${nextStatus.toUpperCase()}"`);
      // setActiveBooking is also updated via the 'booking:updated' socket event,
      // which is what actually keeps the customer's device in sync in real time.
    } catch (err) {
      addLog(`Failed to update job status: ${err.message}`);
    }
  };

  // Customer rates the service, resolving the booking and archiving it
  const submitCustomerRating = async (rating, feedback) => {
    if (!activeBooking) return;
    try {
      await api.updateBookingStatus(activeBooking.id, 'completed');
      const completedRecord = {
        ...activeBooking,
        rating,
        feedback: feedback || 'No written response.',
        completedAt: new Date().toISOString(),
      };
      setBookingHistory((prev) => [completedRecord, ...prev]);
      addLog(`Customer rated service (${rating} Stars). Transaction ${activeBooking.id} archived.`);
      setActiveBooking(null);
      setChatMessages([]);
    } catch (err) {
      addLog(`Failed to submit rating: ${err.message}`);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        currentUser,
        loginUser,
        registerUser,
        logoutUser,
        authError,
        isAuthLoading,
        isRestoringSession,
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

// Converts the backend's Booking document shape into the shape the existing screens expect.
function mapBookingFromServer(booking) {
  if (!booking) return null;
  return {
    id: booking._id,
    service: booking.service,
    subService: booking.subService,
    address: booking.address,
    slot: booking.slot,
    description: booking.description,
    status: booking.status,
    price: {
      base: booking.price,
      work: 0,
      tax: 0,
      total: booking.price,
    },
    provider: booking.worker
      ? {
          id: booking.worker._id,
          name: booking.worker.name,
          phone: booking.worker.phone,
          avatar: booking.worker.avatar,
          rating: booking.worker.rating,
          specialty: booking.worker.specialty,
        }
      : null,
    customerName: booking.customer?.name,
    customerPhone: booking.customer?.phone,
    createdAt: booking.createdAt,
  };
}

// Specialized custom hook to consume context with built-in runtime safety check
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be executed within a functional BookingProvider tree');
  }
  return context;
};
