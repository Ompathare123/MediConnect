import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  FaTachometerAlt, FaCalendarCheck, FaUsers, FaClock, 
  FaSignOutAlt, FaHospitalUser, FaChevronLeft, FaBars,
  FaBell, FaPlus, FaTrash, FaCheckCircle, 
  FaVideo, FaUserFriends, FaCalendarAlt, FaTimesCircle,
  FaInfoCircle, FaFileMedical, FaTimes, FaUserAlt, FaSearch, FaChartLine
} from "react-icons/fa";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from "recharts";

const DoctorDashboard = () => {
  const [view, setView] = useState("dashboard"); 
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedApt, setSelectedApt] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [activeTab, setActiveTab] = useState("Pending"); 
  const [chartFilter, setChartFilter] = useState("Weekly"); // State for Chart Filter
  
  const rawName = localStorage.getItem("userName") || "Smith";
  const doctorName = rawName.startsWith("Dr.") ? rawName : `Dr. ${rawName}`;
  const doctorProfileId = localStorage.getItem("doctorProfileId");

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ pending: 0, completed: 0, today: 0 });

  const [slots, setSlots] = useState([]);
  const [formInput, setFormInput] = useState({
    startTime: "09:00", endTime: "10:00",
    maxPatients: "5", fee: "100", mode: "In-Person"
  });

  useEffect(() => {
    fetchDoctorAppointments();
    // eslint-disable-next-line
  }, []);

  const fetchDoctorAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allApts = res.data;
      const todayStr = new Date().toISOString().split('T')[0];
      const myApts = allApts.filter(a => a.doctorId === doctorProfileId);

      const pending = myApts.filter(a => a.status === "Pending" || a.status === "Confirmed").length;
      const completed = myApts.filter(a => a.status === "Completed").length;
      const todayCount = myApts.filter(a => a.appointmentDate === todayStr).length;

      setAppointments(myApts);
      setStats({ pending, completed, today: todayCount });
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
  };

  // --- ADVANCED DYNAMIC CHART LOGIC ---
  const dynamicChartData = useMemo(() => {
    const today = new Date();

    if (chartFilter === "Weekly") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      appointments.forEach(apt => {
        const date = new Date(apt.appointmentDate);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (counts[dayName] !== undefined) counts[dayName]++;
      });
      return days.map(day => ({ name: day, appointments: counts[day] }));
    }

    if (chartFilter === "Monthly") {
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const monthData = Array.from({ length: daysInMonth }, (_, i) => ({ name: `${i + 1}`, appointments: 0 }));
      appointments.forEach(apt => {
        const date = new Date(apt.appointmentDate);
        if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
          monthData[date.getDate() - 1].appointments++;
        }
      });
      return monthData;
    }

    if (chartFilter === "Yearly") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const yearData = months.map(m => ({ name: m, appointments: 0 }));
      appointments.forEach(apt => {
        const date = new Date(apt.appointmentDate);
        if (date.getFullYear() === today.getFullYear()) {
          yearData[date.getMonth()].appointments++;
        }
      });
      return yearData;
    }

    return [];
  }, [appointments, chartFilter]);

  const navigateToAppointments = (tabName) => {
    setActiveTab(tabName);
    setView("appointments");
  };

  const handleUpdateStatus = async (appointmentId, newStatus, e) => {
    if(e) e.stopPropagation(); 
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDoctorAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleInputChange = (e) => {
    setFormInput({ ...formInput, [e.target.name]: e.target.value });
  };

  const saveScheduleToDB = async () => {
    if (slots.length === 0) return alert("Please add at least one slot.");
    if (!doctorProfileId) return alert("❌ Error: Doctor Profile ID not found.");
    try {
      const response = await fetch("http://localhost:5000/api/schedule/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctorProfileId, 
          date: selectedDate,
          slots: slots.map(s => ({
            time: s.time, mode: s.mode,
            maxPatients: s.max, fee: s.fee, status: "Active"
          }))
        }),
      });
      if (response.ok) alert("✅ Schedule saved successfully!");
      else alert("❌ Failed to save schedule.");
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
    <div className="animate-fadeIn space-y-8 text-left">
      <div className="text-left">
        <h2 className="text-2xl font-black text-slate-800">General Overview</h2>
        <p className="text-slate-400 text-sm">Welcome back, {doctorName}!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div 
          onClick={() => navigateToAppointments("Pending")}
          className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col justify-center cursor-pointer hover:border-blue-200 hover:shadow-md transition-all group"
        >
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest group-hover:text-blue-500 transition-colors">PENDING APPOINTMENTS</p>
          <h3 className="text-4xl font-black mt-2 text-slate-800">{stats.pending}</h3>
        </div>

        <div 
          onClick={() => navigateToAppointments("Completed")}
          className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col justify-center cursor-pointer hover:border-green-200 hover:shadow-md transition-all group"
        >
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest group-hover:text-green-500 transition-colors">COMPLETED VISITS</p>
          <h3 className="text-4xl font-black mt-2 text-slate-800">{stats.completed}</h3>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col justify-center">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">TODAY'S APPOINTMENTS</p>
          <h3 className="text-4xl font-black mt-2 text-slate-800">{stats.today}</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
          <h3 className="text-lg font-black text-slate-800 mb-6 text-left">Today's Schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-bold text-sm text-slate-700">
                <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-50">
                    <th className="pb-4">Time</th>
                    <th className="pb-4">Patient Details</th>
                    <th className="pb-4">Status</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {appointments.filter(a => a.appointmentDate === new Date().toISOString().split('T')[0]).length === 0 ? (
                    <tr><td colSpan="3" className="py-10 text-center text-slate-400 italic font-bold">No appointments for today.</td></tr>
                ) : (
                    appointments
                        .filter(a => a.appointmentDate === new Date().toISOString().split('T')[0])
                        .map((apt) => (
                        <tr key={apt._id}>
                            <td className="py-4">{apt.timeSlot}</td>
                            <td className="py-4">
                                <p className="text-blue-600 font-black">{apt.patientName || "User"}</p>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">Age: {apt.age} • Blood: {apt.bloodGroup}</p>
                            </td>
                            <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                              apt.status === "Pending" ? "bg-yellow-50 text-yellow-600" : 
                              apt.status === "Confirmed" ? "bg-blue-50 text-blue-600" : 
                              apt.status === "Completed" ? "bg-green-50 text-green-600" : 
                              "bg-red-50 text-red-600"
                            }`}>
                                {apt.status.toUpperCase()}
                            </span>
                            </td>
                        </tr>
                        ))
                )}
                </tbody>
            </table>
          </div>
        </div>
        
        {/* UPDATED CHART SECTION WITH FILTERS */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800 text-left">Patient Flow</h3>
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                {["Weekly", "Monthly", "Yearly"].map(f => (
                    <button 
                        key={f}
                        onClick={() => setChartFilter(f)}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${chartFilter === f ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} fontSize={10} fontWeight="bold" />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}} />
                <Bar dataKey="appointments" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={chartFilter === "Monthly" ? 10 : 35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const AppointmentManager = () => {
    const filteredApts = appointments.filter(apt => {
        if (activeTab === "Pending") return apt.status === "Pending" || apt.status === "Confirmed";
        if (activeTab === "Completed") return apt.status === "Completed";
        if (activeTab === "Cancelled") return apt.status === "Cancelled";
        return true;
    });

    return (
      <div className="animate-fadeIn space-y-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Manage Appointments</h2>
            <p className="text-slate-400 text-sm">Review and update status of patient requests</p>
          </div>
          
          <div className="bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-gray-100 flex gap-1">
            {["Pending", "Completed", "Cancelled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Patient Details</th>
                  <th className="px-8 py-5">Schedule</th>
                  <th className="px-8 py-5">Current Status</th>
                  <th className="px-8 py-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-left">
                {filteredApts.length === 0 ? (
                  <tr><td colSpan="4" className="py-20 text-center text-slate-300 font-bold italic">No records found.</td></tr>
                ) : (
                  filteredApts.map((apt) => (
                    <tr 
                      key={apt._id} 
                      onClick={() => setSelectedApt(apt)}
                      className="hover:bg-blue-50/20 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-800">{apt.patientName || "User"}</p>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">Blood: {apt.bloodGroup} • Age: {apt.age}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-700">{apt.appointmentDate}</p>
                        <p className="text-[11px] text-blue-600 font-black tracking-widest uppercase">{apt.timeSlot}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          apt.status === "Pending" ? "bg-yellow-50 text-yellow-600" : 
                          apt.status === "Confirmed" ? "bg-blue-50 text-blue-600" : 
                          apt.status === "Completed" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center items-center gap-2">
                          {activeTab === "Pending" && (
                            <>
                              {apt.status === "Pending" && (
                                <button onClick={(e) => handleUpdateStatus(apt._id, "Confirmed", e)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"><FaCheckCircle size={14} /></button>
                              )}
                              {apt.status === "Confirmed" && (
                                <button onClick={(e) => handleUpdateStatus(apt._id, "Completed", e)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"><FaCheckCircle size={14} /></button>
                              )}
                              <button onClick={(e) => handleUpdateStatus(apt._id, "Cancelled", e)} className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"><FaTimesCircle size={14} /></button>
                            </>
                          )}
                          {activeTab !== "Pending" && <span className="text-[10px] text-slate-300 font-black uppercase italic">Archived</span>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const PatientList = () => {
    const uniquePatients = Array.from(new Set(appointments.map(a => a.user)))
      .map(userId => {
        const patientApts = appointments.filter(a => a.user === userId);
        const lastApt = patientApts[0]; 
        return {
          id: userId, name: lastApt.patientName || "User", age: lastApt.age, bloodGroup: lastApt.bloodGroup,
          totalVisits: patientApts.length, lastVisit: lastApt.appointmentDate
        };
      });

    const filteredPatients = uniquePatients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.age.toString().includes(searchTerm)
    );

    return (
      <div className="animate-fadeIn space-y-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div><h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Your Patients</h2><p className="text-slate-400 text-sm">List of unique patients treated</p></div>
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600"><FaSearch size={14} /></div>
            <input type="text" placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-gray-400 text-[10px] font-black uppercase tracking-widest"><th className="px-8 py-5">Patient Name</th><th className="px-8 py-5 text-center">Age / Blood</th><th className="px-8 py-5 text-center">Total Visits</th><th className="px-8 py-5 text-right">Last Visit</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPatients.map((p, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-8 py-6"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><FaUserAlt size={14} /></div><p className="font-black text-slate-800">{p.name}</p></div></td>
                    <td className="px-8 py-6 text-center text-sm font-bold text-slate-600">{p.age} Yrs • {p.bloodGroup}</td>
                    <td className="px-8 py-6 text-center"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black">{p.totalVisits} VISITS</span></td>
                    <td className="px-8 py-6 text-right text-sm font-bold text-slate-500">{p.lastVisit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ScheduleManager = () => (
    <div className="animate-fadeIn space-y-6 pb-10 text-left">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Manage Schedule</h2><p className="text-slate-400 text-sm">Set availability for upcoming appointments</p></div>
        <button onClick={saveScheduleToDB} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center gap-2"><FaCheckCircle /> Save Schedule</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
          <h3 className="text-sm font-black text-slate-800 mb-4 uppercase flex items-center gap-2"><FaCalendarAlt className="text-blue-600" /> Select Date</h3>
          <input type="date" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
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
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white"><h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Schedule Preview: {selectedDate}</h3>{slots.length > 0 && <button onClick={() => setSlots([])} className="text-red-500 text-[10px] font-black uppercase flex items-center gap-1"><FaTrash /> Clear All</button>}</div>
            <div className="p-4">{slots.length === 0 ? <div className="p-10 text-center text-slate-300 font-bold italic">No slots added.</div> : (
              <table className="w-full text-left">
                <thead><tr className="bg-slate-50 text-gray-400 text-[10px] font-black uppercase tracking-widest"><th className="px-6 py-4">Time Slot</th><th className="px-6 py-4">Mode</th><th className="px-6 py-4">Max Patients</th><th className="px-6 py-4">Fee</th><th className="px-6 py-4 text-center">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-50">{slots.map((slot) => (<tr key={slot.id} className="hover:bg-blue-50/30 transition-colors"><td className="px-6 py-4 text-sm font-bold text-slate-700">{slot.time}</td><td className="px-6 py-4"><span className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit uppercase">{slot.mode}</span></td><td className="px-6 py-4 text-sm font-medium text-slate-500">{slot.max} Patients</td><td className="px-6 py-4 text-sm font-black text-slate-800">{slot.fee}</td><td className="px-6 py-4 text-center"><button onClick={() => deleteSlot(slot.id)} className="p-2 text-slate-400 hover:text-red-500"><FaTrash size={14} /></button></td></tr>))}</tbody>
              </table>
            )}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-left relative">
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
          <button onClick={handleLogout} className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-4"} px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-100 transition-all`}><FaSignOutAlt size={18} />{!isCollapsed && <span className="text-sm font-bold">Logout</span>}</button>
        </div>
      </div>
      <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden h-screen text-left">
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-10 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
            {view === "dashboard" ? "Doctor Dashboard" : view === "appointments" ? "Appointments Manager" : view === "patients" ? "Patient List" : view === "schedule" ? "Schedule" : view.toUpperCase()}
          </h2>
          <div className="flex items-center space-x-6">
            <div className="relative p-2 rounded-full hover:bg-gray-50 transition pointer cursor-pointer"><FaBell className="text-gray-400 text-xl" /><span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span></div>
            <div className="flex items-center space-x-3 border-l pl-6 border-gray-100">
               <div><p className="text-sm font-bold text-gray-800 leading-none">{doctorName}</p><p className="text-[10px] text-blue-600 mt-1 uppercase font-bold tracking-tighter">Hospital Staff</p></div>
               <img src={`https://ui-avatars.com/api/?name=${doctorName}&background=2563eb&color=fff`} alt="profile" className="w-10 h-10 rounded-full border-2 border-blue-100" />
            </div>
          </div>
        </header>
        <main className="p-10 overflow-y-auto bg-[#F8FAFC] flex-1 custom-scrollbar">
          {view === "dashboard" ? <DashboardHome /> : view === "appointments" ? <AppointmentManager /> : view === "patients" ? <PatientList /> : view === "schedule" ? <ScheduleManager /> : <div className="text-center p-20 text-slate-400 font-bold italic">Coming soon.</div>}
        </main>
      </div>

      {/* --- APPOINTMENT DETAILS MODAL --- */}
      {selectedApt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
              <button onClick={() => setSelectedApt(null)} className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"><FaTimes size={20} /></button>
              <h3 className="text-2xl font-black tracking-tight">Patient Case Details</h3>
              <p className="text-blue-100 text-sm font-medium mt-1">Detailed view of patient booking</p>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-left">
              <div className="grid grid-cols-2 gap-6">
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Name</p><p className="font-bold text-slate-800">{selectedApt.patientName || "User"}</p></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Age / Blood Group</p><p className="font-bold text-slate-800">{selectedApt.age} Years • {selectedApt.bloodGroup}</p></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Appointment Date</p><p className="font-bold text-slate-800">{selectedApt.appointmentDate}</p></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Slot</p><p className="font-bold text-blue-600 uppercase tracking-tighter">{selectedApt.timeSlot}</p></div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 mb-2"><FaInfoCircle className="text-blue-600" size={14} /><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reported Symptoms</p></div>
                <p className="text-sm text-slate-600 leading-relaxed italic">"{selectedApt.symptoms || "No symptoms described."}"</p>
              </div>
              {selectedApt.medicalReport && (
                <div className="pt-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Patient Attachments</p>
                  <a href={`http://localhost:5000/uploads/${selectedApt.medicalReport}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-2xl group hover:bg-blue-600 transition-all duration-300">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 group-hover:text-blue-600 shadow-sm"><FaFileMedical size={18} /></div><div className="text-left"><p className="text-sm font-bold text-slate-700 group-hover:text-white truncate max-w-[150px]">Medical_Report.pdf</p><p className="text-[10px] text-slate-400 group-hover:text-blue-100 uppercase font-bold">Patient Upload</p></div></div>
                    <span className="text-[10px] font-black text-blue-600 bg-white px-3 py-1.5 rounded-lg uppercase group-hover:bg-blue-700 group-hover:text-white transition-colors shadow-sm">View File</span>
                  </a>
                </div>
              )}
              <div className="pt-4"><button onClick={() => setSelectedApt(null)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-lg">Close Case</button></div>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }` }} />
    </div>
  );
};

export default DoctorDashboard;