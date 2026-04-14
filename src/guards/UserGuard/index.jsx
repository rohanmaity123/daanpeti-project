/* eslint-disable radix */
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ME } from '../../actions/authAction';
import { setAuthUserState } from '../../redux/slice/user';
import LoadingScreen from '../../components/LoadingScreen';

const UserGuard = ({ children }) => {
  // const { isAuthenticated, user } = useAuth();
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // let localAuthentication = localStorage.getItem('isAuthenticated')
  // let token = localStorage.getItem('token')

  // if (!isAuthenticated && user === null) {
  //   return <Navigate to="/login" />;
  // }

  useEffect(() => {
    const getmyData = async () => {
      dispatch({ type: 'LOAD', payload: true });
      try {
        let responce = await ME();
        if (responce?.data?.status) {
          console.log('responce?.data?.data', responce?.data)
          dispatch(setAuthUserState({
            isAuthenticated: "authenticated",
            isInitialized: true,
            user: responce?.data?.data,
          }))

          dispatch({ type: 'LOGIN', payload: responce?.data?.data })
          dispatch({ type: 'LOAD', payload: false });
        }
        if (responce && responce?.status === 401) {
          dispatch({ type: 'LOAD', payload: false });
          navigate('/login')
        } else if (responce && responce?.status === 422) {
          dispatch({ type: 'LOAD', payload: false });
          navigate('/login')
        }

      } catch (err) {
        console.log("Inside catch block login: ---", err);
        navigate('/login')
      }
    }
    getmyData()
  }, [])

  return (
    <>
      {children}
    </>
  );
};

export default UserGuard;
