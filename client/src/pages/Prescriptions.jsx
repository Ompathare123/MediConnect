import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { downloadPdfWithMobileSupport } from "../utils/pdfDownload";
import {
  FaBars,
  FaTachometerAlt,
  FaCalendarPlus,
  FaCalendarCheck,
  FaFilePrescription,
  FaUser,
  FaSignOutAlt,
  FaChevronLeft,
  FaDownload,
  FaUserMd,
  FaSearch,
  FaHospitalUser
} from "react-icons/fa";

const Prescriptions = () => {
  const navigate = useNavigate();

  // --- SYNC SIDEBAR STATE WITH LOCALSTORAGE ---
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const userName = localStorage.getItem("userName") || "Patient";

  // Sidebar persistence
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  }, []);

  const menuItems = [
    { icon: FaTachometerAlt, label: "Dashboard", path: "/patient-dashboard" },
    { icon: FaCalendarPlus, label: "Book Appointment", path: "/book-appointment" },
    { icon: FaCalendarCheck, label: "My Appointments", path: "/appointments" },
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
      const filtered = res.data.filter(apt => apt.status === "Completed" && apt.prescription);
      setAppointments(filtered);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (apt) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(220, 226, 233);
    doc.rect(3, 3, pageWidth - 6, pageHeight - 6);

    doc.setFillColor(22, 124, 184);
    doc.circle(-24, -28, 86, "F");
    doc.setFillColor(177, 210, 0);
    doc.circle(-10, -34, 76, "F");

    doc.setFillColor(22, 124, 184);
    doc.circle(pageWidth + 18, pageHeight + 18, 62, "F");
    doc.setFillColor(177, 210, 0);
    doc.circle(pageWidth + 12, pageHeight + 12, 56, "F");

    doc.setTextColor(236, 241, 247);
    doc.setFontSize(44);
    doc.text("MediConnect", pageWidth / 2, pageHeight / 2, { align: "center", angle: 32 });

    doc.setTextColor(104, 171, 206);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("MediConnect Hospital", pageWidth - 18, 18, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Compassionate Care, Advanced Medicine", pageWidth - 18, 26, { align: "right" });
    doc.setFontSize(9.5);
    doc.setTextColor(130, 130, 130);
    doc.text("City Care Road, Pune", pageWidth - 18, 36, { align: "right" });
    doc.text("+91 98765 43210  |  mediconnect.health", pageWidth - 18, 42, { align: "right" });

    doc.setTextColor(70, 70, 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Name:", 62, 60);
    doc.text("Age:", 62, 70);
    doc.text("Sex:", 108, 70);
    doc.text("Date:", 146, 70);

    doc.setLineDashPattern([1, 1], 0);
    doc.line(78, 60, pageWidth - 18, 60);
    doc.line(74, 70, 103, 70);
    doc.line(117, 70, 142, 70);
    doc.line(158, 70, pageWidth - 18, 70);
    doc.setLineDashPattern([], 0);

    const sexValue = String(apt.gender || apt.sex || "Not Mentioned");
    doc.text(apt.patientName || "-", 80, 59.5);
    doc.text(String(apt.age || "-"), 76, 69.5);
    doc.text(sexValue, 118, 69.5);
    doc.text(String(apt.appointmentDate || "-"), 160, 69.5);

    const safePrescription = apt.prescription || {};
    const medicines = Array.isArray(safePrescription.medicines) ? safePrescription.medicines : [];

    const drawSection = (label, value, y) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 30, y);
      doc.setFont("helvetica", "normal");
      const wrapped = doc.splitTextToSize(value && String(value).trim() ? String(value).trim() : "-", pageWidth - 84);
      doc.text(wrapped, 78, y);
      return y + Math.max(8, wrapped.length * 5 + 2);
    };

    let cursorY = 82;
    cursorY = drawSection("Chief Complaints", safePrescription.chiefComplaints, cursorY);
    cursorY = drawSection("Diagnosis", safePrescription.diagnosis, cursorY);
    cursorY = drawSection("Tests", safePrescription.tests, cursorY);
    cursorY = drawSection("Allergies", safePrescription.allergies, cursorY);
    cursorY = drawSection("Follow-up", safePrescription.followUp, cursorY);

    const tableColumn = ["Medicine", "Dosage", "Frequency", "Duration", "Timing"];
    const tableRows = medicines.map((med) => [
      med.name || "-",
      med.dosage || "-",
      med.frequency || "-",
      med.duration || "-",
      med.timing || "-"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows.length > 0 ? tableRows : [["-", "-", "-", "-", "-"]],
      startY: cursorY + 2,
      theme: 'striped',
      headStyles: { fillColor: [22, 124, 184], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 249, 255] },
      styles: { fontSize: 10, cellPadding: 3 }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("Doctor's Advice:", 20, finalY);
    doc.setFont("helvetica", "normal");
    const wrappedAdvice = doc.splitTextToSize(safePrescription.advice || "No extra advice.", pageWidth - 40);
    doc.text(wrappedAdvice, 20, finalY + 6);

    const signatureY = Math.min(pageHeight - 16, finalY + Math.max(16, wrappedAdvice.length * 5 + 12));
    doc.setDrawColor(120, 120, 120);
    doc.line(pageWidth - 75, signatureY, pageWidth - 20, signatureY);
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text("Authorized Signature", pageWidth - 20, signatureY + 5, { align: "right" });

    const fileName = `Prescription_${(apt.patientName || apt.appointmentDate || "record").replace(/\s+/g, "_")}.pdf`;
    await downloadPdfWithMobileSupport(doc, fileName);
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
    <div className="flex min-h-screen bg-gradient-to-b from-[#eaf2ff] via-[#f4f8ff] to-[#edf4ff] overflow-x-hidden text-left relative">
      {/* Sidebar */}
      <div className={`${isCollapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "translate-x-0 w-64"} fixed md:static inset-y-0 left-0 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-2xl transition-all duration-300 ease-in-out flex flex-col z-50`}>
        
        <div className={`h-20 px-6 border-b border-blue-50 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} shrink-0`}>
          {!isCollapsed && (
            <h2 className="text-xl font-bold flex items-center space-x-3 italic whitespace-nowrap overflow-hidden">
              <FaHospitalUser />
              <span>MediConnect</span>
            </h2>
          )}
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsCollapsed(!isCollapsed);
            }} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none cursor-pointer"
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

        <div className="px-3 pb-6 border-t border-blue-500/50 pt-4">
          <button 
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-100 transition-all`}
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

      {/* Main Content Area */}
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
            <h1 className="text-xl md:text-2xl font-bold text-blue-700">My Prescriptions</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div 
              className="flex items-center space-x-3 border-l pl-6 border-gray-100 cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              <img src={`https://ui-avatars.com/api/?name=${userName}&background=random&color=fff`} alt="profile" className="w-10 h-10 rounded-full border-2 border-blue-100 object-cover" />
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{userName}</p>
                <p className="text-[11px] text-gray-400 mt-1 uppercase font-semibold">Verified Patient</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#edf4ff] via-[#f5f9ff] to-[#edf4ff] p-4 md:p-8 text-left">
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

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-100">
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default Prescriptions;