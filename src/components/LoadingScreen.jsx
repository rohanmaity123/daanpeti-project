import React from "react";

const LoadingScreen = ({ customClass, customTitle }) => {
  return (
    <div
      className={
        customClass ||
        "fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-slate-950"
      }
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* Cyan glow */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#20d8ff]/20 blur-[120px] animate-pulse" />

        {/* Pink glow */}
        <div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#ff7cc0]/20 blur-[120px] animate-pulse"
          style={{ animationDelay: "700ms" }}
        />

        {/* Purple glow */}
        <div
          className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8a5cff]/10 blur-[100px] animate-pulse"
          style={{ animationDelay: "300ms" }}
        />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Animated logo container */}
        <div className="relative flex h-28 w-28 items-center justify-center">

          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border border-white/10" />

          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#20d8ff] border-r-[#8a5cff] animate-spin"
            style={{ animationDuration: "1.8s" }}
          />

          {/* Glow */}
          <div className="absolute h-20 w-20 rounded-full bg-[linear-gradient(135deg,#20d8ff,#8a5cff_50%,#ff7cc0)] opacity-30 blur-2xl animate-pulse" />

          {/* Logo circle */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#20d8ff,#8a5cff_50%,#ff7cc0)] shadow-[0_0_45px_rgba(138,92,255,0.35)]">

            {/* School / certificate icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              className="h-10 w-10"
            >
              <path d="M3 10.5 12 5l9 5.5-9 5-9-5Z" />
              <path d="M6 12.5V17c3.5 2.5 8.5 2.5 12 0v-4.5" />
              <path d="M21 10.5V16" />
            </svg>
          </div>
        </div>

        {/* Brand */}
        <div className="mt-7 text-center">

          <h1 className="text-2xl font-black tracking-tight text-white">
            {customTitle || "Loading ....."}
          </h1>

          <p className="mt-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
            Please wait while we prepare your experience
          </p>
        </div>

        {/* Loading indicator */}
        <div className="mt-8 flex flex-col items-center">

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#20d8ff] animate-bounce" />
            <span
              className="h-2 w-2 rounded-full bg-[#8a5cff] animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-2 w-2 rounded-full bg-[#ff7cc0] animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Loading your experience
            <span className="inline-flex w-6">
              <span className="animate-pulse">...</span>
            </span>
          </p>
        </div>

        {/* Bottom status */}
        <div className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-xl">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]" />

          <span className="text-[11px] font-medium text-slate-500">
            Secure connection
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;