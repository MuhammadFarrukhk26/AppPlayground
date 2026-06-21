import React, { useMemo } from 'react';
import { BookingState } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { TrendingUp, DollarSign, CheckCircle, AlertOctagon, Sparkles, PieChartIcon } from 'lucide-react';

interface AnalyticsProps {
  bookings: BookingState[];
  isDarkMode: boolean;
}

export const Analytics: React.FC<AnalyticsProps> = ({ bookings = [], isDarkMode }) => {
  // 1. Process bookings dynamically for category revenue (PKR = rate * 100)
  const categoryRevenueData = useMemo(() => {
    // Baseline historical revenue in PKR
    const baseline: Record<string, number> = {
      electrician: 14500,
      plumber: 9800,
      cctv: 6200,
      cleaning: 7500,
    };

    // Aggregate actual bookings
    bookings.forEach((b) => {
      if (b.status === 'completed') {
        const key = (b.serviceKey || b.service || 'electrician').toLowerCase();
        const pkrValue = (b.price?.total || 0) * 100;
        baseline[key] = (baseline[key] || 0) + pkrValue;
      }
    });

    // Map to recharts structure
    return [
      { name: 'Electrician', value: baseline.electrician, color: '#0d9488' }, // Teal
      { name: 'Plumber', value: baseline.plumber, color: '#3b82f6' },      // Blue
      { name: 'CCTV Specialist', value: baseline.cctv, color: '#f59e0b' },   // Amber
      { name: 'Cleaning & Maid', value: baseline.cleaning, color: '#8b5cf6' },  // Purple
    ];
  }, [bookings]);

  // 2. Compute dynamic KPI metrics
  const stats = useMemo(() => {
    let completedCount = 42; // baseline completed
    let cancelledCount = 3;  // baseline cancelled
    let actualRevenue = 0;

    bookings.forEach((b) => {
      if (b.status === 'completed') {
        completedCount += 1;
        actualRevenue += (b.price?.total || 0) * 100;
      } else if (b.status === 'cancelled') {
        cancelledCount += 1;
      }
    });

    const totalJobs = completedCount + cancelledCount;
    const completionRate = totalJobs > 0 ? Math.round((completedCount / totalJobs) * 100) : 100;
    const baselineRevenue = 14500 + 9800 + 6200 + 7500;
    const totalRevenue = baselineRevenue + actualRevenue;

    return {
      completedCount,
      cancelledCount,
      completionRate,
      totalRevenue
    };
  }, [bookings]);

  // 3. Dynamic completion rate & volume over time
  // Group bookings by week or use baseline trend modified by live actions
  const timelineData = useMemo(() => {
    // We mock a baseline and we add user's active/completed actions in the final week for dynamic interactive behavior
    let week4Completed = 12;
    let week4Cancelled = 1;

    bookings.forEach((b) => {
      if (b.status === 'completed') {
        week4Completed += 1;
      } else if (b.status === 'cancelled') {
        week4Cancelled += 1;
      }
    });

    const wk4Total = week4Completed + week4Cancelled;
    const wk4Rate = wk4Total > 0 ? Math.round((week4Completed / wk4Total) * 100) : 92;

    return [
      { week: 'Week 1', rate: 88, completed: 8, revenue: 8400 },
      { week: 'Week 2', rate: 90, completed: 11, revenue: 11200 },
      { week: 'Week 3', rate: 91, completed: 10, revenue: 10500 },
      { week: 'Week 4', rate: wk4Rate, completed: week4Completed, revenue: week4Completed * 1000 + week4Cancelled * 200 },
    ];
  }, [bookings]);

  // Format currency
  const formatPKR = (val: number) => {
    return `PKR ${val.toLocaleString()}`;
  };

  return (
    <div id="analytics-root-container" className="space-y-3.5 pb-2 animate-fade-in">
      
      {/* Title block with sparkles decoration */}
      <div className={`p-3 border rounded-2xl flex items-start gap-2.5 text-left transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-br from-teal-50/70 to-white border-teal-100'
      }`}>
        <div className="w-7 h-7 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0 border border-teal-500/20">
          <Sparkles size={12} className="animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h6 className={`font-black text-[10px] uppercase tracking-wider ${isDarkMode ? 'text-teal-400' : 'text-teal-800'}`}>
            My Performance Analytics
          </h6>
          <p className="text-[8.5px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5 font-medium">
            Dynamic analytics tracking your Lahore platform service completion rates, revenue categories, and weekly growth.
          </p>
        </div>
      </div>

      {/* Grid Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div id="stat-revenue-card" className={`p-2.5 border rounded-xl text-center flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-150 shadow-3xs'
        }`}>
          <div className="flex items-center justify-center mb-1">
            <DollarSign size={10} className="text-teal-600" />
            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider ml-0.5">Earnings</span>
          </div>
          <span className={`text-[10px] font-black leading-tight ${isDarkMode ? 'text-teal-400' : 'text-teal-750'}`}>
            PKR {stats.totalRevenue.toLocaleString()}
          </span>
          <span className="text-[6.5px] text-slate-400 mt-1">Platform Total</span>
        </div>

        <div id="stat-completion-card" className={`p-2.5 border rounded-xl text-center flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-150 shadow-3xs'
        }`}>
          <div className="flex items-center justify-center mb-1">
            <CheckCircle size={10} className="text-emerald-500" />
            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider ml-0.5">Success Rate</span>
          </div>
          <span className={`text-[10.5px] font-black leading-tight ${isDarkMode ? 'text-emerald-400' : 'text-emerald-750'}`}>
            {stats.completionRate}%
          </span>
          <span className="text-[6.5px] text-emerald-600 font-bold mt-1">Target: &gt;90%</span>
        </div>

        <div id="stat-jobs-card" className={`p-2.5 border rounded-xl text-center flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-150 shadow-3xs'
        }`}>
          <div className="flex items-center justify-center mb-1">
            <AlertOctagon size={10} className="text-rose-500" />
            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider ml-0.5">Cancelled</span>
          </div>
          <span className={`text-[10px] font-black leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            {stats.cancelledCount} Jobs
          </span>
          <span className="text-[6.5px] text-rose-500 font-bold mt-1">Loss penalty: 0%</span>
        </div>
      </div>

      {/* Chart 1: Revenue per Class Category (BarChart) */}
      <div id="revenue-by-category-chart" className={`p-3 border rounded-2xl text-left ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200/70 shadow-3xs'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider">
            Revenue by Service Category
          </span>
          <span className="text-[7px] font-bold text-slate-400 text-teal-600 bg-teal-50 dark:bg-teal-950/20 px-1 rounded">
            Live updates
          </span>
        </div>

        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryRevenueData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={7} 
                tickLine={false} 
                axisLine={false} 
                fontWeight="bold"
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={7} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                formatter={(value: any) => [`PKR ${Number(value).toLocaleString()}`, 'Revenue']}
                contentStyle={{
                  fontSize: '8px',
                  borderRadius: '6px',
                  background: isDarkMode ? '#0f172a' : '#ffffff',
                  border: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                  padding: '4px 8px'
                }}
              />
              <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={14}>
                {categoryRevenueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {categoryRevenueData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-[7.5px] font-bold">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate max-w-[90px]">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className={isDarkMode ? 'text-slate-200' : 'text-slate-750'}>
                {formatPKR(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Job Completion Success Trend Over Time (LineChart) */}
      <div id="job-completion-trends-chart" className={`p-3 border rounded-2xl text-left ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200/70 shadow-3xs'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider">
            Weekly Success & volume
          </span>
          <span className="text-[7px] font-bold text-slate-400 font-mono">
            Last 4 Weeks
          </span>
        </div>

        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 5, right: 8, left: -24, bottom: 0 }}>
              <XAxis 
                dataKey="week" 
                stroke="#64748b" 
                fontSize={7} 
                tickLine={false} 
                axisLine={false} 
                fontWeight="bold"
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={7} 
                tickLine={false} 
                axisLine={false}
                domain={[70, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                formatter={(value: any, name: any) => {
                  if (name === 'rate') return [`${value}%`, 'Acceptance'];
                  if (name === 'completed') return [value, 'Jobs Completed'];
                  return [value, name];
                }}
                contentStyle={{
                  fontSize: '8px',
                  borderRadius: '6px',
                  background: isDarkMode ? '#0f172a' : '#ffffff',
                  border: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                  padding: '4px 8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#0d9488" 
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
                name="rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[7px] font-black text-slate-400 uppercase mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span>📈 Monthly level trajectory</span>
          <span className="text-teal-600 dark:text-teal-400 font-extrabold normal-case">Rising completion curve</span>
        </div>
      </div>

    </div>
  );
};
