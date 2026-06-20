import React, { useState, useEffect } from 'react';
import { MapPin, Compass, Home, Clock, Star, Navigation, RotateCcw, ShieldCheck } from 'lucide-react';
import { BookingState } from '../types';

interface InProgressRouteMapProps {
  booking: BookingState;
  isDarkMode: boolean;
  language: 'en' | 'ur';
}

export function InProgressRouteMap({ booking, isDarkMode, language }: InProgressRouteMapProps) {
  const [satelliteView, setSatelliteView] = useState<boolean>(false);
  const [simulatedProgress, setSimulatedProgress] = useState<number>(45); // percentage completed of route
  const [isAnimating, setIsAnimating] = useState<boolean>(true);

  // Auto-animate position along the path for a beautiful lived-in experience
  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 100) return 15; // wrap around
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const customerName = booking.provider ? "Customer Site" : "Service Address";
  const workerName = booking.provider?.name || "Haazir Specialist";

  // Infer customer address coordinates based on known DHA/Lahore presets
  let customerLabel = booking.address || "DHA Phase 5, Block C";
  let landmarkName = "DHA Phase 5 Sector C";
  let canalCrossing = "Haazir Central Canal Crossing";

  if (customerLabel.includes('Phase 6')) {
    landmarkName = "DHA Phase 6 Ring Road Exit";
    canalCrossing = "Bedian Road Crossing";
  } else if (customerLabel.includes('Phase 8') || customerLabel.includes('Creek')) {
    landmarkName = "DHA Phase 8 Broadway Avenue";
    canalCrossing = "Barki Road Link";
  } else if (customerLabel.includes('Gulberg') || customerLabel.includes('M.M. Alam')) {
    landmarkName = "M.M. Alam Road Commercial Boulevard";
    canalCrossing = "Gulberg Main Canal Bridge";
  }

  // Calculate dynamic intermediate coordinate along SVG path
  // The route path is a complex path (e.g., M 40 180 Q 80 80, 165 90 T 260 40)
  // We can approximate the worker icon offset along the path:
  // S1: (40, 185) -> Worker Depot (Phase 3 Hub)
  // S2: (130, 120) -> Canal crossing landmark
  // S3: (260, 50) -> Customer Site
  const t = simulatedProgress / 100;
  
  // Quadratic bezier or cubic calculation for the SVG route line
  // P0 = (30, 150), P1 = (110, 140), P2 = (140, 60), P3 = (250, 40)
  const x0 = 35, y0 = 155;
  const x1 = 120, y1 = 135;
  const x2 = 130, y2 = 65;
  const x3 = 245, y3 = 45;

  // Cubic Bezier interpolation
  const workerX = Math.pow(1 - t, 3) * x0 + 3 * Math.pow(1 - t, 2) * t * x1 + 3 * (1 - t) * Math.pow(t, 2) * x2 + Math.pow(t, 3) * x3;
  const workerY = Math.pow(1 - t, 3) * y0 + 3 * Math.pow(1 - t, 2) * t * y1 + 3 * (1 - t) * Math.pow(t, 2) * y2 + Math.pow(t, 3) * y3;

  const currentDistanceKm = ((1 - t) * 4.2).toFixed(1);
  const currentEtaMins = Math.max(1, Math.round((1 - t) * 12));

  return (
    <div className={`border rounded-2xl p-3 shadow-sm select-none relative overflow-hidden animate-fade-in mb-4 transition-all duration-300 ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-150'
    }`}>
      {/* Map Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className={`text-[9px] font-black uppercase tracking-wider truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {language === 'en' ? 'Live Telemetry Vector Map' : 'لائیو لوکیشن ویکٹر میپ'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSatelliteView(!satelliteView)}
            className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
              satelliteView 
                ? 'bg-teal-600 border-teal-500 text-white' 
                : isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {satelliteView ? '🛰️ Satellite' : '🗺️ Vector'}
          </button>
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`p-0.5 rounded border transition-all ${
              isAnimating 
                ? 'text-teal-600 border-teal-100 dark:border-teal-900/30' 
                : 'text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
            title="Pause auto-tracker"
          >
            <Compass size={11} className={`${isAnimating ? 'animate-spin-slow' : ''}`} />
          </button>
        </div>
      </div>

      {/* Actual Map Canvas (SVG) */}
      <div className="relative h-44 rounded-xl overflow-hidden border border-slate-250 dark:border-slate-800/80 bg-slate-950">
        
        {/* Satellite Imagery Background Mock */}
        {satelliteView ? (
          <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none select-none">
            {/* Subtle matrix dots representing high-res structures */}
            <div className="absolute inset-0 bg-radial-matrix grid grid-cols-12 gap-1.5 p-1 text-[4px] font-mono text-emerald-900/35 overflow-hidden">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i}>S_GRID_BLOCK_{100 + i}</div>
              ))}
            </div>
            {/* Forest green and gray building patterns */}
            <div className="absolute top-4 left-6 w-16 h-8 bg-slate-800 rounded opacity-50 border border-slate-700/80" />
            <div className="absolute top-16 left-28 w-12 h-14 bg-emerald-950/45 rounded opacity-40" />
            <div className="absolute top-2 left-44 w-14 h-12 bg-slate-850 rounded opacity-60" />
            <div className="absolute top-28 left-4 w-20 h-10 bg-emerald-950/30 rounded opacity-50" />
            <div className="absolute top-26 left-32 w-16 h-12 bg-slate-800 rounded opacity-50" />
          </div>
        ) : (
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
            {/* Soft grid matrix */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          </div>
        )}

        {/* Lahore Canal Waterway Representation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Canal flowing through Lahore */}
          <path 
            d="M -20 120 C 60 120, 110 90, 200 40 T 320 -10" 
            fill="none" 
            stroke={satelliteView ? '#075985' : '#1e3a5f'} 
            strokeWidth="12" 
            className="opacity-45"
          />
          <path 
            d="M -20 120 C 60 120, 110 90, 200 40 T 320 -10" 
            fill="none" 
            stroke="#0284c7" 
            strokeWidth="3" 
            className="opacity-75 animate-pulse"
          />

          {/* Core road networks (Ferozepur Road, Lahore Ring Road etc) */}
          <path 
            d="M 120 -20 L 120 200" 
            fill="none" 
            stroke={isDarkMode ? '#334155' : '#1e293b'} 
            strokeWidth="4" 
            className="opacity-40" 
          />
          <path 
            d="M -20 150 L 320 150" 
            fill="none" 
            stroke={isDarkMode ? '#334155' : '#1e293b'} 
            strokeWidth="3.5" 
            className="opacity-30" 
          />
          <path 
            d="M 35 155 Q 120 135, 130 65 T 245 45" 
            fill="none" 
            stroke={isDarkMode ? '#475569' : '#64748b'} 
            strokeWidth="2.5" 
            strokeDasharray="2,3" 
            className="opacity-60" 
          />

          {/* Dotted Green Belt of the Canal */}
          <path 
            d="M -20 120 C 60 120, 110 90, 200 40 T 320 -10" 
            fill="none" 
            stroke="#059669" 
            strokeWidth="1.5" 
            strokeDasharray="3,6" 
            className="opacity-35"
          />

          {/* Highlighted active route from worker location to customer address */}
          <path 
            d="M 35 155 Q 120 135, 130 65 T 245 45" 
            fill="none" 
            stroke="#14b8a6" 
            strokeWidth="3" 
            strokeLinecap="round"
            className="opacity-80"
          />
          <path 
            d="M 35 155 Q 120 135, 130 65 T 245 45" 
            fill="none" 
            stroke="#ccfbf1" 
            strokeWidth="1" 
            strokeLinecap="round"
            strokeDasharray="4,8"
            className="animate-route-flow"
          />

          {/* Route Milestones / Labels */}
          <text x="50" y="172" fill="#94a3b8" fontSize="6.5" fontWeight="black" className="opacity-75">
            HAZIR CORES DEPOT (P3)
          </text>
          <text x="135" y="105" fill="#14b8a6" fontSize="6" fontWeight="bold">
            {canalCrossing.toUpperCase()}
          </text>
          <text x="180" y="32" fill="#94a3b8" fontSize="6.5" fontWeight="black" className="opacity-75">
            {landmarkName.toUpperCase()}
          </text>
        </svg>

        {/* Start Node Indicator (Depot / Worker Origin) */}
        <div className="absolute left-[24px] top-[144px] flex flex-col items-center z-10">
          <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-650 flex items-center justify-center text-slate-300 shadow-sm">
            <Compass size={9} className="text-slate-400 text-[8px]" />
          </div>
          <span className="text-[5.5px] font-black text-slate-400 bg-slate-900 border border-slate-800 px-1 py-0.2 rounded mt-0.5 whitespace-nowrap block">
            DEPOT
          </span>
        </div>

        {/* Customer Address Goal Node Indicator */}
        <div className="absolute left-[234px] top-[34px] flex flex-col items-center z-10 text-center">
          <div className="relative">
            <span className="absolute -inset-1 rounded-full bg-teal-500/30 animate-ping" />
            <div className="w-6 h-6 rounded-full bg-teal-650 border border-teal-400 flex items-center justify-center text-white shadow-md">
              <Home size={11} className="fill-white" />
            </div>
          </div>
          <span className="text-[6px] font-black text-teal-200 bg-teal-950/90 border border-teal-800/80 px-1 py-0.5 rounded mt-0.5 uppercase tracking-wide block max-w-[80px] truncate shadow">
            {language === 'en' ? 'Job Site' : 'سروس سائٹ'}
          </span>
        </div>

        {/* Real-time Animating Motorbike Worker Node Overlay */}
        <div 
          className="absolute z-20 flex flex-col items-center"
          style={{ 
            left: `${workerX - 10}px`, 
            top: `${workerY - 24}px`,
            transition: 'all 0.4s linear'
          }}
        >
          <div className="relative">
            <span className="absolute -inset-1 rounded-full bg-amber-500/40 animate-ping" />
            <div className="w-6 h-6 rounded-full bg-amber-500 border border-white flex items-center justify-center text-slate-900 shadow-md transform hover:rotate-12 transition-transform cursor-pointer">
              <Navigation size={11} className="text-slate-950 transform rotate-45 rotate-90" />
            </div>
          </div>
          <span className="text-[5.5px] font-black text-amber-100 bg-amber-950/90 border border-amber-600/75 px-1 py-0.3 rounded mt-0.5 uppercase whitespace-nowrap shadow tracking-tight">
            🏍️ {workerName.split(' ')[0]} ({simulatedProgress}%)
          </span>
        </div>

        {/* Map Legend Hud Overlay */}
        <div className="absolute bottom-1.5 left-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1.5 text-[7px] max-w-[130px] shadow backdrop-blur-xs text-left leading-tight">
          <div className="flex items-center gap-1 mb-0.5 text-slate-300 font-bold uppercase tracking-tight">
            <Clock size={8} className="text-teal-400" />
            <span>{language === 'en' ? 'Haazir Dispatch ETA' : 'پہنچنے کا وقت'}</span>
          </div>
          <p className="text-slate-400 font-medium">
            {language === 'en' ? `Distance: ~${currentDistanceKm} km left` : `فاصلہ: تقریباً ${currentDistanceKm} کلومیٹر`}
          </p>
          <p className="text-teal-300 font-extrabold text-[8px] mt-0.5">
            {language === 'en' ? `ETA: ~${currentEtaMins} mins` : `وقت: ~${currentEtaMins} منٹ`}
          </p>
        </div>

        {/* Satellite Signal Grounding Quality Overlay Badge */}
        <div className="absolute top-1.5 right-1.5 bg-slate-900/80 border border-slate-750 p-1 rounded-md text-[6.5px] font-mono text-emerald-400 flex items-center gap-1">
          <ShieldCheck size={9} />
          <span>GSM QUALITY: 99.4% (SECURE)</span>
        </div>
      </div>

      {/* Helper text block explaining the Live feed */}
      <div className="mt-2 text-left bg-teal-950/20 dark:bg-teal-950/15 border border-teal-900/30 p-2 rounded-xl">
        <p className={`text-[8.5px] font-bold ${isDarkMode ? 'text-teal-300' : 'text-teal-750'} leading-relaxed`}>
          {language === 'en' 
            ? `🏍️ ${workerName} set off in response to your Lahore repair request. Custom GPS router confirms active dispatch route safely bypassing major ring crossings.`
            : `🏍️ ٹیکنیشن ${workerName} آپ کے لاہور کے ایڈریس پر روانہ ہو چکے ہیں۔ لائیو جی پی ایس روٹر کے مطابق سفر خیریت سے جاری ہے۔`
          }
        </p>
      </div>
    </div>
  );
}
