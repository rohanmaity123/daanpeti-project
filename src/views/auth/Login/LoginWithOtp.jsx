import React, { useState, useReducer, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import OtpInput from "react-otp-input";
import Cookie from '../../../utils/Cookie';
import ToastHot from 'react-hot-toast';
import { Helmet } from 'react-helmet';
import Loader from '../../../utils/Loader';
import Reducer from '../../../services/Reducer';

const initState = {
  resend: false,
  id: '',
  userInfo: '',
  pass: '',
  loading: false,
  validate: false
};
const loginErrState = {
  passcodeNot: false,
};

export default function LoginWithOtp() {
  const navigator = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [count, setCount] = useState(59);

  const [state, dispatch] = useReducer(Reducer, initState);
  const [stateForErr, dispatchForErr] = useReducer(Reducer, loginErrState);



  const goToLogin = () => {
    navigator('/login');
  };

  const goToUser = () => {
    navigator('/user/dashboard');
  };


  const onForgetPass = async (e) => {
    e.preventDefault();
    console.log("Clicked")
    dispatch({ type: 'VALIDATE', payload: true });

    let validationStatus = await getValidation();
    console.log('----', validationStatus)
    if (validationStatus) {
      let OTP = otp;
      let response
      const payload = {
        email: Cookie.getCookie('_email'),
        otp: (OTP)
      };
      response = false;

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

        } else if (response && response.data.statusCode === 400) {
          if (
            response?.data?.message &&
            response?.data?.message === "OTP does not matched."
          ) {
            dispatchForErr({
              type: "VALIDATECHECK",
              payload: { name: "passcodeNot", value: true },
            });
          }
        } else {

          dispatchForErr({
            type: "VALIDATECHECK",
            payload: { name: "passcodeNot", value: true },
          });

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
      if (otp) {
        resolve(true);
      } else {
        if (!otp) {
          setOtpError("Please enter the code.");
          console.log("email");
        }
        resolve(false);
      }
    });
  };
  const ReSendOtp = async (e) => {


    setCount(59)
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
  const formatTime = useMemo(
    () => (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${seconds
        .toString()
        .padStart(2, "0")}`;

      // return `${minutes.toString().padStart(2, "0")}:${seconds
      //   .toString()
      //   .padStart(2, "0")}`;
    },
    []
  );

  const startTimer = () => {
    if (count === 0) {
      return;
    }
    return setInterval(() => {
      setCount((prevCount) => prevCount - 1);
    }, 1000);
  };
  useEffect(() => {
    const countDown = startTimer();

    return () => clearInterval(countDown);
  }, [count]);
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
  useEffect(() => {
    if (!Cookie.getCookie('_email')) {
      navigator("/login")
    }
  }, [Cookie.getCookie('_email')]);


  return (
    <>
      <Helmet>
        <title>Daanguru || Two factor authentication</title>
      </Helmet>
      <>
        {/* <SiteHeader /> */}

        <section className="beforeLoginSection">
          <div className="beforeLoginRow">
            <div className="beforeLoginInner with-top-action-btns">
              {/* <img src="./images/otp-password.png" /> */}
              <h3 className='text-center'>SMS Authentication</h3>

              <p className='text-center'>Please enter the 5-digit authentication code <button onClick={ReSendOtp} disabled={count !== 0}>Resend</button> ({formatTime(count)})s</p>
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
                    <OtpInput
                      value={otp}
                      onChange={(e) => {
                        setOtp(e);
                        setOtpError("");
                        dispatchForErr({
                          type: "VALIDATECHECK",
                          payload: { name: "passcodeNot", value: false },
                        });
                      }}
                      numInputs={5}
                      renderInput={(props) => (
                        <input
                          {...props}
                          className={otpError ? "otp_input red-border form-control" : "otp_input form-control"}
                          placeholder=""
                          type="number"
                        />
                      )}
                    // errorStyle={"otp-error"}
                    // hasErrored={"err"}
                    />

                  </div>

                  {stateForErr.passcodeNot && (
                    <p className="error-msg mt-2">OTP does not matched.</p>
                  )}
                  {otpError && (
                    <p className="error-msg text-center mt-2">
                      {otpError}
                    </p>
                  )}
                </div>

                <button type="submit" className="themeBtn fullBtn" onClick={(e) => onForgetPass(e)}>
                  {
                    state.loading ? <Loader loaderWidth={"30px"} loaderHeight={"30px"} position={"relative"} /> : "Submit Now"
                  }
                </button>

                <button onClick={() => { navigator("/") }} className='logout-btn'>Go to Login</button>
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
