import React from 'react';

const LoadingScreen = (props) => {
  return <div className={props && props.customClass ? props.customClass : "loadingScreen"}>
  <div className="loaderBox">
    {/* <img src="/images/progress.gif" alt="loading" /> */}
    </div>
  </div>;
};

export default LoadingScreen;
