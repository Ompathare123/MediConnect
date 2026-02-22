import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBars, FaTachometerAlt, FaCalendarPlus, FaCalendarCheck, FaFileMedical,
  FaFilePrescription, FaCreditCard, FaUser, FaSignOutAlt, FaBell,
  FaHospitalUser, FaChevronLeft, FaPaperclip, FaInfoCircle
} from "react-icons/fa";

// Expanded Dummy doctor data (8 Doctors)
const doctorData = [
  { id: 1, name: 'Dr. Sarah Johnson', department: 'Cardiology', experience: '8+ years', fee: 250, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face', availability: true, bio: 'Specialist in non-invasive cardiology and heart failure management.', languages: 'English, Spanish' },
  { id: 2, name: 'Dr. Michael Chen', department: 'Neurology', experience: '12+ years', fee: 350, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face', availability: true, bio: 'Expert in stroke prevention and neuro-critical care.', languages: 'English, Mandarin' },
  { id: 3, name: 'Dr. Emily Rodriguez', department: 'Pediatrics', experience: '6+ years', fee: 200, image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', availability: true, bio: 'Dedicated to newborn care and adolescent health.', languages: 'English, Portuguese' },
  { id: 4, name: 'Dr. David Patel', department: 'Orthopedics', experience: '10+ years', fee: 300, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', availability: true, bio: 'Specializes in sports medicine and joint replacement surgery.', languages: 'English, Hindi' },
  { id: 5, name: 'Dr. Lisa Wong', department: 'General Checkup', experience: '15+ years', fee: 150, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face', availability: true, bio: 'Expert in preventive medicine and overall wellness screening.', languages: 'English, Cantonese' },
  { id: 6, name: 'Dr. James Wilson', department: 'General Checkup', experience: '10+ years', fee: 150, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face', availability: true, bio: 'Primary care physician focusing on family medicine and routine care.', languages: 'English' },
  { id: 7, name: 'Dr. Anna Schmidt', department: 'Neurology', experience: '9+ years', fee: 280, image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&h=150&fit=crop&crop=face', availability: true, bio: 'Focuses on epilepsy research and chronic migraine treatment.', languages: 'English, German' },
  { id: 8, name: 'Dr. Robert Brown', department: 'Orthopedics', experience: '11+ years', fee: 320, image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face', availability: true, bio: 'Specialist in spinal disorders and trauma surgery.', languages: 'English' }
];

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [successMessage, setSuccessMessage] = useState(false);

  // FETCH NAME INSTANTLY FROM LOCALSTORAGE
  const userName = localStorage.getItem("userName") || "Patient";

  const [formData, setFormData] = useState({ 
    patientName: userName, 
    department: '', 
    doctorId: '', 
    appointmentDate: '', 
    timeSlot: '', 
    consultationMode: 'in-person', 
    symptoms: '', 
    medicalReports: null 
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const menuItems = [
    { icon: FaTachometerAlt, label: "Dashboard", path: "/patient-dashboard" },
    { icon: FaCalendarPlus, label: "Book Appointment", active: true, path: "/book-appointment" },
    { icon: FaCalendarCheck, label: "My Appointments", path: "/appointments" },
    { icon: FaFileMedical, label: "Medical Records", path: "/records" },
    { icon: FaFilePrescription, label: "Prescriptions", path: "/prescriptions" },
    { icon: FaCreditCard, label: "Billing / Payments", path: "/billing" },
    { icon: FaUser, label: "Profile", path: "/profile" },
    { icon: FaSignOutAlt, label: "Logout", path: "/" }
  ];

  useEffect(() => {
    if (formData.doctorId) {
      const doctor = doctorData.find(doc => doc.id === parseInt(formData.doctorId));
      setSelectedDoctor(doctor);
    } else { setSelectedDoctor(null); }
  }, [formData.doctorId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          doctorName: selectedDoctor?.name, 
          department: formData.department, 
          appointmentDate: formData.appointmentDate, 
          timeSlot: formData.timeSlot 
        })
      });

      if (res.ok) { 
        setSuccessMessage(true); 
        setTimeout(() => navigate("/patient-dashboard"), 2000); 
      } else { 
        const d = await res.json(); 
        alert(d.message); 
      }
    } catch (error) { 
      alert("Server error"); 
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <div className={`${isCollapsed ? "w-20" : "w-64"} bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen shadow-2xl transition-all duration-300 ease-in-out flex flex-col z-50`}>
        <div className="h-20 px-6 border-b border-blue-500 flex items-center justify-between shrink-0">
          {!isCollapsed && <h2 className="text-xl font-bold flex items-center space-x-3 whitespace-nowrap overflow-hidden"><span>MediConnect</span></h2>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none">
            {isCollapsed ? <FaBars size={20} /> : <FaChevronLeft size={20} />}
          </button>
        </div>
        <nav className="mt-6 px-3 space-y-2 flex-1">
          {menuItems.map((item, index) => (
            <button key={index} 
              onClick={() => item.label === "Logout" ? handleLogout() : navigate(item.path)}
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl transition-all duration-200 ${item.active ? "bg-white/20 shadow-inner" : "hover:bg-white/10"}`}
              title={isCollapsed ? item.label : ""}
            >
              <item.icon size={20} />
              {!isCollapsed && <span className="whitespace-nowrap font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar - Corrected Top Right Name Section */}
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-8 flex justify-between items-center shrink-0 z-40">
          <h1 className="text-2xl font-bold text-blue-700">Book Appointment</h1>
          
          <div className="flex items-center space-x-6">
            <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition">
              <FaBell className="text-gray-600 text-xl" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
            </div>
            
            {/* DYNAMIC USER PROFILE SECTION */}
            <div className="flex items-center space-x-3 border-l pl-6 border-gray-100">
              <img 
                src={`https://ui-avatars.com/api/?name=${userName}&background=random&color=fff`} 
                alt="profile" 
                className="w-10 h-10 rounded-full border-2 border-blue-100 object-cover" 
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-gray-800 leading-none">{userName}</p>
                <p className="text-[11px] text-gray-400 mt-1 uppercase font-semibold">Verified Patient</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <main className="p-8 max-w-7xl mx-auto w-full relative">
            <div className="mb-8 text-left">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Book Appointment</h2>
              <p className="text-slate-500 font-medium">Schedule your consultation with a specialist</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: FORM */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-8 text-left">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Appointment Details</h3>
                  <form onSubmit={handleBookAppointment} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6 text-left">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Patient Name</label>
                        <input type="text" value={userName} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-medium" readOnly />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Department *</label>
                        <select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all" required>
                          <option value="">Select Department</option>
                          <option value="General Checkup">General Checkup</option>
                          <option value="Cardiology">Cardiology</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Pediatrics">Pediatrics</option>
                          <option value="Orthopedics">Orthopedics</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-left">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Select Doctor *</label>
                        <select name="doctorId" value={formData.doctorId} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" required disabled={!formData.department}>
                          <option value="">Choose Doctor</option>
                          {doctorData.filter(d => d.department === formData.department).map(doctor => (
                            <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date *</label>
                          <input type="date" name="appointmentDate" onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Time *</label>
                          <select name="timeSlot" onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" required>
                            <option value="">Time</option>
                            <option>09:00 AM</option>
                            <option>10:00 AM</option>
                            <option>11:00 AM</option>
                            <option>02:00 PM</option>
                            <option>03:00 PM</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Symptoms / Description</label>
                      <textarea name="symptoms" rows="4" value={formData.symptoms} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium transition-all" placeholder="Please describe your symptoms..."></textarea>
                    </div>

                    <div className="border-2 border-dashed border-blue-100 rounded-2xl p-8 text-center hover:bg-blue-50 transition-colors cursor-pointer group">
                      <FaPaperclip className="mx-auto text-blue-400 text-2xl mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-bold text-gray-700">Upload Medical Reports</p>
                      <p className="text-xs text-gray-400 mt-1 uppercase">PDF, JPG, PNG (Max 10MB)</p>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-700 active:scale-[0.98] transition-all">Confirm Booking</button>
                      <button type="reset" onClick={() => {setFormData({...formData, symptoms: '', department: '', doctorId: ''}); setSelectedDoctor(null);}} className="px-8 py-4 border-2 border-gray-100 text-gray-400 font-bold rounded-2xl hover:bg-white hover:text-gray-600 transition-all">Reset</button>
                    </div>
                  </form>
                </div>
              </div>

              {/* RIGHT COLUMN: STICKY DOCTOR INFO & SUMMARY */}
              <div className="lg:col-span-4 sticky top-0 space-y-6 pb-8">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-8 text-center relative overflow-hidden">
                  {selectedDoctor ? (
                    <>
                      <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-50 object-cover shadow-md" />
                      <h4 className="text-xl font-bold text-gray-800">{selectedDoctor.name}</h4>
                      <p className="text-blue-600 text-sm font-bold mb-4 uppercase tracking-widest">{selectedDoctor.department}</p>
                      
                      <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-50 py-4 mb-6 text-sm">
                        <div className="text-left shrink-0"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Experience</p><p className="font-black text-gray-700 whitespace-nowrap">{selectedDoctor.experience}</p></div>
                        <div className="text-right shrink-0"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Fee</p><p className="font-black text-gray-700">₹{selectedDoctor.fee}</p></div>
                      </div>

                      <div className="text-left mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                        <div className="flex items-center space-x-2 text-blue-700 font-bold text-[10px] uppercase mb-2">
                          <FaInfoCircle /> <span>Professional Bio</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed italic mb-3">"{selectedDoctor.bio}"</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Languages: <span className="text-gray-700 lowercase">{selectedDoctor.languages}</span></p>
                      </div>

                      <div className="bg-green-50 text-green-700 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center font-black">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>Available Today
                      </div>
                    </>
                  ) : (
                    <div className="py-12"><FaHospitalUser className="mx-auto text-blue-100 text-6xl mb-4" /><p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest">Select doctor for details</p></div>
                  )}
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-50 p-8 relative overflow-hidden">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-6 border-b border-gray-50 pb-4 text-left">Payment Summary</h3>
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Consultation Fee</span>
                      <span className="text-slate-800 font-black">₹{selectedDoctor?.fee || 0}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Total Payable</span>
                      <span className="text-2xl font-black text-slate-800">₹{selectedDoctor?.fee || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-10 right-10 z-[100] bg-white border-l-4 border-green-500 shadow-2xl p-6 rounded-lg flex items-center space-x-4 animate-bounce">
          <div className="bg-green-100 p-2 rounded-full text-green-600 font-bold">✅</div>
          <div><p className="font-bold text-gray-800 leading-none">Success!</p><p className="text-xs text-gray-500 mt-1">Booking confirmed.</p></div>
        </div>
      )}
    </div>
  );
};

export default BookAppointmentPage;