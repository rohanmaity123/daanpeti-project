import { useState, useRef, useEffect } from "react";
import {
  Heart, MessageCircle, Share2, MoreHorizontal,
  MapPin, Bell, Search, Plus, Home, ShoppingBag,
  Newspaper, HelpCircle, Users, Calendar, Camera,
  ChevronRight, Flame, Clock, Navigation, TrendingUp,
  X, Image, Smile, Send, Bookmark, Flag,
  AlertTriangle, Dog, Gift, Wrench, Star, PenSquare,
  Eye, EyeOff, Mail, Lock, User, ArrowRight, LogOut,
  CheckCircle, AlertCircle, Loader
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../utils/supabaseClient";
import { Avatar } from "@mui/material";



// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CURRENT_USER_DEFAULT = { name: "Rahul M.", avatar: "R", neighborhood: "Jhargram West" };

const SEARCH_PLACEHOLDERS = [
  "Search for Electrician...", "Search for Plumber...",
  "House for Rent...", "Plot for Buy...",
  "Friends Group...", "Upcoming Events...",
];
const CATEGORIES_POST = [
  { id: "free-item", icon: "🎁", label: "Free Item", color: "#1D9E75" },
  { id: "need-help", icon: "🆘", label: "Need Help", color: "#ef4444" },
  { id: "ask", icon: "💬", label: "Ask", color: "#8b5cf6" },
  { id: "alert", icon: "⚠️", label: "Alert", color: "#f59e0b" },
  { id: "event", icon: "📅", label: "Event", color: "#3b82f6" },
  { id: "lost-found", icon: "🐕", label: "Lost & Found", color: "#f97316" },
  { id: "recommendation", icon: "⭐", label: "Recommendation", color: "#eab308" },
  { id: "other", icon: "📢", label: "Other", color: "#6b7280" },
  { id: "job", icon: "💼", label: "Job", color: "#10b981" },
  { id: "housing", icon: "🏠", label: "Rent/Buy", color: "#3b82f6" },
  { id: 'business', icon: "🏪", label: "Business", color: "#8b5cf6" },
];

const TRENDING = [
  { icon: "🔌", text: "Power cut schedule", count: "89 neighbors" },
  { icon: "🌧️", text: "Monsoon prep tips", count: "54 neighbors" },
  { icon: "🏥", text: "Best doctor Jhargram", count: "41 neighbors" },
  { icon: "🚌", text: "New bus route 18B", count: "38 neighbors" },
];

const NEARBY_ALERTS = [
  { icon: "🩸", text: "O+ blood needed urgently", color: "#ef4444", time: "30 min ago" },
  { icon: "📢", text: "New free items in your area", color: "#1D9E75", time: "1 hr ago" },
  { icon: "🐕", text: "Lost dog — Railway Station", color: "#f59e0b", time: "2 hr ago" },
];


// ─── UTILS ───────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

function getCategoryMeta(categoryId) {
  return CATEGORIES_POST.find(c => c.id === categoryId) || CATEGORIES_POST[2];
}

// ─── CATEGORY BADGE ──────────────────────────────────────────────────────────
function CategoryBadge({ icon, label, color }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 99,
      background: `${color}20`, border: `1px solid ${color}40`,
      fontSize: 11, fontWeight: 700, color, letterSpacing: "0.02em"
    }}>
      {icon} {label}
    </span>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ message, type, visible }) {
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
      background: type === "error" ? "#ef4444" : type === "success" ? "#1D9E75" : "#374151",
      color: "#fff", borderRadius: 99, padding: "10px 20px",
      fontSize: 13, fontWeight: 700, zIndex: 200,
      transition: "all 0.3s", opacity: visible ? 1 : 0,
      pointerEvents: "none", whiteSpace: "nowrap",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
    }}>
      {type === "success" ? "✓ " : type === "error" ? "✗ " : "ℹ "}{message}
    </div>
  );
}


// ─── IMAGE UPLOAD UTIL ────────────────────────────────────────────────────────
async function uploadImages(files, userId) {
  const urls = [];
  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("post-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

// ─── POST MODAL (with multi-image) ───────────────────────────────────────────
function PostModal({ onClose, onPost, currentUser, states, districts }) {
  const [text, setText] = useState("");
  const [selectedCategory, setCategory] = useState(null);
  const [selectedStateId, setStateId] = useState(null);
  const [selectedDistrictId, setDistrictId] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const textRef = useRef(null);
  const fileRef = useRef(null);

  // Districts filtered by selected state
  const filteredDistricts = selectedStateId
    ? districts.filter(d => d.states?.id === selectedStateId || d.state_id === selectedStateId)
    : districts;

  useEffect(() => { textRef.current?.focus(); }, []);
  useEffect(() => () => previews.forEach(u => URL.revokeObjectURL(u)), [previews]);

  const addImages = (incoming) => {
    const allowed = [...files, ...incoming].slice(0, 4);
    const newPreviews = allowed.slice(files.length).map(f => URL.createObjectURL(f));
    setFiles(allowed);
    setPreviews(p => [...p, ...newPreviews].slice(0, 4));
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setFiles(p => p.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const e = {};
    if (!text.trim() || text.trim().length < 10) e.text = "At least 10 characters";
    if (!selectedCategory) e.category = "Pick a category";
    if (!selectedStateId) e.state = "Pick a state";
    if (!selectedDistrictId) e.district = "Pick a district";
    return e;
  };

  const handlePost = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const imageUrls = files.length ? await uploadImages(files, currentUser.id) : [];
      await onPost({
        text: text.trim(), category: selectedCategory,
        district_id: selectedDistrictId, state_id: selectedStateId,
        images: imageUrls,
      });
      onClose();
    } catch (err) {
      setErrors({ submit: err.message || "Failed to post." });
    } finally {
      setLoading(false);
    }
  };

  const charLeft = 500 - text.length;
  const canPost = text.trim().length >= 10 && selectedCategory && selectedStateId && selectedDistrictId;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 560,
        background: "linear-gradient(145deg, #0f1f18, #111c15)",
        border: "1px solid rgba(29,158,117,0.2)",
        borderRadius: "24px 24px 0 0",
        padding: "24px 24px 32px",
        maxHeight: "90vh", overflowY: "auto",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar src={currentUser?.user_metadata?.avatar_url} size={36}>
              {(currentUser?.user_metadata?.full_name || "U")[0]}
            </Avatar>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                {currentUser?.user_metadata?.full_name || "You"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                📍 {currentUser?.user_metadata?.neighborhood || "Your neighborhood"}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 99, width: 32, height: 32, display: "flex",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
            color: "rgba(255,255,255,0.5)"
          }}><X size={15} /></button>
        </div>

        {/* Text area */}
        <div style={{ position: "relative", marginBottom: 4 }}>
          <textarea
            ref={textRef} value={text}
            onChange={e => { if (e.target.value.length <= 500) setText(e.target.value); setErrors(p => ({ ...p, text: "" })); }}
            placeholder="Kya ho raha hai aapke neighborhood mein? 🏘️"
            rows={4}
            style={{
              width: "100%", background: "rgba(255,255,255,0.05)",
              border: `1px solid ${errors.text ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 14, padding: "14px 16px", color: "#fff",
              fontSize: 15, fontFamily: "inherit", outline: "none",
              resize: "none", lineHeight: 1.6, boxSizing: "border-box",
            }}
          />
          <span style={{
            position: "absolute", bottom: 10, right: 12, fontSize: 11,
            color: charLeft < 50 ? "#f59e0b" : "rgba(255,255,255,0.2)", fontWeight: 700
          }}>{charLeft}</span>
        </div>
        {errors.text && <p style={{ fontSize: 12, color: "#f87171", margin: "4px 0 10px 2px" }}>⚠ {errors.text}</p>}

        {/* ── STATE PICKER ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8, letterSpacing: "0.06em" }}>
            🗺 STATE {errors.state && <span style={{ color: "#f87171" }}> — {errors.state}</span>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {states.map(s => {
              const active = selectedStateId === s.id;
              return (
                <button key={s.id}
                  onClick={() => {
                    setStateId(active ? null : s.id);
                    setDistrictId(null); // reset district when state changes
                    setErrors(p => ({ ...p, state: "", district: "" }));
                  }}
                  style={{
                    padding: "5px 12px", borderRadius: 99, cursor: "pointer",
                    background: active ? "rgba(29,158,117,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${active ? "rgba(29,158,117,0.6)" : "rgba(255,255,255,0.09)"}`,
                    color: active ? "#8EF0CC" : "rgba(255,255,255,0.5)",
                    fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}>
                  {active ? "✓ " : ""}{s.name}
                  <span style={{ fontSize: 10, opacity: 0.45, marginLeft: 4 }}>{s.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DISTRICT PICKER (cascades from state) ────────────────── */}
        {selectedStateId && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8, letterSpacing: "0.06em" }}>
              📍 DISTRICT {errors.district && <span style={{ color: "#f87171" }}> — {errors.district}</span>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {filteredDistricts.map(d => {
                const active = selectedDistrictId === d.id;
                return (
                  <button key={d.id}
                    onClick={() => { setDistrictId(active ? null : d.id); setErrors(p => ({ ...p, district: "" })); }}
                    style={{
                      padding: "5px 12px", borderRadius: 99, cursor: "pointer",
                      background: active ? "rgba(29,158,117,0.2)" : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${active ? "rgba(29,158,117,0.6)" : "rgba(255,255,255,0.09)"}`,
                      color: active ? "#8EF0CC" : "rgba(255,255,255,0.5)",
                      fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}>
                    {active ? "✓ " : ""}{d.name}
                    <span style={{ fontSize: 10, opacity: 0.45, marginLeft: 4 }}>{d.code}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Image upload */}
        <div onDrop={e => { e.preventDefault(); addImages(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"))); }}
          onDragOver={e => e.preventDefault()} style={{ marginBottom: 14 }}>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }}
            onChange={e => { addImages(Array.from(e.target.files)); e.target.value = ""; }} />
          {previews.length === 0 ? (
            <button onClick={() => fileRef.current?.click()} style={{
              width: "100%", border: "1.5px dashed rgba(29,158,117,0.35)", borderRadius: 14,
              padding: "18px 0", background: "rgba(29,158,117,0.04)",
              color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(29,158,117,0.6)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(29,158,117,0.35)"}
            >
              <Image size={16} color="#1D9E75" /> Add photos (up to 4) — click or drag & drop
            </button>
          ) : (
            <div>
              <div style={{
                display: "grid",
                gridTemplateColumns: previews.length === 1 ? "1fr" : "1fr 1fr",
                gap: 6, marginBottom: 8,
              }}>
                {previews.map((src, idx) => (
                  <div key={idx} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: previews.length === 1 ? "16/9" : "1/1" }}>
                    <img src={src} alt={`p${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <button onClick={() => removeImage(idx)} style={{
                      position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)",
                      border: "none", borderRadius: "50%", width: 24, height: 24,
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}><X size={12} color="#fff" /></button>
                  </div>
                ))}
              </div>
              {previews.length < 4 && (
                <button onClick={() => fileRef.current?.click()} style={{
                  background: "rgba(29,158,117,0.08)", border: "1px dashed rgba(29,158,117,0.3)",
                  borderRadius: 10, padding: "7px 14px", color: "#1D9E75",
                  fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Image size={13} /> Add more ({previews.length}/4)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Category picker */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8, letterSpacing: "0.06em" }}>
            CATEGORY {errors.category && <span style={{ color: "#f87171" }}>— {errors.category}</span>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CATEGORIES_POST.map(cat => {
              const active = selectedCategory === cat.id;
              return (
                <button key={cat.id}
                  onClick={() => { setCategory(active ? null : cat.id); setErrors(p => ({ ...p, category: "" })); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                    borderRadius: 99, cursor: "pointer",
                    background: active ? `${cat.color}25` : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${active ? cat.color + "70" : "rgba(255,255,255,0.09)"}`,
                    color: active ? cat.color : "rgba(255,255,255,0.5)",
                    fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                    transform: active ? "scale(1.04)" : "scale(1)", transition: "all 0.15s",
                  }}>
                  {cat.icon} {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {errors.submit && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 10, padding: "9px 12px", marginBottom: 12, fontSize: 12, color: "#f87171"
          }}>✗ {errors.submit}</div>
        )}
        {loading && files.length > 0 && (
          <div style={{ fontSize: 12, color: "rgba(29,158,117,0.8)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Loader size={13} style={{ animation: "spin 1s linear infinite" }} />
            Uploading {files.length} image{files.length > 1 ? "s" : ""}…
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px 0", borderRadius: 99,
            border: "1px solid rgba(255,255,255,0.1)", background: "none",
            color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit"
          }}>Cancel</button>
          <button onClick={handlePost} disabled={loading} style={{
            flex: 2, padding: "12px 0", borderRadius: 99, border: "none",
            background: canPost ? "#1D9E75" : "rgba(29,158,117,0.25)",
            color: canPost ? "#fff" : "rgba(255,255,255,0.3)",
            fontSize: 14, fontWeight: 800, cursor: loading ? "default" : "pointer",
            fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}>
            {loading
              ? <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> Posting…</>
              : <><Send size={15} /> Post to Neighborhood</>}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── POST CARD ────────────────────────────────────────────────────────────────
function PostCard({ post, onLike, onSave, onComment, isLoggedIn, onAuthRequired }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");

  const guard = (fn) => {
    if (!isLoggedIn) { onAuthRequired(); return; }
    fn();
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    onComment(post.id, comment.trim());
    setComment("");
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20, padding: "18px 20px", marginBottom: 12,
      transition: "border-color 0.2s", position: "relative",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(29,158,117,0.25)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
    >
      {post.urgent && (
        <div style={{
          position: "absolute", top: -1, left: 20, right: 20, height: 2,
          background: `linear-gradient(90deg, ${post.category_color}, transparent)`,
          borderRadius: "0 0 4px 4px"
        }} />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={post.author || post.avatar_initial} color={post.avatar_color || "#1D9E75"} size={40} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>{post.author}</span>
              <CategoryBadge icon={post.category_icon} label={post.category_label} color={post.category_color} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <MapPin size={11} color="#1D9E75" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{post.location}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>·</span>
              <Clock size={11} color="rgba(255,255,255,0.3)" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                {post.time_label || timeAgo(post.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <button onClick={() => setShowMenu(v => !v)} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.4)", padding: 4, borderRadius: 8, display: "flex"
          }}>
            <MoreHorizontal size={18} />
          </button>
          {showMenu && (
            <div style={{
              position: "absolute", right: 0, top: 28, zIndex: 10,
              background: "#1a2a22", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, padding: 6, minWidth: 140,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
            }}>
              {[
                ["🔖 Save post", () => guard(() => onSave(post.id))],
                ["🚩 Report", () => guard(() => { })],
                ["❌ Hide", () => { }],
              ].map(([label, fn]) => (
                <button key={label} onClick={() => { fn(); setShowMenu(false); }} style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: "none", border: "none", padding: "7px 10px",
                  fontSize: 13, color: "rgba(255,255,255,0.7)", cursor: "pointer",
                  borderRadius: 8, fontFamily: "inherit"
                }}
                  onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={e => e.target.style.background = "none"}
                >{label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.7, marginBottom: 14 }}>
        {post.content}
      </p>

      {/* Emoji visual */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14, padding: "20px 16px", textAlign: "center", marginBottom: 14, fontSize: 48
      }}>
        {post.emoji || "📢"}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => guard(() => onLike(post.id))} style={{
          display: "flex", alignItems: "center", gap: 5,
          background: post.liked ? "rgba(239,68,68,0.12)" : "none",
          border: post.liked ? "1px solid rgba(239,68,68,0.25)" : "1px solid transparent",
          borderRadius: 99, padding: "6px 12px", cursor: "pointer",
          color: post.liked ? "#f87171" : "rgba(255,255,255,0.45)",
          fontSize: 13, fontWeight: 700, fontFamily: "inherit",
          transition: "all 0.15s"
        }}>
          <Heart size={14} fill={post.liked ? "#f87171" : "none"} />
          {post.likes ?? 0}
        </button>

        <button onClick={() => guard(() => setShowComments(v => !v))} style={{
          display: "flex", alignItems: "center", gap: 5,
          background: showComments ? "rgba(29,158,117,0.12)" : "none",
          border: "1px solid transparent", borderRadius: 99, padding: "6px 12px",
          cursor: "pointer",
          color: showComments ? "#8EF0CC" : "rgba(255,255,255,0.45)",
          fontSize: 13, fontWeight: 700, fontFamily: "inherit"
        }}>
          <MessageCircle size={14} />
          {post.comments ?? 0}
        </button>

        <button onClick={() => guard(() => {
          navigator.clipboard?.writeText(window.location.href).catch(() => { });
        })} style={{
          display: "flex", alignItems: "center", gap: 5,
          background: "none", border: "1px solid transparent",
          borderRadius: 99, padding: "6px 12px", cursor: "pointer",
          color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 700, fontFamily: "inherit"
        }}>
          <Share2 size={14} /> Share
        </button>

        <button onClick={() => guard(() => onSave(post.id))} style={{
          marginLeft: "auto",
          background: post.saved ? "rgba(29,158,117,0.12)" : "none",
          border: post.saved ? "1px solid rgba(29,158,117,0.3)" : "1px solid transparent",
          borderRadius: 99, padding: "6px 10px", cursor: "pointer",
          color: post.saved ? "#8EF0CC" : "rgba(255,255,255,0.35)", fontFamily: "inherit"
        }}>
          <Bookmark size={14} fill={post.saved ? "#8EF0CC" : "none"} />
        </button>
      </div>

      {/* Guest notice on comments area */}
      {showComments && !isLoggedIn && (
        <div style={{
          marginTop: 12, padding: "12px 14px",
          background: "rgba(29,158,117,0.07)", borderRadius: 12,
          border: "1px solid rgba(29,158,117,0.15)",
          textAlign: "center"
        }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
            Sign in to read and write comments
          </p>
          <button onClick={onAuthRequired} style={{
            background: "#1D9E75", border: "none", borderRadius: 99, padding: "7px 18px",
            color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit"
          }}>Sign In</button>
        </div>
      )}

      {/* Comment input (logged-in only) */}
      {showComments && isLoggedIn && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Avatar name="R" size={30} />
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.05)", borderRadius: 99,
              padding: "6px 14px", border: "1px solid rgba(255,255,255,0.08)"
            }}>
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleComment()}
                placeholder="Add a comment…"
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "#fff", fontSize: 13, fontFamily: "inherit"
                }}
              />
              {comment && (
                <button onClick={handleComment} style={{
                  background: "#1D9E75", border: "none", borderRadius: 99,
                  padding: "4px 10px", color: "#fff", fontSize: 12,
                  fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center"
                }}>
                  <Send size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TYPEWRITER SEARCH ─────────────────────────────────────────────────────────
function TypewriterSearch() {
  const [phIdx, setPhIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (focused) return;
    const target = SEARCH_PLACEHOLDERS[phIdx];
    let t;
    if (!deleting) {
      if (displayed.length < target.length) {
        t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
      } else {
        t = setTimeout(() => setDeleting(true), 1800);
      }
    } else {
      if (displayed.length > 0) {
        t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
      } else {
        setDeleting(false);
        setPhIdx(i => (i + 1) % SEARCH_PLACEHOLDERS.length);
      }
    }
    return () => clearTimeout(t);
  }, [displayed, deleting, phIdx, focused]);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      border: `1.5px solid ${focused ? "rgba(29,158,117,0.5)" : "rgba(255,255,255,0.1)"}`,
      borderRadius: 99, padding: "10px 16px",
      background: "rgba(255,255,255,0.03)",
      transition: "border-color 0.2s, box-shadow 0.2s",
      boxShadow: focused ? "0 0 0 3px rgba(29,158,117,0.1)" : "none",
      marginBottom: 14
    }}>
      <Search size={16} color={focused ? "#1D9E75" : "#6b7280"} strokeWidth={2.5} style={{ flexShrink: 0 }} />
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={displayed + (focused ? "" : "|")}
        style={{
          flex: 1, background: "none", border: "none", outline: "none",
          fontSize: 14, color: "#fff", fontFamily: "inherit", caretColor: "#1D9E75"
        }}
      />
      {value && (
        <button onClick={() => setValue("")} style={{
          background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%",
          width: 18, height: 18, display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer", padding: 0
        }}>
          <X size={10} color="#9ca3af" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function CommunityFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("for-you");
  const [activeNav, setActiveNav] = useState("community");
  const [showPost, setShowPost] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info", visible: false });
  // ─── LOCATION STATE ──────────────────────────────────────────────────────────
  // (add these inside CommunityFeed, near top of component)
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [activeDistrict, setActiveDistrict] = useState(null); // { id, code, name }
  const [activeState, setActiveState] = useState(null); // { id, code, name }
  // Toast helper
  const showToast = (message, type = "info", ms = 3000) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), ms);
  };

  // ── Boot: check Supabase session ──────────────────────────────────────────
  useEffect(() => {
    loadLocationData(setStates, setDistricts);
    loadPosts();
  }, []);

  // ─── LOAD STATES + DISTRICTS FROM SUPABASE ───────────────────────────────────
  async function loadLocationData(setStates, setDistricts) {
    const [{ data: statesData }, { data: distData }] = await Promise.all([
      supabase.from("states").select("*").order("name"),
      supabase.from("districts").select("*, states(id, code, name)").order("name"),
    ]);
    if (statesData) setStates(statesData);
    if (distData) setDistricts(distData);
  }
  const loadPosts = async (districtId = null, stateId = null) => {
    let query = supabase
      .from("posts")
      .select(`
      *,
      profiles (full_name, neighborhood, avatar_url),
      districts (id, code, name),
      states    (id, code, name)
    `)
      .order("created_at", { ascending: false });

    if (districtId) query = query.eq("district_id", districtId);
    else if (stateId) query = query.eq("state_id", stateId);

    const { data, error } = await query;
    if (error) { console.error(error.message); return; }

    if (data?.length) {
      setPosts(data.map(row => {
        const cat = getCategoryMeta(row.category);
        return {
          ...row,
          author: row.profiles?.full_name || "Anonymous",
          avatar_initial: (row.profiles?.full_name || "A")[0],
          avatar_color: "#1D9E75",
          location: row.districts?.name || row.states?.name || "Nearby",
          district_label: row.districts?.name,
          district_code: row.districts?.code,
          state_label: row.states?.name,
          category_label: cat.label,
          category_icon: cat.icon,
          category_color: cat.color,
          emoji: cat.icon,
          liked: false,
          saved: false,
          urgent: row.category === "alert" || row.category === "need-help",
        };
      }));
    } else {
      setPosts(SEED_POSTS); // fallback
    }
  };


  // ── Like / Save (optimistic UI) ────────────────────────────────────────────
  const handleLike = async (id) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
    if (user) {
      const post = posts.find(p => p.id === id);
      if (post?.liked) {
        await supabase.from("likes").delete().match({ post_id: id, user_id: user.id });
      } else {
        await supabase.from("likes").insert({ post_id: id, user_id: user.id });
      }
    }
  };

  const handleSave = (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
    showToast(
      posts.find(p => p.id === id)?.saved ? "Removed from saved" : "Post saved ✓",
      "success"
    );
  };

  const handleComment = (postId, text) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    if (user) {
      supabase.from("comments").insert({ post_id: postId, user_id: user.id, content: text });
    }
    showToast("Comment posted ✓", "success");
  };

  // ── Create Post ────────────────────────────────────────────────────────────
  const handlePost = async ({ text, category, district_id, state_id, images = [] }) => {
    const cat = getCategoryMeta(category);
    const district = districts.find(d => d.id === district_id);
    const state = states.find(s => s.id === state_id);

    const newPost = {
      id: Date.now(),
      user_id: user?.id || null,
      author: currentUser.name,
      avatar_initial: currentUser.name[0],
      avatar_color: "#1D9E75",
      location: district?.name || state?.name || "Nearby",
      district_label: district?.name,
      district_code: district?.code,
      state_label: state?.name,
      time_label: "Just now",
      category,
      category_label: cat.label,
      category_icon: cat.icon,
      category_color: cat.color,
      content: text,
      images,
      emoji: cat.icon,
      likes: 0, comments: 0, liked: false, saved: false,
      urgent: category === "alert" || category === "need-help",
    };
    setPosts(prev => [newPost, ...prev]);
    showToast("Post shared with your neighborhood 🎉", "success");

    if (user) {
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: text,
        category,
        district_id: district_id || null,
        state_id: state_id || null,
        images,
      });
      if (error) console.error("Insert error:", error.message);
    }
  };

  // ── Filtered posts ─────────────────────────────────────────────────────────
  const filteredPosts = posts.filter(p => {
    if (activeTab === "nearby") return p.location?.includes("Jhargram") || p.location?.includes("Midnapore");
    if (activeTab === "trending") return (p.likes ?? 0) > 30;
    return true;
  });

  const currentUser = {
    name: user?.user_metadata?.full_name || user?.user_metadata?.email?.split("@")[0] || CURRENT_USER_DEFAULT.name,
    neighborhood: user?.neighborhood || CURRENT_USER_DEFAULT.neighborhood,
  };

  const NAV = [
    { id: "home", icon: <Home size={20} />, label: "Home" },
    { id: "free", icon: <ShoppingBag size={20} />, label: "Free Items" },
    { id: "community", icon: <Users size={20} />, label: "Community" },
    { id: "ask", icon: <HelpCircle size={20} />, label: "Ask" },
    { id: "events", icon: <Calendar size={20} />, label: "Events" },
  ];

  return (
    <>

      {/* ── MAIN GRID ───────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "20px 16px",
        display: "grid", gridTemplateColumns: "240px 1fr 280px", gap: 20
      }} className="feed-grid">
        <style>{`
          @media (max-width: 1024px) {
            .feed-grid { grid-template-columns: 1fr !important; }
            .left-sidebar, .right-sidebar { display: none !important; }
          }
          @media (max-width: 768px) {
            .feed-grid { padding: 10px 8px !important; }
          }
        `}</style>

        {/* ── LEFT SIDEBAR ──────────────────────────────────────────── */}
        <aside className="left-sidebar" style={{ position: "sticky", top: 80, alignSelf: "start" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map(item => (
              <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 14, border: "none",
                background: activeNav === item.id ? "rgba(29,158,117,0.15)" : "none",
                color: activeNav === item.id ? "#8EF0CC" : "rgba(255,255,255,0.55)",
                fontWeight: activeNav === item.id ? 800 : 600,
                fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                textAlign: "left", transition: "all 0.15s",
                borderLeft: activeNav === item.id ? "3px solid #1D9E75" : "3px solid transparent"
              }}>
                {item.icon} {item.label}
              </button>
            ))}
          </nav>

          <div style={{
            marginTop: 20, padding: "14px 16px",
            background: "rgba(29,158,117,0.08)", border: "1px solid rgba(29,158,117,0.2)",
            borderRadius: 16
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1D9E75", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              📍 Your Area
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 2 }}>
              {currentUser.neighborhood}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>342 neighbors active</div>
            <button style={{
              marginTop: 10, width: "100%", background: "#1D9E75",
              border: "none", borderRadius: 99, padding: "8px 0",
              color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer",
              fontFamily: "inherit", boxShadow: "0 0 16px rgba(29,158,117,0.3)"
            }}>
              + Invite Neighbors
            </button>
          </div>
        </aside>
        {/* ── MAIN FEED ─────────────────────────────────────────────── */}
        <main style={{ minWidth: 0 }}>
          {/* Nearby alerts */}
          <div style={{
            background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 16, padding: "10px 14px", marginBottom: 14,
            display: "flex", flexDirection: "column", gap: 6
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
              ⚡ Nearby Alerts
            </div>
            {NEARBY_ALERTS.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{a.icon}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{a.text}</span>
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{a.time}</span>
              </div>
            ))}
          </div>

          <TypewriterSearch />

          {/* Compose prompt — opens modal */}
          <button onClick={() => user ? setShowPost(true) : setShowAuth(true)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(29,158,117,0.2)",
            borderRadius: 20, padding: "14px 18px", marginBottom: 14,
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            transition: "border-color 0.2s"
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(29,158,117,0.4)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(29,158,117,0.2)"}
          >
            <Avatar src={user?.user_metadata?.avatar_url} name={user?.user_metadata?.full_name || user?.user_metadata?.email?.split("@")[0]} color="#1D9E75" size={36}>
              {user ? (user?.user_metadata?.full_name || user?.user_metadata?.email?.split("@")[0] || "U")[0] : "G"}
            </Avatar>
            <span style={{ flex: 1, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
              Kya ho raha hai aapke neighborhood mein? 🏘️
            </span>
            <div style={{
              background: "#1D9E75", borderRadius: 99, padding: "6px 14px",
              color: "#fff", fontSize: 12, fontWeight: 800, flexShrink: 0
            }}>Post</div>
          </button>

          {/* Tabs */}
          <div style={{
            display: "flex", gap: 4, marginBottom: 14, padding: "4px",
            background: "rgba(255,255,255,0.04)", borderRadius: 99,
            border: "1px solid rgba(255,255,255,0.07)"
          }}>
            {[
              { id: "for-you", icon: <Star size={13} />, label: "For You" },
              { id: "nearby", icon: <Navigation size={13} />, label: "Nearby" },
              { id: "trending", icon: <TrendingUp size={13} />, label: "Trending" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                padding: "8px 0", borderRadius: 99, border: "none",
                background: activeTab === tab.id ? "rgba(29,158,117,0.8)" : "none",
                color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.45)",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s",
                boxShadow: activeTab === tab.id ? "0 0 16px rgba(29,158,117,0.3)" : "none"
              }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {filteredPosts.map(post => (
            <div key={post.id} className="post-card">
              <PostCard
                post={post}
                onLike={handleLike}
                onSave={handleSave}
                onComment={handleComment}
                isLoggedIn={!!user}
                onAuthRequired={() => setShowAuth(true)}
              />
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: 48 }}>🔍</div>
              <p style={{ marginTop: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)" }}>No posts here yet</p>
            </div>
          )}
        </main>

        {/* ── RIGHT SIDEBAR ──────────────────────────────────────────── */}
        <aside className="right-sidebar" style={{ position: "sticky", top: 80, alignSelf: "start", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Trending */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Flame size={14} color="#f97316" /> Trending in Jhargram
            </div>
            {TRENDING.map((t, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 0", borderBottom: i < TRENDING.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                cursor: "pointer"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{t.text}</span>
                </div>
                <span style={{ fontSize: 11, color: "#1D9E75", fontWeight: 700 }}>{t.count}</span>
              </div>
            ))}
          </div>

          {/* Quick Post CTA */}
          <div style={{
            background: "linear-gradient(135deg, rgba(29,158,117,0.15), rgba(21,128,61,0.1))",
            border: "1px solid rgba(29,158,117,0.25)", borderRadius: 18, padding: 16, textAlign: "center"
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏘️</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 6 }}>Know something local?</div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 12 }}>
              Share alerts, free items, events or questions with your neighbors.
            </p>
            <button onClick={() => user ? setShowPost(true) : setShowAuth(true)} style={{
              width: "100%", background: "#1D9E75", border: "none", borderRadius: 99,
              padding: "9px 0", color: "#fff", fontSize: 13, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 20px rgba(29,158,117,0.35)"
            }}>
              + Create Post
            </button>
          </div>

          {/* Categories */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Post Categories
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {CATEGORIES_POST.map(cat => (
                <div key={cat.id} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                  borderRadius: 10, cursor: "pointer", transition: "background 0.15s"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: `${cat.color}20`, border: `1px solid ${cat.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
                  }}>{cat.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>{cat.label}</span>
                  <ChevronRight size={12} color="rgba(255,255,255,0.2)" style={{ marginLeft: "auto" }} />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── MOBILE BOTTOM NAV ──────────────────────────────────────── */}
      <nav style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        borderRadius: 99,
        boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.07)",
        // Removed display: "flex" from here to prevent style overriding Tailwind
        alignItems: "center",
        padding: "6px 8px",
        gap: 0,
        width: "calc(100% - 40px)",
        maxWidth: 440,
        minWidth: 320,
      }} className="flex lg:hidden backdrop-blur-md mobile-nav supports-[backdrop-filter]:bg-black/30">
        {[
          { id: "home", icon: <Home size={20} />, label: "Home" },
          { id: "search", icon: <Search size={20} />, label: "Search" },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, background: "none", border: "none", cursor: "pointer",
            color: activeNav === item.id ? "#1D9E75" : "#ffffff",
            padding: "7px 4px", borderRadius: 99
          }}>
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: 700 }}>{item.label}</span>
            {activeNav === item.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#1D9E75", marginTop: -2 }} />}
          </button>
        ))}

        {/* FAB */}
        <div style={{ flex: "0 0 auto", padding: "0 10px" }}>
          <button onClick={() => user ? setShowPost(true) : setShowAuth(true)} style={{
            width: 54, height: 54, borderRadius: "50%",
            background: "linear-gradient(135deg, #1D9E75, #15803D)",
            border: "3px solid #ffffff",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", flexDirection: "column", gap: 1,
            boxShadow: "0 4px 20px #ffffffe0",
            marginTop: -20, flexShrink: 0
          }}>
            <PenSquare size={20} color="#fff" strokeWidth={2.2} />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.9)", fontWeight: 800 }}>POST</span>
          </button>
        </div>

        {[
          { id: "free", icon: <ShoppingBag size={20} />, label: "For Sale" },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, background: "none", border: "none", cursor: "pointer",
            color: activeNav === item.id ? "#1D9E75" : "#ffffff",
            padding: "7px 4px", borderRadius: 99
          }}>
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: 700 }}>{item.label}</span>
            {activeNav === item.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#1D9E75", marginTop: -2 }} />}
          </button>
        ))}

        {/* Avatar / Profile */}
        <button onClick={() => user ? setActiveNav("profile") : setShowAuth(true)} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          gap: 2, background: "none", border: "none", cursor: "pointer",
          padding: "7px 4px", borderRadius: 99
        }}>
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="avatar"
              className="h-6 w-6 rounded-full ring-2 object-cover"
              style={{ ringColor: '#1D9E75' }} />
          ) : (
            <div className="h-6 w-6 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
              {(user?.user_metadata?.full_name ?? user?.email ?? 'U')[0].toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: 10, fontWeight: 700, color: activeNav === "profile" ? "#1D9E75" : "#ffffff" }}>
            {user ? "Profile" : "Sign In"}
          </span>
        </button>
      </nav>

      {showPost && user && (
        <PostModal
          onClose={() => setShowPost(false)}
          onPost={handlePost}
          currentUser={user}
          states={states}
          districts={districts}
        />
      )}

      {/* ── TOAST ───────────────────────────────────────────────────── */}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </>
  );
}
