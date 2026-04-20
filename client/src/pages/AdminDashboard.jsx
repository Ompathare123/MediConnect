import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaBars, FaTachometerAlt, FaCalendarCheck, FaUsers, FaUserMd,
  FaThLarge, FaStethoscope,
  FaSignOutAlt, FaHospitalUser, FaChevronLeft,
  FaPlusCircle, FaUserPlus, FaArrowLeft, FaUser, FaPaperclip, FaTrash
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#1e3a8a", "#2563eb", "#93c5fd"];

// --- SUB-COMPONENTS ---

const DashboardHome = ({
  quickActions,
  stats,
  onStatClick,
  trafficData,
  demographicData,
  trafficMonths,
  trafficStatus,
  onTrafficMonthsChange,
  onTrafficStatusChange
}) => (
  <div className="animate-fadeIn space-y-8 text-left">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        {
          label: "TOTAL DOCTORS REGISTERED",
          helperText: "Doctor profiles in system",
          value: stats.doctors,
          icon: FaUserMd,
          color: "text-blue-600",
          target: "doctors"
        },
        {
          label: "TOTAL PATIENTS REGISTERED",
          helperText: "Patient accounts in system",
          value: stats.patients,
          icon: FaUsers,
          color: "text-blue-500",
          target: "patients"
        },
        {
          label: "TOTAL APPOINTMENTS BOOKED",
          helperText: "All appointment records",
          value: stats.appointments,
          icon: FaCalendarCheck,
          color: "text-sky-600",
          target: "appointments"
        },
      ].map((stat, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onStatClick(stat.target)}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:-translate-y-1 transition-all duration-300 group text-left"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black mt-1 text-slate-800">
                {stat.value}
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1">{stat.helperText}</p>
            </div>
            <div className={`p-3 rounded-2xl bg-blue-50 ${stat.color} group-hover:bg-blue-600 group-hover:text-white transition-colors`}><stat.icon size={20} /></div>
          </div>
        </button>
      ))}
    </div>
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
      <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 font-mono"><span className="w-2 h-6 bg-blue-600 rounded-full"></span> QUICK ACTIONS</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {quickActions.map((action, i) => (
          <div key={i} onClick={action.action} className="flex flex-col items-center p-4 rounded-2xl hover:bg-blue-50 cursor-pointer transition-all group">
            <div className={`w-14 h-14 ${action.color} text-white rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}><action.icon size={22} /></div>
            <span className="text-xs font-bold text-slate-600 text-center">{action.label}</span>
          </div>
        ))}
        {quickActions.length === 0 && (
          <p className="col-span-full text-sm text-slate-400 font-medium italic">No quick actions matched your search.</p>
        )}
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-800">Hospital Traffic</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Appointments in last {trafficMonths} months ({trafficStatus})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={trafficMonths}
              onChange={(e) => onTrafficMonthsChange(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="3">Last 3 months</option>
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
            </select>
            <select
              value={trafficStatus}
              onChange={(e) => onTrafficStatusChange(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="patients" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col items-center">
        <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tighter">Demographics</h3>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-4">Doctors vs registered patients vs pending appointments</p>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={demographicData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                {demographicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

const DoctorsList = ({ doctors, setView, onDeleteDoctor }) => (
  <div className="animate-fadeIn space-y-6 text-left pb-10">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Medical Staff</h2>
        <p className="text-slate-400 text-sm font-medium">View and manage all registered doctors in the system.</p>
      </div>
      <button onClick={() => setView("addDoctor")} className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition shadow-lg w-full sm:w-auto">
        <FaPlusCircle /> Add New Doctor
      </button>
    </div>

    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor Name</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Register Contact</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doc, i) => (
            <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                    {doc.name ? doc.name.charAt(0) : "D"}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{doc.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 font-medium">{doc.department}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{doc.specialization}</td>
              <td className="px-6 py-4 text-sm text-slate-500 font-bold">{doc.experience} Years</td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm text-slate-700 font-bold">{doc.phone || "No Mobile"}</span>
                  <span className="text-[11px] text-slate-400 font-medium">{doc.email}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onDeleteDoctor(doc)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-black uppercase tracking-wide transition"
                >
                  <FaTrash size={12} /> Delete
                </button>
              </td>
            </tr>
          ))}
          {doctors.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-medium italic">No doctors found in the database.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  </div>
);

const DeletedDoctorsList = ({ doctors }) => (
  <div className="animate-fadeIn space-y-6 text-left pb-10">
    <div>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Deleted Doctors</h2>
      <p className="text-slate-400 text-sm font-medium">Doctors removed from active login. Their historical records are preserved.</p>
    </div>

    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor Name</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deleted On</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doc, i) => (
            <tr key={doc._id || i} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4 text-sm font-bold text-slate-700">{doc.name || "-"}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{doc.department || "-"}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{doc.specialization || "-"}</td>
              <td className="px-6 py-4 text-sm text-slate-500 font-medium">{doc.deletedAt ? new Date(doc.deletedAt).toLocaleString() : "-"}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{doc.email || doc.phone || "-"}</td>
            </tr>
          ))}
          {doctors.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium italic">No deleted doctors found.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  </div>
);

const PatientsList = ({ patients, appointments }) => {
  const patientsWithBookings = [];
  const patientsOnlyRegistered = [];

  const appointmentUserIds = new Set(
    appointments
      .map((apt) => String(apt.user || ""))
      .filter(Boolean)
  );

  const appointmentPatientNames = new Set(
    appointments
      .map((apt) => String(apt.patientName || "").trim().toLowerCase())
      .filter(Boolean)
  );

  patients.forEach((patient) => {
    const byId = appointmentUserIds.has(String(patient._id || ""));
    const byName = appointmentPatientNames.has(String(patient.name || "").trim().toLowerCase());
    if (byId || byName) {
      patientsWithBookings.push(patient);
    } else {
      patientsOnlyRegistered.push(patient);
    }
  });

  const renderTable = (list, emptyText) => (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered</th>
          </tr>
        </thead>
        <tbody>
          {list.map((patient, i) => (
            <tr key={patient._id || i} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                    {patient.name ? patient.name.charAt(0) : "P"}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{patient.name || "Unknown"}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm text-slate-700 font-bold">{patient.phone || "No Phone"}</span>
                  <span className="text-[11px] text-slate-400 font-medium">{patient.email || "No Email"}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 font-medium">{patient.gender || "-"}</td>
              <td className="px-6 py-4 text-sm text-slate-500 max-w-[280px] truncate" title={patient.address || ""}>{patient.address || "-"}</td>
              <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : "-"}
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium italic">{emptyText}</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );

  return (
    <div className="animate-fadeIn space-y-8 text-left pb-10">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Registered Patients</h2>
        <p className="text-slate-400 text-sm font-medium">Split by patients who booked appointments and those only registered.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Patients With Appointments</h3>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-widest">{patientsWithBookings.length}</span>
        </div>
        {renderTable(patientsWithBookings, "No patients with booked appointments found.")}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Only Registered (No Appointment Yet)</h3>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-700 uppercase tracking-widest">{patientsOnlyRegistered.length}</span>
        </div>
        {renderTable(patientsOnlyRegistered, "No only-registered patients found.")}
      </div>
    </div>
  );
};

const AppointmentsList = ({ appointments, activeTab, setActiveTab, setView }) => {
  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === "Pending") {
      return apt.status === "Pending" || apt.status === "Confirmed";
    }
    if (activeTab === "Completed") {
      return apt.status === "Completed";
    }
    if (activeTab === "Cancelled") {
      return apt.status === "Cancelled";
    }
    return true;
  });

  return (
    <div className="animate-fadeIn space-y-6 text-left pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">All Appointments</h2>
          <p className="text-slate-400 text-sm font-medium">Monitor appointments from all doctors and patients.</p>
        </div>
        <button onClick={() => setView("bookAppointment")} className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition shadow-lg">
          <FaPlusCircle /> Book Appointment
        </button>
      </div>

      <div className="overflow-x-auto">
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit min-w-full sm:min-w-0 flex gap-1">
        {["All", "Pending", "Completed", "Cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((apt, i) => (
              <tr key={apt._id || i} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-700">{apt.patientName || "-"}</td>
                <td className="px-6 py-4 text-sm text-slate-700 font-medium">{apt.doctorName || "-"}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{apt.department || "-"}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-700 font-bold">{apt.appointmentDate || "-"}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{apt.timeSlot || "-"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    apt.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : apt.status === "Cancelled"
                        ? "bg-red-100 text-red-600"
                        : apt.status === "Confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                  }`}
                  >
                    {apt.status || "Pending"}
                  </span>
                </td>
              </tr>
            ))}
            {filteredAppointments.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium italic">No appointments found for this status.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

const DepartmentsList = ({ doctors }) => {
  const departmentMap = doctors.reduce((acc, doc) => {
    const name = String(doc.department || "").trim();
    if (!name) return acc;

    if (!acc[name]) {
      acc[name] = {
        name,
        doctors: 0,
        specializations: new Set()
      };
    }

    acc[name].doctors += 1;
    if (doc.specialization) {
      acc[name].specializations.add(doc.specialization);
    }

    return acc;
  }, {});

  const departments = Object.values(departmentMap)
    .map((dept) => ({
      ...dept,
      specializations: Array.from(dept.specializations)
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="animate-fadeIn space-y-6 text-left pb-10">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Available Departments</h2>
        <p className="text-slate-400 text-sm font-medium">Departments where doctors are currently registered in the system.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctors Available</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specializations</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, i) => (
              <tr key={`${dept.name}-${i}`} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-700">{dept.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700 font-black">{dept.doctors}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {dept.specializations.length > 0 ? dept.specializations.join(", ") : "-"}
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-10 text-center text-slate-400 font-medium italic">No department data available. Add doctors first.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

const AddDoctorForm = ({ setView, doctorData, handleDoctorChange, handleSaveDoctor }) => (
  <form onSubmit={handleSaveDoctor} className="animate-fadeIn space-y-6 pb-10 text-left">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Add New Doctor</h2>
        <p className="text-slate-400 text-sm font-medium">Create a professional profile for a new medical staff member.</p>
      </div>
      <button type="button" onClick={() => setView("dashboard")} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition shadow-sm w-full sm:w-auto">
        <FaArrowLeft /> Back to Dashboard
      </button>
    </div>

    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
      <div className="bg-blue-600 px-8 py-4 text-white font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
        <FaHospitalUser /> Login Details
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">First Name</label><input type="text" name="firstName" value={doctorData.firstName} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="First Name" /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Middle Name</label><input type="text" name="middleName" value={doctorData.middleName} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Middle Name" /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Last Name</label><input type="text" name="lastName" value={doctorData.lastName} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Last Name" /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Email Address *</label><input type="email" name="email" autoComplete="username" value={doctorData.email} onChange={handleDoctorChange} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@mail.com" required /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Password *</label><input type="password" name="password" autoComplete="new-password" value={doctorData.password} onChange={handleDoctorChange} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 outline-none" placeholder="Enter Password" required /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Phone Number</label><input type="text" name="phone" value={doctorData.phone} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+1 234 567 890" /></div>
      </div>

      <div className="bg-blue-600 px-8 py-4 text-white font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
        <FaStethoscope /> Professional Details
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Department *</label><select name="department" value={doctorData.department} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"><option value="">Select Department</option><option value="General Checkup">General Checkup</option><option value="Cardiology">Cardiology</option><option value="Neurology">Neurology</option><option value="Pediatrics">Pediatrics</option><option value="Orthopedics">Orthopedics</option></select></div>
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Specialization *</label><input type="text" name="specialization" value={doctorData.specialization} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Specialization" /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Experience (Years) *</label><input type="number" name="experience" value={doctorData.experience} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Experience in years" /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Education *</label><input type="text" name="education" value={doctorData.education} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., MBBS, MD" /></div>
      </div>
      <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end"><button type="submit" className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg">Save Doctor</button></div>
    </div>
  </form>
);

const AddPatientForm = ({ setView, patientData, handlePatientChange, handleSavePatient }) => (
  <form onSubmit={handleSavePatient} className="animate-fadeIn space-y-6 pb-10 text-left">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Add New Patient</h2>
        <p className="text-slate-400 text-sm font-medium">Register a new patient into the hospital system.</p>
      </div>
      <button type="button" onClick={() => setView("dashboard")} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition shadow-sm w-full sm:w-auto">
        <FaArrowLeft /> Back to Dashboard
      </button>
    </div>

    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
      <div className="bg-blue-600 px-8 py-4 text-white font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
        <FaUser /> Registration Details
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Full Name *</label><input type="text" name="name" value={patientData.name} onChange={handlePatientChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Full Name" required /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Email Address *</label><input type="email" name="email" value={patientData.email} onChange={handlePatientChange} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email" required /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Password *</label><input type="password" name="password" value={patientData.password} onChange={handlePatientChange} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 outline-none" placeholder="Password" required /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Phone Number *</label><input type="text" name="phone" value={patientData.phone} onChange={handlePatientChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Phone Number" required /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Select Gender *</label><select name="gender" value={patientData.gender} onChange={handlePatientChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
        <div className="space-y-1 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Address *</label><textarea name="address" value={patientData.address} onChange={handlePatientChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" placeholder="Patient Address" required></textarea></div>
      </div>
      <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end"><button type="submit" className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg">Register Patient</button></div>
    </div>
  </form>
);

const AdminBookAppointmentForm = ({ setView, onBooked }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    bloodGroup: "",
    department: "",
    doctorId: "",
    appointmentDate: "",
    timeSlot: "",
    symptoms: "",
    medicalReport: null
  });
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlotFee, setSelectedSlotFee] = useState(0);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!formData.department) {
        setDoctors([]);
        return;
      }

      setLoadingDoctors(true);
      try {
        const token = localStorage.getItem("token");
        const config = {
          params: { department: formData.department },
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        };

        const res = await axios.get("http://localhost:5000/api/doctors/all", config);
        let nextDoctors = Array.isArray(res.data) ? res.data : [];

        // Fallback in case backend exact-match filter returns empty unexpectedly.
        if (nextDoctors.length === 0) {
          const allDoctorsRes = await axios.get("http://localhost:5000/api/doctors/all", {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          const allDoctors = Array.isArray(allDoctorsRes.data) ? allDoctorsRes.data : [];
          const wanted = formData.department.trim().toLowerCase();
          nextDoctors = allDoctors.filter((doc) =>
            String(doc.department || "").trim().toLowerCase() === wanted
          );
        }

        setDoctors(nextDoctors);
      } catch (error) {
        console.error("Doctor fetch error:", error);
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
    setFormData(prev => ({ ...prev, doctorId: "", timeSlot: "" }));
    setSelectedDoctor(null);
    setAvailableSlots([]);
    setSelectedSlotFee(0);
  }, [formData.department]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.doctorId || !formData.appointmentDate) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const res = await axios.get("http://localhost:5000/api/schedule/get", {
          params: {
            doctorId: formData.doctorId,
            date: formData.appointmentDate
          }
        });
        setAvailableSlots(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Slot fetch error:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
    setFormData(prev => ({ ...prev, timeSlot: "" }));
    setSelectedSlotFee(0);
  }, [formData.doctorId, formData.appointmentDate]);

  useEffect(() => {
    if (!formData.doctorId) {
      setSelectedDoctor(null);
      return;
    }

    const doctor = doctors.find(doc => doc._id === formData.doctorId);
    setSelectedDoctor(doctor || null);
  }, [formData.doctorId, doctors]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "medicalReport") {
      setFormData(prev => ({ ...prev, medicalReport: files && files[0] ? files[0] : null }));
      return;
    }

    if (name === "timeSlot") {
      const slot = availableSlots.find(s => s.time === value);
      setSelectedSlotFee(slot ? slot.fee : 0);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patientName || !formData.department || !formData.doctorId || !formData.appointmentDate || !formData.timeSlot) {
      toast.error("Please fill all required booking fields.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Login expired. Please login again.");
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append("patientName", formData.patientName);
      data.append("doctorId", formData.doctorId);
      data.append("doctorName", selectedDoctor?.name || "");
      data.append("department", formData.department);
      data.append("appointmentDate", formData.appointmentDate);
      data.append("timeSlot", formData.timeSlot);
      data.append("age", formData.age);
      data.append("bloodGroup", formData.bloodGroup);
      data.append("symptoms", formData.symptoms);
      if (formData.medicalReport) {
        data.append("medicalReport", formData.medicalReport);
      }

      const res = await axios.post("http://localhost:5000/api/appointments", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.status === 201 || res.data.success) {
        toast.success("Appointment booked successfully.");
        if (typeof onBooked === "function") onBooked();
        setFormData({
          patientName: "",
          age: "",
          bloodGroup: "",
          department: "",
          doctorId: "",
          appointmentDate: "",
          timeSlot: "",
          symptoms: "",
          medicalReport: null
        });
        setDoctors([]);
        setAvailableSlots([]);
        setSelectedDoctor(null);
        setSelectedSlotFee(0);
        setView("dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book appointment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeIn space-y-6 pb-10 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Manual Appointment Booking</h2>
          <p className="text-slate-400 text-sm font-medium">Book on behalf of walk-in patients directly from admin panel.</p>
        </div>
        <button type="button" onClick={() => setView("dashboard")} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition shadow-sm w-full sm:w-auto">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="xl:col-span-2 bg-white rounded-[2rem] shadow-sm border border-gray-50 p-8 space-y-6">
          <h3 className="text-lg font-black text-slate-800">Appointment Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Patient Name *</label>
              <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter patient full name" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Department *</label>
              <select name="department" value={formData.department} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select Department</option>
                <option value="General Checkup">General Checkup</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Age" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Doctor *</label>
              <select name="doctorId" value={formData.doctorId} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required disabled={!formData.department || loadingDoctors}>
                <option value="">{loadingDoctors ? "Loading doctors..." : "Select Doctor"}</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>{doc.name}</option>
                ))}
                {!loadingDoctors && formData.department && doctors.length === 0 && (
                  <option value="" disabled>No doctors found in this department</option>
                )}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Date *</label>
                <input type="date" name="appointmentDate" min={today} value={formData.appointmentDate} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Time Slot *</label>
                <select name="timeSlot" value={formData.timeSlot} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required disabled={!formData.appointmentDate || loadingSlots}>
                  <option value="">{loadingSlots ? "Loading..." : "Select"}</option>
                  {availableSlots.map((slot, index) => (
                    <option key={index} value={slot.time} disabled={slot.isFull}>
                      {slot.time} {slot.isFull ? "(Full)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Symptoms / Notes</label>
            <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[110px] outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter symptoms or reception notes"></textarea>
          </div>

          <div
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="border-2 border-dashed border-blue-100 rounded-2xl p-6 text-center hover:bg-blue-50 transition-colors cursor-pointer group"
          >
            <input
              type="file"
              name="medicalReport"
              ref={fileInputRef}
              onChange={handleChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <FaPaperclip className="mx-auto text-blue-400 text-xl mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-bold text-slate-700">
              {formData.medicalReport ? formData.medicalReport.name : "Upload Previous Medical Report"}
            </p>
            <p className="text-xs text-slate-400 mt-1 uppercase">PDF, JPG, JPEG, PNG</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={saving} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? "Booking..." : "Confirm Booking"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  patientName: "",
                  age: "",
                  bloodGroup: "",
                  department: "",
                  doctorId: "",
                  appointmentDate: "",
                  timeSlot: "",
                  symptoms: "",
                  medicalReport: null
                });
                setDoctors([]);
                setAvailableSlots([]);
                setSelectedDoctor(null);
                setSelectedSlotFee(0);
              }}
              className="px-8 py-3 bg-white border border-gray-200 text-slate-600 font-bold rounded-xl hover:bg-gray-50 transition"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6">
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Doctor Details</h4>
            {selectedDoctor ? (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
                  {selectedDoctor.name?.charAt(0) || "D"}
                </div>
                <p className="text-lg font-black text-slate-800 leading-tight">{selectedDoctor.name}</p>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{selectedDoctor.department}</p>
                <div className="grid grid-cols-1 gap-4 text-sm pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase">Experience</p>
                    <p className="text-slate-700 font-bold">{selectedDoctor.experience || 0} yrs</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 font-medium">Select department and doctor to view details.</p>
            )}
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6">
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Booking Summary</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[11px]">Patient</span>
                <span className="text-slate-700 font-bold">{formData.patientName || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[11px]">Slot Fee</span>
                <span className="text-slate-800 font-black">Rs {selectedSlotFee}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-slate-700 font-black uppercase text-[11px]">Total</span>
                <span className="text-xl font-black text-slate-800">Rs {selectedSlotFee}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 768);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [view, setView] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [deletedDoctors, setDeletedDoctors] = useState([]);
  const [appointmentsTab, setAppointmentsTab] = useState("All");
  const [trafficMonths, setTrafficMonths] = useState("6");
  const [trafficStatus, setTrafficStatus] = useState("All");

  const [doctorData, setDoctorData] = useState({
    firstName: "", middleName: "", lastName: "",
    username: "", password: "",
    email: "", phone: "", department: "",
    specialization: "", experience: "", education: ""
  });

  const [patientData, setPatientData] = useState({
    name: "", email: "", password: "", phone: "", gender: "", address: ""
  });

  useEffect(() => {
    fetchDashboardStats();
  }, [view]);

  useEffect(() => {
    if (view === "patients") {
      fetchPatients();
    }
  }, [view]);

  useEffect(() => {
    if (view === "deletedDoctors") {
      fetchDeletedDoctors();
    }
  }, [view]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [docRes, aptRes, patientRes] = await Promise.allSettled([
        axios.get("http://localhost:5000/api/doctors/all", config),
        axios.get("http://localhost:5000/api/appointments", config),
        axios.get("http://localhost:5000/api/auth/patients", config)
      ]);

      const doctorsList = docRes.status === "fulfilled" && Array.isArray(docRes.value.data) ? docRes.value.data : [];
      const appointmentsList = aptRes.status === "fulfilled" && Array.isArray(aptRes.value.data) ? aptRes.value.data : [];
      const patientsListFromApi = patientRes.status === "fulfilled" && Array.isArray(patientRes.value.data) ? patientRes.value.data : [];

      // Fallback when /api/auth/patients is unavailable (e.g., backend not restarted yet).
      const inferredPatientCount = new Set(
        appointmentsList.map((a) => a.user || a.patientName).filter(Boolean)
      ).size;
      const patientsList = patientsListFromApi.length > 0 ? patientsListFromApi : [];
      
      setDoctors(doctorsList);
      setAppointments(appointmentsList);
      setPatients(patientsList);

      setStats({
        doctors: doctorsList.length,
        patients: patientsListFromApi.length > 0 ? patientsList.length : inferredPatientCount,
        appointments: appointmentsList.length
      });

      if (patientRes.status === "rejected") {
        console.warn("Patients API unavailable. Using appointment-based patient count fallback.");
      }
    } catch (error) {
      console.error("Dashboard Stats Error:", error);
      toast.error("Failed to load dashboard data.");
    }
  };

  const handleDoctorChange = (e) => {
    setDoctorData({ ...doctorData, [e.target.name]: e.target.value });
  };

  const handlePatientChange = (e) => {
    setPatientData({ ...patientData, [e.target.name]: e.target.value });
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/patients", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Patients fetch error:", error);
      setPatients([]);
    }
  };

  const fetchDeletedDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/doctors/deleted", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setDeletedDoctors(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Deleted doctors fetch error:", error);
      setDeletedDoctors([]);
      toast.error("Failed to load deleted doctors.");
    }
  };

  const handleSaveDoctor = async (e) => {
    if (e) e.preventDefault();
    if (!doctorData.firstName || !doctorData.lastName || !doctorData.email || !doctorData.password || !doctorData.department) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = { ...doctorData, experience: Number(doctorData.experience) || 0, fees: 500 };
      const response = await axios.post("http://localhost:5000/api/doctors/add", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success) {
        toast.success("Doctor saved successfully!");
        fetchDashboardStats(); 
        setView("dashboard");
        setDoctorData({ firstName: "", middleName: "", lastName: "", username: "", password: "", email: "", phone: "", department: "", specialization: "", experience: "", education: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save doctor.");
    }
  };

  const handleSavePatient = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", patientData);
      if (response.status === 201 || response.data.success) {
        toast.success("Patient registered successfully!");
        fetchDashboardStats();
        setView("dashboard");
        setPatientData({ name: "", email: "", password: "", phone: "", gender: "", address: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register patient.");
    }
  };

  const handleDeleteDoctor = async (doctor) => {
    const name = doctor?.name || "this doctor";
    const confirmed = window.confirm(`Delete ${name}? The doctor will not be able to login, but history will remain.`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/doctors/${doctor._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      toast.success("Doctor deleted successfully.");
      fetchDashboardStats();
      if (view === "deletedDoctors") {
        fetchDeletedDoctors();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete doctor.");
    }
  };

  const menuItems = [
    { type: "label", label: "MAIN" },
    { icon: FaTachometerAlt, label: "Dashboard", viewTarget: "dashboard" },
    { icon: FaCalendarCheck, label: "Appointments", viewTarget: "appointments" },
    { type: "label", label: "PEOPLE" },
    { icon: FaUserMd, label: "Doctors", viewTarget: "doctors" },
    { icon: FaUsers, label: "Patients", viewTarget: "patients" },
    { type: "label", label: "ADMIN" },
    { icon: FaThLarge, label: "Departments", viewTarget: "departments" },
    { icon: FaTrash, label: "Deleted Doctors", viewTarget: "deletedDoctors" },
  ];

  const quickActions = [
    { icon: FaPlusCircle, label: "Book Appointment", color: "bg-blue-600", action: () => setView("bookAppointment") },
    { icon: FaUserMd, label: "Add Doctor", color: "bg-blue-500", action: () => setView("addDoctor") },
    { icon: FaUserPlus, label: "Add Patient", color: "bg-blue-400", action: () => setView("addPatient") },
    { icon: FaCalendarCheck, label: "View Appointments", color: "bg-blue-700", action: () => setView("appointments") },
  ];

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredDoctors = doctors.filter((doc) => {
    if (!normalizedSearch) return true;
    return [doc.name, doc.department, doc.specialization, doc.phone, doc.email]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

  const filteredPatients = patients.filter((patient) => {
    if (!normalizedSearch) return true;
    return [patient.name, patient.email, patient.phone, patient.gender, patient.address]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

  const filteredQuickActions = quickActions.filter((action) => {
    if (!normalizedSearch) return true;
    return action.label.toLowerCase().includes(normalizedSearch);
  });

  const filteredAppointments = appointments.filter((apt) => {
    if (!normalizedSearch) return true;
    return [apt.patientName, apt.doctorName, apt.department, apt.appointmentDate, apt.timeSlot, apt.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

  const filteredDeletedDoctors = deletedDoctors.filter((doc) => {
    if (!normalizedSearch) return true;
    return [doc.name, doc.department, doc.specialization, doc.email, doc.phone]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

  const searchPlaceholder = view === "doctors"
    ? "Search doctor by name, dept..."
    : view === "patients"
      ? "Search patient by name, email..."
      : view === "dashboard"
        ? "Search quick actions..."
        : view === "appointments"
          ? "Search patient, doctor, date..."
        : view === "departments"
          ? "Search department..."
        : view === "deletedDoctors"
          ? "Search deleted doctor..."
        : "Search records...";

  const filteredDepartmentDoctors = doctors.filter((doc) => {
    if (!normalizedSearch) return true;
    return [doc.department, doc.specialization, doc.name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

  const trafficChartData = useMemo(() => {
    const monthsCount = Number(trafficMonths) || 6;
    const now = new Date();
    const months = Array.from({ length: monthsCount }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1 - i), 1);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        month: date.toLocaleDateString("en-US", { month: "short" }),
        patients: 0
      };
    });

    const monthMap = months.reduce((acc, item) => {
      acc[item.key] = item;
      return acc;
    }, {});

    appointments.forEach((apt) => {
      if (trafficStatus !== "All" && apt.status !== trafficStatus) return;
      const date = new Date(apt.appointmentDate);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap[key]) {
        monthMap[key].patients += 1;
      }
    });

    return months.map(({ month, patients }) => ({ month, patients }));
  }, [appointments, trafficMonths, trafficStatus]);

  const demographicChartData = useMemo(() => {
    const pendingCount = appointments.filter((apt) => apt.status === "Pending" || apt.status === "Confirmed").length;
    return [
      { name: "Doctors", value: doctors.length },
      { name: "Patients", value: stats.patients },
      { name: "Pending", value: pendingCount }
    ];
  }, [appointments, doctors.length, stats.patients]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleStatCardClick = (targetView) => {
    const menuMap = {
      doctors: "Doctors",
      patients: "Patients",
      appointments: "Appointments"
    };

    if (menuMap[targetView]) {
      setActiveMenu(menuMap[targetView]);
    }
    setView(targetView);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#eaf2ff] via-[#f4f8ff] to-[#edf4ff] font-sans text-left relative overflow-x-hidden">
      <div className={`${isCollapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "translate-x-0 w-64"} fixed md:static inset-y-0 left-0 bg-gradient-to-b from-blue-700 to-blue-900 text-white min-h-screen shadow-2xl transition-all duration-300 ease-in-out flex flex-col z-50 shrink-0`}>
        <div className={`h-20 px-6 border-b border-blue-600/50 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && <h2 className="text-xl font-bold flex items-center space-x-3 whitespace-nowrap overflow-hidden italic"><FaHospitalUser /><span>MediConnect</span></h2>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none">{isCollapsed ? <FaBars size={20} /> : <FaChevronLeft size={20} />}</button>
        </div>
        <nav className="mt-4 px-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar text-left">
          {menuItems.map((item, index) => (
            item.type === "label" ? (!isCollapsed && <p key={index} className="text-[10px] font-bold text-blue-300 px-4 mt-4 mb-1 tracking-widest uppercase">{item.label}</p>) : (
              <button 
                key={index} 
                onClick={() => { setActiveMenu(item.label); if(item.viewTarget) setView(item.viewTarget); }} 
                className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl transition-all duration-200 ${activeMenu === item.label ? "bg-white/20 shadow-inner" : "hover:bg-white/10"}`}
              >
                <div className="flex-shrink-0"><item.icon size={20} /></div>{!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )
          ))}
        </nav>
        <div className="px-3 pb-6 border-t border-blue-600/50 pt-4 text-left">
          <button onClick={handleLogout} className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-100`}>
            <div className="flex-shrink-0"><FaSignOutAlt size={20} /></div>{!isCollapsed && <span className="font-medium">Logout</span>}
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

      <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden min-h-screen text-left w-full">
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-4 md:px-8 flex justify-between items-center shrink-0 gap-3">
          <button
            type="button"
            className="md:hidden p-2 rounded-lg border border-gray-200 text-slate-600"
            onClick={() => setIsCollapsed(false)}
            aria-label="Open sidebar"
          >
            <FaBars size={16} />
          </button>
          <div className="relative hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="bg-gray-50 border border-gray-200 rounded-full py-2 px-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all focus:w-80"
            />
            <FaTachometerAlt className="absolute left-4 top-3 text-gray-300 text-xs" />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 md:border-l md:pl-6 md:border-gray-100 text-right ml-auto">
               <div className="hidden sm:block">
                 <p className="text-sm font-bold text-gray-800 leading-none">Admin Master</p>
                 <p className="text-[10px] text-blue-600 mt-1 uppercase font-bold tracking-tighter">Super Admin Profile</p>
               </div>
               <img src="https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff" alt="profile" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-blue-100" />
          </div>
        </header>

        <main className="p-4 md:p-8 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="relative block md:hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="bg-white border border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <FaTachometerAlt className="absolute left-4 top-4 text-gray-300 text-xs" />
          </div>

          {view === "dashboard" && (
            <DashboardHome
              quickActions={filteredQuickActions}
              stats={stats}
              onStatClick={handleStatCardClick}
              trafficData={trafficChartData}
              demographicData={demographicChartData}
              trafficMonths={trafficMonths}
              trafficStatus={trafficStatus}
              onTrafficMonthsChange={setTrafficMonths}
              onTrafficStatusChange={setTrafficStatus}
            />
          )}
          {view === "doctors" && <DoctorsList doctors={filteredDoctors} setView={setView} onDeleteDoctor={handleDeleteDoctor} />}
          {view === "patients" && <PatientsList patients={filteredPatients} appointments={appointments} />}
          {view === "appointments" && <AppointmentsList appointments={filteredAppointments} activeTab={appointmentsTab} setActiveTab={setAppointmentsTab} setView={setView} />}
          {view === "departments" && <DepartmentsList doctors={filteredDepartmentDoctors} />}
          {view === "deletedDoctors" && <DeletedDoctorsList doctors={filteredDeletedDoctors} />}
          {view === "addDoctor" && <AddDoctorForm setView={setView} doctorData={doctorData} handleDoctorChange={handleDoctorChange} handleSaveDoctor={handleSaveDoctor} />}
          {view === "addPatient" && <AddPatientForm setView={setView} patientData={patientData} handlePatientChange={handlePatientChange} handleSavePatient={handleSavePatient} />}
          {view === "bookAppointment" && <AdminBookAppointmentForm setView={setView} onBooked={fetchDashboardStats} />}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default AdminDashboard;