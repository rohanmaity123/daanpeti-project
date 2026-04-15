import React from 'react';

const LoadingScreen = (props) => {
  return (
    <div className={props && props.customClass ? props.customClass : "loadingScreen"}>
      <div className="loaderBox flex min-h-screen items-center justify-center">
        <img src="/logo.svg" alt="DaanPeti" className="h-[120px] w-[120px] object-contain" />
      </div>
    </div>
  );
};

export default LoadingScreen;
