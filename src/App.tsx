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

  // Synchronized simulation bookings log list
  const [allBookings, setAllBookings] = useState<BookingState[]>([
    {
      id: 'HZ-89241',
      service: 'ELECTRICIAN',
      serviceKey: 'electrician',
      subService: 'Ceiling Fan Repair & Swapping',
      address: 'DHA Phase 5, Block T, House 42, Lahore',
      slot: 'Yesterday, 04:00 PM',
      description: 'The fan is making clicking noise and speed regulator is broken.',
      status: 'completed',
      price: {
        base: 15,
        work: 20,
        tax: 2,
        total: 37,
      },
      provider: {
        id: 'work-1',
        name: 'Ahmed Kamal',
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80',
        phone: '0300-7654321',
        rating: 4.88,
        trips: 342,
        specialty: 'Electrician Specialist',
      },
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'HZ-31045',
      service: 'PLUMBER',
      serviceKey: 'plumber',
      subService: 'Master Bathroom Shower Mixer Leakage',
      address: 'Bahria Town, Sector D, Villa 15, Lahore',
      slot: '3 days ago, 11:30 AM',
      description: 'Minor drip from the hot water mixer spindle knob.',
      status: 'cancelled',
      price: {
        base: 18,
        work: 15,
        tax: 2,
        total: 35,
      },
      provider: null,
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
  ]);

  // Synchronize state changes of active booking to the master database
  useEffect(() => {
    if (activeBooking) {
      setAllBookings(prev => {
        const exists = prev.some(b => b.id === activeBooking.id);
        if (exists) {
          return prev.map(b => b.id === activeBooking.id ? activeBooking : b);
        } else {
          return [activeBooking, ...prev];
        }
      });
    }
  }, [activeBooking]);

  // Core dynamic user identities
  const [customerUser, setCustomerUser] = useState<AppUser | null>({
    id: 'cust-1',
    name: 'Ayesha Khan',
    email: 'ayesha@gmail.com',
    phone: '0300-1234567',
    role: 'customer',
    isLoggedIn: true
  });

  const [workerUser, setWorkerUser] = useState<AppUser | null>({
    id: 'work-1',
    name: 'Ahmed Kamal',
    email: 'ahmed@gmail.com',
    phone: '0300-7654321',
    role: 'worker',
    specialty: 'Electrician',
    isLoggedIn: true
  });

  // Dynamic device role selectors
  const [device1Role, setDevice1Role] = useState<'customer' | 'worker'>('customer');
  const [device2Role, setDevice2Role] = useState<'customer' | 'worker'>('worker');

  // Client virtual database of accounts
  const [usersDB, setUsersDB] = useState<any[]>([
    { id: 'cust-1', name: 'Ayesha Khan', email: 'ayesha@gmail.com', phone: '0300-1234567', password: '123', role: 'customer' },
    { id: 'work-1', name: 'Ahmed Kamal', email: 'ahmed@gmail.com', phone: '0300-7654321', password: '123', role: 'worker', specialty: 'Electrician' }
  ]);

  const handleCustomerLogin = (email: string, password: string, isSignUp: boolean, details?: { name: string; phone: string }) => {
    const formattedEmail = email.trim().toLowerCase();
    
    if (isSignUp) {
      const exists = usersDB.some(u => u.email === formattedEmail && u.role === 'customer');
      if (exists) {
        return { success: false, error: 'This email is already registered.' };
      }
      const newId = `cust-${Date.now()}`;
      const newUser = {
        id: newId,
        name: details?.name || 'New Client',
        email: formattedEmail,
        phone: details?.phone || '0300-1111111',
        password,
        role: 'customer'
      };
      setUsersDB(prev => [...prev, newUser]);
      const loggedUser = { ...newUser, isLoggedIn: true };
      setCustomerUser(loggedUser as AppUser);
      addLog(`Customer registered: "${loggedUser.name}" (${loggedUser.email})`, 'customer');
      return { success: true };
    } else {
      const matched = usersDB.find(u => u.email === formattedEmail && u.password === password && u.role === 'customer');
      if (matched) {
        const loggedUser = { ...matched, isLoggedIn: true };
        setCustomerUser(loggedUser as AppUser);
        addLog(`Customer logged in: "${loggedUser.name}"`, 'customer');
        return { success: true };
      } else {
        return { success: false, error: 'Invalid customer credentials. Hint: Use pre-fill or "ayesha@gmail.com"/"123".' };
      }
    }
  };

  const handleCustomerLogout = () => {
    const oldName = customerUser?.name || 'Customer';
    setCustomerUser(null);
    addLog(`Customer "${oldName}" signed out.`, 'customer');
  };

  const handleWorkerLogin = (email: string, password: string, isSignUp: boolean, details?: { name: string; phone: string; specialty?: string }) => {
    const formattedEmail = email.trim().toLowerCase();

    if (isSignUp) {
      const exists = usersDB.some(u => u.email === formattedEmail && u.role === 'worker');
      if (exists) {
        return { success: false, error: 'This email is already registered.' };
      }
      const newId = `work-${Date.now()}`;
      const newUser = {
        id: newId,
        name: details?.name || 'New Specialist',
        email: formattedEmail,
        phone: details?.phone || '0300-2222222',
        password,
        role: 'worker',
        specialty: details?.specialty || 'Electrician'
      };
      setUsersDB(prev => [...prev, newUser]);
      const loggedUser = { ...newUser, isLoggedIn: true };
      setWorkerUser(loggedUser as AppUser);
      addLog(`Specialist registered: "${loggedUser.name}" (${loggedUser.specialty})`, 'worker');
      return { success: true };
    } else {
      const matched = usersDB.find(u => u.email === formattedEmail && u.password === password && u.role === 'worker');
      if (matched) {
        const loggedUser = { ...matched, isLoggedIn: true };
        setWorkerUser(loggedUser as AppUser);
        addLog(`Specialist logged in: "${loggedUser.name}"`, 'worker');
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials. Hint: Use pre-fill or "ahmed@gmail.com"/"123".' };
      }
    }
  };

  const handleWorkerLogout = () => {
    const oldName = workerUser?.name || 'Worker';
    setWorkerUser(null);
    addLog(`Worker "${oldName}" signed out. Offline.`, 'worker');
    setIsWorkerOnline(false);
    setJobInvites([]);
  };
  
  // Activity event log lines
  const [logs, setLogs] = useState<ActionLog[]>([
    {
      id: '1',
      time: new Date().toLocaleTimeString(),
      message: 'Haazir Real-time System Client successfully booted on port 3000.',
      type: 'system',
    },
    {
      id: '2',
      time: new Date().toLocaleTimeString(),
      message: 'Worker Ahmed Kamal toggled availability status to ONLINE.',
      type: 'worker',
    },
  ]);

  const addLog = (message: string, type: 'customer' | 'worker' | 'system') => {
    const uniqueId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    setLogs((prev) => [
      {
        id: uniqueId,
        time: new Date().toLocaleTimeString(),
        message,
        type,
      },
      ...prev,
    ]);
  };

  // TRIGGER: Customer raises a booking
  const handleCreateBooking = (
    categoryKey: string,
    issue: string,
    address: string,
    slot: string,
    comments: string
  ) => {
    const orderId = `HZ-${Math.floor(100000 + Math.random() * 90000)}`;
    const baseVal = categoryKey === 'cctv' ? 25 : categoryKey === 'electrician' ? 15 : categoryKey === 'plumber' ? 18 : 20;
    const workVal = Math.floor(Math.random() * 15) + 15;
    const taxVal = Math.round((baseVal + workVal) * 0.05);
    const totalVal = baseVal + workVal + taxVal;

    const newBooking: BookingState = {
      id: orderId,
      service: categoryKey.toUpperCase(),
      serviceKey: categoryKey,
      subService: issue || 'General Maintenance Diagnosis',
      address,
      slot,
      description: comments || 'No comments specified',
      status: 'pending',
      price: {
        base: baseVal,
        work: workVal,
        tax: taxVal,
        total: totalVal,
      },
      provider: null,
      createdAt: new Date().toISOString(),
    };

    setActiveBooking(newBooking);
    addLog(`Customer raised new labor request ${orderId} for "${newBooking.subService}"`, 'customer');

    // Automatically trigger invitation alert row on the Worker flow if worker is online
    if (isWorkerOnline) {
      const inviteJob: JobInvite = {
        id: orderId,
        service: newBooking.service,
        subService: newBooking.subService,
        address: newBooking.address,
        slot: newBooking.slot,
        description: newBooking.description,
        price: newBooking.price,
        customerName: customerUser?.name || 'Ayesha Khan',
        customerPhone: customerUser?.phone || '+92 321 9876543',
        distance: '1.2 km',
      };
      setJobInvites([inviteJob]);
      addLog(`Pub/Sub server broadcasted Job offer ${orderId} to nearby technicians`, 'system');
    }
  };

  // TRIGGER: Customer cancels a pending booking
  const handleCancelBooking = () => {
    if (activeBooking) {
      addLog(`Customer withdrew and cancelled service ticket ${activeBooking.id}`, 'customer');
      setAllBookings(prev => prev.map(b => b.id === activeBooking.id ? { ...b, status: 'cancelled' as const } : b));
      setActiveBooking(null);
      setJobInvites([]);
      setChatMessages([]);
    }
  };

  // TRIGGER: Worker toggles online status
  const handleToggleWorkerOnline = () => {
    const nextState = !isWorkerOnline;
    setIsWorkerOnline(nextState);
    const wName = workerUser?.name || 'Worker Ahmed';
    addLog(`${wName} marked status to: ${nextState ? 'ONLINE' : 'OFFLINE'}`, 'worker');
    
    if (!nextState) {
      setJobInvites([]); // offline clears offers
    } else if (activeBooking && activeBooking.status === 'pending') {
      // populate back if online
      const inviteJob: JobInvite = {
        id: activeBooking.id,
        service: activeBooking.service,
        subService: activeBooking.subService,
        address: activeBooking.address,
        slot: activeBooking.slot,
        description: activeBooking.description,
        price: activeBooking.price,
        customerName: customerUser?.name || 'Ayesha Khan',
        customerPhone: customerUser?.phone || '+92 321 9876543',
        distance: '1.2 km',
      };
      setJobInvites([inviteJob]);
      addLog(`Re-dispatched active pending ticket ${activeBooking.id} to newly online Worker`, 'system');
    }
  };

  // TRIGGER: Worker accepts Job invitation
  const handleAcceptJob = (id: string) => {
    if (!activeBooking || activeBooking.id !== id) return;

    setActiveBooking((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'assigned',
        provider: {
          id: workerUser?.id || 'WKR-401',
          name: workerUser?.name || 'Ahmed Kamal',
          avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80',
          phone: workerUser?.phone || '+92 300 1234567',
          rating: 4.88,
          trips: 342,
          specialty: (workerUser?.specialty || 'Electrician') + ' Specialist',
        },
      };
    });

    const wName = workerUser?.name || 'Ahmed Kamal';
    setJobInvites([]); // accepted
    setChatMessages([
      {
        id: 'welcome-1',
        sender: 'worker',
        text: `Assalam-o-Alaikum! My name is ${wName}. I have accepted your request. I am gathering my tools and will head to your location shortly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    addLog(`Worker ${wName} ACCEPTED Job ${id}. Status advanced to ASSIGNED.`, 'worker');
  };

  // TRIGGER: Worker declines/skips job invite
  const handleDeclineJob = (id: string) => {
    const wName = workerUser?.name || 'Ahmed Kamal';
    setJobInvites([]);
    addLog(`Worker ${wName} DECLINED Job ticket ${id}. Sourcing alternate worker.`, 'worker');
  };

  // TRIGGER: Worker advances job status
  const handleAdvanceJob = () => {
    if (!activeBooking) return;
    const wName = workerUser?.name || 'Ahmed Kamal';

    if (activeBooking.status === 'assigned') {
      setActiveBooking((prev) => {
        if (!prev) return null;
        return { ...prev, status: 'in_progress' };
      });
      addLog(`Worker ${wName} arrived on site (DHA Phase 5). Session status updated to IN_PROGRESS.`, 'worker');
    } else if (activeBooking.status === 'in_progress') {
      setActiveBooking((prev) => {
        if (!prev) return null;
        return { ...prev, status: 'completed' };
      });
      addLog(`Worker ${wName} resolved repair. Raised Completed ticket, bill invoice generated.`, 'worker');
    }
  };

  // TRIGGER: Customer submits feedback rating
  const handleSubmitRating = (stars: number, text: string) => {
    if (activeBooking) {
      addLog(`Customer rated the visit (${stars} Stars). Comments: "${text || 'Perfect service'}"`, 'customer');
      addLog(`Transaction ${activeBooking.id} successfully completed and archived.`, 'system');
      setActiveBooking(null);
      setChatMessages([]);
    }
  };

  const handleSendMessage = (sender: 'customer' | 'worker', text: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    const senderName = sender === 'customer' 
      ? (customerUser?.name || 'Customer Ayesha Khan') 
      : (workerUser?.name || 'Specialist Ahmed');
    addLog(`${senderName} sent message: "${text}"`, sender);
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
