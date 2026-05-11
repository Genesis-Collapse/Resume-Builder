import React, { createContext, useContext, useReducer, useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { TEMPLATES } from './Templates';
import { SuggestionsPanel, analyzeResume } from './ResumeAnalyzer';
import { 
  LayoutDashboard, FileText, History, BarChart3, Activity, 
  Settings, HelpCircle, Download, Share2, Info,
  Plus, Trash2, X, GripVertical, FileUp, Layers, Check,
  AlignLeft, AlignCenter, AlignRight, Sparkles, ChevronDown, GraduationCap,
  ImagePlus, Type, Minus, Code, Crop, Users, ZoomIn, ZoomOut, Move, RotateCcw,
  AlertTriangle
} from 'lucide-react';
import PipelineDashboard from './PipelineDashboard';
import ActivityTracker from './ActivityTracker';
import { logActivity } from './activityLogger';
import html2pdf from 'html2pdf.js';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, signInWithGoogle, signOutUser, onAuthChange } from './firebase';
import { useAuth } from './AuthContext';
// ══════════════════════════════════════════════════════════════
//  DATA CONTEXT + REDUCER
// ══════════════════════════════════════════════════════════════

const DEFAULT = {
  personal: {
    name:"Alexandra Mercer", title:"Senior Product Designer",
    email:"alex@mercer.design", phone:"+1 (415) 555-0192",
    location:"San Francisco, CA", linkedin:"linkedin.com/in/alexmercer",
    website:"mercer.design",
    summary:"Passionate product designer with 7+ years turning complex problems into elegant, human-centered interfaces.",
    photo: null,
  },
  education:[{id:"e1",institution:"Stanford University",degree:"B.S. Design Engineering",year:"2017",gpa:"3.9"}],
  experience:[
    {id:"x1",company:"Stripe",role:"Senior Product Designer",duration:"Jan 2021 – Present",location:"San Francisco, CA",
      bullets:["Led end-to-end redesign of the Stripe Dashboard, cutting task completion time by 34%.","Established the company-wide Sail design system."]},
  ],
  skills:{ design:["Figma","Sketch","Framer"], technical:["HTML/CSS","React","Git"], soft:["Systems Thinking","Stakeholder Management"] },
  projects: [],
  references: [],
  customSections: [],
  settings: {
    templateId: 'modern', formatId: 'chronological', accentColor: '#3B82F6', headerAlignment: 'left',
    fontSize: 12, pageCount: 1, sectionSpacing: 16, pagePadding: 36, fontFamily: 'Inter',
    lineHeight: 1.5, wordSpacing: 0, letterSpacing: 0
  }
};

function reducer(state, action) {
  switch(action.type) {
    case"SET_PERSONAL": return{...state,personal:{...state.personal,[action.field]:action.value}};
    case"SET_EDU": return{...state,education:state.education.map(e=>e.id===action.id?{...e,[action.field]:action.value}:e)};
    case"ADD_EDU": return{...state,education:[...state.education,{id:`e${Date.now()}`,institution:"",degree:"",year:"",gpa:""}]};
    case"DEL_EDU": return{...state,education:state.education.filter(e=>e.id!==action.id)};
    case"SET_EXP": return{...state,experience:state.experience.map(e=>e.id===action.id?{...e,[action.field]:action.value}:e)};
    case"SET_BULLET": return{...state,experience:state.experience.map(e=>{
      if(e.id!==action.id)return e;
      const b=[...e.bullets]; b[action.idx]=action.value; return{...e,bullets:b};
    })};
    case"ADD_BULLET": return{...state,experience:state.experience.map(e=>e.id===action.id?{...e,bullets:[...e.bullets,""]}:e)};
    case"DEL_BULLET": return{...state,experience:state.experience.map(e=>e.id!==action.id?e:{...e,bullets:e.bullets.filter((_,i)=>i!==action.idx)})};
    case"ADD_EXP": return{...state,experience:[...state.experience,{id:`x${Date.now()}`,company:"",role:"",duration:"",location:"",bullets:[""]}]};
    case"DEL_EXP": return{...state,experience:state.experience.filter(e=>e.id!==action.id)};
    case"SET_SKILLS": return{...state,skills:{...state.skills,[action.cat]:action.value}};
    case"SET_PROJ": return{...state,projects:state.projects.map(p=>p.id===action.id?{...p,[action.field]:action.value}:p)};
    case"SET_PROJ_BULLET": return{...state,projects:state.projects.map(p=>{
      if(p.id!==action.id)return p;
      const b=[...p.bullets]; b[action.idx]=action.value; return{...p,bullets:b};
    })};
    case"ADD_PROJ_BULLET": return{...state,projects:state.projects.map(p=>p.id===action.id?{...p,bullets:[...p.bullets,""]}:p)};
    case"DEL_PROJ_BULLET": return{...state,projects:state.projects.map(p=>p.id!==action.id?p:{...p,bullets:p.bullets.filter((_,i)=>i!==action.idx)})};
    case"ADD_PROJ": return{...state,projects:[...state.projects,{id:`p${Date.now()}`,title:"",linkText:"",linkUrl:"",bullets:[""]}]};
    case"DEL_PROJ": return{...state,projects:state.projects.filter(p=>p.id!==action.id)};
    case"SET_REF": return{...state,references:(state.references||[]).map(r=>r.id===action.id?{...r,[action.field]:action.value}:r)};
    case"ADD_REF": return{...state,references:[...(state.references||[]),{id:`r${Date.now()}`,name:"",title:"",company:"",email:"",phone:"",relationship:""}]};
    case"DEL_REF": return{...state,references:(state.references||[]).filter(r=>r.id!==action.id)};
    case"ADD_CUSTOM": return{...state, customSections:[...state.customSections, {id:`c${Date.now()}`, title:"", content:""}]};
    case"DEL_CUSTOM": return{...state, customSections:state.customSections.filter(c=>c.id!==action.id)};
    case"SET_CUSTOM": return{...state, customSections:state.customSections.map(c=>c.id===action.id?{...c,[action.field]:action.value}:c)};
    case"SET_SETTING": return{...state, settings:{...state.settings, [action.field]:action.value}};
    case"SET_PHOTO": return{...state, personal:{...state.personal, photo: action.value}};
    case"SET_PHOTO_CROP": return{...state, personal:{...state.personal, photoCrop: action.value}};
    case"IMPORT_MOCK_DATA": return { ...DEFAULT, personal: { ...DEFAULT.personal, name: "Imported User", summary: "Data extracted from uploaded document..." }};
    case"INIT_TEMPLATE": return { ...state, settings: { ...state.settings, templateId: action.value } };
    case"LOAD_RESUME": return action.data;
    case"SET_RESUME_META": return { ...state, id: action.id !== undefined ? action.id : state.id, title: action.title !== undefined ? action.title : state.title };
    default: return state;
  }
}

const Ctx = createContext(null);
const useData = () => useContext(Ctx);

const getInitialState = () => {
  try {
    const saved = localStorage.getItem('resume-builder-data');
    if (saved) return JSON.parse(saved);
  } catch(e) { console.error(e); }
  return DEFAULT;
};

function DataProvider({children}) {
  const [data,dispatch] = useReducer(reducer, getInitialState());
  
  useEffect(() => {
    localStorage.setItem('resume-builder-data', JSON.stringify(data));
  }, [data]);

  return <Ctx.Provider value={{data,dispatch}}>{children}</Ctx.Provider>;
}

// ══════════════════════════════════════════════════════════════
//  CLEAN DARK MODE CSS (Linear/Vercel style)
// ══════════════════════════════════════════════════════════════
const THEME_CSS = `
  :root {
    --bg-app: #09090B;
    --bg-sidebar: #18181B;
    --bg-panel: #18181B;
    --bg-input: rgba(255,255,255,0.03);
    --bg-input-hover: rgba(255,255,255,0.06);
    --bg-input-focus: rgba(255,255,255,0.05);
    
    --text-main: #FAFAFA;
    --text-muted: #A1A1AA;
    --text-faint: #52525B;
    
    --border-color: rgba(255,255,255,0.1);
    --accent: #FAFAFA;
    --accent-hover: #E4E4E7;
    --accent-bg: rgba(255, 255, 255, 0.08);
  }

  .dashboard-shell {
    font-family: 'Inter', sans-serif;
    color: var(--text-main);
    background: var(--bg-app);
  }

  /* Sleek Minimal Inputs */
  .sleek-input, .sleek-textarea {
    width: 100%;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    border-radius: 6px;
    padding: 10px 14px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2) inset;
    box-sizing: border-box;
  }
  .sleek-input::placeholder, .sleek-textarea::placeholder { color: var(--text-faint); }
  .sleek-input:hover, .sleek-textarea:hover { 
    background: var(--bg-input-hover); 
  }
  .sleek-input:focus, .sleek-textarea:focus { 
    background: var(--bg-input-focus); 
    border-color: rgba(255,255,255,0.3);
    box-shadow: 0 0 0 3px rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.2) inset;
  }
  .sleek-input.long-content {
    overflow-x: auto;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .sleek-textarea {
    min-height: 80px;
  }
  
  /* Animations */
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
  
  /* Scrollbars */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }

  /* Tooltip logic */
  .tooltip-wrap { position: relative; display: inline-flex; }
  .tooltip-content {
    visibility: hidden; opacity: 0;
    position: absolute; bottom: 100%; left: 50%; transform: translate(-50%, -8px);
    background: #27272A; color: #fff; padding: 10px 14px; border-radius: 6px;
    font-size: 12px; width: max-content; max-width: 260px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
    transition: all 0.2s ease; z-index: 1000;
    border: 1px solid rgba(255,255,255,0.1);
    line-height: 1.5;
  }
  .tooltip-wrap:hover .tooltip-content { visibility: visible; opacity: 1; transform: translate(-50%, -12px); }

  /* Quill Editor Styles */
  .quill { background: var(--bg-input); border-radius: 6px; overflow: hidden; border: 1px solid var(--border-color); }
  .ql-toolbar { border-bottom: 1px solid var(--border-color) !important; border-top: none !important; border-left: none !important; border-right: none !important; }
  .ql-container { border: none !important; color: var(--text-main); font-family: inherit; font-size: 14px; min-height: 120px; }
  .ql-stroke { stroke: var(--text-muted) !important; }
  .ql-fill { fill: var(--text-muted) !important; }
  .ql-picker-label { color: var(--text-muted) !important; }
  .rich-text-content p { margin: 0 0 4px 0; }
  .rich-text-content ul { margin: 0 0 4px 0; padding-left: 18px; }
  .rich-text-content li { margin-bottom: 2px; }

  @media print {
    .no-print { display: none !important; }
    body { background: white; }
  }
`;

// ══════════════════════════════════════════════════════════════
//  UI PRIMITIVES
// ══════════════════════════════════════════════════════════════

const SleekField = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>{label}</label>}
    {children}
  </div>
);

const Row = ({ children }) => <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>{children}</div>;

const ActionBtn = ({ icon: Icon, label, onClick, variant = "ghost", size="md" }) => {
  const styles = {
    primary: { bg: "var(--accent)", color: "#09090B", border: "none" },
    secondary: { bg: "var(--bg-input)", color: "var(--text-main)", border: "1px solid var(--border-color)" },
    ghost: { bg: "transparent", color: "var(--text-muted)", border: "none" },
    danger: { bg: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid rgba(239, 68, 68, 0.2)" }
  }[variant];
  
  return (
    <motion.button
      whileHover={{ filter: variant === 'primary' ? 'brightness(0.9)' : 'brightness(1.2)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, 
        padding: size === 'sm' ? "6px 12px" : "8px 16px",
        borderRadius: 6, cursor: "pointer",
        background: styles.bg, color: styles.color, border: styles.border,
        fontSize: size === 'sm' ? 12 : 13, fontWeight: 500,
        fontFamily: "inherit", transition: "background 0.2s ease, border 0.2s ease"
      }}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {label}
    </motion.button>
  );
};

// ══════════════════════════════════════════════════════════════
//  FILE IMPORT SIMULATION
// ══════════════════════════════════════════════════════════════
function FileImportZone() {
  const { dispatch } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImport = (file) => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => { dispatch({ type: "IMPORT_MOCK_DATA" }); setLoading(false); }, 1500);
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleImport(e.dataTransfer.files[0]); }}
        onClick={() => fileInputRef.current.click()}
        style={{
          border: `1px dashed ${isDragging ? "var(--accent)" : "var(--border-color)"}`,
          background: isDragging ? "var(--bg-input-focus)" : "var(--bg-input)",
          borderRadius: 8, padding: "20px", textAlign: "center", cursor: "pointer",
          transition: "all 0.2s ease"
        }}
      >
        <input type="file" ref={fileInputRef} onChange={(e) => handleImport(e.target.files[0])} style={{ display: "none" }} accept=".pdf,.doc,.docx" />
        <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", padding: 10, borderRadius: "50%", marginBottom: 12, color: "var(--text-muted)" }}>
          {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Loader size={18}/></motion.div> : <FileUp size={18} />}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{loading ? "Extracting template data..." : "Import Existing Document"}</div>
      </div>
    </div>
  );
}
const Loader = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

// ══════════════════════════════════════════════════════════════
//  EDITOR FORMS
// ══════════════════════════════════════════════════════════════

const SectionHeader = ({ title }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>{title}</h2>
  </div>
);

function SettingsPanel() {
  const { data, dispatch } = useData();
  const set = field => val => dispatch({ type: "SET_SETTING", field, value: val });
  
  const formats = [
    { id: 'chronological', label: 'Chronological', tip: 'Lists experience in reverse chronological order. Best for steady career paths.' },
    { id: 'functional', label: 'Functional', tip: 'Focuses heavily on skills rather than timeline. Good for career changers.' },
    { id: 'combinational', label: 'Combinational', tip: 'A hybrid approach highlighting both skills and timeline context.' }
  ];

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#111827'];
  const alignments = [
    { id: 'left', icon: AlignLeft, label: 'Left' },
    { id: 'center', icon: AlignCenter, label: 'Center' },
    { id: 'right', icon: AlignRight, label: 'Right' },
  ];

  const formatTips = {
    chronological: 'Sections: Summary → Experience → Education → Skills. Best for consistent career growth.',
    functional: 'Sections: Summary → Skills → Experience → Education. Best for career changers or gaps.',
    combinational: 'Sections: Summary → Skills → Experience → Education. Best for mid-career professionals.',
  };

  const fonts = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Helvetica', 'Roboto', 'Calibri'];

  const SliderRow = ({ label, value, min, max, step, unit, field }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</label>
        <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => set(field)(Number(e.target.value))}
        style={{ width: "100%", accentColor: data.settings.accentColor }} />
    </div>
  );

  return (
    <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--border-color)" }}>
      <SectionHeader title="Layout Settings" />

      {/* Page count suggestion */}
      <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", fontSize: 12, color: "#93C5FD", lineHeight: 1.5 }}>
        📄 <strong>ATS Best Practice:</strong> Keep your resume to {data.settings.pageCount} page{data.settings.pageCount > 1 ? 's' : ''}. Content will auto-fit to the selected page count.
      </div>

      <div style={{ display: "flex", gap: 16, flexDirection: "column" }}>
        
        {/* Format Selector */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Resume Type</label>
          <div style={{ display: "flex", gap: 8 }}>
            {formats.map(f => (
              <div key={f.id} style={{ flex: 1 }}>
                <div className="tooltip-wrap" style={{ width: "100%" }}>
                  <button onClick={() => set('formatId')(f.id)}
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
                      background: data.settings.formatId === f.id ? "rgba(255,255,255,0.1)" : "var(--bg-input)",
                      color: "var(--text-main)", border: `1px solid ${data.settings.formatId === f.id ? "rgba(255,255,255,0.2)" : "var(--border-color)"}`,
                      display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit"
                    }}>
                    {f.label} {data.settings.formatId === f.id && <Check size={14} />}
                  </button>
                  <div className="tooltip-content">{f.tip}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-faint)", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", lineHeight: 1.5 }}>
            💡 {formatTips[data.settings.formatId]}
          </div>
        </div>

        {/* Page Count */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Page Count</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2].map(n => (
              <button key={n} onClick={() => set('pageCount')(n)}
                style={{
                  padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500,
                  background: data.settings.pageCount === n ? "rgba(255,255,255,0.1)" : "var(--bg-input)",
                  color: data.settings.pageCount === n ? "var(--text-main)" : "var(--text-muted)",
                  border: `1px solid ${data.settings.pageCount === n ? "rgba(255,255,255,0.2)" : "var(--border-color)"}`,
                  fontFamily: "inherit", transition: "all 0.15s"
                }}>{n} Page{n > 1 ? 's' : ''}</button>
            ))}
          </div>
        </div>

        {/* Alignment */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Header Alignment</label>
          <div style={{ display: "flex", gap: 6 }}>
            {alignments.map(a => (
              <button key={a.id} onClick={() => set('headerAlignment')(a.id)}
                style={{
                  padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500,
                  background: data.settings.headerAlignment === a.id ? "rgba(255,255,255,0.1)" : "var(--bg-input)",
                  color: data.settings.headerAlignment === a.id ? "var(--text-main)" : "var(--text-muted)",
                  border: `1px solid ${data.settings.headerAlignment === a.id ? "rgba(255,255,255,0.2)" : "var(--border-color)"}`,
                  display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", transition: "all 0.15s"
                }}><a.icon size={14} /> {a.label}</button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Font Family</label>
          <select value={data.settings.fontFamily} onChange={e => set('fontFamily')(e.target.value)}
            className="sleek-input" style={{ cursor: "pointer" }}>
            {fonts.map(f => <option key={f} value={f} style={{ background: "#18181B" }}>{f}</option>)}
          </select>
        </div>

        {/* Sliders */}
        <div style={{ background: "var(--bg-input)", borderRadius: 8, padding: 16, border: "1px solid var(--border-color)" }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 12 }}>
            <Type size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />Preview Styling
          </label>
          <SliderRow label="Font Size" value={data.settings.fontSize} min={9} max={16} step={0.5} unit="px" field="fontSize" />
          <SliderRow label="Line Height" value={data.settings.lineHeight || 1.5} min={1} max={2.5} step={0.1} unit="" field="lineHeight" />
          <SliderRow label="Word Spacing" value={data.settings.wordSpacing || 0} min={-2} max={8} step={0.5} unit="px" field="wordSpacing" />
          <SliderRow label="Letter Spacing" value={data.settings.letterSpacing || 0} min={-1} max={4} step={0.25} unit="px" field="letterSpacing" />
          <SliderRow label="Section Spacing" value={data.settings.sectionSpacing} min={8} max={32} step={2} unit="px" field="sectionSpacing" />
          <SliderRow label="Page Padding" value={data.settings.pagePadding} min={20} max={60} step={2} unit="px" field="pagePadding" />
        </div>

        {/* Color Picker */}
        <div>
           <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Accent Color</label>
           <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
             {colors.map(c => (
               <button key={c} onClick={() => set('accentColor')(c)}
                 style={{
                   width: 28, height: 28, borderRadius: "50%", background: c, border: "none", cursor: "pointer",
                   boxShadow: data.settings.accentColor === c ? `0 0 0 2px var(--bg-app), 0 0 0 4px ${c}` : "none",
                   transition: "box-shadow 0.2s"
                 }} />
             ))}
           </div>
        </div>

      </div>
    </div>
  );
}

// Template photo shape map: true = circle, false = square with rounded corners
const TEMPLATE_PHOTO_SHAPES = {

  professional: 'circle',
  bold: 'circle',
  avatar: 'circle',
  split: 'square'
};

function PhotoCropModal({ src, onApply, onCancel, templateId }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const imgRef = useRef(null);
  const containerSize = 280;

  // WYSIWYG Filter state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [blur, setBlur] = useState(0);

  // Determine shape from the current template
  const shape = TEMPLATE_PHOTO_SHAPES[templateId] || 'circle';
  const isCircle = shape === 'circle';
  const borderRadiusCSS = isCircle ? '50%' : '12%';
  const canvasCornerRadius = 48;

  useEffect(() => {
    const img = new Image();
    img.onload = () => { imgRef.current = img; };
    img.src = src;
  }, [src]);

  const handleMouseDown = (e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y)
    });
  };
  const handleMouseUp = () => setDragging(false);

  const roundedRectPath = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // Build CSS filter string for WYSIWYG preview
  const filterCSS = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) blur(${blur}px)`;

  const applyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext('2d');
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const img = imgRef.current;
    const scale = (containerSize * zoom) / Math.min(img.width, img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (size / 2) - (dw / 2) + (offset.x * (size / containerSize));
    const dy = (size / 2) - (dh / 2) + (offset.y * (size / containerSize));

    // Apply filters to canvas
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) blur(${blur}px)`;

    // Clip to the appropriate shape
    if (isCircle) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
    } else {
      roundedRectPath(ctx, 0, 0, size, size, canvasCornerRadius);
      ctx.clip();
    }

    ctx.drawImage(img, dx, dy, dw, dh);
    onApply(canvas.toDataURL('image/png'));
  };

  const imgStyle = imgRef.current ? (() => {
    const img = imgRef.current;
    const scale = (containerSize * zoom) / Math.min(img.width, img.height);
    return {
      width: img.width * scale, height: img.height * scale,
      position: 'absolute',
      left: '50%', top: '50%',
      transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
      pointerEvents: 'none',
      filter: filterCSS
    };
  })() : {};

  const resetAll = () => {
    setZoom(1); setOffset({ x: 0, y: 0 });
    setBrightness(100); setContrast(100); setSaturation(100); setGrayscale(0); setBlur(0);
  };

  // Gridlines overlay
  const Gridlines = () => (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.25)' }} />
      <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.25)' }} />
      <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.25)' }} />
      <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.25)' }} />
      <div style={{ position: 'absolute', left: '50%', top: 'calc(50% - 8px)', width: 1, height: 16, background: 'rgba(255,255,255,0.4)', transform: 'translateX(-50%)' }} />
      <div style={{ position: 'absolute', top: '50%', left: 'calc(50% - 8px)', height: 1, width: 16, background: 'rgba(255,255,255,0.4)', transform: 'translateY(-50%)' }} />
    </div>
  );

  // Filter slider helper
  const FilterSlider = ({ label, value, onChange, min, max, step, unit = '%' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-faint)' }}>
        <span>{label}</span>
        <span>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#7C3AED', height: 4, cursor: 'pointer' }} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 32, width: 740, maxWidth: '90vw', boxShadow: '0 24px 80px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Crop size={20} color="#7C3AED" /> Photo Editor
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Adjust crop and apply filters to match your resume style.</p>
          </div>
          <button onClick={onCancel} style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-faint)', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}><X size={16} /></button>
        </div>

        {/* Main Content Area: 2 Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32 }}>
          
          {/* Left Column: Crop Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
            
            {/* Shape label */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: 'var(--text-faint)', background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {isCircle ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C3AED' }}/> : <div style={{ width: 8, height: 8, borderRadius: 2, background: '#7C3AED' }}/>}
                {isCircle ? 'Circle Match' : 'Square Match'} — {templateId} template
              </span>
            </div>

            {/* WYSIWYG Crop preview */}
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                width: containerSize, height: containerSize, borderRadius: borderRadiusCSS, overflow: 'hidden',
                position: 'relative', margin: '0 auto', cursor: dragging ? 'grabbing' : 'grab',
                border: '4px solid rgba(255,255,255,0.1)', background: '#111', boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
              }}>
              {imgRef.current && <img src={src} alt="" style={imgStyle} />}
              {!imgRef.current && <img src={src} alt="" onLoad={(e) => { imgRef.current = e.target; setZoom(z => z); }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: filterCSS }} />}
              <Gridlines />
            </div>

            {/* Zoom control below preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, width: '100%', maxWidth: 280 }}>
              <ZoomOut size={16} color="var(--text-faint)" />
              <input type="range" min={0.5} max={3} step={0.05} value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#7C3AED' }} />
              <ZoomIn size={16} color="var(--text-faint)" />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8 }}>Zoom: {Math.round(zoom * 100)}%</div>
          </div>

          {/* Right Column: Filters Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={14} color="#7C3AED" /> Image Adjustments
              </div>
              
              <FilterSlider label="Brightness" value={brightness} onChange={setBrightness} min={20} max={200} step={1} />
              <FilterSlider label="Contrast" value={contrast} onChange={setContrast} min={20} max={200} step={1} />
              <FilterSlider label="Saturation" value={saturation} onChange={setSaturation} min={0} max={200} step={1} />
              <FilterSlider label="Grayscale" value={grayscale} onChange={setGrayscale} min={0} max={100} step={1} />
              <FilterSlider label="Blur" value={blur} onChange={setBlur} min={0} max={10} step={0.1} unit="px" />
              
              <button onClick={resetAll}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit', width: '100%', padding: '8px 0', borderRadius: 6, marginTop: 24, transition: 'all 0.2s' }}>
                <RotateCcw size={12} /> Reset to Default
              </button>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={onCancel}
                style={{ flex: 1, padding: '12px 0', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                Cancel
              </button>
              <button onClick={applyCrop}
                style={{ flex: 1, padding: '12px 0', borderRadius: 8, border: 'none', background: '#7C3AED', color: '#FFF', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                Apply Changes
              </button>
            </div>
            
          </div>
        </div>
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </motion.div>
    </motion.div>
  );
}

function PhotoUpload() {
  const { data, dispatch } = useData();
  const fileRef = useRef(null);
  const [rawPhoto, setRawPhoto] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  const templateId = data.settings?.templateId || 'modern';

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawPhoto(ev.target.result);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropApply = (croppedDataUrl) => {
    dispatch({ type: "SET_PHOTO", value: croppedDataUrl });
    setShowCrop(false);
    setRawPhoto(null);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Profile Photo</label>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div onClick={() => fileRef.current.click()} style={{
          width: 72, height: 72, borderRadius: "50%", overflow: "hidden", cursor: "pointer",
          border: "2px dashed var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center",
          background: data.personal.photo ? "none" : "var(--bg-input)", flexShrink: 0, transition: "border-color 0.2s"
        }}>
          {data.personal.photo ? (
            <img src={data.personal.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <ImagePlus size={20} color="var(--text-faint)" />
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
        <div style={{ fontSize: 12, color: "var(--text-faint)", lineHeight: 1.5 }}>
          Click to upload. Used in sidebar templates.<br/>
          {data.personal.photo && (
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button onClick={() => { setRawPhoto(data.personal.photo); setShowCrop(true); }}
                style={{ background: "none", border: "none", color: "#7C3AED", cursor: "pointer", fontSize: 12, padding: 0, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                <Crop size={12} /> Edit
              </button>
              <button onClick={() => dispatch({ type: "SET_PHOTO", value: null })}
                style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 12, padding: 0, fontFamily: "inherit" }}>
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showCrop && rawPhoto && (
          <PhotoCropModal src={rawPhoto} onApply={handleCropApply} onCancel={() => { setShowCrop(false); setRawPhoto(null); }} templateId={templateId} />
        )}
      </AnimatePresence>
    </div>
  );
}

function PersonalForm() {
  const {data,dispatch}=useData(); const p=data.personal;
  const set=field=>e=>dispatch({type:"SET_PERSONAL",field,value:e.target.value});
  return(
    <div style={{ marginBottom: 32 }}>
      <SectionHeader title="Personal Details" />
      <PhotoUpload />
      <Row>
        <SleekField label="Full Name"><input className="sleek-input" value={p.name} onChange={set("name")} placeholder="Jane Doe"/></SleekField>
        <SleekField label="Job Title"><input className="sleek-input" value={p.title} onChange={set("title")} placeholder="Product Designer"/></SleekField>
      </Row>
      <Row>
        <SleekField label="Email"><input className="sleek-input" value={p.email} onChange={set("email")} placeholder="jane@email.com"/></SleekField>
        <SleekField label="Phone"><input className="sleek-input" value={p.phone} onChange={set("phone")} placeholder="+1 555 000 0000"/></SleekField>
      </Row>
      <Row>
        <SleekField label="Location"><input className="sleek-input" value={p.location} onChange={set("location")} placeholder="City, State"/></SleekField>
        <SleekField label="LinkedIn"><input className="sleek-input long-content" value={p.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/..."/></SleekField>
      </Row>
      <SleekField label="Professional Summary">
        <textarea className="sleek-textarea" rows={4} value={p.summary} onChange={set("summary")} placeholder="A compelling snapshot of your professional story..."/>
      </SleekField>
    </div>
  );
}

function EducationForm() {
  const {data,dispatch}=useData();
  const setF=(id,field)=>e=>dispatch({type:"SET_EDU",id,field,value:e.target.value});
  return(
    <div style={{ marginBottom: 40 }}>
      <SectionHeader title="Education" />
      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          {data.education.map((edu,i)=>(
            <motion.div key={edu.id} layout="position"
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0, scale:0.95}}
              style={{ background: "var(--bg-panel)", borderRadius: 8, padding: 20, border: "1px solid var(--border-color)", marginBottom: 16 }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:600, color:"var(--text-muted)"}}>
                  <GraduationCap size={14}/> Education {i+1}
                </span>
                <ActionBtn icon={Trash2} variant="danger" size="sm" onClick={()=>dispatch({type:"DEL_EDU",id:edu.id})} />
              </div>
              <Row>
                <SleekField label="Institution"><input className="sleek-input" value={edu.institution} onChange={setF(edu.id,"institution")} placeholder="Stanford University"/></SleekField>
                <SleekField label="Degree"><input className="sleek-input" value={edu.degree} onChange={setF(edu.id,"degree")} placeholder="B.S. Computer Science"/></SleekField>
              </Row>
              <Row>
                <SleekField label="Year"><input className="sleek-input" value={edu.year} onChange={setF(edu.id,"year")} placeholder="2020"/></SleekField>
                <SleekField label="GPA (optional)"><input className="sleek-input" value={edu.gpa} onChange={setF(edu.id,"gpa")} placeholder="3.8"/></SleekField>
              </Row>
            </motion.div>
          ))}
        </AnimatePresence>
      </LayoutGroup>
      <ActionBtn icon={Plus} label="Add Education" variant="secondary" onClick={()=>dispatch({type:"ADD_EDU"})}/>
    </div>
  );
}

function ExperienceForm() {
  const {data,dispatch}=useData();
  const setF=(id,field)=>e=>dispatch({type:"SET_EXP",id,field,value:e.target.value});
  const setB=(id,idx)=>e=>dispatch({type:"SET_BULLET",id,idx,value:e.target.value});
  return(
    <div style={{ marginBottom: 40 }}>
      <SectionHeader title="Experience" />
      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          {data.experience.map((exp,i)=>(
            <motion.div key={exp.id} layout="position"
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0, scale:0.95}}
              style={{ background: "var(--bg-panel)", borderRadius: 8, padding: 20, border: "1px solid var(--border-color)", marginBottom: 16 }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:600, color:"var(--text-muted)"}}>
                  <GripVertical size={14}/> Experience {i+1}
                </span>
                <ActionBtn icon={Trash2} variant="danger" size="sm" onClick={()=>dispatch({type:"DEL_EXP",id:exp.id})} />
              </div>
              <div style={{display:"flex",flexDirection:"column"}}>
                <Row>
                  <SleekField label="Company"><input className="sleek-input" value={exp.company} onChange={setF(exp.id,"company")} placeholder="Google"/></SleekField>
                  <SleekField label="Role"><input className="sleek-input" value={exp.role} onChange={setF(exp.id,"role")} placeholder="Senior Engineer"/></SleekField>
                </Row>
                <Row>
                  <SleekField label="Duration"><input className="sleek-input" value={exp.duration} onChange={setF(exp.id,"duration")} placeholder="Jan 2022 – Present"/></SleekField>
                  <SleekField label="Location"><input className="sleek-input" value={exp.location} onChange={setF(exp.id,"location")} placeholder="Remote"/></SleekField>
                </Row>
                <div style={{ marginTop: 8 }}>
                  <label style={{fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8, display: "block"}}>Key Achievements</label>
                  <AnimatePresence mode="popLayout">
                    {exp.bullets.map((bullet,bi)=>(
                      <motion.div key={bi} layout="position" initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0,height:0}}
                        style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",flexShrink:0}}/>
                        <input className="sleek-input" value={bullet} onChange={setB(exp.id,bi)} placeholder="Achievement — use metrics where possible"/>
                        {exp.bullets.length>1&&(<ActionBtn icon={X} variant="ghost" size="sm" onClick={()=>dispatch({type:"DEL_BULLET",id:exp.id,idx:bi})}/>)}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div style={{marginTop: 8}}>
                    <ActionBtn icon={Plus} label="Add Bullet" onClick={()=>dispatch({type:"ADD_BULLET",id:exp.id})} size="sm" variant="secondary" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </LayoutGroup>
      <ActionBtn icon={Plus} label="Add Experience" variant="secondary" onClick={()=>dispatch({type:"ADD_EXP"})}/>
    </div>
  );
}

function SkillsForm() {
  const {data,dispatch}=useData();
  const set=cat=>e=>dispatch({type:"SET_SKILLS",cat,value:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)});
  const cats=[
    {key:"design",label:"Design Tools",ph:"Figma, Sketch, Framer..."},
    {key:"technical",label:"Technical",ph:"HTML, CSS, React, Git..."},
    {key:"soft",label:"Soft Skills",ph:"Leadership, Communication..."},
  ];
  return(
    <div style={{ marginBottom: 40 }}>
      <SectionHeader title="Skills & Tools" />
      {cats.map(({key,label,ph})=>(
        <SleekField key={key} label={label}>
          <input className="sleek-input" value={data.skills[key].join(", ")} onChange={set(key)} placeholder={ph}/>
          {data.skills[key].length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {data.skills[key].map((s,i) => (
                <span key={i} style={{ fontSize: 11, background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: 4, color: "var(--text-main)" }}>{s}</span>
              ))}
            </div>
          )}
        </SleekField>
      ))}
    </div>
  );
}

function ProjectsForm() {
  const {data,dispatch}=useData();
  const setF=(id,field)=>e=>dispatch({type:"SET_PROJ",id,field,value:e.target.value});
  const setB=(id,idx)=>e=>dispatch({type:"SET_PROJ_BULLET",id,idx,value:e.target.value});
  return(
    <div style={{ marginBottom: 40 }}>
      <SectionHeader title="Projects" />
      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          {data.projects.map((proj,i)=>(
            <motion.div key={proj.id} layout="position"
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0, scale:0.95}}
              style={{ background: "var(--bg-panel)", borderRadius: 8, padding: 20, border: "1px solid var(--border-color)", marginBottom: 16 }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:600, color:"var(--text-muted)"}}>
                  <Code size={14}/> Project {i+1}
                </span>
                <ActionBtn icon={Trash2} variant="danger" size="sm" onClick={()=>dispatch({type:"DEL_PROJ",id:proj.id})} />
              </div>
              <div style={{display:"flex",flexDirection:"column"}}>
                <SleekField label="Project Title"><input className="sleek-input" value={proj.title} onChange={setF(proj.id,"title")} placeholder="E-commerce App"/></SleekField>
                <Row>
                  <SleekField label="Link Text (optional)"><input className="sleek-input" value={proj.linkText} onChange={setF(proj.id,"linkText")} placeholder="GitHub"/></SleekField>
                  <SleekField label="Link URL (optional)"><input className="sleek-input" value={proj.linkUrl} onChange={setF(proj.id,"linkUrl")} placeholder="https://..."/></SleekField>
                </Row>
                <div style={{ marginTop: 8 }}>
                  <label style={{fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8, display: "block"}}>Description / Key Features</label>
                  <AnimatePresence mode="popLayout">
                    {proj.bullets.map((bullet,bi)=>(
                      <motion.div key={bi} layout="position" initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0,height:0}}
                        style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",flexShrink:0}}/>
                        <input className="sleek-input" value={bullet} onChange={setB(proj.id,bi)} placeholder="Built using React and Node.js"/>
                        {proj.bullets.length>1&&(<ActionBtn icon={X} variant="ghost" size="sm" onClick={()=>dispatch({type:"DEL_PROJ_BULLET",id:proj.id,idx:bi})}/>)}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div style={{marginTop: 8}}>
                    <ActionBtn icon={Plus} label="Add Bullet" onClick={()=>dispatch({type:"ADD_PROJ_BULLET",id:proj.id})} size="sm" variant="secondary" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </LayoutGroup>
      <ActionBtn icon={Plus} label="Add Project" variant="secondary" onClick={()=>dispatch({type:"ADD_PROJ"})}/>
    </div>
  );
}

function SimpleRichText({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command) => {
    document.execCommand(command, false, null);
    editorRef.current.focus();
    handleInput();
  };

  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 6, overflow: 'hidden', background: 'var(--bg-input)' }}>
      <div style={{ display: 'flex', gap: 4, padding: '6px 8px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-panel)' }}>
        <button type="button" onClick={() => exec('bold')} style={{ padding: '2px 6px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}>B</button>
        <button type="button" onClick={() => exec('italic')} style={{ padding: '2px 6px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontStyle: 'italic' }}>I</button>
        <button type="button" onClick={() => exec('underline')} style={{ padding: '2px 6px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', textDecoration: 'underline' }}>U</button>
        <div style={{ width: 1, background: 'var(--border-color)', margin: '0 4px' }} />
        <button type="button" onClick={() => exec('insertUnorderedList')} style={{ padding: '2px 6px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>• List</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        style={{ padding: 12, minHeight: 120, outline: 'none', color: 'var(--text-main)', fontSize: 14, fontFamily: 'inherit' }}
      />
    </div>
  );
}

function CustomSectionsForm() {
  const {data,dispatch}=useData();
  const set=(id,field)=>val=>dispatch({type:"SET_CUSTOM",id,field,value:val});

  return(
    <div style={{ marginBottom: 40 }}>
      <SectionHeader title="Custom Sections" />
      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          {data.customSections.map((sec,i)=>(
            <motion.div key={sec.id} layout="position" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0, height:0}}
              style={{ background: "var(--bg-panel)", borderRadius: 8, padding: 20, border: "1px solid var(--border-color)", marginBottom: 16 }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{fontSize:12, fontWeight:600, color:"var(--text-muted)"}}>Custom Field {i+1}</span>
                <ActionBtn icon={Trash2} variant="danger" size="sm" onClick={()=>dispatch({type:"DEL_CUSTOM",id:sec.id})} />
              </div>
              <SleekField label="Section Title">
                <input className="sleek-input" value={sec.title} onChange={(e) => set(sec.id,"title")(e.target.value)} placeholder="e.g., Volunteer Work"/>
              </SleekField>
              <SleekField label="Description (Rich Text)">
                <SimpleRichText value={sec.content} onChange={set(sec.id,"content")} placeholder="Details about this section..." />
              </SleekField>
            </motion.div>
          ))}
        </AnimatePresence>
      </LayoutGroup>
      <ActionBtn icon={Layers} label="Create Custom Field" variant="secondary" onClick={()=>dispatch({type:"ADD_CUSTOM"})}/>
    </div>
  );
}

function ReferencesForm() {
  const {data,dispatch}=useData();
  const refs = data.references || [];
  const setF=(id,field)=>e=>dispatch({type:"SET_REF",id,field,value:e.target.value});
  return(
    <div style={{ marginBottom: 40 }}>
      <SectionHeader title="References" />
      <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 16, lineHeight: 1.5, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
        💡 Add professional references who can vouch for your work. Include at least 2-3 references if possible.
      </div>
      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          {refs.map((ref,i)=>(
            <motion.div key={ref.id} layout="position"
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0, scale:0.95}}
              style={{ background: "var(--bg-panel)", borderRadius: 8, padding: 20, border: "1px solid var(--border-color)", marginBottom: 16 }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:600, color:"var(--text-muted)"}}>
                  <Users size={14}/> Reference {i+1}
                </span>
                <ActionBtn icon={Trash2} variant="danger" size="sm" onClick={()=>dispatch({type:"DEL_REF",id:ref.id})} />
              </div>
              <Row>
                <SleekField label="Full Name"><input className="sleek-input" value={ref.name} onChange={setF(ref.id,"name")} placeholder="Dr. Sarah Johnson"/></SleekField>
                <SleekField label="Job Title"><input className="sleek-input" value={ref.title} onChange={setF(ref.id,"title")} placeholder="Director of Engineering"/></SleekField>
              </Row>
              <Row>
                <SleekField label="Company"><input className="sleek-input" value={ref.company} onChange={setF(ref.id,"company")} placeholder="TechCorp Inc."/></SleekField>
                <SleekField label="Relationship"><input className="sleek-input" value={ref.relationship} onChange={setF(ref.id,"relationship")} placeholder="Former Manager"/></SleekField>
              </Row>
              <Row>
                <SleekField label="Email"><input className="sleek-input" value={ref.email} onChange={setF(ref.id,"email")} placeholder="sarah@company.com"/></SleekField>
                <SleekField label="Phone"><input className="sleek-input" value={ref.phone} onChange={setF(ref.id,"phone")} placeholder="+1 555 000 0000"/></SleekField>
              </Row>
            </motion.div>
          ))}
        </AnimatePresence>
      </LayoutGroup>
      <ActionBtn icon={Plus} label="Add Reference" variant="secondary" onClick={()=>dispatch({type:"ADD_REF"})}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PREVIEW WRAPPER
// ══════════════════════════════════════════════════════════════
function LivePreview() {
  const { data, dispatch } = useData();
  const [searchParams] = useSearchParams();
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  
  // Read template from URL param on mount
  useEffect(() => {
    const tId = searchParams.get('template');
    if (tId && TEMPLATES[tId]) {
      dispatch({ type: 'INIT_TEMPLATE', value: tId });
    }
  }, [searchParams, dispatch]);

  // Auto-scale content to fit page count
  useEffect(() => {
    if (!contentRef.current) return;
    const pageHeightPx = data.settings.pageCount * 1122; // A4 at 96dpi ≈ 1122px
    const contentHeight = contentRef.current.scrollHeight;
    if (contentHeight > pageHeightPx) {
      setScale(Math.max(0.65, pageHeightPx / contentHeight));
    } else {
      setScale(1);
    }
  }, [data]);

  const Tmpl = TEMPLATES[data.settings.templateId] || TEMPLATES['modern'];
  const pageHeight = data.settings.pageCount * 1122;

  return (
    <div ref={containerRef} style={{ width: "fit-content", margin: "0 auto", paddingBottom: 40 }}>
      {/* Page count indicator */}
      <div style={{ textAlign: "center", marginBottom: 12, fontSize: 11, color: "var(--text-faint)" }}>
        {data.settings.pageCount} page{data.settings.pageCount > 1 ? 's' : ''} • {data.settings.templateId} template
        {scale < 1 && <span style={{ color: "#F59E0B" }}> • Scaled to {Math.round(scale * 100)}% to fit</span>}
      </div>
      <div style={{
        width: 794, // A4 width at 96dpi
        minHeight: pageHeight,
        maxHeight: pageHeight,
        overflow: "hidden",
        background: "#FFF",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        margin: "0 auto",
        position: "relative"
      }}>
        <div ref={contentRef} style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${100 / scale}%`,
          minHeight: `${100 / scale}%`,
        }}>
          <Tmpl data={data} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  DASHBOARD SHELL
// ══════════════════════════════════════════════════════════════

function EditorPanel({ width }) {
  const { data } = useData();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const analysis = useMemo(() => analyzeResume(data), [data]);
  const scoreColor = analysis.score >= 80 ? '#10B981' : analysis.score >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="no-print editor-panel" style={{ width: `${width}%`, padding: "32px 36px", overflowY: "auto", flexShrink: 0, boxSizing: "border-box" }}>
      {/* Analysis Toggle */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => setShowAnalysis(!showAnalysis)}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 8, cursor: "pointer",
          background: `linear-gradient(135deg, ${scoreColor}15, ${scoreColor}08)`,
          border: `1px solid ${scoreColor}30`, color: "var(--text-main)",
          fontSize: 13, fontWeight: 500, fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24, transition: "all 0.2s"
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={15} style={{ color: scoreColor }} />
          Resume Analysis
          {analysis.errors.length > 0 && (
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
              {analysis.errors.length} error{analysis.errors.length > 1 ? 's' : ''}
            </span>
          )}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor }}>{analysis.score}</span>
          <ChevronDown size={14} style={{ transform: showAnalysis ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </span>
      </motion.button>

      <AnimatePresence>
        {showAnalysis && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 24 }}>
            <SuggestionsPanel data={data} isOpen={true} onClose={() => setShowAnalysis(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsPanel />
      <PersonalForm />
      <EducationForm />
      <ExperienceForm />
      <SkillsForm />
      <ProjectsForm />
      <ReferencesForm />
      <CustomSectionsForm />
    </div>
  );
}

function CloudResumes({ onSelect }) {
  const { dispatch } = useData();
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: get the user-scoped resumes collection path
  const getResumesCol = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "resumes");
  }, [user]);

  const fetchResumes = useCallback(async () => {
    const col = getResumesCol();
    if (!col) { setLoading(false); return; }
    try {
      const snap = await getDocs(col);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResumes(list);
    } catch(e) {
      console.error(e);
      alert("Error fetching resumes. Check Firebase config.");
    } finally {
      setLoading(false);
    }
  }, [getResumesCol]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const createNew = async () => {
    const col = getResumesCol();
    if (!col) return;
    const newResume = { ...DEFAULT, id: null, title: "New Resume " + Date.now() };
    try {
      const docRef = await addDoc(col, newResume);
      newResume.id = docRef.id;
      dispatch({ type: "LOAD_RESUME", data: newResume });
      onSelect();
    } catch (e) {
      console.error(e);
      alert("Error creating resume.");
    }
  };

  const loadResume = (resumeData) => {
    dispatch({ type: "LOAD_RESUME", data: resumeData });
    onSelect();
  };

  const deleteResume = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "resumes", id));
      setResumes(r => r.filter(x => x.id !== id));
    } catch(e) {
      console.error(e);
    }
  };

  if (loading) return <div style={{ padding: 40, color: "var(--text-main)" }}>Loading History...</div>;

  if (!user) return (
    <div style={{ padding: 40, color: "var(--text-muted)", textAlign: "center" }}>
      <p>Sign in to view your resume history.</p>
    </div>
  );

  return (
    <div style={{ padding: "40px 60px", width: "100%", maxWidth: 1200, margin: "0 auto", color: "var(--text-main)" }}>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "var(--text-main)" }}>History</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Resume Progress<br/>Manage your completed resumes and load previous drafts.</p>
      </div>

      <div style={{ marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid var(--border-color)" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>Completed Resume Drafts</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
        
        {/* Create New Card */}
        <div 
           onClick={createNew}
           style={{ border: "2px dashed var(--border-color)", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, cursor: "pointer", minHeight: 220, transition: "border 0.2s" }}
           onMouseEnter={e => e.currentTarget.style.borderColor = "var(--text-muted)"}
           onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-color)"}
        >
           <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
             <Plus size={24} color="var(--text-muted)" />
           </div>
           <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>Create New Resume</span>
        </div>

        {/* Existing Resumes */}
        {resumes.map(r => (
          <div key={r.id} style={{ background: "var(--bg-panel)", border: "1px solid var(--border-color)", padding: "24px", borderRadius: 12, display: "flex", flexDirection: "column", minHeight: 220 }}>
            
            {/* Header: Icon & Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={18} color="var(--text-main)" />
              </div>
              <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                Completed
              </div>
            </div>

            <h3 style={{ fontSize: 18, marginBottom: 8, fontWeight: 600, color: "var(--text-main)" }}>{r.title || "Untitled Resume"}</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
              Template: {r.settings?.templateId}<br/>
              Author: {r.personal?.name || "Unknown"}
            </p>
            
            <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
              <button 
                onClick={() => loadResume(r)} 
                style={{ flex: 1, background: "var(--accent)", color: "var(--bg-app)", border: "none", padding: "10px 0", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "opacity 0.2s" }} 
                onMouseEnter={e => e.target.style.opacity = 0.9} 
                onMouseLeave={e => e.target.style.opacity = 1}
              >
                Edit Resume
              </button>
              <button 
                onClick={() => deleteResume(r.id)} 
                style={{ flex: 1, background: "transparent", color: "var(--text-main)", border: "1px solid var(--border-color)", padding: "10px 0", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "background 0.2s" }} 
                onMouseEnter={e => e.target.style.background = "var(--bg-input)"} 
                onMouseLeave={e => e.target.style.background = "transparent"}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardInner() {
  const { data, dispatch } = useData();
  const [activeTab, setActiveTab] = useState('Editor');
  const [editorWidth, setEditorWidth] = useState(45);
  const [isResizing, setIsResizing] = useState(false);
  const [toast, setToast] = useState(null);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const { user: googleUser, login: handleGoogleSignIn, logout: handleGoogleSignOut } = useAuth();
  const navigate = useNavigate();

  const doGoogleSignIn = async () => {
    try {
      await handleGoogleSignIn();
      showToast('Signed in with Google');
    } catch (e) {
      console.error(e);
      showToast('Sign-in failed');
    }
  };

  const doGoogleSignOut = async () => {
    await handleGoogleSignOut();
    showToast('Signed out');
  };

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    const newWidth = ((e.clientX - 220) / (window.innerWidth - 220)) * 100;
    if (newWidth > 25 && newWidth < 75) {
      setEditorWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => setIsResizing(false), []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleExportPDF = () => {
    const element = document.getElementById('resume-pdf-target');
    if (!element) return;
    const opt = {
      margin:       0,
      filename:     'resume.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    logActivity({ type: 'export_pdf', title: 'Exported Resume as PDF', detail: data.title || 'Untitled Resume' });
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleCloudSave = async () => {
    if (!googleUser) {
      showToast('Sign in first to save to cloud');
      return;
    }
    const userResumesCol = collection(db, "users", googleUser.uid, "resumes");
    try {
      if (data.id) {
        await updateDoc(doc(db, "users", googleUser.uid, "resumes", data.id), data);
        logActivity({ type: 'resume_save', title: 'Saved Resume to Cloud', detail: data.title || 'Untitled Resume', resumeData: data });
        showToast('Saved to Cloud');
      } else {
        const docRef = await addDoc(userResumesCol, data);
        dispatch({ type: "SET_RESUME_META", id: docRef.id, title: data.title || "My Resume" });
        const newData = { ...data, id: docRef.id, title: data.title || "My Resume" };
        logActivity({ type: 'resume_save', title: 'Created New Cloud Resume', detail: newData.title, resumeData: newData });
        showToast('Saved to Cloud');
      }
    } catch(e) {
      console.error(e);
      showToast('Error saving to cloud');
    }
  };

  const navItems = [
    { id: 'Editor', icon: LayoutDashboard },
    { id: 'History', icon: History },
    { id: 'Pipeline', icon: BarChart3 },
    { id: 'Activity', icon: Activity },
  ];

  return (
    <>
      <style>{THEME_CSS}</style>
      <div className="dashboard-shell" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        
        {/* SIDEBAR */}
        <div style={{ width: 220, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border-color)", display: "flex", flexDirection: "column", flexShrink: 0, padding: "24px 16px" }}>
          <div 
            onClick={() => setShowExitWarning(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 600, marginBottom: 40, color: "var(--text-main)", paddingLeft: 8, cursor: "pointer", transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", color: "var(--bg-app)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={14} />
            </div>
            GenesisCV
          </div>
          
          <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {navItems.map(item => {
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: active ? "var(--bg-input)" : "transparent", color: active ? "var(--text-main)" : "var(--text-muted)", fontSize: 13, fontWeight: 500, textAlign: "left", transition: "all 0.2s ease", fontFamily: "inherit" }}>
                  <item.icon size={16} /> {item.id}
                </button>
              );
            })}
          </nav>

          {/* Google Account Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 8 }}>
            {googleUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={googleUser.photoURL || ''} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-color)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {googleUser.displayName || 'User'}
                  </div>
                  <button onClick={doGoogleSignOut}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', fontSize: 10, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={doGoogleSignIn}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-muted)',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, transition: 'all 0.15s'
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
              </button>
            )}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          
          {/* TOP BAR */}
          <header className="no-print" style={{ height: 60, borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
             <div style={{ fontSize: 15, fontWeight: 500 }}>
               {activeTab === 'Editor' ? (
                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                   Editor
                   <input 
                     value={data.title || ""} 
                     onChange={(e) => dispatch({ type: "SET_RESUME_META", id: data.id, title: e.target.value })} 
                     placeholder="Untitled Resume"
                     style={{ background: "transparent", border: "1px solid transparent", color: "var(--text-muted)", fontSize: 14, padding: "4px 8px", borderRadius: 4 }}
                     onFocus={e => e.target.style.background = "var(--bg-input)"}
                     onBlur={e => e.target.style.background = "transparent"}
                   />
                 </div>
               ) : activeTab}
             </div>
             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
               <ActionBtn icon={Activity} label="Save to Cloud" variant="secondary" size="sm" onClick={handleCloudSave} />
               <ActionBtn icon={Download} label="Export PDF" variant="primary" size="sm" onClick={handleExportPDF} />
             </div>
          </header>

          {/* DYNAMIC VIEW */}
          <div style={{ flex: 1, overflowY: "hidden", display: "flex", userSelect: isResizing ? 'none' : 'auto' }}>
            {activeTab === 'Editor' ? (
              <>
                <EditorPanel width={editorWidth} />
                <div 
                  className="no-print"
                  onMouseDown={() => setIsResizing(true)}
                  style={{ 
                    width: 6, cursor: "col-resize", background: isResizing ? "var(--accent)" : "transparent",
                    borderLeft: "1px solid var(--border-color)",
                    zIndex: 10, transition: "background 0.2s" 
                  }}
                  onMouseEnter={(e) => { if(!isResizing) e.currentTarget.style.background = "var(--border-color)"; }}
                  onMouseLeave={(e) => { if(!isResizing) e.currentTarget.style.background = "transparent"; }}
                />
                <div style={{ width: `${100 - editorWidth}%`, background: "var(--bg-app)", padding: "40px", overflow: "auto" }}>
                   <div id="resume-pdf-target" style={{ width: "fit-content", margin: "0 auto" }}>
                     <LivePreview />
                   </div>
                </div>
              </>
            ) : activeTab === 'History' ? (
              <div style={{ flex: 1, overflowY: "auto" }}>
                <CloudResumes onSelect={() => setActiveTab('Editor')} />
              </div>
            ) : activeTab === 'Pipeline' ? (
              <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
                <PipelineDashboard />
              </div>
            ) : activeTab === 'Activity' ? (
              <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
                <ActivityTracker onNavigate={(tab, payload) => {
                  setActiveTab(tab);
                  if (payload) dispatch({ type: 'LOAD_RESUME', data: payload });
                }} />
              </div>
            ) : (
              <div style={{ padding: 40, color: "var(--text-muted)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                 <div style={{ textAlign: "center" }}>
                   <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><BarChart3 size={20}/></div>
                   <p>This view is under construction.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {toast && <ToastNotification message={toast} />}
      </AnimatePresence>

      {/* Exit Warning Modal */}
      <AnimatePresence>
        {showExitWarning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowExitWarning(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '32px 28px', width: 400, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', textAlign: 'center' }}>
              
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertTriangle size={24} color="#F59E0B" />
              </div>
              
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.02em' }}>Leave GenesisCV?</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                Any unsaved changes to your resume will be lost.<br/>
                Make sure to <strong style={{ color: 'var(--text-main)' }}>Save to Cloud</strong> or <strong style={{ color: 'var(--text-main)' }}>Export PDF</strong> before leaving.
              </p>
              
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowExitWarning(false)}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}>
                  Stay
                </button>
                <button onClick={() => { setShowExitWarning(false); navigate('/'); }}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: 'none', background: '#EF4444', color: '#FFF', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}>
                  Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Sleek Toast Notification ── */
function ToastNotification({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 99999,
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.08))',
        border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.1)',
        backdropFilter: 'blur(20px)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.01em' }}>{message}</span>
    </motion.div>
  );
}

export default function Dashboard() {
  return (
    <DataProvider>
      <DashboardInner />
    </DataProvider>
  );
}

