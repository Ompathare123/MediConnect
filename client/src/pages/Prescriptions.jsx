import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FaBars,
  FaTachometerAlt,
  FaCalendarPlus,
  FaCalendarCheck,
  FaFileMedical,
  FaFilePrescription,
  FaUser,
  FaSignOutAlt,
  FaChevronLeft,
  FaDownload,
  FaUserMd,
  FaSearch,
  FaBell
} from "react-icons/fa";

const Prescriptions = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const userName = localStorage.getItem("userName") || "Patient";

  const menuItems = [
    { icon: FaTachometerAlt, label: "Dashboard", path: "/patient-dashboard" },
    { icon: FaCalendarPlus, label: "Book Appointment", path: "/book-appointment" },
    { icon: FaCalendarCheck, label: "My Appointments", path: "/appointments" },
    { icon: FaFileMedical, label: "Medical Records", path: "/records" },
    { icon: FaFilePrescription, label: "Prescriptions", active: true, path: "/prescriptions" },
    { icon: FaUser, label: "Profile", path: "/profile" },
  ];

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter only completed appointments that have a prescription attached
      const filtered = res.data.filter(apt => apt.status === "Completed" && apt.prescription);
      setAppointments(filtered);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (apt) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text("MediConnect", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Digital Prescription Report", 105, 28, { align: "center" });
    
    // Info Section
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(`Doctor: ${apt.doctorName}`, 20, 45);
    doc.text(`Department: ${apt.department}`, 20, 52);
    doc.text(`Date: ${apt.appointmentDate}`, 150, 45);
    
    doc.setLineWidth(0.5);
    doc.line(20, 60, 190, 60);
    
    doc.text(`Patient Name: ${apt.patientName}`, 20, 70);
    doc.text(`Age/Blood: ${apt.age || 'N/A'} | ${apt.bloodGroup || 'N/A'}`, 20, 77);

    // Medicines Table
    const tableColumn = ["Medicine Name", "Dosage", "Timing"];
    const tableRows = apt.prescription.medicines.map(med => [med.name, med.dosage, med.timing]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFont("helvetica", "bold");
    doc.text("Doctor's Advice:", 20, finalY);
    doc.setFont("helvetica", "normal");
    doc.text(apt.prescription.advice || "No extra advice.", 20, finalY + 8);

    doc.save(`Prescription_${apt.appointmentDate}.pdf`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const filteredList = appointments.filter(a => 
    a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-left relative">
      {/* Sidebar */}
      <div className={`${isCollapsed ? "w-20" : "w-64"} bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen shadow-2xl transition-all duration-300 ease-in-out flex flex-col z-50`}>
        <div className="h-20 px-6 border-b border-blue-50 flex items-center justify-between shrink-0">
          {!isCollapsed && <h2 className="text-xl font-bold flex items-center space-x-3 italic"><span>MediConnect</span></h2>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none">
            {isCollapsed ? <FaBars size={20} /> : <FaChevronLeft size={20} />}
          </button>
        </div>
        <nav className="mt-6 px-3 space-y-2 flex-1">
          {menuItems.map((item, index) => (
            <button key={index} 
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl transition-all duration-200 ${item.active ? "bg-white/20 shadow-inner" : "hover:bg-white/10"}`}
            >
              <div className="flex-shrink-0"><item.icon size={20} /></div>
              {!isCollapsed && <span className="whitespace-nowrap font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-8">
          <button onClick={handleLogout} className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-100 transition-all`}>
            <div className="flex-shrink-0"><FaSignOutAlt size={20} /></div>
            {!isCollapsed && <span className="whitespace-nowrap font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* STANDARD NAVIGATION BAR */}
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-8 flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-bold text-blue-700">My Prescriptions</h1>
          <div className="flex items-center space-x-6">
            <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition">
              <FaBell className="text-gray-600 text-xl" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
            </div>
            <div className="flex items-center space-x-3 border-l pl-6 border-gray-100">
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
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Prescription Records</h2>
                <p className="text-slate-500 font-medium">Download digital copies of your issued prescriptions</p>
              </div>

              <div className="relative w-full md:w-64 group">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search doctor or dept..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-50">
                      <th className="px-8 py-6 font-bold">Doctor Info</th>
                      <th className="px-8 py-6 font-bold">Visit Date</th>
                      <th className="px-8 py-6 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr><td colSpan="3" className="py-20 text-center text-slate-400 font-bold italic animate-pulse">Loading prescriptions...</td></tr>
                    ) : filteredList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-24 text-center">
                          <FaFilePrescription className="mx-auto text-blue-100 text-6xl mb-4" />
                          <p className="text-slate-400 font-bold">No prescriptions available.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((apt) => (
                        <tr key={apt._id} className="group hover:bg-blue-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                <FaUserMd size={18} />
                              </div>
                              <div>
                                <p className="font-black text-slate-800 text-base">{apt.doctorName}</p>
                                <p className="text-[10px] text-blue-600 uppercase font-bold tracking-tighter">{apt.department}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="font-bold text-slate-700">{apt.appointmentDate}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Completed Visit</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <button 
                              onClick={() => downloadPDF(apt)}
                              className="inline-flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 transition-all shadow-md hover:shadow-blue-200"
                            >
                              <FaDownload /> Download PDF
                            </button>
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

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}} />
    </div>
  );
};

export default Prescriptions;