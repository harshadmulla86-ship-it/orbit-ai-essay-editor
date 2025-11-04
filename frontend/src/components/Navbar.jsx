import React from "react";

export default function Navbar({ dark, onToggle }) {
  return (
    <header
      className={`w-full py-4 px-6 flex justify-between items-center shadow-md transition-colors duration-500 ${
        dark
          ? "bg-gray-900 text-gray-100 border-b border-gray-700"
          : "bg-gradient-to-r from-indigo-600 to-purple-500 text-white"
      }`}
    >
      <h1 className="text-lg font-semibold tracking-wide">
        Orbit AI Essay Editor
      </h1>

      <button
        onClick={onToggle}
        className={`px-4 py-2 rounded-lg transition-all duration-300 ${
          dark
            ? "bg-gray-800 hover:bg-gray-700 text-gray-100"
            : "bg-white text-gray-800 hover:bg-gray-200"
        }`}
      >
        {dark ? "Light Mode" : "Dark Mode"}
      </button>
    </header>
  );
}
