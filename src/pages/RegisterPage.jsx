import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

function parseFirebaseError(code) {
  switch (code) {
    case "auth/email-already-in-use": return "An account with this email already exists.";
    case "auth/invalid-email":        return "Please enter a valid email address.";
    case "auth/weak-password":        return "PIN must be at least 4 digits.";
    case "auth/too-many-requests":    return "Too many attempts. Please try again later.";
    default:                          return "Something went wrong. Please try again.";
  }
}

function generateUserId() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function LockerIllustration() {
  const [locked, setLocked] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setLocked(l => !l), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ position:"relative", width:260, height:300 }}>
      <div style={{
        position:"absolute", inset:0, borderRadius:"20px",
        background: locked
          ? "radial-gradient(circle at 50% 50%, rgba(239,68,68,0.12) 0%, transparent 70%)"
          : "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.15) 0%, transparent 70%)",
        transition:"background 1s ease"
      }}/>
      <div style={{
        position:"absolute", inset:"28px 18px 18px", borderRadius:"14px",
        background:"rgba(10,12,28,0.85)",
        border:`2px solid ${locked ? "rgba(239,68,68,0.35)" : "rgba(34,211,238,0.35)"}`,
        transition:"border-color 0.8s ease",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px"
      }}>
        <div style={{ transition:"transform 0.5s ease", transform: locked ? "none" : "rotate(-15deg)" }}>
          {locked ? (
            <svg width="48" height="48" viewBox="0 0 56 56" fill="none">
              <rect x="10" y="26" width="36" height="26" rx="6" fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="2"/>
              <path d="M18 26v-8a10 10 0 0120 0v8" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="28" cy="40" r="3" fill="#ef4444"/>
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 56 56" fill="none">
              <rect x="10" y="26" width="36" height="26" rx="6" fill="rgba(34,211,238,0.12)" stroke="#22d3ee" strokeWidth="2"/>
              <path d="M18 26v-8a10 10 0 0120 0" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="28" cy="40" r="3" fill="#22d3ee"/>
            </svg>
          )}
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontWeight:700, fontSize:"0.85rem", letterSpacing:"0.15em", color: locked ? "#ef4444" : "#22d3ee", transition:"color 0.8s ease" }}>
            {locked ? "LOCKED" : "UNLOCKED"}
          </div>
          <div style={{ color:"#475569", fontSize:"0.7rem", marginTop:"4px" }}>
            {locked ? "Awaiting verification" : "Access granted"}
          </div>
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width:8, height:8, borderRadius:"50%",
              background: locked ? "rgba(239,68,68,0.25)" : "#22d3ee",
              border:`1.5px solid ${locked ? "#ef4444" : "#22d3ee"}`,
              transition:`background 0.8s ease ${i*0.1}s`
            }}/>
          ))}
        </div>
      </div>
      <div style={{
        position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
        background:"rgba(10,12,28,0.9)",
        border:`1px solid ${locked ? "rgba(239,68,68,0.35)" : "rgba(34,211,238,0.35)"}`,
        borderRadius:"16px", padding:"4px 14px",
        fontSize:"0.7rem", color: locked ? "#ef4444" : "#22d3ee",
        fontWeight:600, transition:"all 0.8s ease", whiteSpace:"nowrap"
      }}>
        {locked ? "🔴 Secured" : "🟢 Access Granted"}
      </div>
    </div>
  );
}

function Field({ label, hint, type="text", placeholder, value, onChange, right, maxLength, inputMode }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"7px", alignItems:"center" }}>
        <label style={{ color:"#94a3b8", fontSize:"0.82rem", fontWeight:500 }}>{label}</label>
        {hint && <span style={{ color:"#475569", fontSize:"0.72rem" }}>{hint}</span>}
      </div>
      <div style={{ position:"relative" }}>
        <input
          type={type} placeholder={placeholder} value={value} onChange={onChange}
          maxLength={maxLength} inputMode={inputMode}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width:"100%", padding:"11px 16px", boxSizing:"border-box", borderRadius:"10px",
            fontSize:"0.92rem", background:"rgba(10,12,28,0.6)",
            border:`1.5px solid ${focused ? "rgba(99,102,241,0.6)" : "rgba(99,102,241,0.18)"}`,
            color:"#e2e8f0", outline:"none", transition:"border-color 0.2s ease",
            paddingRight: right ? "44px" : "16px"
          }}
        />
        {right && (
          <div style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"#475569" }}>
            {right}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [form, setForm] = useState({ fullName:"", username:"", email:"", mobile:"", pin:"", confirmPin:"" });
  const [showPin, setShowPin]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const set = (key) => (e) => {
    let val = e.target.value;
    if (key === "pin" || key === "confirmPin") val = val.replace(/\D/g, "").slice(0, 6);
    if (key === "mobile") val = val.replace(/\D/g, "").slice(0, 10);
    setForm(f => ({ ...f, [key]: val }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.fullName || !form.username || !form.email || !form.mobile || !form.pin) {
      setError("Please fill in all fields."); return;
    }
    if (form.pin.length < 4) { setError("PIN must be at least 4 digits."); return; }
    if (form.pin !== form.confirmPin) { setError("PINs don't match."); return; }
    if (form.mobile.length < 10) { setError("Enter a valid 10-digit mobile number."); return; }

    setLoading(true);
    try {
      const userId = generateUserId();
      await register({
        email:        form.email.trim(),
        // Firebase Auth requires passwords >= 6 chars, but lockerPin can be 4-6 digits.
        // Pad short PINs so Firebase accepts them; lockerPin keeps the real PIN.
        password:     form.pin.padEnd(6, "0"),
        fullName:     form.fullName.trim(),
        username:     form.username.trim(),
        mobileNumber: form.mobile.trim(),
        userId,
        lockerPin:    form.pin,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(parseFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      {open
        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/></>
      }
    </svg>
  );

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg, #0a0c1c 0%, #0d1025 50%, #0a1120 100%)",
      fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", padding:"24px"
    }}>
      <div style={{ display:"flex", gap:"60px", alignItems:"center", maxWidth:"980px", width:"100%", flexWrap:"wrap", justifyContent:"center" }}>

        {/* Left panel */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"20px" }}>
          <LockerIllustration />
          <div style={{ textAlign:"center" }}>
            <h2 style={{ fontSize:"1.6rem", fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.03em", marginBottom:"8px" }}>Smart Locker System</h2>
            <p style={{ color:"#64748b", fontSize:"0.88rem", maxWidth:"220px", lineHeight:1.6 }}>Secure access with PIN + OTP two-factor authentication.</p>
          </div>
          <div style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:12, padding:"14px 18px", maxWidth:230 }}>
            <div style={{ color:"#818cf8", fontSize:"0.72rem", fontWeight:600, marginBottom:8, letterSpacing:"0.05em", textTransform:"uppercase" }}>At the locker, you enter:</div>
            {[
              { n:"①", label:"User ID", desc:"Auto-generated 4-digit number" },
              { n:"②", label:"PIN",     desc:"The numeric PIN you set here" },
              { n:"③", label:"OTP",     desc:"From the web app, valid 60 sec" },
            ].map(r => (
              <div key={r.n} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
                <span style={{ color:"#6366f1", fontWeight:700, fontSize:"0.82rem", flexShrink:0 }}>{r.n}</span>
                <div>
                  <span style={{ color:"#94a3b8", fontSize:"0.78rem", fontWeight:600 }}>{r.label}</span>
                  <span style={{ color:"#475569", fontSize:"0.75rem" }}> — {r.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Register card */}
        <div style={{
          background:"rgba(15,17,35,0.75)", backdropFilter:"blur(20px)",
          border:"1px solid rgba(99,102,241,0.2)", borderRadius:"20px",
          padding:"36px 32px", width:"100%", maxWidth:"400px",
          boxShadow:"0 24px 64px rgba(0,0,0,0.4)"
        }}>
          <div style={{ marginBottom:"20px" }}>
            <div style={{ width:44, height:44, borderRadius:"12px", background:"linear-gradient(135deg,#6366f1,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"14px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.03em", marginBottom:"4px" }}>Create account</h1>
            <p style={{ color:"#64748b", fontSize:"0.85rem" }}>Your User ID will be shown on your profile after signup.</p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <Field label="Full Name" placeholder="John Doe" value={form.fullName} onChange={set("fullName")} />
            <Field label="Username" placeholder="johndoe_123" value={form.username} onChange={set("username")} />
            <Field label="Email Address" type="email" placeholder="john@example.com" value={form.email} onChange={set("email")} />
            <Field label="Mobile Number" placeholder="9876543210" hint="10 digits" type="tel" inputMode="numeric" value={form.mobile} onChange={set("mobile")} maxLength={10} />

            {/* PIN field */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"7px", alignItems:"center" }}>
                <label style={{ color:"#94a3b8", fontSize:"0.82rem", fontWeight:500 }}>Keypad PIN</label>
                <span style={{ padding:"2px 8px", borderRadius:20, background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.25)", color:"#818cf8", fontSize:"0.68rem", fontWeight:600 }}>
                  NUMBERS ONLY · 4–6 digits
                </span>
              </div>
              <div style={{ position:"relative" }}>
                <input
                  type={showPin ? "text" : "password"}
                  placeholder="e.g. 4821"
                  value={form.pin} onChange={set("pin")}
                  maxLength={6} inputMode="numeric" pattern="[0-9]*"
                  onFocus={e => e.target.style.borderColor="rgba(99,102,241,0.6)"}
                  onBlur={e => e.target.style.borderColor="rgba(99,102,241,0.18)"}
                  style={{ width:"100%", padding:"11px 44px 11px 16px", boxSizing:"border-box", borderRadius:"10px", fontSize:"1.2rem", letterSpacing:"0.4em", background:"rgba(10,12,28,0.6)", border:"1.5px solid rgba(99,102,241,0.18)", color:"#e2e8f0", outline:"none" }}
                />
                <div onClick={() => setShowPin(p => !p)} style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"#475569" }}>
                  <EyeIcon open={showPin} />
                </div>
              </div>
              <div style={{ color:"#334155", fontSize:"0.72rem", marginTop:4 }}>
                This is the PIN you type on the physical keypad to open the locker.
              </div>
            </div>

            {/* Confirm PIN */}
            <div>
              <label style={{ display:"block", color:"#94a3b8", fontSize:"0.82rem", fontWeight:500, marginBottom:"7px" }}>Confirm PIN</label>
              <div style={{ position:"relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat PIN"
                  value={form.confirmPin} onChange={set("confirmPin")}
                  maxLength={6} inputMode="numeric" pattern="[0-9]*"
                  onFocus={e => e.target.style.borderColor="rgba(99,102,241,0.6)"}
                  onBlur={e => e.target.style.borderColor = form.confirmPin && form.confirmPin !== form.pin ? "rgba(239,68,68,0.5)" : "rgba(99,102,241,0.18)"}
                  style={{ width:"100%", padding:"11px 44px 11px 16px", boxSizing:"border-box", borderRadius:"10px", fontSize:"1.2rem", letterSpacing:"0.4em", background:"rgba(10,12,28,0.6)", border:`1.5px solid ${form.confirmPin && form.confirmPin !== form.pin ? "rgba(239,68,68,0.4)" : "rgba(99,102,241,0.18)"}`, color:"#e2e8f0", outline:"none" }}
                />
                <div onClick={() => setShowConfirm(p => !p)} style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"#475569" }}>
                  <EyeIcon open={showConfirm} />
                </div>
              </div>
              {form.confirmPin && form.confirmPin !== form.pin && (
                <div style={{ color:"#f87171", fontSize:"0.72rem", marginTop:4 }}>PINs don't match</div>
              )}
            </div>
          </div>

          {error && (
            <div style={{ marginTop:"14px", padding:"10px 14px", borderRadius:"8px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#f87171", fontSize:"0.84rem" }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width:"100%", marginTop:"18px", padding:"13px", borderRadius:"10px", border:"none",
            cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366f1,#818cf8)",
            color:"#fff", fontWeight:700, fontSize:"0.95rem",
            boxShadow: loading ? "none" : "0 0 24px rgba(99,102,241,0.35)",
            transition:"all 0.3s ease", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px"
          }}>
            {loading ? (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ animation:"spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Creating account…</>
            ) : (
              <>Create Account<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></>
            )}
          </button>

          <p style={{ textAlign:"center", color:"#475569", fontSize:"0.85rem", marginTop:"16px" }}>
            Already have an account?{" "}
            <a href="/login" style={{ color:"#818cf8", fontWeight:600, textDecoration:"none" }}
              onMouseEnter={e => e.target.style.color="#a5b4fc"}
              onMouseLeave={e => e.target.style.color="#818cf8"}>Login</a>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} input::placeholder{color:#334155;}`}</style>
    </div>
  );
}