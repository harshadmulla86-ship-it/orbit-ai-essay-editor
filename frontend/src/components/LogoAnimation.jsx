import React from "react";
import Lottie from "lottie-react";

const LogoAnimation = ({ size = 120 }) => {
  return (
    <div className="flex justify-center items-center logo-glow animate-pulse">
      <Lottie
        animationData={null}
        path="https://lottie.host/b0afb2fe-f10f-403b-b61b-41086badbf45/U9tI3GGAyB.lottie"
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default LogoAnimation;
