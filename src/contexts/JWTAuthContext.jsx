import React, { createContext, useEffect, useReducer } from 'react';
import { ME, register, GoogleRegister } from '../actions/authAction';
import Cookie from '../utils/Cookie';
import LoadingScreen from '../components/LoadingScreen';
import ToastHot from 'react-hot-toast';

const initialAuthState = {
  isAuthenticated: false,
  isInitialised: false,
  user: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIALISE': {
      const { isAuthenticated, user } = action.payload;

      return {
        ...state,
        isAuthenticated,
        isInitialised: true,
        user
      };
    }
    case 'LOGIN': {
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload
      };
    }
    case 'LOGOUT': {
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    }
    case 'userUpdate': {
      return {
        ...state,
        user: action.payload,
      };
    }
    case 'REGISTER': {
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload
      };
    }
    default: {
      return { ...state };
    }
  }
};

const AuthContext = createContext({
  ...initialAuthState,
  LoginWithOTP: () => Promise.resolve(),
  Logout: () => { console.log('Logout') },
  updateUser: () => Promise.resolve(),
  RegisterUser: () => Promise.resolve(),
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState);


  const Logout = async () => {

    sessionStorage.clear();
    // window.cookies.clear()
    Cookie.deleteCookie('_tokenAuth')
    // handleLogout(instance)
    dispatch({ type: 'LOGOUT' });


  };

  const updateUser = (user) => {
    dispatch({ type: 'userUpdate', payload: user })

  }

  const RegisterUser = async (payload, type = 'normalRegister') => {
    if (type === 'normalRegister') {
      const response = await register(payload);
      console.log("Register response: ---------", response)
      if (response) {
        if (response.data.status === 200) {
          // ToastHot.success("Successfully registered with us");

          // Cookie.setCookie('_tokenAuth', response.data.token, 1);
          // dispatch({type: 'REGISTER', payload: response.data.user_data})
          console.log(`Successfully registered with us`)
          return response;
        } else {
          return response;
        }
      } else {
        ToastHot.error("Something went wrong");

      }
    } else {
      const response = await GoogleRegister(payload);
      console.log("Register response: ---------", response)
      if (response) {
        if (response.data.status === 200) {
          ToastHot.success("Successfully registered with us");
          Cookie.setCookie('_tokenAuth', response.data.user_data.token_data.access_tokenAuth, 1);
          dispatch({ type: 'REGISTER', payload: response.data.user_data.user })
          return response;
        } else {
          return response;
        }
      } else {
        ToastHot.error("Something went wrong");

      }
    }

  };

  useEffect(() => {
    const initialise = async () => {
      try {
        const accessToken = Cookie.getCookie('_tokenAuth');

        if (accessToken) {
          Cookie.setCookie('_tokenAuth', accessToken, 1);
          // call user details api
          const response = await ME();

          if (response?.data?.status) {
            dispatch({
              type: 'INITIALISE',
              payload: {
                isAuthenticated: true,
                user: response.data.data
              }
            });
            // if (response.data.data && !response.data.data.isPasswordModified) {
            //   navigate('/reset-pass')
            // }
          } else {
            Logout()
            window.location.href = "/login";
            ToastHot.error("Something went wrong, Server error");
          }
        } else {
          dispatch({
            type: 'INITIALISE',
            payload: {
              isAuthenticated: false,
              user: null,
            }
          });
        }
      } catch (err) {
        ToastHot.error("Something went wrong, Server error", err);
        dispatch({
          type: 'INITIALISE',
          payload: {
            isAuthenticated: false,
            user: null
          }
        });
      }


    };

    initialise();
  }, []);

  if (!state.isInitialised) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        Logout,
        updateUser,
        RegisterUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
