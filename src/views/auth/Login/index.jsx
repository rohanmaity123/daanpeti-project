import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi } from '../../../actions/authAction';
import Validation from '../../../utils/Validation';
import Cookie from '../../../utils/Cookie';
import LoadingScreen from '../../../components/LoadingScreen';
import TermConditionModal from '../../../components/Modals/TermConditionModal'
import useGlobalStore from "../../../hooks/useGlobalStore";
import { Helmet } from 'react-helmet';
import useAuth from '../../../hooks/useAuth';
import Loader from '../../../utils/Loader';
import Reducer from '../../../services/Reducer';

import EmailIcon from '@mui/icons-material/Email';
import HttpsIcon from '@mui/icons-material/Https';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import toast from 'react-hot-toast';
import SiteLayout from '../../../layouts/SiteLayout';


const initState = {
  email: '',
  password: '',
  agree: '',
  loading: false,
  validate: false
};

const loginErrState = {
  accountnotExist: false,
  emailErrBlank: false,
  IsValidEmail: false,
  IsExistEmail: false,
  IsBlockedEmail: false,
  IsYourLoginCredentials: false,
  passErrBlank: false,
  IsValidPass: false,
  agreeErrBlank: false
};


const Login = () => {
  const { Login } = useAuth();
  const { TOGGLE_TERM_CONDITION_MODAL, } = useGlobalStore();
  const navigator = useNavigate();
  const [state, dispatch] = useReducer(Reducer, initState);
  const [stateForErr, dispatchForErr] = useReducer(Reducer, loginErrState);

  useEffect(() => {
    //Page Up
    // tt.success('Here is your toast.')
    // tt.error('Here is your toast.')

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, []);



  // const dispatch = useDispatch()

  const [togglePassword, setTogglePassword] = useState(false)

  //TermAcceptModal
  const getValidation = () => {
    return new Promise((resolve) => {
      if (Validation.text(state.email.toLowerCase()) &&
        Validation.email(state.email.toLowerCase()) &&
        Validation.text(state.password)
        // &&
        // Validation.passwordCheck(state.password) 
        // state.agree

      ) {
        resolve(true)
      } else {

        if (!Validation.text(state.email.toLowerCase())) {
          dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'emailErrBlank', value: true } });
          dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsExistEmail', value: false } });
          dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsBlockedEmail', value: false } });
          dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsYourLoginCredentials', value: false } });
          console.log('email')
        } else if (!Validation.email(state.email.toLowerCase())) {
          dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsValidEmail', value: true } });
          dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsExistEmail', value: false } });
          dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsBlockedEmail', value: false } });
          dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsYourLoginCredentials', value: false } });
        }
        if (!Validation.text(state.password)) {
          dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'passErrBlank', value: true } });
          console.log('password')
        }
        // else if (!Validation.passwordCheck(state.password)) {
        //   dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsValidPass', value: true } });
        //   console.log('password2')
        // }

        if (!state.agree) {
          dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'agreeErrBlank', value: true } });
          console.log('Agree')
        }
        resolve(false)
      }
    });
  };
  const getData = (e) => {
    if (e.target.name === "email") {

      if (!Validation.text(e.target.value.toLowerCase())) {
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'emailErrBlank', value: true } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsValidEmail', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsExistEmail', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsBlockedEmail', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsYourLoginCredentials', value: false } });
        console.log('email')
      } else if (!Validation.email(e.target.value.toLowerCase())) {
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'emailErrBlank', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsValidEmail', value: true } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsYourLoginCredentials', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsExistEmail', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsBlockedEmail', value: false } });

      } else {

        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsYourLoginCredentials', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsBlockedEmail', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsExistEmail', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'emailErrBlank', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsValidEmail', value: false } });
      }
    }

    if (e.target.name === "password") {
      if (!Validation.text(e.target.value)) {
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'passErrBlank', value: true } });
        //False
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsValidPass', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsExistEmail', value: false } });
        // console.log('password')
        // } else if (!Validation.passwordCheck(e.target.value)) {
        //   dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsValidPass', value: true } });
        //   dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'passErrBlank', value: false } });
        //   dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsExistEmail', value: false } });
        //   console.log('password2')
      } else {
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsValidPass', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'passErrBlank', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsExistEmail', value: false } });
      }
    }

    dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'accountnotExist', value: false } });
    dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsBlockedEmail', value: false } });
    dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsYourLoginCredentials', value: false } });

    if (e.target.name === "agree") {
      dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'agreeErrBlank', value: false } });
    }

    if (e.target.name === "agree") {
      dispatch({ type: "ONCHANGE_CHECKBOX", payload: e })
    } else {
      dispatch({ type: "ONCHANGE", payload: e })
    }
  }

  // Login Function
  const onLogin = async (e) => {
    e.preventDefault();
    dispatch({ type: 'VALIDATE', payload: true });
    // toast("Default Notification !");
    // toast.success("success Notification !");
    // toast.error("error Notification !");
    // toast.warn("warn Notification !");
    // toast.info("info Notification !");

    let validationStatus = await getValidation();
    if (validationStatus) {
      dispatch({ type: 'LOAD', payload: true });

      try {
        let responce = await loginApi({ email: state.email.toLowerCase(), password: state.password });
        console.log('responce', responce)
        dispatch({ type: 'LOAD', payload: false });
        if (responce?.data?.status) {
          Cookie.setCookie('_tokenAuth', responce?.data?.data?.token, 1);
          localStorage.setItem('isAuthenticated', true)
          localStorage.setItem('token', responce?.data?.data?.token)
          navigator(`/user/dashboard`)
          // navigator('/login-with-otp')
        }
        // else if (responce.data.status === 200 && responce.data.data.roles && responce.data.data.roles.length > 0 && responce.data.data.roles[0].id !== 1) {
        //   dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsYourLoginCredentials', value: true } });
        // }
        if (responce && responce?.status === 401) {
          toast.error(responce?.data?.message);
        } else if (responce && responce?.status === 422) {
          responce?.data?.errors?.password?.forEach(error => {
            toast.error(error);
          });
        }

      } catch (err) {
        // navigator(`/dashboard`)
        dispatch({ type: 'LOAD', payload: false });
        console.log("Inside catch block login: ---", err);

      }
    }
  };

  // console.log(state)
  return (
    <SiteLayout>
      <Helmet>
        <title>Login</title>
      </Helmet>
      <>
        {TOGGLE_TERM_CONDITION_MODAL && state.termConditionAcceptModalType && <TermConditionModal type={state.termConditionAcceptModalType} />}


        <section className="beforeLoginSection">
          <div className="beforeLoginRow">

            <div className="beforeLoginInner">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img
                  src={'/images/logo.jpeg'}
                  style={{ height: '100px', width: '100px' }}
                  alt="Logo"
                />
              </div>
              <h3>Login to Your Account</h3>
              {/* <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p> */}
              <form
              // onSubmit={formik.handleSubmit}
              >
                <div className="fomrGroup">
                  <label>Email</label>
                  <div className="inputgroup inputgroupLeft">
                    <input
                      style={(stateForErr.emailErrBlank || stateForErr.IsValidEmail || stateForErr.accountnotExist || stateForErr.IsYourLoginCredentials) ? { border: "3px solid red" } : { border: "3px solid #eaeeff" }}
                      type="email" name="email"
                      id="email"
                      value={state.email}
                      onChange={getData}
                      // value={formik.values.email} 
                      className="form-control" placeholder="john.doe@gmail.com"
                    //  onChange={formik.handleChange} onKeyDown={handleBlankSpace}
                    />
                    {stateForErr.emailErrBlank &&
                      <p className="error-msg">Email is required.</p>
                    }
                    {stateForErr.IsValidEmail &&
                      <p className="error-msg">Enter valid email.</p>
                    }
                    {stateForErr.accountnotExist &&
                      <p className="error-msg">This email id is not registered with us. Please signup first to login.</p>
                    }
                    {/* {
                                        formik.touched.email && formik.errors.email ? (
                                            <div className="error_txt">
                                                {formik.errors.email}
                                            </div>
                                        ) : null
                                    } */}
                    <span className="leftSide"> <EmailIcon /></span>

                  </div>
                </div>
                <div className="fomrGroup">
                  <label>Password</label>
                  <div className="inputgroup inputgroupLeft inputgroupRight inputgroupBoth">
                    <input
                      id="password"
                      // value={state.password}
                      onChange={getData}
                      style={(stateForErr.passErrBlank || stateForErr.IsValidPass ||
                        stateForErr.IsExistEmail ||
                        stateForErr.IsBlockedEmail || stateForErr.IsYourLoginCredentials)
                        ? { border: "3px solid red" } : { border: "3px solid #eaeeff" }}
                      type={!togglePassword ? "password" : "text"}
                      placeholder="insert your password" name="password"
                      // value={formik.values.password} 
                      className="form-control"
                    // onChange={formik.handleChange} onKeyDown={handleBlankSpace} 
                    />
                    {stateForErr.passErrBlank &&
                      <p className="error-msg">Password is required.</p>
                    }
                    {stateForErr.IsValidPass &&
                      <p className="error-msg">Please enter valid password minimum 8 characters with at least a number,
                        special character and capital letter and small letter.</p>
                    }
                    {stateForErr.IsExistEmail &&
                      <p className="error-msg">Email or password is wrong.</p>
                    }

                    {stateForErr.IsBlockedEmail &&
                      <p className="error-msg">Your account is blocked from admin.</p>
                    }
                    {stateForErr.IsYourLoginCredentials &&
                      <p className="error-msg">You don't have to access it. Contact Super Admin.</p>
                    }
                    {/* {
                                        formik.touched.password && formik.errors.password ? (
                                            <div className="error_txt">
                                                {formik.errors.password}
                                            </div>
                                        ) : null
                                    } */}
                    <span className="leftSide"><HttpsIcon /></span>

                    <span onClick={() => setTogglePassword(!togglePassword)} style={{ cursor: "pointer" }}
                      className="rightSide">
                      {togglePassword ?
                        <VisibilityOutlinedIcon />
                        :
                        <VisibilityOffOutlinedIcon />}
                    </span>

                  </div>
                  <Link to="/forget-pass" className="infoFrgtPass">Forgot Password</Link>
                </div>
                {/* <div className="fomrGroup">
                  <div className="customCheckBox">
                    <input type="checkbox" 
                      id="agree"
                      style={(stateForErr.agreeErrBlank) ? { border: "3px solid red" } : { border: "3px solid #ACB4E4" }}
                      value={state.agree}
                      onChange={getData}
                      name="agree" />
                    <label htmlFor="html">I agree to all statesments included in terms of use</label>
                  </div>
                  {stateForErr.agreeErrBlank &&
                    <p className="error-msg">Please select it.</p>
                  }
                </div> */}
                <button onClick={onLogin} className="themeBtn fullBtn">
                  {
                    state.loading ? <Loader loaderWidth={"30px"}
                      loaderHeight={"30px"}
                      position={"relative"} /> : "Login  Now"
                  }

                </button>
              </form>
              {/* <p className="infoText"><Link to="/login">Already a Member?</Link> </p> */}
            </div>
          </div>
        </section>
        {/* */}
      </>
    </SiteLayout>
  );
}

export default Login;
