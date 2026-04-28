import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, KeyRound, CheckCircle2, Loader2, AlertCircle, Copy, Check, Clock } from 'lucide-react';
import OtpInput from 'react-otp-input';
import { COINS, usePickup } from '../hooks/usePickup';


/* ────────────────────────────────────────────────
   Receiver flow  — shows when !isDonor
   Donor flow     — shows when isDonor
   ──────────────────────────────────────────────── */

export function OtpPickupFlow({ item, user, isDonor, isClaimed, onClaimed, onLoginRequired }) {
  const {
    otp, otpInput, setOtpInput,
    otpLoading, verifyLoading,
    otpGenerated,
    error, success, clearMessages,
    initiatePickup, buildWhatsappUrl,
    verifyOtp, selfConfirm,
  } = usePickup(item, user);

  const [copied, setCopied] = useState(false);

  const handleOtpChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setOtpInput(cleaned);
  };

  const handleWhatsapp = async () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    clearMessages();

    // Remove 'noopener' — it blocks setting location.href on the new window
    const newWindow = window.open('', '_blank');

    const code = await initiatePickup();
    console.log('Generated OTP:', code);

    if (code) {
      newWindow.location.href = buildWhatsappUrl(code);
    } else {
      newWindow?.close();
    }
  };

  const handleVerify = async () => {
    clearMessages();
    const ok = await verifyOtp();
    if (ok) onClaimed?.();
  };

  const handleSelfConfirm = async () => {
    clearMessages();
    const ok = await selfConfirm();
    if (ok) onClaimed?.();
  };

  const copyOtp = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Already claimed ── */
  if (isClaimed) {
    return (
      <div className="glass-surface flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white/70">
        ✅ Yeh item kisi ko mil chuka hai — Claimed
      </div>
    );
  }

  /* ── RECEIVER FLOW ── */
  if (!isDonor) {
    return (
      <div className="space-y-3 w-full">
        {/* Step 1: Contact via WhatsApp (generates OTP) */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={otpLoading}
          onClick={handleWhatsapp}
          className="feed-whatsapp-button flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {otpLoading
            ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating code...</>
            : <><MessageCircle className="h-5 w-5" /> Contact Donor on WhatsApp</>
          }
        </motion.button>

        {/* Show OTP after generation */}
        <AnimatePresence>
          {otpGenerated && otp && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-4"
              style={{ background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.28)' }}
            >
              <p className="text-xs font-semibold text-white/55 mb-2 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                Your pickup code (already sent in WhatsApp)
              </p>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {otp.split('').map((d, i) => (
                    <div key={i} className="w-8 h-10 rounded-lg flex items-center justify-center text-lg font-extrabold text-white"
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
                      {d}
                    </div>
                  ))}
                </div>
                <button onClick={copyOtp} className="ml-2 flex items-center gap-1 text-xs font-semibold text-white/50 hover:text-white transition-colors">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-2.5 text-xs text-white/45 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                Donor will enter this code when handing over the item
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Self-confirm after 24h */}
        {otpGenerated && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSelfConfirm}
            disabled={verifyLoading}
            className="w-full rounded-xl py-2.5 text-xs font-semibold text-white/50 hover:text-white/80 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {verifyLoading ? 'Confirming...' : '⏰ Already received? Self-confirm after 24h'}
          </motion.button>
        )}

        {/* Coins incentive badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-white/40 font-medium">
          <span>🪙</span>
          <span>You'll earn <span className="text-yellow-400 font-bold">+{COINS.CLAIM} coins</span> when pickup is confirmed</span>
        </div>

        <ErrorSuccess error={error} success={success} />
      </div>
    );
  }

  /* ── DONOR FLOW ── */
  return (
    <div className="space-y-4 w-full">
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
        <p className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-yellow-400" />
          Enter Receiver's Pickup Code
        </p>
        <p className="text-xs text-white/50 mb-4">
          Ask the receiver for their 6-digit code, enter below to confirm handover and earn <span className="text-yellow-400 font-semibold">+{COINS.DONATE} coins</span>.
        </p>

        {/* 6-box OTP input */}
        <div className="flex justify-center mb-4">
          <OtpInput
            value={otpInput}
            onChange={handleOtpChange}
            numInputs={6}
            inputType="tel"
            shouldAutoFocus
            renderInput={(props) => <input {...props} />}
            containerStyle={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
            inputStyle={{
              width: '2.5rem',
              height: '3rem',
              borderRadius: '1rem',
              textAlign: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#ffffff',
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(255,255,255,0.14)',
              outline: 'none',
              caretColor: 'transparent',
            }}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={verifyLoading || otpInput.length < 6}
          onClick={handleVerify}
          className="my-items-claim-button w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {verifyLoading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
            : <><CheckCircle2 className="h-4 w-4" /> Confirm Handover</>
          }
        </motion.button>
      </div>

      {/* Receiver info if already initiated */}
      {item?.receiver_name && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
          style={{ background: 'rgba(29,158,117,0.10)', border: '1px solid rgba(29,158,117,0.2)' }}
        >
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm shrink-0"
            style={{ background: 'rgba(29,158,117,0.2)' }}>
            👤
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Interested receiver</p>
            <p className="text-sm font-bold text-white">{item.receiver_name}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold px-2 py-1 rounded-full"
            style={{ background: 'rgba(239,159,39,0.2)', color: '#ef9f27', border: '1px solid rgba(239,159,39,0.3)' }}>
            Pending OTP
          </span>
        </motion.div>
      )}

      <div className="flex items-center justify-center gap-1.5 text-xs text-white/40 font-medium">
        <span>🪙</span>
        <span>You'll earn <span className="text-yellow-400 font-bold">+{COINS.DONATE} coins</span> on successful handover</span>
      </div>

      <ErrorSuccess error={error} success={success} />
    </div>
  );
}

/* ── Shared error/success component ── */
function ErrorSuccess({ error, success }) {
  return (
    <AnimatePresence>
      {(error || success) && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium"
          style={error
            ? { background: 'rgba(255,92,92,0.12)', border: '1px solid rgba(255,92,92,0.25)', color: '#ff5c5c' }
            : { background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)', color: '#5dcaa5' }
          }
        >
          {error
            ? <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            : <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          }
          {error || success}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
