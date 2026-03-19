import React, { useState } from "react";
import { 
  FaTachometerAlt, FaCalendarCheck, FaUsers, FaClock, 
  FaSignOutAlt, FaHospitalUser, FaChevronLeft, FaBars,
  FaBell, FaPlus, FaTrash, FaCheckCircle, 
  FaVideo, FaUserFriends, FaCalendarAlt
} from "react-icons/fa";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from "recharts";

// --- DUMMY DATA ---
const chartData = [
  { name: "Mon", appointments: 15 }, { name: "Tue", appointments: 25 },
  { name: "Wed", appointments: 20 }, { name: "Thu", appointments: 35 },
  { name: "Fri", appointments: 30 }, { name: "Sat", appointments: 45 },
];

const DoctorDashboard = () => {
  const [view, setView] = useState("dashboard"); 
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const rawName = localStorage.getItem("userName") || "Smith";
  const doctorName = rawName.startsWith("Dr.") ? rawName : `Dr. ${rawName}`;

  const [slots, setSlots] = useState([]);
  const [formInput, setFormInput] = useState({
    startTime: "09:00", endTime: "10:00",
    maxPatients: "5", fee: "100", mode: "In-Person"
  });

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormInput({ ...formInput, [e.target.name]: e.target.value });
  };

  const saveScheduleToDB = async () => {
    if (slots.length === 0) return alert("Please add at least one slot.");
    
    const docId = localStorage.getItem("doctorProfileId") || localStorage.getItem("userId");

    if (!docId || docId === "null" || docId === "undefined") {
        return alert("❌ Error: Doctor ID not found. Please log out and log in again.");
    }

    try {
      const response = await fetch("http://localhost:5000/api/schedule/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: docId, 
          date: selectedDate,
          slots: slots.map(s => ({
            time: s.time, mode: s.mode,
            maxPatients: s.max, fee: s.fee, status: "Active"
          }))
        }),
      });

      if (response.ok) {
        alert("✅ Schedule saved successfully!");
      } else {
        alert("❌ Failed to save schedule.");
      }
    } catch (err) {
      alert("Server error.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const addSlotToList = () => {
    const newSlot = {
      id: Date.now(),
      time: `${formInput.startTime} - ${formInput.endTime}`,
      mode: formInput.mode, max: formInput.maxPatients,
      fee: `$${formInput.fee}`, status: "Active"
    };
    setSlots([...slots, newSlot]);
  };

  const deleteSlot = (id) => setSlots(slots.filter(slot => slot.id !== id));

  // --- SUB-COMPONENTS ---
  const DashboardHome = () => (
    <div className="animate-fadeIn space-y-8">
      <div className="text-left">
        <h2 className="text-2xl font-black text-slate-800">General Overview</h2>
        <p className="text-slate-400 text-sm">Welcome back, {doctorName}!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[{ label: "PENDING APPOINTMENTS", value: "12" }, { label: "COMPLETED VISITS", value: "45" }, { label: "TODAY'S APPOINTMENTS", value: "5" }].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col justify-center">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-4xl font-black mt-2 text-slate-800">{stat.value}</h3>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
          <h3 className="text-lg font-black text-slate-800 mb-6 text-left">Today's Schedule</h3>
          <table className="w-full text-left font-bold text-sm text-slate-700">
            <thead>
              <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-50"><th className="pb-4">Time</th><th className="pb-4">Patient</th><th className="pb-4">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr><td className="py-4">09:00 AM</td><td className="py-4 text-blue-600">John Doe</td><td className="py-4"><span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-[10px]">PENDING</span></td></tr>
              <tr><td className="py-4">10:30 AM</td><td className="py-4 text-blue-600">Jane Smith</td><td className="py-4"><span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px]">COMPLETED</span></td></tr>
            </tbody>
          </table>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
          <h3 className="text-lg font-black text-slate-800 mb-6 text-left">Appointments Per Month</h3>
          <div className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#f8fafc' }} /><Bar dataKey="appointments" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={35} /></BarChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );

  const ScheduleManager = () => (
    <div className="animate-fadeIn space-y-6 pb-10 text-left">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Manage Schedule</h2><p className="text-slate-400 text-sm">Set availability for upcoming appointments</p></div>
        <button onClick={saveScheduleToDB} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center gap-2"><FaCheckCircle /> Save Schedule</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
          <h3 className="text-sm font-black text-slate-800 mb-4 uppercase flex items-center gap-2"><FaCalendarAlt className="text-blue-600" /> Select Date</h3>
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => setSelectedDate("2026-03-24")} className={`p-4 rounded-2xl text-xs font-black uppercase transition-all border ${selectedDate === "2026-03-24" ? "bg-blue-600 text-white" : "bg-gray-50"}`}>March 24</button>
            <input type="date" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Start</label><input type="time" name="startTime" value={formInput.startTime} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">End</label><input type="time" name="endTime" value={formInput.endTime} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Max</label><input type="number" name="maxPatients" value={formInput.maxPatients} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Mode</label><div className="flex gap-2">{["In-Person", "Video", "Both"].map(m => (<button key={m} onClick={() => setFormInput({...formInput, mode: m})} className={`flex-1 py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${formInput.mode === m ? "bg-blue-600 text-white" : "bg-white"}`}>{m}</button>))}</div></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Fee</label><input type="number" name="fee" value={formInput.fee} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3" /></div>
            </div>
            <button onClick={addSlotToList} className="w-full mt-8 py-4 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition flex items-center justify-center gap-2"><FaPlus /> Add Time Slot</button>
          </div>
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white"><h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Schedule Preview: {selectedDate}</h3>{slots.length > 0 && <button onClick={() => setSlots([])} className="text-red-500 text-[10px] font-black uppercase flex items-center gap-1 hover:underline"><FaTrash /> Clear All</button>}</div>
            <div className="overflow-x-auto p-4">{slots.length === 0 ? <div className="p-10 text-center text-slate-300 font-bold italic">No slots added yet.</div> : (
              <table className="w-full text-left">
                <thead><tr className="bg-slate-50 text-gray-400 text-[10px] font-black uppercase tracking-widest"><th className="px-6 py-4">Time Slot</th><th className="px-6 py-4">Mode</th><th className="px-6 py-4">Max Patients</th><th className="px-6 py-4">Fee</th><th className="px-6 py-4 text-center">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {slots.map((slot) => (<tr key={slot.id} className="hover:bg-blue-50/30 transition-colors"><td className="px-6 py-4 text-sm font-bold text-slate-700">{slot.time}</td><td className="px-6 py-4"><span className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit uppercase">{slot.mode === "Video" ? <FaVideo /> : <FaUserFriends />} {slot.mode}</span></td><td className="px-6 py-4 text-sm font-medium text-slate-500">{slot.max} Patients</td><td className="px-6 py-4 text-sm font-black text-slate-800">{slot.fee}</td><td className="px-6 py-4 text-center"><button onClick={() => deleteSlot(slot.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><FaTrash size={14} /></button></td></tr>))}
                </tbody>
              </table>
            )}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-left">
      <div className={`${isCollapsed ? "w-20" : "w-64"} bg-gradient-to-b from-blue-700 to-blue-900 text-white min-h-screen shadow-2xl transition-all duration-300 flex flex-col z-50 shrink-0`}>
        <div className={`h-20 px-6 border-b border-blue-600/50 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && <h2 className="text-xl font-bold flex items-center space-x-3 italic"><FaHospitalUser /><span>MediConnect</span></h2>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">{isCollapsed ? <FaBars size={20} /> : <FaChevronLeft size={20} />}</button>
        </div>
        <nav className="mt-8 px-3 space-y-2 flex-1">
          {[{ icon: FaTachometerAlt, label: "Dashboard", id: "dashboard" }, { icon: FaCalendarCheck, label: "Appointments", id: "appointments" }, { icon: FaUsers, label: "Patients", id: "patients" }, { icon: FaClock, label: "Schedule", id: "schedule" }].map((item) => (
            <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-4"} px-4 py-3 rounded-2xl transition-all duration-200 ${view === item.id ? "bg-white/20 shadow-inner text-white" : "text-blue-100 hover:bg-white/10"}`}>
              <item.icon size={18} />{!isCollapsed && <span className="text-sm font-bold">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-8">
          <button onClick={handleLogout} className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-4"} px-4 py-3 rounded-2xl hover:bg-red-500/20 text-red-100 transition-all`}>
            <FaSignOutAlt size={18} />{!isCollapsed && <span className="text-sm font-bold">Logout</span>}
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden h-screen">
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-10 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{view === "dashboard" ? "Dashboard" : view === "schedule" ? "Schedule" : view.toUpperCase()}</h2>
          <div className="flex items-center space-x-6">
            <div className="relative p-2 rounded-full hover:bg-gray-50 transition cursor-pointer"><FaBell className="text-gray-400 text-xl" /><span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span></div>
            <div className="flex items-center space-x-3 border-l pl-6 border-gray-100 text-right">
               <div><p className="text-sm font-bold text-gray-800 leading-none">{doctorName}</p><p className="text-[10px] text-blue-600 mt-1 uppercase font-bold tracking-tighter">Hospital Staff</p></div>
               <img src={`https://ui-avatars.com/api/?name=${doctorName}&background=2563eb&color=fff`} alt="profile" className="w-10 h-10 rounded-full border-2 border-blue-100" />
            </div>
          </div>
        </header>
        <main className="p-10 overflow-y-auto bg-[#F8FAFC] flex-1 custom-scrollbar">
          {view === "dashboard" ? <DashboardHome /> : view === "schedule" ? <ScheduleManager /> : <div className="text-center p-20 text-slate-400 font-bold">Content for {view} is coming soon.</div>}
        </main>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }` }} />
    </div>
  );
};

export default DoctorDashboard;