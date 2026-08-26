import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KPIModel100, EmployeeEvaluationRecord } from '../types';
import { 
  Award, 
  Calculator, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  TrendingUp, 
  UserCheck, 
  Layers,
  ChevronRight
} from 'lucide-react';

export const EvaluationsView: React.FC = () => {
  const { users, evaluations, saveKPIEvaluation, hasPermission } = useAuth();

  const canManage = hasPermission('evaluations:manage');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(users[0]?.id || 'EMP-1003');

  const activeEmp = users.find((u) => u.id === selectedEmpId) || users[0];
  const existingEval = evaluations.find((e) => e.employeeId === selectedEmpId);

  // Form State for 100 Marks Model
  const [kpiMarks, setKpiMarks] = useState<KPIModel100>(
    existingEval?.kpiMarks || {
      dailyAssignedTasks: 55,
      qualityOfWork: 14,
      productivity: 9,
      attendancePunctuality: 5,
      disciplineCompliance: 5,
      teamworkOwnership: 5,
      additionalTaskBonus: 2,
      processImprovementBonus: 5,
      costSavingBonus: 0,
      customerAppreciationBonus: 0,
      emergencySupportBonus: 0,
    }
  );

  const baseObtained = 
    kpiMarks.dailyAssignedTasks +
    kpiMarks.qualityOfWork +
    kpiMarks.productivity +
    kpiMarks.attendancePunctuality +
    kpiMarks.disciplineCompliance +
    kpiMarks.teamworkOwnership;

  const bonusSum = 
    kpiMarks.additionalTaskBonus +
    kpiMarks.processImprovementBonus +
    kpiMarks.costSavingBonus +
    kpiMarks.customerAppreciationBonus +
    kpiMarks.emergencySupportBonus;

  const dailyPercentage = (baseObtained / 100) * 100;

  const handleSliderChange = (key: keyof KPIModel100, val: number) => {
    setKpiMarks((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveEvaluation = () => {
    saveKPIEvaluation({
      employeeId: activeEmp.id,
      employeeName: activeEmp.name,
      department: activeEmp.department,
      designation: activeEmp.designation || 'Staff Operator',
      supervisor: activeEmp.supervisor || 'SJHERAJI',
      kpiMarks,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 select-none">
      {/* Header Banner */}
      <div className="bg-[#0a0d14] border border-cyan-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Employee Performance Evaluation System (100 Marks KPI Model)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            ISO, Buyer Compliance & Rizvi Fashions enterprise standards. Daily evaluation feeds auto-calculations into Weekly, Monthly, Quarterly, Half-Yearly, and Annual ratings.
          </p>
        </div>

        {/* Employee Selector */}
        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-xs text-slate-400 font-mono">Employee:</span>
          <select
            value={selectedEmpId}
            onChange={(e) => {
              const newId = e.target.value;
              setSelectedEmpId(newId);
              const found = evaluations.find((ev) => ev.employeeId === newId);
              if (found) setKpiMarks(found.kpiMarks);
            }}
            className="bg-slate-900 border border-cyan-700/60 text-xs font-bold text-cyan-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.employeeCardNo || u.id}) – {u.department}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Form Inputs (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>Daily Evaluation Form (Base 100 Marks)</span>
              </h3>
              <p className="text-xs text-slate-400">Active Staff: {activeEmp.name} ({activeEmp.department})</p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-slate-400">Base Score: </span>
              <span className="text-lg font-black font-mono text-cyan-300">{baseObtained} / 100</span>
            </div>
          </div>

          {/* 6 Base Criteria Sliders */}
          <div className="space-y-4">
            {/* Daily Assigned Tasks (60) */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">1. Daily Assigned Tasks (দৈনিক অর্পিত কাজ)</span>
                <span className="font-mono text-cyan-400">{kpiMarks.dailyAssignedTasks} / 60 Marks</span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                value={kpiMarks.dailyAssignedTasks}
                onChange={(e) => handleSliderChange('dailyAssignedTasks', Number(e.target.value))}
                disabled={!canManage}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quality of Work (15) */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">2. Quality of Work (কাজের মান / Defect-Free)</span>
                <span className="font-mono text-emerald-400">{kpiMarks.qualityOfWork} / 15 Marks</span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                value={kpiMarks.qualityOfWork}
                onChange={(e) => handleSliderChange('qualityOfWork', Number(e.target.value))}
                disabled={!canManage}
                className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Productivity (10) */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">3. Productivity (উৎপাদনশীলতা / Line Pace)</span>
                <span className="font-mono text-indigo-400">{kpiMarks.productivity} / 10 Marks</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={kpiMarks.productivity}
                onChange={(e) => handleSliderChange('productivity', Number(e.target.value))}
                disabled={!canManage}
                className="w-full accent-indigo-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Attendance & Punctuality (5) */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">4. Attendance & Punctuality (উপস্থিতি ও সময়ানুবর্তিতা)</span>
                <span className="font-mono text-amber-400">{kpiMarks.attendancePunctuality} / 5 Marks</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                value={kpiMarks.attendancePunctuality}
                onChange={(e) => handleSliderChange('attendancePunctuality', Number(e.target.value))}
                disabled={!canManage}
                className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Discipline & Compliance (5) */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">5. Discipline & Compliance (শৃঙ্খলা ও আইএসও মান)</span>
                <span className="font-mono text-purple-400">{kpiMarks.disciplineCompliance} / 5 Marks</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                value={kpiMarks.disciplineCompliance}
                onChange={(e) => handleSliderChange('disciplineCompliance', Number(e.target.value))}
                disabled={!canManage}
                className="w-full accent-purple-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Teamwork & Ownership (5) */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">6. Teamwork & Ownership (দলগত কাজ)</span>
                <span className="font-mono text-teal-400">{kpiMarks.teamworkOwnership} / 5 Marks</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                value={kpiMarks.teamworkOwnership}
                onChange={(e) => handleSliderChange('teamworkOwnership', Number(e.target.value))}
                disabled={!canManage}
                className="w-full accent-teal-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Extra Achievement Bonus Section */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Extra Achievement Bonus (100-এর বাইরে অতিরিক্ত অবদান)</span>
              </h4>
              <span className="font-mono font-bold text-amber-400 text-xs">Total Bonus: +{bonusSum} Marks</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSliderChange('additionalTaskBonus', kpiMarks.additionalTaskBonus > 0 ? 0 : 2)}
                className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                  kpiMarks.additionalTaskBonus > 0
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                +2 Additional Task
              </button>

              <button
                type="button"
                onClick={() => handleSliderChange('processImprovementBonus', kpiMarks.processImprovementBonus > 0 ? 0 : 5)}
                className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                  kpiMarks.processImprovementBonus > 0
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                +5 Process Improvement
              </button>

              <button
                type="button"
                onClick={() => handleSliderChange('costSavingBonus', kpiMarks.costSavingBonus > 0 ? 0 : 10)}
                className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                  kpiMarks.costSavingBonus > 0
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                +10 Cost Saving
              </button>

              <button
                type="button"
                onClick={() => handleSliderChange('customerAppreciationBonus', kpiMarks.customerAppreciationBonus > 0 ? 0 : 5)}
                className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                  kpiMarks.customerAppreciationBonus > 0
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                +5 Customer Appreciation
              </button>

              <button
                type="button"
                onClick={() => handleSliderChange('emergencySupportBonus', kpiMarks.emergencySupportBonus > 0 ? 0 : 5)}
                className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                  kpiMarks.emergencySupportBonus > 0
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                +5 Emergency Support
              </button>
            </div>
          </div>

          {canManage && (
            <div className="pt-3 border-t border-slate-800 text-right">
              <button
                onClick={handleSaveEvaluation}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center space-x-2 ml-auto"
              >
                <Save className="w-4 h-4" />
                <span>মূল্যায়ন আপডেট ও সংরক্ষণ করুন (Save Evaluation)</span>
              </button>
            </div>
          )}
        </div>

        {/* Dashboard Hierarchy & Annual Rating Cards (1 Col) */}
        <div className="space-y-6">
          {/* Real-Time Formula Engine Summary */}
          <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Dashboard Formula Hierarchy</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-cyan-400">Daily Score %</span>
                <div className="text-base font-bold font-mono text-slate-100">
                  {dailyPercentage}% <span className="text-amber-400 text-xs">(+{bonusSum} Bonus)</span>
                </div>
              </div>

              <div className="flex items-center justify-center text-slate-600">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-emerald-400">Weekly Average %</span>
                <div className="text-base font-bold font-mono text-slate-100">
                  {existingEval?.weeklyAveragePct || dailyPercentage}%
                </div>
              </div>

              <div className="flex items-center justify-center text-slate-600">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-indigo-400">Monthly Average %</span>
                <div className="text-base font-bold font-mono text-slate-100">
                  {existingEval?.monthlyAveragePct || dailyPercentage}%
                </div>
              </div>

              <div className="flex items-center justify-center text-slate-600">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-purple-400">Annual Final Rating</span>
                <div className="text-base font-bold font-mono text-cyan-300">
                  {existingEval?.finalRating || 'Excellent'} ({existingEval?.annualAveragePct || dailyPercentage}%)
                </div>
                <div className="text-[10px] text-emerald-400 font-bold font-mono">
                  Syllabus Recommendation: {existingEval?.recommendation || 'Promotion Eligible'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
