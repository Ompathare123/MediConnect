import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaBars, FaTachometerAlt, FaCalendarPlus, FaCalendarCheck,
  FaFilePrescription, FaUser, FaChevronLeft, FaStethoscope, FaSignOutAlt, FaBell
} from "react-icons/fa";

const DoctorsList = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const userName = localStorage.getItem("userName") || "Patient";

  // REMOVED MEDICAL RECORDS FROM THIS LIST
  const menuItems = [
    { icon: FaTachometerAlt, label: "Dashboard", path: "/patient-dashboard" },
    { icon: FaCalendarPlus, label: "Book Appointment", path: "/book-appointment" },
    { icon: FaCalendarCheck, label: "My Appointments", path: "/appointments" },
    { icon: FaFilePrescription, label: "Prescriptions", path: "/prescriptions" },
    { icon: FaUser, label: "Profile", path: "/profile" },
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/doctors/all", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setDoctors(res.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#eaf2ff] via-[#f4f8ff] to-[#edf4ff] overflow-x-hidden text-left relative">
      {/* Sidebar */}
      <div className={`${isCollapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "translate-x-0 w-64"} fixed md:static inset-y-0 left-0 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-2xl transition-all duration-300 flex flex-col z-50`}>
        <div className="h-20 px-6 border-b border-blue-50 flex items-center justify-between shrink-0">
          {!isCollapsed && <h2 className="text-xl font-bold flex items-center space-x-3 italic"><span>MediConnect</span></h2>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            {isCollapsed ? <FaBars size={20} /> : <FaChevronLeft size={20} />}
          </button>
        </div>
        <nav className="mt-6 px-3 space-y-2 flex-1">
          {menuItems.map((item, index) => (
            <button key={index} onClick={() => navigate(item.path)} className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/10`}>
              <div className="flex-shrink-0"><item.icon size={20} /></div>
              {!isCollapsed && <span className="whitespace-nowrap font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        {/* Logout Button at bottom of sidebar */}
        <div className="px-3 pb-6 border-t border-blue-500/50 pt-4">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-4"} px-4 py-3 rounded-xl hover:bg-red-500/20 transition-all duration-200 text-red-100`}
            title={isCollapsed ? "Logout" : ""}
          >
            <div className="flex-shrink-0"><FaSignOutAlt size={20} /></div>
            {!isCollapsed && <span className="whitespace-nowrap font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsCollapsed(true)}
          className="fixed inset-0 bg-slate-900/30 z-40 md:hidden"
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden w-full">
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-4 md:px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 rounded-lg border border-gray-200 text-slate-600"
              onClick={() => setIsCollapsed(false)}
              aria-label="Open sidebar"
            >
              <FaBars size={16} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-blue-700">Our Doctors</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Notification Icon */}
            <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition">
              <FaBell className="text-gray-600 text-xl" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
            </div>
            
            <div className="flex items-center space-x-3 border-l pl-6 border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{userName}</p>
                <p className="text-[11px] text-gray-400 mt-1 uppercase font-semibold">Verified Patient</p>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${userName}&background=random&color=fff`} alt="profile" className="w-10 h-10 rounded-full border-2 border-blue-100" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#edf4ff] via-[#f5f9ff] to-[#edf4ff] p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Available Specialists</h2>
              <p className="text-slate-500 font-medium">Find and book appointments with our expert medical team</p>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-400 font-bold italic animate-pulse">Loading doctors...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doc) => (
                  <div key={doc._id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 hover:shadow-md transition-all group">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl">
                        <FaStethoscope />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-lg">{doc.name}</h3>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{doc.department}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm"><span className="text-gray-400">Experience:</span><span className="font-bold text-slate-700">{doc.experience} Years</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-400">Education:</span><span className="font-bold text-slate-700">{doc.education}</span></div>
                    </div>
                    <button 
                      onClick={() => {
                        const selectedDoctorPayload = {
                          doctorId: doc._id,
                          department: doc.department || "",
                          doctorName: doc.name || ""
                        };

                        localStorage.setItem(
                          "bookAppointmentPrefill",
                          JSON.stringify(selectedDoctorPayload)
                        );

                        const params = new URLSearchParams({
                          doctorId: doc._id,
                          department: doc.department || ""
                        });

                        navigate(`/book-appointment?${params.toString()}`, {
                          state: {
                            selectedDoctor: selectedDoctorPayload
                          }
                        });
                      }} 
                      className="w-full py-3 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorsList;