import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TEMPLATES, THUMBNAIL_DATA } from './Templates';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

function ThumbCard({ id, Tmpl, name, desc, onSelect, delay }) {
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(0.35);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const updateScale = () => {
      const w = wrapperRef.current.offsetWidth;
      if (w > 0) setScale(w / 794);
    };
    const obs = new ResizeObserver(updateScale);
    obs.observe(wrapperRef.current);
    updateScale();
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div ref={wrapperRef} className="thumb-wrapper" onClick={() => onSelect(id)} style={{ cursor: "pointer" }}>
        <div className="thumb-scale" style={{ transform: `scale(${scale})` }}>
          <Tmpl data={THUMBNAIL_DATA} />
        </div>
        {/* Hover Overlay */}
        <div className="overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.0)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
          <div className="select-btn" style={{ background: "#3B82F6", color: "#FFF", padding: "10px 20px", borderRadius: 40, fontSize: 14, fontWeight: 600, opacity: 0, transform: "translateY(10px)", transition: "all 0.2s" }}>Use Template</div>
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{name}</h3>
        <p style={{ fontSize: 14, color: "#A1A1AA" }}>{desc}</p>
      </div>
    </motion.div>
  );
}

const PICKER_CSS = `
  .picker-bg {
    background: #09090B;
    color: #FAFAFA;
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
  }
  .thumb-wrapper {
    width: 100%;
    aspect-ratio: 1 / 1.414; /* A4 Ratio */
    background: #FFF;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255,255,255,0.1);
    transition: all 0.3s ease;
  }
  .thumb-wrapper:hover {
    border-color: #3B82F6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
    transform: translateY(-4px);
  }
  .thumb-wrapper:hover .overlay {
    background: rgba(0,0,0,0.5);
  }
  .thumb-wrapper:hover .select-btn {
    opacity: 1;
    transform: translateY(0);
  }
  .thumb-scale {
    width: 794px;
    height: 1122px;
    transform-origin: top left;
    pointer-events: none;
    transition: transform 0.2s ease-out;
  }
  .thumb-wrapper {
    container-type: inline-size;
  }
`;

export default function TemplatePicker() {
  const navigate = useNavigate();

  const handleSelect = (id) => {
    // In a real app we might pass state or use a store, 
    // for now we'll route and append query param
    navigate(`/builder?template=${id}`);
  };

  const templates = [
    { id: 'modern', name: 'Modern', desc: 'Clean lines, high contrast. Great for tech.' },
    { id: 'minimal', name: 'Minimal', desc: 'Whitespace-heavy. Focus on content.' },
    { id: 'executive', name: 'Executive', desc: 'Traditional and dense. For senior roles.' },
    { id: 'professional', name: 'Professional', desc: 'Two-column sidebar with photo. Like Canva.' },
    { id: 'bold', name: 'Bold', desc: 'Colored header band. ATS-friendly single column.' },
    { id: 'avatar', name: 'Avatar', desc: 'Prominent profile photo. Great for creatives.' },
    { id: 'split', name: 'Split', desc: '50/50 layout with strong visual contrast.' }
  ];

  return (
    <div className="picker-bg" style={{ padding: "60px 5vw" }}>
      <style>{PICKER_CSS}</style>
      
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        <button onClick={() => navigate('/')} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: "#A1A1AA", cursor: "pointer", marginBottom: 40, fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div style={{ marginBottom: 60 }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 12 }}>Select Your Layout</h1>
          <p style={{ fontSize: 16, color: "#A1A1AA", maxWidth: 600 }}>Choose a foundation for your professional narrative. You can customize colors, typography, and structure later in the editor.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40 }}>
          {templates.map((t, i) => (
            <ThumbCard key={t.id} id={t.id} Tmpl={TEMPLATES[t.id]} name={t.name} desc={t.desc} onSelect={handleSelect} delay={i * 0.1} />
          ))}
        </div>

      </div>
    </div>
  );
}
