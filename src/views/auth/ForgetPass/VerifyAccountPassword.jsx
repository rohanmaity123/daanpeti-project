import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login, loginApi, ResetPassWord } from '../../../actions/authAction';
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
import { setAuthUserState } from '../../../redux/slice/user';
import { useDispatch } from 'react-redux';


const initState = {
  password: '',
  confirmPassword:'',
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
  confirmpassErrBlank:false,
  passNotMatchErr:false,
  IsValidPass: false,
  agreeErrBlank: false
};


const ResetPassword = () => {
  const { Login } = useAuth();
  const navigator = useNavigate();
  const reduxdispatch = useDispatch()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");
  const { TOGGLE_TERM_CONDITION_MODAL, toggleForModal } = useGlobalStore();

  const [state, dispatch] = useReducer(Reducer, initState);
  const [stateForErr, dispatchForErr] = useReducer( Reducer , loginErrState);
  
  console.log('email',email,token)
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
  const goToTermAcceptModal = (type) => {
    dispatch({ type: "SETDATA", payload: { "name": "termConditionAcceptModalType", "value": type } })
    toggleForModal('TOGGLE_TERM_CONDITION_MODAL')
  };
  const getValidation = () => {
    return new Promise((resolve, reject) => {
      if (
        Validation.text(state.password)
        && Validation.text(state.confirmPassword)
        &&
        Validation.passwordConfirmCheck(state.password,state.confirmPassword) 

      ) {
        resolve(true)
      } else {
        if (!Validation.text(state.password)) {
          dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'passErrBlank', value: true } });
          console.log('password')
        }
        else if (!Validation.text(state.confirmPassword)) {
          dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'confirmpassErrBlank', value: true } });
          console.log('password')
        }
        else if (!Validation.passwordConfirmCheck(state.password,state.confirmPassword) ) {
          dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'passNotMatchErr', value: true } });
        }
        resolve(false)
      }
    });
  };
  const getData = (e) => {

    if (e.target.name === "password") {
      if (!Validation.text(e.target.value)) {
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'passErrBlank', value: true } });
        //False
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsValidPass', value: false } });
      } else {
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsValidPass', value: false } });
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'passErrBlank', value: false } });
      }
    }
    if (e.target.name === "confirmPassword") {
      if (!Validation.text(e.target.value)) {
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'confirmpassErrBlank', value: true } });
      } else {
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'confirmpassErrBlank', value: false } });
      }
      if (Validation.passwordConfirmCheck(state.password,state.confirmPassword)) {
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'passNotMatchErr', value: true } });
      }else{
        dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'passNotMatchErr', value: false } });

      }
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
        let responce = await ResetPassWord( {confirm_password: state.confirmPassword,password: state.password,email:email,token:token} ); 
        console.log('responce',responce)
        dispatch({ type: 'LOAD', payload: false });
        if (responce?.data?.status === 200 ) {
          toast.success('Password reset successfully');
          navigator('/login')
        }
        if (responce && responce?.status === 401) {
            toast.error(responce?.data?.message);
        }else if(responce && responce?.status === 422){
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
    <>
      <Helmet>
        <title>Reset Password</title>
      </Helmet>
      <>
        {TOGGLE_TERM_CONDITION_MODAL && state.termConditionAcceptModalType && <TermConditionModal type={state.termConditionAcceptModalType} />}
        

        <section className="beforeLoginSection">
          <div className="beforeLoginRow">
            
            <div className="beforeLoginInner">
              <img src="https://euphoriagenx.com/wp-content/uploads/2022/03/Footer-Logo.png" />
              <h3>Reset Password</h3>
              {/* <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p> */}
              <form>
                <div className="fomrGroup">
                  <label>New Password</label>
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
                    {/* {
                                        formik.touched.password && formik.errors.password ? (
                                            <div className="error_txt">
                                                {formik.errors.password}
                                            </div>
                                        ) : null
                                    } */}
                    <span className="leftSide"><HttpsIcon/></span>

                    <span onClick={() => setTogglePassword(!togglePassword)} style={{ cursor: "pointer" }}
                      className="rightSide">
                        {togglePassword ?
                      <VisibilityOutlinedIcon/>
                      :
                      <VisibilityOffOutlinedIcon/>}
                    </span>

                  </div>
                </div>
                <div className="fomrGroup">
                  <label>Confirm Password</label>
                  <div className="inputgroup inputgroupLeft inputgroupRight inputgroupBoth">
                    <input
                      id="confirmPassword"
                      // value={state.password}
                      onChange={getData}
                      style={(stateForErr.confirmpassErrBlank || stateForErr.passNotMatchErr )
                        ? { border: "3px solid red" } : { border: "3px solid #eaeeff" }}
                      type={"text"}
                      placeholder="confirm your password" name="confirmPassword"
                      // value={formik.values.password} 
                      className="form-control"
                    // onChange={formik.handleChange} onKeyDown={handleBlankSpace} 
                    />
                    {stateForErr.confirmpassErrBlank &&
                      <p className="error-msg">Confirm Password is required.</p>
                    }
                    {stateForErr.passNotMatchErr &&
                      <p className="error-msg">Confirm password not matched</p>
                    }
                    {/* {
                                        formik.touched.password && formik.errors.password ? (
                                            <div className="error_txt">
                                                {formik.errors.password}
                                            </div>
                                        ) : null
                                    } */}
                    <span className="leftSide"><HttpsIcon/></span>
                  </div>
                </div>
                <button onClick={onLogin} className="themeBtn fullBtn">
                  {
                    state.loading ? <Loader loaderWidth={"30px"} 
                    loaderHeight={"30px"} 
                    position={"relative"} /> : "Submit"
                  }

                </button>
              </form>
              {/* <p className="infoText"><Link to="/login">Already a Member?</Link> </p> */}
            </div>
          </div>
        </section>
        {/* */}
      </>
    </>
  );
}

export default ResetPassword;
