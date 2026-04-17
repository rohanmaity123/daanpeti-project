import React from 'react';
import useGlobalStore from "../../hooks/useGlobalStore";
import { Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material';
import { X, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const LoginAleartModal = () => {

  const { TOGGLE_LOGIN_ALERT_MODAL, toggleForModal } = useGlobalStore();
  const navigate = useNavigate();

  const handleClose = () => toggleForModal('TOGGLE_LOGIN_ALERT_MODAL')

  const handleLoginRedirect = () => {
    handleClose();
    navigate('/profile');
  };

  return (
    <Dialog open={TOGGLE_LOGIN_ALERT_MODAL} onClose={() => handleClose(false)} maxWidth="sm"
      BackdropProps={{ sx: { backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.4)' } }}
      PaperProps={{ className: 'rounded-[28px]', style: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 70px rgba(0,0,0,0.35)' } }}

    >
      <DialogTitle className="text-center text-white font-bold text-lg pt-6">
        Login Required
      </DialogTitle>
      <DialogContent className="px-6 pb-4">
        <p className="text-center text-white/80 text-sm leading-relaxed">
          You cannot contact the donor before logging in. Please log in to proceed.
        </p>
      </DialogContent>
      <DialogActions className="flex flex-col gap-3 px-6 pb-6">
        <button
          onClick={handleLoginRedirect}
          className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
        >
          <LogIn className="h-4 w-4" />
          Go to Login
        </button>
        <button
          onClick={handleClose}
          className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Cancel
        </button>
      </DialogActions>
      <button onClick={() => handleClose(false)} className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md">
        <X className="h-5 w-5 text-white" />
      </button>
    </Dialog>
  );
}

export default LoginAleartModal;