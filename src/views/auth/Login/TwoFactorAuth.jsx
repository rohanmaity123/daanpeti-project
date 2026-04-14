import React, { useState, useReducer, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Validation from '../../../utils/Validation';
import Cookie from '../../../utils/Cookie';
import ToastHot from 'react-hot-toast';
import { Helmet } from 'react-helmet';
import useAuth from '../../../hooks/useAuth';
import Loader from '../../../utils/Loader';
import Reducer from '../../../services/Reducer';

const initState = {
  resend: false,
  box1: '',
  box2: '',
  box3: '',
  box4: '',
  box5: '',
  id: '',
  userInfo: '',
  pass: '',
  loading: false,
  validate: false
};


export default function TwoFactorAuth() {
  const { Logout, TwoFactorLogin } = useAuth();

  const { user, updateUser } = useAuth();
  const navigator = useNavigate();
  const location = useLocation();

  const [state, dispatch] = useReducer(Reducer, initState);

  const [otpTimer, setOtpTimer] = useState({
    minutes: 2,
    seconds: 0,
  })

  const [otpError, setOtpError] = useState({
    OtpBlank: false,
    isValidOtp: false,
    alreadyExist: false,
    isExpiredExist: false
  })

  const goToLogin = () => {
    navigator('/login');
  };

  const goToUser = () => {
    navigator('/user/dashboard');
  };

  useEffect(() => {
    timer()
    // let email = localStorage.getItem('email')
    //             ? localStorage.getItem('email')
    //             :"test@gmail.com"
    // setOtpData({
    //      ...otpdata,
    //      email:email
    //   })
  }, [otpTimer])

  const timer = () => {
    let interval = setInterval(() => {
      const { seconds, minutes } = otpTimer
      if (seconds != 0) {
        setOtpTimer({
          ...otpTimer,
          seconds: seconds - 1
        })
        clearInterval(interval);
      }
      else if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
        }
        else {
          setOtpTimer({
            ...otpTimer,
            minutes: minutes - 1,
            seconds: 59
          })
          clearInterval(interval);
        }
      }
    }, 1000)
  }
  // const switchToReset = (e) => {
  //   e.preventDefault();
  //   setReset(!reset);
  // };
  const onForgetPass = async (e) => {
    e.preventDefault();
    console.log("Clicked")
    dispatch({ type: 'VALIDATE', payload: true });

    let validationStatus = await getValidation();
    console.log('----', validationStatus)
    if (validationStatus) {
      let OTP = state.box1 +
        state.box2 +
        state.box3 +
        state.box4 +
        state.box5;
      let response
      const payload = {
        email: Cookie.getCookie('_email'),
        otp: (OTP)
      };
      response = await TwoFactorLogin(payload);

      console.log("user before--", user)
      dispatch({ type: 'LOAD', payload: true });
      if (response) {
        if (response && response.data?.status === 200) {
          dispatch({ type: 'LOAD', payload: false });
          // ToastHot.success("✔ Two factor authentication verified successfully ");
          // Cookie.setCookie('_tokenZealous_SuperAdmin', response.data.user_data.token_data.access_tokenZealous_SuperAdmin, 1);
          // response.data.user_data && response.data.user_data.user &&
          //   updateUser(response.data.user_data.user)
          // console.log("user after--", user)
          // goToUser()//Change Later to Dashboard

        } else if (response && response.data?.status === 400) {
          dispatch({ type: 'LOAD', payload: false });

          dispatch({ type: "SETDATA", payload: { "name": "box1", "value": '' } })
          dispatch({ type: "SETDATA", payload: { "name": "box2", "value": '' } })
          dispatch({ type: "SETDATA", payload: { "name": "box3", "value": '' } })
          dispatch({ type: "SETDATA", payload: { "name": "box4", "value": '' } })
          dispatch({ type: "SETDATA", payload: { "name": "box5", "value": '' } })
          setOtpError({
            ...otpError,
            // OtpBlank:true,
            isValidOtp: true
          })
          if (response.data.message === "Otp is incorrect") {
            setOtpError({
              ...otpError,
              // OtpBlank:true,
              isValidOtp: true
            })
          } else if (response.data.message === "Email already verified.") {
            setOtpError({
              ...otpError,
              alreadyExist: true
            })
          } else if (response.data.message === "Otp vaild time over click on resend otp") {
            setOtpError({
              ...otpError,
              isExpiredExist: true
            })
          }
        } else {
          dispatch({ type: 'LOAD', payload: false });
        }
      } else {
        dispatch({ type: 'LOAD', payload: false });
        // ToastHot.error("Something went wrong");
        // console.log('Error');
      }
    }
  };
  const getValidation = () => {

    return new Promise((resolve, reject) => {
      if (Validation.text(state.box1) &&
        Validation.text(state.box2) &&
        Validation.text(state.box3) &&
        Validation.text(state.box4) &&
        Validation.text(state.box5)
      ) {
        resolve(true)
      } else {
        setOtpError({
          ...otpError,
          OtpBlank: true,
          //isValidOtp:false
        })
        resolve(false)
      }
    });
  };
  const ReSendOtp = async (e) => {


    setOtpTimer({
      ...otpTimer,
      minutes: 2,
      seconds: 0,
    })
    setOtpError({
      ...otpError,
      OtpBlank: false,
      isValidOtp: false,
      alreadyExist: false,
      isExpiredExist: false
    })
    // setOtpData({
    //    ...otpdata,
    //    loading:true
    // })
    let Body = {
      token: state.id,
    }
    let response
    if (state.pass) {
      response = false//await ResendOtp(Body);
      console.log(response)
    } else {
      response = false//await ResendOtpForReset(Body);
    }

    if (response) {
      if (response.data.status === 200) {
        dispatch({ type: 'LOAD', payload: false });
        dispatch({ type: "SETDATA", payload: { "name": "box1", "value": '' } })
        dispatch({ type: "SETDATA", payload: { "name": "box2", "value": '' } })
        dispatch({ type: "SETDATA", payload: { "name": "box3", "value": '' } })
        dispatch({ type: "SETDATA", payload: { "name": "box4", "value": '' } })
        dispatch({ type: "SETDATA", payload: { "name": "box5", "value": '' } })
        dispatch({ type: "SETDATA", payload: { "name": "resend", "value": true } })
        ToastHot.success("Otp send successfully.");
      } else if (response.data.status === 400) {
        dispatch({ type: 'LOAD', payload: false });
        dispatch({ type: "SETDATA", payload: { "name": "box1", "value": '' } })
        dispatch({ type: "SETDATA", payload: { "name": "box2", "value": '' } })
        dispatch({ type: "SETDATA", payload: { "name": "box3", "value": '' } })
        dispatch({ type: "SETDATA", payload: { "name": "box4", "value": '' } })
        dispatch({ type: "SETDATA", payload: { "name": "box5", "value": '' } })
        if (response.data.error === "Invalid OTP") {
          setOtpError({
            ...otpError,
            // OtpBlank:true,
            isValidOtp: true
          })
        }
      }
    } else {
      ToastHot.error("Something went wrong");
    }

  }
  // move focus to the next box
  const inputfocus = (elmnt) => {
    setOtpError({
      ...otpError,
      OtpBlank: false,
      isValidOtp: false,
      alreadyExist: false,
      isExpiredExist: false
    })
    console.log(elmnt)
    if (elmnt.target.value.replace(/[^0-9]/ig, '')) {
      if (elmnt.key === "Delete" || elmnt.key === "Backspace") {
        const next = elmnt.target.tabIndex - 2;
        // console.log("Del")
        if (next > -1) {
          // console.log("Del if")
          elmnt.target.form.elements[next].focus()
        }
      } else {
        // console.log("else")
        const next = elmnt.target.tabIndex;
        //Based on no of boxes
        if (next < 5) {
          // console.log("else if")
          elmnt.target.form.elements[next].focus()
        }
      }
    }

  }
  const getData = (e) => {
    setOtpError({
      ...otpError,
      OtpBlank: false,
      isValidOtp: false,
      alreadyExist: false,
      isExpiredExist: false
    })
    dispatch({ type: "SETDATA", payload: { name: [e.target.name], value: e.target.value.replace(/[^0-9]/ig, '') } });
  }
  useEffect(() => {
    if (location && location.search.split('=')[1]) {
      let fullData = location.search.split('=')[1]
      console.log(fullData)
      // console.log(fullData.split('&ps=')[0])
      // let id = fullData.split('&ps')[0] ? fullData.split('&ps')[0] : ''
      // let pass = location.search.split('&ps=')[1] ? location.search.split('&ps=')[1] : ''
      // dispatch({ type: "SETDATA", payload: { "name": "id", "value": id } })
      // dispatch({ type: "SETDATA", payload: { "name": "pass", "value": pass } })
    }
  }, [location]);
  // useEffect(() => {
  //   if (!Cookie.getCookie('_email')) {
  //     navigator("/login")
  //   }
  // }, [Cookie.getCookie('_email')]);


  return (
    <>
      <Helmet>
        <title>ZLS || Two factor authentication</title>
      </Helmet>
      <>
        {/* <SiteHeader /> */}

        <section className="beforeLoginSection">
          <div className="beforeLoginRow">
            <div className="beforeLoginInner with-top-action-btns">
              {/* <img src="./images/otp-password.png" /> */}
              <h3 className='text-center'>SMS Authentication</h3>
              <p className='text-center'>Please enter the 6-digit authentication code we've sent ******860</p>
              {/* onSubmit={submitOtp} */}
              <form action="" >
                <div className="fomrGroup">
                  {/* {otpTimer.minutes === 0 && otpTimer.seconds === 0
                    ? <span>Remaining 00:00</span>
                    : <span>
                      {otpTimer.minutes}:{
                        otpTimer.seconds < 10
                          ? `0${otpTimer.seconds}`
                          : otpTimer.seconds
                      }
                    </span>
                  } */}
                  <div className="otpField">
                    <input
                      className="form-control"
                      style={(otpError.isValidOtp || otpError.isExpiredExist || otpError.OtpBlank || otpError.alreadyExist) && !state.box1 ? { border: "3px solid red" } : { border: "3px solid #eaeeff" }}
                      autoComplete="off"
                      maxLength="1"
                      value={state.box1}
                      type="text"
                      name="box1"
                      size="1" min="0" max="9"
                      pattern="[0-9]{1}"
                      tabIndex="1"
                      onChange={getData}
                      onKeyUp={e => inputfocus(e)}

                    />
                    <input
                      className="form-control"
                      style={(otpError.isValidOtp || otpError.isExpiredExist || otpError.OtpBlank || otpError.alreadyExist) && !state.box2 ? { border: "3px solid red" } : { border: "3px solid #eaeeff" }}
                      value={state.box2}
                      type="text"
                      name="box2"
                      size="1" min="0" max="9"
                      pattern="[0-9]{1}"
                      tabIndex="2"
                      autoComplete="off"
                      maxLength="1"
                      onChange={getData}
                      onKeyUp={e => inputfocus(e)}
                    />
                    <input
                      className="form-control"
                      style={(otpError.isValidOtp || otpError.isExpiredExist || otpError.OtpBlank || otpError.alreadyExist) && !state.box3 ? { border: "3px solid red" } : { border: "3px solid #eaeeff" }}
                      value={state.box3}
                      type="text"
                      name="box3"
                      size="1" min="0" max="9"
                      pattern="[0-9]{1}"
                      tabIndex="3"
                      autoComplete="off"
                      maxLength="1"
                      onChange={getData}
                      onKeyUp={e => inputfocus(e)}
                    />
                    <input
                      className="form-control"
                      style={(otpError.isValidOtp || otpError.isExpiredExist || otpError.OtpBlank || otpError.alreadyExist) && !state.box4 ? { border: "3px solid red" } : { border: "3px solid #eaeeff" }}
                      value={state.box4}
                      type="text"
                      name="box4"
                      size="1" min="0" max="9"
                      pattern="[0-9]{1}"
                      tabIndex="4"
                      autoComplete="off"
                      maxLength="1"
                      onChange={getData}
                      onKeyUp={e => inputfocus(e)}
                    />
                    <input
                      className="form-control"
                      style={(otpError.isValidOtp || otpError.isExpiredExist || otpError.OtpBlank || otpError.alreadyExist) && !state.box5 ? { border: "3px solid red" } : { border: "3px solid #eaeeff" }}
                      value={state.box5}
                      type="text"
                      name="box5"
                      size="1" min="0" max="9"
                      pattern="[0-9]{1}"
                      tabIndex="5"
                      autoComplete="off"
                      maxLength="1"
                      onChange={getData}
                      onKeyUp={e => inputfocus(e)}
                    />
                  </div>

                  {
                    otpError.isValidOtp &&
                    <p className="error-msg">Invalid OTP. Click on resend to get another OTP.</p>
                  }
                  {
                    otpError.isExpiredExist &&
                    <p className="error-msg">The OTP has been expired. Click on resend to get another OTP.</p>
                  }
                  {
                    otpError.OtpBlank &&
                    <p className="error-msg">Authentication code is required.</p>
                  }
                  {
                    otpError.alreadyExist &&
                    <p className="error-msg">Your account already verified.</p>

                  }
                </div>

                <button type="submit" className="themeBtn fullBtn" onClick={(e) => onForgetPass(e)}>
                  {
                    state.loading ? <Loader loaderWidth={"30px"} loaderHeight={"30px"} position={"relative"} /> : "Submit Now"
                  }
                </button>

                <button onClick={() => { Logout(); navigator("/") }} className='logout-btn'>Go to Login</button>
              </form>
              {/* <p className="infoText">Have Not Received Any Code?  |  <a className="resendBtn">{otpTimer.minutes === 0 && otpTimer.seconds === 0
                ? <a href="javascript:;" onClick={(e) => ReSendOtp(e)}> Resend {state.resend && 'Again'}</a>
                : <a className="custom_tooltip1"> Resend {state.resend && 'Again'}
                </a>
              }</a> </p> */}
            </div>
          </div>
        </section>
      </>
    </>
  );
}
