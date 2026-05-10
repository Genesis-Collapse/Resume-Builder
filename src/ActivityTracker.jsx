import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, FileText, Download, Layers, CheckCircle2, Bell, Flag,
  Filter, ChevronLeft, ChevronRight, Plus, Trash2, Info, Save, Edit3,
  ExternalLink, ChevronDown
} from 'lucide-react';
import { getActivities, logActivity, clearActivities, timeAgo } from './activityLogger';

// ══════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Moved timeAgo to activityLogger

const TYPE_META = {
  resume_save: { icon: Save, color: '#10B981', label: 'Saved' },
  resume_edit: { icon: Edit3, color: '#3B82F6', label: 'Edited' },
  template_change: { icon: Layers, color: '#8B5CF6', label: 'Template' },
  export_pdf: { icon: Download, color: '#F59E0B', label: 'Exported' },
  todo_complete: { icon: CheckCircle2, color: '#10B981', label: 'Task Done' },
  deadline_done: { icon: Bell, color: '#EF4444', label: 'Deadline' },
  checkpoint: { icon: Flag, color: '#EC4899', label: 'Checkpoint' }
};

const CLICKABLE_TYPES = ['resume_save', 'resume_edit', 'template_change', 'checkpoint'];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Activity' },
  { value: 'resume', label: 'Resume Edits' },
  { value: 'tasks', label: 'Tasks & Deadlines' },
  { value: 'checkpoints', label: 'Checkpoints' }
];

// ══════════════════════════════════════════════════════════════
//  MINI CALENDAR + UPCOMING EVENTS
// ══════════════════════════════════════════════════════════════

function UpcomingSidebar() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('pipeline-data') || '{}');
      setEvents(data.events || []);
    } catch { setEvents([]); }
    const interval = setInterval(() => {
      try {
        const data = JSON.parse(localStorage.getItem('pipeline-data') || '{}');
        setEvents(data.events || []);
      } catch { }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Upcoming events (future or today)
  const upcoming = events.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 20 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 14 }}>Upcoming</span>

      {/* Mini calendar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <button onClick={prev} style={miniNavBtn}><ChevronLeft size={14} /></button>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{MONTHS[month]} {year}</span>
        <button onClick={next} style={miniNavBtn}><ChevronRight size={14} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: 16 }}>
        {DAYS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-faint)', fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const hasEvent = events.some(e => e.date === dateStr);
          return (
            <div key={i} style={{
              textAlign: 'center', fontSize: 11, padding: '4px 0', color: isToday ? '#FFF' : 'var(--text-muted)',
              fontWeight: isToday ? 700 : 400, position: 'relative'
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: '50%',
                background: isToday ? '#7C3AED' : 'transparent'
              }}>{day}</span>
              {hasEvent && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7C3AED', margin: '1px auto 0' }} />}
            </div>
          );
        })}
      </div>

      {/* Upcoming events list */}
      {upcoming.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {upcoming.map(ev => {
            const d = new Date(ev.date + 'T00:00:00');
            return (
              <div key={ev.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: ev.color || '#7C3AED', textTransform: 'uppercase' }}>
                    {MONTHS[d.getMonth()].slice(0, 3)}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{d.getDate()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{ev.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {upcoming.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center', padding: '4px 0' }}>No upcoming events</div>
      )}
    </div>
  );
}

const miniNavBtn = {
  background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', padding: 4
};

// ══════════════════════════════════════════════════════════════
//  CHECKPOINT BUTTON
// ══════════════════════════════════════════════════════════════

function CheckpointModal({ onClose, onSave }) {
  const [note, setNote] = useState('');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 28, width: 380, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(236,72,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flag size={16} color="#EC4899" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>Drop a Checkpoint</h3>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 16, lineHeight: 1.6 }}>
          Mark your current progress. Checkpoints help you track milestones in your job search journey.
        </p>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g., Finalized resume for tech roles..."
          autoFocus className="sleek-input" style={{ marginBottom: 16 }}
          onKeyDown={e => { if (e.key === 'Enter' && note.trim()) { onSave(note.trim()); onClose(); } }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '10px 0', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button onClick={() => { if (note.trim()) { onSave(note.trim()); onClose(); } }}
            style={{ flex: 1, padding: '10px 0', borderRadius: 6, border: 'none', background: '#EC4899', color: '#FFF', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Save Checkpoint
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
//  TIMELINE ITEM (Expandable)
// ══════════════════════════════════════════════════════════════

function TimelineItem({ activity: a, meta, isClickable, onNavigate, index }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = meta.icon;
  const hasDetail = !!a.detail;

  return (
    <motion.div layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      style={{ position: 'relative', marginBottom: 16 }}
    >
      {/* Timeline dot */}
      <div style={{
        position: 'absolute', left: -28, top: 12,
        width: 20, height: 20, borderRadius: '50%',
        background: `${meta.color}15`, display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1
      }}>
        <Icon size={10} color={meta.color} />
      </div>

      {/* Content card */}
      <div
        onClick={() => hasDetail ? setExpanded(!expanded) : (isClickable && onNavigate && onNavigate('Editor', a?.resumeData))}
        style={{
          padding: '14px 18px', borderRadius: 10, background: 'var(--bg-input)',
          border: `1px solid ${expanded ? 'rgba(255,255,255,0.15)' : 'var(--border-color)'}`,
          cursor: (hasDetail || isClickable) ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          boxShadow: expanded ? '0 8px 24px rgba(0,0,0,0.2)' : 'none'
        }}
        onMouseEnter={e => { if (isClickable || hasDetail) e.currentTarget.style.borderColor = expanded ? 'rgba(255,255,255,0.25)' : `${meta?.color || '#3B82F6'}40`; }}
        onMouseLeave={e => { if (isClickable || hasDetail) e.currentTarget.style.borderColor = expanded ? 'rgba(255,255,255,0.15)' : 'var(--border-color)'; }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>{a?.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{timeAgo(a?.timestamp)}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isClickable && !expanded && (
              <span style={{ fontSize: 11, fontWeight: 500, color: meta?.color, display: 'flex', alignItems: 'center', gap: 4, opacity: 0.7 }}>
                <ExternalLink size={11} /> View
              </span>
            )}
            {hasDetail && (
              <ChevronDown size={14} color="var(--text-faint)"
                style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            )}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ height: 12 }} />
              {a?.detail && (
                <div style={{
                  fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6,
                  padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6,
                  marginBottom: 12
                }}>
                  {a.detail}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                  background: `${meta?.color || '#3B82F6'}15`, color: meta?.color || '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {a?.type?.replace(/_/g, ' ')}
                </span>
                {isClickable && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigate('Editor', a?.resumeData); }}
                    style={{
                      background: 'var(--accent)', color: 'var(--bg-app)', border: 'none',
                      borderRadius: 4, padding: '4px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Load Resume
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN ACTIVITY TRACKER COMPONENT
// ══════════════════════════════════════════════════════════════

export default function ActivityTracker({ onNavigate }) {
  const [activities, setActivities] = useState(getActivities());
  const [filter, setFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);

  // Listen for activity updates from any component
  useEffect(() => {
    const refresh = () => setActivities(getActivities());
    window.addEventListener('activity-updated', refresh);
    return () => window.removeEventListener('activity-updated', refresh);
  }, []);

  const filteredActivities = activities.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'resume') return ['resume_save', 'resume_edit', 'template_change', 'export_pdf'].includes(a.type);
    if (filter === 'tasks') return ['todo_complete', 'deadline_done'].includes(a.type);
    if (filter === 'checkpoints') return a.type === 'checkpoint';
    return true;
  });

  const handleCheckpoint = (note) => {
    logActivity({ type: 'checkpoint', title: note, detail: 'Manual checkpoint' });
  };

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
  const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

  return (
    <div style={{ padding: '28px 28px', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>Activity Tracker</h1>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => setShowCheckpoint(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8,
            border: '1px solid rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.08)',
            color: '#EC4899', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit'
          }}>
          <Flag size={14} /> Drop Checkpoint
        </motion.button>
      </motion.div>

      {/* 2-COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, alignItems: 'start' }}>

        {/* ─── LEFT: RECENT ACTIVITY ─── */}
        <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* TOP 3 RECENT */}
          <motion.div variants={fadeUp}>
            <div style={{
              background: 'var(--bg-panel)', border: '1px solid var(--border-color)',
              borderRadius: 10, padding: 20, marginBottom: 8
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: 14 }}>
                Top 3 Recent
              </span>
              {activities.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {activities.slice(0, 3).map((a, i) => {
                    const meta = TYPE_META[a.type] || TYPE_META.resume_edit;
                    const Icon = meta.icon;
                    return (
                      <motion.div key={a.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        style={{
                          padding: '14px 12px', borderRadius: 8, background: 'var(--bg-input)',
                          border: '1px solid var(--border-color)', textAlign: 'center',
                          cursor: (a?.type && CLICKABLE_TYPES.includes(a.type)) ? 'pointer' : 'default'
                        }}
                        onClick={() => { if (a?.type && CLICKABLE_TYPES.includes(a.type) && onNavigate) onNavigate('Editor', a.resumeData); }}
                        whileHover={{ borderColor: 'rgba(255,255,255,0.15)' }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: `${meta?.color || '#3B82F6'}15`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px'
                        }}>
                          <Icon size={14} color={meta?.color || '#3B82F6'} />
                        </div>
                        <div style={{
                          fontSize: 11, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>{a?.title}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>{timeAgo(a?.timestamp)}</div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center', padding: '12px 0' }}>No activity yet</div>
              )}
            </div>
          </motion.div>


          {/* RECENT ACTIVITY */}
          <motion.div variants={fadeUp}>
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Recent Activity</span>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowFilter(!showFilter)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 6,
                      border: '1px solid var(--border-color)', background: 'var(--bg-input)',
                      color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit'
                    }}>
                    <Filter size={12} />
                    {FILTER_OPTIONS.find(f => f.value === filter)?.label}
                  </button>
                  <AnimatePresence>
                    {showFilter && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        style={{
                          position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'var(--bg-panel)',
                          border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden', zIndex: 100,
                          boxShadow: '0 12px 40px rgba(0,0,0,0.4)', minWidth: 160
                        }}>
                        {FILTER_OPTIONS.map(f => (
                          <button key={f.value} onClick={() => { setFilter(f.value); setShowFilter(false); }}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px',
                              border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                              background: filter === f.value ? 'rgba(255,255,255,0.06)' : 'transparent',
                              color: filter === f.value ? 'var(--text-main)' : 'var(--text-muted)',
                              fontWeight: filter === f.value ? 600 : 400
                            }}>{f.label}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Timeline */}
              {filteredActivities.length > 0 ? (
                <div style={{ position: 'relative', paddingLeft: 28 }}>
                  {/* Vertical line */}
                  <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }} />

                  <AnimatePresence mode="popLayout">
                    {filteredActivities.slice(0, 30).map((a, i) => (
                      <TimelineItem
                        key={a.id || `timeline-${i}`}
                        activity={a}
                        meta={TYPE_META[a?.type] || TYPE_META.resume_edit}
                        isClickable={a?.type && CLICKABLE_TYPES.includes(a.type)}
                        onNavigate={onNavigate}
                        index={i}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Clock size={18} color="var(--text-faint)" />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>No activity yet</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4, opacity: 0.6 }}>
                    Start editing your resume or complete Pipeline tasks
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* ─── RIGHT SIDEBAR: UPCOMING ─── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
          <UpcomingSidebar />
        </motion.div>
      </div>

      {/* CHECKPOINT MODAL */}
      <AnimatePresence>
        {showCheckpoint && <CheckpointModal onClose={() => setShowCheckpoint(false)} onSave={handleCheckpoint} />}
      </AnimatePresence>
    </div>
  );
}
