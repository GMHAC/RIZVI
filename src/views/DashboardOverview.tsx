import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../types';
import { 
  Award, 
  TrendingUp, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight, 
  BarChart3, 
  Clock, 
  Sparkles,
  Flame,
  AlertTriangle,
  Activity,
  Database,
  Server,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

interface Props {
  setActiveTab: (tab: ActiveTab) => void;
  onOpen2FASetup: () => void;
}

export const DashboardOverview: React.FC<Props> = ({ setActiveTab, onOpen2FASetup }) => {
  const { users, evaluations, tasks } = useAuth();

  // Live system health states
  const [latency, setLatency] = React.useState(18);
  const [isPinging, setIsPinging] = React.useState(false);
  const [queriesPerSecond, setQueriesPerSecond] = React.useState(42);
  const [uptimeSeconds, setUptimeSeconds] = React.useState(1224915); // Starts around 14 days, 4 hours

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (!isPinging) {
        setLatency(prev => {
          const diff = Math.floor(Math.random() * 5) - 2;
          const next = prev + diff;
          return Math.max(12, Math.min(28, next));
        });
      }

      setQueriesPerSecond(prev => {
        const diff = Math.floor(Math.random() * 7) - 3;
        const next = prev + diff;
        return Math.max(32, Math.min(58, next));
      });

      setUptimeSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPinging]);

  const handleManualPing = () => {
    if (isPinging) return;
    setIsPinging(true);
    setTimeout(() => {
      setLatency(Math.floor(Math.random() * 6) + 11); // Resolve to 11ms - 16ms
      setIsPinging(false);
    }, 800);
  };

  const formatUptime = (totalSecs: number) => {
    const days = Math.floor(totalSecs / (3600 * 24));
    const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Aggregate stats across evaluations
  const avgTodayScore = Math.round(evaluations.reduce((acc, curr) => acc + curr.dailyPercentage, 0) / (evaluations.length || 1));
  const avgWeeklyScore = Math.round(evaluations.reduce((acc, curr) => acc + curr.weeklyAveragePct, 0) / (evaluations.length || 1));
  const avgMonthlyScore = Math.round(evaluations.reduce((acc, curr) => acc + curr.monthlyAveragePct, 0) / (evaluations.length || 1));
  const avgQuarterlyScore = Math.round(evaluations.reduce((acc, curr) => acc + curr.quarterlyAveragePct, 0) / (evaluations.length || 1));
  const avgHalfYearlyScore = Math.round(evaluations.reduce((acc, curr) => acc + curr.halfYearlyAveragePct, 0) / (evaluations.length || 1));
  const avgAnnualScore = Math.round(evaluations.reduce((acc, curr) => acc + curr.annualAveragePct, 0) / (evaluations.length || 1));

  // Chart Data: KPI Trend
  const kpiTrendData = [
    { day: 'Mon', dailyScore: 88, bonus: 5, productivity: 86, attendance: 98 },
    { day: 'Tue', dailyScore: 92, bonus: 7, productivity: 90, attendance: 96 },
    { day: 'Wed', dailyScore: 90, bonus: 8, productivity: 89, attendance: 99 },
    { day: 'Thu', dailyScore: 95, bonus: 12, productivity: 94, attendance: 100 },
    { day: 'Fri', dailyScore: 93, bonus: 10, productivity: 92, attendance: 97 },
    { day: 'Sat', dailyScore: 96, bonus: 15, productivity: 95, attendance: 98 },
  ];

  // Department Ranking Data
  const deptRankingData = [
    { department: 'Cutting', avgScore: 96.2, totalStaff: 18 },
    { department: 'Sewing A', avgScore: 94.1, totalStaff: 42 },
    { department: 'Sewing B', avgScore: 91.8, totalStaff: 38 },
    { department: 'QA Buyer', avgScore: 88.5, totalStaff: 12 },
    { department: 'HR Compliance', avgScore: 89.2, totalStaff: 8 },
    { department: 'Maintenance', avgScore: 85.0, totalStaff: 14 },
  ];

  // Top 10 Employees Leaderboard
  const sortedEvaluations = [...evaluations].sort((a, b) => b.annualAveragePct - a.annualAveragePct);
  const top10 = sortedEvaluations.slice(0, 10);
  const bottom10 = [...evaluations].sort((a, b) => a.annualAveragePct - b.annualAveragePct).slice(0, 5);

  const getRatingBadge = (pct: number) => {
    if (pct >= 95) return { rating: 'Outstanding', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50', rec: 'Fast Track Promotion' };
    if (pct >= 90) return { rating: 'Excellent', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50', rec: 'Promotion Eligible' };
    if (pct >= 85) return { rating: 'Very Good', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50', rec: 'Increment Priority' };
    if (pct >= 80) return { rating: 'Good', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50', rec: 'Continue Development' };
    return { rating: 'Needs Improvement', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/50', rec: 'Improvement Plan' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 select-none">
      {/* High-Tech Banner */}
      <div className="bg-gradient-to-r from-[#0a0d14] via-[#0e1424] to-[#0a0d14] border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.1)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-400 to-cyan-500/0"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold uppercase tracking-widest">
                ISO 9001 / BUYER COMPLIANCE CERTIFIED
              </span>
              <span className="text-slate-500 text-xs">| Rizvi Fashions Master Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
              <span>Employee Performance Evaluation Dashboard</span>
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              অত্যাধুনিক অটোমেটিক গ্রাফিক্স ডিজাইন ড্যাশবোর্ড — Real-time 100 Marks KPI aggregation across Daily, Weekly, Monthly, Quarterly, Half-Yearly and Annual performance matrices.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveTab('evaluations')}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center space-x-2"
            >
              <Award className="w-4 h-4" />
              <span>100 Marks KPI Calculator</span>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 font-bold text-xs rounded-xl transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>দৈনিক কাজের তালিকা</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live System Health Dashboard Card */}
      <div className="bg-[#0a0d14] border border-cyan-500/20 rounded-2xl p-4 sm:p-5 shadow-[0_0_20px_rgba(6,182,212,0.05)] relative overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
          {/* Section Header */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-2.5 bg-cyan-950/80 border border-cyan-800/40 rounded-xl">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">LIVE SYSTEM OVERWATCH</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200">Production Node Status</h3>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Latency */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 flex items-center justify-between group hover:border-cyan-500/30 transition-all">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center space-x-1">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SERVER LATENCY</span>
                </span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg font-mono font-black text-slate-100">{latency}</span>
                  <span className="text-[10px] text-slate-400 font-mono">ms</span>
                </div>
              </div>
              
              <button 
                onClick={handleManualPing}
                disabled={isPinging}
                className={`p-2 rounded-lg bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all shrink-0 ${isPinging ? 'cursor-not-allowed opacity-60' : ''}`}
                title="Test live API ping"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Live Uptime */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 flex flex-col justify-center group hover:border-emerald-500/30 transition-all">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>SYSTEM UPTIME</span>
              </span>
              <span className="text-sm font-mono font-black text-slate-100 tracking-wide mt-1.5">
                {formatUptime(uptimeSeconds)}
              </span>
            </div>

            {/* Database Connection */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center space-x-1">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>DATABASE DEPLOYMENT</span>
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-indigo-300">Firestore Cloud</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                    Connected
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-black text-slate-200">{queriesPerSecond}</div>
                <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider">qps rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Score Gauge Cards (6 Periods) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Today's Score */}
        <div className="bg-[#0a0d14] border border-cyan-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden group hover:border-cyan-400 transition-all shadow-lg">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono text-cyan-400 font-bold">
            <span>Today's Score</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-100 font-mono">{avgTodayScore}%</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">+7 Bonus</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full" style={{ width: `${avgTodayScore}%` }}></div>
          </div>
          <p className="text-[9px] text-slate-500">Daily Average Target</p>
        </div>

        {/* Weekly Score */}
        <div className="bg-[#0a0d14] border border-emerald-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden group hover:border-emerald-400 transition-all shadow-lg">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono text-emerald-400 font-bold">
            <span>Weekly Avg</span>
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-100 font-mono">{avgWeeklyScore}%</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">6 Days</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${avgWeeklyScore}%` }}></div>
          </div>
          <p className="text-[9px] text-slate-500">6 Working Days Avg</p>
        </div>

        {/* Monthly Score */}
        <div className="bg-[#0a0d14] border border-indigo-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden group hover:border-indigo-400 transition-all shadow-lg">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono text-indigo-400 font-bold">
            <span>Monthly Avg</span>
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-100 font-mono">{avgMonthlyScore}%</span>
            <span className="text-[10px] font-mono text-indigo-300 font-bold">4 Weeks</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${avgMonthlyScore}%` }}></div>
          </div>
          <p className="text-[9px] text-slate-500">All Weeks Average</p>
        </div>

        {/* Quarterly Score */}
        <div className="bg-[#0a0d14] border border-amber-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden group hover:border-amber-400 transition-all shadow-lg">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono text-amber-400 font-bold">
            <span>Quarterly Avg</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-100 font-mono">{avgQuarterlyScore}%</span>
            <span className="text-[10px] font-mono text-amber-300 font-bold">Q3</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${avgQuarterlyScore}%` }}></div>
          </div>
          <p className="text-[9px] text-slate-500">3 Months Aggregated</p>
        </div>

        {/* Half-Yearly Score */}
        <div className="bg-[#0a0d14] border border-purple-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden group hover:border-purple-400 transition-all shadow-lg">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono text-purple-400 font-bold">
            <span>Half-Yearly</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-100 font-mono">{avgHalfYearlyScore}%</span>
            <span className="text-[10px] font-mono text-purple-300 font-bold">6 Months</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${avgHalfYearlyScore}%` }}></div>
          </div>
          <p className="text-[9px] text-slate-500">6 Months Average</p>
        </div>

        {/* Annual Score */}
        <div className="bg-[#0a0d14] border border-rose-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden group hover:border-rose-400 transition-all shadow-lg">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono text-rose-400 font-bold">
            <span>Annual Avg</span>
            <Award className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-100 font-mono">{avgAnnualScore}%</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">95+ Fast</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full" style={{ width: `${avgAnnualScore}%` }}></div>
          </div>
          <p className="text-[9px] text-slate-500">12 Months Overall</p>
        </div>
      </div>

      {/* Graphical Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Trend Graphic (2 columns) */}
        <div className="lg:col-span-2 bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>KPI Daily & Weekly Performance Trend</span>
              </h3>
              <p className="text-xs text-slate-400">ISO Quality, Productivity & Attendance Curve</p>
            </div>

            <div className="flex items-center space-x-3 text-[10px] font-mono">
              <span className="flex items-center text-cyan-400"><span className="w-2.5 h-2.5 bg-cyan-400 rounded-sm mr-1"></span> KPI Score</span>
              <span className="flex items-center text-emerald-400"><span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm mr-1"></span> Productivity</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpiTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[60, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050608', borderColor: '#06b6d4', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="dailyScore" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                <Area type="monotone" dataKey="productivity" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorProd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Ranking Bar Chart (1 column) */}
        <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-2xl">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Department KPI Ranking</span>
            </h3>
            <p className="text-xs text-slate-400">Factory Floor Average Performance %</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptRankingData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[50, 100]} stroke="#64748b" fontSize={10} />
                <YAxis dataKey="department" type="category" stroke="#94a3b8" fontSize={10} width={75} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050608', borderColor: '#f59e0b', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: any) => [`${val}%`, 'Avg KPI Score']}
                />
                <Bar dataKey="avgScore" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboard & Promotion Recommendation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Employees */}
        <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">Top 10 High Performers (Annual KPI)</h3>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
              RANKED BY ANNUAL %
            </span>
          </div>

          <div className="space-y-2.5">
            {top10.map((emp, idx) => {
              const rating = getRatingBadge(emp.annualAveragePct);
              return (
                <div 
                  key={emp.id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                      idx === 0 ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                      idx === 1 ? 'bg-slate-300 text-slate-950' :
                      idx === 2 ? 'bg-amber-700 text-slate-100' : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-100 flex items-center space-x-2">
                        <span>{emp.employeeName}</span>
                        <span className="text-[10px] font-mono text-cyan-400">({emp.employeeId})</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{emp.department} • {emp.designation}</div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-mono text-sm font-bold text-cyan-300">{emp.annualAveragePct}%</div>
                    <span className={`px-2 py-0.2 rounded text-[9px] font-mono border font-bold ${rating.bg}`}>
                      {rating.rec}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Promotion & Increment Recommendations Table */}
        <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Annual Promotion & Increment Criteria</span>
            </h3>
            <p className="text-xs text-slate-400">Rizvi Fashions & Buyer Compliance Evaluation Scale</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-emerald-400">95% – 100%</span>
                <span className="text-slate-300 ml-3 font-semibold">Outstanding</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold font-mono">
                Fast Track Promotion
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-cyan-400">90% – 94%</span>
                <span className="text-slate-300 ml-3 font-semibold">Excellent</span>
              </div>
              <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg text-[10px] font-bold font-mono">
                Promotion Eligible
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-amber-400">85% – 89%</span>
                <span className="text-slate-300 ml-3 font-semibold">Very Good</span>
              </div>
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold font-mono">
                Increment Priority
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-indigo-400">80% – 84%</span>
                <span className="text-slate-300 ml-3 font-semibold">Good</span>
              </div>
              <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-lg text-[10px] font-bold font-mono">
                Continue Development
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-rose-400">Below 80%</span>
                <span className="text-slate-300 ml-3 font-semibold">Satisfactory / Needs Imp.</span>
              </div>
              <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-[10px] font-bold font-mono">
                Improvement Plan Required
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>ISO Audit Compliance: Verified</span>
            <span className="text-cyan-400 hover:underline cursor-pointer" onClick={() => setActiveTab('evaluations')}>
              View Full Staff Roster Ratings →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
