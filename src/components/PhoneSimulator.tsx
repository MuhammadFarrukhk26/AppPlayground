import React, { useState } from 'react';
import { 
  Flashlight, 
  Droplet, 
  Video, 
  Construction, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle2, 
  User, 
  Phone, 
  MessageSquare, 
  ShieldAlert, 
  Send, 
  ChevronRight, 
  Power, 
  Activity, 
  ArrowRight, 
  X, 
  Bookmark, 
  Cpu, 
  Sliders, 
  ThumbsUp,
  Check,
  CheckCheck,
  Receipt,
  RotateCcw,
  Lock,
  Mail,
  UserPlus,
  LogIn,
  LogOut,
  Compass,
  Home,
  Briefcase,
  Calendar,
  XCircle,
  Sun,
  Moon,
  Bell,
  Download,
  HelpCircle
} from 'lucide-react';
import { BookingState, JobInvite, ActionLog, ChatMessage, AppUser } from '../types';
import { InProgressRouteMap } from './InProgressRouteMap';
import { LiveLocationMap } from './LiveLocationMap';
import { Analytics } from './Analytics';
import { WorkerProfile } from './WorkerProfile';
import { ReceiptModal } from './ReceiptModal';
import { HelpSupportModal } from './HelpSupportModal';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface PhoneSimulatorProps {
  role: 'customer' | 'worker';
  activeBooking: BookingState | null;
  allBookings?: BookingState[];
  isWorkerOnline: boolean;
  jobInvites: JobInvite[];
  chatMessages: ChatMessage[];
  currentUser: AppUser | null;
  onLogin: (email: string, password: string, isSignUp: boolean, details?: { name: string; phone: string; specialty?: string }) => Promise<{ success: boolean; error?: string }> | any;
  onLogout: () => void;
  onChangeRole?: (newRole: 'customer' | 'worker') => void;
  onSendMessage: (sender: 'customer' | 'worker', text: string, bookingId?: string) => void;
  onCreateBooking: (categoryKey: string, issue: string, address: string, slot: string, comments: string) => void;
  onCancelBooking: () => void;
  onToggleWorkerOnline: () => void;
  onAcceptJob: (id: string) => void;
  onDeclineJob: (id: string) => void;
  onAdvanceJob: (id?: string) => void;
  onSubmitRating: (stars: number, text: string, id?: string) => void;
}

/* ========================================================================= */
/* GRID-BASED GPS SIMULATION AND MAP COMPONENT                              */
/* ========================================================================= */
interface CoordinateGridMapProps {
  booking: BookingState;
}

export function CoordinateGridMap({ booking }: CoordinateGridMapProps) {
  // Coordinate assignments dynamically inferred based on preset addresses
  let customerPos = { x: 7, y: 3 };
  let workerStartPos = { x: 2, y: 8 };

  if (booking.address?.includes('Phase 5')) {
    customerPos = { x: 7, y: 3 };
    workerStartPos = { x: 2, y: 7 };
  } else if (booking.address?.includes('Phase 6')) {
    customerPos = { x: 8, y: 2 };
    workerStartPos = { x: 3, y: 8 };
  } else if (booking.address?.includes('Phase 8') || booking.address?.includes('Creek')) {
    customerPos = { x: 8, y: 7 };
    workerStartPos = { x: 1, y: 3 };
  }

  // Determine actual worker coordinates matching progress status
  let workerPos = { ...workerStartPos };
  if (booking.status === 'in_progress' || booking.status === 'completed') {
    workerPos = { ...customerPos };
  } else if (booking.status === 'assigned') {
    // Intermediate point along Manhattan path (move X first, then Y)
    workerPos = { x: Math.floor((customerPos.x + workerStartPos.x) / 2), y: workerStartPos.y };
  }

  // Draw discrete grid path steps (Manhattan path routing)
  const routePoints: { x: number; y: number }[] = [];
  if (booking.status !== 'pending') {
    let cursor = { ...workerStartPos };
    routePoints.push({ ...cursor });
    // Run X crawler
    while (cursor.x !== customerPos.x) {
      cursor.x += Math.sign(customerPos.x - cursor.x);
      routePoints.push({ ...cursor });
    }
    // Run Y crawler
    while (cursor.y !== customerPos.y) {
      cursor.y += Math.sign(customerPos.y - cursor.y);
      routePoints.push({ ...cursor });
    }
  }

  const isRoutePoint = (x: number, y: number) => {
    return routePoints.some(pt => pt.x === x && pt.y === y);
  };

  // Generate 10x10 coordinates matrix
  const gridSize = 10;
  const gridRows = [];
  for (let y = 0; y < gridSize; y++) {
    const cols = [];
    for (let x = 0; x < gridSize; x++) {
      cols.push({ x, y });
    }
    gridRows.push(cols);
  }

  // Calculate coordinates distance (Manhattan distance metric)
  const currentDistance = Math.abs(customerPos.x - workerPos.x) + Math.abs(customerPos.y - workerPos.y);
  const distanceKm = (currentDistance * 0.15).toFixed(2); // Grid step calibrated to ~150 meters

  return (
    <div className="bg-slate-900 border border-slate-205 text-white rounded-2xl p-3 shadow-3xs mb-4 select-none relative animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Dispatch Mesh Grid tracker</span>
        </div>
        <span className="text-[8px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-extrabold tracking-wide uppercase">
          Static Grid GPS
        </span>
      </div>

      <div className="flex flex-col items-center">
        {/* X axis grid labeling */}
        <div className="flex w-full pl-5 pr-1 mb-0.5 select-none">
          {Array.from({ length: gridSize }).map((_, x) => (
            <div key={x} className="flex-1 text-center text-slate-400 font-extrabold text-[8px]">
              {x}
            </div>
          ))}
        </div>

        <div className="flex w-full items-stretch relative">
          {/* Y axis grid labeling */}
          <div className="flex flex-col justify-around pr-1.5 text-right text-slate-400 font-extrabold text-[8px] w-4 select-none">
            {Array.from({ length: gridSize }).map((_, y) => (
              <div key={y} className="h-[18px] flex items-center justify-end">
                {y}
              </div>
            ))}
          </div>

          {/* Grid Box Layout */}
          <div className="flex-1 grid grid-cols-10 gap-0 border border-slate-250 bg-slate-950/95 overflow-hidden rounded-xl shadow-inner my-0.5">
            {gridRows.map((row, y) =>
              row.map((cell, x) => {
                const isCustomer = customerPos.x === x && customerPos.y === y;
                const isWorker = booking.status !== 'pending' && workerPos.x === x && workerPos.y === y;
                const isPath = isRoutePoint(x, y);
                const isStreet = x === 4 || y === 5; // Overlay dummy central streets

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`aspect-square border-[0.5px] border-slate-900 flex items-center justify-center relative ${
                      isStreet ? 'bg-slate-900/40' : ''
                    } ${isPath && booking.status !== 'pending' ? 'bg-teal-950/20' : ''}`}
                    style={{ height: '18px' }}
                  >
                    {/* Path routing dots */}
                    {isPath && !isCustomer && !isWorker && booking.status !== 'pending' && (
                      <div className="w-1 h-1 rounded-full bg-teal-500/80 z-10 animate-pulse" />
                    )}

                    {/* Faint dot for empty spaces */}
                    {!isCustomer && !isWorker && !isPath && (
                      <span className="text-[5px] text-slate-800 pointer-events-none">+</span>
                    )}

                    {/* Broadband signal waves when searching */}
                    {booking.status === 'pending' && Math.abs(x - customerPos.x) <= 2 && Math.abs(y - customerPos.y) <= 2 && (
                      <div className="absolute inset-0 bg-teal-500/5 animate-pulse" />
                    )}

                    {/* Customer Node */}
                    {isCustomer && (
                      <div className="relative z-20 flex items-center justify-center scale-90">
                        <span className="absolute w-4 h-4 bg-teal-400 rounded-full animate-ping opacity-35" />
                        <Home size={10} className="text-teal-400 fill-teal-950 shrink-0" />
                      </div>
                    )}

                    {/* Worker Node */}
                    {isWorker && (
                      <div className="relative z-30 flex items-center justify-center scale-90">
                        <span className="absolute w-4 h-4 bg-amber-500 rounded-full animate-ping opacity-35" />
                        <Compass size={10} className="text-amber-400 fill-amber-950 rotate-45 shrink-0" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grid Coordinates Metadata panel */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1 text-[8px] text-slate-500 leading-snug">
        <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-150">
          <div className="flex items-center gap-1 font-semibold">
            <span className="font-extrabold text-teal-600 block">■ Service Hub Base:</span>
            <span className="text-slate-700">[{customerPos.x}, {customerPos.y}] • ({booking.address?.split(',')[0]} Preset Area)</span>
          </div>
        </div>
        
        {booking.status !== 'pending' ? (
          <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-150">
            <div className="flex items-center gap-1 font-semibold">
              <span className="font-extrabold text-amber-600 block">▲ Specialist GPS Pin:</span>
              <span className="text-slate-700">[{workerPos.x}, {workerPos.y}] • ({booking.provider?.name.split(' ')[0]})</span>
            </div>
            <div className="font-extrabold text-slate-800">
              {booking.status === 'assigned' ? `⚡ ~${distanceKm} km approach` : '📍 Arrived '}
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-amber-50/50 p-1.5 rounded-lg border border-amber-100/50 animate-pulse">
            <div className="flex items-center gap-1 font-semibold">
              <span className="font-extrabold text-amber-600 block">📡 GSM Radar scan:</span>
              <span className="text-slate-650">Sourcing closest local worker in mesh coordinate...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CATEGORIES = [
  { key: 'electrician', title: 'Electrician', icon: Flashlight, color: 'text-teal-600 bg-teal-50 border-teal-100', rawColor: '#0D9488', banner: 'bg-teal-700' },
  { key: 'plumber', title: 'Plumber', icon: Droplet, color: 'text-teal-600 bg-teal-50 border-teal-100', rawColor: '#0D9488', banner: 'bg-teal-700' },
  { key: 'cctv', title: 'CCTV Expert', icon: Video, color: 'text-teal-600 bg-teal-50 border-teal-100', rawColor: '#0D9488', banner: 'bg-teal-700' },
  { key: 'appliance', title: 'Appliance Repair', icon: Construction, color: 'text-teal-600 bg-teal-50 border-teal-100', rawColor: '#0D9488', banner: 'bg-teal-700' },
];

const QUICK_ISSUES: Record<string, string[]> = {
  electrician: ['Ceiling Fan Repair', 'UPS Installation', 'Room Wiring Diagnostic', 'New Bracket Light Fix'],
  plumber: ['Water Pump Repair', 'Faucet Leaking', 'Drain Blockage Clear', 'Geyser Installation'],
  cctv: ['Camera Connection Lost', 'DVR Hard Disk Error', 'New CCTV System Setup', 'Outdoor Security Light'],
  appliance: ['AC Gas Refilling', 'Oven Heating Issue', 'Washing Machine Spin Fix', 'Refrigerator Defrost'],
};

const ADDR_PRESETS = [
  'DHA Phase 5, Block T, House 42, Lahore',
  'Gulberg III, Sector B-2, Apt 12, Lahore',
  'Bahria Town, Sector D, Villa 15, Lahore',
];

const SLOTS = [
  'As soon as possible (Urgent)',
  'Today (3:00 PM - 5:00 PM)',
  'Today (6:00 PM - 8:00 PM)',
  'Tomorrow (10:00 AM - 12:00 PM)'
];

const DEMAND_SLOTS = [
  { time: '09:00 AM - 11:00 AM', demand: 'low', label: 'Low Demand', speed: '🚀 Fast Match (<10 min)' },
  { time: '11:05 AM - 01:00 PM', demand: 'moderate', label: 'Moderate Demand', speed: '⏱️ Normal (15-20 min)' },
  { time: '01:05 PM - 03:00 PM', demand: 'low', label: 'Recommended Slot', speed: '🚀 Fast Match (<10 min)' },
  { time: '03:05 PM - 05:00 PM', demand: 'moderate', label: 'Moderate Demand', speed: '⏱️ Normal (15-20 min)' },
  { time: '05:30 PM - 07:30 PM', demand: 'peak', label: 'Peak Hour Demand', speed: '🔥 Delayed (30-45 min wait)' },
  { time: '08:00 PM - 10:00 PM', demand: 'moderate', label: 'Late Hours', speed: '⏱️ Normal (15-25 min)' }
];

const OUTCOME_DATA = [
  { name: 'Completed', value: 92, color: '#0d9488' },
  { name: 'Cancelled', value: 8, color: '#f43f5e' }
];

const COMPLETION_TREND_DATA = [
  { label: 'Wk 1', rate: 84 },
  { label: 'Wk 2', rate: 86 },
  { label: 'Wk 3', rate: 89 },
  { label: 'Wk 4', rate: 92 }
];

const CATEGORY_POPULARITY_DATA = [
  { name: 'Electrician', count: 145 },
  { name: 'Plumber', count: 108 },
  { name: 'HVAC Tech', count: 72 },
  { name: 'Carpenter', count: 36 }
];

const TRANSLATIONS = {
  en: {
    welcome: "Welcome to Haazir",
    customer_account: "Customer Account",
    vendor_portal: "Technician / Vendor Portal",
    hire_pro: "Hire a Pro",
    earn_pro: "Earn as a Pro",
    welcome_sub: "Let's match you with a localized, vetted specialist in minutes.",
    todays_cash: "Today's cash",
    accept_rate: "Accept rate",
    my_rating: "My Rating",
    nearby_jobs: "Nearby Job Requests",
    active_requests: "Active Requests",
    market_insights: "Market Insights",
    labor_analytics: "Labor Market Analytics",
    labor_desc: "Real-time platform completion levels and regional service popularity indexes analyzed for Lahore specialists.",
    completion_rate: "Your Completion Rate",
    job_trend: "Job Success Trend",
    category_popularity: "Active Category Popularity",
    search_placeholder: "Search 'Fan repair' or leak fixer...",
    select_category: "Select Service Category",
    choose_repair: "Choose customized repair coordinate tasks below:",
    contact_details: "Contact Details",
    full_name: "Full Name",
    active_mobile: "Active Mobile Number",
    target_address: "Coordinate Target Address",
    target_window: "Target Delivery Window",
    low_demand: "Low Demand",
    moderate_demand: "Moderate Demand",
    peak_demand: "Peak Hour Demand",
    matching_desc: "Connecting with an expert nearby",
    book_repair: "Book a Repair",
    match_pro: "Match Localized Pro",
    signing_up: "Create Account",
    logging_in: "Sign In",
    logout: "Log Off Portal",
    online: "Online",
    offline: "Offline",
    have_account: "Already have an account? Login",
    need_account: "Need an account? Sign Up",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    chat_client: "Chat Client",
    remarks: "Remarks",
    decline: "Decline",
    accept_job: "Accept Job",
    specialist_desc: "Lahore local certified home repairs",
    stage: "STAGE",
    rate_experience: "Share Your Experience",
    rate_detail: "Help maintain the best local technician roster",
    submit_feedback: "Submit Rating & Close",
    prefill_tags: "Quick tags",
    what_solved_well: "What did the technician solve particularly well?",
    remind_later: "Pay & View Bill first",
    star_rating_required: "Please select a star rating!"
  },
  ur: {
    welcome: "حاضر میں خوش آمدید",
    customer_account: "صارف اکاؤنٹ",
    vendor_portal: "ٹیکنیشن / وینر پورٹل",
    hire_pro: "کارکن تلاش کریں",
    earn_pro: "پیشہ ور بنیں",
    welcome_sub: "ہم آپ کو منٹوں میں قریبی اور تصدیق شدہ ماہر سے ملوائیں گے۔",
    todays_cash: "آج کی آمدنی",
    accept_rate: "قبولیت کی شرح",
    my_rating: "میری ریٹنگ",
    nearby_jobs: "کام کی قریبی درخواستیں",
    active_requests: "فعال درخواستیں",
    market_insights: "مارکیٹ معلومات",
    labor_analytics: "لیبر مارکیٹ کا تجزیہ",
    labor_desc: "لاہور کے ماہرین کے لیے حقیقی وقت کی تکمیل اور زمرہ کی مقبولیت کے اشارے کا تجزیہ۔",
    completion_rate: "آپ کی تکمیل کی شرح",
    job_trend: "شرحِ کامیابی کا رجحان",
    category_popularity: "سرگرم زمروں کی مقبولیت",
    search_placeholder: "پنکھا مرمت، پائپ لیکیج وغیرہ تلاش کریں...",
    select_category: "سروس کے زمرے کا انتخاب کریں",
    choose_repair: "مرمت کے حسب ضرورت کام کا انتخاب کریں:",
    contact_details: "رابطے کی تفصیلات",
    full_name: "پورا نام",
    active_mobile: "موبائل نمبر",
    target_address: "مقام کا پتہ",
    target_window: "وصولی کا وقت کا انتخاب",
    low_demand: "کم طلب",
    moderate_demand: "درمیانی طلب",
    peak_demand: "زیادہ طلب",
    matching_desc: "ہم آپ کو قریبی ماہر سے منسلک کر رہے ہیں",
    book_repair: "مرمت بک کریں",
    match_pro: "ماہر تلاش کریں",
    signing_up: "اکاؤنٹ بنائیں",
    logging_in: "لاگ ان کریں",
    logout: "لاگ آؤٹ کریں",
    online: "آن لائن",
    offline: "آف لائن",
    have_account: "پہلے سے اکاؤنٹ ہے؟ لاگ ان کریں",
    need_account: "اکاؤنٹ درکار ہے؟ رجسٹر کریں",
    active: "فعال",
    completed: "مکمل",
    cancelled: "منسوخ",
    chat_client: "کلائنٹ چیٹ",
    remarks: "تفصیلات / نوٹ",
    decline: "مسترد کریں",
    accept_job: "کام قبول کریں",
    specialist_desc: "لاہور کے تصدیق شدہ ہوم سروس اسپیشلسٹ",
    stage: "مرحلہ",
    rate_experience: "اپنا تجربہ شیئر کریں",
    rate_detail: "ماہرین کے بہترین انتخاب کو برقرار رکھنے میں مدد کریں",
    submit_feedback: "ریٹنگ جمع کروائیں",
    prefill_tags: "فوری ریٹنگ ٹیگز",
    what_solved_well: "ٹیکنیشن نے آپ کا کام کیسا کیا؟",
    remind_later: "پہلے بل دیکھیں اور ادائیگی کریں",
    star_rating_required: "برائے مہربانی ریٹنگ کے منتخب کریں!"
  }
};


export default function PhoneSimulator({
  role,
  activeBooking,
  allBookings = [],
  isWorkerOnline,
  jobInvites,
  chatMessages,
  currentUser,
  onLogin,
  onLogout,
  onChangeRole,
  onSendMessage,
  onCreateBooking,
  onCancelBooking,
  onToggleWorkerOnline,
  onAcceptJob,
  onDeclineJob,
  onAdvanceJob,
  onSubmitRating
}: PhoneSimulatorProps) {
  // Dark Mode / Low-light environment theme support
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');

  const t = (key: keyof typeof TRANSLATIONS['en']): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key];
  };

  const getCalendarDays = () => {
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = [];
    const baseDate = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(baseDate.getDate() + i);
      days.push({
        index: i,
        dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekdayNames[d.getDay()],
        dateStr: `${monthNames[d.getMonth()]} ${d.getDate()}`,
        dayNum: d.getDate(),
        fullLabel: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${weekdayNames[d.getDay()]} (${monthNames[d.getMonth()]} ${d.getDate()})`,
      });
    }
    return days;
  };

  const getBookingScheduledTime = (slotStr: string, createdAtStr?: string): Date | null => {
    const now = new Date();
    let targetDate = new Date(); // default to today
    
    // Let's check for day labels
    const calendarDays = getCalendarDays();
    let foundDay = false;
    for (const day of calendarDays) {
      if (slotStr.includes(day.dayLabel)) {
        targetDate.setDate(now.getDate() + day.index);
        foundDay = true;
        break;
      }
    }
    
    if (!foundDay) {
      if (slotStr.toLowerCase().includes('today')) {
        targetDate = new Date();
      } else if (slotStr.toLowerCase().includes('tomorrow')) {
        targetDate = new Date();
        targetDate.setDate(now.getDate() + 1);
      } else if (slotStr.toLowerCase().includes('yesterday')) {
        targetDate = new Date();
        targetDate.setDate(now.getDate() - 1);
      } else if (createdAtStr) {
        targetDate = new Date(createdAtStr);
      }
    }

    // Look for the first time match (representing scheduled starting window)
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const match = slotStr.match(timeRegex);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      targetDate.setHours(hours, minutes, 0, 0);
      return targetDate;
    } else if (slotStr.toLowerCase().includes('urgent') || slotStr.toLowerCase().includes('as soon as possible')) {
      if (createdAtStr) {
        return new Date(createdAtStr);
      }
      return now;
    }
    return null;
  };

  const isBookingWithin30Min = (booking: BookingState): boolean => {
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return false;
    }
    const schedTime = getBookingScheduledTime(booking.slot, booking.createdAt);
    if (!schedTime) return false;
    
    const now = new Date();
    const diffMs = schedTime.getTime() - now.getTime();
    const diffMins = diffMs / (1000 * 60); // minutes until scheduled job
    
    if (booking.slot.toLowerCase().includes('urgent') || booking.slot.toLowerCase().includes('as soon as possible')) {
      if (booking.createdAt) {
        const createdTime = new Date(booking.createdAt);
        const ageMins = (now.getTime() - createdTime.getTime()) / (1000 * 60);
        return ageMins >= 0 && ageMins <= 30;
      }
      return true;
    }
    
    return diffMins >= -120 && diffMins <= 30;
  };

  // Auth Form states
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authSpecialty, setAuthSpecialty] = useState('Electrician');
  const [authError, setAuthError] = useState('');

  // Navigation states for Customer
  const [customerScreen, setCustomerScreen] = useState<'home' | 'booking' | 'tracking' | 'payment' | 'completed' | 'bookings'>('home');
  const [selectedMapView, setSelectedMapView] = useState<'telemetry' | 'livelocation'>('telemetry');
  const [workerTab, setWorkerTab] = useState<'jobs' | 'insights' | 'analytics'>('jobs');
  const [showWorkerProfile, setShowWorkerProfile] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<BookingState | null>(null);
  const [bookingFilter, setBookingFilter] = useState<'Active' | 'Completed' | 'Cancelled'>('Active');
  const [selectedCatKey, setSelectedCatKey] = useState<string>('electrician');
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showBookingSuccessAnimation, setShowBookingSuccessAnimation] = useState(false);

  // Mapping of category keys to associated keywords for global search filter
  const CATEGORY_KEYWORDS: Record<string, string[]> = {
    electrician: ['fix', 'wire', 'wiring', 'fan', 'light', 'ups', 'short', 'current', 'switch', 'board', 'power', 'plug', 'holder', 'electrician', 'electric'],
    plumber: ['leak', 'leaking', 'water', 'pipe', 'faucet', 'drain', 'pump', 'geyser', 'toilet', 'flush', 'sink', 'basin', 'tap', 'washroom', 'plumber', 'plumbing', 'blockage'],
    cctv: ['camera', 'security', 'dvr', 'nvr', 'cctv', 'surveillance', 'monitoring', 'record', 'feed', 'video', 'view', 'cctv expert'],
    appliance: ['ac', 'gas', 'fridge', 'refrigerator', 'oven', 'microwave', 'washing', 'machine', 'dryer', 'cooler', 'cooling', 'heating', 'heat', 'compressor', 'fix', 'appliance', 'appliance repair']
  };

  const filteredCategories = CATEGORIES.filter(cat => {
    if (!customerSearchQuery) return true;
    const query = customerSearchQuery.toLowerCase().trim();
    
    // 1. Matches category title
    if (cat.title.toLowerCase().includes(query)) return true;
    
    // 2. Matches keywords
    const keywords = CATEGORY_KEYWORDS[cat.key] || [];
    if (keywords.some(kw => kw.includes(query) || query.includes(kw))) return true;

    // 3. Matches quick issues
    const issues = QUICK_ISSUES[cat.key] || [];
    if (issues.some(issue => issue.toLowerCase().includes(query))) return true;

    return false;
  });

  const handleSearchChange = (val: string) => {
    setCustomerSearchQuery(val);
    if (val) {
      const query = val.toLowerCase().trim();
      const firstMatched = CATEGORIES.find(cat => {
        if (cat.title.toLowerCase().includes(query)) return true;
        
        const keywords = CATEGORY_KEYWORDS[cat.key] || [];
        if (keywords.some(kw => kw.includes(query) || query.includes(kw))) return true;

        const issues = QUICK_ISSUES[cat.key] || [];
        if (issues.some(issue => issue.toLowerCase().includes(query))) return true;

        return false;
      });
      if (firstMatched) {
        setSelectedCatKey(firstMatched.key);
      }
    }
  };
  
  // Booking Form values
  const [customIssue, setCustomIssue] = useState('');
  const [address, setAddress] = useState(ADDR_PRESETS[0]);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [comments, setComments] = useState('');

  // Rating forms
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState('');
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);

  // Credit Card Payment Mockup States
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [paymentCardNumber, setPaymentCardNumber] = useState<string>('4242 4242 4242 4242');
  const [paymentCardName, setPaymentCardName] = useState<string>('AYESHA KHAN');
  const [paymentCardExpiry, setPaymentCardExpiry] = useState<string>('12/29');
  const [paymentCardCVV, setPaymentCardCVV] = useState<string>('543');
  const [paymentStatusState, setPaymentStatusState] = useState<'form' | 'processing' | 'success'>('form');
  const [cardFocusedField, setCardFocusedField] = useState<string>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('visa_xxxx');
  const [walletPhone, setWalletPhone] = useState<string>('0300-1122334');
  const [walletOTP, setWalletOTP] = useState<string>('');
  const [walletOTPSent, setWalletOTPSent] = useState<boolean>(false);

  // Chat interface visibility
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInputText, setChatInputText] = useState<string>('');

  // Track focused worker booking in dynamic simultaneous queue
  const [focusedWorkerBookingId, setFocusedWorkerBookingId] = useState<string | null>(null);

  // Compute the worker's assigned queue of active/assigned bookings
  const workerQueue = React.useMemo(() => {
    return allBookings.filter(b => 
      b.provider?.id === (currentUser?.id || 'work-1') && 
      (b.status === 'assigned' || b.status === 'in_progress')
    );
  }, [allBookings, currentUser]);

  // Determine which booking is currently selected/focused in the worker tab
  const focusedWorkerBooking = React.useMemo(() => {
    if (workerQueue.length === 0) return null;
    const found = workerQueue.find(b => b.id === focusedWorkerBookingId);
    return found || workerQueue[0];
  }, [workerQueue, focusedWorkerBookingId]);

  // Filter chat messages so they are kept separate and isolated per active booking ID
  const filteredChatMessages = React.useMemo(() => {
    if (role === 'customer') {
      if (!activeBooking) return chatMessages;
      return chatMessages.filter(msg => !msg.bookingId || msg.bookingId === activeBooking.id);
    } else {
      if (!focusedWorkerBooking) return chatMessages;
      return chatMessages.filter(msg => !msg.bookingId || msg.bookingId === focusedWorkerBooking.id);
    }
  }, [chatMessages, role, activeBooking, focusedWorkerBooking]);

  // Schedule Reminder State and Cache
  const notifiedScheduleRemindersRef = React.useRef<Record<string, boolean>>({});

  const reminderBookings = React.useMemo(() => {
    if (role !== 'customer') return [];
    return allBookings.filter(b => isBookingWithin30Min(b));
  }, [allBookings, role]);

  // Simulated push notification states
  const [toast, setToast] = useState<{ id: number; title: string; message: string; type: string } | null>(null);
  const [toastClass, setToastClass] = useState<string>('-translate-y-full opacity-0 scale-95');

  // Action to trigger a simulated push notification alert
  const triggerToast = (title: string, message: string, type: 'info' | 'success' | 'alert' | 'chat') => {
    const id = Date.now();
    setToast({ id, title, message, type });
    // Animate slide-down entrance
    setTimeout(() => {
      setToastClass('translate-y-0 opacity-100 scale-100');
    }, 40);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToastClass('-translate-y-full opacity-0 scale-95');
      setTimeout(() => {
        setToast(prev => prev?.id === id ? null : prev);
      }, 300);
    }, 4000);
  };

  // Sync refs to avoid duplicated system alerts on startup
  const prevStatusRef = React.useRef<string | undefined>(undefined);
  const prevBookingIdRef = React.useRef<string | undefined>(undefined);
  const prevMessagesLengthRef = React.useRef<number>(0);
  const prevJobInvitesLengthRef = React.useRef<number>(0);
  const prevRoleRef = React.useRef<string>(role);

  // Initialize previous states so they don't trigger alerts for post-load history
  React.useEffect(() => {
    if (activeBooking) {
      prevStatusRef.current = activeBooking.status;
      prevBookingIdRef.current = activeBooking.id;
    }
    prevMessagesLengthRef.current = chatMessages.length;
    prevJobInvitesLengthRef.current = jobInvites.length;
  }, []);

  // Listen to bookings, status updates, new invites, and chat streams
  React.useEffect(() => {
    // 1. Detect Booking Status Transitions
    if (activeBooking) {
      if (prevBookingIdRef.current !== activeBooking.id) {
        // This is a brand new booking
        if (role === 'customer' && activeBooking.status === 'pending') {
          triggerToast(
            'Booking Request Broadcasted! 🔊',
            `Looking for a nearby ${activeBooking.service} specialist...`,
            'info'
          );
        }
      } else if (prevStatusRef.current !== activeBooking.status) {
        // Status transitioned!
        if (activeBooking.status === 'assigned') {
          triggerToast(
            'Specialist Confirmed! 🥇',
            `${activeBooking.provider?.name || 'A specialist'} accepted your job order.`,
            'success'
          );
        } else if (activeBooking.status === 'in_progress') {
          triggerToast(
            'Service Started ⚡',
            `${activeBooking.provider?.name || 'Your technician'} has arrived and is working on the issue.`,
            'info'
          );
        } else if (activeBooking.status === 'completed') {
          triggerToast(
            'Job Finished! Check Bill 📃',
            `${activeBooking.provider?.name || 'Ahmed Kamal'} successfully completed your task.`,
            'success'
          );
        }
      }
      prevStatusRef.current = activeBooking.status;
      prevBookingIdRef.current = activeBooking.id;
    } else {
      // activeBooking became null
      if (prevBookingIdRef.current) {
        if (prevStatusRef.current === 'pending') {
          triggerToast(
            'Request Withdrawn ❌',
            'Your booking request was successfully recalled and cancelled.',
            'alert'
          );
        }
        prevStatusRef.current = undefined;
        prevBookingIdRef.current = undefined;
      }
    }

    // 2. Detect New Chat Messages
    if (chatMessages.length > prevMessagesLengthRef.current) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage) {
        // Only notify if chat window is closed
        if (role === 'customer' && lastMessage.sender === 'worker' && !isChatOpen) {
          triggerToast(
            `Message from ${activeBooking?.provider?.name || 'Ahmed'} 💬`,
            lastMessage.text,
            'chat'
          );
        } else if (role === 'worker' && lastMessage.sender === 'customer' && !isChatOpen) {
          triggerToast(
            `Message from Customer 💬`,
            lastMessage.text,
            'chat'
          );
        }
      }
    }
    prevMessagesLengthRef.current = chatMessages.length;

    // 3. Detect New Job Invites (For Workers)
    if (role === 'worker' && isWorkerOnline) {
      if (jobInvites.length > prevJobInvitesLengthRef.current) {
        const lastInvite = jobInvites[jobInvites.length - 1];
        if (lastInvite) {
          triggerToast(
            'Incoming Job Request! 🛠️',
            `A customer needs a ${lastInvite.service}: "${lastInvite.subService}"`,
            'alert'
          );
        }
      }
    }
    prevJobInvitesLengthRef.current = jobInvites.length;
    prevRoleRef.current = role;

  }, [activeBooking, chatMessages, jobInvites, role, isWorkerOnline, isChatOpen]);

  // Active category element
  const activeCategory = CATEGORIES.find(c => c.key === selectedCatKey) || CATEGORIES[0];

  const handleStartBooking = (issue: string) => {
    setSelectedIssue(issue);
    setCustomIssue(issue);
    setCustomerScreen('booking');
    setSelectedDayIdx(0);
    setSlot('Today @ 09:00 AM - 11:00 AM (Low Demand)');
  };

  const handleCreateBookingSubmit = () => {
    if (!customIssue.trim()) {
      alert('Please fill out the issue details!');
      return;
    }
    onCreateBooking(selectedCatKey, customIssue, address, slot, comments);
    setCustomerScreen('tracking');
    setShowBookingSuccessAnimation(true);
  };

  const handleCustomerRatingSubmit = () => {
    onSubmitRating(stars, review);
    setCustomerScreen('home');
    setStars(5);
    setReview('');
    setIsPaid(false);
    setPaymentCardNumber('');
    setPaymentCardName('');
    setPaymentCardExpiry('');
    setPaymentCardCVV('');
    setPaymentStatusState('form');
    // reset form
    setCustomIssue('');
    setComments('');
  };

  // Sync Customer active tracking state from props
  React.useEffect(() => {
    if (activeBooking) {
      if (activeBooking.status === 'completed') {
        if (!isPaid) {
          setCustomerScreen('payment');
        } else {
          setCustomerScreen('completed');
        }
      } else {
        setCustomerScreen('tracking');
      }
    } else {
      if (customerScreen === 'tracking' || customerScreen === 'completed' || customerScreen === 'payment') {
        setCustomerScreen('home');
      }
    }
  }, [activeBooking, isPaid]);

  // Auto-show Rating Modal on Completion
  React.useEffect(() => {
    if (activeBooking && activeBooking.status === 'completed') {
      setShowRatingModal(true);
    } else {
      setShowRatingModal(false);
    }
  }, [activeBooking?.status, activeBooking?.id]);

  React.useEffect(() => {
    if (!activeBooking) {
      setIsChatOpen(false);
    }
  }, [activeBooking]);

  // Dismiss booking success overlay automatically after 3.5 seconds
  React.useEffect(() => {
    if (showBookingSuccessAnimation) {
      const timer = setTimeout(() => {
        setShowBookingSuccessAnimation(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showBookingSuccessAnimation]);

  // Trigger live toast notifications when an active booking is within 30 minutes
  React.useEffect(() => {
    if (role === 'customer' && reminderBookings.length > 0) {
      reminderBookings.forEach((b) => {
        if (!notifiedScheduleRemindersRef.current[b.id]) {
          triggerToast(
            '⏰ Booking Reminder', 
            `Your booked ${b.service} special job (${b.subService}) starts within 30 minutes!`, 
            'info'
          );
          notifiedScheduleRemindersRef.current[b.id] = true;
        }
      });
    }
  }, [reminderBookings, role]);

  return (
    <div className="flex flex-col items-center">
      {/* Simulation Manual Push Notification Helpers */}
      <div className="flex items-center gap-1.5 mb-2.5 select-none bg-slate-900 border border-slate-800 p-1.5 px-3 rounded-2xl shadow-md">
        <span className="text-[9px] text-teal-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
          <Bell size={10} className="text-teal-400 animate-bounce" /> Push Sim:
        </span>
        <button
          onClick={() => triggerToast('Pro Sourced! 🛠️', 'احمد کمال (Ahmed Kamal) accepted your request and is preparing tools.', 'success')}
          className="text-[9px] font-bold bg-teal-950/40 border border-teal-800 text-teal-300 hover:bg-teal-900/40 px-2 py-0.5 rounded-lg transition-all cursor-pointer"
        >
          Job Accept
        </button>
        <button
          onClick={() => triggerToast('Status Update 📍', 'Technician changed ticket state to IN_PROGRESS.', 'info')}
          className="text-[9px] font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-750 px-2 py-0.5 rounded-lg transition-all cursor-pointer"
        >
          State Change
        </button>
      </div>

      {/* Device wrapper mockup */}
      <div className="relative w-80 h-[620px] bg-slate-900 rounded-[44px] p-2.5 shadow-2xl border-4 border-slate-800 ring-2 ring-slate-750/30 flex flex-col overflow-hidden">
        
        {/* Notch container */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-3 bg-slate-950 rounded-full border border-slate-900 flex items-center justify-end px-1">
            <div className="w-1 h-1 bg-teal-500 rounded-full animate-pulse" />
          </div>
          <div className="w-2.5 h-2.5 bg-slate-950 rounded-full ml-3" />
        </div>

        {/* Home dynamic volume buttons */}
        <div className="absolute left-[-4px] top-24 w-1 h-8 bg-slate-800 rounded-r" />
        <div className="absolute left-[-4px] top-36 w-1 h-8 bg-slate-800 rounded-r" />
        <div className="absolute right-[-4px] top-28 w-1 h-12 bg-slate-800 rounded-l" />

        {/* Simulated Operating System screen */}
        <div className={`flex-1 rounded-[36px] overflow-hidden flex flex-col relative border transition-colors duration-200 ${
          isDarkMode 
            ? 'bg-slate-950 border-slate-800 text-slate-100 dark' 
            : 'bg-slate-50 border-slate-950/20 text-slate-800'
        }`}>

          {/* Real-time Push Notification Simulation Overlay */}
          {toast && (
            <div 
              className={`absolute top-12 left-2.5 right-2.5 z-[999] pointer-events-auto transform transition-all duration-300 ease-out ${toastClass}`}
            >
              <div className={`p-2.5 rounded-2xl shadow-xl border flex items-start gap-2.5 backdrop-blur-md transition-all ${
                isDarkMode 
                  ? 'bg-slate-900/95 border-slate-800 text-white shadow-teal-500/5 shadow-lg' 
                  : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/40 shadow-lg'
              }`}>
                {/* Visual Icon with indicator ring */}
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center relative ${
                  toast.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : toast.type === 'alert' 
                    ? 'bg-rose-500/10 text-rose-500' 
                    : toast.type === 'chat'
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-teal-500/10 text-teal-650'
                }`}>
                  <span className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
                    toast.type === 'success' 
                      ? 'bg-emerald-500' 
                      : toast.type === 'alert' 
                      ? 'bg-rose-500' 
                      : toast.type === 'chat'
                      ? 'bg-amber-500'
                      : 'bg-teal-500'
                  }`} style={{ animationDuration: '2s' }} />
                  <Bell size={12} className="relative z-10" />
                </div>

                {/* Msg text */}
                <div className="flex-1 min-w-0 pr-1 text-left">
                  <div className={`font-black text-[9px] uppercase tracking-wide truncate ${isDarkMode ? 'text-teal-400' : 'text-teal-650'}`}>
                    {toast.title}
                  </div>
                  <p className={`text-[9px] leading-snug font-semibold mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-650'}`}>
                    {toast.message}
                  </p>
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => {
                    setToastClass('-translate-y-full opacity-0 scale-95');
                    setTimeout(() => setToast(null), 300);
                  }}
                  className={`shrink-0 p-0.5 rounded-full hover:bg-slate-500/10 cursor-pointer transition-colors ${
                    isDarkMode ? 'text-slate-500 hover:text-slate-350' : 'text-slate-400 hover:text-slate-650'
                  }`}
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          )}
          
          {/* Status Bar */}
          <div className={`h-11 px-4 flex items-end justify-between pb-2 border-b z-40 select-none text-[10px] font-bold transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-800 text-slate-200' 
              : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className="flex items-center gap-1.5">
              <span>Haazir LTE</span>
              {/* Dark Mode Toggle Switch */}
              <button 
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-1 rounded-md transition-all duration-150 flex items-center justify-center cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-800 text-amber-400 hover:bg-slate-750 border border-slate-700/60' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                }`}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to low-light environment mode"}
              >
                {isDarkMode ? <Sun size={10} className="fill-amber-400/20" /> : <Moon size={10} />}
              </button>

              {/* Language Selection Toggle */}
              <button 
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
                className={`p-1 px-1.5 rounded-md text-[8px] font-black tracking-tight transition-all duration-150 flex items-center justify-center border cursor-pointer leading-none min-w-[28px] h-5 ${
                  language === 'ur'
                    ? 'bg-teal-600 text-white border-teal-500 hover:bg-teal-700 shadow-xs'
                    : isDarkMode 
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-750 border-slate-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                }`}
                title={language === 'en' ? "اردو میں تبدیل کریں" : "Switch to English"}
              >
                {language === 'en' ? "اردو" : "EN"}
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono">9:41 AM</span>
              <div className={`w-5 h-2.5 border rounded-sm p-0.5 flex items-center ${isDarkMode ? 'border-slate-700' : 'border-slate-400'}`}>
                <div className={`w-3.5 h-full rounded-2xs ${isDarkMode ? 'bg-slate-300' : 'bg-slate-800'}`} />
              </div>
            </div>
          </div>

          {/* Core Body Container */}
          <div className={`flex-1 overflow-y-auto no-scrollbar pb-20 flex flex-col text-xs leading-normal transition-colors duration-200 ${
            isDarkMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-800'
          }`}>
            
            {(!currentUser || !currentUser.isLoggedIn) ? (
              /* ========================================================= */
              /* LIVE SECURED LOGIN / REGISTER SCENARIO                    */
              /* ========================================================= */
              <div className={`p-5 flex-1 flex flex-col justify-start animate-fade-in text-left select-none relative pb-10 transition-colors duration-200 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50'}`}>
                <div className="text-center mb-4">
                  <div className="w-10 h-10 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-black text-sm mx-auto shadow-md shadow-teal-500/20 mb-2 select-none">
                    H
                  </div>
                  <h3 className={`font-extrabold text-base tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('welcome')}</h3>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5 select-none animate-pulse">
                    {role === 'customer' ? t('customer_account') : t('vendor_portal')}
                  </p>
                </div>

                {/* Switch Role Tab (Customer vs Vendor) */}
                <div className={`flex p-1 rounded-xl mb-3.5 relative z-10 font-extrabold text-[10px] select-none border transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-200/50 border-slate-200/85 text-slate-650'}`}>
                  <button 
                    type="button"
                    onClick={() => {
                      if (onChangeRole) onChangeRole('customer');
                      setAuthError('');
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      role === 'customer' 
                        ? 'bg-teal-600 text-white font-extrabold shadow-3xs' 
                        : (isDarkMode ? 'text-slate-400 hover:text-slate-250' : 'text-slate-600 hover:text-slate-900')
                    }`}
                  >
                    <User size={13} className="shrink-0" />
                    <span>{t('hire_pro')}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (onChangeRole) onChangeRole('worker');
                      setAuthError('');
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      role === 'worker' 
                        ? 'bg-amber-600 text-white font-extrabold shadow-3xs' 
                        : (isDarkMode ? 'text-slate-400 hover:text-slate-250' : 'text-slate-600 hover:text-slate-900')
                    }`}
                  >
                    <Construction size={13} className="shrink-0" />
                    <span>{t('earn_pro')}</span>
                  </button>
                </div>

                {/* Switch Login vs SignUp tabs */}
                <div className={`p-1 rounded-xl flex mb-3.5 font-extrabold text-3xs relative z-10 select-none transition-colors border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/60 border-transparent'}`}>
                  <button 
                    type="button"
                    onClick={() => { setIsSignUp(false); setAuthError(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${!isSignUp ? `${role === 'worker' ? 'bg-amber-600' : 'bg-teal-600'} text-white shadow-3xs font-extrabold` : (isDarkMode ? 'text-slate-400 hover:text-slate-250' : 'text-slate-500 hover:text-slate-800')}`}
                  >
                    {language === 'en' ? 'Log In' : 'لاگ ان'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsSignUp(true); setAuthError(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${isSignUp ? `${role === 'worker' ? 'bg-amber-600' : 'bg-teal-600'} text-white shadow-3xs font-extrabold` : (isDarkMode ? 'text-slate-400 hover:text-slate-250' : 'text-slate-500 hover:text-slate-800')}`}
                  >
                    {language === 'en' ? 'Sign Up' : 'رجسٹر کریں'}
                  </button>
                </div>

                {/* Core Auth card form widget */}
                <div className={`border rounded-2xl p-4 shadow-3xs space-y-2.5 relative z-10 transition-colors duration-150 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200'}`}>
                  {authError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-3xs font-bold leading-normal">
                      ⚠️ {authError}
                    </div>
                  )}

                  {isSignUp && (
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t('full_name')}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400"><User size={12} /></span>
                        <input 
                          type="text"
                          placeholder={language === 'en' ? "e.g. Ayesha Khan" : "مثال کے طور پر عائشہ خان"}
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          className={`w-full border rounded-xl py-2 pl-8 pr-3 text-2xs focus:ring-1 focus:ring-teal-600 focus:outline-none font-semibold transition-colors duration-150 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                        />
                      </div>
                    </div>
                  )}

                  {isSignUp && (
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{language === 'en' ? 'Phone Number' : 'موبائل نمبر'}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400"><Phone size={12} /></span>
                        <input 
                          type="text"
                          placeholder="e.g. 0300-1234567"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          className={`w-full border rounded-xl py-2 pl-8 pr-3 text-2xs focus:ring-1 focus:ring-teal-600 focus:outline-none font-semibold transition-colors duration-150 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                        />
                      </div>
                    </div>
                  )}

                  {isSignUp && role === 'worker' && (
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{language === 'en' ? 'Specialty skill' : 'مہارت کا انتخاب'}</label>
                      <select 
                        value={authSpecialty}
                        onChange={(e) => setAuthSpecialty(e.target.value)}
                        className={`w-full border rounded-xl py-2 px-2 text-2xs focus:ring-1 focus:ring-teal-600 focus:outline-none font-bold transition-all duration-150 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                      >
                        <option value="Electrician">{language === 'en' ? 'Electrician & Fans' : 'الیکٹریشن اور پنکھا'}</option>
                        <option value="Plumber">{language === 'en' ? 'Plumber & Piping' : 'پلمبر اور پائپنگ'}</option>
                        <option value="CCTV Specialist">{language === 'en' ? 'CCTV & Camera Security' : 'سی سی ٹی وی اور کیمرہ'}</option>
                        <option value="Appliance Specialist">{language === 'en' ? 'Appliance Repair expert' : 'آلات کی مرمت کے ماہر'}</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{language === 'en' ? 'Email address' : 'ای میل ایڈریس'}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400"><Mail size={12} /></span>
                      <input 
                        type="email"
                        placeholder="user@gmail.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className={`w-full border rounded-xl py-2 pl-8 pr-3 text-2xs focus:ring-1 focus:ring-teal-600 focus:outline-none font-semibold transition-colors duration-150 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{language === 'en' ? 'Password' : 'پاس ورڈ'}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400"><Lock size={12} /></span>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className={`w-full border rounded-xl py-2 pl-8 pr-3 text-2xs focus:ring-1 focus:ring-teal-600 focus:outline-none font-semibold transition-colors duration-150 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!authEmail || !authPassword) {
                        setAuthError('Please fill out all email and password fields.');
                        return;
                      }
                      if (isSignUp && (!authName || !authPhone)) {
                        setAuthError('Please provide both full name and cell number.');
                        return;
                      }
                      setAuthError('');
                      try {
                        const res = await onLogin(authEmail, authPassword, isSignUp, {
                          name: authName,
                          phone: authPhone,
                          specialty: authSpecialty
                        });
                        if (res && !res.success) {
                          setAuthError(res.error || 'Authentication error.');
                        } else {
                          setAuthError('');
                          setAuthEmail('');
                          setAuthPassword('');
                          setAuthName('');
                          setAuthPhone('');
                        }
                      } catch (err: any) {
                        setAuthError(err.message || 'Authentication error.');
                      }
                    }}
                    className={`w-full py-2.5 active:scale-95 text-white font-black rounded-xl text-2xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-1 ${
                      role === 'customer' 
                        ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/10' 
                        : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10'
                    }`}
                  >
                    {isSignUp ? <UserPlus size={11} /> : <LogIn size={11} />}
                    <span>{isSignUp ? (language === 'en' ? 'REGISTER ACCOUNT' : 'اکاؤنٹ رجسٹر کریں') : (language === 'en' ? 'SECURE SIGN-IN' : 'محفوظ سائن ان')}</span>
                  </button>
                </div>

                {/* Prefill assist badge */}
                <div className={`mt-3.5 p-3 border rounded-xl select-none z-10 text-left ${
                  role === 'customer' 
                    ? 'bg-teal-50 border-teal-100' 
                    : 'bg-amber-50 border-amber-100'
                }`}>
                  <p className={`text-[8px] uppercase tracking-wider font-extrabold mb-1 flex items-center gap-1 ${
                    role === 'customer' ? 'text-teal-800' : 'text-amber-800'
                  }`}>
                    ⚡ Quick Tester Bypass
                  </p>
                  <p className="text-[9px] text-slate-500 leading-normal mb-1.5 font-medium">
                    Fast-track testing inside the sandbox using pre-configured mock registry:
                  </p>
                  
                  {role === 'customer' ? (
                    <button
                      type="button"
                      onClick={async () => {
                        setAuthEmail('ayesha@gmail.com');
                        setAuthPassword('123');
                        setIsSignUp(false);
                        setAuthError('');
                        await onLogin('ayesha@gmail.com', '123', false);
                      }}
                      className="w-full bg-white hover:bg-teal-100/30 border border-teal-150 text-teal-600 font-extrabold py-2 px-3 rounded-lg text-3xs flex items-center justify-between transition-all cursor-pointer shadow-3xs"
                    >
                      <span>⚡ Auto-fill Client: (ayesha@gmail.com)</span>
                      <ArrowRight size={10} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        setAuthEmail('ahmed@gmail.com');
                        setAuthPassword('123');
                        setIsSignUp(false);
                        setAuthError('');
                        await onLogin('ahmed@gmail.com', '123', false);
                      }}
                      className="w-full bg-white hover:bg-amber-100/30 border border-amber-150 text-amber-700 font-extrabold py-2 px-3 rounded-lg text-3xs flex items-center justify-between transition-all cursor-pointer shadow-3xs"
                    >
                      <span>⚡ Auto-fill Vendor: (ahmed@gmail.com)</span>
                      <ArrowRight size={10} />
                    </button>
                  )}
                </div>
              </div>
            ) : isChatOpen && (role === 'customer' ? activeBooking : focusedWorkerBooking) ? (
              (() => {
              const chatBooking = role === 'customer' ? activeBooking! : focusedWorkerBooking!;
              const dispatchLocalMessage = (sender: 'customer' | 'worker', text: string) => {
                onSendMessage(sender, text, chatBooking.id);
              };
              return (
                <div className="flex-1 flex flex-col justify-between h-full bg-slate-50 text-left animate-fade-in relative min-h-[460px]">
                  {/* Chat Top Header */}
                  <div className="bg-white border-b border-slate-150 p-3.5 flex items-center justify-between sticky top-0 z-30 select-none shadow-3xs shrink-0">
                    <button 
                      onClick={() => setIsChatOpen(false)}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold text-2xs cursor-pointer"
                    >
                      <ChevronRight size={14} className="rotate-180" />
                      <span>Back</span>
                    </button>
                    <div className="text-center">
                      <span className="font-extrabold text-slate-850 text-2xs block">
                        {role === 'customer' 
                          ? (chatBooking.provider?.name || 'Ahmed Kamal') 
                          : 'Ayesha Khan'
                        }
                      </span>
                      <span className="text-[9px] text-teal-605 text-teal-600 font-bold uppercase tracking-wider block">
                        {role === 'customer' ? 'Haazir Specialist' : 'Customer Account'}
                      </span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center font-bold text-[10px] text-teal-800 select-none">
                      {role === 'customer' ? 'AK' : 'AK'}
                    </div>
                  </div>

                  {/* Messages Body List */}
                  <div className="flex-grow overflow-y-auto no-scrollbar p-3.5 space-y-2.5 max-h-[300px]">
                    {filteredChatMessages.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 font-mono text-[9px] select-none">
                        Secured communication stream. Tap replies or type to chat.
                      </div>
                    ) : (
                      filteredChatMessages.map((msg) => {
                        const isMe = msg.sender === role;
                        return (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto' : 'mr-auto'}`}
                          >
                            <div className={`p-2.5 pb-1 rounded-2xl text-[11px] leading-normal shadow-3xs flex flex-col ${
                              isMe 
                                ? 'bg-teal-600 text-white rounded-br-2xs' 
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-2xs'
                            }`}>
                              <span className="font-medium break-words leading-normal block">{msg.text}</span>
                              <div className="flex items-center gap-1 mt-1 justify-end select-none leading-none">
                                <span className={`text-[7.5px] font-mono leading-none ${isMe ? 'text-teal-200/90 font-semibold' : 'text-slate-400 font-semibold'}`}>
                                  {msg.timestamp}
                                </span>
                                {isMe && (
                                  <CheckCheck size={11} className="text-teal-200 flex-shrink-0 stroke-2 font-black leading-none" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Instant Quick Action recommendation list */}
                  <div className="p-2 border-t border-slate-100 bg-white shrink-0 scrollbar-none overflow-x-auto whitespace-nowrap flex gap-1.5 select-none shrink-0">
                    {role === 'customer' ? (
                      <>
                        <button 
                          onClick={() => {
                            dispatchLocalMessage('customer', "Assalam-o-Alaikum Ahmed, when will you arrive?");
                          }}
                          className="bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-slate-600 hover:text-teal-700 text-3xs font-extrabold px-2.5 py-1.5 rounded-full cursor-pointer transition-all shrink-0"
                        >
                          ⏱️ When will you arrive?
                        </button>
                        <button 
                          onClick={() => {
                            dispatchLocalMessage('customer', "I'm on the 3rd floor. Please ring the doorbell.");
                          }}
                          className="bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-slate-600 hover:text-teal-700 text-3xs font-extrabold px-2.5 py-1.5 rounded-full cursor-pointer transition-all shrink-0"
                        >
                          🔔 Ring doorbell on 3rd floor
                        </button>
                        <button 
                          onClick={() => {
                            dispatchLocalMessage('customer', "No problem, please take your time.");
                          }}
                          className="bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-slate-600 hover:text-teal-700 text-3xs font-extrabold px-2.5 py-1.5 rounded-full cursor-pointer transition-all shrink-0"
                        >
                          ⏱️ Take your time
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            dispatchLocalMessage('worker', "Assalam-o-Alaikum! Driving to your location now.");
                          }}
                          className="bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-slate-600 hover:text-teal-700 text-3xs font-extrabold px-2.5 py-1.5 rounded-full cursor-pointer transition-all shrink-0"
                        >
                          🚗 Heading over now
                        </button>
                        <button 
                          onClick={() => {
                            dispatchLocalMessage('worker', "I am outside your gate. Can you guide me in?");
                          }}
                          className="bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-slate-600 hover:text-teal-700 text-3xs font-extrabold px-2.5 py-1.5 rounded-full cursor-pointer transition-all shrink-0"
                        >
                          📍 Reached outside
                        </button>
                        <button 
                          onClick={() => {
                            dispatchLocalMessage('worker', "All fixed and tested. Let me know if any other issue!");
                          }}
                          className="bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-slate-600 hover:text-teal-700 text-3xs font-extrabold px-2.5 py-1.5 rounded-full cursor-pointer transition-all shrink-0"
                        >
                          🔧 Resolved & Tested
                        </button>
                      </>
                    )}
                  </div>

                  {/* TextInput input bar */}
                  <div className="p-3 bg-slate-150 border-t border-slate-200 flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder="Type message here..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatInputText.trim()) {
                          dispatchLocalMessage(role, chatInputText.trim());
                          setChatInputText('');
                        }
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-2xs focus:ring-1 focus:ring-teal-600 focus:outline-none placeholder-slate-400 font-semibold text-slate-705"
                    />
                    <button
                      onClick={() => {
                        if (chatInputText.trim()) {
                          dispatchLocalMessage(role, chatInputText.trim());
                          setChatInputText('');
                        }
                      }}
                      className="p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Send size={11} />
                    </button>
                  </div>
                </div>
              );
            })()
            ) : role === 'customer' ? (
              /* ========================================================= */
              /* CLIENT MAIN VIEWFLOW STATE                                */
              /* ========================================================= */
              <>
                {customerScreen === 'home' && (
                  <div className="p-4 flex-1 flex flex-col animate-fade-in text-left">
                    
                    {/* Location and Profile bar */}
                    <div className="flex justify-between items-center mb-4 select-none">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Location</p>
                        <p className={`text-[12px] font-bold flex items-center gap-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          <MapPin size={11} className="text-teal-650" />
                          DHA Phase 6, Karachi ▾
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Help & Support Portal Button */}
                        <button
                          type="button"
                          onClick={() => setShowHelpModal(true)}
                          style={{ contentVisibility: 'auto' }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                            isDarkMode 
                              ? 'bg-slate-900 border border-slate-800 text-teal-400 hover:bg-slate-800' 
                              : 'bg-teal-50 border border-teal-100 text-teal-600 hover:bg-teal-100/70 shadow-3xs'
                          }`}
                          title={language === 'en' ? 'Help & Support' : 'طلبِ مدد'}
                        >
                          <HelpCircle size={13} className="stroke-[2.5]" />
                        </button>

                        <div className="text-right">
                          <span className={`text-[10px] font-extrabold block leading-tight truncate max-w-[80px] ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            {currentUser?.name || 'Ayesha Khan'}
                          </span>
                          <button 
                            type="button"
                            onClick={onLogout}
                            className="text-[9px] text-rose-500 font-bold tracking-tight hover:underline cursor-pointer block text-right w-full"
                          >
                            {language === 'en' ? 'Sign out' : 'لاگ آؤٹ'}
                          </button>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-teal-150 flex items-center justify-center text-teal-850 font-black text-xs select-none animate-fade-in">
                          {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AK'}
                        </div>
                      </div>
                    </div>

                    {/* Needs repair beautiful card */}
                    <div className="bg-teal-900 text-white rounded-2xl p-4 shadow-sm mb-4 relative overflow-hidden select-none border border-teal-800">
                      <div className="absolute right-2 -bottom-2 opacity-10 rotate-12">
                        <Construction size={80} />
                      </div>
                      <p className="text-sm font-bold leading-tight">{language === 'en' ? 'Need a repair?' : 'کیا مرمت کی ضرورت ہے؟'}</p>
                      <p className="text-[10px] text-teal-200/95 mb-3 font-medium">{language === 'en' ? 'Book verified professionals in 60s' : 'منزل تک ۶۰ سیکنڈ میں ماہرین حاصل کریں'}</p>
                      
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 text-3xs">🔍</span>
                        <input 
                          type="text" 
                          value={customerSearchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          placeholder={t('search_placeholder')} 
                          className="w-full bg-white/10 placeholder-slate-300 border-0 rounded-xl py-1.5 pl-8 pr-8 text-[11px] outline-none text-white font-medium focus:bg-white/20 transition-all font-sans"
                        />
                        {customerSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomerSearchQuery('');
                            }}
                            className="absolute right-3 top-2 text-slate-300 hover:text-white text-xs font-bold leading-none cursor-pointer"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Schedule Reminders Live Alert List */}
                    {reminderBookings.map((b) => {
                      const schedTime = getBookingScheduledTime(b.slot, b.createdAt);
                      let relativeText = '';
                      if (schedTime) {
                        const diffMins = Math.round((schedTime.getTime() - Date.now()) / (1000 * 60));
                        if (b.slot.toLowerCase().includes('urgent')) {
                          relativeText = language === 'en' ? 'ASAP' : 'ابھی ضرورت ہے';
                        } else if (diffMins > 0) {
                          relativeText = language === 'en' ? `starts in ${diffMins} min` : `${diffMins} منٹ میں`;
                        } else if (diffMins < 0 && diffMins > -120) {
                          relativeText = language === 'en' ? `started ${Math.abs(diffMins)} min ago` : `${Math.abs(diffMins)} منٹ پہلے`;
                        } else {
                          relativeText = language === 'en' ? 'starts now' : 'ابھی شروع';
                        }
                      } else if (b.slot.toLowerCase().includes('urgent')) {
                        relativeText = language === 'en' ? 'ASAP' : 'ابھی ضرورت ہے';
                      }

                      return (
                        <div 
                          key={b.id} 
                          className={`mb-3.5 border rounded-2xl p-3 flex gap-2.5 items-start justify-between shadow-3xs hover:scale-[1.01] active:scale-99 cursor-pointer transition-all select-none ${
                            isDarkMode 
                              ? 'bg-amber-500/10 border-amber-500/25 text-amber-200' 
                              : 'bg-amber-50/80 border-amber-250 text-amber-900'
                          }`}
                          onClick={() => {
                            if (activeBooking?.id === b.id) {
                              setCustomerScreen(activeBooking.status === 'completed' ? 'completed' : 'tracking');
                            } else {
                              setCustomerScreen('bookings');
                            }
                          }}
                        >
                          <div className="shrink-0 w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 animate-pulse">
                            <Bell size={12} className="stroke-[2.5]" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[7.5px] font-extrabold uppercase tracking-wider text-amber-650 bg-amber-500/10 px-1.5 py-0.5 rounded-md leading-none">
                                {language === 'en' ? 'UPCOMING REMINDER' : 'آنے والا کام'}
                              </span>
                              {relativeText && (
                                <span className="text-[7.5px] font-bold font-mono tracking-wider opacity-85 leading-none">
                                  • {relativeText}
                                </span>
                              )}
                            </div>
                            <h4 className="text-[9.5px] font-extrabold mt-1 truncate leading-tight">
                              {b.service} - {b.subService}
                            </h4>
                            <p className={`text-[8.5px] mt-0.5 leading-snug line-clamp-1 ${isDarkMode ? 'text-slate-405' : 'text-slate-655'}`}>
                              {language === 'en' ? 'Scheduled slot' : 'مقررہ وقت'}: {b.slot}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="shrink-0 text-[8px] font-black tracking-wide uppercase px-2 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 shadow-3xs leading-none mt-1 cursor-pointer"
                          >
                            {language === 'en' ? 'View' : 'دیکھیں'}
                          </button>
                        </div>
                      );
                    })}

                    {/* Quick Active Booking Floating Alert */}
                    {activeBooking && (
                      <button 
                        onClick={() => setCustomerScreen('tracking')}
                        className="mb-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl p-3 flex items-center justify-between shadow-md transition-all animate-bounce"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                          <span className="font-bold text-3xs">{language === 'en' ? 'Active order progress' : 'آرڈر کی صورتحال'}: {activeBooking.status.toUpperCase()}</span>
                        </div>
                        <ChevronRight size={13} />
                      </button>
                    )}

                    {/* Grid banner labels */}
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                        {customerSearchQuery 
                          ? (language === 'en' ? `Search Results (${filteredCategories.length})` : `تلاش کے نتائج (${filteredCategories.length})`)
                          : (language === 'en' ? 'All Categories' : 'تمام زمرہ جات')
                        }
                      </h4>
                      {customerSearchQuery && (
                        <button
                          onClick={() => setCustomerSearchQuery('')}
                          className="text-[9px] text-teal-650 hover:underline font-bold"
                        >
                          {language === 'en' ? 'Clear' : 'صاف کریں'}
                        </button>
                      )}
                    </div>

                    {/* Categories grid-cols-4 layout */}
                    {filteredCategories.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2 mb-5">
                        {filteredCategories.map((cat) => {
                          const isSelected = selectedCatKey === cat.key;
                          const Icon = cat.icon;
                          return (
                            <button
                              key={cat.key}
                              onClick={() => {
                                setSelectedCatKey(cat.key);
                                setSelectedIssue('');
                              }}
                              className="flex flex-col items-center gap-1.5 outline-none group cursor-pointer"
                            >
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                                isSelected 
                                  ? 'bg-teal-600 border-teal-600 text-white shadow-md' 
                                  : isDarkMode 
                                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 shadow-md'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                              }`}>
                                <Icon size={18} />
                              </div>
                              <span className={`text-[9px] font-extrabold tracking-tight text-center truncate w-full ${
                                isSelected 
                                  ? (isDarkMode ? 'text-teal-400 font-extrabold' : 'text-teal-650') 
                                  : (isDarkMode ? 'text-slate-400' : 'text-slate-500')
                              }`}>
                                {cat.title.split(' ')[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={`text-center py-6 px-4 mb-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="text-xl mb-1">🔍</div>
                        <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-350' : 'text-slate-650'}`}>
                          {language === 'en' ? 'No categories match your search' : 'آپ کی تلاش کے مطابق زمرہ نہیں ملا'}
                        </p>
                        <p className="text-[8px] text-slate-400 mt-1">
                          {language === 'en' ? "Try searching for 'wire', 'leak', or 'fix'" : 'ورڈز جیسے "wire"، "leak"، یا "fix" تلاش کریں'}
                        </p>
                        <button
                          onClick={() => setCustomerSearchQuery('')}
                          className="mt-3.5 bg-teal-650 hover:bg-teal-700 text-white text-[9px] font-bold py-1.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          {language === 'en' ? 'Show All Services' : 'تمام خدمات دیکھیں'}
                        </button>
                      </div>
                    )}

                    {filteredCategories.length > 0 && (
                      <>
                        {/* Section Label: Common Issues */}
                        <div className="mb-2.5">
                          <h4 className={`font-bold text-2xs uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            {language === 'en' ? `Common ${activeCategory.title} Issues` : `${language === 'en' ? activeCategory.title : (activeCategory.title === 'Electrical' ? 'الیکٹریکل' : activeCategory.title === 'Plumbing' ? 'پلمبنگ' : activeCategory.title === 'HVAC' ? 'ایئر کنڈیشنر' : 'کارپینٹر')} کے عام مسائل`}
                          </h4>
                          <p className="text-[10px] text-slate-405 text-slate-400">{language === 'en' ? 'Select an issue below to instantiate support' : 'مدد کے لیے نیچے سے مسئلہ منتخب کریں'}</p>
                        </div>

                        {/* Template list stack */}
                        <div className="space-y-1.5 flex-1 select-none">
                          {QUICK_ISSUES[selectedCatKey].map((issue, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleStartBooking(issue)}
                              className={`w-full border rounded-xl p-3 flex items-center justify-between text-left transition-all group cursor-pointer ${
                                isDarkMode 
                                  ? 'bg-slate-900 border-slate-800 hover:border-teal-500 hover:bg-slate-800' 
                                  : 'bg-white border-slate-200 hover:border-teal-600 hover:bg-slate-50'
                              }`}
                            >
                              <span className={`text-[10px] ${isDarkMode ? 'text-slate-350' : 'text-slate-650'}`}>{issue}</span>
                            </button>
                          ))}
                        </div>

                        {/* Other customized task triggers */}
                        <button
                          onClick={() => handleStartBooking('')}
                          className={`mt-3.5 w-full border border-dashed p-3 rounded-xl flex items-center justify-center gap-2 text-2xs font-bold transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'bg-slate-900/40 border-teal-850 hover:border-teal-600 text-teal-400' 
                              : 'bg-white border-teal-350 text-teal-650 hover:border-teal-500'
                          }`}
                        >
                          <Sliders size={12} />
                          {language === 'en' ? `Describe a Custom ${activeCategory.title} Issue` : `اپنا مخصوص مسئلہ لکھیں (${activeCategory.title === 'Electrical' ? 'الیکٹریکل' : activeCategory.title === 'Plumbing' ? 'پلمبنگ' : activeCategory.title === 'HVAC' ? 'ایئر کنڈیشنر' : 'کارپینٹر'})`}
                        </button>
                        
                        {/* Trust Seal */}
                        <div className={`mt-4 p-3 rounded-xl border flex items-start gap-2.5 transition-colors duration-155 ${
                          isDarkMode ? 'bg-teal-950/20 border-teal-900/60' : 'bg-teal-50 border-teal-100'
                        }`}>
                          <CheckCircle2 size={15} className="text-teal-600 shrink-0 mt-0.5" />
                          <div>
                            <div className={`font-bold text-[10px] uppercase tracking-wider ${isDarkMode ? 'text-teal-300' : 'text-teal-900'}`}>{language === 'en' ? 'Biometric Verified Professionals' : 'بایومیٹرک تصدیق شدہ ماہرین'}</div>
                            <p className={`text-[9px] mt-0.5 leading-tight font-medium ${isDarkMode ? 'text-teal-400/90' : 'text-teal-750'}`}>{language === 'en' ? 'Every service is backstopped by the Haazir cash security guarantees.' : 'ہر کام حاضر کی کیش سیکیورٹی گارنٹی کے تحت محفوظ ہے'}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {customerScreen === 'booking' && (
                  <div className="p-4 flex-1 flex flex-col justify-between animate-fade-in text-left">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <button 
                          onClick={() => setCustomerScreen('home')}
                          className={`flex items-center gap-1 font-bold text-2xs transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          <X size={12} />
                          {language === 'en' ? 'Cancel' : 'منسوخ'}
                        </button>
                        <span className="text-[10px] font-bold bg-teal-900 text-white py-1 px-2.5 rounded-full uppercase">
                          {activeCategory.title}
                        </span>
                      </div>

                      <h3 className={`text-base font-extrabold tracking-tight mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{language === 'en' ? 'Details & Schedule' : 'تفصیلات اور وقت'}</h3>
                      <p className="text-slate-400 text-[10px] mb-4">{language === 'en' ? 'Confirm where and when you need your labor.' : 'تصدیق کریں کہ آپ کو ورکر کب اور کہاں درکار ہے۔'}</p>

                      {/* Issue text field */}
                      <div className="mb-3.5">
                        <label className={`block text-[10px] font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>{language === 'en' ? 'Your Problem' : 'آپ کا مسئلہ'}</label>
                        <input
                          type="text"
                          value={customIssue}
                          onChange={(e) => setCustomIssue(e.target.value)}
                          placeholder={language === 'en' ? "What needs to be fixed?" : "مرمت کے متعلق تفصیل لکھیں"}
                          className={`w-full border rounded-xl p-2.5 text-2xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none transition-colors duration-150 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800'}`}
                        />
                      </div>

                      {/* Address Presets selector */}
                      <div className="mb-3.5">
                        <label className={`block text-[10px] font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>{language === 'en' ? 'Select Service address' : 'سروس کا پتہ منتخب کریں'}</label>
                        <div className="space-y-1.5">
                          {ADDR_PRESETS.map((p, idx) => (
                            <button
                              key={idx}
                              onClick={() => setAddress(p)}
                              className={`w-full text-left p-2.5 rounded-xl border text-[10px] leading-snug flex items-start gap-2 transition-all cursor-pointer ${
                                address === p 
                                  ? (isDarkMode ? 'border-teal-500 bg-teal-950/40 text-teal-300 font-bold' : 'border-teal-600 bg-teal-50 text-teal-800 font-bold') 
                                  : (isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-850' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')
                              }`}
                            >
                              <MapPin size={12} className={`shrink-0 mt-0.5 ${address === p ? 'text-teal-605' : 'text-slate-405 text-slate-400'}`} />
                              <span>{p}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interactive Calendar-Based Scheduling Tool based on labor demand */}
                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-750'}`}>
                          Schedule Timing & Demand Insights
                        </label>
                        
                        {/* 4-Day Calendar Row */}
                        <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar pb-1">
                          {getCalendarDays().map((day) => {
                            const isSelected = selectedDayIdx === day.index;
                            const isWeekend = day.dayLabel === 'Sat' || day.dayLabel === 'Sun' || day.dayLabel === 'Tomorrow';
                            const dayDemandLabel = isWeekend ? 'Peak Load' : 'Normal';
                            const dayDemandColor = isWeekend 
                              ? 'text-rose-500 border-rose-500/10 bg-rose-500/10' 
                              : 'text-teal-500 border-teal-505/10 bg-teal-500/10';
                            
                            return (
                              <button
                                key={day.index}
                                type="button"
                                onClick={() => {
                                  setSelectedDayIdx(day.index);
                                  // Auto preset slot to first slot on switching day
                                  const defaultSlot = `${day.dayLabel} @ 09:00 AM - 11:00 AM (Low Demand)`;
                                  setSlot(defaultSlot);
                                }}
                                className={`flex-1 min-w-[66px] h-[52px] rounded-xl border p-1.5 flex flex-col justify-between items-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                                    : isDarkMode
                                    ? 'bg-slate-900 border-slate-800 text-slate-305 hover:bg-slate-850'
                                    : 'bg-white border-slate-205 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className={`text-[7.5px] font-extrabold tracking-wider uppercase ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                                  {day.dayLabel}
                                </span>
                                <span className="text-xs font-black leading-none -my-0.5">
                                  {day.dayNum}
                                </span>
                                <span className={`text-[6.5px] font-black px-1 rounded-sm border leading-none py-0.5 scale-90 ${
                                  isSelected ? 'text-white border-white/20 bg-white/10' : dayDemandColor
                                }`}>
                                  {dayDemandLabel}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Earliest Available Sugessted Time Slots with demand indicators */}
                        <div className="grid grid-cols-2 gap-1.5 mb-3">
                          {DEMAND_SLOTS.map((s, idx) => {
                            const currentDayLabel = getCalendarDays()[selectedDayIdx].dayLabel;
                            const isSelected = slot.startsWith(`${currentDayLabel} @ ${s.time}`);
                            const demandColor = s.demand === 'low' 
                              ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
                              : s.demand === 'peak'
                              ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                              : 'text-amber-500 bg-amber-500/10 border-amber-500/20';

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  const days = getCalendarDays();
                                  setSlot(`${days[selectedDayIdx].dayLabel} @ ${s.time} (${s.label})`);
                                }}
                                className={`text-left p-2 rounded-xl border flex flex-col justify-between h-[56px] transition-all cursor-pointer ${
                                  isSelected
                                    ? isDarkMode
                                      ? 'border-teal-500 bg-teal-950/20 text-teal-300 shadow-sm'
                                      : 'border-teal-600 bg-teal-50 text-teal-800 shadow-xs'
                                    : isDarkMode
                                    ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                }`}
                              >
                                {/* Time display */}
                                <div className="flex items-center gap-1">
                                  <Clock size={8} className={isSelected ? 'text-teal-600' : 'text-slate-400'} />
                                  <span className="text-[8.5px] font-extrabold tracking-tight truncate leading-none pt-0.5">
                                    {s.time}
                                  </span>
                                </div>

                                {/* Demand insights */}
                                <div className="flex items-center justify-between mt-1">
                                  <span className={`text-[6.5px] font-black uppercase px-1 py-0.5 rounded-sm border ${demandColor} scale-95 origin-left`}>
                                    {s.demand === 'low' ? (language === 'en' ? '🚀 Low' : '🚀 کم طلب') : s.demand === 'peak' ? (language === 'en' ? '🔥 Peak' : '🔥 زیادہ طلب') : (language === 'en' ? '⏰ Avg' : '⏰ اوسط')}
                                  </span>
                                  <span className="text-[7px] text-slate-400 font-bold truncate max-w-[50px] text-right">
                                    {language === 'en' 
                                      ? s.speed 
                                      : s.speed.includes('Fast') 
                                        ? '🚀 تیز رفتار' 
                                        : s.speed.includes('Delayed') 
                                          ? '🔥 تاخیر' 
                                          : '⏱️ نارمل'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected arrival confirmation banner */}
                        <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-150 text-slate-700'
                        }`}>
                          <div className="shrink-0 w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600">
                            <Clock size={10} className="animate-pulse" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <span className="text-[6.5px] uppercase font-bold text-slate-400 leading-none block">
                              {language === 'en' ? 'Target Delivery Window' : 'مطلوبہ وقتِ کار'}
                            </span>
                            <span className="text-[8.5px] font-bold block truncate mt-0.5 text-teal-600">
                              {language === 'en' ? slot : slot
                                .replace('Mon', 'پیر')
                                .replace('Tue', 'منگل')
                                .replace('Wed', 'بدھ')
                                .replace('Thu', 'جمعرات')
                                .replace('Fri', 'جمعہ')
                                .replace('Sat', 'ہفتہ')
                                .replace('Sun', 'اتوار')
                                .replace('Today', 'آج')
                                .replace('Tomorrow', 'کل')
                                .replace('Low Demand', 'کم طلب')
                                .replace('Recommended Slot', 'تجویز کردہ وقت')
                                .replace('Moderate Demand', 'اوسط طلب')
                                .replace('Peak Hour Demand', 'زیادہ طلب کے اوقات')
                                .replace('Late Hours', 'دیر کے اوقات')
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Remarks comment field */}
                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                          {language === 'en' ? 'Special Instructions (Optional)' : 'خصوصی ہدایات (اختیاری)'}
                        </label>
                        <textarea
                          rows={2}
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder={language === 'en' ? "Gate codes, entry rules, etc." : "گیٹ کا کوڈ، داخلے کی معلومات وغیرہ"}
                          className={`w-full border rounded-xl p-2.5 text-2xs focus:ring-1 focus:ring-teal-500 focus:outline-none font-medium h-[46px] transition-colors duration-150 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-650' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-300'}`}
                        />
                      </div>
                    </div>

                    {/* Booking bottom container prices */}
                    <div className={`border-t pt-3 shrink-0 transition-colors duration-150 ${isDarkMode ? 'border-slate-850 bg-slate-900/60' : 'border-slate-100 bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-3.5 px-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          {language === 'en' ? 'Est. Base visiting fee' : 'اندازاً بنیادی فیس معائنہ'}
                        </span>
                        <span className="font-extrabold text-teal-600 text-xs">{language === 'en' ? 'PKR 1,500' : '1,500 روپے'}</span>
                      </div>
                      
                      <button
                        onClick={handleCreateBookingSubmit}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-all text-2xs shadow-md shadow-teal-600/10 cursor-pointer"
                      >
                        {language === 'en' ? 'Request Haazir Specialist' : 'حاضر ماہر کی درخواست کریں'}
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {customerScreen === 'tracking' && activeBooking && (
                  <div className="p-4 flex-grow flex flex-col justify-between animate-fade-in text-left">
                    
                    <div>
                      {/* Tracking Header */}
                      <div className={`flex items-center justify-between mb-4 border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">Order Tracker #</div>
                          <span className={`font-black text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{activeBooking.id}</span>
                        </div>
                        <div className={`px-2.5 py-0.5 rounded border font-bold text-[9px] tracking-wide uppercase ${isDarkMode ? 'bg-teal-950/40 text-teal-300 border-teal-900/60' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>
                          {activeBooking.status}
                        </div>
                      </div>

                      {/* Provider Profile Card */}
                      {activeBooking.provider ? (
                        <div className={`mb-4 border rounded-2xl p-3 flex items-center gap-3 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-805 border-slate-800 text-white' : 'bg-white border-slate-150'}`}>
                          <img
                            src={activeBooking.provider.avatar}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className={`font-extrabold text-2xs truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-805 text-slate-800'}`}>{activeBooking.provider.name}</div>
                            <div className="text-[9px] text-slate-400 font-medium truncate">{activeBooking.provider.specialty}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star size={9} className="text-amber-500 fill-amber-500" />
                              <span className={`text-[9px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-650'}`}>{activeBooking.provider.rating} ({activeBooking.provider.trips} jobs)</span>
                            </div>
                          </div>
                          
                          {/* Contact buttons */}
                          <div className="flex gap-1.5">
                            <button className={`w-6 h-6 rounded-full flex items-center justify-center text-teal-600 hover:scale-105 transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-750' : 'bg-slate-100 hover:bg-slate-200'}`}>
                              <Phone size={11} />
                            </button>
                            <button 
                              onClick={() => setIsChatOpen(true)}
                              className={`w-6 h-6 rounded-full border flex items-center justify-center text-teal-605 text-teal-600 hover:scale-105 transition-all relative ${
                                isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-teal-50 border-teal-200 hover:bg-teal-105 hover:bg-teal-100'
                              }`}
                              title="Chat with specialist"
                            >
                              <MessageSquare size={11} />
                              {chatMessages.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse" />
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={`mb-4 border rounded-2xl p-3 flex items-center gap-2.5 animate-pulse ${isDarkMode ? 'bg-amber-950/20 border-amber-900/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                          <ShieldAlert size={16} className="text-amber-500 shrink-0" />
                          <div className="text-[9px] leading-tight">
                            <span className="font-bold block">Broadcasting to network...</span>
                            Nearby technicians are reviewing your job invitation. Take a seat.
                          </div>
                        </div>
                      )}

                      {/* Booking status visual progress bar */}
                      {(() => {
                        const statusOrder = ['pending', 'assigned', 'in_progress', 'completed'];
                        const currentIdx = statusOrder.indexOf(activeBooking.status);
                        
                        let percentage = 15;
                        if (activeBooking.status === 'assigned') percentage = 45;
                        else if (activeBooking.status === 'in_progress') percentage = 75;
                        else if (activeBooking.status === 'completed') percentage = 100;

                        const steps = [
                          { label: language === 'en' ? 'Posted' : 'پوسٹڈ', val: 'pending', labelSub: language === 'en' ? 'Finding Tech' : 'تلاش جاری' },
                          { label: language === 'en' ? 'On Way' : 'ڈیسپیچ', val: 'assigned', labelSub: language === 'en' ? 'Heading over' : 'روانہ ہو گئے' },
                          { label: language === 'en' ? 'Active' : 'کام شروع', val: 'in_progress', labelSub: language === 'en' ? 'Repairing' : 'مرمت جاری' },
                          { label: language === 'en' ? 'Done' : 'مکمل', val: 'completed', labelSub: language === 'en' ? 'Receipt Ready' : 'رسید تیار' }
                        ];

                        return (
                          <div className={`mb-4 border rounded-2xl p-3.5 ${
                            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/50 border-slate-150'
                          }`}>
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-[10px] font-black uppercase tracking-wider ${
                                isDarkMode ? 'text-slate-350' : 'text-slate-500'
                              }`}>
                                {language === 'en' ? 'Work Status Progress' : 'سروس کی مجموعی صورتحال'}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
                                </span>
                                <span className={`text-[9.5px] font-extrabold ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                                  {percentage}% {language === 'en' ? 'COMPLETED' : 'مکمل'}
                                </span>
                              </div>
                            </div>

                            {/* Linear Progress bar slide-indicator */}
                            <div className="relative h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                              <div 
                                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-teal-500 to-teal-405 bg-teal-605 bg-teal-650 bg-teal-600 transition-all duration-1000 ease-out rounded-full shadow-inner"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>

                            {/* Stepper Nodes */}
                            <div className="flex justify-between items-start gap-1 relative">
                              {steps.map((st, sidx) => {
                                const isDone = currentIdx >= sidx;
                                const isActive = currentIdx === sidx;

                                return (
                                  <div key={st.val} className="flex-1 flex flex-col items-center text-center">
                                    <div className="relative mb-2">
                                      {isActive && (
                                        <span className="absolute -inset-1.5 rounded-full bg-teal-400/30 animate-pulse opacity-65" />
                                      )}
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border transition-all duration-500 ${
                                        isDone
                                          ? 'bg-teal-650 border-teal-550 text-white shadow-xs bg-teal-600 border-teal-500'
                                          : isDarkMode
                                            ? 'bg-slate-950 border-slate-800 text-slate-650'
                                            : 'bg-white border-slate-200 text-slate-400'
                                      }`}>
                                        {isDone ? '✓' : sidx + 1}
                                      </div>
                                    </div>
                                    <span className={`text-[9px] font-black block leading-none truncate w-full max-w-[58px] ${
                                      isActive 
                                        ? 'text-teal-650 dark:text-teal-400' 
                                        : isDone 
                                          ? 'text-slate-800 dark:text-slate-200' 
                                          : 'text-slate-400 dark:text-slate-600'
                                    }`}>
                                      {st.label}
                                    </span>
                                    <span className={`text-[7px] font-medium block mt-0.5 leading-none whitespace-nowrap opacity-80 ${
                                      isActive ? 'font-black text-rose-500' : 'text-slate-400 dark:text-slate-500'
                                    }`}>
                                      {st.labelSub}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* MAP SWITCHER SEGMENTS */}
                      <div className="flex gap-1 mb-2.5 p-1 rounded-xl bg-slate-950/25 border border-slate-200 dark:border-slate-800/80">
                        <button
                          onClick={() => setSelectedMapView('telemetry')}
                          className={`flex-1 text-center py-1.5 px-2 rounded-lg font-extrabold text-[8.5px] uppercase tracking-wider transition-all cursor-pointer ${
                            selectedMapView === 'telemetry'
                              ? 'bg-teal-600 text-white shadow-xs'
                              : isDarkMode
                                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                                : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          🌐 {language === 'en' ? 'Live Dispatch' : 'لائیو ڈیسپیچ'}
                        </button>
                        <button
                          onClick={() => setSelectedMapView('livelocation')}
                          className={`flex-1 text-center py-1.5 px-2 rounded-lg font-extrabold text-[8.5px] uppercase tracking-wider transition-all cursor-pointer ${
                            selectedMapView === 'livelocation'
                              ? 'bg-teal-600 text-white shadow-xs'
                              : isDarkMode
                                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                                : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          📍 {language === 'en' ? 'Live Location' : 'لائیو لوکیشن'}
                        </button>
                      </div>

                      {/* GRID COORDINATES MAP ROUTE VISUALIZATION */}
                      {selectedMapView === 'livelocation' ? (
                        <LiveLocationMap booking={activeBooking} isDarkMode={isDarkMode} language={language} />
                      ) : activeBooking.status === 'in_progress' ? (
                        <InProgressRouteMap booking={activeBooking} isDarkMode={isDarkMode} language={language} />
                      ) : (
                        <CoordinateGridMap booking={activeBooking} />
                      )}

                      {/* Tracker map visual steps */}
                      <div className={`border rounded-2xl p-3.5 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'}`}>
                        <div className={`font-bold text-2xs mb-1 uppercase tracking-wider ${isDarkMode ? 'text-slate-350' : 'text-slate-805 text-slate-800'}`}>Service Stages</div>
                        
                        {/* Timeline list */}
                        {[
                          { key: 'pending', title: 'Searching Provider', desc: 'Polling our network closest to you' },
                          { key: 'assigned', title: 'Provider Assigned', desc: 'Ahmed is getting tools and heading over' },
                          { key: 'in_progress', title: 'Work in Progress', desc: 'Technician is actively repairing the fault' },
                          { key: 'completed', title: 'Completed', desc: 'Work resolved. digital receipt ready' }
                        ].map((step, idx, arr) => {
                          const statusOrder = ['pending', 'assigned', 'in_progress', 'completed'];
                          const currentIdx = statusOrder.indexOf(activeBooking.status);
                          const stepIdx = statusOrder.indexOf(step.key);
                          
                          const isDone = currentIdx > stepIdx;
                          const isActive = currentIdx === stepIdx;
                          
                          return (
                            <div key={idx} className="flex gap-3 relative min-h-[36px]">
                              
                              {/* Connector line */}
                              {idx < arr.length - 1 && (
                                <div className={`absolute left-[7px] top-[15px] w-[2px] h-[calc(100%-8px)] ${
                                  isDone ? 'bg-teal-600' : isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
                                }`} />
                              )}

                              {/* Dot representation */}
                              <div className="relative z-10 mt-0.5">
                                {isDone ? (
                                  <div className="w-4 h-4 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-[9px]">
                                    ✓
                                  </div>
                                ) : isActive ? (
                                  <div className={`w-4 h-4 rounded-full border-2 border-teal-600 flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
                                  </div>
                                ) : (
                                  <div className={`w-4 h-4 rounded-full border ${isDarkMode ? 'border-slate-850 bg-slate-900 bg-slate-950' : 'border-slate-300 bg-white'}`} />
                                )}
                              </div>

                              {/* Text segment */}
                              <div className="flex-1 min-w-0">
                                <span className={`font-bold text-2xs block truncate ${
                                  isActive 
                                    ? (isDarkMode ? 'text-teal-400 font-extrabold' : 'text-teal-605 text-teal-600 font-extrabold') 
                                    : isDone 
                                    ? (isDarkMode ? 'text-slate-200' : 'text-slate-650') 
                                    : (isDarkMode ? 'text-slate-600' : 'text-slate-300')
                                }`}>
                                  {step.title}
                                </span>
                                <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">{step.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer Cancellation buttons */}
                    {activeBooking.status === 'pending' && (
                      <button
                        onClick={onCancelBooking}
                        className={`w-full mt-4 border text-2xs font-bold py-3 rounded-2xl transition-all text-center cursor-pointer ${isDarkMode ? 'bg-red-950/10 border-red-905 border-red-900/40 text-red-400 hover:bg-red-900/25' : 'bg-red-50 border-red-100 text-red-650 hover:bg-red-100/90'}`}
                      >
                        Cancel Booking Request
                      </button>
                    )}
                  </div>
                )}

                {customerScreen === 'payment' && activeBooking && (
                  <div className="p-4 flex-1 flex flex-col justify-between animate-fade-in text-left overflow-y-auto no-scrollbar font-sans select-none">
                    <div>
                      {/* Secure Title Bar */}
                      <div className="flex items-center justify-between mb-3.5 border-b border-dashed pb-2.5 transition-colors border-slate-200">
                        <div className="flex items-center gap-1.5 pb-0.5">
                          <Lock size={12} className="text-teal-600 fill-teal-600/10" />
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Secured Checkout Gateway</span>
                        </div>
                        <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${
                          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          SSL Encrypted
                        </div>
                      </div>

                      {paymentStatusState === 'form' && (
                        <div className="space-y-4 animate-fade-in">
                          {/* Mini Bill summary header */}
                          <div className={`p-3 rounded-2xl border transition-all ${
                            isDarkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-white border-slate-200 shadow-xs'
                          }`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider leading-none">Grand Total Due</span>
                                <span className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                  PKR {activeBooking.price.total * 100}
                                </span>
                              </div>
                              <span className={`text-[9px] font-bold font-mono py-1 px-2.5 rounded-lg border uppercase tracking-wider ${
                                isDarkMode ? 'bg-teal-950/20 border-teal-900 text-teal-400' : 'bg-teal-50 border-teal-100 text-teal-700'
                              }`}>
                                {activeBooking?.service} Request
                              </span>
                            </div>
                          </div>

                          {/* Stored Payment Methods selection */}
                          <div className="space-y-1.5">
                            <span className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-wider block">
                              Select Saved / Stored Payment Method
                            </span>
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
                              {[
                                { id: 'visa_xxxx', label: 'Visa **4242', info: 'Personal Card', type: 'card', logo: '💳' },
                                { id: 'master_9081', label: 'Master **9081', info: 'Business Card', type: 'card', logo: '💳' },
                                { id: 'easypaisa', label: 'EasyPaisa', info: 'Smart Wallet', type: 'wallet', logo: '🟢' },
                                { id: 'jazzcash', label: 'JazzCash', info: 'Mobile Wallet', type: 'wallet', logo: '🔴' },
                                { id: 'custom_card', label: 'Add New Card', info: 'Debit/Credit', type: 'custom', logo: '➕' }
                              ].map((item) => {
                                const selected = selectedPaymentMethodId === item.id;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedPaymentMethodId(item.id);
                                      setWalletOTPSent(false);
                                      setWalletOTP('');
                                      if (item.id === 'visa_xxxx') {
                                        setPaymentCardNumber('4242 4242 4242 4242');
                                        setPaymentCardName('AYESHA KHAN');
                                        setPaymentCardExpiry('12/29');
                                        setPaymentCardCVV('543');
                                      } else if (item.id === 'master_9081') {
                                        setPaymentCardNumber('5105 1029 9081 4455');
                                        setPaymentCardName('AYESHA KHAN');
                                        setPaymentCardExpiry('08/30');
                                        setPaymentCardCVV('128');
                                      } else if (item.id === 'custom_card') {
                                        setPaymentCardNumber('');
                                        setPaymentCardName('');
                                        setPaymentCardExpiry('');
                                        setPaymentCardCVV('');
                                      }
                                    }}
                                    className={`shrink-0 flex flex-col items-start p-2 rounded-xl border text-left transition-all cursor-pointer min-w-[85px] outline-none ${
                                      selected 
                                        ? 'border-teal-600 bg-teal-500/10 shadow-xs ring-1 ring-teal-500' 
                                        : (isDarkMode ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-900' : 'border-slate-200 bg-white hover:bg-slate-50')
                                    }`}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] shrink-0 leading-none">{item.logo}</span>
                                      <span className="font-extrabold text-[8px] tracking-tight">{item.label}</span>
                                    </div>
                                    <span className="text-[6.5px] text-slate-400 mt-0.5 leading-none block font-semibold">{item.info}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Conditional View: Wallet versus Card */}
                          {(selectedPaymentMethodId === 'easypaisa' || selectedPaymentMethodId === 'jazzcash') ? (
                            <div className="space-y-4 animate-fade-in select-none">
                              {/* Wallet Brand Mockup */}
                              <div className={`p-4 rounded-2xl text-white relative overflow-hidden shadow-xs border ${
                                selectedPaymentMethodId === 'easypaisa' 
                                  ? 'bg-gradient-to-br from-emerald-550 via-emerald-600 to-teal-800 border-emerald-400/10' 
                                  : 'bg-gradient-to-br from-red-650 via-amber-850 to-slate-900 border-red-500/10'
                              }`}>
                                <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                                
                                <div className="flex justify-between items-center mb-4">
                                  <div>
                                    <span className="text-[11px] font-black tracking-wide block uppercase leading-none">
                                      {selectedPaymentMethodId === 'easypaisa' ? '🟢 EasyPaisa Pay' : '🔴 JazzCash Wallet'}
                                    </span>
                                    <span className="text-[6.5px] text-white/75 uppercase tracking-widest mt-1 block font-bold leading-none">Instant Voucher billing</span>
                                  </div>
                                  <div className="bg-white/10 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                                    Saved Account
                                  </div>
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                  <div>
                                    <span className="text-[6px] text-white/60 uppercase tracking-wider block font-bold leading-none">Registered Mobile Number</span>
                                    <span className="text-[11px] font-bold mt-1 block leading-none font-mono">
                                      {walletPhone}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-black uppercase tracking-tight text-white font-mono bg-black/15 px-2 py-1 rounded">
                                    HA-VOUCHER
                                  </span>
                                </div>
                              </div>

                              {/* Mobile input Form logic */}
                              <div className="space-y-3">
                                <div>
                                  <label className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Account Mobile/Msisdn</label>
                                  <input 
                                    type="text"
                                    value={walletPhone}
                                    onChange={(e) => setWalletPhone(e.target.value)}
                                    placeholder="0300-1234567"
                                    className={`w-full border rounded-xl px-3 py-2 text-2xs font-mono font-bold transition-all focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                                      isDarkMode 
                                        ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-755' 
                                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-450 shadow-2xs'
                                    }`}
                                  />
                                </div>

                                {walletOTPSent ? (
                                  <div className="space-y-2 animate-slide-up">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">Enter SMS/Push OTP Code</label>
                                      <span className="text-[7.5px] text-emerald-600 font-bold uppercase tracking-wider animate-pulse">Code sent via simulated SMS</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="text"
                                        maxLength={4}
                                        value={walletOTP}
                                        onChange={(e) => setWalletOTP(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="••••"
                                        className="w-20 border rounded-xl px-3 py-2 text-center text-xs font-mono font-black tracking-widest text-teal-600 border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-teal-500/5"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const mockCode = '9201';
                                          setWalletOTP(mockCode);
                                          triggerToast('Haazir Pay security', `Pre-filled verification code ${mockCode} for testing context`, 'info');
                                        }}
                                        className="text-[7.5px] font-extrabold uppercase bg-teal-50 border border-teal-150 dark:bg-slate-905 text-teal-650 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-teal-100/50"
                                      >
                                        ⚡ Auto-fill OTP
                                      </button>
                                    </div>
                                    <span className="text-[7px] text-slate-450 block leading-tight">
                                      We sent a simulated 4-digit code to {walletPhone}. Click the prefill button if you or check notifications.
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!walletPhone.trim() || walletPhone.length < 10) {
                                        alert('Please provide a valid Pakistani 11-digit mobile number!');
                                        return;
                                      }
                                      setWalletOTPSent(true);
                                      const mockOtpVal = '9201';
                                      // Trigger toast SMS simulated dispatch
                                      setTimeout(() => {
                                        triggerToast(
                                          '💬 SMS-Simulated Alert: HAAZIR-PAY', 
                                          `Your security OTP verification code for transaction PKR ${activeBooking.price.total * 100} is [ ${mockOtpVal} ]. Do not share.`, 
                                          'chat'
                                        );
                                      }, 1000);
                                    }}
                                    className="w-full bg-slate-950 dark:bg-slate-900 border border-slate-800 text-white font-extrabold text-[8.5px] py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                                  >
                                    <span>📲 Request OTP verification code</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4 animate-fade-in select-none">
                              {/* Digital Credit Card Mockup */}
                              <div className="relative h-36 w-full rounded-2xl bg-gradient-to-tr from-slate-900 via-teal-950 to-emerald-950 p-4 text-white overflow-hidden shadow-md select-none transition-all">
                                {/* Decorative Glow */}
                                <div className="absolute right-0 top-0 w-24 h-24 bg-teal-500 rounded-full blur-2xl opacity-20 pointer-events-none" />
                                <div className="absolute left-12 bottom-0 w-16 h-16 bg-emerald-500 rounded-full blur-2xl opacity-15 pointer-events-none" />

                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-[7px] text-teal-400 uppercase tracking-widest font-black block leading-none">HAazir Premium Pay</span>
                                    <div className="w-7 h-5 bg-gradient-to-br from-amber-300 to-amber-500 rounded-sm mt-2 opacity-85 shadow-sm border border-amber-400/20 flex items-center justify-center">
                                      {/* Chip lines */}
                                      <div className="grid grid-cols-2 gap-0.5 w-4 h-3.5">
                                        <div className="border border-amber-600/30 rounded-2xs" />
                                        <div className="border border-amber-600/30 rounded-2xs" />
                                        <div className="border border-amber-600/30 rounded-2xs" />
                                        <div className="border border-amber-600/30 rounded-2xs" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {/* Visa overlay circles */}
                                    <div className="flex -space-x-1 justify-end">
                                      <div className="w-4 h-4 rounded-full bg-teal-500/80 mix-blend-screen" />
                                      <div className="w-4 h-4 rounded-full bg-emerald-400/80 mix-blend-screen" />
                                    </div>
                                    <span className="text-[7px] block font-mono text-teal-300 font-extrabold tracking-wide uppercase mt-0.5">MockCard</span>
                                  </div>
                                </div>

                                {/* Card Number display */}
                                <div className="mt-4 font-mono text-center tracking-widest text-xs font-bold leading-none text-teal-100 drop-shadow-sm select-none">
                                  {paymentCardNumber || '•••• •••• •••• ••••'}
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                  <div className="truncate pr-4 flex-1">
                                    <span className="text-[6px] text-zinc-400 uppercase tracking-wider block font-bold leading-none">Cardholder</span>
                                    <span className="text-[8px] font-bold text-white uppercase tracking-wide truncate block mt-0.5 leading-none font-mono">
                                      {paymentCardName || (currentUser?.name || 'Ayesha Khan')}
                                    </span>
                                  </div>
                                  <div className="shrink-0 flex gap-4 text-right">
                                    <div>
                                      <span className="text-[6px] text-zinc-400 uppercase tracking-wider block font-bold leading-none">Expires</span>
                                      <span className="text-[8px] font-mono font-bold text-white block mt-0.5 leading-none">
                                        {paymentCardExpiry || 'MM/YY'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[6px] text-zinc-400 uppercase tracking-wider block font-bold leading-none">CVV</span>
                                      <span className="text-[8px] font-mono font-bold text-white block mt-0.5 leading-none">
                                        {paymentCardCVV ? '•••' : '000'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Quick autofill suggestion button */}
                              {selectedPaymentMethodId === 'custom_card' && (
                                <div className="flex items-center justify-between">
                                  <span className="text-[8px] text-slate-400 font-bold select-none uppercase tracking-wider">Debit/Credit Card Details</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPaymentCardNumber('4242 4242 4242 4242');
                                      setPaymentCardName(currentUser?.name?.toUpperCase() || 'AYESHA KHAN');
                                      setPaymentCardExpiry('12/29');
                                      setPaymentCardCVV('543');
                                    }}
                                    className={`text-[8px] font-extrabold px-2 py-1 rounded-lg border flex items-center gap-1 cursor-pointer transition-all ${
                                      isDarkMode 
                                        ? 'bg-teal-950/20 border-teal-800 text-teal-400 hover:bg-teal-900/30' 
                                        : 'bg-teal-50 border-teal-100 text-teal-650 hover:bg-teal-100'
                                    }`}
                                  >
                                    ⚡ Pre-fill Test Card
                                  </button>
                                </div>
                              )}

                              {/* Real Inputs Form fields */}
                              <div className="space-y-2.5">
                                <div>
                                  <label className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Cardholder Name</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-2xs z-30 font-bold">BY:</span>
                                    <input
                                      type="text"
                                      value={paymentCardName}
                                      onChange={(e) => setPaymentCardName(e.target.value.toUpperCase())}
                                      placeholder={currentUser?.name?.toUpperCase() || 'AYESHA KHAN'}
                                      className={`w-full border rounded-xl pl-8 pr-3 py-2 text-2xs font-bold uppercase transition-all focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                                        isDarkMode 
                                          ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-750' 
                                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-450 shadow-2xs'
                                      }`}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Card Number</label>
                                  <input
                                    type="text"
                                    maxLength={19}
                                    value={paymentCardNumber}
                                    onChange={(e) => {
                                      // format card number with spaces every 4 characters
                                      const rawVal = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                      const parts = [];
                                      for (let i = 0; i < rawVal.length; i += 4) {
                                        parts.push(rawVal.substring(i, i + 4));
                                      }
                                      setPaymentCardNumber(parts.join(' '));
                                    }}
                                    placeholder="4000 1234 5678 9010"
                                    className={`w-full border rounded-xl px-3 py-2 text-2xs font-mono font-bold transition-all focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                                      isDarkMode 
                                        ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-750' 
                                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-450 shadow-2xs'
                                    }`}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Expiry Date</label>
                                    <input
                                      type="text"
                                      maxLength={5}
                                      value={paymentCardExpiry}
                                      onChange={(e) => {
                                        const cleanText = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                        if (cleanText.length > 2) {
                                          setPaymentCardExpiry(`${cleanText.slice(0, 2)}/${cleanText.slice(2, 4)}`);
                                        } else {
                                          setPaymentCardExpiry(cleanText);
                                        }
                                      }}
                                      placeholder="MM/YY"
                                      className={`w-full border rounded-xl px-3 py-2 text-2xs font-mono font-bold transition-all focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                                        isDarkMode 
                                          ? 'bg-slate-905 border-slate-800 text-white placeholder-slate-750' 
                                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-450 shadow-2xs'
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1 block">CVV Code</label>
                                    <input
                                      type="password"
                                      maxLength={3}
                                      value={paymentCardCVV}
                                      onChange={(e) => setPaymentCardCVV(e.target.value.replace(/[^0-9]/g, ''))}
                                      placeholder="•••"
                                      className={`w-full border rounded-xl px-3 py-2 text-2xs font-mono font-bold transition-all focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                                        isDarkMode 
                                          ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-750' 
                                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-450 shadow-2xs'
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {paymentStatusState === 'processing' && (
                        <div className="py-8 flex flex-col items-center justify-center text-center animate-fade-in select-none">
                          {/* Live loading ring ticker */}
                          <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
                            <span className={`absolute w-full h-full border-4 rounded-full ${isDarkMode ? 'border-slate-850' : 'border-slate-100'}`} />
                            <span className="absolute w-full h-full border-4 border-t-teal-600 border-l-teal-600 rounded-full animate-spin" />
                            <Lock size={16} className="text-teal-600 animate-pulse animate-duration-1000" />
                          </div>

                          <h4 className={`text-xs font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>Processing Payment...</h4>
                          <p className="text-slate-400 text-[10px] mt-1.5 max-w-[200px] leading-relaxed font-sans">
                            Broadcasting token authorization to bank portal via secure end-to-end sandbox.
                          </p>

                          {/* Processing steps log list details */}
                          <div className={`mt-5 w-full p-3.5 border rounded-2xl text-[9px] text-slate-400 max-w-[240px] text-left space-y-2 ${
                            isDarkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50/50 border-slate-150 shadow-2xs'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                              <span className={`font-bold flex-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Estaging secure API session</span>
                              <span className="text-teal-600 font-bold uppercase text-[8px]">ACTIVE</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                              <span className="font-semibold flex-1">Securing credit reserve approval</span>
                              <span className="text-amber-600 font-bold uppercase text-[8px] animate-pulse">LOCKING</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                              <span className="flex-1">Signing transaction invoice payload</span>
                              <span className="text-slate-400 font-normal text-[8px]">HOLD</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentStatusState === 'success' && (
                        <div className="py-2 text-center animate-fade-in select-none">
                          <div className="w-11 h-11 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-sm">
                            <CheckCircle2 size={22} className="animate-pulse" />
                          </div>
                          
                          <h4 className={`text-sm font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Payment Approved!</h4>
                          <p className="text-slate-500 text-[10px] max-w-xs mt-0.5 font-medium leading-relaxed">
                            PKR {activeBooking.price.total * 100} successfully finalized for specialist session.
                          </p>

                          {/* Printable bank voucher */}
                          <div className={`mt-4 border border-dashed rounded-2xl p-3.5 text-left text-[10px] space-y-2 relative transition-all ${
                            isDarkMode ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white border-slate-200'
                          }`}>
                            {/* ticket notches */}
                            <div className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${
                              isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
                            }`} />
                            <div className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${
                              isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
                            }`} />

                            <div className={`flex justify-between border-b pb-1.5 font-bold ${isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-150 text-slate-800'}`}>
                              <span className="uppercase tracking-wider">Receipt Ticket</span>
                              <span className="font-mono text-[8px]">ID: TXN-{activeBooking.id.split('-')[1] || Math.floor(100000 + Math.random() * 900000)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Service Customer:</span>
                              <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{currentUser?.name || 'Ayesha Khan'}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Technician/Vendor:</span>
                              <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{activeBooking.provider?.name || 'Ahmed Kamal'}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Account Source:</span>
                              <span className={`font-semibold font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                {selectedPaymentMethodId === 'easypaisa' ? 'EasyPaisa Wallet' :
                                 selectedPaymentMethodId === 'jazzcash' ? 'JazzCash Wallet' :
                                 selectedPaymentMethodId === 'master_9081' ? 'Mastercard (**9081)' :
                                 selectedPaymentMethodId === 'visa_xxxx' ? 'Visa (**4242)' :
                                 `Card ending in ${paymentCardNumber.slice(-4) || '4242'}`}
                              </span>
                            </div>
                            <div className={`border-t pt-2 mt-1.5 flex justify-between font-bold text-2xs ${isDarkMode ? 'border-slate-800' : 'border-slate-150'}`}>
                              <span className="text-teal-600">Total authorized charge</span>
                              <span className="text-teal-600">PKR {activeBooking.price.total * 100}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer dynamic button widgets */}
                    <div className="mt-3.5 pt-1 border-t border-slate-100 flex flex-col gap-2">
                      {paymentStatusState === 'form' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedPaymentMethodId === 'easypaisa' || selectedPaymentMethodId === 'jazzcash') {
                              if (!walletPhone.trim()) {
                                alert('Please provide your registered mobile number!');
                                return;
                              }
                              if (!walletOTPSent) {
                                alert('Please click "Request OTP verification code" first to verify your phone number!');
                                return;
                              }
                              if (!walletOTP.trim() || walletOTP.length < 4) {
                                alert('Please enter the 4-digit SMS OTP code sent to your phone! (Hint: use Auto-fill OTP)');
                                return;
                              }
                            } else {
                              if (!paymentCardNumber.trim() || paymentCardNumber.length < 15) {
                                alert('Please provide a valid credit card number!');
                                return;
                              }
                              if (!paymentCardName.trim()) {
                                alert('Please enter the Cardholder Name!');
                                return;
                              }
                              if (!paymentCardExpiry.trim() || paymentCardExpiry.length < 5) {
                                alert('Please specify expiration as MM/YY!');
                                return;
                              }
                              if (!paymentCardCVV.trim() || paymentCardCVV.length < 3) {
                                alert('Please specify the 3-digit CVV secure code!');
                                return;
                              }
                            }

                            // Advance to processor loader screen
                            setPaymentStatusState('processing');
                            setTimeout(() => {
                              setPaymentStatusState('success');
                            }, 1800);
                          }}
                          className="w-full bg-teal-600 hover:bg-teal-700 active:scale-99 text-white font-black text-2xs py-3.5 rounded-2xl shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Lock size={12} className="shrink-0 text-teal-100" />
                          Pay PKR {activeBooking.price.total * 100} Securely
                        </button>
                      )}

                      {paymentStatusState === 'success' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsPaid(true); // Switch client Screen state to ratings feedback panel
                          }}
                          className="w-full bg-teal-600 hover:bg-teal-700 active:scale-99 text-white font-extrabold text-2xs py-3.5 rounded-2xl shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                        >
                          Proceed to Rate Technician
                          <ArrowRight size={13} />
                        </button>
                      )}

                      {paymentStatusState === 'form' && (
                        <div className="text-center font-bold text-[8px] text-slate-400 select-none flex items-center justify-center gap-1 uppercase tracking-wide">
                          <Lock size={8.5} />
                          Encrypted transaction. No real credit card information is required.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {customerScreen === 'completed' && activeBooking && (
                  <div className="p-4 flex-1 flex flex-col justify-between animate-fade-in text-left">
                    <div className="flex-1">
                      
                      {/* Success Card banner */}
                      <div className="text-center py-4 select-none">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2.5 ${isDarkMode ? 'bg-teal-950/45 text-teal-400' : 'bg-teal-50 text-teal-650'}`}>
                          <CheckCircle2 size={24} />
                        </div>
                        <h4 className={`text-sm font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Work Completed!</h4>
                        <p className="text-slate-500 text-[10px] max-w-xs mt-0.5 font-medium">Ahmed Kamal successfully completed your request.</p>
                      </div>

                      {/* Invoice Itemized receipt breakdown */}
                      <div className={`border rounded-2xl p-3.5 mb-4 shadow-sm transition-colors duration-150 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'}`}>
                        <div className={`flex items-center gap-1.5 font-bold text-2xs mb-2.5 border-b pb-1.5 ${isDarkMode ? 'text-white border-slate-800' : 'text-slate-800 border-slate-150'}`}>
                          <Receipt size={13} className={isDarkMode ? 'text-slate-400' : 'text-slate-450'} />
                          <span className="uppercase tracking-wider">Bill Summary</span>
                        </div>
                        
                        <div className="space-y-1.5 text-[10px]">
                          <div className="flex justify-between text-slate-500">
                            <span>Base inspection fee</span>
                            <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>PKR {activeBooking.price.base * 100}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Material Estimate & Labor</span>
                            <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>PKR {activeBooking.price.work * 100}</span>
                          </div>
                          <div className={`flex justify-between text-slate-500 border-b pb-1.5 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <span>Platform fee & taxes (5%)</span>
                            <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>PKR {activeBooking.price.tax * 100}</span>
                          </div>
                          
                          <div className="pt-2 flex justify-between font-bold text-sm mt-1">
                            <span>Total Cash Amount</span>
                            <span className={`font-extrabold ${isDarkMode ? 'text-teal-400' : 'text-teal-650'}`}>PKR {activeBooking.price.total * 100}</span>
                          </div>
                        </div>

                        {/* Interactive receipt view & download triggers */}
                        <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1">
                          <span className="text-[7.5px] uppercase font-black text-slate-400 tracking-wider">Record Vault:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReceiptBooking(activeBooking);
                              setShowReceiptModal(true);
                            }}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-2.5 py-1 rounded-lg text-[8px] flex items-center gap-1 transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
                          >
                            <Download size={9} />
                            <span>Download Receipt PDF</span>
                          </button>
                        </div>
                      </div>

                      {/* Ratings component */}
                      <div className={`border rounded-2xl p-4 text-center transition-colors duration-150 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'}`}>
                        <div className={`font-bold text-2xs ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Rate your technician</div>
                        <p className="text-[10px] text-zinc-400 mt-0.5 mb-3">Help maintain the best local technician roster</p>

                        {/* Star buttons */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              onClick={() => setStars(s)}
                              className="text-neutral-200 hover:scale-110 transition-all cursor-pointer"
                            >
                              <Star 
                                size={26} 
                                className={s <= stars ? 'text-amber-405 text-amber-400 fill-amber-400' : isDarkMode ? 'text-slate-700' : 'text-neutral-200'} 
                              />
                            </button>
                          ))}
                        </div>

                        {/* Ratings comments input */}
                        <textarea
                          rows={2}
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder="What did the technician solve particularly well?"
                          className={`w-full border rounded-xl p-2.5 text-2xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none h-[50px] text-left mb-3 transition-colors duration-150 ${isDarkMode ? 'bg-slate-950 border-slate-850 text-white placeholder-slate-650' : 'bg-slate-50 border-slate-150 border-slate-200 text-slate-850 placeholder-slate-400'}`}
                        />

                        <button
                          onClick={handleCustomerRatingSubmit}
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-2xs hover:scale-[1.01] transition-all cursor-pointer"
                        >
                          Submit & Archive
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {customerScreen === 'bookings' && (
                  <div className="p-4 flex-1 flex flex-col justify-start animate-fade-in text-left overflow-y-auto">
                    <div className="flex items-center justify-between mb-4 select-none">
                      <h3 className={`text-sm font-extrabold tracking-tight font-sans ${isDarkMode ? 'text-white' : 'text-slate-808 text-slate-800'}`}>Booking History</h3>
                      <button 
                        onClick={() => setCustomerScreen('home')}
                        className={`text-[10px] font-bold border px-2 py-1 rounded-lg font-sans transition-colors ${
                          isDarkMode 
                            ? 'border-slate-800 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-900' 
                            : 'border-slate-200 text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-50'
                        }`}
                      >
                        ← Services
                      </button>
                    </div>

                    {/* FILTER TOGGLE BUTTONS - Segmented Switch */}
                    <div className={`flex p-1 rounded-xl mb-4 text-[10px] font-black tracking-tight select-none border transition-colors duration-150 ${
                      isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-150'
                    }`}>
                      {(['Active', 'Completed', 'Cancelled'] as const).map((filterOpt) => {
                        const isSelected = bookingFilter === filterOpt;
                        let count = 0;
                        if (filterOpt === 'Active') {
                          count = allBookings.filter(b => b.status === 'pending' || b.status === 'assigned' || b.status === 'in_progress').length;
                        } else if (filterOpt === 'Completed') {
                          count = allBookings.filter(b => b.status === 'completed').length;
                        } else if (filterOpt === 'Cancelled') {
                          count = allBookings.filter(b => b.status === 'cancelled').length;
                        }

                        return (
                          <button
                            key={filterOpt}
                            type="button"
                            onClick={() => setBookingFilter(filterOpt)}
                            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                              isSelected 
                                ? 'bg-teal-600 text-white font-extrabold shadow-sm' 
                                : isDarkMode 
                                ? 'text-slate-400 hover:text-white font-bold' 
                                : 'text-slate-505 text-slate-500 hover:text-slate-800 font-bold'
                            }`}
                          >
                            <span>{filterOpt}</span>
                            <span className={`text-[8px] px-1.5 py-0.2 rounded-full ${
                              isSelected 
                                ? (isDarkMode ? 'bg-teal-800 text-teal-200' : 'bg-teal-700 text-white') 
                                : (isDarkMode ? 'bg-slate-800 text-slate-400 font-bold' : 'bg-slate-200 text-slate-600 font-bold')
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* FILTERED BOOKING TICKETS LIST */}
                    <div className="space-y-3 flex-1 pb-12">
                      {(() => {
                        const filtered = allBookings.filter(b => {
                          if (bookingFilter === 'Active') {
                            return b.status === 'pending' || b.status === 'assigned' || b.status === 'in_progress';
                          } else if (bookingFilter === 'Completed') {
                            return b.status === 'completed';
                          } else {
                            return b.status === 'cancelled';
                          }
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className={`text-center py-10 px-4 select-none border border-dashed rounded-2xl mt-2 mb-4 animate-fade-in font-sans transition-colors duration-155 ${
                              isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-202 border-slate-200 bg-slate-50/50'
                            }`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2.5 transition-colors ${
                                isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-450'
                              }`}>
                                <Briefcase size={18} />
                              </div>
                              <h4 className={`text-[11px] font-bold uppercase tracking-wide ${isDarkMode ? 'text-slate-305 text-slate-300' : 'text-slate-700'}`}>No {bookingFilter} Bookings</h4>
                              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-normal">
                                {bookingFilter === 'Active' 
                                  ? 'You do not have any active appointments running. Request a technician to begin!'
                                  : bookingFilter === 'Completed'
                                  ? 'No completed invoices yet. Your completed jobs will archive here.'
                                  : 'No cancelled requests recorded.'}
                              </p>
                              {bookingFilter === 'Active' && (
                                <button
                                  onClick={() => setCustomerScreen('home')}
                                  className="mt-3 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-[9px] font-extrabold shadow-sm transition-all cursor-pointer font-sans"
                                >
                                  Book a Technician
                                </button>
                              )}
                            </div>
                          );
                        }

                        return filtered.map((b) => {
                          const isCurrentlyActive = activeBooking && activeBooking.id === b.id;
                          return (
                            <div 
                              key={b.id} 
                              className={`border p-3.5 shadow-sm flex flex-col justify-between animate-fade-in relative transition-all border-l-4 border-l-teal-600 font-sans ${
                                isDarkMode 
                                  ? 'bg-slate-900 border-slate-805 border-slate-800 hover:border-slate-700' 
                                  : 'bg-white border-slate-202 border-slate-200 hover:border-slate-350'
                              }`}
                            >
                              {/* Header category / ticket number info */}
                              <div className={`flex justify-between items-start mb-2 pb-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    {isCurrentlyActive && <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />}
                                    <span className={`text-[10px] font-extrabold uppercase font-mono tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{b.service} ({b.id})</span>
                                  </div>
                                  <p className={`text-[11px] font-black tracking-tight mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{b.subService}</p>
                                </div>
                                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wide leading-none ${
                                  b.status === 'pending' ? (isDarkMode ? 'bg-amber-950/20 text-amber-400 border-amber-900/50 animate-pulse' : 'bg-amber-50 text-amber-600 border-amber-150 animate-pulse') :
                                  b.status === 'assigned' || b.status === 'in_progress' ? (isDarkMode ? 'bg-teal-950/40 text-teal-300 border-teal-900/55' : 'bg-teal-50 text-teal-650 border-teal-150') :
                                  b.status === 'completed' ? (isDarkMode ? 'bg-slate-950/40 text-slate-405 text-slate-400 border-slate-801 border-slate-800' : 'bg-slate-50 text-slate-650 border-slate-200') :
                                  (isDarkMode ? 'bg-red-955 bg-red-950/30 text-red-400 border-red-900/50' : 'bg-red-50 text-red-655 border-red-150')
                                }`}>
                                  {b.status}
                                </span>
                              </div>

                              {/* Body meta specs */}
                              <div className="space-y-1 text-[10px] font-medium mb-3">
                                <div className="flex items-start gap-1">
                                  <MapPin size={11} className="text-slate-400 shrink-0 mt-0.5" />
                                  <span className={`leading-tight truncate max-w-[210px] ${isDarkMode ? 'text-slate-300' : 'text-slate-655'}`}>{b.address}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar size={11} className="text-slate-400 shrink-0" />
                                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-655'}>{b.slot}</span>
                                </div>
                              </div>

                              {/* Footer cost & button container */}
                              <div className="flex items-center justify-between mt-1">
                                <div>
                                  <span className="text-[8px] text-slate-450 text-slate-400 uppercase tracking-wider block font-bold leading-none animate-fade-in">Job Quote</span>
                                  <span className="text-teal-600 font-black text-xs">PKR {b.price.total * 100}</span>
                                </div>

                                <div className="flex gap-1.5 font-bold">
                                  {isCurrentlyActive ? (
                                    <>
                                      <button
                                        onClick={() => setCustomerScreen('tracking')}
                                        className="bg-teal-600 hover:bg-teal-700 text-white text-[9px] font-extrabold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                                      >
                                        <Activity size={10} />
                                        Track Progress
                                      </button>
                                      {b.status === 'pending' && (
                                        <button
                                          onClick={onCancelBooking}
                                          className={`text-[9px] font-extrabold py-1.5 px-2.5 rounded-lg transition-all cursor-pointer border ${isDarkMode ? 'bg-red-950/20 border-red-900/40 text-red-400 hover:bg-red-900/30' : 'bg-red-50 border-red-100 text-red-650 hover:text-red-750'}`}
                                        >
                                          Cancel
                                        </button>
                                      )}
                                    </>
                                  ) : b.status === 'completed' ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedReceiptBooking(b);
                                        setShowReceiptModal(true);
                                      }}
                                      className="bg-teal-50 dark:bg-teal-950/40 text-teal-650 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40 text-[8.5px] font-black py-1 px-2 rounded flex items-center gap-1 transition-all cursor-pointer hover:scale-[1.02]"
                                    >
                                      <Receipt size={11} className="text-teal-500" />
                                      <span>View Receipt</span>
                                    </button>
                                  ) : b.status === 'cancelled' ? (
                                    <div className="flex items-center gap-1 text-red-500 text-[9px] font-sans">
                                      <XCircle size={12} className="text-red-400" />
                                      <span>Cancelled</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        alert(`Archived ${b.service} repair of ticket ${b.id}`);
                                      }}
                                      className={`border text-[9px] font-extrabold py-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${isDarkMode ? 'border-slate-800 text-slate-350 bg-slate-900 hover:bg-slate-800' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'}`}
                                    >
                                      Receipt
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* ========================================================= */
              /* PROVIDER / WORKER MAIN DASHBOARD STATE                    */
              /* ========================================================= */
              <div className="p-4 flex-1 flex flex-col justify-between animate-fade-in text-left">
                
                <div>
                  {/* Provider Header details */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => setShowWorkerProfile(true)}
                      className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-85 transition-all outline-none"
                      title="View Detailed Profile"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80"
                        alt="worker profile"
                        className={`w-9 h-9 rounded-full object-cover border-2 shrink-0 ${
                          isWorkerOnline ? 'border-teal-600' : 'border-slate-300'
                        }`}
                      />
                      <div>
                        <div className="font-extrabold text-slate-800 text-2xs truncate max-w-[105px] flex items-center gap-1">
                          <span>{currentUser?.name || 'Ahmed Kamal'}</span>
                          <span className="text-[7px] text-teal-600 dark:text-teal-400 font-extrabold">PRO</span>
                        </div>
                        <span className="text-[9px] text-slate-450 font-semibold uppercase tracking-wider block">{currentUser?.specialty || 'Electrician'}</span>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={onLogout}
                        className="text-[9px] font-extrabold text-rose-500 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 px-2 py-1 rounded-lg cursor-pointer transition-all shrink-0"
                      >
                        Sign out
                      </button>

                      {/* Availability Dot status Badge */}
                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold border flex items-center gap-1 ${
                        isWorkerOnline ? 'bg-teal-50 text-teal-700 border-teal-150' : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${isWorkerOnline ? 'bg-teal-600 animate-pulse' : 'bg-slate-400'}`} />
                        <span>{isWorkerOnline ? 'ON' : 'OFF'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Online availability switch Card */}
                  <div className="bg-white border border-slate-250/70 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-2xs">Work Availability Status</div>
                      <p className="text-[9px] text-slate-450 mt-0.5 max-w-[190px]">Turn online to connect with nearby labor requests.</p>
                    </div>
                    
                    <button
                      onClick={onToggleWorkerOnline}
                      className={`w-10 h-6 rounded-full p-0.5 flex items-center transition-all cursor-pointer ${
                        isWorkerOnline ? 'bg-teal-600 justify-end' : 'bg-slate-200 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>

                  {/* Earnings dashboard strip */}
                  <div className={`grid grid-cols-3 gap-2 border rounded-2xl p-3 mb-4 text-center ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-250/70'
                  }`}>
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Today's cash</div>
                      <div className={`font-black text-2xs mt-0.5 ${isDarkMode ? 'text-teal-400' : 'text-teal-650'}`}>PKR 4,800</div>
                    </div>
                    <div className="border-x border-slate-100">
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Accept rate</div>
                      <div className={`font-extrabold text-2xs mt-0.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-850'}`}>92%</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">My Rating</div>
                      <button
                        type="button"
                        onClick={() => setShowWorkerProfile(true)}
                        className="flex items-center justify-center gap-0.5 font-bold text-2xs mt-0.5 mx-auto hover:text-teal-650 cursor-pointer transition-all outline-none"
                        title="View Completed Jobs & Ratings"
                      >
                        <Star size={9} className="text-amber-500 fill-amber-300 animate-pulse shrink-0" />
                        <span className={isDarkMode ? 'text-slate-100' : 'text-slate-850'}>4.88</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowWorkerProfile(true)}
                        className="text-[6.5px] text-teal-600 dark:text-teal-400 font-extrabold block mx-auto hover:underline cursor-pointer tracking-wider mt-0.5 uppercase"
                      >
                        Reviews &gt;
                      </button>
                    </div>
                  </div>

                  {/* Section tabs for Worker */}
                  <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-1 rounded-xl mb-4 gap-1 select-none">
                    <button
                      type="button"
                      onClick={() => setWorkerTab('jobs')}
                      className={`flex-1 text-center py-1.5 rounded-lg text-3xs font-extrabold cursor-pointer transition-all ${
                        workerTab === 'jobs'
                          ? 'bg-white dark:bg-slate-805 text-teal-650 dark:text-teal-400 shadow-sm border border-slate-200/20 dark:border-slate-700/35'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      Active Requests
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkerTab('insights')}
                      className={`flex-1 text-center py-1.5 rounded-lg text-3xs font-extrabold cursor-pointer transition-all ${
                        workerTab === 'insights'
                          ? 'bg-white dark:bg-slate-805 text-teal-650 dark:text-teal-400 shadow-sm border border-slate-200/20 dark:border-slate-700/35'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      Market Insights
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkerTab('analytics')}
                      className={`flex-1 text-center py-1.5 rounded-lg text-3xs font-extrabold cursor-pointer transition-all ${
                        workerTab === 'analytics'
                          ? 'bg-white dark:bg-slate-805 text-teal-650 dark:text-teal-400 shadow-sm border border-slate-200/20 dark:border-slate-700/35'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      Analytics Trends
                    </button>
                  </div>

                  {workerTab === 'jobs' && (
                    <>
                      {/* JOB ASSIGNMENT STACK PANEL (technician accepted a job) */}
                      {activeBooking && activeBooking.status !== 'pending' && activeBooking.status !== 'completed' && (
                        <div className={`p-3 border rounded-2xl mb-4 text-left shadow-sm ${
                          isDarkMode ? 'bg-slate-900 border-teal-500/30 shadow-teal-900/10' : 'bg-white border-teal-600/40'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold py-0.5 px-2 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 rounded border border-teal-100/30">
                              STAGE: {activeBooking.status.toUpperCase()}
                            </span>
                            <span className="font-black text-teal-650 text-2xs">PKR {activeBooking.price.total * 100}</span>
                          </div>

                          <div className={`font-bold text-xs mb-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-850'}`}>
                            {activeBooking.service} - {activeBooking.subService}
                          </div>

                          <div className="space-y-1 text-[9.5px]">
                            <div className={`flex items-start gap-1 leading-tight ${isDarkMode ? 'text-slate-350' : 'text-slate-600'}`}>
                              <MapPin size={11} className="text-teal-600 mt-0.5 shrink-0" />
                              <span>{activeBooking.address}</span>
                            </div>
                            <div className={`flex items-start gap-1 italic p-1.5 rounded border mt-2 ${
                              isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-450' : 'bg-slate-50 border-slate-100 text-slate-500'
                            }`}>
                              <span className={`font-bold shrink-0 mr-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-750'}`}>Remarks:</span>
                              <span className="truncate">{activeBooking.description}</span>
                            </div>
                          </div>

                          {/* MAP SWITCHER SEGMENTS */}
                          <div className="flex gap-1 mb-2.5 mt-2.5 p-1 rounded-xl bg-slate-950/25 border border-slate-200 dark:border-slate-800/80">
                            <button
                              onClick={() => setSelectedMapView('telemetry')}
                              className={`flex-1 text-center py-1 rounded-md font-extrabold text-[8.5px] uppercase tracking-wider transition-all cursor-pointer ${
                                selectedMapView === 'telemetry'
                                  ? 'bg-teal-600 text-white shadow-xs'
                                  : isDarkMode
                                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                                    : 'text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              🌐 {language === 'en' ? 'Live Dispatch' : 'لائیو ڈیسپیچ'}
                            </button>
                            <button
                              onClick={() => setSelectedMapView('livelocation')}
                              className={`flex-1 text-center py-1 rounded-md font-extrabold text-[8.5px] uppercase tracking-wider transition-all cursor-pointer ${
                                selectedMapView === 'livelocation'
                                  ? 'bg-teal-600 text-white shadow-xs'
                                  : isDarkMode
                                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                                    : 'text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              📍 {language === 'en' ? 'Live Location' : 'لائیو لوکیشن'}
                            </button>
                          </div>

                          {/* SERVICE DISPATCH COORDINATE TRACKER */}
                          {selectedMapView === 'livelocation' ? (
                            <LiveLocationMap booking={activeBooking} isDarkMode={isDarkMode} language={language} />
                          ) : activeBooking.status === 'in_progress' ? (
                            <InProgressRouteMap booking={activeBooking} isDarkMode={isDarkMode} language={language} />
                          ) : (
                            <CoordinateGridMap booking={activeBooking} />
                          )}

                          {/* Worker Action buttons grid */}
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <button
                              onClick={() => setIsChatOpen(true)}
                              className={`relative font-extrabold p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 text-2xs transition-all cursor-pointer ${
                                isDarkMode 
                                  ? 'bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850' 
                                  : 'bg-teal-50 border border-teal-150 text-teal-750 hover:bg-teal-100'
                              }`}
                            >
                              <MessageSquare size={11} className="text-teal-600" />
                              <span>Chat Client</span>
                              {chatMessages.length > 0 && (
                                <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse" />
                              )}
                            </button>
                            <button
                              onClick={onAdvanceJob}
                              className="bg-teal-600 hover:bg-teal-700 text-white font-bold p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 text-2xs transition-all shadow-md shadow-teal-600/10 cursor-pointer"
                            >
                              <Power size={11} />
                              <span>{activeBooking.status === 'assigned' ? 'Arrived' : 'Completed'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* PENDING JOB INVITATION FEED DECK */}
                      <div>
                        <h5 className={`font-bold text-xs mb-2 ${isDarkMode ? 'text-slate-250' : 'text-slate-800'}`}>Nearby Job Requests ({jobInvites.length})</h5>
                        
                        {!isWorkerOnline ? (
                          <div className={`border rounded-2xl p-5 text-center ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-205 text-slate-450'}`}>
                            <Power size={24} className="mx-auto mb-2 text-slate-300" />
                            <span className="font-extrabold text-[10px] uppercase tracking-widest block">Offline Status</span>
                            <p className="text-[9px] text-slate-400 mt-1 leading-snug">Please toggle Online switch to scan for incoming plumber/electrician coordinates.</p>
                          </div>
                        ) : jobInvites.length === 0 ? (
                          <div className={`border rounded-2xl p-6 text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className="relative inline-block mb-2">
                              <Activity size={24} className="text-teal-600 animate-pulse" />
                              <div className="absolute inset-0 bg-teal-400 rounded-full scale-150 animate-ping opacity-15" />
                            </div>
                            <span className="font-bold text-[10px] text-teal-600 uppercase block">Searching for client signals</span>
                            <p className="text-[9px] text-slate-400 mt-1 max-w-[190px] mx-auto">Waiting for localized customer bookings nearby.</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {jobInvites.map((invite) => (
                              <div key={invite.id} className={`border rounded-2xl p-3.5 relative shadow-xs text-left ${
                                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                              }`}>
                                
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className="text-[9px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 py-0.5 px-1.5 rounded uppercase border border-teal-100/30">
                                    {invite.service} Offer
                                  </span>
                                  <span className="font-extrabold text-teal-650 text-xs text-right">
                                    PKR {invite.price.total * 100}
                                  </span>
                                </div>

                                <div className={`font-bold text-2xs truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-805'}`}>
                                  {invite.subService}
                                </div>
                                
                                <div className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                                  <MapPin size={9} className="text-slate-400" />
                                  <span className="truncate">{invite.address}</span>
                                </div>

                                <div className="text-[9px] text-teal-600 font-bold mt-1 flex items-center gap-1 mb-3">
                                  <Activity size={9} />
                                  <span>{invite.distance} • Immediate help coordinates</span>
                                </div>

                                {/* Accept/Decline action block */}
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => onDeclineJob(invite.id)}
                                    className={`font-bold p-2 rounded-lg text-[10px] text-center transition-all cursor-pointer ${
                                      isDarkMode ? 'bg-slate-800 text-slate-355 hover:bg-slate-750' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                  >
                                    Decline
                                  </button>
                                  <button
                                    onClick={() => onAcceptJob(invite.id)}
                                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold p-2 rounded-lg text-[10px] text-center transition-all cursor-pointer shadow-sm"
                                  >
                                    Accept Job
                                  </button>
                                </div>

                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {workerTab === 'insights' && (
                    /* INSIGHTS / ANALYTICS DISPLAY PANEL WITH RECHARTS */
                    <div className="space-y-3 animate-fade-in pb-2">
                      {/* Summary card */}
                      <div className={`p-3 border rounded-2xl flex items-start gap-2 text-left ${
                        isDarkMode ? 'bg-slate-900 border-slate-800/80 text-slate-250' : 'bg-teal-50/55 border-teal-100 text-slate-800'
                      }`}>
                        <div className="w-6 h-6 rounded-full bg-teal-500/10 bg-teal-100 flex items-center justify-center text-teal-600 shrink-0 border border-teal-200/10">
                          <Activity size={10} className="animate-pulse" />
                        </div>
                        <div>
                          <h6 className={`font-black text-[9px] uppercase tracking-wide ${isDarkMode ? 'text-teal-400' : 'text-teal-900'}`}>Labor Market Analytics</h6>
                          <p className="text-[8.5px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                            Real-time platform completion levels and regional service popularity indexes analyzed for Lahore specialists.
                          </p>
                        </div>
                      </div>

                      {/* Row 1: Pie/Donut Chart */}
                      <div className={`p-3 border rounded-2xl ${
                        isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200/70'
                      }`}>
                        <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider block mb-2 text-left">
                          Your Completion Rate
                        </span>
                        
                        <div className="flex items-center gap-3">
                          {/* Centered Donut Pie Chart */}
                          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={OUTCOME_DATA}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={20}
                                  outerRadius={28}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {OUTCOME_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute text-center select-none">
                              <span className={`text-[10px] font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>92%</span>
                              <span className="text-[5px] text-slate-400 block font-bold uppercase leading-none">Done</span>
                            </div>
                          </div>

                          {/* Legend / Metrics */}
                          <div className="flex-1 min-w-0 text-left space-y-1">
                            <div className="flex items-center justify-between text-[8px] font-bold">
                              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <span className="w-1 h-1 bg-teal-600 rounded-full" />
                                Completed
                              </span>
                              <span className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>47 (92%)</span>
                            </div>
                            <div className="flex items-center justify-between text-[8px] font-bold">
                              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <span className="w-1 h-1 bg-rose-500 rounded-full" />
                                Cancelled
                              </span>
                              <span className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>4 (8%)</span>
                            </div>
                            <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 justify-between text-[7px] font-black text-teal-600 dark:text-teal-400">
                              <span>🏆 Gold Level Specialist</span>
                              <span>+1.5% bonus rate</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Trend Area Chart */}
                      <div className={`p-3 border rounded-2xl ${
                        isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200/70'
                      }`}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider block text-left">
                            Job Success Trend
                          </span>
                          <span className="text-[7.5px] font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1 rounded border border-teal-100/20">
                            +8% Since Wk 1
                          </span>
                        </div>

                        <div className="h-20 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={COMPLETION_TREND_DATA} margin={{ top: 2, right: 2, left: -26, bottom: -5 }}>
                              <defs>
                                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25}/>
                                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="label" stroke="#94a3b8" fontSize={7} fontWeight="bold" tickLine={false} axisLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={7} fontWeight="bold" domain={[70, 100]} tickLine={false} axisLine={false} />
                              <Tooltip 
                                contentStyle={{ 
                                  fontSize: '7.5px', 
                                  padding: '4px', 
                                  borderRadius: '6px', 
                                  background: isDarkMode ? '#0f172a' : '#ffffff',
                                  border: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                                  color: isDarkMode ? '#f8fafc' : '#0f172a'
                                }} 
                                labelStyle={{ fontWeight: 'black', color: '#0d9488' }}
                              />
                              <Area type="monotone" dataKey="rate" stroke="#0d9488" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRate)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Row 3: Category demand Bar Chart */}
                      <div className={`p-3 border rounded-2xl ${
                        isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200/70'
                      }`}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider block text-left">
                            Active Category Popularity
                          </span>
                          <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest">
                            Volume index
                          </span>
                        </div>

                        <div className="h-24 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={CATEGORY_POPULARITY_DATA} layout="vertical" margin={{ top: 2, right: 5, left: -14, bottom: 0 }}>
                              <XAxis type="number" hide />
                              <YAxis 
                                dataKey="name" 
                                type="category" 
                                stroke="#94a3b8" 
                                fontSize={7.5} 
                                fontWeight="bold" 
                                tickLine={false} 
                                axisLine={false}
                                width={54}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  fontSize: '7.5px', 
                                  padding: '4px', 
                                  borderRadius: '6px', 
                                  background: isDarkMode ? '#0f172a' : '#ffffff',
                                  border: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                                  color: isDarkMode ? '#f8fafc' : '#0f172a'
                                }}
                              />
                              <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={8}>
                                {CATEGORY_POPULARITY_DATA.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={
                                      index === 0 ? '#fbbf24' : // Amber
                                      index === 1 ? '#0d9488' : // Teal
                                      index === 2 ? '#3b82f6' : // Blue
                                      '#8b5cf6'                 // Purple
                                    } 
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {workerTab === 'analytics' && (
                    <Analytics bookings={allBookings || []} isDarkMode={isDarkMode} />
                  )}
                </div>

                {/* Switch indicator */}
                <span className="block text-[8px] text-slate-400 font-medium text-center italic">
                  Tap 'Customer View' in header to change perspectives
                </span>

                {showWorkerProfile && (
                  <WorkerProfile 
                    currentUser={currentUser}
                    bookings={allBookings || []}
                    isDarkMode={isDarkMode}
                    onClose={() => setShowWorkerProfile(false)}
                  />
                )}

              </div>
            )}

          {/* Booking Success Animation Overlay */}
          {showBookingSuccessAnimation && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-[110] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in pointer-events-auto">
              {/* Confetti element decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <span className="absolute top-12 left-1/4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping delay-75" />
                <span className="absolute top-1/4 right-8 w-2 h-2 bg-pink-500 rotate-12 rounded-xs animate-bounce" />
                <span className="absolute bottom-24 left-12 w-1.5 h-3 bg-teal-400 -rotate-45 rounded-full animate-bounce delay-300" />
                <span className="absolute bottom-1/3 right-1/4 w-2 h-1 bg-amber-400 rotate-45 animate-ping delay-500" />
              </div>

              {/* Pulsing Outer rings */}
              <div className="relative mb-6 flex items-center justify-center">
                <div className="absolute w-28 h-28 bg-teal-500/10 rounded-full animate-ring-pulse duration-2000" />
                <div className="absolute w-20 h-20 bg-teal-500/20 rounded-full animate-ring-pulse delay-500" />
                
                {/* The main scaling ball */}
                <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center text-white border-2 border-teal-400/30 shadow-2xl animate-scale-up-bounce">
                  {/* Big Check icon from lucide-react */}
                  <Check className="text-white stroke-[4]" size={28} />
                </div>
              </div>

              {/* Text descriptions in English & Urdu */}
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                {language === 'en' ? 'Request Placed!' : 'درخواست کامیابی سے موصول ہوئی'}
              </h3>
              
              <p className="text-[10px] text-slate-300 font-medium leading-relaxed max-w-[190px] mx-auto mb-6">
                {language === 'en' 
                  ? 'Your expert Haazir specialist is being recruited. Track dispatch in real-time!' 
                  : 'آپ کے لیے بہترین سروس فراہم کنندہ تلاش کیا جا رہا ہے۔ لائیو صورتحال دیکھیں۔'}
              </p>

              {/* Dismiss Button */}
              <button
                onClick={() => setShowBookingSuccessAnimation(false)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[10px] uppercase tracking-wider py-2.5 px-6 rounded-xl transition-all cursor-pointer shadow-md shadow-teal-700/20 active:scale-95 flex items-center gap-1.5"
              >
                <span>{language === 'en' ? 'Track Dispatch' : 'لائیو ٹریک کریں'}</span>
                <ArrowRight size={11} />
              </button>
            </div>
          )}

          {/* Rate Experience Modal Pop-up */}
          {showRatingModal && role === 'customer' && activeBooking && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-[100] flex items-end justify-center animate-fade-in pointer-events-auto">
              <div 
                className={`w-full max-h-[85%] rounded-t-[32px] p-5 pb-8 flex flex-col justify-between text-left shadow-2xl animate-slide-up ${
                  isDarkMode ? 'bg-slate-900 border-t border-slate-800 text-white' : 'bg-white border-t border-slate-200'
                }`}
              >
                <div>
                  {/* Decorative grab-handle */}
                  <div className="w-10 h-1 bg-slate-400/20 rounded-full mx-auto mb-4" />

                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-teal-400' : 'text-teal-650'}`}>
                      {t('rate_experience')}
                    </h3>
                    <button 
                      onClick={() => setShowRatingModal(false)}
                      className={`text-sm font-bold border rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-colors ${
                        isDarkMode ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-150 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      &times;
                    </button>
                  </div>

                  {/* Vetted Worker Badge Card */}
                  <div className={`p-3 rounded-2xl border flex items-center gap-3 mb-4 ${
                    isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-150'
                  }`}>
                    <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center font-bold text-teal-650 border border-teal-500/20 text-xs shrink-0 select-none">
                      {activeBooking.provider?.name?.split(' ').map((n: string) => n[0]).join('') || 'AK'}
                    </div>
                    <div>
                      <div className={`font-black text-[11px] flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        <span>{activeBooking.provider?.name || 'Ahmed Kamal'}</span>
                        <span className="text-teal-650 font-black">✓</span>
                      </div>
                      <p className="text-[9.5px] text-slate-400 font-bold uppercase leading-none mt-0.5">
                        {activeBooking.service} Specialist
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="text-[8px] text-slate-400 block font-bold uppercase">Cash Due</span>
                      <span className={`text-[10px] font-black ${isDarkMode ? 'text-teal-400' : 'text-teal-650'}`}>
                        PKR {activeBooking.price.total * 100}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Stars selector */}
                  <div className="text-center mb-4 select-none">
                    <p className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider mb-2">
                      {language === 'en' ? 'How was the service?' : 'سروس کیسی رہی؟'}
                    </p>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => setStars(s)}
                          className="hover:scale-115 active:scale-90 transition-all cursor-pointer"
                        >
                          <Star 
                            size={28} 
                            className={s <= stars ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : isDarkMode ? 'text-slate-800' : 'text-slate-200'} 
                          />
                        </button>
                      ))}
                    </div>
                    <span className={`text-[11px] font-extrabold block text-center min-h-[16px] ${stars >= 4 ? 'text-teal-650' : stars === 3 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {stars === 5 ? (language === 'en' ? '⭐⭐⭐⭐⭐ Excellent service!' : '⭐⭐⭐⭐⭐ زبردست کام!') :
                       stars === 4 ? (language === 'en' ? '⭐⭐⭐⭐ Very Good!' : '⭐⭐⭐⭐ بہت اچھا!') :
                       stars === 3 ? (language === 'en' ? '⭐⭐⭐ Average' : '⭐⭐⭐ اوسط') :
                       stars === 2 ? (language === 'en' ? '⭐⭐ Fair' : '⭐⭐ مناسب') :
                       (language === 'en' ? '⭐ Poor' : '⭐ ناقص')}
                    </span>
                  </div>

                  {/* Quick comment feedback chips */}
                  <div className="mb-4">
                    <p className={`text-[9px] uppercase tracking-wider font-extrabold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t('prefill_tags')}
                    </p>
                    <div className="flex flex-wrap gap-1 md:gap-1.5 justify-start max-h-[50px] overflow-y-auto no-scrollbar">
                      {[
                        { text: language === 'en' ? "⚡ Fast Service" : "⚡ بہت تیز کام", textTemplate: language === 'en' ? "Highly efficient and completed target work very fast." : "ٹیگ: بہت ہی تیز رفتار اور موثر کام۔" },
                        { text: language === 'en' ? "💯 Extremely Pro" : "💯 انتہائی پیشہ ور", textTemplate: language === 'en' ? "Extremely professional skill and tools. Completely satisfied." : "ٹیگ: انتہائی پیشہ ورانہ اور بہترین مہارت۔" },
                        { text: language === 'en' ? "🤝 Polite behavior" : "🤝 اچھا رویہ", textTemplate: language === 'en' ? "Amazing behavior and polite specialist." : "ٹیگ: بہت شائستہ اور اچھا رویہ تھا۔" },
                        { text: language === 'en' ? "🛠️ Perfect cleanup" : "🛠️ صاف ستھرا کام", textTemplate: language === 'en' ? "Clean repair cleanup after work completion." : "ٹیگ: صفائی ستھرائی کے ساتھ کام مکمل کیا۔" }
                      ].map((tag, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setReview(prev => {
                              const cleanPrev = prev.trim();
                              return cleanPrev ? `${cleanPrev} ${tag.textTemplate}` : tag.textTemplate;
                            });
                          }}
                          className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all active:scale-95 cursor-pointer leading-none ${
                            isDarkMode 
                              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' 
                              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {tag.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Textbox Input */}
                  <div className="mb-5">
                    <textarea
                      rows={2}
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder={language === 'en' ? "Add any details about repair outcome..." : "مرمت کے حوالے سے مزید معلومات شامل کریں..."}
                      className={`w-full border rounded-xl p-2 px-3 text-2xs focus:ring-1 focus:ring-teal-500 focus:outline-none h-[48px] text-left transition-colors duration-150 ${
                        isDarkMode ? 'bg-slate-950 border-slate-850 text-white placeholder-slate-700' : 'bg-slate-50 border-slate-200 text-slate-850 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 shrink-0">
                  <button
                    onClick={() => {
                      handleCustomerRatingSubmit();
                      setShowRatingModal(false);
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-2xs py-2.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-98 animate-pulse"
                  >
                    {t('submit_feedback')}
                  </button>

                  <button
                    onClick={() => {
                      setShowRatingModal(false);
                    }}
                    className={`w-full text-center py-2 rounded-xl font-bold text-3xs transition-colors cursor-pointer ${
                      isDarkMode ? 'bg-slate-850 hover:bg-slate-850/80 text-slate-400' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-500'
                    }`}
                  >
                    {t('remind_later')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showReceiptModal && selectedReceiptBooking && (
            <ReceiptModal 
              booking={selectedReceiptBooking}
              isDarkMode={isDarkMode}
              onClose={() => {
                setShowReceiptModal(false);
                setSelectedReceiptBooking(null);
              }}
            />
          )}

          {showHelpModal && (
            <HelpSupportModal 
              currentUser={currentUser}
              isDarkMode={isDarkMode}
              onClose={() => setShowHelpModal(false)}
              language={language}
            />
          )}

          </div>

          {/* iOS Home Indicator Bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-800 rounded-full z-50 select-none" />

          {/* Quick Floating simulator footer navigation indicators for client only */}
          {role === 'customer' && !isChatOpen && currentUser && currentUser.isLoggedIn && (
            <div className="h-10 bg-white border-t border-slate-150 absolute bottom-0 left-0 right-0 flex items-center justify-around z-40 px-6 select-none shadow-sm">
              <button 
                onClick={() => {
                  setCustomerScreen('home');
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  customerScreen === 'home' || customerScreen === 'booking' ? 'text-teal-600' : 'text-slate-400'
                }`}
              >
                <Sliders size={12} />
                <span className="text-[8px] font-bold font-sans">Services</span>
              </button>

              <button 
                onClick={() => {
                  setCustomerScreen('bookings');
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer relative ${
                  customerScreen === 'bookings' ? 'text-teal-600' : 'text-slate-400'
                }`}
              >
                <div className="relative">
                  <Briefcase size={12} />
                  {reminderBookings.length > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-600 rounded-full" />
                    </>
                  )}
                </div>
                <span className="text-[8px] font-bold font-sans">Bookings</span>
              </button>

              <button 
                onClick={() => {
                  if (activeBooking) {
                    if (activeBooking.status === 'completed') {
                      setCustomerScreen('completed');
                    } else {
                      setCustomerScreen('tracking');
                    }
                  } else {
                    alert('You have no active booking to track. Search services to raise a professional request!');
                  }
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer relative ${
                  customerScreen === 'tracking' || customerScreen === 'completed' ? 'text-teal-650' : 'text-slate-400'
                }`}
              >
                <div className="relative">
                  <Activity size={12} />
                  {reminderBookings.some((b) => b.id === activeBooking?.id) && (
                    <>
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-600 rounded-full" />
                    </>
                  )}
                </div>
                <span className="text-[8px] font-bold font-sans">Tracker</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
