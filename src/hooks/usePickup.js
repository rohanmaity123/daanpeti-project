import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

/* ── Coin reward constants ── */
export const COINS = {
  DONATE: 50,
  CLAIM: 10,
};

/* ── Hook ── */
export function usePickup(item, user) {
  const [otp, setOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpGenerated, setOtpGenerated] = useState(false);

  /* RECEIVER: click "Contact Donor" → generate OTP → open WhatsApp */
  const initiatePickup = useCallback(async () => {
    console.log('Initiating pickup for item:', item?.id, 'by user:', user?.id);
    if (!user || !item) return null;
    setOtpLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase.rpc('initiate_pickup', {
        p_item_id: item.id,
        p_receiver_id: user.id,
        p_receiver_name: user.user_metadata?.full_name ?? user.email ?? 'Anonymous',
      });
      if (err) throw err;

      const generatedOtp = data; // returns the 6-digit OTP string
      setOtp(generatedOtp);
      setOtpGenerated(true);
      return generatedOtp;
    } catch (e) {
      setError(e.message ?? 'Could not generate OTP');
      return null;
    } finally {
      setOtpLoading(false);
    }
  }, [item, user]);

  /* Build WhatsApp URL with OTP embedded in message */
  const buildWhatsappUrl = useCallback((otpCode) => {
    const msg = `Hi! Maine DaanGuru pe "${item?.name}" dekha. Kya ye abhi available hai?\n\n🔑 Mera pickup code: *${otpCode}*\n\nItem milne ke baad aap ye code app mein enter karein.`;
    return `https://wa.me/${item?.whatsapp_number}?text=${encodeURIComponent(msg)}`;
  }, [item]);

  /* DONOR: enter OTP → verify → item marked claimed → coins awarded */
  const verifyOtp = useCallback(async () => {
    if (!otpInput || otpInput.length !== 6) {
      setError('Please enter the full 6-digit code');
      return false;
    }
    setVerifyLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase.rpc('verify_pickup_otp', {
        p_item_id: item.id,
        p_otp: otpInput.trim(),
        p_donor_id: user.id,
      });
      if (err) throw err;
      if (!data.success) throw new Error(data.error);

      setSuccess(`✅ Verified! +${COINS.DONATE} coins credited to you.`);
      return true;
    } catch (e) {
      setError(e.message ?? 'Verification failed');
      return false;
    } finally {
      setVerifyLoading(false);
    }
  }, [otpInput, item, user]);

  /* RECEIVER: self-confirm after 24h if donor inactive */
  const selfConfirm = useCallback(async () => {
    setVerifyLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase.rpc('receiver_self_confirm', {
        p_item_id: item.id,
        p_receiver_id: user.id,
      });
      if (err) throw err;
      if (!data.success) throw new Error(data.error);

      setSuccess(`✅ Pickup confirmed! +${COINS.CLAIM} coins credited.`);
      return true;
    } catch (e) {
      setError(e.message ?? 'Self-confirm failed');
      return false;
    } finally {
      setVerifyLoading(false);
    }
  }, [item, user]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  return {
    otp, otpInput, setOtpInput,
    otpLoading, verifyLoading,
    otpGenerated,
    error, success, clearMessages,
    initiatePickup, buildWhatsappUrl,
    verifyOtp, selfConfirm,
  };
}
