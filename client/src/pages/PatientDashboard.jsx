import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaBars,
  FaTachometerAlt,
  FaCalendarPlus,
  FaCalendarCheck,
  FaFileMedical,
  FaFilePrescription,
  FaUser,
  FaSignOutAlt,
  FaHospitalUser,
  FaChevronLeft,
  FaTrashAlt
} from "react-icons/fa";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [userName, setUserName] = useState("Patient");
  
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, totalDoctors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const aptRes = await axios.get("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(aptRes.data);

      const docRes = await axios.get("http://localhost:5000/api/doctors/all");
      const upcoming = aptRes.data.filter(a => a.status === "Pending" || a.status === "Confirmed").length;
      const completed = aptRes.data.filter(a => a.status === "Completed").length;
      
      setStats({ upcoming, completed, totalDoctors: docRes.data.length || 0 });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Appointment cancelled successfully.");
      fetchDashboardData();
    } catch (error) {
      alert("Failed to cancel appointment.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { icon: FaTachometerAlt, label: "Dashboard", active: true, path: "/patient-dashboard" },
    { icon: FaCalendarPlus, label: "Book Appointment", path: "/book-appointment" },
    { icon: FaCalendarCheck, label: "My Appointments", path: "/appointments" }, 
    { icon: FaFileMedical, label: "Medical Records", path: "/records" },
    { icon: FaFilePrescription, label: "Prescriptions", path: "/prescriptions" },
    { icon: FaUser, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <div className={`${isCollapsed ? "w-20" : "w-64"} bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen shadow-2xl transition-all duration-300 ease-in-out flex flex-col z-50`}>
        <div className={`h-20 px-6 border-b border-blue-50 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && (
            <h2 className="text-xl font-bold flex items-center space-x-3 italic whitespace-nowrap overflow-hidden">
              <FaHospitalUser />
              <span>MediConnect</span>
            </h2>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-white/10 rounded-lg focus:outline-none">
            {isCollapsed ? <FaBars size={20} /> : <FaChevronLeft size={20} />}
          </button>
        </div>

        <nav className="mt-6 px-3 space-y-2 flex-1">
          {menuItems.map((item, index) => (
            <button 
              key={index} 
              onClick={() => navigate(item.path)} 
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl transition-all duration-200 ${item.active ? "bg-white/20 shadow-inner" : "hover:bg-white/10"}`}
            >
              <div className="flex-shrink-0"><item.icon size={20} /></div>
              {!isCollapsed && <span className="whitespace-nowrap font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-6 border-t border-blue-500/50 pt-4">
          <button onClick={handleLogout} className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-4"} px-4 py-3 rounded-xl hover:bg-red-500/20 transition-all text-red-100`}>
            <div className="flex-shrink-0"><FaSignOutAlt size={20} /></div>
            {!isCollapsed && <span className="whitespace-nowrap font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden h-screen text-left">
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-8 flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-bold text-blue-700">Patient Dashboard</h1>
          <div className="flex items-center space-x-3 pr-4">
            <img src={`https://ui-avatars.com/api/?name=${userName}&background=random&color=fff`} alt="profile" className="w-10 h-10 rounded-full border-2 border-blue-100 object-cover" />
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800 leading-none">{userName}</p>
              <p className="text-[11px] text-gray-400 mt-1 uppercase font-semibold">Verified Patient</p>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-8 overflow-y-auto">
          <div className="animate-fadeIn space-y-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800">General Overview</h2>
              <p className="text-slate-400 text-sm">Welcome back, {userName}!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[ 
                { title: "Upcoming Appointments", value: stats.upcoming, path: "/appointments" }, 
                { title: "Completed Visits", value: stats.completed, path: "/appointments" }, 
                { title: "Total Doctors", value: stats.totalDoctors, path: "/doctors" } 
              ].map((card, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate(card.path)}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition duration-300 cursor-pointer group"
                >
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors">{card.title}</p>
                  <p className="text-3xl font-black mt-2 text-slate-800">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Upcoming Appointments</h3>
                <button onClick={() => navigate("/appointments")} className="text-blue-600 text-xs font-bold uppercase hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-50">
                      <th className="pb-4 font-bold">Doctor</th>
                      <th className="pb-4 font-bold">Department</th>
                      <th className="pb-4 font-bold">Date & Time</th>
                      <th className="pb-4 font-bold">Status</th>
                      <th className="pb-4 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {loading ? (
                      <tr><td colSpan="5" className="py-10 text-center text-gray-400 italic">Loading Data...</td></tr>
                    ) : appointments.filter(a => a.status === "Pending" || a.status === "Confirmed").length === 0 ? (
                      <tr><td colSpan="5" className="py-10 text-center text-gray-400">No upcoming visits.</td></tr>
                    ) : (
                      appointments.filter(a => a.status === "Pending" || a.status === "Confirmed").slice(0, 5).map((apt, index) => (
                        <tr key={index} className="group hover:bg-gray-50 transition-colors">
                          <td className="py-5 font-semibold text-gray-700">{apt.doctorName}</td>
                          <td className="py-5 text-gray-500">{apt.department}</td>
                          <td className="py-5">
                            <p className="font-bold text-gray-700">{apt.appointmentDate}</p>
                            <p className="text-[11px] text-gray-400">{apt.timeSlot}</p>
                          </td>
                          <td className="py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${apt.status === "Confirmed" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>{apt.status}</span>
                          </td>
                          <td className="py-5 text-center">
                            <button onClick={() => handleCancelAppointment(apt._id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><FaTrashAlt size={16} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }` }} />
    </div>
  );
};

export default PatientDashboard;