import React from "react";
import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const GOOGLE_API_KEY = "SENIN_API_KEYIN_BURAYA";
const HAS_API_KEY = GOOGLE_API_KEY !== "SENIN_API_KEYIN_BURAYA";

const SUPABASE_URL = "https://oqdbawuraddjuzjuvust.supabase.co";
const SUPABASE_KEY = "sb_publishable_6nkPixi3W2ZQufoS3Jm5Lg_qtF84IVp";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEMO_CARDS = [
  { id:"d1", name:"Çiya Sofrası",          address:"Kadıköy, İstanbul",  rating:4.7, ratingCount:3200, price:"₺₺",  isOpen:true,  photo:null, emoji:"🍲", types:["restaurant","turkish"] },
  { id:"d2", name:"Karaköy Güllüoğlu",     address:"Karaköy, İstanbul",  rating:4.8, ratingCount:8100, price:"₺",   isOpen:true,  photo:null, emoji:"🥐", types:["bakery","cafe"] },
  { id:"d3", name:"Borsam Taşfırın",       address:"Beşiktaş, İstanbul", rating:4.6, ratingCount:1540, price:"₺₺",  isOpen:true,  photo:null, emoji:"🍕", types:["restaurant"] },
  { id:"d4", name:"Zübeyir Ocakbaşı",      address:"Beyoğlu, İstanbul",  rating:4.5, ratingCount:2200, price:"₺₺₺", isOpen:false, photo:null, emoji:"🥩", types:["restaurant","bar"] },
  { id:"d5", name:"Filibe Köftecisi",      address:"Eminönü, İstanbul",  rating:4.4, ratingCount:890,  price:"₺",   isOpen:true,  photo:null, emoji:"🍖", types:["restaurant"] },
  { id:"d6", name:"Kokoreçci Şükrü Usta", address:"Taksim, İstanbul",   rating:4.3, ratingCount:670,  price:"₺",   isOpen:true,  photo:null, emoji:"🌯", types:["meal_takeaway"] },
  { id:"d7", name:"Hamdi Restaurant",      address:"Eminönü, İstanbul",  rating:4.6, ratingCount:4300, price:"₺₺₺", isOpen:true,  photo:null, emoji:"🍽️", types:["restaurant"] },
  { id:"d8", name:"Karaköy Pidecisi",      address:"Karaköy, İstanbul",  rating:4.5, ratingCount:1100, price:"₺₺",  isOpen:true,  photo:null, emoji:"🫓", types:["restaurant"] },
];

// Dark luxury gradients — dramatic, food-forward
const GRADIENTS = [
  ["#18002e","#2d0a52"],
  ["#001a0d","#013320"],
  ["#1a0000","#350a0a"],
  ["#00102e","#002055"],
  ["#1a0a00","#332000"],
  ["#0d001a","#200033"],
];

const AVATAR_COLORS = ["#FF3B55","#2196f3","#9c27b0","#FF6830","#ff9800","#00bcd4","#e91e63","#607d8b"];

function getPriceLabel(l) { return l ? (["","₺","₺₺","₺₺₺","₺₺₺₺"][l]||"") : ""; }
function getRatingColor(r) { return r>=4.5?"#22c55e":r>=4.0?"#f59e0b":r>=3.5?"#f97316":"#ef4444"; }
function avatarColor(name) { return AVATAR_COLORS[(name?.charCodeAt(0)||0) % AVATAR_COLORS.length]; }
function avatarLetter(name) { return name ? name[0].toUpperCase() : "?"; }
function genCode() { return Math.random().toString(36).slice(2,8).toUpperCase(); }

// ─── Top Card ────────────────────────────────────────────────
function TopCard({ card, gradIndex, onSwipe }) {
  const ref = useRef(null);
  const grad = GRADIENTS[gradIndex % GRADIENTS.length];
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transition = "none";
    el.getBoundingClientRect();
    el.style.transition = "opacity 0.2s ease";
    el.style.opacity = "";
    const tid = setTimeout(() => { if (ref.current) ref.current.style.transition = ""; }, 240);
    return () => clearTimeout(tid);
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let dragging=false, startX=0, startY=0, curX=0, curY=0, vx=0, lastX=0, lastT=0, gone=false;
    const setT = (x, y, snap=false) => {
      const rot = x * 0.055;
      el.style.transition = snap ? "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)" : "none";
      el.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg)`;
      const ll = el.querySelector(".ll"); const nl = el.querySelector(".nl");
      if (ll) ll.style.opacity = Math.min(Math.max(x/75,0),1);
      if (nl) nl.style.opacity = Math.min(Math.max(-x/75,0),1);
    };
    const fly = (dir) => {
      if (gone) return; gone = true;
      const tx = dir==="right" ? window.innerWidth*1.6 : -window.innerWidth*1.6;
      el.style.transition = "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94),opacity 0.4s ease";
      el.style.transform = `translateX(${tx}px) rotate(${dir==="right"?28:-28}deg) scale(0.9)`;
      el.style.opacity = "0";
      setTimeout(() => onSwipe(dir), 380);
    };
    const onDown = (e) => { if (gone) return; e.preventDefault(); dragging=true; startX=e.clientX; startY=e.clientY; curX=0; curY=0; vx=0; lastX=e.clientX; lastT=Date.now(); el.style.cursor="grabbing"; };
    const onMove = (e) => { if (!dragging) return; const now=Date.now(); vx=(e.clientX-lastX)/Math.max(now-lastT,1); lastX=e.clientX; lastT=now; curX=e.clientX-startX; curY=(e.clientY-startY)*0.18; setT(curX,curY); };
    const onUp = () => { if (!dragging) return; dragging=false; el.style.cursor="grab"; if (curX>95||vx>0.45) fly("right"); else if (curX<-95||vx<-0.45) fly("left"); else setT(0,0,true); };
    const onForce = (e) => fly(e.detail.dir);
    el.addEventListener("pointerdown", onDown); window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp); el.addEventListener("forceswipe", onForce);
    return () => { el.removeEventListener("pointerdown", onDown); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); el.removeEventListener("forceswipe", onForce); };
  }, [onSwipe]);
  return (
    <div ref={ref} id={"tc-"+card.id} style={{
      position:"absolute",inset:0,borderRadius:28,overflow:"hidden",
      background:`linear-gradient(155deg,${grad[0]},${grad[1]})`,
      cursor:"grab",userSelect:"none",touchAction:"none",willChange:"transform",zIndex:10,
      boxShadow:"0 24px 64px rgba(0,0,0,0.35),0 8px 24px rgba(0,0,0,0.2)"
    }}>
      {card.photo
        ? <img src={card.photo} alt={card.name} draggable={false} style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",pointerEvents:"none" }}/>
        : <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:108,filter:"drop-shadow(0 8px 32px rgba(0,0,0,0.6))",pointerEvents:"none" }}>{card.emoji}</div>
      }
      {/* Strong bottom gradient */}
      <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0) 100%)",pointerEvents:"none" }}/>

      {/* YEP label */}
      <div className="ll" style={{
        position:"absolute",top:28,left:22,opacity:0,transition:"opacity 0.06s",
        background:"#22C55E",color:"white",fontFamily:"'Syne',sans-serif",fontWeight:800,
        fontSize:19,padding:"9px 22px",borderRadius:10,border:"3px solid #4ADE80",
        transform:"rotate(-8deg)",letterSpacing:2.5,pointerEvents:"none",
        boxShadow:"0 4px 20px rgba(34,197,94,0.55)"
      }}>YEP 🔥</div>

      {/* NOPE label — right side */}
      <div className="nl" style={{
        position:"absolute",top:28,right:22,opacity:0,transition:"opacity 0.06s",
        background:"#EF4444",color:"white",fontFamily:"'Syne',sans-serif",fontWeight:800,
        fontSize:19,padding:"9px 22px",borderRadius:10,border:"3px solid #F87171",
        transform:"rotate(8deg)",letterSpacing:2.5,pointerEvents:"none",
        boxShadow:"0 4px 20px rgba(239,68,68,0.55)"
      }}>NOPE 👋</div>

      {/* Open/closed badge */}
      <div style={{
        position:"absolute",top:22,right:22,pointerEvents:"none",
        background:"rgba(0,0,0,0.65)",backdropFilter:"blur(14px)",
        padding:"6px 14px",borderRadius:50,
        color:card.isOpen?"#4ADE80":"#F87171",
        fontSize:10,fontWeight:800,letterSpacing:2,
        border:`1.5px solid ${card.isOpen?"rgba(74,222,128,0.35)":"rgba(248,113,113,0.35)"}`
      }}>{card.isOpen?"● AÇIK":"● KAPALI"}</div>

      {/* Bottom info */}
      <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"0 24px 30px",pointerEvents:"none" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap" }}>
          {card.rating>0&&(
            <div style={{ display:"inline-flex",alignItems:"center",gap:5,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(14px)",padding:"6px 14px",borderRadius:50 }}>
              <span style={{ color:getRatingColor(card.rating),fontWeight:800,fontSize:15 }}>★ {card.rating.toFixed(1)}</span>
              <span style={{ color:"rgba(255,255,255,0.45)",fontSize:11 }}>({card.ratingCount.toLocaleString()})</span>
            </div>
          )}
          {card.price&&(
            <div style={{ background:"rgba(0,0,0,0.6)",backdropFilter:"blur(14px)",padding:"6px 14px",borderRadius:50,color:"#FFD60A",fontWeight:800,fontSize:13 }}>{card.price}</div>
          )}
        </div>
        <h2 style={{
          fontFamily:"'Syne',sans-serif",fontSize:34,color:"white",lineHeight:1.08,
          marginBottom:8,fontWeight:800,letterSpacing:-0.5,
          textShadow:"0 2px 24px rgba(0,0,0,0.9)"
        }}>{card.name}</h2>
        <p style={{ color:"rgba(255,255,255,0.45)",fontSize:13,marginBottom:14,fontWeight:500 }}>📍 {card.address}</p>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {card.types?.filter(t=>!["point_of_interest","establishment","food"].includes(t)).slice(0,3).map(t=>(
            <span key={t} style={{ background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)",padding:"4px 12px",borderRadius:50,fontSize:11,fontWeight:600,letterSpacing:0.5 }}>
              {t.replace(/_/g," ")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Waiting Screen ───────────────────────────────────────────
function WaitingScreen({ members, myName, doneMembers }) {
  const waiting = members.filter(m => !doneMembers.has(m.name) && m.name !== myName);
  return (
    <div style={{ textAlign:"center",padding:"40px 24px",maxWidth:400,zIndex:10 }}>
      <div style={{ fontSize:56,marginBottom:18,animation:"bounce 2s ease infinite" }}>⏳</div>
      <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:32,color:"#0D0D0D",marginBottom:10,fontWeight:800,letterSpacing:-0.5 }}>Bitti!</h2>
      <p style={{ color:"#9CA3AF",fontSize:14,marginBottom:32,lineHeight:1.7,fontWeight:500 }}>
        {waiting.length > 0 ? `${waiting.map(m=>m.name).join(", ")} henüz bitirmedi...` : "Herkes bitti, yükleniyor..."}
      </p>
      <div style={{ display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap" }}>
        {members.map(m => (
          <div key={m.id} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:8 }}>
            <div style={{
              width:52,height:52,borderRadius:"50%",background:avatarColor(m.name),
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:18,fontWeight:800,color:"white",fontFamily:"'Syne',sans-serif",
              border:`3px solid ${doneMembers.has(m.name)||m.name===myName?"#22C55E":"#E5E7EB"}`,
              transition:"all .3s",
              boxShadow:doneMembers.has(m.name)||m.name===myName?"0 0 0 5px rgba(34,197,94,0.18)":"none"
            }}>{avatarLetter(m.name)}</div>
            <span style={{ fontSize:11,fontWeight:700,color:doneMembers.has(m.name)||m.name===myName?"#22C55E":"#9CA3AF" }}>
              {doneMembers.has(m.name)||m.name===myName?"✓ Bitti":"Devam..."}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Confetti ────────────────────────────────────────────────
const CONFETTI_COLORS = ["#FF3B55","#FF6830","#22C55E","#FFD60A","#60a5fa","#f97316","#a78bfa","#FF9F43"];
function Confetti({ onDone }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 110 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 10,
      vx: (Math.random() - 0.5) * 8,
      vy: -(Math.random() * 15 + 8),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      w: Math.random() * 10 + 4,
      h: Math.random() * 6 + 3,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 13,
      gravity: 0.36,
      opacity: 1,
    }));
    const start = Date.now();
    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - start;
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.rot += p.rotV;
        if (elapsed > 1200) p.opacity = Math.max(0, p.opacity - 0.025);
        ctx.save(); ctx.globalAlpha = p.opacity; ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180); ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (elapsed < 2200) { animId = requestAnimationFrame(animate); } else { onDone?.(); }
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:9999 }} />;
}

// ─── Code Input ───────────────────────────────────────────────
function CodeInput({ value, onChange, onSubmit }) {
  const refs = useRef([]);
  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value.length > 0) { onChange(value.slice(0, -1)); refs.current[Math.max(value.length - 1, 0)]?.focus(); }
    } else if (e.key === "Enter") { onSubmit?.(); }
  };
  const handleChange = (i, e) => {
    const char = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-1);
    if (!char || value.length >= 6) return;
    const next = value + char; onChange(next);
    if (next.length < 6) refs.current[next.length]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    onChange(pasted); refs.current[Math.min(pasted.length, 5)]?.focus();
  };
  const activeIdx = Math.min(value.length, 5);
  return (
    <div style={{ display:"flex",gap:8,justifyContent:"center",marginBottom:16 }}>
      {Array.from({length:6}, (_, i) => {
        const filled = i < value.length; const active = i === activeIdx;
        return (
          <input key={i} ref={el => refs.current[i] = el}
            value={value[i] || ""}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onClick={() => refs.current[activeIdx]?.focus()}
            maxLength={2} inputMode="text" autoCapitalize="characters"
            style={{
              width:46,height:56,textAlign:"center",
              fontFamily:"'Roboto Mono',monospace",fontSize:22,fontWeight:700,
              border:`2.5px solid ${active?"#FF3B55":filled?"#FFB3BD":"#E5E7EB"}`,
              borderRadius:14,background:filled?"#FFF0F3":"white",color:"#0D0D0D",
              outline:"none",boxShadow:active?"0 0 0 4px rgba(255,59,85,0.12)":"none",
              caretColor:"transparent",transition:"all 0.15s",cursor:"text"
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Match List Screen ────────────────────────────────────────
function MatchListScreen({ matchedCards, members, onRestart, onHome, isHost }) {
  return (
    <div style={{ width:"100%",maxWidth:420,padding:"20px 20px 40px",zIndex:10,flexShrink:0 }}>
      <div style={{ textAlign:"center",marginBottom:28 }}>
        <div style={{ fontSize:56,marginBottom:10,animation:"bounce 2s ease infinite" }}>🎉</div>
        <div style={{ fontFamily:"'Syne',sans-serif",fontSize:36,color:"#0D0D0D",fontWeight:800,letterSpacing:-1,marginBottom:8 }}>
          {matchedCards.length > 0 ? "Eşleşme!" : "Ortak seçim yok"}
        </div>
        <div style={{ display:"flex",justifyContent:"center",marginBottom:14 }}>
          {members.map((m,i)=>(
            <div key={m.id} style={{ width:38,height:38,borderRadius:"50%",background:avatarColor(m.name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"white",fontFamily:"'Syne',sans-serif",border:"3px solid #FAFAF8",marginLeft:i>0?-10:0,zIndex:members.length-i }}>{avatarLetter(m.name)}</div>
          ))}
        </div>
        <p style={{ color:"#9CA3AF",fontSize:13,lineHeight:1.7 }}>
          {matchedCards.length > 0 ? `${members.map(m=>m.name).join(" ve ")} ${matchedCards.length} restoranı ortak beğendi` : "Hiç ortak beğeni olmadı, tekrar deneyin!"}
        </p>
      </div>
      {matchedCards.length > 0 ? (
        <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:24 }}>
          {matchedCards.map((card, i) => (
            <div key={card.id} style={{
              background:"white",borderRadius:20,overflow:"hidden",
              border:i===0?"2px solid #0D0D0D":"1.5px solid #F0F0F0",
              boxShadow:i===0?"0 8px 32px rgba(0,0,0,0.12)":"0 2px 8px rgba(0,0,0,0.05)",
              display:"flex",alignItems:"center",
              transform:i===0?"scale(1.015)":"scale(1)"
            }}>
              <div style={{ width:86,height:86,background:`linear-gradient(135deg,${GRADIENTS[i%GRADIENTS.length][0]},${GRADIENTS[i%GRADIENTS.length][1]})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,flexShrink:0,position:"relative" }}>
                {card.photo ? <img src={card.photo} alt={card.name} style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover" }}/> : card.emoji}
              </div>
              <div style={{ padding:"12px 16px",flex:1 }}>
                {i===0&&<span style={{ background:"#0D0D0D",color:"white",fontSize:9,fontWeight:800,fontFamily:"'Syne',sans-serif",padding:"3px 10px",borderRadius:50,display:"inline-block",marginBottom:6,letterSpacing:1.5 }}>🏆 EN İYİ</span>}
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:16,color:"#0D0D0D",fontWeight:800,marginBottom:3 }}>{card.name}</div>
                <div style={{ color:"#9CA3AF",fontSize:12,marginBottom:5 }}>📍 {card.address}</div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  {card.rating>0&&<span style={{ color:getRatingColor(card.rating),fontWeight:700,fontSize:13 }}>★ {card.rating.toFixed(1)}</span>}
                  {card.price&&<span style={{ color:"#FF6830",fontWeight:700,fontSize:13 }}>{card.price}</span>}
                  <span style={{ color:card.isOpen?"#22C55E":"#EF4444",fontSize:11,fontWeight:700 }}>{card.isOpen?"● Açık":"● Kapalı"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign:"center",padding:"32px 0",marginBottom:24 }}>
          <div style={{ fontSize:48,marginBottom:12 }}>🤷</div>
          <p style={{ color:"#9CA3AF",fontSize:14 }}>Farklı zevkler! Tekrar deneyin.</p>
        </div>
      )}
      <div style={{ display:"flex",gap:10 }}>
        {isHost
          ? <button className="cta" style={{ flex:1 }} onClick={onRestart}>🔄 Tekrar Oyna</button>
          : <div style={{ flex:1,textAlign:"center",padding:14,background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:14,color:"#9CA3AF",fontSize:14 }}>⏳ Host yeni oyun başlatmayı bekliyor...</div>
        }
        <button className="ghost" onClick={onHome}>Ana Sayfa</button>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────
export default function FoodSwipeApp() {
  const [phase, setPhase] = useState("intro");
  const [myName, setMyName] = useState(""); const [nameInput, setNameInput] = useState(""); const [nameTarget, setNameTarget] = useState("");
  const [isFriend, setIsFriend] = useState(false); const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState(""); const [joinInput, setJoinInput] = useState("");
  const [members, setMembers] = useState([]);
  const simSwipes = useRef({});
  const swipedCards = useRef(new Set());
  const [remoteLikes, setRemoteLikes] = useState({});
  const remoteLikesRef = useRef({});
  const [matchedCards, setMatchedCards] = useState([]);
  const [doneMembers, setDoneMembers] = useState(new Set());
  const channelRef = useRef(null);
  const membersRef = useRef([]);
  const setMembersAndRef = (fn) => {
    setMembers(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      membersRef.current = next;
      return next;
    });
  };
  const myFinishedRef = useRef(false);
  useEffect(() => { return () => { if (channelRef.current) sb.removeChannel(channelRef.current); }; }, []);
  const [cards, setCards] = useState([]); const [stack, setStack] = useState([]);
  const [likedCount, setLikedCount] = useState(0); const [likedCards, setLikedCards] = useState([]);
  const [result, setResult] = useState(null);
  const [flashDir, setFlashDir] = useState(null); const [isDemo, setIsDemo] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0); const [showConfetti, setShowConfetti] = useState(false);
  const prevMatchCountRef = useRef(0);
  useEffect(() => {
    if (matchedCards.length > prevMatchCountRef.current) { setConfettiKey(k => k + 1); setShowConfetti(true); }
    prevMatchCountRef.current = matchedCards.length;
  }, [matchedCards]);
  const [loadingStep, setLoadingStep] = useState(0); const [errorMsg, setErrorMsg] = useState("");
  const STEPS = [{ icon:"📍", text:"GPS konumun alınıyor..." },{ icon:"🗺️", text:"Google Maps yükleniyor..." },{ icon:"🔍", text:"Restoranlar taranıyor..." },{ icon:"✨", text:"Kartlar hazırlanıyor..." }];

  const loadSDK = useCallback(() => new Promise((res,rej) => {
    if (window.google?.maps?.places) return res();
    if (document.getElementById("gmap-sdk")) { const t=setInterval(()=>{ if(window.google?.maps?.places){clearInterval(t);res();} },150); setTimeout(()=>{clearInterval(t);rej(new Error("Zaman aşımı."));},15000); return; }
    const cb="__gm_"+Date.now(); window[cb]=()=>{res();delete window[cb];}; const s=document.createElement("script"); s.id="gmap-sdk"; s.src=`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&callback=${cb}`; s.onerror=()=>rej(new Error("SDK yüklenemedi.")); document.head.appendChild(s);
  }), []);

  const fetchNearby = useCallback((lat,lng) => new Promise((res,rej) => {
    const map=new window.google.maps.Map(document.createElement("div")); const svc=new window.google.maps.places.PlacesService(map);
    svc.nearbySearch({location:new window.google.maps.LatLng(lat,lng),radius:1500,type:["restaurant"]},(results,status) => { if (status==="OK"&&results.length>0) res(results.sort(()=>Math.random()-0.5).slice(0,8)); else if (status==="ZERO_RESULTS") rej(new Error("Yakında restoran bulunamadı.")); else rej(new Error("Places API: "+status)); });
  }), []);

  const launchGame = (cardList, demo=false) => {
    setIsDemo(demo); setCards(cardList); setStack([...cardList].reverse());
    setLikedCount(0); setLikedCards([]); setMatchedCards([]);
    setDoneMembers(new Set());
    myFinishedRef.current = false;
    simSwipes.current = {}; swipedCards.current = new Set(); remoteLikesRef.current = {}; setRemoteLikes({});
    setPhase("swiping");
  };

  const startSolo = async (demo=false) => {
    if (demo) { setIsFriend(false); launchGame(DEMO_CARDS, true); return; }
    setPhase("loading"); setLoadingStep(0);
    try {
      const pos = await new Promise((res,rej) => navigator.geolocation.getCurrentPosition(res,rej,{timeout:12000,maximumAge:60000}));
      setLoadingStep(1); await loadSDK(); setLoadingStep(2);
      const places = await fetchNearby(pos.coords.latitude, pos.coords.longitude);
      setLoadingStep(3); await new Promise(r=>setTimeout(r,400));
      const mapped = places.map(p => ({ id:p.place_id, name:p.name, address:p.vicinity, rating:p.rating||0, ratingCount:p.user_ratings_total||0, price:getPriceLabel(p.price_level), isOpen:p.opening_hours?.open_now??true, photo:p.photos?.[0]?.getUrl({maxWidth:640,maxHeight:640})||null, types:p.types||[], emoji:({"cafe":"☕","bakery":"🥐","bar":"🍸","meal_takeaway":"🥡"}[p.types?.[1]]||"🍽️") }));
      setIsFriend(false); launchGame(mapped, false);
    } catch(err) { setErrorMsg(err.code===1?"Konum izni reddedildi.":err.code===2?"GPS sinyali alınamadı.":err.code===3?"Zaman aşımı.":err.message||"Bilinmeyen hata."); setPhase("error"); }
  };

  const requireName = (target) => { setNameTarget(target); setPhase("name"); };
  const submitName = () => { const n = nameInput.trim(); if (!n) return; setMyName(n); setNameInput(""); if (nameTarget==="solo") startSolo(false); else setPhase("friendMenu"); };

  const subscribeToRoom = useCallback((code, currentName) => {
    if (channelRef.current) { sb.removeChannel(channelRef.current); }
    const channel = sb.channel(`room:${code}`, { config: { broadcast: { self: false } } });
    channel.on("postgres_changes", { event:"INSERT", schema:"public", table:"members", filter:`room_id=eq.${code}` }, (payload) => {
      const newMember = payload.new;
      if (newMember.name !== currentName) {
        setMembersAndRef(prev => { if (prev.find(m => m.name === newMember.name)) return prev; return [...prev, { id: newMember.id, name: newMember.name, ready: true }]; });
      }
    });
    channel.on("postgres_changes", { event:"INSERT", schema:"public", table:"swipes", filter:`room_id=eq.${code}` }, (payload) => {
      const { member_name, card_id, direction } = payload.new;
      if (member_name === currentName) return;
      if (direction === "done" && card_id === "DONE") {
        setDoneMembers(prev => {
          const updated = new Set([...prev, member_name]);
          const othersCount = membersRef.current.length - 1;
          if (updated.size >= othersCount && othersCount > 0 && myFinishedRef.current) {
            setTimeout(() => { sb.from("swipes").delete().eq("room_id", code); setPhase("matchList"); }, 600);
          }
          return updated;
        });
        return;
      }
      if (direction === "right") {
        setRemoteLikes(prev => {
          const updated = { ...prev }; if (!updated[card_id]) updated[card_id] = new Set(); updated[card_id] = new Set([...updated[card_id], member_name]);
          remoteLikesRef.current = updated;
          setMembers(currentMembers => { setLikedCards(currentLiked => { const likedCard = currentLiked.find(c => c.id === card_id); if (likedCard) { const allLiked = currentMembers.every(m => updated[card_id]?.has(m.name)); if (allLiked) { setMatchedCards(prev => { if (prev.find(c => c.id === card_id)) return prev; return [...prev, likedCard]; }); } } return currentLiked; }); return currentMembers; });
          return updated;
        });
      }
    });
    channel.on("broadcast", { event:"game_start" }, () => { setIsFriend(true); launchGame(DEMO_CARDS, true); });
    channel.on("broadcast", { event:"game_restart" }, () => { setMatchedCards([]); remoteLikesRef.current = {}; setRemoteLikes({}); setDoneMembers(new Set()); launchGame(DEMO_CARDS, true); });
    channel.on("broadcast", { event:"host_left" }, () => { setIsFriend(false); setMembers([]); setMatchedCards([]); setDoneMembers(new Set()); sb.removeChannel(channelRef.current); setPhase("intro"); });
    channel.subscribe(); channelRef.current = channel;
  }, []);

  const createRoom = async () => {
    const code = genCode();
    try {
      await sb.from("rooms").insert({ id: code, cards: DEMO_CARDS });
      await sb.from("members").insert({ room_id: code, name: myName });
      setRoomCode(code); setIsHost(true); setIsFriend(true);
      setMembersAndRef([{ id:"me", name:myName, ready:true }]);
      subscribeToRoom(code, myName); setPhase("lobby");
    } catch(err) { alert("Oda oluşturulamadı: " + err.message); }
  };

  const joinRoom = async () => {
    const code = joinInput.trim().toUpperCase(); if (code.length < 4) return;
    try {
      const { data: room, error } = await sb.from("rooms").select("*").eq("id", code).single();
      if (error || !room) { alert("Oda bulunamadı. Kodu kontrol et."); return; }
      const { data: existingMembers } = await sb.from("members").select("*").eq("room_id", code);
      await sb.from("members").insert({ room_id: code, name: myName });
      const allMembers = [...(existingMembers || []).map(m => ({ id:m.id, name:m.name, ready:true })), { id:"me", name:myName, ready:true }];
      setRoomCode(code); setIsHost(false); setIsFriend(true); setMembersAndRef(allMembers);
      subscribeToRoom(code, myName); setJoinInput(""); setPhase("lobby");
    } catch(err) { alert("Odaya katılınamadı: " + err.message); }
  };

  const startFriendGame = async () => {
    await sb.channel(`room:${roomCode}`).send({ type:"broadcast", event:"game_start", payload:{} });
    setIsFriend(true); launchGame(DEMO_CARDS, true);
  };

  const handleSwipe = useCallback(async (card, dir) => {
    if (swipedCards.current.has(card.id)) return;
    swipedCards.current.add(card.id);
    setFlashDir(dir); setTimeout(()=>setFlashDir(null),350);
    const newLiked = dir==="right" ? [...likedCards,card] : likedCards;
    if (dir==="right") { setLikedCount(l=>l+1); setLikedCards(newLiked); }
    if (isFriend) {
      try { await sb.from("swipes").insert({ room_id: roomCode, member_name: myName, card_id: card.id, direction: dir }); } catch(e) { console.error("Swipe yazılamadı:", e); }
      if (dir === "right") {
        const myLikes = { ...remoteLikesRef.current };
        if (!myLikes[card.id]) myLikes[card.id] = new Set();
        myLikes[card.id] = new Set([...myLikes[card.id], myName]);
        const allLiked = members.every(m => myLikes[card.id]?.has(m.name));
        if (allLiked) { setMatchedCards(prev => { if (prev.find(c => c.id === card.id)) return prev; return [...prev, card]; }); }
        remoteLikesRef.current = myLikes; setRemoteLikes(myLikes);
      }
    }
    setStack(prev => {
      const next = prev.filter(c=>c.id!==card.id);
      if (next.length===0) {
        setTimeout(async () => {
          if (isFriend) {
            try { await sb.from("swipes").insert({ room_id: roomCode, member_name: myName, card_id: "DONE", direction: "done" }); } catch(e) {}
            myFinishedRef.current = true;
            setDoneMembers(prev => {
              const othersCount = membersRef.current.length - 1;
              if (prev.size >= othersCount && othersCount > 0) {
                setTimeout(() => { sb.from("swipes").delete().eq("room_id", roomCode); setPhase("matchList"); }, 600);
              }
              return prev;
            });
            setPhase("waiting");
          } else {
            const sorted = newLiked.length>0 ? [...newLiked].sort((a,b) => b.rating - a.rating) : [...cards].sort((a,b) => b.rating - a.rating);
            setLikedCards(sorted); setResult(sorted[0]); setPhase("result");
          }
        }, 500);
      }
      return next;
    });
  }, [likedCards, isFriend, members, myName, cards, roomCode]);

  const forceSwipe = (dir) => { const top = stack[stack.length-1]; if (!top) return; const el = document.getElementById("tc-"+top.id); if (el) el.dispatchEvent(new CustomEvent("forceswipe",{detail:{dir}})); };
  const progress = cards.length>0 ? ((cards.length-stack.length)/cards.length)*100 : 0;

  const handleRestart = async () => {
    await sb.channel(`room:${roomCode}`).send({ type:"broadcast", event:"game_restart", payload:{} });
    setMatchedCards([]); remoteLikesRef.current = {}; setRemoteLikes({}); setDoneMembers(new Set()); launchGame(DEMO_CARDS, true);
  };
  const handleHome = async () => {
    if (isHost) {
      try {
        await sb.channel(`room:${roomCode}`).send({ type:"broadcast", event:"host_left", payload:{} });
        await sb.from("swipes").delete().eq("room_id", roomCode);
        await sb.from("members").delete().eq("room_id", roomCode);
        await sb.from("rooms").delete().eq("id", roomCode);
      } catch(e) {}
    }
    setIsFriend(false); setMembers([]); setMatchedCards([]); setDoneMembers(new Set());
    if (channelRef.current) sb.removeChannel(channelRef.current);
    setPhase("intro");
  };

  return (
    <div style={{ minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",paddingTop:phase==="swiping"?"62px":"20px",paddingBottom:"40px",background:"#EDE8DF",backgroundImage:"repeating-linear-gradient(118deg,transparent 0,transparent 44px,rgba(180,162,140,0.07) 44px,rgba(180,162,140,0.07) 46px),repeating-linear-gradient(62deg,transparent 0,transparent 70px,rgba(170,152,130,0.05) 70px,rgba(170,152,130,0.05) 72px),linear-gradient(170deg,#F2ECE4 0%,#E8DFD3 40%,#EDE6DB 70%,#F0EAE0 100%)" }}>
      {showConfetti && <Confetti key={confettiKey} onDone={() => setShowConfetti(false)} />}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Roboto+Mono:wght@600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{margin:0;padding:0;background:#EDE8DF;}
        html{overflow-x:hidden;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-13px);}}
        @keyframes stepIn{from{opacity:0;transform:translateX(-14px);}to{opacity:1;transform:translateX(0);}}
        @keyframes glowGreen{0%,100%{box-shadow:0 6px 28px rgba(34,197,94,0.45);}50%{box-shadow:0 10px 44px rgba(34,197,94,0.7),0 0 0 5px rgba(34,197,94,0.12);}}
        @keyframes flashAnim{0%{opacity:1;}100%{opacity:0;}}
        @keyframes blink{0%,100%{opacity:0.2;}50%{opacity:1;}}
        .fade-up{animation:fadeUp 0.5s cubic-bezier(0.34,1.2,0.64,1) both;}
        .cta{
          background:linear-gradient(135deg,#FF3B55 0%,#FF6830 100%);
          color:white;border:none;padding:17px 40px;border-radius:16px;
          font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;letter-spacing:0.3px;
          transition:transform .2s cubic-bezier(0.34,1.56,0.64,1),box-shadow .2s;
          box-shadow:0 4px 20px rgba(255,59,85,0.35);
        }
        .cta:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 10px 36px rgba(255,59,85,0.5);}
        .cta:active{transform:translateY(0) scale(0.98);box-shadow:0 2px 10px rgba(255,59,85,0.3);}
        .cta:disabled{background:linear-gradient(135deg,#D1D5DB,#E5E7EB)!important;color:#9CA3AF!important;transform:none!important;box-shadow:none!important;cursor:not-allowed;}
        .ghost{
          background:transparent;color:#0D0D0D;border:2px solid #0D0D0D;
          padding:15px 28px;border-radius:16px;font-size:14px;font-weight:700;
          cursor:pointer;font-family:inherit;letter-spacing:0.3px;transition:all .2s;
        }
        .ghost:hover{background:#0D0D0D;color:white;transform:translateY(-2px);}
        .ghost:active{transform:translateY(0);}
        .demo-btn{
          background:transparent;color:#9CA3AF;border:1.5px solid #E5E7EB;
          padding:11px 24px;border-radius:50px;font-size:13px;font-weight:600;
          cursor:pointer;font-family:inherit;transition:all .18s;
        }
        .demo-btn:hover{background:#F0F0EC;color:#6B7280;border-color:#D1D5DB;}
        .act-btn{border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s cubic-bezier(0.34,1.56,0.64,1);}
        .act-btn:active{transform:scale(0.84)!important;}
        .inp{
          width:100%;background:white;border:2px solid #E5E7EB;border-radius:16px;
          padding:16px 20px;color:#0D0D0D;font-size:15px;font-family:inherit;font-weight:500;
          outline:none;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,0.04);
        }
        .inp:focus{border-color:#FF3B55;box-shadow:0 0 0 4px rgba(255,59,85,0.1),0 2px 8px rgba(0,0,0,0.04);}
        .inp::placeholder{color:#C4CDD8;font-weight:400;}
      `}</style>

      {/* ── NAV — only shown during swiping ── */}
      {phase==="swiping"&&(
        <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 22px",borderBottom:"1px solid rgba(180,162,140,0.2)",background:"rgba(237,232,223,0.92)",backdropFilter:"blur(24px)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontFamily:"'Syne',sans-serif",fontSize:17,color:"#1A1208",fontWeight:800,letterSpacing:-0.5 }}>nerede yesek<span style={{ color:"#FF3B55" }}>.</span></span>
            {isFriend&&<span style={{ background:"linear-gradient(135deg,#FF3B55,#FF6830)",color:"white",fontSize:9,fontWeight:800,padding:"3px 9px",borderRadius:50,letterSpacing:1.5 }}>ARKADAŞ</span>}
            {isDemo&&<span style={{ background:"rgba(26,18,8,0.08)",color:"#8C7B68",fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:50,letterSpacing:1.5 }}>DEMO</span>}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            {isFriend&&(
              <div style={{ display:"flex" }}>
                {members.slice(0,4).map((m,i)=>(
                  <div key={m.id} style={{ width:28,height:28,borderRadius:"50%",background:avatarColor(m.name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"white",fontFamily:"'Syne',sans-serif",border:"2.5px solid #EDE8DF",marginLeft:i>0?-8:0,zIndex:10-i }}>{avatarLetter(m.name)}</div>
                ))}
              </div>
            )}
            <div style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(255,59,85,0.1)",padding:"5px 12px",borderRadius:50,border:"1px solid rgba(255,59,85,0.2)" }}>
              <span style={{ fontSize:13 }}>❤️</span>
              <span style={{ color:"#FF3B55",fontSize:13,fontWeight:800 }}>{likedCount}</span>
            </div>
          </div>
        </nav>
      )}

      {/* Background glow */}
      <div style={{ position:"fixed",top:"-20%",left:"50%",transform:"translateX(-50%)",width:800,height:600,background:"radial-gradient(ellipse,rgba(255,59,85,0.04) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 }}/>

      {/* ── INTRO ── */}
      {phase==="intro"&&(
        <div className="fade-up" style={{ textAlign:"center",padding:"0 22px",maxWidth:400,width:"100%",zIndex:10 }}>

          {/* Main heading — centered, dramatic 3-line */}
          <div style={{ marginBottom:20,lineHeight:1,marginTop:16 }}>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:58,fontWeight:800,color:"#1A1208",letterSpacing:-2,lineHeight:0.95 }}>Bugün</div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:82,fontWeight:800,color:"#FF3B55",letterSpacing:-4,lineHeight:0.88 }}>nerede</div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:58,fontWeight:800,color:"#1A1208",letterSpacing:-2,lineHeight:0.95 }}>yesek<span style={{ color:"#1A1208" }}>?</span></div>
          </div>

          {/* Subtitle */}
          <p style={{ color:"#6B5C4A",fontSize:14,lineHeight:1.75,marginBottom:32,fontWeight:500 }}>
            Kaydır, seç, eşleş.<br/>Arkadaşlarınla oyna, ortak yer bulun.
          </p>

          {/* Buttons */}
          <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:14,width:"100%" }}>
            <button
              onClick={()=>startSolo(false)}
              style={{ width:"100%",padding:"20px 24px",background:"#1A1208",color:"white",border:"none",borderRadius:20,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all .22s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:"0 6px 24px rgba(26,18,8,0.25)" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px) scale(1.01)"; e.currentTarget.style.boxShadow="0 16px 40px rgba(26,18,8,0.35)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 6px 24px rgba(26,18,8,0.25)"; }}
            >
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:18,fontWeight:800,fontFamily:"'Syne',sans-serif",marginBottom:3,letterSpacing:-0.3 }}>Tek Başına</div>
                <div style={{ fontSize:12,opacity:0.5,fontWeight:500 }}>GPS ile yakın restoranları tara</div>
              </div>
              <span style={{ fontSize:26 }}>📍</span>
            </button>

            <button
              onClick={()=>requireName("friend")}
              style={{ width:"100%",padding:"20px 24px",background:"white",color:"#1A1208",border:"2px solid #1A1208",borderRadius:20,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all .22s cubic-bezier(0.34,1.56,0.64,1)" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#1A1208"; e.currentTarget.style.color="white"; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(26,18,8,0.2)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="white"; e.currentTarget.style.color="#1A1208"; e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}
            >
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:18,fontWeight:800,fontFamily:"'Syne',sans-serif",marginBottom:3,letterSpacing:-0.3 }}>Arkadaş Modu</div>
                <div style={{ fontSize:12,color:"#6B5C4A",fontWeight:500 }}>Hep beraber kaydırın, eşleşen kazanır</div>
              </div>
              <span style={{ fontSize:26 }}>👥</span>
            </button>
          </div>

          <button className="demo-btn" onClick={()=>startSolo(true)} style={{ width:"100%",borderRadius:14,padding:"13px" }}>
            Hızlı Demo
          </button>
        </div>
      )}

      {/* ── NAME ── */}
      {phase==="name"&&(
        <div className="fade-up" style={{ width:"100%",maxWidth:380,padding:"20px 24px 24px",zIndex:10 }}>
          <button onClick={()=>setPhase("intro")} style={{ background:"none",border:"none",color:"#9CA3AF",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:32,display:"flex",alignItems:"center",gap:6 }}>← Geri</button>
          <div style={{ fontSize:10,color:"#FF3B55",fontWeight:800,letterSpacing:4,marginBottom:14,textTransform:"uppercase" }}>Arkadaş Modu</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:42,color:"#0D0D0D",marginBottom:10,fontWeight:800,letterSpacing:-1.5 }}>Adın ne?</h2>
          <p style={{ color:"#9CA3AF",fontSize:14,marginBottom:26,lineHeight:1.7,fontWeight:500 }}>Arkadaşların seni bu isimle görecek</p>
          <input className="inp" placeholder="Adını yaz..." value={nameInput} autoFocus onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitName()} style={{ marginBottom:14 }}/>
          <button className="cta" style={{ width:"100%" }} onClick={submitName} disabled={!nameInput.trim()}>Devam Et →</button>
        </div>
      )}

      {/* ── FRIEND MENU ── */}
      {phase==="friendMenu"&&(
        <div className="fade-up" style={{ width:"100%",maxWidth:380,padding:"20px 24px 24px",zIndex:10 }}>
          <button onClick={()=>setPhase("intro")} style={{ background:"none",border:"none",color:"#9CA3AF",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:32,display:"flex",alignItems:"center",gap:6 }}>← Geri</button>
          <div style={{ fontSize:10,color:"#FF3B55",fontWeight:800,letterSpacing:4,marginBottom:14,textTransform:"uppercase" }}>Arkadaş Modu</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:38,color:"#0D0D0D",marginBottom:28,fontWeight:800,letterSpacing:-1.5 }}>Merhaba, <span style={{ color:"#FF3B55" }}>{myName}</span>!</h2>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <div
              style={{ background:"white",border:"2px solid #E5E7EB",borderRadius:20,padding:"18px 20px",cursor:"pointer",transition:"all .2s cubic-bezier(0.34,1.56,0.64,1)",display:"flex",alignItems:"center",gap:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}
              onClick={createRoom}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor="#0D0D0D"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 28px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="#E5E7EB"; e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)"; }}
            >
              <div style={{ width:44,height:44,borderRadius:14,background:"#0D0D0D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>🏠</div>
              <div style={{ textAlign:"left" }}>
                <div style={{ color:"#0D0D0D",fontSize:15,fontWeight:800,fontFamily:"'Syne',sans-serif",marginBottom:2 }}>Oda Oluştur</div>
                <div style={{ color:"#9CA3AF",fontSize:12,fontWeight:500 }}>Arkadaşlarını davet et</div>
              </div>
              <div style={{ marginLeft:"auto",color:"#D1D5DB",fontSize:20 }}>›</div>
            </div>
            <div style={{ background:"white",border:"2px solid #E5E7EB",borderRadius:20,padding:"18px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ color:"#0D0D0D",fontSize:14,fontWeight:700,marginBottom:14,display:"flex",alignItems:"center",gap:8 }}><span>🔑</span>Odaya Katıl</div>
              <CodeInput value={joinInput} onChange={setJoinInput} onSubmit={joinRoom} />
              <button className="cta" style={{ width:"100%",padding:"14px" }} onClick={joinRoom} disabled={joinInput.trim().length<6}>Katıl →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOBBY ── */}
      {phase==="lobby"&&(
        <div style={{ width:"100%",maxWidth:400,padding:"20px",zIndex:10 }}>
          <div style={{ textAlign:"center",marginBottom:28 }}>
            <div style={{ fontSize:10,color:"#FF3B55",fontWeight:800,letterSpacing:4,marginBottom:12,textTransform:"uppercase" }}>Arkadaş Modu</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:36,color:"#0D0D0D",fontWeight:800,letterSpacing:-1 }}>Odana Hoş Geldin!</h2>
          </div>
          <div style={{ background:"white",border:"2.5px solid #0D0D0D",borderRadius:20,padding:"20px 24px",textAlign:"center",marginBottom:12,boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
            <div style={{ color:"#9CA3AF",fontSize:10,fontWeight:800,letterSpacing:3,marginBottom:10 }}>ODA KODU</div>
            <div style={{ fontFamily:"'Roboto Mono',monospace",fontSize:40,color:"#0D0D0D",letterSpacing:7,fontWeight:700 }}>{roomCode}</div>
          </div>
          <div style={{ background:"white",border:"1.5px solid #E5E7EB",borderRadius:20,padding:"18px 20px",marginBottom:18,boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ color:"#9CA3AF",fontSize:10,fontWeight:800,letterSpacing:3,marginBottom:16 }}>KATILANLAR · {members.length} KİŞİ</div>
            {members.map((m,i)=>(
              <div key={m.id} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:i<members.length-1?12:0 }}>
                <div style={{ width:38,height:38,borderRadius:"50%",background:avatarColor(m.name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"white",fontFamily:"'Syne',sans-serif",flexShrink:0 }}>{avatarLetter(m.name)}</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:"#0D0D0D",fontSize:14,fontWeight:700 }}>{m.name} {m.name===myName&&<span style={{ color:"#FF3B55",fontSize:11,fontWeight:600 }}>(sen)</span>}</div>
                  <div style={{ color:m.ready?"#22C55E":"#D1D5DB",fontSize:11,fontWeight:600 }}>{m.ready?"✓ Hazır":"Bekleniyor..."}</div>
                </div>
                {i===0&&<span style={{ color:"white",fontSize:9,fontWeight:800,fontFamily:"'Syne',sans-serif",background:"#0D0D0D",padding:"4px 10px",borderRadius:50,letterSpacing:1.5 }}>HOST</span>}
              </div>
            ))}
          </div>
          {isHost
            ? <button className="cta" style={{ width:"100%",marginBottom:10 }} disabled={members.length<2} onClick={startFriendGame}>{members.length<2?"En az 2 kişi gerekli...":`Oyunu Başlat 🚀 (${members.length} kişi)`}</button>
            : <div style={{ textAlign:"center",padding:16,background:"#F9FAFB",border:"1.5px solid #E5E7EB",borderRadius:14,marginBottom:10,color:"#9CA3AF",fontSize:14 }}>⏳ Host oyunu başlatmayı bekliyor...</div>
          }
          <button className="ghost" style={{ width:"100%" }} onClick={()=>{ setIsFriend(false); setMembers([]); setPhase("intro"); }}>← Çık</button>
        </div>
      )}

      {/* ── LOADING ── */}
      {phase==="loading"&&(
        <div style={{ textAlign:"center",padding:32,zIndex:10 }}>
          <div style={{ width:56,height:56,border:"3.5px solid #F0F0EC",borderTop:"3.5px solid #FF3B55",borderRadius:"50%",animation:"spin 0.72s linear infinite",margin:"0 auto 32px" }}/>
          <div key={loadingStep} style={{ animation:"stepIn 0.3s ease both" }}>
            <div style={{ fontSize:40,marginBottom:14 }}>{STEPS[loadingStep].icon}</div>
            <p style={{ color:"#0D0D0D",fontSize:17,fontWeight:800,fontFamily:"'Syne',sans-serif",marginBottom:6 }}>{STEPS[loadingStep].text}</p>
            <p style={{ color:"#9CA3AF",fontSize:12,fontWeight:500 }}>Adım {loadingStep+1} / {STEPS.length}</p>
          </div>
          <div style={{ display:"flex",gap:6,justifyContent:"center",marginTop:28 }}>
            {STEPS.map((_,i)=><div key={i} style={{ width:i===loadingStep?24:6,height:6,borderRadius:3,background:i<=loadingStep?"#FF3B55":"#E5E7EB",transition:"all 0.3s" }}/>)}
          </div>
        </div>
      )}

      {/* ── ERROR ── */}
      {phase==="error"&&(
        <div className="fade-up" style={{ textAlign:"center",padding:24,maxWidth:360,zIndex:10 }}>
          <div style={{ fontSize:60,marginBottom:18 }}>😕</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:28,color:"#0D0D0D",marginBottom:14,fontWeight:800,letterSpacing:-0.5 }}>Bir sorun oluştu</h2>
          <p style={{ color:"#6B7280",fontSize:14,lineHeight:1.8,marginBottom:28,background:"white",border:"1.5px solid #E5E7EB",borderRadius:16,padding:"14px 18px" }}>{errorMsg}</p>
          <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
            <button className="cta" onClick={()=>startSolo(false)}>🔄 Tekrar Dene</button>
            <button className="ghost" onClick={()=>startSolo(true)}>Demo</button>
          </div>
        </div>
      )}

      {/* ── SWIPING ── */}
      {phase==="swiping"&&(
        <div style={{ width:"100%",maxWidth:400,display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 16px 12px",zIndex:10 }}>
          {flashDir&&(
            <div style={{ position:"fixed",inset:0,zIndex:500,pointerEvents:"none",background:flashDir==="right"?"rgba(34,197,94,0.09)":"rgba(255,59,85,0.09)",animation:"flashAnim 0.35s ease both" }}/>
          )}
          <div style={{ width:"100%",marginBottom:12,padding:"0 2px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:7 }}>
              <span style={{ color:"#9CA3AF",fontSize:12,fontWeight:500 }}>{isFriend?`${members.length} kişi · ${roomCode}`:isDemo?"Demo":"1.5 km çevren"}</span>
              <span style={{ color:"#9CA3AF",fontSize:12,fontWeight:500 }}>{cards.length-stack.length} / {cards.length}</span>
            </div>
            <div style={{ background:"#EBEBEB",borderRadius:4,height:4 }}>
              <div style={{ background:"linear-gradient(90deg,#FF3B55,#FF6830)",height:"100%",borderRadius:4,width:`${progress}%`,transition:"width 0.4s ease" }}/>
            </div>
          </div>
          {isFriend&&members.length>1&&(
            <div style={{ width:"100%",background:"white",border:"1.5px solid #F0F0F0",borderRadius:14,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,marginBottom:10,fontSize:12,color:"#9CA3AF",boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex" }}>
                {members.filter(m=>m.name!==myName).slice(0,3).map((m,i)=>(
                  <div key={m.id} style={{ width:24,height:24,borderRadius:"50%",background:avatarColor(m.name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"white",border:"2px solid white",marginLeft:i>0?-6:0 }}>{avatarLetter(m.name)}</div>
                ))}
              </div>
              <span style={{ fontWeight:500 }}>{members.filter(m=>m.name!==myName).map(m=>m.name).join(", ")} de kaydırıyor...</span>
              <div style={{ marginLeft:"auto",display:"flex",gap:3 }}>{[0,1,2].map(i=><div key={i} style={{ width:4,height:4,borderRadius:"50%",background:"#D1D5DB",animation:`blink 0.9s ${i*0.2}s ease infinite` }}/>)}</div>
            </div>
          )}
          <div style={{ position:"relative",width:"100%",height:"clamp(360px,54vh,490px)",marginBottom:22 }}>
            {stack.length>2&&<div style={{ position:"absolute",inset:0,borderRadius:28,background:"#DDDDD8",transform:"translateY(10px) scale(0.96)",zIndex:1 }}/>}
            {stack.length>1&&(
              <div style={{ position:"absolute",inset:0,borderRadius:28,background:`linear-gradient(155deg,${GRADIENTS[(cards.length-stack.length+1)%GRADIENTS.length][0]},${GRADIENTS[(cards.length-stack.length+1)%GRADIENTS.length][1]})`,transform:"translateY(5px) scale(0.984)",zIndex:2,overflow:"hidden" }}/>
            )}
            {stack.length>0&&(
              <TopCard key={stack[stack.length-1].id} card={stack[stack.length-1]} gradIndex={(cards.length-stack.length)%GRADIENTS.length} onSwipe={dir=>handleSwipe(stack[stack.length-1], dir)}/>
            )}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:24 }}>
            <button
              className="act-btn"
              onClick={()=>forceSwipe("left")}
              style={{ width:72,height:72,background:"white",border:"2.5px solid #0D0D0D",fontSize:26,boxShadow:"0 4px 16px rgba(0,0,0,0.1)" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#0D0D0D"; e.currentTarget.style.transform="scale(1.1)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="white"; e.currentTarget.style.transform="scale(1)"; }}
            >👎</button>
            <button
              className="act-btn"
              onClick={()=>forceSwipe("right")}
              style={{ width:72,height:72,background:"linear-gradient(135deg,#22C55E,#16A34A)",fontSize:26,animation:"glowGreen 2.5s ease infinite" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.12)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; }}
            >❤️</button>
          </div>
          <p style={{ color:"#CECECE",fontSize:11,marginTop:12,fontWeight:500,letterSpacing:0.5 }}>← Sürükle veya butona bas →</p>
        </div>
      )}

      {phase==="waiting"&&<WaitingScreen members={members} myName={myName} doneMembers={doneMembers} />}

      {phase==="matchList"&&<MatchListScreen matchedCards={matchedCards} members={members} onRestart={handleRestart} onHome={handleHome} isHost={isHost}/>}

      {/* ── RESULT ── */}
      {phase==="result"&&result&&(
        <div className="fade-up" style={{ textAlign:"center",padding:"20px 20px 28px",maxWidth:420,width:"100%",zIndex:10 }}>
          <div style={{ fontSize:10,color:"#FF3B55",fontWeight:800,letterSpacing:4,marginBottom:14,textTransform:"uppercase" }}>
            {likedCount>0?`${likedCount} mekan beğendin`:"Hiçbirini beğenmeseydin de..."}
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:44,color:"#0D0D0D",lineHeight:0.98,marginBottom:22,fontWeight:800,letterSpacing:-2 }}>
            Bu gece<br/><span style={{ color:"#FF3B55" }}>buraya git!</span>
          </h1>
          <div style={{ borderRadius:24,overflow:"hidden",marginBottom:18,position:"relative",height:252,background:`linear-gradient(155deg,${GRADIENTS[0][0]},${GRADIENTS[0][1]})`,boxShadow:"0 20px 56px rgba(0,0,0,0.22)" }}>
            {result.photo ? <img src={result.photo} alt={result.name} style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover" }}/> : <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:80 }}>{result.emoji}</div>}
            <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0) 55%)" }}/>
            <div style={{ position:"absolute",top:14,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#FF3B55,#FF6830)",color:"white",fontWeight:800,fontFamily:"'Syne',sans-serif",fontSize:9,padding:"6px 20px",borderRadius:50,letterSpacing:3,whiteSpace:"nowrap" }}>✨ EN İYİ SEÇİM</div>
            <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"18px 20px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap" }}>
                {result.rating>0&&<span style={{ color:"#FFD60A",fontWeight:800,fontSize:13 }}>★ {result.rating.toFixed(1)}</span>}
                {result.price&&<span style={{ color:"#FF6830",fontWeight:800,fontSize:13 }}>{result.price}</span>}
                <span style={{ color:result.isOpen?"#4ADE80":"#F87171",fontWeight:700,fontSize:11 }}>{result.isOpen?"● AÇIK":"● KAPALI"}</span>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:26,color:"white",marginBottom:4,fontWeight:800 }}>{result.name}</div>
              <div style={{ color:"rgba(255,255,255,0.45)",fontSize:12,fontWeight:500 }}>📍 {result.address}</div>
            </div>
          </div>
          {likedCards.length>1&&(
            <div style={{ marginBottom:18,textAlign:"left" }}>
              <div style={{ fontSize:10,color:"#9CA3AF",fontWeight:800,letterSpacing:3,marginBottom:12,textTransform:"uppercase" }}>Diğer beğenilerin</div>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {likedCards.slice(1).map(card=>(
                  <div key={card.id} style={{ background:"white",borderRadius:16,border:"1.5px solid #F0F0F0",display:"flex",alignItems:"center",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ width:68,height:68,background:`linear-gradient(135deg,${GRADIENTS[2][0]},${GRADIENTS[2][1]})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0,position:"relative" }}>
                      {card.photo?<img src={card.photo} alt={card.name} style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover" }}/>:card.emoji}
                    </div>
                    <div style={{ padding:"10px 16px",flex:1,textAlign:"left" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif",fontSize:15,color:"#0D0D0D",fontWeight:700,marginBottom:2 }}>{card.name}</div>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        {card.rating>0&&<span style={{ color:getRatingColor(card.rating),fontWeight:700,fontSize:12 }}>★ {card.rating.toFixed(1)}</span>}
                        {card.price&&<span style={{ color:"#FF6830",fontSize:12,fontWeight:700 }}>{card.price}</span>}
                        <span style={{ color:card.isOpen?"#22C55E":"#EF4444",fontSize:11,fontWeight:600 }}>{card.isOpen?"● Açık":"● Kapalı"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
            <button className="cta" onClick={()=>{ const s=[...cards].sort(()=>Math.random()-0.5); setStack([...s].reverse()); setLikedCount(0); setLikedCards([]); simSwipes.current={}; setPhase("swiping"); }}>🔄 Tekrar</button>
            <button className="ghost" onClick={handleHome}>Ana Sayfa</button>
          </div>
        </div>
      )}
    </div>
  );
}
