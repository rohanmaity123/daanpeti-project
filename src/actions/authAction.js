import api from '../services/Axios';
import Cookie from '../utils/Cookie';

export const loginApi = (payload) => {
  return api.post('admin/login', payload).then(response => response)
    .catch(err => err?.response);
};

export const login = (payload) => {
  return api.post('auth/signin', payload).then(response => response)
    .catch(err => err);
};

export const loginForGoogle = (payload) => {
  return api.post('google/login', payload).then(response => response)
    .catch(err => err);
};

export const register = (payload) => {
  return api.post('auth/register', payload).then(response => response)
    .catch(err => err);
};

export const GoogleRegister = (payload) => {
  return api.post('google/register', payload).then(response => response)
    .catch(err => err);
};

//For Email
export const VerifyOtp = (payload) => {
  return api.post('verify/email', payload).then(response => response)
    .catch(err => err);
};
//For Email
export const ResendOtp = (payload) => {
  return api.post('resend/otp', payload).then(response => response)
    .catch(err => err);
};

//For Resetc pass
export const VerifyOtpForReset = (payload) => {
  return api.post('controller/user/otp-verification', payload).then(response => response)
    .catch(err => err);
};

//For Reset pass
export const ResendOtpForReset = (payload) => {
  return api.post('resend/password/otp', payload).then(response => response)
    .catch(err => err);
};

export const ResetPassWord = (payload) => {
  return api.post('reset-forget-password', payload).then(response => response)
    .catch(err => err?.response);
};

export const ForgetPassword = (payload) => {
  return api.post('send-reset-mail', payload).then(response => response)
    .catch(err => err?.response);
};

// -------------------------------------------------User Information------------------------------------------
export const ME = () => {
  const header = {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }
  return api.get('/admin/profile', header).then(response => response)
    .catch(err => err?.response);
};
