import React from "react";
import Lottie from "lottie-react";

export default function Header() {
  return (
    <header className="flex flex-col items-center justify-center text-center py-10 bg-gradient-to-b from-indigo-50 to-white">
      <Lottie
        path="https://lottie.host/b0afb2fe-f10f-403b-b61b-41086badbf45/U9tI3GGAyB.lottie"
        loop
        autoplay
        style={{ width: 180, height: 180 }}
      />
      <h1 className="text-4xl font-bold text-indigo-700 mt-4">
        Orbit AI Essay Editor
      </h1>
      <p className="text-gray-600 mt-2">
        AI-powered essay analysis with smart feedback and modern UI ✨
      </p>
    </header>
  );
}
