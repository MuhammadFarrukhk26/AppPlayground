import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const STATE_FILE_PATH = path.join(process.cwd(), "haazir_state.json");

// Enable CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Middleware to parse json payload body
app.use(express.json());

// Type Declarations
interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "worker";
  specialty?: string;
  isLoggedIn?: boolean;
}

interface PriceConfig {
  base: number;
  work: number;
  tax: number;
  total: number;
}

interface ProviderMeta {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  rating: number;
  trips: number;
  specialty: string;
}

interface BookingState {
  id: string;
  service: string;
  serviceKey: string;
  subService: string;
  address: string;
  slot: string;
  description: string;
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  price: PriceConfig;
  provider: ProviderMeta | null;
  createdAt: string;
}

interface JobInvite {
  id: string;
  service: string;
  subService: string;
  address: string;
  slot: string;
  description: string;
  price: PriceConfig;
  customerName: string;
  customerPhone: string;
  distance: string;
}

interface ChatMessage {
  id: string;
  sender: "customer" | "worker";
  text: string;
  timestamp: string;
  bookingId?: string;
}

interface ActionLog {
  id: string;
  time: string;
  message: string;
  type: "customer" | "worker" | "system";
}

interface SystemState {
  activeBooking: BookingState | null;
  isWorkerOnline: boolean;
  jobInvites: JobInvite[];
  chatMessages: ChatMessage[];
  allBookings: BookingState[];
  customerUser: AppUser | null;
  workerUser: AppUser | null;
  usersDB: any[];
  logs: ActionLog[];
}

// Default initial state matching App.tsx setup
const DEFAULT_STATE: SystemState = {
  activeBooking: null,
  isWorkerOnline: true,
  jobInvites: [
    {
      id: "HZ-75412",
      service: "PLUMBER",
      subService: "Kitchen Sink Siphon & Drainage leak",
      address: "KDA Scheme 1, Block A, House 77, Karachi",
      slot: "Tomorrow, 11:30 AM",
      description: "Water dripping under kitchen sink, cabinet wood getting soft.",
      price: { base: 18, work: 12, tax: 2, total: 32 },
      customerName: "Imran Siddiqui",
      customerPhone: "+92 312 4567890",
      distance: "2.4 km"
    },
    {
      id: "HZ-99321",
      service: "ELECTRICIAN",
      subService: "Short circuit & distribution board sparking",
      address: "Clifton Block 4, Sea Breeze Apt, Flat C-5, Karachi",
      slot: "Today, ASAP Urgent",
      description: "Whenever ac is turned on, main circuit breaker trips immediately.",
      price: { base: 15, work: 25, tax: 2, total: 42 },
      customerName: "Zehra Naqvi",
      customerPhone: "+92 333 1122334",
      distance: "0.8 km"
    },
    {
      id: "HZ-51104",
      service: "AC_REPAIR",
      subService: "Split AC Gas Leakage test & Charging",
      address: "Gulshan-e-Iqbal, Block 5, House 102, Karachi",
      slot: "Tomorrow, 03:00 PM",
      description: "Fan blows normal air, cooling coil is freezing and ice dynamic forming.",
      price: { base: 20, work: 30, tax: 3, total: 53 },
      customerName: "Dr. Farhan",
      customerPhone: "+92 301 7766554",
      distance: "3.7 km"
    }
  ],
  chatMessages: [],
  allBookings: [
    {
      id: "HZ-89241",
      service: "ELECTRICIAN",
      serviceKey: "electrician",
      subService: "Ceiling Fan Repair & Swapping",
      address: "DHA Phase 5, Block T, House 42, Lahore",
      slot: "Yesterday, 04:00 PM",
      description: "The fan is making clicking noise and speed regulator is broken.",
      status: "completed",
      price: { base: 15, work: 20, tax: 2, total: 37 },
      provider: {
        id: "work-1",
        name: "Ahmed Kamal",
        avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80",
        phone: "0300-7654321",
        rating: 4.88,
        trips: 342,
        specialty: "Electrician Specialist",
      },
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "HZ-31045",
      service: "PLUMBER",
      serviceKey: "plumber",
      subService: "Master Bathroom Shower Mixer Leakage",
      address: "Bahria Town, Sector D, Villa 15, Lahore",
      slot: "3 days ago, 11:30 AM",
      description: "Minor drip from the hot water mixer spindle knob.",
      status: "cancelled",
      price: { base: 18, work: 15, tax: 2, total: 35 },
      provider: null,
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
  ],
  customerUser: {
    id: "cust-1",
    name: "Ayesha Khan",
    email: "ayesha@gmail.com",
    phone: "0300-1234567",
    role: "customer",
    isLoggedIn: true,
  },
  workerUser: {
    id: "work-1",
    name: "Ahmed Kamal",
    email: "ahmed@gmail.com",
    phone: "0300-7654321",
    role: "worker",
    specialty: "Electrician",
    isLoggedIn: true,
  },
  usersDB: [
    { id: "cust-1", name: "Ayesha Khan", email: "ayesha@gmail.com", phone: "0300-1234567", password: "123", role: "customer" },
    { id: "work-1", name: "Ahmed Kamal", email: "ahmed@gmail.com", phone: "0300-7654321", password: "123", role: "worker", specialty: "Electrician" },
  ],
  logs: [
    {
      id: "log-init-1",
      time: new Date().toLocaleTimeString(),
      message: "Haazir Real-time Production Core Server booted successfully.",
      type: "system",
    },
    {
      id: "log-init-2",
      time: new Date().toLocaleTimeString(),
      message: "Technician Ahmed Kamal is configured active & ONLINE.",
      type: "worker",
    },
  ],
};

let serverState: SystemState = { ...DEFAULT_STATE };

// Load State from file if exists
const loadState = () => {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const content = fs.readFileSync(STATE_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object" && "usersDB" in parsed) {
        serverState = parsed;
        console.log("Central server state loaded successfully from disk.");
        return;
      }
    }
  } catch (error) {
    console.error("Failed to read server state from disk:", error);
  }
  // Fallback to default
  serverState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  saveState();
};

// Save State helper
const saveState = () => {
  try {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(serverState, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write server state to disk:", error);
  }
};

// Helper: Append a server activity log
const addServerLog = (message: string, type: "customer" | "worker" | "system") => {
  const uniqueId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  serverState.logs = [
    {
      id: uniqueId,
      time: new Date().toLocaleTimeString(),
      message,
      type,
    },
    ...serverState.logs,
  ];
  saveState();
};

// Initialize State
loadState();

/* ========================================== */
/* EXPRESS API ENDPOINTS FOR HAAZIR BACKEND  */
/* ========================================== */

// Get current system state
app.get("/api/state", (req, res) => {
  res.json(serverState);
});

// Reset system state to default configurations
app.post("/api/state/reset", (req, res) => {
  serverState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  serverState.logs = [
    {
      id: `log-reset-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      message: "Server environment state reset back to default presets.",
      type: "system",
    },
  ];
  saveState();
  res.json({ success: true, state: serverState });
});

// Register / Create Account
app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, password, role, specialty } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ success: false, error: "Required fields missing." });
  }

  const formattedEmail = email.trim().toLowerCase();
  const exists = serverState.usersDB.some(
    (u) => u.email === formattedEmail && u.role === role
  );

  if (exists) {
    return res.status(409).json({ success: false, error: "This email is already registered." });
  }

  const newId = `${role === "customer" ? "cust" : "work"}-${Date.now()}`;
  const newUserRecord = {
    id: newId,
    name: name || (role === "customer" ? "New Client" : "New Specialist"),
    email: formattedEmail,
    phone: phone || (role === "customer" ? "0300-1111111" : "0300-2222222"),
    password,
    role,
    ...(role === "worker" ? { specialty: specialty || "Electrician" } : {}),
  };

  serverState.usersDB.push(newUserRecord);

  const loggedUser: AppUser = {
    id: newUserRecord.id,
    name: newUserRecord.name,
    email: newUserRecord.email,
    phone: newUserRecord.phone,
    role: newUserRecord.role,
    isLoggedIn: true,
    ...(role === "worker" ? { specialty: newUserRecord.specialty } : {}),
  };

  if (role === "customer") {
    serverState.customerUser = loggedUser;
    addServerLog(`Customer registered: "${loggedUser.name}" (${loggedUser.email})`, "customer");
  } else {
    serverState.workerUser = loggedUser;
    addServerLog(`Specialist registered: "${loggedUser.name}" (${loggedUser.specialty})`, "worker");
  }

  saveState();
  res.json({ success: true, user: loggedUser });
});

// Login Account
app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ success: false, error: "Required fields missing." });
  }

  const formattedEmail = email.trim().toLowerCase();
  const matched = serverState.usersDB.find(
    (u) => u.email === formattedEmail && u.password === password && u.role === role
  );

  if (!matched) {
    return res.status(401).json({
      success: false,
      error: `Invalid credentials. Double check password or use quick-fill pre-loader.`,
    });
  }

  const loggedUser: AppUser = {
    id: matched.id,
    name: matched.name,
    email: matched.email,
    phone: matched.phone,
    role: matched.role,
    isLoggedIn: true,
    ...(role === "worker" ? { specialty: matched.specialty } : {}),
  };

  if (role === "customer") {
    serverState.customerUser = loggedUser;
    addServerLog(`Customer logged in: "${loggedUser.name}"`, "customer");
  } else {
    serverState.workerUser = loggedUser;
    addServerLog(`Specialist logged in: "${loggedUser.name}"`, "worker");
  }

  saveState();
  res.json({ success: true, user: loggedUser });
});

// Logout Account
app.post("/api/auth/logout", (req, res) => {
  const { role } = req.body;
  if (role === "customer") {
    const oldName = serverState.customerUser?.name || "Customer";
    serverState.customerUser = null;
    addServerLog(`Customer "${oldName}" signed out.`, "customer");
  } else {
    const oldName = serverState.workerUser?.name || "Worker";
    serverState.workerUser = null;
    serverState.isWorkerOnline = false;
    serverState.jobInvites = [];
    addServerLog(`Worker "${oldName}" signed out & marked OFFLINE.`, "worker");
  }

  saveState();
  res.json({ success: true });
});

// Create active booking request for a specialist
app.post("/api/bookings/create", (req, res) => {
  const { categoryKey, issue, address, slot, comments } = req.body;

  if (!categoryKey || !address || !slot) {
    return res.status(400).json({ success: false, error: "Missing required booking details." });
  }

  const orderId = `HZ-${Math.floor(100000 + Math.random() * 90000)}`;
  const baseVal = categoryKey === "cctv" ? 25 : categoryKey === "electrician" ? 15 : categoryKey === "plumber" ? 18 : 20;
  const workVal = Math.floor(Math.random() * 15) + 15;
  const taxVal = Math.round((baseVal + workVal) * 0.05);
  const totalVal = baseVal + workVal + taxVal;

  const newBooking: BookingState = {
    id: orderId,
    service: categoryKey.toUpperCase(),
    serviceKey: categoryKey,
    subService: issue || "General Maintenance Diagnosis",
    address,
    slot,
    description: comments || "No comments specified",
    status: "pending",
    price: {
      base: baseVal,
      work: workVal,
      tax: taxVal,
      total: totalVal,
    },
    provider: null,
    createdAt: new Date().toISOString(),
  };

  serverState.activeBooking = newBooking;
  // Also push to historical allBookings list
  serverState.allBookings = [newBooking, ...serverState.allBookings];

  addServerLog(`Customer raised new labor request ${orderId} for "${newBooking.subService}"`, "customer");

  // If worker is online, automatically dispatch invitation
  if (serverState.isWorkerOnline) {
    const inviteJob: JobInvite = {
      id: orderId,
      service: newBooking.service,
      subService: newBooking.subService,
      address: newBooking.address,
      slot: newBooking.slot,
      description: newBooking.description,
      price: newBooking.price,
      customerName: serverState.customerUser?.name || "Ayesha Khan",
      customerPhone: serverState.customerUser?.phone || "+92 321 9876543",
      distance: "1.2 km",
    };
    serverState.jobInvites = [inviteJob];
    addServerLog(`Pub/Sub gateway dispatched Job offer ${orderId} to nearby specialists`, "system");
  }

  saveState();
  res.json({ success: true, booking: newBooking });
});

// Cancel active booking request
app.post("/api/bookings/cancel", (req, res) => {
  if (serverState.activeBooking) {
    const cancelId = serverState.activeBooking.id;
    addServerLog(`Customer withdrew and cancelled service ticket ${cancelId}`, "customer");

    // Update status in history too
    serverState.allBookings = serverState.allBookings.map((b) =>
      b.id === cancelId ? { ...b, status: "cancelled" as const } : b
    );

    serverState.activeBooking = null;
    serverState.jobInvites = [];
    serverState.chatMessages = [];
    saveState();
    return res.json({ success: true });
  }

  res.status(404).json({ success: false, error: "No active booking is currently running." });
});

// Toggle worker availability state
app.post("/api/worker/toggle-online", (req, res) => {
  const { isOnline } = req.body;
  if (typeof isOnline !== "boolean") {
    return res.status(400).json({ success: false, error: "Invalid isOnline value." });
  }

  serverState.isWorkerOnline = isOnline;
  const wName = serverState.workerUser?.name || "Ahmed Kamal";
  addServerLog(`${wName} toggled status to: ${isOnline ? "ONLINE" : "OFFLINE"}`, "worker");

  if (!isOnline) {
    serverState.jobInvites = [];
  } else {
    const activeInvites = [];
    if (serverState.activeBooking && serverState.activeBooking.status === "pending") {
      // Dispatch active pending jobs
      const inviteJob: JobInvite = {
        id: serverState.activeBooking.id,
        service: serverState.activeBooking.service,
        subService: serverState.activeBooking.subService,
        address: serverState.activeBooking.address,
        slot: serverState.activeBooking.slot,
        description: serverState.activeBooking.description,
        price: serverState.activeBooking.price,
        customerName: serverState.customerUser?.name || "Ayesha Khan",
        customerPhone: serverState.customerUser?.phone || "+92 321 9876543",
        distance: "1.2 km",
      };
      activeInvites.push(inviteJob);
      addServerLog(`Re-dispatched active pending ticket ${serverState.activeBooking.id} to newly online Worker`, "system");
    }

    const simulatedStandby = [
      {
        id: "HZ-75412",
        service: "PLUMBER",
        subService: "Kitchen Sink Siphon & Drainage leak",
        address: "KDA Scheme 1, Block A, House 77, Karachi",
        slot: "Tomorrow, 11:30 AM",
        description: "Water dripping under kitchen sink, cabinet wood getting soft.",
        price: { base: 18, work: 12, tax: 2, total: 32 },
        customerName: "Imran Siddiqui",
        customerPhone: "+92 312 4567890",
        distance: "2.4 km"
      },
      {
        id: "HZ-99321",
        service: "ELECTRICIAN",
        subService: "Short circuit & distribution board sparking",
        address: "Clifton Block 4, Sea Breeze Apt, Flat C-5, Karachi",
        slot: "Today, ASAP Urgent",
        description: "Whenever ac is turned on, main circuit breaker trips immediately.",
        price: { base: 15, work: 25, tax: 2, total: 42 },
        customerName: "Zehra Naqvi",
        customerPhone: "+92 333 1122334",
        distance: "0.8 km"
      },
      {
        id: "HZ-51104",
        service: "AC_REPAIR",
        subService: "Split AC Gas Leakage test & Charging",
        address: "Gulshan-e-Iqbal, Block 5, House 102, Karachi",
        slot: "Tomorrow, 03:00 PM",
        description: "Fan blows normal air, cooling coil is freezing and ice dynamic forming.",
        price: { base: 20, work: 30, tax: 3, total: 53 },
        customerName: "Dr. Farhan",
        customerPhone: "+92 301 7766554",
        distance: "3.7 km"
      }
    ];

    serverState.jobInvites = [
      ...activeInvites,
      ...simulatedStandby.filter(s => {
        const found = serverState.allBookings.find(b => b.id === s.id);
        return !found || found.status === "pending";
      })
    ];
  }

  saveState();
  res.json({ success: true, isWorkerOnline: serverState.isWorkerOnline, jobInvites: serverState.jobInvites });
});

// Worker accepts job offer
app.post("/api/worker/accept-job", (req, res) => {
  const { id } = req.body;
  
  // Find structural booking in allBookings
  const booking = serverState.allBookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ success: false, error: "No matching pending job request available in database records." });
  }

  const wName = serverState.workerUser?.name || "Ahmed Kamal";
  const providerInfo = {
    id: serverState.workerUser?.id || "work-1",
    name: wName,
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80",
    phone: serverState.workerUser?.phone || "0300-7654321",
    rating: 4.88,
    trips: 342,
    specialty: `${serverState.workerUser?.specialty || "Electrician"} Specialist`,
  };

  booking.status = "assigned";
  booking.provider = providerInfo;

  // Update in global activeBooking if it matches
  if (serverState.activeBooking && serverState.activeBooking.id === id) {
    serverState.activeBooking.status = "assigned";
    serverState.activeBooking.provider = providerInfo;
  }

  // Remove accepted job ID from job invites (keep other invites in list!)
  serverState.jobInvites = serverState.jobInvites.filter((invite) => invite.id !== id);

  // Seed welcome messaging for this booking
  const welcomeStr = `Assalam-o-Alaikum! My name is ${wName}. I have accepted your request. I am gathering my tools and will head to your location shortly.`;
  const welcomeMsg = {
    id: `welcome-${id}-${Date.now()}`,
    sender: "worker" as const,
    text: welcomeStr,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    bookingId: id,
  };
  serverState.chatMessages.push(welcomeMsg);

  addServerLog(`Worker ${wName} ACCEPTED Job ${id}. Status advanced to ASSIGNED.`, "worker");
  saveState();

  res.json({ success: true, booking, chatMessages: serverState.chatMessages });
});

// Worker declines job offer
app.post("/api/worker/decline-job", (req, res) => {
  const { id } = req.body;
  const wName = serverState.workerUser?.name || "Ahmed Kamal";
  
  // Remove from invitations
  serverState.jobInvites = serverState.jobInvites.filter((invite) => invite.id !== id);

  addServerLog(`Worker ${wName} DECLINED Job ticket ${id}. Searching alternate providers.`, "worker");
  saveState();
  res.json({ success: true, jobInvites: serverState.jobInvites });
});

// Worker advances job status ('assigned' -> 'in_progress' -> 'completed')
app.post("/api/worker/advance-job", (req, res) => {
  const { id } = req.body;
  
  let targetId = id;
  if (!targetId) {
    // Look up the first active booking that is assigned to the current worker
    const activeAssigned = serverState.allBookings.find(b => 
      b.provider?.id === (serverState.workerUser?.id || "work-1") && 
      (b.status === "assigned" || b.status === "in_progress")
    );
    targetId = activeAssigned ? activeAssigned.id : (serverState.activeBooking ? serverState.activeBooking.id : null);
  }

  if (!targetId) {
    return res.status(404).json({ success: false, error: "No active booking running or assigned in queue." });
  }

  const booking = serverState.allBookings.find(b => b.id === targetId);
  if (!booking) {
    return res.status(404).json({ success: false, error: "Booking record was not found." });
  }

  const wName = serverState.workerUser?.name || "Ahmed Kamal";
  const currentStatus = booking.status;

  if (currentStatus === "assigned") {
    booking.status = "in_progress";
    addServerLog(`Worker ${wName} arrived on-site for Job ${targetId}. Session status updated to IN_PROGRESS.`, "worker");
  } else if (currentStatus === "in_progress") {
    booking.status = "completed";
    addServerLog(`Worker ${wName} resolved repair on-site for Job ${targetId}. Completed, bill invoice generated.`, "worker");
  }

  // Ensure mirrored to activeBooking if matching
  if (serverState.activeBooking && serverState.activeBooking.id === targetId) {
    serverState.activeBooking.status = booking.status;
  }

  saveState();
  res.json({ success: true, booking, allBookings: serverState.allBookings });
});

// Customer rate and archive booking
app.post("/api/bookings/rate", (req, res) => {
  const { stars, feedback, id } = req.body;
  const targetId = id || (serverState.activeBooking ? serverState.activeBooking.id : null);

  if (!targetId) {
    return res.status(404).json({ success: false, error: "No active booking exists to rate." });
  }

  const booking = serverState.allBookings.find(b => b.id === targetId);
  if (booking) {
    booking.status = "completed";
  }

  addServerLog(`Customer rated Job ${targetId} (${stars} Stars). Comments: "${feedback || "Perfect service"}"`, "customer");
  addServerLog(`Transaction ${targetId} successfully completed and archived.`, "system");

  // Keep it archived in allBookings, but clean active state if matching
  if (serverState.activeBooking && serverState.activeBooking.id === targetId) {
    serverState.activeBooking = null;
  }
  
  // Clean related chat messages if they belonged to this booking
  serverState.chatMessages = serverState.chatMessages.filter(msg => msg.bookingId !== targetId);

  saveState();
  res.json({ success: true, allBookings: serverState.allBookings });
});

// Send Chat Message
app.post("/api/chat/send", (req, res) => {
  const { sender, text, bookingId } = req.body;
  if (!sender || !text) {
    return res.status(400).json({ success: false, error: "Sender and text values are required." });
  }

  const resolvedBookingId = bookingId || (serverState.activeBooking ? serverState.activeBooking.id : undefined);

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    sender,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    bookingId: resolvedBookingId,
  };

  serverState.chatMessages.push(newMessage);

  const senderName =
    sender === "customer"
      ? serverState.customerUser?.name || "Customer Ayesha Khan"
      : serverState.workerUser?.name || "Specialist Ahmed";

  addServerLog(`${senderName} sent message for Job ${resolvedBookingId || "General"}: "${text}"`, sender);
  saveState();

  res.json({ success: true, message: newMessage, chatMessages: serverState.chatMessages });
});

// Add custom simulation/system log
app.post("/api/logs/add", (req, res) => {
  const { message, type } = req.body;
  if (!message || !type) {
    return res.status(400).json({ success: false, error: "Missing message or type." });
  }

  addServerLog(message, type);
  res.json({ success: true, logs: serverState.logs });
});

/* ========================================== */
/* VITE MIDDLEWARE & STATIC ASSET DELIVERY    */
/* ========================================== */

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();
