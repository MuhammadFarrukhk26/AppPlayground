import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Code2, 
  Smartphone, 
  ArrowUpRight, 
  Layers, 
  HeartHandshake, 
  CheckCircle, 
  Maximize2,
  Terminal,
  HelpCircle,
  FileCode,
  Download,
  Flame,
  Info
} from 'lucide-react';
import PhoneSimulator from './components/PhoneSimulator';
import CodeBrowser from './components/CodeBrowser';
import LogsStream from './components/LogsStream';
import { BookingState, JobInvite, ActionLog, ChatMessage, AppUser } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code'>('simulator');
  
  // Real-time globally synchronized simulation states
  const [activeBooking, setActiveBooking] = useState<BookingState | null>(null);
  const [isWorkerOnline, setIsWorkerOnline] = useState<boolean>(true);
  const [jobInvites, setJobInvites] = useState<JobInvite[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [allBookings, setAllBookings] = useState<BookingState[]>([]);
  const [customerUser, setCustomerUser] = useState<AppUser | null>(null);
  const [workerUser, setWorkerUser] = useState<AppUser | null>(null);
  const [usersDB, setUsersDB] = useState<any[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);

  // Local device role selectors
  const [device1Role, setDevice1Role] = useState<'customer' | 'worker'>('customer');
  const [device2Role, setDevice2Role] = useState<'customer' | 'worker'>('worker');

  // Trigger state synchronization on mount & poll every 2 seconds
  useEffect(() => {
    const fetchFreshState = async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          setActiveBooking(data.activeBooking);
          setIsWorkerOnline(data.isWorkerOnline);
          setJobInvites(data.jobInvites);
          setChatMessages(data.chatMessages);
          setAllBookings(data.allBookings);
          setCustomerUser(data.customerUser);
          setWorkerUser(data.workerUser);
          setUsersDB(data.usersDB);
          setLogs(data.logs);
        }
      } catch (err) {
        console.warn("Failed to sync backend state (this is normal on initial boot/reconnect; retrying...):", err);
      }
    };

    fetchFreshState();
    const interval = setInterval(fetchFreshState, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCustomerLogin = async (email: string, password: string, isSignUp: boolean, details?: { name: string; phone: string }) => {
    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp ? {
        name: details?.name,
        email,
        phone: details?.phone,
        password,
        role: 'customer'
      } : {
        email,
        password,
        role: 'customer'
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Authentication failed.' };
      }
      setCustomerUser(data.user);
      // Immediately refresh stats
      const stateRes = await fetch('/api/state');
      if (stateRes.ok) {
        const stateData = await stateRes.json();
        setLogs(stateData.logs);
        setUsersDB(stateData.usersDB);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  const handleCustomerLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'customer' })
      });
      setCustomerUser(null);
    } catch (err) {
      console.warn("Error during customer logout:", err);
    }
  };

  const handleWorkerLogin = async (email: string, password: string, isSignUp: boolean, details?: { name: string; phone: string; specialty?: string }) => {
    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp ? {
        name: details?.name,
        email,
        phone: details?.phone,
        password,
        role: 'worker',
        specialty: details?.specialty
      } : {
        email,
        password,
        role: 'worker'
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Authentication failed.' };
      }
      setWorkerUser(data.user);
      // Immediately refresh stats
      const stateRes = await fetch('/api/state');
      if (stateRes.ok) {
        const stateData = await stateRes.json();
        setLogs(stateData.logs);
        setUsersDB(stateData.usersDB);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  const handleWorkerLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'worker' })
      });
      setWorkerUser(null);
      setIsWorkerOnline(false);
      setJobInvites([]);
    } catch (err) {
      console.warn("Error during worker logout:", err);
    }
  };

  const handleCreateBooking = async (
    categoryKey: string,
    issue: string,
    address: string,
    slot: string,
    comments: string
  ) => {
    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryKey, issue, address, slot, comments })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveBooking(data.booking);
        // Quick update
        const stateRes = await fetch('/api/state');
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setJobInvites(stateData.jobInvites);
          setAllBookings(stateData.allBookings);
          setLogs(stateData.logs);
        }
      }
    } catch (err) {
      console.warn("Error during booking creation:", err);
    }
  };

  const handleCancelBooking = async () => {
    try {
      const res = await fetch('/api/bookings/cancel', { method: 'POST' });
      if (res.ok) {
        setActiveBooking(null);
        setJobInvites([]);
        setChatMessages([]);
        const stateRes = await fetch('/api/state');
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setAllBookings(stateData.allBookings);
          setLogs(stateData.logs);
        }
      }
    } catch (err) {
      console.warn("Error during booking cancellation:", err);
    }
  };

  const handleToggleWorkerOnline = async () => {
    try {
      const nextState = !isWorkerOnline;
      const res = await fetch('/api/worker/toggle-online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: nextState })
      });
      if (res.ok) {
        const data = await res.json();
        setIsWorkerOnline(data.isWorkerOnline);
        setJobInvites(data.jobInvites);
        const stateRes = await fetch('/api/state');
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setLogs(stateData.logs);
        }
      }
    } catch (err) {
      console.warn("Error toggling worker online status:", err);
    }
  };

  const handleAcceptJob = async (id: string) => {
    try {
      const res = await fetch('/api/worker/accept-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveBooking(data.booking);
        setChatMessages(data.chatMessages);
        setJobInvites([]);
        const stateRes = await fetch('/api/state');
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setAllBookings(stateData.allBookings);
          setLogs(stateData.logs);
        }
      }
    } catch (err) {
      console.warn("Error accepting job invite:", err);
    }
  };

  const handleDeclineJob = async (id: string) => {
    try {
      const res = await fetch('/api/worker/decline-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setJobInvites([]);
        const stateRes = await fetch('/api/state');
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setLogs(stateData.logs);
        }
      }
    } catch (err) {
      console.warn("Error declining job invite:", err);
    }
  };

  const handleAdvanceJob = async (id?: string) => {
    try {
      const res = await fetch('/api/worker/advance-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveBooking(data.booking);
        const stateRes = await fetch('/api/state');
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setAllBookings(stateData.allBookings);
          setLogs(stateData.logs);
        }
      }
    } catch (err) {
      console.warn("Error advancing job step:", err);
    }
  };

  const handleSubmitRating = async (stars: number, text: string, id?: string) => {
    try {
      const res = await fetch('/api/bookings/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars, feedback: text, id })
      });
      if (res.ok) {
        setActiveBooking(null);
        setChatMessages([]);
        setJobInvites([]);
        const stateRes = await fetch('/api/state');
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setAllBookings(stateData.allBookings);
          setLogs(stateData.logs);
        }
      }
    } catch (err) {
      console.warn("Error submitting rating/feedback:", err);
    }
  };

  const handleSendMessage = async (sender: 'customer' | 'worker', text: string, bookingId?: string) => {
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, text, bookingId })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.chatMessages);
        const stateRes = await fetch('/api/state');
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setLogs(stateData.logs);
        }
      }
    } catch (err) {
      console.warn("Error sending chat message:", err);
    }
  };

  const currentTabStyles = (tab: 'simulator' | 'code') => {
    return activeTab === tab
      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/10'
      : 'text-neutral-600 hover:text-neutral-905 hover:bg-neutral-100';
  };

  return (
    <div className="min-h-screen bg-slate-100/75 flex flex-col font-sans select-none antialiased">
      
      {/* Visual Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 py-3 px-6 select-none flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-extrabold tracking-tighter text-sm shadow-md shadow-teal-500/20">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 tracking-tight text-sm">Haazir Mobile Boilerplate</span>
              <span className="bg-teal-50 text-teal-600 border border-teal-100 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Companion IDE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">On-demand local electrician & plumber technician blueprint engine</p>
          </div>
        </div>

        {/* Global tabs switcher */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 z-10 text-2xs font-extrabold">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`py-1.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${currentTabStyles('simulator')}`}
            >
              <Smartphone size={13} />
              <span>Interactive Dual Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`py-1.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${currentTabStyles('code')}`}
            >
              <Code2 size={13} />
              <span>Expo Code Workspace</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container body */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto flex flex-col justify-between">
        
        {activeTab === 'simulator' ? (
          /* ========================================================= */
          /* TWIN SIMULATOR MODE                                       */
          /* ========================================================= */
          <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-center">
            
            {/* DEVICE 1: CUSTOMER / SWITCHEABLE PHONE GLASS */}
            <div className="flex-1 flex flex-col items-center justify-start bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-center">
              <div className="mb-4">
                <span className={`px-2 py-0.5 rounded font-bold text-[9px] tracking-wider uppercase font-mono border ${
                  device1Role === 'customer' 
                    ? 'bg-teal-50 text-teal-600 border-teal-150' 
                    : 'bg-amber-50 text-amber-750 text-amber-700 border-amber-150'
                }`}>
                  Device Node 01 • {device1Role === 'customer' ? 'Customer' : 'Vendor'}
                </span>
                <h3 className="font-bold text-slate-800 text-sm mt-1">
                  {device1Role === 'customer' ? 'Customer App Simulator' : 'Vendor / Worker App'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  {device1Role === 'customer' 
                    ? 'Explore plumbing/electrical categories & schedule visits' 
                    : 'Toggle online availability switches & accept job invites'}
                </p>
              </div>

              <PhoneSimulator
                role={device1Role}
                activeBooking={activeBooking}
                allBookings={allBookings}
                isWorkerOnline={isWorkerOnline}
                jobInvites={jobInvites}
                chatMessages={chatMessages}
                currentUser={device1Role === 'customer' ? customerUser : workerUser}
                onLogin={device1Role === 'customer' ? handleCustomerLogin : handleWorkerLogin}
                onLogout={device1Role === 'customer' ? handleCustomerLogout : handleWorkerLogout}
                onChangeRole={(newRole) => setDevice1Role(newRole)}
                onSendMessage={handleSendMessage}
                onCreateBooking={handleCreateBooking}
                onCancelBooking={handleCancelBooking}
                onToggleWorkerOnline={handleToggleWorkerOnline}
                onAcceptJob={handleAcceptJob}
                onDeclineJob={handleDeclineJob}
                onAdvanceJob={handleAdvanceJob}
                onSubmitRating={handleSubmitRating}
              />
            </div>

            {/* LIVE PUB/SUB BACKEND ACTIVITY EVENT STREAM */}
            <div className="w-full lg:w-80 shrink-0">
              <LogsStream logs={logs} />
            </div>

            {/* DEVICE 2: WORKER / SWITCHEABLE PHONE GLASS */}
            <div className="flex-1 flex flex-col items-center justify-start bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-center">
              <div className="mb-4">
                <span className={`px-2 py-0.5 rounded font-bold text-[9px] tracking-wider uppercase font-mono border ${
                  device2Role === 'customer' 
                    ? 'bg-teal-50 text-teal-600 border-teal-150' 
                    : 'bg-amber-50 text-amber-750 text-amber-700 border-amber-150'
                }`}>
                  Device Node 02 • {device2Role === 'customer' ? 'Customer' : 'Vendor'}
                </span>
                <h3 className="font-bold text-slate-800 text-sm mt-1">
                  {device2Role === 'customer' ? 'Customer App Simulator' : 'Vendor / Worker App'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  {device2Role === 'customer' 
                    ? 'Explore plumbing/electrical categories & schedule visits' 
                    : 'Toggle online availability switches & accept job invites'}
                </p>
              </div>

              <PhoneSimulator
                role={device2Role}
                activeBooking={activeBooking}
                allBookings={allBookings}
                isWorkerOnline={isWorkerOnline}
                jobInvites={jobInvites}
                chatMessages={chatMessages}
                currentUser={device2Role === 'customer' ? customerUser : workerUser}
                onLogin={device2Role === 'customer' ? handleCustomerLogin : handleWorkerLogin}
                onLogout={device2Role === 'customer' ? handleCustomerLogout : handleWorkerLogout}
                onChangeRole={(newRole) => setDevice2Role(newRole)}
                onSendMessage={handleSendMessage}
                onCreateBooking={handleCreateBooking}
                onCancelBooking={handleCancelBooking}
                onToggleWorkerOnline={handleToggleWorkerOnline}
                onAcceptJob={handleAcceptJob}
                onDeclineJob={handleDeclineJob}
                onAdvanceJob={handleAdvanceJob}
                onSubmitRating={handleSubmitRating}
              />
            </div>

          </div>
        ) : (
          /* ========================================================= */
          /* CODE EXPLORER MODE                                        */
          /* ========================================================= */
          <div className="space-y-6 flex-1 flex flex-col animate-fade-in justify-start">
            
            {/* Description card */}
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-teal-50 text-teal-600 border border-teal-100 rounded-lg shrink-0">
                    <Layers size={14} />
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm">React Native Expo Boilerplate</h3>
                </div>
                
                <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">
                  Target: Expo SDK 50 managed-workflow
                </span>
              </div>
              
              <p className="text-2xs sm:text-[11px] text-slate-500 leading-relaxed max-w-4xl">
                This workspace contains clean, modular, and optimized ES6 boilerplate files configured exactly as requested. It features the global <strong>BookingContext</strong> for synchronizing client-technician data models, v6 stack and bottom-tab configurations inside <strong>AppNavigator</strong>, and styled UI controllers.
              </p>
            </div>

            {/* In-Browser IDE Code viewer */}
            <div className="flex-1">
              <CodeBrowser />
            </div>

          </div>
        )}

      </main>

      {/* Global minimal footer */}
      <footer className="bg-white border-t border-neutral-200/80 py-4 px-6 select-none mt-10 shrink-0">
        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="text-zinc-400 font-semibold flex items-center gap-1">
            <span>© 2026 Haazir Inc. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400 font-bold uppercase tracking-wider text-3xs">
            <span>React Native v0.73.2</span>
            <span>•</span>
            <span>Expo Managed Shell</span>
            <span>•</span>
            <span>React Navigation v6</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
