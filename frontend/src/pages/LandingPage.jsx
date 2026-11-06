import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, ChevronLeft, ChevronRight, ExternalLink, PhoneCall, Phone, Map } from "lucide-react";

const SLIDES = [
  { image: "/images/coxsbazar.jpg", loc: "Cox's Bazar, Bangladesh", name: "Sunrise at the Golden Shore" },
  { image: "/images/sundarbans-mangrove.jpg", loc: "Sundarbans, Khulna", name: "Mystical Mangrove Waters" },
  { image: "/images/sajek2.jpg", loc: "Sajek Valley, Rangamati", name: "Sea of Clouds at Sajek" },
  { image: "/images/panam_nagar.jpg", loc: "Sonargaon, Narayanganj", name: "Panam Nagar Heritage City" },
  { image: "/images/sylhet.jpeg", loc: "Sylhet, Bangladesh", name: "Emerald Waters from Above" },
  { image: "/images/coxs-bazar-beach.jpg", loc: "Cox's Bazar", name: "Colorful Sampan Fishing Boats" },
  { image: "/images/bandarban.jpg", loc: "Bandarban Hill Tracts", name: "Green Hills Under Blue Skies" },
];

const DESTINATIONS = [
  { img: "/images/sundarban.jpg", tag: "UNESCO World Heritage · Khulna", name: "Sundarbans", desc: "World's largest mangrove forest, home to Royal Bengal Tigers and spotted deer.", link: "https://en.wikipedia.org/wiki/Sundarbans" },
  { img: "/images/coxsbazar.jpg", tag: "World's Longest Sea Beach · Chittagong", name: "Cox's Bazar", desc: "120km unbroken golden shoreline with colorful sampan boats and ocean waves.", link: "https://en.wikipedia.org/wiki/Cox%27s_Bazar" },
  { img: "/images/bandarban.jpg", tag: "Hill Tracts · Chittagong Division", name: "Bandarban", desc: "Nilgiri peaks, lush green mountain ranges, and vibrant indigenous culture.", link: "https://en.wikipedia.org/wiki/Bandarban_District" },
  { img: "/images/panam_nagar.jpg", tag: "Heritage City · Sonargaon, Narayanganj", name: "Panam Nagar", desc: "Ancient merchant city of the Mughal era — listed among the 100 most endangered heritage sites.", link: "https://en.wikipedia.org/wiki/Panam_City" },
  { img: "/images/ahsan_manzil.jpg", tag: "Pink Palace Museum · Old Dhaka", name: "Ahsan Manzil", desc: "The iconic Pink Palace — former residence of the Nawabs of Dhaka, now a national museum.", link: "https://en.wikipedia.org/wiki/Ahsan_Manzil" },
  { img: "/images/sajek.jpg", tag: "Cloud Village · Rangamati Hill Tracts", name: "Sajek Valley", desc: "The \"roof of Bangladesh\" — walk above the clouds at 1,800 ft with panoramic hill views.", link: "https://en.wikipedia.org/wiki/Sajek_Valley" },
];

const INTERVAL = 5500;

export default function LandingPage() {
  const [current, setCurrent] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
      setProgressKey((k) => k + 1);
    }, INTERVAL);
    return () => clearTimeout(timerRef.current);
  }, [current]);

  function goTo(i) {
    setCurrent(i);
    setProgressKey((k) => k + 1);
  }
  function changeSlide(dir) {
    goTo((current + dir + SLIDES.length) % SLIDES.length);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") changeSlide(-1);
      if (e.key === "ArrowRight") changeSlide(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current]);

  const slide = SLIDES[current];

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", overflowX: "hidden", background: "#070d18" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes fadeUp { to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .hero-eyebrow, .hero-title, .hero-sub, .hero-btns, #scrollHint { opacity:0; animation: fadeUp 0.9s forwards; }
        .hero-eyebrow{animation-delay:.4s} .hero-title{animation-delay:.6s} .hero-sub{animation-delay:.8s} .hero-btns{animation-delay:1s} #scrollHint{animation-delay:1.6s}
        .dot { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,0.38); cursor:pointer; transition:all 0.35s; border:none; }
        .dot.on { width:30px; border-radius:4px; background:#fff; }
        .arrow { position:absolute; top:50%; transform:translateY(-50%); z-index:20; width:48px; height:48px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.35); background:rgba(0,0,0,0.22); backdrop-filter:blur(8px); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.3s; }
        .arrow:hover { background:#059669; border-color:#059669; }
        .nav-links a { color:rgba(255,255,255,0.78); text-decoration:none; font-size:0.82rem; font-weight:500; letter-spacing:0.3px; padding: 8px 16px; border-radius: 8px; transition: all 0.25s ease; }
        .nav-links a:hover { color:#fff; background: rgba(255,255,255,0.08); }
        .btn-white { padding:13px 36px; background:#fff; color:#064e3b; font-size:0.7rem; font-weight:700; letter-spacing:1.8px; text-transform:uppercase; border:none; border-radius:50px; text-decoration:none; cursor:pointer; box-shadow:0 6px 28px rgba(0,0,0,0.35); transition:all 0.3s; display:inline-block; }
        .btn-white:hover { background:#a7f3d0; transform:translateY(-2px); }
        .btn-ghost { padding:13px 36px; background:transparent; color:#fff; font-size:0.7rem; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; border:1.5px solid rgba(255,255,255,0.5); border-radius:50px; text-decoration:none; cursor:pointer; transition:all 0.3s; display:inline-block; }
        .btn-ghost:hover { background:rgba(255,255,255,0.14); border-color:#fff; }
        .dest-card { border-radius:18px; overflow:hidden; position:relative; height:400px; text-decoration:none; display:block; box-shadow:0 8px 32px rgba(0,0,0,0.14); transition:transform 0.4s ease, box-shadow 0.4s ease; }
        .dest-card:hover { transform:translateY(-8px); box-shadow:0 22px 60px rgba(0,0,0,0.25); }
        .dest-card img { width:100%; height:100%; object-fit:cover; transition:transform 0.6s ease; display:block; }
        .dest-card:hover img { transform:scale(1.06); }
        .dest-wiki { opacity:0; transition:opacity 0.3s; }
        .dest-card:hover .dest-wiki { opacity:1; }
        @media (max-width:900px) { .nav-links { display:none; } .dest-grid { grid-template-columns:1fr !important; } }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: scrolled ? "13px 52px" : "22px 52px",
        background: scrolled ? "rgba(3,40,22,0.97)" : "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        transition: "all 0.4s ease",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,#064e3b,#0d9488)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Compass size={20} color="#6ee7b7" />
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>Explore<span style={{ color: "#6ee7b7" }}>BD</span></span>
        </Link>
        <ul className="nav-links" style={{ display: "flex", alignItems: "center", gap: 8, listStyle: "none" }}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/login">My Profile</Link></li>
          <li><Link to="/register">Register</Link></li>
          <li><Link to="/login" style={{ padding: "9px 22px", border: "1.5px solid rgba(110,231,183,0.5)", borderRadius: 50, background: "rgba(5,150,105,0.18)", color: "#a7f3d0", fontWeight: 600 }}>Sign In</Link></li>
        </ul>
      </nav>

      {/* HERO SLIDER */}
      <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url('${slide.image}')`,
          backgroundSize: "cover", backgroundPosition: "center 40%",
          transition: "opacity 1.4s ease-in-out",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.38) 45%, rgba(0,0,0,0.7) 100%)" }} />

        <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <p className="hero-eyebrow" style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", color: "#6ee7b7", marginBottom: 18 }}>
            Discover Bangladesh with Verified Local Guides
          </p>
          <h1 className="hero-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(3.2rem,7.5vw,6.5rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 20, filter: "drop-shadow(0 3px 18px rgba(0,0,0,0.55))" }}>
            Explore<br /><em style={{ fontStyle: "italic", color: "#a7f3d0" }}>Beautiful Bangladesh</em>
          </h1>
          <p className="hero-sub" style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.8)", maxWidth: 460, lineHeight: 1.78, marginBottom: 38, textShadow: "0 1px 10px rgba(0,0,0,0.6)" }}>
            Connect with expert student guides for authentic, safe, and unforgettable journeys across Bangladesh's most breathtaking destinations.
          </p>
          <div className="hero-btns" style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Link to="/login" className="btn-white">Find a Guide</Link>
            <Link to="/register" className="btn-ghost">Get Started</Link>
          </div>
        </div>

        <button className="arrow" style={{ left: 28 }} onClick={() => changeSlide(-1)}><ChevronLeft size={20} /></button>
        <button className="arrow" style={{ right: 28 }} onClick={() => changeSlide(1)}><ChevronRight size={20} /></button>

        <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", zIndex: 20, display: "flex", gap: 8 }}>
          {SLIDES.map((_, i) => (
            <button key={i} className={`dot ${i === current ? "on" : ""}`} onClick={() => goTo(i)} />
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 36, right: 48, zIndex: 20, textAlign: "right" }}>
          <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#6ee7b7", marginBottom: 4 }}>{slide.loc}</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.25rem", color: "#fff" }}>{slide.name}</div>
        </div>

        <div key={progressKey} style={{
          position: "absolute", bottom: 0, left: 0, height: 3,
          background: "linear-gradient(to right,#059669,#6ee7b7)", zIndex: 30,
          animation: `growProgress ${INTERVAL}ms linear forwards`,
        }} />
        <style>{`@keyframes growProgress { from { width: 0% } to { width: 100% } }`}</style>
      </div>

      {/* DESTINATIONS */}
      <section style={{ background: "#f0fdf4", padding: "90px 48px" }}>
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "#059669", marginBottom: 10, textAlign: "center" }}>Iconic Destinations</p>
        <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 700, textAlign: "center", color: "#0f172a", marginBottom: 56 }}>
          Top Places to <em style={{ fontStyle: "italic", color: "#059669", fontWeight: 400 }}>Explore</em> in Bangladesh
        </h2>
        <div className="dest-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, maxWidth: 1100, margin: "0 auto" }}>
          {DESTINATIONS.map((d) => (
            <a key={d.name} className="dest-card" href={d.link} target="_blank" rel="noopener noreferrer">
              <img src={d.img} alt={d.name} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)" }} />
              <div style={{ position: "absolute", bottom: 22, left: 22, right: 22 }}>
                <div style={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#6ee7b7", marginBottom: 5 }}>{d.tag}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.75rem", color: "#fff", fontWeight: 700, lineHeight: 1.15 }}>{d.name}</div>
                <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.72)", marginTop: 6, lineHeight: 1.65 }}>{d.desc}</div>
                <div className="dest-wiki" style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.65rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#6ee7b7" }}>
                  <ExternalLink size={11} /> Wikipedia
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#060d18", color: "#64748b", padding: "64px 52px 28px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, maxWidth: 1100, margin: "0 auto 48px" }}>
          <div>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#064e3b,#0d9488)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Compass size={16} color="#6ee7b7" />
              </div>
              <span style={{ fontWeight: 900, fontSize: "1rem", color: "#fff" }}>Explore<span style={{ color: "#6ee7b7" }}>BD</span></span>
            </Link>
            <p style={{ fontSize: "0.8rem", lineHeight: 1.85, marginTop: 14 }}>Smart Tourist Guide &amp; Booking Platform for Bangladesh.<br />CSE471 Group 10 — Summer 2026.</p>
          </div>
          <div>
            <h4 style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#fff", marginBottom: 18 }}>🚨 Emergency</h4>
            <div style={{ fontSize: "0.8rem", marginBottom: 9, display: "flex", alignItems: "center", gap: 8 }}><PhoneCall size={13} color="#f87171" /> Tourist Police: <strong style={{ color: "#e2e8f0" }}>999</strong></div>
            <div style={{ fontSize: "0.8rem", marginBottom: 9, display: "flex", alignItems: "center", gap: 8 }}><Phone size={13} color="#f87171" /> <strong style={{ color: "#e2e8f0" }}>+880 1320-000000</strong></div>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" style={{ color: "#6ee7b7", fontSize: "0.8rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 7, marginTop: 12 }}><Map size={13} /> Google Maps Locator</a>
          </div>
          <div>
            <h4 style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#fff", marginBottom: 18 }}>Important Links</h4>
            <ul style={{ listStyle: "none" }}>
              <li style={{ marginBottom: 10 }}><Link to="/" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.8rem" }}>Home</Link></li>
              <li style={{ marginBottom: 10 }}><Link to="/login" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.8rem" }}>My Profile</Link></li>
              <li style={{ marginBottom: 10 }}><Link to="/register" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.8rem" }}>Register</Link></li>
              <li style={{ marginBottom: 10 }}><Link to="/login" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.8rem" }}>Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#fff", marginBottom: 18 }}>Top Destinations</h4>
            <ul style={{ listStyle: "none" }}>
              {DESTINATIONS.map((d) => (
                <li key={d.name} style={{ marginBottom: 10 }}><a href={d.link} target="_blank" rel="noreferrer" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.8rem" }}>{d.name}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto", paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", fontSize: "0.73rem" }}>
          &copy; 2026 ExploreBD. All rights reserved.
        </div>
      </footer>
    </div>
  );
}