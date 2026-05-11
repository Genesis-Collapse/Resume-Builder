import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ArrowRight, Layout, Zap, Lock, Star, Sparkles, AlertTriangle, Github, Linkedin } from "lucide-react";
import { useAuth } from "./AuthContext";
import "./LandingPage.css";

import zeroLatencyImg from "./assets/zero_latency_editor.png";
import highContrastImg from "./assets/high_contrast_layouts.png";
import localFirstImg from "./assets/local_first_history.png";
import lockOverlayImg from "./assets/lock_overlay.png";

gsap.registerPlugin(ScrollTrigger);

// ─── RIBBON BACKGROUND (from tutorial-15 SVG) ─────────────
function RibbonBackground() {
  return (
    <div className="ribbon-bg">
      <svg viewBox="0 0 1464 2400" preserveAspectRatio="xMidYMid slice">
        <g stroke="none" fill="none">
          <path d="M1032.06931,1199.84648 C878.069306,1099.84648 1242.06931,1145.84648 1242.06931,1347.84648 C1242.06931,1676.84648 716.179769,1785.87669 614.069306,1909.84648 C536.796678,2003.66128 564.04497,2125.69547 640.198709,2182.89911 L640.18908,2182.90158 C634.429189,2124.94003 660.243151,2060.3836 719.261929,2009.16666 C997.899224,1767.36311 1314.69226,1950.97327 1004.42586,2149.13178 C1068.68816,2053.31336 942.673815,2000.63832 822.684061,2115.52009 C767.15066,2168.68942 767.773353,2260.63504 825.410135,2308.67627 C829.696022,2291.38797 840.037191,2273.59887 856.644951,2257.87778 C973.554672,2151.51012 1106.47365,2218.0972 976.293098,2306.7748 C1003.25606,2265.83855 950.383376,2248.06213 900.038469,2299.04626 C871.882909,2328.0621 878.131062,2377.91123 919.418099,2386.96956 C858.985388,2396.45683 826.18496,2368.49299 823.340074,2332.03124 L823.334896,2332.04233 C722.326437,2324.92898 661.859757,2272.5792 644.572274,2207.22872 C494.861462,2184.45937 331.069306,2106.03666 331.069306,1916.84648 C331.069306,1791.84648 578.160162,1668.93056 787.069306,1555.84648 C994.142153,1443.75641 1217.06931,1308.84648 1032.06931,1199.84648 Z" fill="rgba(255,255,255,0.015)" fillRule="evenodd" transform="translate(786.5693, 1768.8535) scale(-1, 1) translate(-786.5693, -1768.8535)"/>
          <path d="M472.069306,0 C472.069306,238.578307 623.760555,498.390562 770.069306,720.976365 C948.773744,992.847121 1125.06931,1203.96053 1037.06931,1229.95968 C1037.06931,1231.95961 1265.06931,1158.96201 1320.06931,1143.9625 C1385.06931,1125.96309 1425.76657,1076.95875 1418.06931,936.969285 C1402.06931,645.978824 1421.06931,298.990199 1311.06931,0 C1089.06931,0 523.069306,0 472.069306,0 Z" fill="rgba(255,255,255,0.02)" fillRule="evenodd"/>
          <path d="M1068.43572,1204.84648 C1336.43572,1562.84648 409.435725,1691.84648 409.435725,1973.84648 C409.435725,2131.43004 598.07085,2223.84648 666.119596,2223.84648" stroke="rgba(255,255,255,0.04)" strokeWidth="6" transform="translate(763.2525, 1714.3465) scale(-1, 1) translate(-763.2525, -1714.3465)"/>
          <path d="M1044.3265,448.074881 C1056.35725,480.660756 1069.19772,514.754165 1084.43915,554.70082 C1090.85428,571.514394 1097.40904,588.621526 1106.10599,611.266656 C1105.61474,609.986344 1123.02057,655.290205 1127.72556,667.555761 C1144.91183,712.359072 1157.17809,744.641945 1168.68951,775.51681 C1198.08685,854.363586 1219.04651,914.955369 1234.28607,966.56549 C1252.00952,1026.5875 1261.51688,1073.21971 1262.45347,1108.04431 C1263.51405,1147.47888 1252.69508,1162.61511 1243.59804,1166.6718 L1225.83682,1172.16286 C1260.22877,1157.85381 1258.36784,1090.49426 1222.77732,969.963822 C1207.63229,918.673842 1186.75375,858.316563 1157.4456,779.709003 C1145.94999,748.876555 1133.69551,716.624674 1116.52158,671.853538 C1111.81909,659.594499 1094.42236,614.314314 1094.90382,615.569136 C1094.94147,615.66724 1094.9827,615.774589 1095.02397,615.882064 C1094.95649,615.706341 1094.91476,615.597675 1094.90382,615.569136 C1086.20396,592.916437 1079.64633,575.80182 1073.22751,558.978561 C1057.97182,518.99455 1045.11677,484.86242 1033.06923,452.231079 C960.977197,256.966291 918.462801,115.037108 902.069306,-1.13686838e-13 L914.069306,-1.13686838e-13 C930.310365,113.967428 972.510986,253.559072 1044.3265,448.074881 Z" fill="rgba(255,255,255,0.02)" fillRule="nonzero"/>
          <path d="M987.069306,1018.77777 C1050.40264,1007.82449 1091.40264,1035.66407 1110.06931,1102.29653 C1093.40264,1180.94042 1069.06931,1223.45707 1037.06931,1229.84648 C989.069306,1239.43061 840.069306,1205.84648 708.069306,1205.84648 C469.069306,1205.84648 320.069306,1269.84648 334.069306,1392.84648 C287.069306,1018.84648 892.069306,1035.20769 987.069306,1018.77777 Z" fill="rgba(255,255,255,0.018)" fillRule="evenodd"/>
        </g>
      </svg>
    </div>
  );
}

// ─── CUSTOM CURSOR (ref-based for instant response) ────────
function CustomCursor() {
  const cursorRef = useRef(null);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    // Use requestAnimationFrame for buttery-smooth cursor tracking
    let mx = 0, my = 0;
    let cx = 0, cy = 0;
    let raf;

    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      // Very high lerp factor = nearly instant, but still silky smooth
      cx = lerp(cx, mx, 0.45);
      cy = lerp(cy, my, 0.45);
      const hovering = isHoveringRef.current;
      const size = hovering ? 48 : 16;
      const offset = size / 2;
      el.style.transform = `translate3d(${cx - offset}px, ${cy - offset}px, 0)`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.backgroundColor = hovering ? 'rgba(255,255,255,0.05)' : '#fff';
      el.style.border = hovering ? '1px solid rgba(255,255,255,0.4)' : 'none';
      el.style.mixBlendMode = hovering ? 'normal' : 'difference';
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    const onOver = (e) => {
      isHoveringRef.current = !!e.target.closest('a, button, .magnetic, .lp-btn-primary, .social-link');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor" />;
}

// ─── MAGNETIC WRAPPER ──────────────────────────────────────
function Magnetic({ children, className="" }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width/2);
    const middleY = clientY - (top + height/2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`magnetic ${className}`}
      style={{ display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
}

// ─── STAGGERED TEXT REVEAL ─────────────────────────────────
const sentence = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.1, staggerChildren: 0.04 }
  }
};
const letter = {
  hidden: { opacity: 0, y: 60, rotateZ: 5 },
  visible: { opacity: 1, y: 0, rotateZ: 0, transition: { type: "spring", damping: 12, stiffness: 100 } }
};

// ─── AUTH ERROR TOAST ──────────────────────────────────────
function AuthErrorToast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="auth-error-toast"
    >
      <div className="auth-error-icon">
        <AlertTriangle size={18} />
      </div>
      <div className="auth-error-body">
        <span className="auth-error-title">Sign-in failed</span>
        <span className="auth-error-msg">{message}</span>
      </div>
      <button className="auth-error-dismiss" onClick={onDismiss}>✕</button>
    </motion.div>
  );
}

// ─── SIGNING IN OVERLAY ────────────────────────────────────
function SigningInOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="signing-in-overlay"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="signing-in-card"
      >
        <motion.div
          className="signing-in-spinner"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </motion.div>
        <span className="signing-in-text">Opening Google Sign-In…</span>
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const featuresContainerRef = useRef(null);
  const panelsRef = useRef([]);
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [authError, setAuthError] = useState(null);
  const [signingIn, setSigningIn] = useState(false);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  // Button snaps out as a whole unit instead of gradually clipping/eclipsing
  const heroCtaOpacity = useTransform(scrollY, [0, 200, 350], [1, 1, 0]);
  const heroCtaScale = useTransform(scrollY, [0, 200, 350], [1, 1, 0.85]);

  // ─── auth-gated navigation ─────────────────────────────
  const handleProtectedNav = async (destination) => {
    // If already logged in, navigate directly
    if (user) {
      navigate(destination);
      return;
    }
    // Otherwise trigger Google sign-in
    setSigningIn(true);
    setAuthError(null);
    try {
      await login();
      // Sign-in succeeded – navigate
      navigate(destination);
    } catch (err) {
      // Map Firebase error codes to friendly messages
      let msg = "Something went wrong. Please try again.";
      if (err.code === "auth/popup-closed-by-user") {
        msg = "The sign-in popup was closed before completing.";
      } else if (err.code === "auth/network-request-failed") {
        msg = "Network error — check your internet connection.";
      } else if (err.code === "auth/cancelled-popup-request") {
        msg = "Multiple popups detected. Please try again.";
      } else if (err.code === "auth/popup-blocked") {
        msg = "Popup was blocked by your browser. Allow popups and retry.";
      }
      setAuthError(msg);
    } finally {
      setSigningIn(false);
    }
  };

  useEffect(() => {
    // Clear any stale ScrollTrigger instances from previous mounts
    ScrollTrigger.getAll().forEach(t => t.kill());
    ScrollTrigger.clearScrollMemory();
    window.scrollTo(0, 0);
    document.body.style.overscrollBehavior = 'none';

    const panels = panelsRef.current.filter(Boolean);
    if (!panels.length || !featuresContainerRef.current) return;

    // Delay to ensure DOM is fully laid out after React Router transition
    let ctx = gsap.context(() => {
      const panels = panelsRef.current.filter(Boolean);
      if (!panels.length) return;

      gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: featuresContainerRef.current,
          pin: true,
          scrub: 1,
          snap: {
            snapTo: 1 / (panels.length - 1),
            duration: { min: 0.1, max: 0.3 },
            ease: "power1.inOut"
          },
          end: () => `+=${featuresContainerRef.current.offsetWidth * (panels.length - 1)}`,
          invalidateOnRefresh: true,
          refreshPriority: 1
        }
      });
    });

    // Frequent refreshes to catch layout shifts
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(true), 100);
    const refreshTimer2 = setTimeout(() => ScrollTrigger.refresh(true), 1000);

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(refreshTimer);
      clearTimeout(refreshTimer2);
      window.removeEventListener('resize', handleResize);
      document.body.style.overscrollBehavior = 'auto';
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="landing-page">
      <CustomCursor />
      <RibbonBackground />
      <div className="noise-overlay"></div>

      {/* AUTH ERROR TOAST */}
      <AnimatePresence>
        {authError && (
          <AuthErrorToast message={authError} onDismiss={() => setAuthError(null)} />
        )}
      </AnimatePresence>

      {/* SIGNING-IN OVERLAY */}
      <AnimatePresence>
        {signingIn && <SigningInOverlay />}
      </AnimatePresence>

      {/* HEADER */}
      <header className="lp-header">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="lp-logo">
          <Magnetic><div className="lp-logo-icon"><Sparkles size={16} /></div></Magnetic>
          <span>Genesis<span className="text-accent">CV</span></span>
        </motion.div>
        
        <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }} className="lp-nav">
          <Magnetic><button onClick={() => handleProtectedNav("/templates")} className="lp-nav-link lp-nav-btn">Features</button></Magnetic>
          <Magnetic><button onClick={() => handleProtectedNav("/templates")} className="lp-nav-link lp-nav-btn">Templates</button></Magnetic>
          <div style={{width: 1, height: 16, background: "rgba(255,255,255,0.2)", margin: "0 10px"}}></div>
          {user ? (
            <Magnetic>
              <div className="lp-user-badge">
                <img src={user.photoURL || ''} alt="" className="lp-user-avatar" />
                <span className="lp-user-name">{user.displayName || 'User'}</span>
              </div>
            </Magnetic>
          ) : (
            <>
              <Magnetic><button onClick={() => handleProtectedNav("/builder")} className="lp-nav-link lp-nav-btn" style={{fontWeight: 600}}>Log in</button></Magnetic>
              <Magnetic>
                <button onClick={() => handleProtectedNav("/templates")} className="lp-btn-primary lp-btn-sm">
                  Sign Up <ArrowRight size={14} />
                </button>
              </Magnetic>
            </>
          )}
        </motion.nav>
      </header>

      {/* HERO SECTION */}
      <section className="lp-hero">
        <motion.div style={{ y: heroY }} className="lp-hero-content">
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "backOut" }} className="lp-badge">
             Creative Freedom v2.0
          </motion.div>
          
          <motion.h1 className="lp-title" variants={sentence} initial="hidden" animate="visible">
            {"Design your".split("").map((char, index) => (
              <motion.span key={char + "-" + index} variants={letter} style={{display: "inline-block"}}>{char === " " ? "\u00A0" : char}</motion.span>
            ))}
            <br />
            {"next chapter.".split("").map((char, index) => (
              <motion.span key={char + "-" + index} variants={letter} style={{display: "inline-block"}}>{char === " " ? "\u00A0" : char}</motion.span>
            ))}
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="lp-subtitle">
            A brutalist, real-time resume editor. Stand out with typographic excellence.
          </motion.p>
          
          {/* Social Links */}
          <motion.div style={{ opacity: heroCtaOpacity, scale: heroCtaScale }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="lp-social-links">
              <Magnetic>
                <a href="https://github.com/Genesis-Collapse" target="_blank" rel="noopener noreferrer" className="social-link">
                  <Github size={20} />
                  <span>Genesis-Collapse</span>
                </a>
              </Magnetic>
              <Magnetic>
                <a href="https://github.com/utkarshanand541-maker" target="_blank" rel="noopener noreferrer" className="social-link">
                  <Github size={20} />
                  <span>utkarshanand541</span>
                </a>
              </Magnetic>
              <Magnetic>
                <a href="https://www.linkedin.com/in/utkarsh-anand1801-/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <Linkedin size={20} />
                  <span>Utkarsh Anand</span>
                </a>
              </Magnetic>
              <Magnetic>
                <a href="https://www.linkedin.com/in/apramay-gupta/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <Linkedin size={20} />
                  <span>Apramay Gupta</span>
                </a>
              </Magnetic>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* GSAP SNAP SCROLL FEATURES */}
      <section className="lp-features-wrapper" ref={featuresContainerRef}>
        <div className="lp-features-track">
          
          <div className="lp-feature-panel" ref={el => panelsRef.current[0] = el}>
            <div className="panel-content">
              <h2 className="brutalist-heading">Zero<br/>Latency</h2>
              <p>Type and see. No buffering, no loading spinners. Just pure, unadulterated performance.</p>
            </div>
            <div className="panel-visual type-1">
              <motion.div
                className="feature-img-wrapper"
                initial={{ opacity: 0, y: 40, rotateX: 8 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              >
                <img src={zeroLatencyImg} alt="Editor view" className="feature-img" />
                <div className="feature-img-glow" />
              </motion.div>
            </div>
          </div>

          <div className="lp-feature-panel" ref={el => panelsRef.current[1] = el}>
            <div className="panel-content">
              <h2 className="brutalist-heading">High<br/>Contrast</h2>
              <p>Stop blending in. Use templates that command attention through sophisticated spacing and aggressive typography.</p>
            </div>
            <div className="panel-visual type-2">
              <motion.div
                className="feature-img-wrapper"
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              >
                <img src={highContrastImg} alt="Layout selection" className="feature-img" />
                <div className="feature-img-glow" />
              </motion.div>
            </div>
          </div>

          <div className="lp-feature-panel" ref={el => panelsRef.current[2] = el}>
            <div className="panel-content">
              <h2 className="brutalist-heading">Local<br/>First</h2>
              <p>Your data stays on your machine. We don't want it, and we can't see it. Export to PDF securely.</p>
            </div>
            <div className="panel-visual type-3">
              <motion.div
                className="feature-img-wrapper local-first-composite"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                {/* History tab behind frosted glass */}
                <img src={localFirstImg} alt="History tab" className="feature-img local-first-history" />
                <div className="frosted-glass-overlay" />
                {/* Lock icon prominent in foreground */}
                <motion.img
                  src={lockOverlayImg}
                  alt="Security lock"
                  className="lock-icon-overlay"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "backOut" }}
                />
                <div className="feature-img-glow" />
              </motion.div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="lp-footer">
        <div className="lp-footer-content">
          <motion.h2 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lp-footer-title"
          >
            Leave an <br/> <span className="text-gradient">Impression</span>.
          </motion.h2>
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="mt-8"
          >
            <Magnetic>
              <button onClick={() => handleProtectedNav("/templates")} className="lp-btn-primary lp-btn-xl">
                Open Builder
              </button>
            </Magnetic>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
