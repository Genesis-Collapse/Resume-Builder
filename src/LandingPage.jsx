import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ArrowRight, Layout, Zap, Lock, Star, Sparkles, AlertTriangle } from "lucide-react";
import { useAuth } from "./AuthContext";
import "./LandingPage.css";

gsap.registerPlugin(ScrollTrigger);

// ─── CUSTOM CURSOR ─────────────────────────────────────────
function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = e => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    const handleMouseOver = e => {
      // Check if hovering over interactive elements
      if(e.target.closest('a, button, .magnetic, .lp-btn-primary')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };
    
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="custom-cursor"
      animate={{
        x: mousePosition.x - (isHovering ? 24 : 8),
        y: mousePosition.y - (isHovering ? 24 : 8),
        width: isHovering ? 48 : 16,
        height: isHovering ? 48 : 16,
        backgroundColor: isHovering ? "rgba(255,255,255,0.05)" : "#fff",
        border: isHovering ? "1px solid rgba(255,255,255,0.4)" : "none",
        mixBlendMode: isHovering ? "normal" : "difference"
      }}
      transition={{ type: "spring", stiffness: 800, damping: 35, mass: 0.1 }}
    />
  );
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
          
          {/* CTA button snaps out as a whole unit instead of partially clipping */}
          <motion.div style={{ opacity: heroCtaOpacity, scale: heroCtaScale }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="lp-cta-group">
              <Magnetic>
                <button onClick={() => handleProtectedNav("/builder")} className="lp-btn-primary lp-btn-lg group">
                  Begin Crafting <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </button>
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
            <div className="panel-visual type-1" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 480, height: 320, borderRadius: 12, background: '#111', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex' }}>
                {/* Mini sidebar */}
                <div style={{ width: 50, background: '#18181B', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: '#FAFAFA' }} />
                  {[1,2,3,4].map(i => <div key={i} style={{ width: 20, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />)}
                </div>
                {/* Mini editor */}
                <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ height: 4, width: '60%', borderRadius: 2, background: 'rgba(255,255,255,0.1)' }} />
                  <div style={{ height: 4, width: '90%', borderRadius: 2, background: 'rgba(255,255,255,0.06)' }} />
                  <div style={{ height: 4, width: '75%', borderRadius: 2, background: 'rgba(255,255,255,0.06)' }} />
                  <div style={{ height: 20, width: '100%', borderRadius: 4, background: 'rgba(255,255,255,0.03)', marginTop: 4 }} />
                  <div style={{ height: 20, width: '100%', borderRadius: 4, background: 'rgba(255,255,255,0.03)' }} />
                  <div style={{ height: 20, width: '100%', borderRadius: 4, background: 'rgba(255,255,255,0.03)' }} />
                </div>
                {/* Mini preview */}
                <div style={{ width: 180, background: '#FFF', margin: 10, borderRadius: 6, padding: 12 }}>
                  <div style={{ height: 6, width: '70%', borderRadius: 2, background: '#222', marginBottom: 4 }} />
                  <div style={{ height: 3, width: '50%', borderRadius: 2, background: '#3B82F6', marginBottom: 8 }} />
                  <div style={{ height: 2, width: '100%', borderRadius: 1, background: '#E5E7EB', marginBottom: 3 }} />
                  <div style={{ height: 2, width: '85%', borderRadius: 1, background: '#E5E7EB', marginBottom: 3 }} />
                  <div style={{ height: 2, width: '92%', borderRadius: 1, background: '#E5E7EB', marginBottom: 8 }} />
                  <div style={{ height: 4, width: '40%', borderRadius: 2, background: '#222', marginBottom: 3 }} />
                  <div style={{ height: 2, width: '100%', borderRadius: 1, background: '#E5E7EB', marginBottom: 3 }} />
                  <div style={{ height: 2, width: '70%', borderRadius: 1, background: '#E5E7EB' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="lp-feature-panel" ref={el => panelsRef.current[1] = el}>
            <div className="panel-content">
              <h2 className="brutalist-heading">High<br/>Contrast</h2>
              <p>Stop blending in. Use templates that command attention through sophisticated spacing and aggressive typography.</p>
            </div>
            <div className="panel-visual type-2">
               <div className="template-cards">
                  <div className="tc tc-1"></div>
                  <div className="tc tc-2"></div>
               </div>
            </div>
          </div>

          <div className="lp-feature-panel" ref={el => panelsRef.current[2] = el}>
            <div className="panel-content">
              <h2 className="brutalist-heading">Local<br/>First</h2>
              <p>Your data stays on your machine. We don't want it, and we can't see it. Export to PDF securely.</p>
            </div>
            <div className="panel-visual type-3">
               <div className="shield-ring">
                 <Lock size={80} className="shield-icon" strokeWidth={1} />
               </div>
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
