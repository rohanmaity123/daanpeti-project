/* eslint-disable radix */
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ME } from '../../actions/authAction';
import { setAuthUserState } from '../../redux/slice/user';

const GuestGuard = ({ children }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  // const { isAuthenticated,user } = useSelector((state) => state.user);

  // let localAuthentication =  localStorage.getItem('isAuthenticated')
  // let token = localStorage.getItem('token')
  // if (!isAuthenticated && user === null) {
  //   return <Navigate to="/login" />;
  // }
  const navigate = useNavigate()

  useEffect(() => {
    const getmyData = async () => {
      try {
        setLoading(true)
        let responce = await ME();
        console.log('responce', responce)
        if (responce?.data?.status === 200) {
          localStorage.setItem('isAuthenticated', true)
          dispatch(setAuthUserState({
            isAuthenticated: "authenticated",
            isInitialized: true,
            user: responce?.data?.data,
          }))
          setLoading(false)
          navigate('/login')
        }
        if (responce && responce?.status === 401) {
          setLoading(false)
          navigate('/login')
        } else if (responce && responce?.status === 422) {
          setLoading(false)
          navigate('/login')
        }

      } catch (err) {
        console.log("Inside catch block login: ---", err);
        setLoading(false)
        navigate('/login')
      }
    }
    // getmyData()
  }, [])

  // if (loading) {
  //   return <LoadingScreen />
  // }
  // if (isAuthenticated === 'disconnected' && user === null) {
  //   return <Navigate to="/login" />;
  // }
  return (
    <>
      {children}
    </>
  );
};


export default GuestGuard;
