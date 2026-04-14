import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const LandingPage = () => {
  const navigate = useNavigate();


  return (
    <>
      <Helmet>
        <title> LandingPage</title> 
      </Helmet>
      <>


        <h1 >LandingPage</h1>
        
        <button onClick={() => { navigate('/login') }} className="textLink">Log in</button>
        <button onClick={() => { navigate('/register') }} className="textLink">Sign up</button>
      </>
    </>
  );
}

export default LandingPage;
