import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaBars,
  FaTachometerAlt,
  FaCalendarPlus,
  FaCalendarCheck,
  FaFilePrescription,
  FaUser,
  FaSignOutAlt,
  FaChevronLeft,
  FaClock,
  FaTrashAlt,
  FaTimes,
  FaInfoCircle,
  FaSearch,
  FaBell,
  FaHospitalUser,
  FaExclamationTriangle,
  FaFileMedical
} from "react-icons/fa";

const MyAppointments = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- SYNC SIDEBAR STATE WITH LOCALSTORAGE ---
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState(null);
  const [activeTab, setActiveTab] = useState("Pending"); 
  const [searchTerm, setSearchTerm] = useState("");
  const userName = localStorage.getItem("userName") || "Patient";

  // Persistence effect for sidebar
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    { icon: FaTachometerAlt, label: "Dashboard", id: "dashboard", path: "/patient-dashboard" },
    { icon: FaCalendarPlus, label: "Book Appointment", path: "/book-appointment" },
    { icon: FaCalendarCheck, label: "My Appointments", id: "appointments", active: true, path: "/appointments" },
    { icon: FaFilePrescription, label: "Prescriptions", id: "prescriptions", path: "/prescriptions" },
    { icon: FaUser, label: "Profile", path: "/profile" },
  ];

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Appointment cancelled successfully.");
      fetchAppointments();
    } catch (error) {
      alert("Failed to cancel appointment.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const filteredAppointments = appointments.filter((apt) => {
    const statusMatch = activeTab === "Pending" 
        ? (apt.status === "Pending" || apt.status === "Confirmed")
        : apt.status === activeTab;

    const searchMatch = 
        apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.department?.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-left relative">
      {/* Sidebar - Transition and Width handled by state */}
      <div className={`${isCollapsed ? "w-20" : "w-64"} bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen shadow-2xl transition-all duration-300 ease-in-out flex flex-col z-50 sticky top-0 h-screen`}>
        
        <div className={`h-20 px-6 border-b border-blue-50 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} shrink-0`}>
          {!isCollapsed && (
            <h2 className="text-xl font-bold flex items-center space-x-3 italic whitespace-nowrap overflow-hidden">
              <FaHospitalUser /> {/* Icon added before MediConnect */}
              <span>MediConnect</span>
            </h2>
          )}
          {/* Toggle button logic isolated */}
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsCollapsed(!isCollapsed);
            }} 
            className="p-2 hover:bg-white/10 rounded-lg focus:outline-none transition-colors cursor-pointer"
          >
            {isCollapsed ? <FaBars size={20} /> : <FaChevronLeft size={20} />}
          </button>
        </div>

        <nav className="mt-6 px-3 space-y-2 flex-1">
          {menuItems.map((item, index) => (
            <button key={index} 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl transition-all duration-200 ${item.active ? "bg-white/20 shadow-inner" : "hover:bg-white/10"}`}
              title={isCollapsed ? item.label : ""}
            >
              <div className="flex-shrink-0"><item.icon size={20} /></div>
              {!isCollapsed && <span className="whitespace-nowrap font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-8">
          <button 
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-100 transition-all`}
          >
            <div className="flex-shrink-0"><FaSignOutAlt size={20} /></div>
            {!isCollapsed && <span className="whitespace-nowrap font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-8 flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-bold text-blue-700">My Appointments</h1>
          <div className="flex items-center space-x-6">
            <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition">
              <FaBell className="text-gray-600 text-xl" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
            </div>
            <div 
               className="flex items-center space-x-3 border-l pl-6 border-gray-100 cursor-pointer"
               onClick={() => navigate("/profile")}
            >
              <img src={`https://ui-avatars.com/api/?name=${userName}&background=random&color=fff`} alt="profile" className="w-10 h-10 rounded-full border-2 border-blue-100 object-cover" />
              <div className="text-left">
                <p className="text-sm font-bold text-gray-800 leading-none">{userName}</p>
                <p className="text-[11px] text-gray-400 mt-1 uppercase font-semibold">Verified Patient</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Appointment History</h2>
                <p className="text-slate-500 font-medium">Track your past and upcoming medical visits</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-64 group">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search doctor..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
                  {["Pending", "Completed", "Cancelled"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-50">
                      <th className="px-8 py-6 font-bold">Doctor Details</th>
                      <th className="px-8 py-6 font-bold">Appointment Date</th>
                      <th className="px-8 py-6 font-bold">Status</th>
                      <th className="px-8 py-6 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-bold italic animate-pulse">Loading appointments...</td></tr>
                    ) : filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-24 text-center">
                          <FaClock className="mx-auto text-blue-100 text-6xl mb-4" />
                          <p className="text-slate-400 font-bold">No {activeTab.toLowerCase()} appointments found.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => (
                        <tr 
                          key={apt._id} 
                          onClick={() => setSelectedApt(apt)} 
                          className="group hover:bg-blue-50/50 transition-colors cursor-pointer"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-xs uppercase">
                                {apt.doctorName?.charAt(0) || "D"}
                              </div>
                              <div>
                                <p className="font-black text-slate-800 text-base">{apt.doctorName}</p>
                                <p className="text-[11px] text-blue-600 uppercase font-bold tracking-tighter">{apt.department}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="font-bold text-slate-700">{apt.appointmentDate}</p>
                            <p className="text-xs text-gray-400 font-medium">{apt.timeSlot}</p>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              apt.status === "Confirmed" ? "bg-green-100 text-green-600" : 
                              apt.status === "Cancelled" ? "bg-red-50 text-red-600" : 
                              apt.status === "Completed" ? "bg-blue-50 text-blue-600" : "bg-yellow-100 text-yellow-600"
                            }`}>
                              {apt.status || "Pending"}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            {activeTab === "Pending" ? (
                              <button 
                                onClick={(e) => handleCancelAppointment(e, apt._id)}
                                className="p-2 text-gray-300 hover:text-red-500 transition-all hover:scale-110"
                                title="Cancel Appointment"
                              >
                                <FaTrashAlt size={16} />
                              </button>
                            ) : apt.status === "Cancelled" && (apt.cancellationNote || apt.cancellationReason) ? (
                                <div className="flex justify-center">
                                    <span className="flex items-center gap-1.5 bg-red-50 text-red-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase">
                                        <FaInfoCircle size={10} /> Has Note
                                    </span>
                                </div>
                            ) : (
                                <span className="text-[10px] font-black text-slate-300 uppercase italic">Archived</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- APPOINTMENT DETAILS MODAL --- */}
      {selectedApt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
              <button onClick={() => setSelectedApt(null)} className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"><FaTimes size={20} /></button>
              <h3 className="text-2xl font-black tracking-tight">Appointment Details</h3>
              <p className="text-blue-100 text-sm font-medium mt-1">Review your booking information</p>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Doctor</p><p className="font-bold text-slate-800">{selectedApt.doctorName}</p></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p><p className="font-bold text-blue-600">{selectedApt.department}</p></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p><p className="font-bold text-slate-800">{selectedApt.appointmentDate}</p></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Slot</p><p className="font-bold text-slate-800">{selectedApt.timeSlot}</p></div>
              </div>

              {selectedApt.status === "Cancelled" && (selectedApt.cancellationNote || selectedApt.cancellationReason) && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2 text-red-600">
                    <FaExclamationTriangle size={14} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Cancellation Reason (Note)</p>
                  </div>
                  <p className="text-sm text-red-700 font-bold leading-relaxed italic">
                    "{selectedApt.cancellationNote || selectedApt.cancellationReason}"
                  </p>
                </div>
              )}

              <div className="border-t border-slate-50 pt-6 grid grid-cols-2 gap-6">
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Name</p><p className="font-bold text-slate-800">{selectedApt.patientName || userName}</p></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Age / Blood Group</p><p className="font-bold text-slate-800">{selectedApt.age} Years • {selectedApt.bloodGroup}</p></div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <FaInfoCircle className="text-blue-600" size={14} />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Symptoms & Notes</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">{selectedApt.symptoms || "No symptoms described."}</p>
              </div>

              {selectedApt.medicalReport && (
                <div className="pt-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Attached Documents</p>
                  <a href={`http://localhost:5000/uploads/${selectedApt.medicalReport}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-2xl group hover:bg-blue-600 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 group-hover:text-blue-600 shadow-sm">
                        <FaFileMedical size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-700 group-hover:text-white truncate max-w-[150px]">Medical_Report.pdf</p>
                        <p className="text-[10px] text-slate-400 group-hover:text-blue-100 uppercase font-bold">PDF Document</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-white px-3 py-1.5 rounded-lg uppercase group-hover:bg-blue-700 group-hover:text-white transition-colors">View File</span>
                  </a>
                </div>
              )}
              <button onClick={() => setSelectedApt(null)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-lg mt-4">Close Details</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default MyAppointments;