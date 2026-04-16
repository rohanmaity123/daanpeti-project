import { Loader } from 'lucide-react';
import React from 'react';

const LoadingScreen = ({ customClass }) => {
  return (
    <div className={customClass ? customClass : "loadingScreen"}>
      <div className="loaderBox flex min-h-screen items-center justify-center ">

        <div className="relative flex flex-col items-center">

          {/* Glow effect */}
          <div className="absolute h-40 w-40 rounded-full bg-primary/20 blur-3xl animate-pulse"></div>

          {/* Logo */}
          {/* <img
            src="/logo.svg"
            alt="DaanPeti"
            className="relative h-[110px] w-[110px] object-contain animate-float"
          /> */}
          <Loader className="relative h-12 w-12 text-primary animate-spin" />
          {/* Text */}
          <p className="mt-4 text-sm text-muted-foreground animate-fade">
            Loading your experience...
          </p>

        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;