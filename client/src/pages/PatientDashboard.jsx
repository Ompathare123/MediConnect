import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTachometerAlt,
  FaCalendarPlus,
  FaCalendarCheck,
  FaFileMedical,
  FaFilePrescription,
  FaUser,
  FaSignOutAlt,
  FaBell,
  FaHospitalUser,
  FaChevronLeft
} from "react-icons/fa";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [userName, setUserName] = useState("Patient");

useEffect(() => {
  const storedName = localStorage.getItem("userName");
  if (storedName) {
    setUserName(storedName);
  }
}, []);


  // Removed "Billing / Payments" and "Logout" from the main mapping array
  const menuItems = [
    { icon: FaTachometerAlt, label: "Dashboard", active: true, path: "/patient-dashboard" },
    { icon: FaCalendarPlus, label: "Book Appointment", path: "/book-appointment" },
    { icon: FaCalendarCheck, label: "My Appointments", path: "/appointments" },
    { icon: FaFileMedical, label: "Medical Records", path: "/records" },
    { icon: FaFilePrescription, label: "Prescriptions", path: "/prescriptions" },
    { icon: FaUser, label: "Profile", path: "/profile" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <div className={`${isCollapsed ? "w-20" : "w-64"} bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen shadow-2xl transition-all duration-300 ease-in-out flex flex-col z-50`}>
        
        {/* SIDEBAR HEADER */}
        <div className={`h-20 px-6 border-b border-blue-500 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && (
            <h2 className="text-xl font-bold flex items-center space-x-3 whitespace-nowrap overflow-hidden">
              <FaHospitalUser />
              <span>MediConnect</span>
            </h2>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none"
          >
            {isCollapsed ? <FaBars size={20} /> : <FaChevronLeft size={20} />}
          </button>
        </div>

        {/* TOP MENU ITEMS - flex-1 pushes the bottom div down */}
        <nav className="mt-6 px-3 space-y-2 flex-1">
          {menuItems.map((item, index) => (
            <button 
              key={index} 
              onClick={() => navigate(item.path)} 
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl transition-all duration-200 ${item.active ? "bg-white/20 shadow-inner" : "hover:bg-white/10"}`} 
              title={isCollapsed ? item.label : ""}
            >
              <div className="flex-shrink-0"><item.icon size={20} /></div>
              {!isCollapsed && <span className="whitespace-nowrap font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* BOTTOM SECTION - LOGOUT */}
        <div className="px-3 pb-6 border-t border-blue-500/50 pt-4">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl hover:bg-red-500/20 transition-all duration-200 text-red-100`}
            title={isCollapsed ? "Logout" : ""}
          >
            <div className="flex-shrink-0"><FaSignOutAlt size={20} /></div>
            {!isCollapsed && <span className="whitespace-nowrap font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden h-screen text-left">
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-8 flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-bold text-blue-700">Patient Dashboard</h1>
          <div className="flex items-center space-x-6">
            <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition">
              <FaBell className="text-gray-600 text-xl" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
            </div>
            <div className="flex items-center space-x-3 border-l pl-6 border-gray-100">
              <img 
                src={`https://ui-avatars.com/api/?name=${userName}&background=random&color=fff`} 
                alt="profile" 
                className="w-10 h-10 rounded-full border-2 border-blue-100 object-cover" 
              />
              <div>
                <p className="text-sm font-bold text-gray-800 leading-none">{userName}</p>
                <p className="text-[11px] text-gray-400 mt-1 uppercase font-semibold">Verified Patient</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-8 overflow-y-auto">
          <div>
            <h2 className="text-2xl font-black text-slate-800">General Overview</h2>
            <p className="text-slate-400 text-sm">Welcome back, {userName}! Here is what's happening today.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[ 
              { title: "Upcoming Appointments", value: 3 }, 
              { title: "Completed Appointments", value: 12 }, 
              { title: "Total Doctors", value: 8 } 
            ].map((card, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition duration-300">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{card.title}</p>
                <p className="text-3xl font-black mt-2 text-slate-800">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 pb-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Upcoming Appointments</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-50">
                      <th className="pb-4 font-bold text-left">Doctor</th>
                      <th className="pb-4 font-bold text-left">Department</th>
                      <th className="pb-4 font-bold text-left">Date & Time</th>
                      <th className="pb-4 font-bold text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="group hover:bg-gray-50 transition-colors">
                      <td className="py-5 font-semibold text-gray-700">Dr. Sarah Johnson</td>
                      <td className="py-5 text-gray-500">Cardiology</td>
                      <td className="py-5"><p className="font-bold text-gray-700">2026-02-20</p><p className="text-[11px] text-gray-400">10:30 AM</p></td>
                      <td className="py-5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-green-50 text-green-600">Confirmed</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;