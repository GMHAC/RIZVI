import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Battery, 
  Clock, 
  ShieldAlert, 
  Radio, 
  Smartphone, 
  Building2,
  RefreshCw
} from 'lucide-react';

export const LocationTrackerView: React.FC = () => {
  const { locations, users } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(locations[0]?.employeeId || 'EMP-1001');

  const selectedLoc = locations.find((l) => l.employeeId === selectedEmpId) || locations[0];

  const filteredLocations = locations.filter((l) => {
    return (
      l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.employeeCardNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      l.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 select-none">
      {/* Header Banner */}
      <div className="bg-[#0a0d14] border border-cyan-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-slate-100">
              লাইভ লোকেশন ট্র্যাকিং সিস্টেম (Live GPS & Geofence Monitor)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            মোবাইল নাম্বার অথবা আইডি কার্ড নাম্বার দিয়ে সকল ইমপ্লয়ির একচুয়াল অবস্থান ট্র্যাকিং করুন।
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300 shrink-0">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Active Satellite Telemetry: Live</span>
        </div>
      </div>

      {/* Grid: Map Radar Visualizer (Left 2 Cols) & Employee Roster (Right 1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Map Visualizer */}
        <div className="lg:col-span-2 bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>Active Target Position: {selectedLoc?.employeeName}</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Card ID: {selectedLoc?.employeeCardNo} | Phone: {selectedLoc?.phone}
              </p>
            </div>

            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
              selectedLoc?.status === 'On Floor' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
              selectedLoc?.status === 'In Transit' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
              'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {selectedLoc?.status}
            </span>
          </div>

          {/* Interactive Radar Visualizer */}
          <div className="h-80 w-full bg-slate-950 rounded-2xl border border-cyan-900/40 relative flex items-center justify-center overflow-hidden shadow-inner">
            {/* Radar Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30"></div>
            <div className="w-64 h-64 border border-cyan-500/20 rounded-full absolute"></div>
            <div className="w-40 h-40 border border-cyan-500/30 rounded-full absolute"></div>
            <div className="w-16 h-16 border border-cyan-500/40 rounded-full absolute"></div>

            {/* Target Ping Point */}
            <div className="z-10 text-center space-y-2">
              <div className="relative inline-block">
                <span className="w-6 h-6 bg-cyan-400/30 rounded-full absolute -top-1 -left-1 animate-ping"></span>
                <div className="w-4 h-4 bg-cyan-400 rounded-full border-2 border-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.8)] mx-auto"></div>
              </div>

              <div className="bg-[#050608]/90 border border-cyan-500/50 rounded-xl p-3 max-w-xs mx-auto shadow-2xl backdrop-blur-md space-y-1">
                <div className="text-xs font-bold text-slate-100">{selectedLoc?.address}</div>
                <div className="text-[10px] font-mono text-cyan-400">
                  GPS: {selectedLoc?.latitude.toFixed(5)}° N, {selectedLoc?.longitude.toFixed(5)}° E
                </div>
              </div>
            </div>
          </div>

          {/* Device Telemetry Stats */}
          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase">Last Ping</span>
              <div className="text-slate-200 font-bold">{selectedLoc?.lastPing}</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase">Battery Level</span>
              <div className="text-emerald-400 font-bold flex items-center space-x-1">
                <Battery className="w-3.5 h-3.5" />
                <span>{selectedLoc?.batteryLevel}%</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase">Geofence Perimeter</span>
              <div className="text-cyan-400 font-bold">Gazipur Industrial Zone</div>
            </div>
          </div>
        </div>

        {/* Employee Search & Roster */}
        <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-100">লাইভ ট্র্যাকিং লিস্ট</h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="আইডি, নাম বা মোবাইল নাম্বার..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredLocations.map((loc) => {
              const isSelected = loc.employeeId === selectedEmpId;

              return (
                <div
                  key={loc.employeeId}
                  onClick={() => setSelectedEmpId(loc.employeeId)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500/50 text-slate-100 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{loc.employeeName}</span>
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">{loc.employeeCardNo}</span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    Phone: {loc.phone} • {loc.department}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-slate-800/60">
                    <span className="text-slate-500 truncate max-w-[140px]">{loc.address}</span>
                    <span className="text-emerald-400 font-bold">{loc.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
