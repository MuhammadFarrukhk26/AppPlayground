import React from 'react';
import { Radio, Bell, ArrowRight, UserCheck, CheckSquare, XCircle, Pocket } from 'lucide-react';
import { ActionLog } from '../types';

interface LogsStreamProps {
  logs: ActionLog[];
}

export default function LogsStream({ logs }: LogsStreamProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col h-[560px]">
      
      {/* Header telemetry info */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </div>
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">System Activity Feed</h4>
        </div>
        <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">
          Socket Channel: HZ-LIVE
        </span>
      </div>

      {/* Description */}
      <p className="text-[10px] text-slate-405 leading-normal select-none font-medium">
        This feed displays real-time messages transmitted across the local pub/sub client hub. Observe changes instantly as they update in the dual simulators.
      </p>

      {/* Stack feed */}
      <div className="flex-grow overflow-y-auto space-y-3 pr-1.5 no-scrollbar">
        {logs.length === 0 ? (
          <div className="text-center py-24 select-none text-slate-400 text-[10px] font-medium leading-relaxed">
            No dispatched messages yet. Schedule a labor request to trigger socket relays.
          </div>
        ) : (
          logs.map((log) => {
            // Pick a message emblem
            let Icon = Bell;
            let theme = 'bg-slate-50 text-slate-600 border-slate-100';

            if (log.message.includes('Customer raised')) {
              Icon = Bell;
              theme = 'bg-teal-50/70 text-teal-800 border-teal-100';
            } else if (log.message.includes('ACCEPT_JOB')) {
              Icon = UserCheck;
              theme = 'bg-slate-50 text-slate-700 border-slate-200/80';
            } else if (log.message.includes('IN_PROGRESS')) {
              Icon = Radio;
              theme = 'bg-amber-50/70 text-amber-800 border-amber-100';
            } else if (log.message.includes('cancelled')) {
              Icon = XCircle;
              theme = 'bg-red-50 text-red-700 border-red-100';
            } else if (log.message.includes('archived')) {
              Icon = CheckSquare;
              theme = 'bg-emerald-50 text-emerald-700 border-emerald-100';
            }

            return (
              <div 
                key={log.id} 
                className={`p-3 rounded-2xl border text-2xs leading-normal flex items-start gap-3 transition-all ${theme}`}
              >
                <div className="p-1 px-1.5 bg-white/40 rounded-lg shrink-0 mt-0.5">
                  <Icon size={12} />
                </div>
                <div className="flex-grow min-w-0 text-left">
                  <p className="font-bold text-slate-750 break-normal leading-relaxed">{log.message}</p>
                  <span className="text-[9px] text-slate-400 font-mono block mt-1">
                    {log.time}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Base info line */}
      <div className="text-center text-[10px] text-slate-400 select-none pt-3 mt-3 border-t border-slate-100 shrink-0 font-medium flex items-center justify-center gap-1">
        <Pocket size={11} className="text-teal-600" />
        <span>Toggling views simulates live microservices interaction.</span>
      </div>

    </div>
  );
}
