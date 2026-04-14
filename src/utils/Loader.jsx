import React from 'react';

const Loader = ({ position, width, height, loaderWidth, loaderHeight }) => {
  return (<div style={{ width: `${width ? width : "100%"}`, height: `${height ? height : "100%"}`, position: `${position ? position : "fixed"}` }} className="loadingScreen">
    <div style={{ width: `${loaderWidth ? loaderWidth : "100%"}`, height: `${loaderHeight ? loaderHeight : "100%"}` }} className="loaderBox">
    </div>
  </div>);
};

export default Loader;