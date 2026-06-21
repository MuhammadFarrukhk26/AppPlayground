import React, { useMemo, useState } from 'react';
import { BookingState, AppUser } from '../types';
import { 
  ArrowLeft, 
  Award, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Sliders, 
  Calendar, 
  CircleCheck, 
  DollarSign, 
  ShieldCheck, 
  Wrench,
  ThumbsUp,
  Search,
  X
} from 'lucide-react';

interface WorkerProfileProps {
  currentUser: AppUser | null;
  bookings: BookingState[];
  isDarkMode: boolean;
  onClose: () => void;
}

export const WorkerProfile: React.FC<WorkerProfileProps> = ({ 
  currentUser, 
  bookings = [], 
  isDarkMode, 
  onClose 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Aggregate real completed bookings from the live state
  const liveCompletedJobs = useMemo(() => {
    return bookings.filter(b => b.status === 'completed');
  }, [bookings]);

  // Total completed count includes a high-fidelity baseline of 52 historical jobs
  const baselineCompletedCount = 52;
  const totalSuccessfulJobs = baselineCompletedCount + liveCompletedJobs.length;

  // Let's build a comprehensive list of past completed jobs (combining live and historic base jobs)
  const completedJobsList = useMemo(() => {
    const historicalJobs = [
      {
        id: 'HZ-HIST-1',
        service: 'ELECTRICIAN',
        subService: 'AC Circuit Breaker Replacement',
        customer: 'Zainab Bibi',
        date: '4 days ago',
        rating: 5,
        review: 'Very professional! Ahmed came exactly on time during heavy rain and fixed our tripping mains box immediately. Extremely humble and polite.',
        price: 3200,
      },
      {
        id: 'HZ-HIST-2',
        service: 'PLUMBER',
        subService: 'Kitchen Drain De-clogging',
        customer: 'Usman Ghani',
        date: '1 week ago',
        rating: 4.5,
        review: 'Fixed the kitchen sink leakage quickly. Had all local parts with him. Fair prices and neat work.',
        price: 2500,
      },
      {
        id: 'HZ-HIST-3',
        service: 'ELECTRICIAN',
        subService: 'UPS Inverter Wiring Repair',
        customer: 'Prof. Haroon',
        date: '2 weeks ago',
        rating: 5,
        review: 'Highly recommended for complex inverter wiring. He has deep technical knowledge of double battery setups. Excellent experience.',
        price: 4500,
      }
    ];

    // Convert live completed bookings to match the display schema
    const formattedLiveJobs = liveCompletedJobs.map((b, idx) => {
      return {
        id: b.id,
        service: b.service,
        subService: b.subService,
        customer: 'Ayesha Khan', // default customer
        date: b.slot || 'Recently',
        rating: 5, // Default perfect score for completed jobs
        review: b.description || 'Completed service order with high quality workmanship and precision.',
        price: (b.price?.total || 0) * 100, // PKR equivalent
      };
    });

    return [...formattedLiveJobs, ...historicalJobs];
  }, [liveCompletedJobs]);

  // Derived filtered past completed jobs based on search query matching customer name
  const filteredCompletedJobsList = useMemo(() => {
    if (!searchQuery.trim()) {
      return completedJobsList;
    }
    const query = searchQuery.toLowerCase().trim();
    return completedJobsList.filter((job) => 
      job.customer.toLowerCase().includes(query)
    );
  }, [completedJobsList, searchQuery]);

  const ratingAvg = 4.88;

  return (
    <div id="worker-profile-panel" className={`absolute inset-0 z-50 flex flex-col h-full animate-fade-in ${
      isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Profile Header Header Bar */}
      <div className={`p-4 flex items-center gap-3 border-b shrink-0 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <button
          type="button"
          onClick={onClose}
          className={`p-1.5 rounded-full hover:scale-105 active:scale-95 transition-all outline-none ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 text-left">
          <div className="text-[10px] font-black uppercase text-teal-650 tracking-wider">Haazir Specialist</div>
          <h2 className="text-xs font-black -mt-0.5 leading-none">Worker Profile</h2>
        </div>
        
        {/* Top Jobs Count Badge */}
        <div className="bg-amber-500/10 border border-amber-500/35 text-amber-600 dark:text-amber-400 font-black text-[8px] uppercase tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 animate-pulse">
          <Award size={10} className="fill-amber-500/10" />
          <span>PRO Verified</span>
        </div>
      </div>

      {/* Profile Content Body - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Profile Card banner */}
        <div className={`p-4 border rounded-2xl text-center relative overflow-hidden ${
          isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800' : 'bg-white border-slate-150 shadow-xs'
        }`}>
          {/* Cover accent gradient */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-500" />
          
          <div className="flex flex-col items-center justify-center mt-1">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80"
                alt="Ahmed Kamal Profile picture"
                className="w-16 h-16 rounded-full object-cover border-4 border-teal-500/20"
              />
              <span className="absolute bottom-0 right-1 bg-emerald-500 text-white p-0.5 rounded-full border border-white dark:border-slate-950">
                <ShieldCheck size={10} className="fill-emerald-500" />
              </span>
            </div>

            <h3 className="font-black text-slate-850 dark:text-white text-sm mt-2.5 leading-tight">
              {currentUser?.name || 'Ahmed Kamal'}
            </h3>
            <span className="text-[9px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-widest mt-1">
              {currentUser?.specialty || 'Electrician Specialist'}
            </span>
            
            {/* Contact details list */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 w-full text-[8.5px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Phone size={9} className="text-slate-400" />
                <span>{currentUser?.phone || '0300-7654321'}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={9} className="text-slate-400" />
                <span>Lahore, Pakistan</span>
              </div>
            </div>
          </div>

          {/* Core metrics bar: Rating, Jobs badge, Accept rate */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center">
              <span className="text-[7.5px] text-slate-400 uppercase font-black block">Core Rating</span>
              <div className="flex items-center justify-center gap-0.5 font-black text-xs text-amber-500 mt-0.5">
                <Star size={11} className="fill-amber-400 text-amber-500" />
                <span>{ratingAvg}</span>
              </div>
              <span className="text-[6.5px] text-slate-400 block mt-0.5">Reviews (28)</span>
            </div>

            <div className="text-center border-x border-slate-100 dark:border-slate-800">
              <span className="text-[7.5px] text-slate-400 uppercase font-black block">Success Badge</span>
              <div className="flex items-center justify-center gap-1 font-black text-xs text-teal-600 dark:text-teal-400 mt-0.5">
                <Award size={11} className="text-teal-550 shrink-0" />
                <span>{totalSuccessfulJobs}</span>
              </div>
              <span className="text-[6.5px] text-teal-650 dark:text-teal-400 font-bold block mt-0.5">Completed</span>
            </div>

            <div className="text-center">
              <span className="text-[7.5px] text-slate-400 uppercase font-black block">Accept Rate</span>
              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 block mt-0.5">92%</span>
              <span className="text-[6.5px] text-emerald-600 font-bold block mt-0.5">Excellent</span>
            </div>
          </div>
        </div>

        {/* Small Badges Section */}
        <div id="successful-jobs-badge-strip" className={`p-3 border rounded-xl flex items-center justify-between gap-2 ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-gradient-to-r from-teal-50/40 to-teal-50/10 border-teal-100'
        }`}>
          <div className="flex items-center gap-2 text-left">
            <div className="w-6 h-6 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
              <ThumbsUp size={12} className="fill-teal-500/25" />
            </div>
            <div>
              <div className="text-[9px] font-black text-slate-800 dark:text-slate-200">Platinum Specialist Milestone</div>
              <p className="text-[7.5px] text-slate-500 dark:text-slate-400 font-medium">Successfully locked {totalSuccessfulJobs} verified labor requests across Lahore.</p>
            </div>
          </div>
          <span className="text-[9px] font-black bg-teal-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
            +{totalSuccessfulJobs} Jobs
          </span>
        </div>

        {/* Past Jobs with Ratings & Reviews List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
              Completed Job History & Reviews
            </span>
            <span className="text-[7.5px] font-bold text-slate-400 font-mono">
              Live Feed
            </span>
          </div>

          {/* Search bar specifically for customer name filtering */}
          <div className="relative mb-3.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={11} className="text-slate-450 shrink-0" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name..."
              className={`w-full text-[10px] pl-8 pr-8 py-2 rounded-xl border outline-none transition-all focus:ring-1 focus:ring-teal-500 font-bold font-sans ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' 
                  : 'bg-white border-slate-200 text-slate-850 placeholder-slate-400 shadow-3xs'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-250 p-1 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={10} />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {filteredCompletedJobsList.length === 0 ? (
              <div className={`text-center p-6 border border-dashed rounded-2xl ${isDarkMode ? 'border-slate-800 bg-slate-900/10 text-slate-505' : 'border-slate-202 bg-slate-50/50 text-slate-450'}`}>
                <Search size={16} className="mx-auto mb-2 text-slate-350" />
                <span className="text-[9.5px] font-black uppercase tracking-wider block mb-1">No past bookings found</span>
                <p className="text-[8.5px] text-slate-400 max-w-[190px] mx-auto leading-relaxed">We couldn't find any completed jobs under custom entry "{searchQuery}".</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[8.5px] font-extrabold rounded-lg shadow-xs transition-all cursor-pointer font-sans"
                >
                  Reset filter
                </button>
              </div>
            ) : (
              filteredCompletedJobsList.map((job) => {
                // Determine icon or badge color
                const isElectric = job.service.toLowerCase() === 'electrician';
                return (
                  <div 
                    key={job.id} 
                    id={`past-job-${job.id}`}
                    className={`p-3 border rounded-xl text-left transition-all ${
                      isDarkMode 
                        ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700' 
                        : 'bg-white border-slate-200/70 hover:border-slate-300 shadow-3xs'
                    }`}
                  >
                    {/* Header line of the completed job */}
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${
                            isElectric 
                              ? 'bg-teal-50 text-teal-650 dark:bg-teal-950/40 dark:text-teal-400' 
                              : 'bg-blue-50 text-blue-650 dark:bg-blue-950/40 dark:text-blue-400'
                          }`}>
                            {job.service}
                          </span>
                          <span className="text-[7px] font-bold text-slate-400 font-mono">{job.id}</span>
                        </div>
                        <h4 className="font-extrabold text-[10.5px] text-slate-800 dark:text-slate-100 uppercase mt-1 leading-tight">
                          {job.subService}
                        </h4>
                      </div>
                      <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 font-mono">
                        PKR {job.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Middle: Rating and customer detail */}
                    <div className="flex items-center gap-1.5 text-[8.5px] text-slate-500 dark:text-slate-400 mb-2 font-bold">
                      <div className="flex items-center text-amber-500">
                        <Star size={9} className="fill-amber-400 text-amber-500 mr-0.5" />
                        <span>{job.rating}</span>
                      </div>
                      <span>•</span>
                      <span>By {job.customer}</span>
                      <span>•</span>
                      <span className="text-slate-400 font-medium">{job.date}</span>
                    </div>

                    {/* Bottom: Review paragraph */}
                    <p className="text-[8.5px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100/60 dark:border-slate-900/40 leading-relaxed font-semibold">
                      "{job.review}"
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Footer Disclaimer */}
      <div className={`p-3 text-center border-t text-[7px] font-black text-slate-400 uppercase tracking-widest shrink-0 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'
      }`}>
        🔒 Lahore Haazir verified operator credentials
      </div>

    </div>
  );
};
