import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Gift, Trophy, Zap, Copy, Check,
  Lock, Loader2, LogIn, ChevronRight,
  Clock, TrendingUp, Award, RefreshCw, AlertCircle,
} from 'lucide-react';
import { signInWithGoogle, useAuth } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabaseClient';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

/* ── Tier config ── */
const TIERS = {
  seedling: { label: 'Daan Seedling', emoji: '🌱', color: '#639922', bg: '#EAF3DE', min: 0, max: 99, next: 100 },
  helper: { label: 'Daan Helper', emoji: '💧', color: '#185FA5', bg: '#E6F1FB', min: 100, max: 299, next: 300 },
  star: { label: 'Daan Star', emoji: '⭐', color: '#854F0B', bg: '#FAEEDA', min: 300, max: 699, next: 700 },
  legend: { label: 'Daan Legend', emoji: '👑', color: '#534AB7', bg: '#EEEDFE', min: 700, max: 9999, next: null },
};

const TIER_PERKS = {
  seedling: ['10 pts per donation', 'Basic coupons (₹30–₹50)', 'Amazon & Zomato deals'],
  helper: ['15 pts per donation', 'Better coupons (₹50–₹100)', 'Myntra & BookMyShow deals'],
  star: ['20 pts per donation', 'Premium coupons (₹100+)', '1mg & Amazon Prime deals'],
  legend: ['25 pts per donation', 'Exclusive coupons', 'Zomato Gold & Flipkart ₹200'],
};

const REASON_LABELS = {
  item_donated: '🎁 Item donated',
  coupon_redeemed: '🎟 Coupon redeemed',
  bonus: '⭐ Bonus points',
  referral: '👥 Referral bonus',
  profile_complete: '✅ Profile completed',
  birthday: '🎂 Birthday bonus',
  item_received: '📦 Item received',
};

/* ── Animated counter ── */
function Counter({ target }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let s = 0;
    const step = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 1000, 1);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{n}</>;
}

/* ── Copy code ── */
function CopyCode({ code }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-sm font-mono font-bold text-foreground hover:bg-muted transition-colors">
      <span>{code}</span>
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
    </button>
  );
}

/* ── Coupon card ── */
function CouponCard({ coupon, userPts, userTier, onRedeem, myRedeemed }) {
  const [loading, setLoading] = useState(false);
  const tierOrder = ['seedling', 'helper', 'star', 'legend'];
  const canAfford = userPts >= coupon.points_required;
  const canTier = tierOrder.indexOf(userTier) >= tierOrder.indexOf(coupon.tier_required);
  const soldOut = coupon.total_quantity !== null && coupon.redeemed_count >= coupon.total_quantity;
  const alreadyHad = !!myRedeemed;
  const canRedeem = canAfford && canTier && !soldOut && !alreadyHad;
  const tierInfo = TIERS[coupon.tier_required] ?? TIERS.seedling;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl bg-card card-shadow overflow-hidden flex flex-col ${!canAfford || !canTier ? 'opacity-70' : ''}`}>
      <div className="h-1 w-full" style={{
        background: alreadyHad ? 'linear-gradient(90deg,#639922,#1D9E75)'
          : canRedeem ? 'linear-gradient(90deg,#138808,#1D9E75)'
            : 'linear-gradient(90deg,#888780,#B4B2A9)',
      }} />
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 28 }}>{coupon.brand_logo_emoji}</span>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{coupon.brand}</p>
              <p className="text-sm font-extrabold text-foreground leading-tight">{coupon.title}</p>
            </div>
          </div>
          <div className="shrink-0 rounded-xl px-2.5 py-1 text-sm font-extrabold"
            style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)', color: '#fff' }}>
            {coupon.discount_text}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
            style={{ background: canAfford ? 'rgba(19,136,8,0.1)' : 'rgba(136,135,128,0.1)', color: canAfford ? '#138808' : '#888780' }}>
            <Zap className="h-3 w-3" />{coupon.points_required} pts
          </span>
          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: tierInfo.bg, color: tierInfo.color }}>
            {tierInfo.emoji} {tierInfo.label}+
          </span>
          <span className="text-xs text-muted-foreground">Valid {coupon.expiry_days} days</span>
        </div>

        {alreadyHad && (
          <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(19,136,8,0.06)', border: '1px solid rgba(19,136,8,0.15)' }}>
            <p className="text-xs font-semibold text-primary">✅ Redeemed! Your code:</p>
            <CopyCode code={myRedeemed.code} />
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Expires: {new Date(myRedeemed.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            {coupon.affiliate_url && (
              <a href={coupon.affiliate_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Use on {coupon.brand} <ChevronRight className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {!alreadyHad && !canTier && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground rounded-xl bg-muted px-3 py-2">
            <Lock className="h-3.5 w-3.5 shrink-0" />Reach {tierInfo.label} tier to unlock
          </div>
        )}
        {!alreadyHad && canTier && !canAfford && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground rounded-xl bg-muted px-3 py-2">
            <Zap className="h-3.5 w-3.5 shrink-0" />Need {coupon.points_required - userPts} more points
          </div>
        )}
        {soldOut && <p className="text-xs font-semibold text-destructive">Sold out</p>}

        {!alreadyHad && canRedeem && (
          <motion.button onClick={async () => { setLoading(true); await onRedeem(coupon.id); setLoading(false); }}
            disabled={loading} whileTap={{ scale: 0.97 }}
            className="mt-auto w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Redeeming...</> : <><Gift className="h-4 w-4" />Redeem for {coupon.points_required} pts</>}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Login wall ── */
function LoginWall() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="mx-auto max-w-sm px-4 pt-10 pb-28 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-card card-shadow p-8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground">Rewards dekhein 🏆</h2>
        <p className="mt-2 text-sm text-muted-foreground">Login karein aur apne loyalty points aur coupons dekhein.</p>
        <motion.button
          onClick={async () => { setLoading(true); try { await signInWithGoogle(); } catch { setLoading(false); } }}
          disabled={loading} whileTap={{ scale: 0.97 }}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Redirecting...</> : <><LogIn className="h-4 w-4" />Sign in with Google</>}
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════
   MAIN PAGE
   ═══════════════════════════ */
export default function RewardsPage() {
  const { user, loading: authLoading } = useAuth();

  const [pts, setPts] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [myRedeemed, setMyRedeemed] = useState([]);
  const [txHistory, setTxHistory] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeTab, setActiveTab] = useState('redeem');
  const [toast, setToast] = useState(null);
  const [filterTier, setFilterTier] = useState('all');

  /* ── Load all data ── */
  const loadData = useCallback(async () => {
    if (!user) { setDataLoading(false); return; }
    setDataLoading(true);
    setFetchError('');

    try {
      /* Fetch in parallel */
      const [ptsRes, couponRes, redeemedRes, txRes] = await Promise.all([
        supabase.from('user_points')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase.from('coupons')
          .select('*')
          .eq('is_active', true)
          .order('points_required', { ascending: true }),
        supabase.from('user_coupons')
          .select('*, coupons(brand,brand_logo_emoji,title,discount_text,affiliate_url)')
          .eq('user_id', user.id),
        supabase.from('point_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30),
      ]);

      /* Log errors for debugging */
      if (ptsRes.error) console.error('[Rewards] user_points error:', ptsRes.error.message);
      if (couponRes.error) console.error('[Rewards] coupons error:', couponRes.error.message);
      if (redeemedRes.error) console.error('[Rewards] user_coupons error:', redeemedRes.error.message);
      if (txRes.error) console.error('[Rewards] point_transactions error:', txRes.error.message);

      /* If user_points has a RLS error, show helpful message */
      if (ptsRes.error?.code === '42501') {
        setFetchError('RLS policy missing — run fix_rls_and_seed.sql in Supabase SQL Editor');
      }

      setPts(ptsRes.data ?? null);
      setCoupons(couponRes.data ?? []);
      setMyRedeemed(redeemedRes.data ?? []);
      setTxHistory(txRes.data ?? []);

      /* If user has no points row yet, create one */
      if (!ptsRes.data && !ptsRes.error) {
        await supabase.from('user_points').upsert({
          user_id: user.id,
          total_points: 0,
          lifetime_points: 0,
          items_donated: 0,
          coupons_redeemed: 0,
          tier: 'seedling',
        }, { onConflict: 'user_id' });
        const { data: fresh } = await supabase.from('user_points').select('*').eq('user_id', user.id).maybeSingle();
        setPts(fresh);
      }
    } catch (err) {
      setFetchError(err.message ?? 'Unknown error');
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Realtime: refresh when user_points changes ── */
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`rewards-${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'user_points',
        filter: `user_id=eq.${user.id}`,
      }, () => loadData())
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'point_transactions',
        filter: `user_id=eq.${user.id}`,
      }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, loadData]);

  /* ── Redeem handler ── */
  const handleRedeem = async (couponId) => {
    const { data, error } = await supabase.rpc('redeem_coupon', { p_coupon_id: couponId });
    if (error || !data?.success) {
      showToast(data?.error ?? error?.message ?? 'Redemption failed', 'error');
      return;
    }
    showToast(`✅ Redeemed! Code: ${data.code}`);
    await loadData();
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Render states ── */
  if (authLoading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (!user) return <LoginWall />;

  const tier = pts?.tier ?? 'seedling';
  const tierInfo = TIERS[tier] ?? TIERS.seedling;
  const totalPts = pts?.total_points ?? 0;
  const lifePts = pts?.lifetime_points ?? 0;
  const nextTier = tierInfo.next;
  const progressPct = nextTier
    ? Math.min(100, Math.round(((lifePts - tierInfo.min) / (nextTier - tierInfo.min)) * 100))
    : 100;

  const filteredCoupons = filterTier === 'all'
    ? coupons
    : coupons.filter(c => c.tier_required === filterTier);

  return (
    <>
      <Helmet>
        <title>Rewards & Points — DaanGuru</title>
        <meta name="description" content="Earn DaanGuru reward points for every donation. Unlock exclusive discounts from your favorite brands." />
        <link rel="canonical" href="https://www.daanguru.in/rewards" />
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 lg:px-6 pt-5 pb-28 lg:pb-12">

        {/* ── Toast ── */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg whitespace-nowrap"
              style={{ background: toast.type === 'error' ? '#E24B4A' : 'linear-gradient(135deg,#138808,#1D9E75)' }}>
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error banner (dev helper) ── */}
        {fetchError && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-destructive">Data fetch error</p>
              <p className="text-xs text-destructive/80 mt-0.5">{fetchError}</p>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground">Rewards 🏆</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Donate items, earn points, unlock coupons</p>
          </motion.div>
          <button onClick={loadData} disabled={dataLoading}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── Tier card ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-5 lg:p-6 mb-5 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg,${tierInfo.color}22,${tierInfo.color}11)`, border: `1px solid ${tierInfo.color}44` }}>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 28 }}>{tierInfo.emoji}</span>
                <span className="text-lg font-extrabold text-foreground">{tierInfo.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-foreground">
                  {dataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Counter target={totalPts} />}
                </span>
                <span className="text-sm text-muted-foreground">points available</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{lifePts} lifetime points</p>
            </div>

            <div className="flex gap-5">
              {[
                { label: 'Donated', val: pts?.items_donated ?? 0, icon: '🎁' },
                { label: 'Coupons', val: pts?.coupons_redeemed ?? 0, icon: '🎟' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-extrabold text-foreground">
                    {dataLoading ? '—' : <Counter target={s.val} />}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.icon} {s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          {nextTier && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progress to next tier</span>
                <span>{lifePts} / {nextTier} pts</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div className="h-full rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                  transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                  style={{ background: `linear-gradient(90deg,${tierInfo.color},#1D9E75)` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {nextTier - lifePts} more points to level up
              </p>
            </div>
          )}
          {!nextTier && (
            <p className="mt-3 text-xs font-semibold" style={{ color: tierInfo.color }}>
              👑 Highest tier reached! Maximum rewards unlocked.
            </p>
          )}
        </motion.div>

        {/* ── Tier progression row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {Object.entries(TIERS).map(([key, t]) => {
            const isActive = key === tier;
            const tierOrder = ['seedling', 'helper', 'star', 'legend'];
            const unlocked = tierOrder.indexOf(tier) >= tierOrder.indexOf(key);
            return (
              <div key={key} className="rounded-2xl p-3 text-center transition-all"
                style={{
                  background: t.bg,
                  border: isActive ? `2px solid ${t.color}` : '1px solid transparent',
                  opacity: unlocked ? 1 : 0.45,
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                }}>
                <p style={{ fontSize: 20 }}>{t.emoji}</p>
                <p className="text-xs font-bold mt-1" style={{ color: t.color }}>{t.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.min}+ pts</p>
                {isActive && <p className="text-[9px] font-extrabold mt-1" style={{ color: t.color }}>YOU ARE HERE ✓</p>}
              </div>
            );
          })}
        </div>

        {/* ── Tabs ── */}
        <div className="flex rounded-2xl p-1 mb-5 gap-1"
          style={{ background: 'rgba(0,0,0,0.05)', border: '0.5px solid rgba(0,0,0,0.08)' }}>
          {[
            { id: 'redeem', label: 'Coupons', icon: Gift },
            { id: 'earn', label: 'How to Earn', icon: TrendingUp },
            { id: 'history', label: 'History', icon: Star },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${activeTab === tab.id ? 'text-white shadow-sm' : 'text-muted-foreground'
                }`}
              style={activeTab === tab.id ? { background: 'linear-gradient(135deg,#138808,#1D9E75)' } : {}}>
              <tab.icon className="h-3.5 w-3.5" />{tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════ TAB: Coupons ══════════════ */}
        {activeTab === 'redeem' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
              {[
                ['all', 'All', '#138808'],
                ['seedling', '🌱 Seedling', '#639922'],
                ['helper', '💧 Helper', '#185FA5'],
                ['star', '⭐ Star', '#854F0B'],
                ['legend', '👑 Legend', '#534AB7'],
              ].map(([val, label, color]) => (
                <button key={val} onClick={() => setFilterTier(val)}
                  className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                  style={filterTier === val
                    ? { background: color, color: '#fff' }
                    : { background: 'rgba(0,0,0,0.06)', color: 'var(--color-text-secondary)' }}>
                  {label}
                </button>
              ))}
            </div>

            {dataLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading your rewards...</p>
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-muted/30">
                <p className="text-3xl mb-3">🎟</p>
                <p className="text-sm font-bold text-foreground">No coupons yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Coupons will appear here once added.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Run <code className="bg-muted px-1 rounded">fix_rls_and_seed.sql</code> to seed sample coupons.
                </p>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm font-bold text-foreground">No coupons in this tier</p>
                <button onClick={() => setFilterTier('all')} className="mt-2 text-xs text-primary hover:underline">
                  Show all coupons
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCoupons.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <CouponCard
                      coupon={c}
                      userPts={totalPts}
                      userTier={tier}
                      onRedeem={handleRedeem}
                      myRedeemed={myRedeemed.find(r => r.coupon_id === c.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Points needed info */}
            {!dataLoading && totalPts < 50 && (
              <div className="mt-5 rounded-2xl p-4 text-center"
                style={{ background: 'rgba(19,136,8,0.06)', border: '1px solid rgba(19,136,8,0.15)' }}>
                <p className="text-sm font-bold text-foreground">
                  🎁 Donate {Math.ceil((50 - totalPts) / 10)} more item{(50 - totalPts) > 10 ? 's' : ''} to unlock your first coupon!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You have {totalPts} pts. Need 50 pts for first coupon.
                </p>
                <Link to="/post-item"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                  <Gift className="h-3.5 w-3.5" /> Donate Now
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════ TAB: How to Earn ══════════════ */}
        {activeTab === 'earn' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {[
              { icon: '🎁', title: 'Donate an item', pts: '+10–25 pts', desc: 'Post any item on DaanGuru. Points scale with your tier.' },
              { icon: '✅', title: 'Item gets picked up', pts: '+5 pts', desc: 'Donor earns bonus when receiver confirms pickup via OTP.' },
              { icon: '📦', title: 'Receive an item', pts: '+10 pts', desc: 'When you collect a donated item and confirm via OTP.' },
              { icon: '👤', title: 'Complete your profile', pts: '+5 pts', desc: 'Add your name, photo, and city. One-time bonus.' },
              { icon: '👥', title: 'Refer a friend', pts: '+20 pts', desc: 'Friend signs up and donates their first item.' },
              { icon: '⭐', title: 'Leave a review', pts: '+10 pts', desc: 'Write a review for DaanGuru on your profile page.' },
              { icon: '🎂', title: 'Birthday bonus', pts: '+50 pts', desc: 'Extra points on your birthday! (Coming soon)' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 rounded-2xl bg-card card-shadow p-4">
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <span className="shrink-0 text-xs font-extrabold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(19,136,8,0.1)', color: '#138808' }}>
                  {item.pts}
                </span>
              </motion.div>
            ))}

            <div className="rounded-2xl bg-card card-shadow p-5">
              <h3 className="text-base font-extrabold text-foreground mb-3">Tier perks 🎖</h3>
              <div className="space-y-3">
                {Object.entries(TIERS).map(([key, t]) => (
                  <div key={key} className="flex items-start gap-3">
                    <span style={{ fontSize: 20 }}>{t.emoji}</span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: t.color }}>{t.label}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {TIER_PERKS[key].map(perk => (
                          <span key={perk} className="text-[11px] px-2 py-0.5 rounded-full"
                            style={{ background: t.bg, color: t.color }}>
                            {perk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              <Link to="/post-item"
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                <Gift className="h-4 w-4" />Start Donating & Earn Points
              </Link>
            </div>
          </motion.div>
        )}

        {/* ══════════════ TAB: History ══════════════ */}
        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {dataLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : txHistory.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-muted/30">
                <p className="text-3xl mb-3">📜</p>
                <p className="text-sm font-bold text-foreground">No history yet</p>
                <p className="text-xs text-muted-foreground mt-1">Donate an item to earn your first points!</p>
                <Link to="/post-item"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                  <Gift className="h-3.5 w-3.5" />Donate Now
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {txHistory.map((tx, i) => (
                  <motion.div key={tx.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 rounded-2xl bg-card card-shadow p-3.5">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: tx.points > 0 ? 'rgba(19,136,8,0.1)' : 'rgba(226,75,74,0.1)' }}>
                      <span style={{ fontSize: 16 }}>{tx.points > 0 ? '⬆' : '⬇'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {REASON_LABELS[tx.reason] ?? tx.reason}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className={`text-sm font-extrabold shrink-0 ${tx.points > 0 ? 'text-primary' : 'text-destructive'}`}>
                      {tx.points > 0 ? '+' : ''}{tx.points} pts
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </div>
    </>
  );
}
