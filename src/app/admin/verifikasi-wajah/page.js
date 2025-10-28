"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, Clock, MapPin, Calendar } from "lucide-react";

// Get today's date for comparison
const today = new Date();
today.setHours(0, 0, 0, 0);

// Sample test locations
const testLocations = [
  { id: 1, name: "Gedung A - Jakarta Pusat" },
  { id: 2, name: "Gedung B - Jakarta Selatan" },
  { id: 3, name: "Gedung C - Jakarta Timur" },
  { id: 4, name: "Gedung D - Jakarta Barat" },
];

// Generate dates for dummy data
const getDate = (daysOffset) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
};

// Sample test schedules
const testSchedules = [
  {
    id: 1,
    date: getDate(-3),
    time: "08:00 - 10:00",
    room: "Ruang 101",
    participants: 50,
  },
  {
    id: 2,
    date: getDate(-2),
    time: "10:30 - 12:30",
    room: "Ruang 102",
    participants: 45,
  },
  {
    id: 3,
    date: getDate(-1),
    time: "13:00 - 15:00",
    room: "Ruang 103",
    participants: 60,
  },
  {
    id: 4,
    date: getDate(0), // Today
    time: "08:00 - 10:00",
    room: "Ruang 104",
    participants: 55,
  },
  {
    id: 5,
    date: getDate(1),
    time: "10:30 - 12:30",
    room: "Ruang 105",
    participants: 48,
  },
  {
    id: 6,
    date: getDate(2),
    time: "13:00 - 15:00",
    room: "Ruang 106",
    participants: 52,
  },
  {
    id: 7,
    date: getDate(3),
    time: "08:00 - 10:00",
    room: "Ruang 107",
    participants: 58,
  },
];

// Helper function to determine schedule status
const getScheduleStatus = (scheduleDate) => {
  const compareDate = new Date(scheduleDate);
  compareDate.setHours(0, 0, 0, 0);

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  if (compareDate < todayDate) return "past";
  if (compareDate.getTime() === todayDate.getTime()) return "ongoing";
  return "upcoming";
};

// Format date to Indonesian format
const formatDate = (date) => {
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return new Intl.DateTimeFormat("id-ID", options).format(date);
};

// Schedule Card Component
function ScheduleCard({ schedule }) {
  const status = getScheduleStatus(schedule.date);

  const statusConfig = {
    past: {
      label: "Sudah Lewat",
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
      borderColor: "border-gray-300",
      buttonDisabled: true,
    },
    ongoing: {
      label: "Segera Berlangsung",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-300",
      buttonDisabled: false,
    },
    upcoming: {
      label: "Akan Berlangsung",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-300",
      buttonDisabled: true,
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`border-2 ${config.borderColor} rounded-xl p-6 ${config.bgColor} transition-all duration-300`}
    >
      {/* Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <span
          className={`${config.textColor} font-semibold text-sm px-3 py-1 rounded-full ${config.bgColor} border ${config.borderColor}`}
        >
          {config.label}
        </span>
      </div>

      {/* Schedule Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-gray-700">
          <Calendar className="w-5 h-5 text-brand-blue" />
          <span className="font-medium">{formatDate(schedule.date)}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Clock className="w-5 h-5 text-brand-blue" />
          <span>{schedule.time} WIB</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <MapPin className="w-5 h-5 text-brand-blue" />
          <span>{schedule.room}</span>
        </div>
        <div className="text-gray-600 text-sm">
          Jumlah Peserta: <span className="font-semibold">{schedule.participants} orang</span>
        </div>
      </div>

      {/* Button */}
      {config.buttonDisabled ? (
        <button
          disabled
          className="w-full bg-gray-300 text-gray-500 px-4 py-3 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Buka Kamera
        </button>
      ) : (
        <Link
          href={`/admin/verifikasi-wajah/${schedule.id}`}
          className="block w-full bg-brand-blue hover:bg-opacity-90 text-white px-4 py-3 rounded-lg font-medium transition-all text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" />
            Buka Kamera
          </div>
        </Link>
      )}
    </div>
  );
}

export default function VerifikasiWajahPage() {
  const [selectedLocation, setSelectedLocation] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-block text-brand-blue hover:text-brand-pink transition-colors mb-4"
          >
            ← Kembali ke Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Verifikasi Wajah
          </h1>
          <p className="text-lg text-gray-600">
            Pilih lokasi ujian untuk melihat jadwal verifikasi wajah
          </p>
        </div>

        {/* Location Dropdown */}
        <div className="mb-8">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Lokasi Ujian
          </label>
          <select
            id="location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full md:w-96 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue transition-colors bg-white"
          >
            <option value="">-- Pilih Lokasi --</option>
            {testLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        {/* Schedule Cards */}
        {selectedLocation && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Jadwal Ujian
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testSchedules.map((schedule) => (
                <ScheduleCard key={schedule.id} schedule={schedule} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedLocation && (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Silakan pilih lokasi ujian untuk melihat jadwal
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
