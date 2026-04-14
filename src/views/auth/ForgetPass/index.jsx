import React, { useReducer } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import Validation from '../../../utils/Validation';
import Loader from '../../../utils/Loader';
import Reducer from '../../../services/Reducer';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import toast from 'react-hot-toast';
import { ForgetPassword } from '../../../actions/authAction';

const initState = {
  email: '',
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
};
export default function ForgetPass() {
  const navigator = useNavigate();
  const reduxdispatch = useDispatch()

  const [state, dispatch] = useReducer(Reducer, initState);
  const [stateForErr, dispatchForErr] = useReducer( Reducer , loginErrState);

  const getValidation = () => {
    return new Promise((resolve, reject) => {
      if (Validation.text(state.email.toLowerCase()) &&
        Validation.email(state.email.toLowerCase())
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


    dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'accountnotExist', value: false } });
    dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsBlockedEmail', value: false } });
    dispatchForErr({ type: 'VALIDATECHECK', payload: { name: 'IsYourLoginCredentials', value: false } });


    if (e.target.name === "agree") {
      dispatch({ type: "ONCHANGE_CHECKBOX", payload: e })
    } else {
      dispatch({ type: "ONCHANGE", payload: e })
    }
  }

  const handleSubmit = async(e) =>{
    e.preventDefault();
    dispatch({ type: 'VALIDATE', payload: true });

    let validationStatus = await getValidation();
    console.log('validationStatus',validationStatus)
    if (validationStatus) {
      dispatch({ type: 'LOAD', payload: true });
      try {
        let responce = await ForgetPassword( {email: state.email.toLowerCase()} ); 
        console.log('responce',responce)
        dispatch({ type: 'LOAD', payload: false });
        if (responce?.data?.status === 200 ) {
          toast.success('Reset password verification link send to your mail !!');
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
  }
  return (
    <>
      <Helmet>
        <title>Forget Password</title>
      </Helmet>
      <>

      <section className="beforeLoginSection">
          <div className="beforeLoginRow">
            
            <div className="beforeLoginInner">
              <img src="https://euphoriagenx.com/wp-content/uploads/2022/03/Footer-Logo.png" />
              <h3>Forgot Password</h3>
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
                    <span className="leftSide"> <EmailIcon/></span>
                   
                  </div>
                </div>
                <button onClick={handleSubmit} className="themeBtn fullBtn">
                  {
                    state.loading ? <Loader loaderWidth={"30px"} 
                    loaderHeight={"30px"} 
                    position={"relative"} /> : "Submit"
                  }

                </button>
              </form>
            </div>
          </div>
        </section>
      </>
    </>
  );
}
