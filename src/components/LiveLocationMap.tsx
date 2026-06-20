import React from 'react';
import { MapPin, Info, Compass, Shield, Navigation } from 'lucide-react';
import { BookingState } from '../types';

interface LiveLocationMapProps {
  booking: BookingState;
  isDarkMode: boolean;
  language: 'en' | 'ur';
}

export function LiveLocationMap({ booking, isDarkMode, language }: LiveLocationMapProps) {
  // Determine landmarks based on preset addresses
  const addressStr = booking.address || "DHA Phase 5, Block T, House 42, Lahore";
  let targetArea = "DHA Phase 5";
  let nearByLandmark = "LUMS Sector Area";

  if (addressStr.includes('Gulberg')) {
    targetArea = "Gulberg III";
    nearByLandmark = "M.M. Alam Commercial Avenue";
  } else if (addressStr.includes('Bahria')) {
    targetArea = "Bahria Town Sec D";
    nearByLandmark = "Grand Jamia Mosque Link";
  } else if (addressStr.includes('Phase 6')) {
    targetArea = "DHA Phase 6";
    nearByLandmark = "Raya Commercial Fairways";
  } else if (addressStr.includes('Phase 8')) {
    targetArea = "DHA Phase 8";
    nearByLandmark = "Broadway Commercial Blvd";
  }

  return (
    <div className={`border rounded-2xl p-3 shadow-2xs mb-4 select-none relative animate-fade-in transition-all duration-300 ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-150 text-slate-800'
    }`}>
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span className={`text-[9.5px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {language === 'en' ? 'Live Location Hub' : 'لائیو لوکیشن ہب'}
          </span>
        </div>
        <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
          isDarkMode ? 'bg-slate-950 border-slate-800 text-teal-400' : 'bg-teal-50 border-teal-100 text-teal-700'
        }`}>
          📍 STATIC GPS PIN
        </span>
      </div>

      {/* Static Map Canvas Placeholder */}
      <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-850 bg-slate-950 shadow-inner">
        
        {/* Styled Static Map Background elements (Mocking premium vector tiles) */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        </div>

        {/* Mocking detailed neighborhood roads */}
        <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Ring Road Grid */}
          <path d="M -20 90 L 320 90" stroke={isDarkMode ? '#334155' : '#475569'} strokeWidth="18" fill="none" opacity="0.3" />
          <path d="M 150 -10 L 150 200" stroke={isDarkMode ? '#334155' : '#475569'} strokeWidth="12" fill="none" opacity="0.3" />
          
          {/* Internal residential sectors */}
          <path d="M 30 -20 Q 80 50, 150 90" stroke={isDarkMode ? '#1e293b' : '#64748b'} strokeWidth="4" fill="none" opacity="0.4" />
          <path d="M 150 90 T 260 190" stroke={isDarkMode ? '#1e293b' : '#64748b'} strokeWidth="4" fill="none" opacity="0.4" />
          <path d="M -20 150 L 320 30" stroke={isDarkMode ? '#1e293b' : '#64748b'} strokeWidth="2.5" fill="none" opacity="0.35" />
          <path d="M 70 -10 L 70 200" stroke={isDarkMode ? '#1e293b' : '#334155'} strokeWidth="2" fill="none" opacity="0.2" />
          <path d="M 230 -10 L 230 200" stroke={isDarkMode ? '#1e293b' : '#334155'} strokeWidth="2" fill="none" opacity="0.2" />

          {/* DHA Sector Green Belt (Park areas) */}
          <rect x="25" y="15" width="60" height="40" rx="6" fill="#047857" opacity="0.15" />
          <text x="32" y="38" fill="#10b981" fontSize="6" fontWeight="bold" opacity="0.6">DHA COMMUNITY PARK</text>

          {/* Another commercial block */}
          <rect x="180" y="110" width="70" height="50" rx="6" fill="#334155" opacity="0.15" />
          <text x="188" y="132" fill="#94a3b8" fontSize="6.5" fontWeight="black" opacity="0.5">COMMERCIAL SUB-HUB</text>

          {/* Text Labels along Streets */}
          <text x="10" y="86" fill="#64748b" fontSize="5.5" fontWeight="bold" opacity="0.75" transform="rotate(0, 10, 86)">
            KHYABAN-E-JINNAH BLVD
          </text>
          <text x="122" y="135" fill="#64748b" fontSize="5" fontWeight="bold" opacity="0.6" transform="rotate(90, 122, 135)">
            SECTOR MAIN ROAD
          </text>

          {/* Lahore Canal accent flowing nearby */}
          <path d="M -20 40 Q 140 10, 320 100" fill="none" stroke="#38bdf8" strokeWidth="5" opacity="0.25" />
        </svg>

        {/* Shimmering Circular Radar Ping around Pin */}
        <div className="absolute left-[142px] top-[82.5px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 pointer-events-none">
          <span className="absolute w-24 h-24 bg-teal-500/10 rounded-full animate-ping opacity-45 delay-300" />
          <span className="absolute w-14 h-14 bg-teal-500/15 rounded-full animate-pulse opacity-60" />
        </div>

        {/* Physical Custom Location Pin for Service address */}
        <div className="absolute left-[142px] top-[82.5px] -translate-x-1/2 -translate-y-[85%] z-20 flex flex-col items-center">
          {/* Popup speech bubble */}
          <div className="bg-teal-650 text-white font-extrabold text-[8px] py-1 px-2 rounded-lg shadow-md border border-teal-400/30 mb-1 animate-bounce flex items-center gap-1 whitespace-nowrap">
            <span className="text-[7.5px]">📍 {targetArea}</span>
          </div>
          
          {/* Custom Pin drop visual */}
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring */}
            <span className="absolute w-3.5 h-3.5 bg-rose-500 rounded-full animate-ping opacity-55" />
            <div className="w-7 h-7 rounded-full bg-rose-600 border border-white flex items-center justify-center text-white shadow-xl relative z-10">
              <MapPin size={13} className="fill-white" />
            </div>
            {/* Pin base arrow projection */}
            <div className="w-1.5 h-1.5 bg-rose-605 bg-rose-600 border-r border-b border-white rotate-45 -mt-0.5 relative z-10" />
          </div>
        </div>

        {/* Small Navigation overlay */}
        <div className="absolute top-2 left-2 bg-slate-900/95 border border-slate-800 rounded-lg px-2 py-1 text-[7.5px] flex items-center gap-1 z-10 shadow">
          <Navigation size={9} className="text-teal-400 rotate-45" />
          <span className="text-slate-300 font-extrabold tracking-tight">LAT: 31.478 | LNG: 74.453</span>
        </div>

        {/* Security / Safe Signal quality check tag */}
        <div className="absolute top-2 right-2 bg-slate-900/95 border border-slate-800 rounded-lg px-2 py-1 text-[7px] flex items-center gap-1 z-10 shadow text-emerald-400 font-mono">
          <Shield size={9} />
          <span>VERIFIED PORTAL</span>
        </div>

        {/* Bottom card layout with exact metadata of physical target address */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-slate-900/95 border border-slate-800/80 rounded-xl p-2 z-10 flex items-center gap-2.5 shadow-md backdrop-blur-xs">
          <div className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 text-[10px] font-black shrink-0">
            i
          </div>
          <div className="min-w-0 flex-1 leading-normal">
            <span className="text-[6.5px] font-black uppercase tracking-wider text-teal-400 block leading-none">
              Inferred Service Location
            </span>
            <p className="text-[9.5px] font-black truncate text-slate-100 leading-tight">
              {addressStr}
            </p>
            <p className="text-[7.5px] text-slate-400 font-medium truncate">
              Landmark alignment: adjacent to {nearByLandmark}
            </p>
          </div>
        </div>
      </div>

      {/* Helper Information Bar */}
      <div className={`mt-2 p-2 rounded-xl flex items-start gap-1.5 ${
        isDarkMode ? 'bg-slate-950 border border-slate-850' : 'bg-slate-50 border border-slate-150'
      }`}>
        <Info size={11} className={`mt-0.5 shrink-0 ${isDarkMode ? 'text-teal-400' : 'text-teal-650'}`} />
        <p className={`text-[8.5px] font-bold leading-normal text-left ${isDarkMode ? 'text-slate-350' : 'text-slate-650'}`}>
          {language === 'en' 
            ? `This map displays the physical site address registered for your service request. All technicians undergo strict biometric and security checks before deployment.`
            : `یہ نقشہ آپ کی سروس کی درخواست کے لیے رجسٹرڈ فزیکل ایڈریس کو ظاہر کر رہا ہے۔ تمام ماہرین روانگی سے قبل بائیومیٹرک اور سیکیورٹی کی تصدیق سے گزرتے ہیں۔`
          }
        </p>
      </div>
    </div>
  );
}
