import React from "react";
import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const GOOGLE_API_KEY = "SENIN_API_KEYIN_BURAYA";
const HAS_API_KEY = GOOGLE_API_KEY !== "SENIN_API_KEYIN_BURAYA";

const SUPABASE_URL = "https://oqdbawuraddjuzjuvust.supabase.co";
const SUPABASE_KEY = "sb_publishable_6nkPixi3W2ZQufoS3Jm5Lg_qtF84IVp";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEMO_CARDS = [
  { id:"d1", name:"Çiya Sofrası",            address:"Kadıköy, İstanbul",  rating:4.7, ratingCount:3200, price:"₺₺",  isOpen:true,  photo:null, emoji:"🍲", types:["restaurant","turkish"] },
  { id:"d2", name:"Karaköy Güllüoğlu",       address:"Karaköy, İstanbul",  rating:4.8, ratingCount:8100, price:"₺",   isOpen:true,  photo:null, emoji:"🥐", types:["bakery","cafe"] },
  { id:"d3", name:"Borsam Taşfırın",         address:"Beşiktaş, İstanbul", rating:4.6, ratingCount:1540, price:"₺₺",  isOpen:true,  photo:null, emoji:"🍕", types:["restaurant"] },
  { id:"d4", name:"Zübeyir Ocakbaşı",        address:"Beyoğlu, İstanbul",  rating:4.5, ratingCount:2200, price:"₺₺₺", isOpen:false, photo:null, emoji:"🥩", types:["restaurant","bar"] },
  { id:"d5", name:"Filibe Köftecisi",        address:"Eminönü, İstanbul",  rating:4.4, ratingCount:890,  price:"₺",   isOpen:true,  photo:null, emoji:"🍖", types:["restaurant"] },
  { id:"d6", name:"Kokoreçci Şükrü Usta",   address:"Taksim, İstanbul",   rating:4.3, ratingCount:670,  price:"₺",   isOpen:true,  photo:null, emoji:"🌯", types:["meal_takeaway"] },
  { id:"d7", name:"Hamdi Restaurant",        address:"Eminönü, İstanbul",  rating:4.6, ratingCount:4300, price:"₺₺₺", isOpen:true,  photo:null, emoji:"🍽️", types:["restaurant"] },
  { id:"d8", name:"Karaköy Pidecisi",        address:"Karaköy, İstanbul",  rating:4.5, ratingCount:1100, price:"₺₺",  isOpen:true,  photo:null, emoji:"🫓", types:["restaurant"] },
];

const GRADIENTS = [
  ["#fff9ed","#fff0d0"], ["#edfff4","#d0ffe4"], ["#fff0f9","#ffd6ee"],
  ["#f0f9ff","#d0eeff"], ["#fffbe8","#fff0b3"], ["#f4fff0","#d8f5d0"],
];

const AVATAR_COLORS = ["#ff5722","#2196f3","#9c27b0","#4caf50","#ff9800","#00bcd4","#e91e63","#607d8b"];

function getPriceLabel(l) { return l ? (["","₺","₺₺","₺₺₺","₺₺₺₺"][l]||"") : ""; }
function getRatingColor(r) { return r>=4.5?"#16a34a":r>=4.0?"#ca8a04":r>=3.5?"#ea580c":"#dc2626"; }
function avatarColor(name) { return AVATAR_COLORS[(name?.charCodeAt(0)||0) % AVATAR_COLORS.length]; }
function avatarLetter(name) { return name ? name[0].toUpperCase() : "?"; }
function genCode() { return Math.random().toString(36).slice(2,8).toUpperCase(); }

function TopCard({ card, gradIndex, onSwipe }) {
  const ref = useRef(null);
  const grad = GRADIENTS[gradIndex % GRADIENTS.length];
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transition = "none";
    el.getBoundingClientRect();
    el.style.transition = "opacity 0.18s ease";
    el.style.opacity = "";
    const tid = setTimeout(() => { if (ref.current) ref.current.style.transition = ""; }, 220);
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
    <div ref={ref} id={"tc-"+card.id} style={{ position:"absolute",inset:0,borderRadius:26,overflow:"hidden",background:`linear-gradient(155deg,${grad[0]},${grad[1]})`,cursor:"grab",userSelect:"none",touchAction:"none",willChange:"transform",zIndex:10,border:"1px solid rgba(0,0,0,0.06)",boxShadow:"0 8px 40px rgba(0,0,0,0.1)" }}>
      {card.photo ? <img src={card.photo} alt={card.name} draggable={false} style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",pointerEvents:"none" }}/> : <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:100,filter:"drop-shadow(0 6px 16px rgba(0,0,0,0.15))",pointerEvents:"none" }}>{card.emoji}</div>}
      <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.25) 45%,rgba(0,0,0,0) 100%)",pointerEvents:"none" }}/>
      <div className="ll" style={{ position:"absolute",top:26,left:22,opacity:0,transition:"opacity 0.05s",background:"rgba(34,197,94,0.93)",backdropFilter:"blur(10px)",color:"white",fontWeight:900,fontSize:18,padding:"8px 20px",borderRadius:12,border:"2.5px solid rgba(74,222,128,0.7)",transform:"rotate(-10deg)",letterSpacing:1.5,pointerEvents:"none" }}>YEP 🔥</div>
      <div className="nl" style={{ position:"absolute",top:26,left:22,opacity:0,transition:"opacity 0.05s",background:"rgba(239,68,68,0.93)",backdropFilter:"blur(10px)",color:"white",fontWeight:900,fontSize:18,padding:"8px 20px",borderRadius:12,border:"2.5px solid rgba(248,113,113,0.7)",transform:"rotate(-10deg)",letterSpacing:1.5,pointerEvents:"none" }}>NOPE 👋</div>
      <div style={{ position:"absolute",top:22,right:22,pointerEvents:"none",background:"rgba(255,255,255,0.85)",border:`1px solid ${card.isOpen?"rgba(74,222,128,0.6)":"rgba(248,113,113,0.6)"}`,padding:"4px 12px",borderRadius:20,color:card.isOpen?"#15803d":"#dc2626",fontSize:11,fontWeight:700,letterSpacing:1,backdropFilter:"blur(8px)" }}>{card.isOpen?"● AÇIK":"● KAPALI"}</div>
      <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"0 22px 28px",pointerEvents:"none" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap" }}>
          {card.rating>0&&(<div style={{ display:"inline-flex",alignItems:"center",gap:5,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(12px)",padding:"5px 12px",borderRadius:20 }}><span style={{ color:getRatingColor(card.rating),fontWeight:800,fontSize:15 }}>★ {card.rating.toFixed(1)}</span><span style={{ color:"#444",fontSize:11 }}>({card.ratingCount.toLocaleString()})</span></div>)}
          {card.price&&(<div style={{ background:"rgba(0,0,0,0.6)",backdropFilter:"blur(12px)",padding:"5px 12px",borderRadius:20,color:"#4ade80",fontWeight:700,fontSize:13 }}>{card.price}</div>)}
        </div>
        <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:30,color:"white",lineHeight:1.15,marginBottom:6,letterSpacing:-0.5,textShadow:"0 2px 20px rgba(0,0,0,0.9)" }}>{card.name}</h2>
        <p style={{ color:"rgba(255,255,255,0.35)",fontSize:13,marginBottom:14 }}>📍 {card.address}</p>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{card.types?.filter(t=>!["point_of_interest","establishment","food"].includes(t)).slice(0,3).map(t=>(<span key={t} style={{ background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.45)",padding:"4px 10px",borderRadius:20,fontSize:11 }}>{t.replace(/_/g," ")}</span>))}</div>
      </div>
    </div>
  );
}

// ─── Waiting Screen ───────────────────────────────────────────
function WaitingScreen({ members, myName, doneMembers }) {
  const waiting = members.filter(m => !doneMembers.has(m.name) && m.name !== myName);
  return (
    <div style={{ textAlign:"center",padding:"40px 24px",maxWidth:400,zIndex:10 }}>
      <div style={{ fontSize:52,marginBottom:16 }}>🕐</div>
      <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:28,color:"#111827",marginBottom:8 }}>Bitti!</h2>
      <p style={{ color:"#9ca3af",fontSize:14,marginBottom:32 }}>
        {waiting.length > 0 ? `${waiting.map(m=>m.name).join(", ")} henüz bitirmedi...` : "Herkes bitti, yükleniyor..."}
      </p>
      <div style={{ display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap" }}>
        {members.map(m => (
          <div key={m.id} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:8 }}>
            <div style={{ width:48,height:48,borderRadius:"50%",background:avatarColor(m.name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"white",border:`3px solid ${doneMembers.has(m.name)||m.name===myName?"#16a34a":"#e5e7eb"}`,transition:"border-color .3s" }}>
              {avatarLetter(m.name)}
            </div>
            <span style={{ fontSize:11,fontWeight:600,color:doneMembers.has(m.name)||m.name===myName?"#16a34a":"#9ca3af" }}>
              {doneMembers.has(m.name)||m.name===myName?"✓ Bitti":"Devam..."}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Confetti ────────────────────────────────────────────────
const CONFETTI_COLORS = ["#16a34a","#4ade80","#fbbf24","#f472b6","#60a5fa","#f97316","#a78bfa"];
function Confetti({ onDone }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 10,
      vx: (Math.random() - 0.5) * 7,
      vy: -(Math.random() * 14 + 7),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      w: Math.random() * 8 + 4,
      h: Math.random() * 5 + 3,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 12,
      gravity: 0.35,
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
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (elapsed < 2200) { animId = requestAnimationFrame(animate); } else { onDone?.(); }
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:9999 }} />;
}

// ─── Match List Screen ────────────────────────────────────────
function MatchListScreen({ matchedCards, members, onRestart, onHome, isHost }) {
  return (
    <div style={{ width:"100%",maxWidth:420,padding:"20px 20px 40px",zIndex:10,flexShrink:0 }}>
      <div style={{ textAlign:"center",marginBottom:24 }}>
        <div style={{ fontSize:52,marginBottom:8 }}>🎉</div>
        <div style={{ fontFamily:"'Playfair Display',serif",fontSize:32,color:"#111827",fontWeight:700,letterSpacing:-1,marginBottom:6 }}>{matchedCards.length > 0 ? "Eşleşmeler!" : "Ortak seçim yok"}</div>
        <div style={{ display:"flex",justifyContent:"center",marginBottom:12 }}>{members.map((m,i)=>(<div key={m.id} style={{ width:36,height:36,borderRadius:"50%",background:avatarColor(m.name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white",border:"3px solid #f8fdf4",marginLeft:i>0?-8:0,zIndex:members.length-i }}>{avatarLetter(m.name)}</div>))}</div>
        <p style={{ color:"#9ca3af",fontSize:13 }}>{matchedCards.length > 0 ? `${members.map(m=>m.name).join(" ve ")} ${matchedCards.length} restoranı ortak beğendi` : "Hiç ortak beğeni olmadı, tekrar deneyin!"}</p>
      </div>
      {matchedCards.length > 0 ? (
        <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:24 }}>
          {matchedCards.map((card, i) => (
            <div key={card.id} style={{ background:"white",borderRadius:18,overflow:"hidden",border:"1px solid #e5e7eb",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",display:"flex",alignItems:"center" }}>
              <div style={{ width:80,height:80,background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,flexShrink:0,position:"relative" }}>
                {card.photo ? <img src={card.photo} alt={card.name} style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover" }}/> : card.emoji}
              </div>
              <div style={{ padding:"12px 14px",flex:1 }}>
                {i===0&&<span style={{ background:"#dcfce7",color:"#15803d",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,display:"inline-block",marginBottom:4 }}>EN İYİ EŞLEŞME</span>}
                <div style={{ fontFamily:"'Playfair Display',serif",fontSize:16,color:"#111827",marginBottom:3 }}>{card.name}</div>
                <div style={{ color:"#9ca3af",fontSize:12,marginBottom:4 }}>📍 {card.address}</div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  {card.rating>0&&<span style={{ color:getRatingColor(card.rating),fontWeight:700,fontSize:13 }}>★ {card.rating.toFixed(1)}</span>}
                  {card.price&&<span style={{ color:"#16a34a",fontWeight:600,fontSize:13 }}>{card.price}</span>}
                  <span style={{ color:card.isOpen?"#16a34a":"#dc2626",fontSize:11,fontWeight:600 }}>{card.isOpen?"● Açık":"● Kapalı"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign:"center",padding:"32px 0",marginBottom:24 }}><div style={{ fontSize:48,marginBottom:12 }}>🤷</div><p style={{ color:"#9ca3af",fontSize:14 }}>Farklı zevkler! Tekrar deneyin.</p></div>
      )}
      <div style={{ display:"flex",gap:10 }}>
        {isHost
          ? <button className="cta" style={{ flex:1 }} onClick={onRestart}>🔄 Tekrar Oyna</button>
          : <div style={{ flex:1,textAlign:"center",padding:14,background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:14,color:"#9ca3af",fontSize:14 }}>⏳ Host yeni oyun başlatmayı bekliyor...</div>
        }
        <button className="ghost" onClick={onHome}>Ana Sayfa</button>
      </div>
    </div>
  );
}

export default function FoodSwipeApp() {
  const [phase, setPhase] = useState("intro");
  const [myName, setMyName] = useState(""); const [nameInput, setNameInput] = useState(""); const [nameTarget, setNameTarget] = useState("");
  const [isFriend, setIsFriend] = useState(false); const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState(""); const [joinInput, setJoinInput] = useState("");
  const [members, setMembers] = useState([]);
  const simSwipes = useRef({});
  const swipedCards = useRef(new Set()); // çift swipe önleme
  const [remoteLikes, setRemoteLikes] = useState({});
  const remoteLikesRef = useRef({});
  const [matchedCards, setMatchedCards] = useState([]);
  // ── YENİ: kim bitirdi takibi ──
  const [doneMembers, setDoneMembers] = useState(new Set());
  const channelRef = useRef(null);
  const membersRef = useRef([]); // stale closure önleme
  const setMembersAndRef = (fn) => {
    setMembers(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      membersRef.current = next;
      return next;
    });
  };
  const myFinishedRef = useRef(false); // ben bitirdim mi?
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

      // Birisi bitirdi
      if (direction === "done" && card_id === "DONE") {
        setDoneMembers(prev => {
          const updated = new Set([...prev, member_name]);
          const othersCount = membersRef.current.length - 1; // ben hariç
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
    // Çift swipe önleme — aynı kart iki kez işlenemesin
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
        remoteLikesRef.current = myLikes;
        setRemoteLikes(myLikes);
      }
    }

    setStack(prev => {
      const next = prev.filter(c=>c.id!==card.id);
      if (next.length===0) {
        setTimeout(async () => {
          if (isFriend) {
            // Bittiğimi Supabase'e yaz
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
            const sorted = newLiked.length>0
              ? [...newLiked].sort((a,b) => b.rating - a.rating)
              : [...cards].sort((a,b) => b.rating - a.rating);
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
    <div style={{ height:"100vh", background:"#f8fdf4", fontFamily:"'DM Sans',sans-serif",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start",
      paddingTop:"60px", paddingBottom:"40px",
      overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
      {showConfetti && <Confetti key={confettiKey} onDone={() => setShowConfetti(false)} />}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;900&family=Gudea:wght@400;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{margin:0;padding:0;}
        html{overflow-x:hidden;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
        @keyframes stepIn{from{opacity:0;transform:translateX(-12px);}to{opacity:1;transform:translateX(0);}}
        @keyframes glowGreen{0%,100%{box-shadow:0 8px 32px rgba(34,197,94,0.3);}50%{box-shadow:0 8px 48px rgba(34,197,94,0.55);}}
        @keyframes flashAnim{0%{opacity:1;}100%{opacity:0;}}
        @keyframes blink{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .fade-up{animation:fadeUp 0.45s cubic-bezier(0.34,1.2,0.64,1) both;}
        .cta{background:#16a34a;color:white;border:none;padding:16px 40px;border-radius:50px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .18s;}
        .cta:hover{background:#15803d;transform:translateY(-2px);box-shadow:0 10px 32px rgba(22,163,74,0.4);}
        .cta:active{transform:translateY(0);}
        .cta:disabled{background:#d1d5db!important;color:#9ca3af!important;transform:none!important;cursor:not-allowed;}
        .ghost{background:white;color:#6b7280;border:1.5px solid #e5e7eb;padding:14px 28px;border-radius:50px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .18s;}
        .ghost:hover{border-color:#d1d5db;color:#374151;}
        .demo-btn{background:white;color:#9ca3af;border:1px solid #e5e7eb;padding:11px 22px;border-radius:50px;font-size:13px;cursor:pointer;font-family:inherit;transition:all .18s;}
        .demo-btn:hover{background:#f9fafb;color:#6b7280;border-color:#d1d5db;}
        .act-btn{border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .15s,background .15s;}
        .act-btn:active{transform:scale(0.88)!important;}
        .inp{width:100%;background:white;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;color:#111827;font-size:15px;font-family:inherit;outline:none;transition:border-color .2s;box-shadow:0 1px 3px rgba(0,0,0,0.05);}
        .inp:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,0.1);}
        .inp::placeholder{color:#d1d5db;}
      `}</style>

      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 22px",borderBottom:"1px solid #e5e7eb",background:"rgba(248,253,244,0.92)",backdropFilter:"blur(20px)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:17 }}>🍽️</span>
          <span style={{ fontFamily:"'Playfair Display',serif",fontSize:17,color:"#111827",fontStyle:"italic" }}>ne yesek</span>
          {isFriend&&<span style={{ background:"#dcfce7",color:"#15803d",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,letterSpacing:1 }}>ARKADAŞ</span>}
          {!isFriend&&isDemo&&<span style={{ background:"#f3f4f6",color:"#9ca3af",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,letterSpacing:1 }}>DEMO</span>}
        </div>
        {phase==="swiping"&&(
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            {isFriend&&(<div style={{ display:"flex" }}>{members.slice(0,4).map((m,i)=>(<div key={m.id} style={{ width:26,height:26,borderRadius:"50%",background:avatarColor(m.name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white",border:"2px solid #f8fdf4",marginLeft:i>0?-7:0,zIndex:10-i }}>{avatarLetter(m.name)}</div>))}</div>)}
            <div style={{ display:"flex",alignItems:"center",gap:4,background:"#dcfce7",padding:"4px 10px",borderRadius:20 }}>
              <span style={{ fontSize:12 }}>❤️</span>
              <span style={{ color:"#15803d",fontSize:13,fontWeight:700 }}>{likedCount}</span>
            </div>
          </div>
        )}
      </nav>

      <div style={{ position:"fixed",top:"-15%",left:"50%",transform:"translateX(-50%)",width:900,height:700,background:"radial-gradient(ellipse,rgba(22,163,74,0.06) 0%,transparent 65%)",pointerEvents:"none",zIndex:0 }}/>

      {phase==="intro"&&(
        <div className="fade-up" style={{ textAlign:"center",padding:"0 24px",maxWidth:400,zIndex:10 }}>
          <div style={{ fontSize:80,marginBottom:22,animation:"bounce 2.6s ease infinite",filter:"drop-shadow(0 8px 28px rgba(22,163,74,0.3))" }}>🗺️</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:46,color:"#111827",lineHeight:1.05,marginBottom:14,letterSpacing:-1 }}>Bugün ne<br/><em style={{ color:"#16a34a" }}>yesek?</em></h1>
          <p style={{ color:"#9ca3af",fontSize:14,lineHeight:1.8,marginBottom:32 }}>Tek başına veya arkadaşlarınla kaydır,<br/>ortak sevdiğiniz restoranı bul.</p>
          <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:16,width:"100%" }}>
            <button onClick={()=>startSolo(false)} style={{ width:"100%",padding:"22px 28px",background:"#16a34a",color:"white",border:"none",borderRadius:20,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all .18s",boxShadow:"0 4px 20px rgba(22,163,74,0.25)" }} onMouseEnter={e=>{ e.currentTarget.style.background="#15803d"; e.currentTarget.style.transform="translateY(-2px)"; }} onMouseLeave={e=>{ e.currentTarget.style.background="#16a34a"; e.currentTarget.style.transform="translateY(0)"; }}>
              <div style={{ textAlign:"left" }}><div style={{ fontSize:18,fontWeight:900,letterSpacing:-0.3,marginBottom:3 }}>Tek Başına</div><div style={{ fontSize:12,opacity:0.75,fontWeight:500 }}>GPS ile yakın restoranları tara</div></div>
              <span style={{ fontSize:28 }}>📍</span>
            </button>
            <button onClick={()=>requireName("friend")} style={{ width:"100%",padding:"22px 28px",background:"white",color:"#16a34a",border:"2px solid #16a34a",borderRadius:20,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all .18s" }} onMouseEnter={e=>{ e.currentTarget.style.background="#f0fdf4"; e.currentTarget.style.transform="translateY(-2px)"; }} onMouseLeave={e=>{ e.currentTarget.style.background="white"; e.currentTarget.style.transform="translateY(0)"; }}>
              <div style={{ textAlign:"left" }}><div style={{ fontSize:18,fontWeight:900,letterSpacing:-0.3,marginBottom:3 }}>Arkadaş Modu</div><div style={{ fontSize:12,color:"#9ca3af",fontWeight:500 }}>Hep beraber kaydırın, eşleşen kazanır</div></div>
              <span style={{ fontSize:28 }}>👥</span>
            </button>
          </div>
          <button className="demo-btn" onClick={()=>startSolo(true)}>🎭 Hızlı demo</button>
        </div>
      )}

      {phase==="name"&&(
        <div className="fade-up" style={{ width:"100%",maxWidth:380,padding:"20px 24px 24px",zIndex:10 }}>
          <button onClick={()=>setPhase("intro")} style={{ background:"none",border:"none",color:"#9ca3af",fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:28,display:"flex",alignItems:"center",gap:6 }}>← Geri</button>
          <div style={{ fontSize:11,color:"#16a34a",fontWeight:700,letterSpacing:3,marginBottom:12,textTransform:"uppercase" }}>Arkadaş Modu</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:34,color:"#111827",marginBottom:8,letterSpacing:-0.5 }}>Adın ne?</h2>
          <p style={{ color:"#9ca3af",fontSize:14,marginBottom:24 }}>Arkadaşların seni bu isimle görecek</p>
          <input className="inp" placeholder="Adını yaz..." value={nameInput} autoFocus onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitName()} style={{ marginBottom:14 }}/>
          <button className="cta" style={{ width:"100%" }} onClick={submitName} disabled={!nameInput.trim()}>Devam Et →</button>
        </div>
      )}

      {phase==="friendMenu"&&(
        <div className="fade-up" style={{ width:"100%",maxWidth:380,padding:"20px 24px 24px",zIndex:10 }}>
          <button onClick={()=>setPhase("intro")} style={{ background:"none",border:"none",color:"#9ca3af",fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:28,display:"flex",alignItems:"center",gap:6 }}>← Geri</button>
          <div style={{ fontSize:11,color:"#16a34a",fontWeight:700,letterSpacing:3,marginBottom:12,textTransform:"uppercase" }}>Arkadaş Modu</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:32,color:"#111827",marginBottom:24,letterSpacing:-0.5 }}>Merhaba, <em style={{ color:"#16a34a" }}>{myName}</em>!</h2>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <div style={{ background:"white",border:"1.5px solid #e5e7eb",borderRadius:18,padding:"18px 20px",cursor:"pointer",transition:"all .2s",display:"flex",alignItems:"center",gap:14,boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }} onClick={createRoom} onMouseEnter={e=>e.currentTarget.style.borderColor="#16a34a"} onMouseLeave={e=>e.currentTarget.style.borderColor="#e5e7eb"}>
              <div style={{ width:42,height:42,borderRadius:13,background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>🏠</div>
              <div style={{ textAlign:"left" }}><div style={{ color:"#111827",fontSize:15,fontWeight:700,marginBottom:2 }}>Oda Oluştur</div><div style={{ color:"#9ca3af",fontSize:12 }}>Arkadaşlarını davet et</div></div>
              <div style={{ marginLeft:"auto",color:"#d1d5db",fontSize:18 }}>›</div>
            </div>
            <div style={{ background:"white",border:"1.5px solid #e5e7eb",borderRadius:18,padding:18,boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ color:"#374151",fontSize:14,fontWeight:600,marginBottom:12 }}>🔑 Odaya Katıl</div>
              <input className="inp" placeholder="Oda kodunu gir..." value={joinInput} onChange={e=>setJoinInput(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&joinRoom()} style={{ textAlign:"center",letterSpacing:4,fontSize:18,fontWeight:700,marginBottom:10,fontFamily:"'Gudea',sans-serif" }}/>
              <button className="cta" style={{ width:"100%",padding:"14px" }} onClick={joinRoom} disabled={joinInput.trim().length<4}>Katıl →</button>
            </div>
          </div>
        </div>
      )}

      {phase==="lobby"&&(
        <div style={{ width:"100%",maxWidth:400,padding:"20px 20px 20px",zIndex:10 }}>
          <div style={{ textAlign:"center",marginBottom:24 }}>
            <div style={{ fontSize:11,color:"#16a34a",fontWeight:700,letterSpacing:3,marginBottom:10,textTransform:"uppercase" }}>Arkadaş Modu</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:34,color:"#111827",letterSpacing:-1 }}>Oda <em style={{ color:"#16a34a",fontFamily:"'Gudea',sans-serif",fontStyle:"normal" }}>{roomCode}</em></h2>
          </div>
          <div style={{ background:"white",border:"1px solid #e5e7eb",borderRadius:18,padding:"18px 22px",textAlign:"center",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ color:"#9ca3af",fontSize:11,fontWeight:600,letterSpacing:2,marginBottom:8 }}>ODA KODU</div>
            <div style={{ fontFamily:"'Gudea',sans-serif",fontSize:38,color:"#111827",letterSpacing:8,fontWeight:700 }}>{roomCode}</div>
          </div>
          <div style={{ background:"white",border:"1px solid #e5e7eb",borderRadius:18,padding:"16px 18px",marginBottom:18,boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ color:"#9ca3af",fontSize:11,fontWeight:600,letterSpacing:2,marginBottom:14 }}>KATILANLAR · {members.length} KİŞİ</div>
            {members.map((m,i)=>(
              <div key={m.id} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:i<members.length-1?10:0 }}>
                <div style={{ width:36,height:36,borderRadius:"50%",background:avatarColor(m.name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white",flexShrink:0 }}>{avatarLetter(m.name)}</div>
                <div style={{ flex:1 }}><div style={{ color:"#111827",fontSize:14,fontWeight:600 }}>{m.name} {m.name===myName&&<span style={{ color:"#16a34a",fontSize:11 }}>(sen)</span>}</div><div style={{ color:m.ready?"#16a34a":"#d1d5db",fontSize:11 }}>{m.ready?"✓ Hazır":"Bekleniyor..."}</div></div>
                {i===0&&<span style={{ color:"#15803d",fontSize:10,fontWeight:700,background:"#dcfce7",padding:"3px 9px",borderRadius:20 }}>HOST</span>}
              </div>
            ))}
          </div>
          {isHost ? <button className="cta" style={{ width:"100%",marginBottom:10 }} disabled={members.length<2} onClick={startFriendGame}>{members.length<2?"En az 2 kişi gerekli...":`Oyunu Başlat 🚀 (${members.length} kişi)`}</button> : <div style={{ textAlign:"center",padding:14,background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:14,marginBottom:10,color:"#9ca3af",fontSize:14 }}>⏳ Host oyunu başlatmayı bekliyor...</div>}
          <button className="ghost" style={{ width:"100%" }} onClick={()=>{ setIsFriend(false); setMembers([]); setPhase("intro"); }}>← Çık</button>
        </div>
      )}

      {phase==="loading"&&(
        <div style={{ textAlign:"center",padding:32,zIndex:10 }}>
          <div style={{ width:52,height:52,border:"3px solid #e5e7eb",borderTop:"3px solid #16a34a",borderRadius:"50%",animation:"spin 0.75s linear infinite",margin:"0 auto 28px" }}/>
          <div key={loadingStep} style={{ animation:"stepIn 0.3s ease both" }}>
            <div style={{ fontSize:36,marginBottom:12 }}>{STEPS[loadingStep].icon}</div>
            <p style={{ color:"#111827",fontSize:16,fontWeight:600,marginBottom:5 }}>{STEPS[loadingStep].text}</p>
            <p style={{ color:"#9ca3af",fontSize:12 }}>Adım {loadingStep+1} / {STEPS.length}</p>
          </div>
          <div style={{ display:"flex",gap:6,justifyContent:"center",marginTop:24 }}>{STEPS.map((_,i)=><div key={i} style={{ width:i===loadingStep?20:6,height:6,borderRadius:3,background:i<=loadingStep?"#16a34a":"#e5e7eb",transition:"all 0.3s" }}/>)}</div>
        </div>
      )}

      {phase==="error"&&(
        <div className="fade-up" style={{ textAlign:"center",padding:24,maxWidth:360,zIndex:10 }}>
          <div style={{ fontSize:56,marginBottom:16 }}>😕</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:22,color:"#111827",marginBottom:12 }}>Bir sorun oluştu</h2>
          <p style={{ color:"#6b7280",fontSize:14,lineHeight:1.8,marginBottom:28,background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:"13px 17px" }}>{errorMsg}</p>
          <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
            <button className="cta" onClick={()=>startSolo(false)}>🔄 Tekrar Dene</button>
            <button className="ghost" onClick={()=>startSolo(true)}>Demo</button>
          </div>
        </div>
      )}

      {phase==="swiping"&&(
        <div style={{ width:"100%",maxWidth:400,display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 16px 12px",zIndex:10 }}>
          {flashDir&&(<div style={{ position:"fixed",inset:0,zIndex:500,pointerEvents:"none",background:flashDir==="right"?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",animation:"flashAnim 0.35s ease both" }}/>)}
          <div style={{ width:"100%",marginBottom:10,padding:"0 2px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
              <span style={{ color:"#9ca3af",fontSize:12 }}>{isFriend?`${members.length} kişi · ${roomCode}`:isDemo?"Demo":"1.5 km çevren"}</span>
              <span style={{ color:"#9ca3af",fontSize:12 }}>{cards.length-stack.length} / {cards.length}</span>
            </div>
            <div style={{ background:"#e5e7eb",borderRadius:3,height:3 }}><div style={{ background:"linear-gradient(90deg,#16a34a,#4ade80)",height:"100%",borderRadius:3,width:`${progress}%`,transition:"width 0.4s ease" }}/></div>
          </div>
          {isFriend&&members.length>1&&(
            <div style={{ width:"100%",background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"9px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:10,fontSize:12,color:"#9ca3af" }}>
              <div style={{ display:"flex" }}>{members.filter(m=>m.name!==myName).slice(0,3).map((m,i)=>(<div key={m.id} style={{ width:24,height:24,borderRadius:"50%",background:avatarColor(m.name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white",border:"2px solid white",marginLeft:i>0?-6:0 }}>{avatarLetter(m.name)}</div>))}</div>
              <span>{members.filter(m=>m.name!==myName).map(m=>m.name).join(", ")} de kaydırıyor...</span>
              <div style={{ marginLeft:"auto",display:"flex",gap:3 }}>{[0,1,2].map(i=><div key={i} style={{ width:4,height:4,borderRadius:"50%",background:"#d1d5db",animation:`blink 0.9s ${i*0.2}s ease infinite` }}/>)}</div>
            </div>
          )}
          <div style={{ position:"relative",width:"100%",height:460,marginBottom:20 }}>
            {stack.length>2&&<div style={{ position:"absolute",inset:0,borderRadius:26,background:"#e5e7eb",transform:"scale(0.87) translateY(28px)",zIndex:1 }}/>}
            {stack.length>1&&(<div style={{ position:"absolute",inset:0,borderRadius:26,background:`linear-gradient(155deg,${GRADIENTS[(cards.length-stack.length+1)%GRADIENTS.length][0]},${GRADIENTS[(cards.length-stack.length+1)%GRADIENTS.length][1]})`,transform:"scale(0.94) translateY(14px)",zIndex:2,overflow:"hidden",border:"1px solid rgba(0,0,0,0.06)" }}/>)}
            {stack.length>0&&(<TopCard key={stack[stack.length-1].id} card={stack[stack.length-1]} gradIndex={(cards.length-stack.length)%GRADIENTS.length} onSwipe={dir=>handleSwipe(stack[stack.length-1], dir)}/>)}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:20 }}>
            <button className="act-btn" onClick={()=>forceSwipe("left")} style={{ width:62,height:62,background:"white",border:"1.5px solid #e5e7eb",fontSize:22,boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }} onMouseEnter={e=>e.currentTarget.style.background="#fff1f2"} onMouseLeave={e=>e.currentTarget.style.background="white"}>👎</button>
            <button className="act-btn" onClick={()=>forceSwipe("right")} style={{ width:74,height:74,background:"#16a34a",fontSize:26,animation:"glowGreen 2.5s ease infinite" }} onMouseEnter={e=>{e.currentTarget.style.background="#15803d";e.currentTarget.style.transform="scale(1.08)";}} onMouseLeave={e=>{e.currentTarget.style.background="#16a34a";e.currentTarget.style.transform="scale(1)";}}>❤️</button>
          </div>
          <p style={{ color:"#d1d5db",fontSize:11,marginTop:10,letterSpacing:0.5 }}>← Sürükle veya butona bas →</p>
        </div>
      )}

      {/* ── WAITING ── */}
      {phase==="waiting"&&(
        <WaitingScreen members={members} myName={myName} doneMembers={doneMembers} />
      )}

      {phase==="matchList"&&(
        <MatchListScreen matchedCards={matchedCards} members={members} onRestart={handleRestart} onHome={handleHome} isHost={isHost}/>
      )}

      {phase==="result"&&result&&(
        <div className="fade-up" style={{ textAlign:"center",padding:"20px 20px 24px",maxWidth:420,width:"100%",zIndex:10 }}>
          <div style={{ fontSize:11,color:"#16a34a",fontWeight:700,letterSpacing:3,marginBottom:12,textTransform:"uppercase" }}>{likedCount>0?`${likedCount} mekan beğendin`:"Hiçbirini beğenmeseydin de..."}</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:38,color:"#111827",lineHeight:1.05,marginBottom:20,letterSpacing:-1 }}>Bu gece<br/><em style={{ color:"#16a34a" }}>buraya git!</em></h1>
          <div style={{ borderRadius:22,overflow:"hidden",marginBottom:16,position:"relative",height:240,background:"#f0fdf4",boxShadow:"0 8px 40px rgba(0,0,0,0.1)",border:"1px solid #e5e7eb" }}>
            {result.photo ? <img src={result.photo} alt={result.name} style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover" }}/> : <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:72 }}>{result.emoji}</div>}
            <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0) 55%)" }}/>
            <div style={{ position:"absolute",top:14,left:"50%",transform:"translateX(-50%)",background:"#16a34a",color:"white",fontWeight:900,fontSize:11,padding:"5px 18px",borderRadius:20,letterSpacing:2,whiteSpace:"nowrap" }}>✨ EN İYİ SEÇİM</div>
            <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"16px 18px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap" }}>
                {result.rating>0&&<span style={{ color:"#fbbf24",fontWeight:800,fontSize:13 }}>★ {result.rating.toFixed(1)}</span>}
                {result.price&&<span style={{ color:"#4ade80",fontWeight:700,fontSize:13 }}>{result.price}</span>}
                <span style={{ color:result.isOpen?"#4ade80":"#f87171",fontWeight:700,fontSize:11 }}>{result.isOpen?"● AÇIK":"● KAPALI"}</span>
              </div>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:24,color:"white",marginBottom:3 }}>{result.name}</div>
              <div style={{ color:"rgba(255,255,255,0.5)",fontSize:12 }}>📍 {result.address}</div>
            </div>
          </div>
          {likedCards.length>1&&(
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11,color:"#9ca3af",fontWeight:600,letterSpacing:2,marginBottom:10,textTransform:"uppercase" }}>Diğer beğenilerin</div>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {likedCards.slice(1).map(card=>(
                  <div key={card.id} style={{ background:"white",borderRadius:14,border:"1px solid #e5e7eb",display:"flex",alignItems:"center",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div style={{ width:64,height:64,background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0,position:"relative" }}>
                      {card.photo?<img src={card.photo} alt={card.name} style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover" }}/>:card.emoji}
                    </div>
                    <div style={{ padding:"10px 14px",flex:1,textAlign:"left" }}>
                      <div style={{ fontFamily:"'Playfair Display',serif",fontSize:15,color:"#111827",marginBottom:2 }}>{card.name}</div>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        {card.rating>0&&<span style={{ color:getRatingColor(card.rating),fontWeight:700,fontSize:12 }}>★ {card.rating.toFixed(1)}</span>}
                        {card.price&&<span style={{ color:"#16a34a",fontSize:12,fontWeight:600 }}>{card.price}</span>}
                        <span style={{ color:card.isOpen?"#16a34a":"#dc2626",fontSize:11 }}>{card.isOpen?"● Açık":"● Kapalı"}</span>
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