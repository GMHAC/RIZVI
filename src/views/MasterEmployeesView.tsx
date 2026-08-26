import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, RoleId } from '../types';
import { 
  Users, 
  Upload, 
  Plus, 
  Trash2, 
  Key, 
  Download, 
  Search, 
  X, 
  CheckCircle2, 
  UserPlus,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';
import Papa from 'papaparse';

export const MasterEmployeesView: React.FC = () => {
  const { 
    users, 
    importMasterEmployees, 
    deleteEmployee, 
    createNewUser, 
    updateUserRole, 
    addToast,
    hasPermission 
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(false);

  // New Employee Form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCardNo, setNewCardNo] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDept, setNewDept] = useState('Sewing Floor A');
  const [newDesignation, setNewDesignation] = useState('Machine Operator');
  const [newRoleId, setNewRoleId] = useState<RoleId>('employee');

  const canImport = hasPermission('employees:import');

  const filteredUsers = users.filter((u) => {
    const searchMatch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.employeeCardNo && u.employeeCardNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());

    const deptMatch = filterDepartment === 'all' || u.department === filterDepartment;

    return searchMatch && deptMatch;
  });

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed: Partial<User>[] = results.data.map((row: any, idx) => ({
          employeeCardNo: row['Employee ID'] || row['EmployeeID'] || row['CardNo'] || row['id'] || `EMP-${2000 + idx}`,
          name: row['Name'] || row['Employee Name'] || row['name'] || 'Imported Staff',
          email: row['Email'] || row['email'] || `emp${2000 + idx}@rizvifashions.com`,
          department: row['Department'] || row['department'] || 'General Floor',
          designation: row['Designation'] || row['designation'] || 'Operator',
          supervisor: row['Supervisor'] || row['supervisor'] || 'SJHERAJI',
          phone: row['Phone'] || row['Mobile'] || row['phone'] || `0170000${idx}`,
          roleId: (row['Role'] === 'Admin' ? 'admin' : row['Role'] === 'Supervisor' ? 'manager' : 'employee') as RoleId,
        }));

        importMasterEmployees(parsed, replaceExisting);
        setShowImportModal(false);
      },
      error: () => {
        addToast('File Error', 'Could not parse employee CSV file.', 'error');
      }
    });
  };

  const downloadSampleEmployeeCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Employee ID,Name,Department,Designation,Supervisor,Phone,Email,Role\n" +
      "EMP-1010,Sumi Akter,Sewing Floor B,Senior Operator,Rafiqul Islam,01711223344,sumi.sewing@rizvifashions.com,Employee\n" +
      "EMP-1011,Kamal Hossain,Cutting Section,Cutting Assistant,Rafiqul Islam,01822334455,kamal.cutting@rizvifashions.com,Employee\n" +
      "EMP-1012,Mahmudul Hasan,Quality Control,Senior QC Inspector,Abdur Rahman,01933445566,mahmud.qc@rizvifashions.com,Supervisor";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "master_employee_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    createNewUser({
      name: newName,
      email: newEmail || `${newCardNo.toLowerCase() || 'emp'}@rizvifashions.com`,
      employeeCardNo: newCardNo || `EMP-${Date.now().toString().slice(-4)}`,
      phone: newPhone || '01700000000',
      department: newDept,
      designation: newDesignation,
      roleId: newRoleId,
    });

    setNewName('');
    setNewEmail('');
    setNewCardNo('');
    setNewPhone('');
    setShowAddUserModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 select-none">
      {/* Header */}
      <div className="bg-[#0a0d14] border border-cyan-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Master Employees Roster & Import Gateway
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Master list containing all employees with auto-generated ID credentials. CSV/Excel imports handle deduplication automatically.
          </p>
        </div>

        {canImport && (
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-700/60 font-bold text-xs rounded-xl transition-all flex items-center space-x-2"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>ইমপোর্ট মাস্টার ইমপ্লয়ি (CSV/Excel Import)</span>
            </button>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>নতুন কর্মী যুক্ত করুন</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="নাম, আইডি কার্ড বা মোবাইল নাম্বার লিখুন..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-slate-400">Department:</span>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Departments ({users.length})</option>
            <option value="Management & Compliance">Management & Compliance</option>
            <option value="Cutting Section">Cutting Section</option>
            <option value="Sewing Floor A">Sewing Floor A</option>
            <option value="Buyer Quality Assurance">Buyer Quality Assurance</option>
            <option value="HR & ISO Compliance">HR & ISO Compliance</option>
            <option value="Maintenance & Utility">Maintenance & Utility</option>
          </select>
        </div>
      </div>

      {/* Employee Roster Table */}
      <div className="bg-[#0a0d14] border border-cyan-900/30 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="px-4 py-3">Employee Name & ID</th>
                <th className="px-4 py-3">Department & Designation</th>
                <th className="px-4 py-3">Mobile & Credentials</th>
                <th className="px-4 py-3">RBAC Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatarUrl}
                        alt={u.name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                      />
                      <div>
                        <div className="font-bold text-slate-100">{u.name}</div>
                        <div className="font-mono text-[10px] text-cyan-400">{u.employeeCardNo || u.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-slate-200 font-medium">{u.department}</div>
                    <div className="text-[10px] text-slate-400">{u.designation || 'Staff Operator'}</div>
                  </td>

                  <td className="px-4 py-3 font-mono text-[11px]">
                    <div className="text-slate-300">{u.phone || '01700000000'}</div>
                    <div className="text-[10px] text-slate-500">{u.email}</div>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono border font-bold ${
                      u.roleId === 'admin' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                      u.roleId === 'manager' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {u.roleId === 'admin' ? 'Admin (Full)' : u.roleId === 'manager' ? 'Supervisor' : 'Employee'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {canImport && u.roleId !== 'admin' && (
                      <button
                        onClick={() => deleteEmployee(u.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0d14] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span>মাস্টার ইমপ্লয়ি ফাইল ইমপোর্ট (CSV / Excel Import)</span>
              </h3>
              <p className="text-xs text-slate-400">
                সকল ইমপ্লয় এর নাম সহ মাস্টার ইমপ্লয়ি লিষ্ট ইমপোর্ট করার পর আগের কোন ডাবল নাম বা ডেটা থাকলে তা অটোমেটিক আপডেট বা ফিল্টার হয়ে যাবে।
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="flex items-center space-x-2.5 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>আগের সফটওয়্যার থাকা অবিকল তালিকা মুছে দিয়ে সম্পূর্ণ নতুন কাস্টম মাস্টার ফাইল সেট করুন</span>
                </label>
              </div>

              <div className="border-2 border-dashed border-cyan-800/60 hover:border-cyan-400 rounded-2xl p-6 text-center space-y-3 bg-slate-950/50 transition-colors">
                <FileSpreadsheet className="w-10 h-10 text-cyan-400 mx-auto" />
                <p className="font-bold text-slate-200">CSV/Excel ফাইল ড্রপ বা ব্রাউজ করুন</p>

                <input
                  type="file"
                  onChange={handleCsvFileChange}
                  accept=".csv"
                  className="hidden"
                  id="employee-csv-input"
                />
                <label
                  htmlFor="employee-csv-input"
                  className="inline-block px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  মাস্টার ফাইল আপলোড করুন (Select CSV)
                </label>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={downloadSampleEmployeeCsv}
                  className="text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>স্যাম্পল মাস্টার CSV ফাইল ডাউনলোড</span>
                </button>

                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-200 font-bold rounded-xl"
                >
                  বাতিল (Cancel)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0d14] border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              <span>নতুন কর্মী রেজিস্টার করুন</span>
            </h3>

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">কর্মী নাম (Employee Name)</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="যেমন: সুমি আক্তার"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">আইডি কার্ড নাম্বার (Office ID Card No)</label>
                <input
                  type="text"
                  value={newCardNo}
                  onChange={(e) => setNewCardNo(e.target.value)}
                  placeholder="EMP-1015"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">মোবাইল নাম্বার (Mobile Phone)</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="01711000000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ডিপার্টমেন্ট (Department)</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Cutting Section">Cutting Section</option>
                  <option value="Sewing Floor A">Sewing Floor A</option>
                  <option value="Sewing Floor B">Sewing Floor B</option>
                  <option value="Buyer Quality Assurance">Buyer Quality Assurance</option>
                  <option value="HR & ISO Compliance">HR & ISO Compliance</option>
                  <option value="Maintenance & Utility">Maintenance & Utility</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">RBAC রোল (Role)</label>
                <select
                  value={newRoleId}
                  onChange={(e) => setNewRoleId(e.target.value as RoleId)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="employee">Employee / Staff (Viewer)</option>
                  <option value="manager">Supervisor / Manager (Editor)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  তৈরি করুন (Create Account)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
