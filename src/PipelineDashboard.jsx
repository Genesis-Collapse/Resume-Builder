import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Check, Bell, Clock,
  ChevronLeft, ChevronRight, Calendar, CheckCircle2,
  FileText, Briefcase, RefreshCw, AlertCircle, Info, ChevronDown, Maximize2,
  ExternalLink, Link, Loader, ListChecks
} from 'lucide-react';

import { logActivity, todoToPastTense, getActivities, removeActivityByTitle, timeAgo } from './activityLogger';

// ══════════════════════════════════════════════════════════════
//  MOCK DATA
// ══════════════════════════════════════════════════════════════

const DEFAULT_ACTIVITIES = [
  { id: 'a1', type: 'applied', title: 'Applied to Acme Corp', subtitle: 'Senior UX Researcher', time: '2h ago' },
  { id: 'a2', type: 'interview', title: 'Interview Scheduled', subtitle: 'GlobalTech', time: '5h ago' },
  { id: 'a3', type: 'updated', title: 'Updated Resume', subtitle: 'Product Lead Variant', time: '1d ago' },
];

const DEFAULT_DEADLINES = [
  { id: 'd1', title: 'Take-home Assignment', company: 'GlobalTech • Director of Design', urgency: 'TODAY', done: false },
  { id: 'd2', title: 'Follow-up: Acme Corp', company: '7 days since application', urgency: '14-10-2023', done: false },
  { id: 'd3', title: 'Portfolio Review', company: 'GlobalTech • Round 2', urgency: 'TOMORROW', done: false },
];

const DEFAULT_TODOS = [
  { id: 't1', title: 'Revise Portfolio Bio', subtitle: 'Due by end of week', checked: false, priority: 'normal' },
  { id: 't2', title: 'Draft follow-up for TechFlow', subtitle: 'Completed today', checked: true, priority: 'normal' },
  { id: 't3', title: 'Update LinkedIn Headshot', subtitle: 'Task • High Priority', checked: false, priority: 'high' },
  { id: 't4', title: 'Prep for Portfolio Review', subtitle: 'Linked to: GlobalTech', checked: false, priority: 'normal' },
  { id: 't5', title: 'Research Salary Benchmarks', subtitle: 'Market analysis', checked: false, priority: 'normal' },
];

// Helper: compute urgency label from a deadline date
function deadlineUrgency(deadlineDateStr) {
  if (!deadlineDateStr) return '';
  const today = new Date(); today.setHours(0,0,0,0);
  const dl = new Date(deadlineDateStr); dl.setHours(0,0,0,0);
  const diffMs = dl - today;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'OVERDUE';
  if (diffDays === 0) return 'TODAY';
  if (diffDays === 1) return 'TOMORROW';
  // Format as DD-MM-YYYY for the Badge component
  const dd = String(dl.getDate()).padStart(2, '0');
  const mm = String(dl.getMonth() + 1).padStart(2, '0');
  const yyyy = dl.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// Sample events — two include deadlines so users can see how it works
const todayDate = new Date();
const sampleDeadline1 = new Date(todayDate); sampleDeadline1.setDate(sampleDeadline1.getDate() + 2);
const sampleDeadline2 = new Date(todayDate); sampleDeadline2.setDate(sampleDeadline2.getDate() + 5);
const fmtISO = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

const DEFAULT_EVENTS = [
  { id: 'ev1', date: fmtISO(todayDate), title: 'Finalize case study', color: '#7C3AED', description: 'Complete the UX case study for GlobalTech interview', deadline: fmtISO(sampleDeadline1) },
  { id: 'ev2', date: fmtISO(todayDate), title: 'Submit application: DesignCo', color: '#10B981', description: 'Senior Product Designer role — attach portfolio link', deadline: fmtISO(sampleDeadline2) },
];

const STORAGE_KEY = 'pipeline-data';

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error(e); }
  return null;
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
}

// ══════════════════════════════════════════════════════════════
//  CALENDAR HELPERS
// ══════════════════════════════════════════════════════════════

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }
function fmt(y, m, d) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }

// ══════════════════════════════════════════════════════════════
//  ACTIVITY DOT COLORS
// ══════════════════════════════════════════════════════════════

const DOT_COLORS = { 
  resume_save: '#10B981', 
  resume_edit: '#3B82F6', 
  template_change: '#8B5CF6', 
  export_pdf: '#F59E0B', 
  todo_complete: '#10B981', 
  deadline_done: '#EF4444', 
  checkpoint: '#EC4899',
  applied: '#10B981', 
  interview: '#7C3AED', 
  updated: '#3B82F6' 
};
const DOT_ICONS = { 
  resume_save: FileText, 
  resume_edit: FileText, 
  template_change: FileText, 
  export_pdf: FileText, 
  todo_complete: CheckCircle2, 
  deadline_done: Bell, 
  checkpoint: Info,
  applied: Briefcase, 
  interview: Calendar, 
  updated: RefreshCw 
};

// ══════════════════════════════════════════════════════════════
//  SMALL REUSABLE BITS
// ══════════════════════════════════════════════════════════════

const PanelCard = ({ children, style }) => (
  <div style={{
    background: 'var(--bg-panel)', border: '1px solid var(--border-color)',
    borderRadius: 10, padding: 20, ...style
  }}>{children}</div>
);

const SectionLabel = ({ children, icon: Icon, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
      {Icon && <Icon size={14} />}{children}
    </span>
    {right}
  </div>
);

const Badge = ({ text }) => {
  const isToday = text === 'TODAY';
  const isTomorrow = text === 'TOMORROW';
  const isOverdue = text === 'OVERDUE';
  
  // Try to format date strings like "14-10-2023" into "Oct 14"
  let displayText = text;
  if (text.includes('-') && text.split('-').length === 3) {
    const [d, m, y] = text.split('-');
    const month = MONTHS[parseInt(m) - 1]?.slice(0, 3);
    if (month) displayText = `${month} ${d}`;
  }

  const bg = isOverdue ? 'rgba(239,68,68,0.18)' : isToday ? 'rgba(239,68,68,0.12)' : isTomorrow ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.06)';
  const color = isOverdue ? '#EF4444' : isToday ? '#EF4444' : isTomorrow ? '#7C3AED' : 'var(--text-faint)';
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: bg, color, textTransform: 'uppercase' }}>{displayText}</span>;
};

// ══════════════════════════════════════════════════════════════
//  ADD EVENT MODAL
// ══════════════════════════════════════════════════════════════

function AddEventModal({ date, onClose, onAdd, onAddTodo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [addToTodo, setAddToTodo] = useState(false);
  const colors = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
  const [color, setColor] = useState(colors[0]);

  const handleAdd = () => {
    if (!title.trim()) return;
    const event = { id: `ev${Date.now()}`, date, title: title.trim(), description: description.trim(), color, time, deadline: deadline || undefined };
    onAdd(event);
    if (addToTodo && onAddTodo) {
      onAddTodo(title.trim(), `Event on ${date}${time ? ` at ${time}` : ''}`);
    }
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 28, width: 380, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>Add Event — {date}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title..."
          autoFocus className="sleek-input" style={{ marginBottom: 12 }}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }} />
        
        {/* Time input with prominent white clock icon */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input value={time} onChange={e => setTime(e.target.value)} type="time"
            className="sleek-input" style={{ paddingRight: 44 }} />
          <Clock size={20} color="#FFFFFF" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
        
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)..."
          className="sleek-textarea" rows={2} style={{ marginBottom: 12, resize: 'none' }} />

        {/* Deadline field */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Bell size={12} /> Deadline date <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>(optional — auto-adds to Upcoming Deadlines)</span>
          </label>
          <input value={deadline} onChange={e => setDeadline(e.target.value)} type="date"
            className="sleek-input" style={{ colorScheme: 'dark' }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Color</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {colors.map(c => (
              <button key={c} onClick={() => setColor(c)}
                style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                  boxShadow: color === c ? `0 0 0 2px var(--bg-panel), 0 0 0 4px ${c}` : 'none', transition: 'box-shadow 0.15s' }} />
            ))}
          </div>
        </div>

        {/* Add to Todo List checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={addToTodo} onChange={e => setAddToTodo(e.target.checked)}
            style={{ accentColor: '#7C3AED' }} />
          <ListChecks size={13} /> Add to Todo List
        </label>

        <button onClick={handleAdd}
          style={{ width: '100%', padding: '10px 0', borderRadius: 6, border: 'none', background: 'var(--accent)', color: 'var(--bg-app)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Add Event
        </button>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ADD TODO INLINE
// ══════════════════════════════════════════════════════════════

function AddTodoInline({ onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [linkedTo, setLinkedTo] = useState('');
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
      style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New task..."
          autoFocus className="sleek-input" style={{ padding: '8px 12px', fontSize: 13 }}
          onKeyDown={e => { if (e.key === 'Enter' && title.trim()) { onAdd(title.trim(), linkedTo.trim()); setTitle(''); setLinkedTo(''); } if (e.key === 'Escape') onCancel(); }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Link size={12} color="var(--text-faint)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={linkedTo} onChange={e => setLinkedTo(e.target.value)} placeholder="Linked to... (e.g. GlobalTech)"
              className="sleek-input" style={{ padding: '7px 12px 7px 28px', fontSize: 12 }} />
          </div>
          <button onClick={() => { if (title.trim()) { onAdd(title.trim(), linkedTo.trim()); setTitle(''); setLinkedTo(''); } }}
            style={{ background: 'var(--accent)', color: 'var(--bg-app)', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
//  EXPANDABLE ACTIVITY CARD (Google Calendar style)
// ══════════════════════════════════════════════════════════════

function ActivityExpandCard({ activity: a, DotIcon, color, index }) {
  const [expanded, setExpanded] = useState(false);
  const isTruncated = (a.title || '').length > 32 || (a.detail || '').length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.25 }}
      onClick={() => isTruncated && setExpanded(!expanded)}
      style={{
        background: expanded ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: `1px solid ${expanded ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
        borderRadius: 10, padding: expanded ? '12px 14px' : '6px 8px',
        cursor: isTruncated ? 'pointer' : 'default',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <DotIcon size={13} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.3,
            whiteSpace: expanded ? 'normal' : 'nowrap', overflow: expanded ? 'visible' : 'hidden',
            textOverflow: expanded ? 'unset' : 'ellipsis'
          }}>{a.title}</div>
          {!expanded && <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1 }}>{timeAgo(a.timestamp)}</div>}
        </div>
        {isTruncated && (
          <ChevronDown size={14} color="var(--text-faint)"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginTop: 10, paddingLeft: 38 }}
          >
            {a.detail && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, lineHeight: 1.5 }}>
                {a.detail}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                background: `${color}15`, color: color, textTransform: 'uppercase'
              }}>
                {a.type?.replace(/_/g, ' ') || 'activity'}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{timeAgo(a.timestamp)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN PIPELINE DASHBOARD
// ══════════════════════════════════════════════════════════════

export default function PipelineDashboard() {
  const saved = loadData();
  const [activities, setActivities] = useState(getActivities().slice(0, 3));
  const [deadlines, setDeadlines] = useState(saved?.deadlines || DEFAULT_DEADLINES);
  const [todos, setTodos] = useState(saved?.todos || DEFAULT_TODOS);
  const [events, setEvents] = useState(saved?.events || DEFAULT_EVENTS);
  const [addingTodo, setAddingTodo] = useState(false);
  const [dismissedEventDeadlines, setDismissedEventDeadlines] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dismissed-event-deadlines') || '[]'); } catch { return []; }
  });

  // First-time hint — dismiss after first deadline completion
  const [showDeadlineHint, setShowDeadlineHint] = useState(() => {
    return !localStorage.getItem('deadline-hint-dismissed');
  });

  const [eventDetail, setEventDetail] = useState(null);
  const notifiedRef = useRef(new Set(JSON.parse(localStorage.getItem('notified-events') || '[]')));

  // Sync recent activity
  useEffect(() => {
    const refresh = () => setActivities(getActivities().slice(0, 3));
    window.addEventListener('activity-updated', refresh);
    return () => window.removeEventListener('activity-updated', refresh);
  }, []);

  // Calendar state
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calView, setCalView] = useState('Month');
  const [eventModal, setEventModal] = useState(null);

  // All events are local only
  const allEvents = events;

  // ── EVENT NOTIFICATION SYSTEM ──
  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkNotifications = () => {
      const nowCheck = new Date();
      const nowH = String(nowCheck.getHours()).padStart(2, '0');
      const nowM = String(nowCheck.getMinutes()).padStart(2, '0');
      const nowTime = `${nowH}:${nowM}`;
      const todayISO = fmt(nowCheck.getFullYear(), nowCheck.getMonth(), nowCheck.getDate());

      events.forEach(ev => {
        if (ev.time && ev.date === todayISO && ev.time === nowTime && !notifiedRef.current.has(ev.id)) {
          notifiedRef.current.add(ev.id);
          localStorage.setItem('notified-events', JSON.stringify([...notifiedRef.current]));

          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`⏰ ${ev.title}`, {
              body: ev.description || `Scheduled for ${ev.time}`,
              icon: '🔔',
              tag: ev.id
            });
          }

          // In-app toast notification
          const toast = document.createElement('div');
          toast.className = 'event-notification-toast';
          toast.innerHTML = `<div style="display:flex;align-items:center;gap:10px"><span style="font-size:20px">🔔</span><div><strong>${ev.title}</strong><br/><span style="font-size:11px;opacity:0.7">${ev.description || 'Event is now!'}</span></div></div>`;
          Object.assign(toast.style, {
            position: 'fixed', bottom: '24px', right: '24px', background: '#7C3AED',
            color: '#fff', padding: '16px 20px', borderRadius: '12px', zIndex: '99999',
            boxShadow: '0 12px 40px rgba(124,58,237,0.4)', fontFamily: 'Inter, sans-serif',
            fontSize: '13px', animation: 'slideInRight 0.4s ease, fadeOut 0.5s ease 4.5s forwards',
            cursor: 'pointer', maxWidth: '320px'
          });
          toast.onclick = () => toast.remove();
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 5000);
        }
      });
    };

    const interval = setInterval(checkNotifications, 15000); // Check every 15 seconds
    checkNotifications(); // Check immediately on mount
    return () => clearInterval(interval);
  }, [events]);

  // Persist & notify Activity tracker
  useEffect(() => {
    saveData({ activities, deadlines, todos, events });
    window.dispatchEvent(new CustomEvent('pipeline-updated'));
  }, [activities, deadlines, todos, events]);

  // Backfill existing checked tasks/deadlines to Activity log
  useEffect(() => {
    const log = getActivities();
    saved?.todos?.filter(t => t.checked).forEach(todo => {
      const title = todoToPastTense(todo.title);
      if (!log.some(a => a.type === 'todo_complete' && a.title === title)) {
        logActivity({ type: 'todo_complete', title, detail: todo.subtitle || '' });
      }
    });
    saved?.deadlines?.filter(d => d.done).forEach(deadline => {
      const title = `Completed: ${deadline.title}`;
      if (!log.some(a => a.type === 'deadline_done' && a.title === title)) {
        logActivity({ type: 'deadline_done', title, detail: deadline.company });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };
  const goToday = () => { setCalYear(now.getFullYear()); setCalMonth(now.getMonth()); };

  const toggleTodo = id => {
    const todo = todos.find(x => x.id === id);
    if (todo) {
      if (!todo.checked) {
        logActivity({ type: 'todo_complete', title: todoToPastTense(todo.title), detail: todo.subtitle || '' });
      } else {
        removeActivityByTitle(todoToPastTense(todo.title));
      }
    }
    setTodos(t => t.map(x => x.id === id ? { ...x, checked: !x.checked } : x));
  };

  const addTodo = (title, linkedTo) => {
    const subtitle = linkedTo ? `Linked to: ${linkedTo}` : 'Just added';
    setTodos(t => [...t, { id: `t${Date.now()}`, title, subtitle, linkedTo, checked: false, priority: 'normal' }]);
    setAddingTodo(false);
  };
  const addTodoFromEvent = (title, subtitle) => {
    setTodos(t => [...t, { id: `t${Date.now()}`, title, subtitle, checked: false, priority: 'normal' }]);
  };
  const addEvent = ev => { setEvents(e => [...e, ev]); };

  // Persist dismissed event deadline IDs
  useEffect(() => {
    localStorage.setItem('dismissed-event-deadlines', JSON.stringify(dismissedEventDeadlines));
  }, [dismissedEventDeadlines]);

  // Derive deadlines from events that have a deadline date set
  const eventDeadlines = allEvents
    .filter(ev => ev.deadline && !dismissedEventDeadlines.includes(ev.id))
    .map(ev => ({
      id: `evdl-${ev.id}`,
      eventId: ev.id,
      title: ev.title,
      company: ev.description || `Event on ${ev.date}`,
      urgency: deadlineUrgency(ev.deadline),
      done: false,
      fromEvent: true
    }));
  // Merge: manual deadlines first, then event-derived ones (avoid duplicates by id)
  const allDeadlines = [
    ...deadlines,
    ...eventDeadlines.filter(ed => !deadlines.some(d => d.id === ed.id))
  ];
  
  const markDeadline = id => {
    const deadline = deadlines.find(x => x.id === id);
    if (deadline) {
      if (!deadline.done) {
        logActivity({
          type: 'deadline_done',
          title: `Completed: ${deadline.title}`,
          detail: deadline.company
        });
      } else {
        removeActivityByTitle(`Completed: ${deadline.title}`);
      }
    }
    setDeadlines(d => d.map(x => x.id === id ? { ...x, done: !x.done } : x));
    // Dismiss first-time hint
    if (showDeadlineHint) {
      setShowDeadlineHint(false);
      localStorage.setItem('deadline-hint-dismissed', 'true');
    }
  };

  // Mark an event-derived deadline as completed
  const markEventDeadline = (deadlineItem) => {
    logActivity({
      type: 'deadline_done',
      title: `Completed: ${deadlineItem.title}`,
      detail: deadlineItem.company
    });
    // Add to dismissed list so it won't reappear
    setDismissedEventDeadlines(prev => [...prev, deadlineItem.eventId]);
    // Dismiss first-time hint
    if (showDeadlineHint) {
      setShowDeadlineHint(false);
      localStorage.setItem('deadline-hint-dismissed', 'true');
    }
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const calCells = [];
  for (let i = 0; i < totalCells; i++) {
    const day = i - firstDay + 1;
    calCells.push(day >= 1 && day <= daysInMonth ? day : null);
  }

  const todayStr = fmt(now.getFullYear(), now.getMonth(), now.getDate());

  // Stagger variants
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

  return (
    <div style={{ padding: '28px 28px', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>Pipeline Insights</h1>
      </motion.div>

      {/* 3-COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 240px', gap: 20, alignItems: 'start', minWidth: 0 }}>

        {/* ─── LEFT COLUMN ─── */}
        <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* RECENT ACTIVITY */}
          <motion.div variants={fadeUp}>
            <PanelCard>
              <SectionLabel icon={Clock}>Recent Activity</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activities.length > 0 ? activities.map((a, i) => {
                  const DotIcon = DOT_ICONS[a.type] || FileText;
                  const color = DOT_COLORS[a.type] || '#3B82F6';
                  return (
                    <ActivityExpandCard key={a.id || i} activity={a} DotIcon={DotIcon} color={color} index={i} />
                  );
                }) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No recent activity.</div>
                )}
              </div>
            </PanelCard>
          </motion.div>

          {/* UPCOMING DEADLINES — merges manual deadlines + event-derived deadlines */}
          <motion.div variants={fadeUp}>
            <PanelCard>
              <SectionLabel icon={Bell}>Upcoming Deadlines</SectionLabel>

              {/* First-time user hint */}
              <AnimatePresence>
                {showDeadlineHint && allDeadlines.filter(d => !d.done).length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8,
                      background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)'
                    }}>
                      <Info size={13} color="#7C3AED" />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        <strong style={{ color: '#7C3AED' }}>Tip:</strong> Click any deadline card to mark it as completed
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); setShowDeadlineHint(false); localStorage.setItem('deadline-hint-dismissed', 'true'); }}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: 2 }}>
                        <X size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="popLayout">
                {allDeadlines.filter(d => !d.done).map(d => (
                  <motion.div key={d.id} layout
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.15, rotate: 3, y: -20, transition: { duration: 0.35, ease: [0.36, 1.2, 0.5, 1] } }}
                    onClick={() => d.fromEvent ? markEventDeadline(d) : markDeadline(d.id)}
                    style={{ background: 'var(--bg-input)', border: `1px solid ${d.fromEvent ? 'rgba(124,58,237,0.2)' : 'var(--border-color)'}`, borderRadius: 8, padding: '14px 16px',
                      marginBottom: 10, cursor: 'pointer', transition: 'border-color 0.15s', position: 'relative' }}
                    whileHover={{ borderColor: 'rgba(255,255,255,0.2)', scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{d.title}</span>
                      <Badge text={d.urgency} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{d.company}</div>
                    {d.fromEvent && (
                      <div style={{ fontSize: 10, color: '#7C3AED', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={10} /> from calendar event
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {allDeadlines.filter(d => !d.done).length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center', padding: '12px 0' }}>No upcoming deadlines — all clear! ✨</div>
              )}
            </PanelCard>
          </motion.div>
        </motion.div>

        {/* ─── CENTER: CALENDAR ─── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}>
          <PanelCard style={{ padding: 24 }}>

            {/* Calendar Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                  {MONTHS[calMonth]} {calYear}
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={prevMonth} style={navBtnStyle}><ChevronLeft size={16} /></button>
                  <button onClick={goToday} style={{ ...navBtnStyle, fontSize: 12, padding: '4px 10px', fontFamily: 'inherit' }}>Today</button>
                  <button onClick={nextMonth} style={navBtnStyle}><ChevronRight size={16} /></button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['Month', 'Week'].map(v => (
                  <button key={v} onClick={() => setCalView(v)}
                    style={{
                      padding: '5px 14px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                      fontFamily: 'inherit', transition: 'all 0.15s',
                      background: calView === v ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: calView === v ? 'var(--text-main)' : 'var(--text-faint)'
                    }}>{v}</button>
                ))}
              </div>
            </div>

            {/* Day Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: 4 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', padding: '8px 0', letterSpacing: '0.04em' }}>{d}</div>
              ))}
            </div>

            {/* Day Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
              {calCells.map((day, i) => {
                if (day === null) return <div key={i} style={{ height: 80 }} />;
                const dateStr = fmt(calYear, calMonth, day);
                const isToday = dateStr === todayStr;
                const dayEvents = allEvents.filter(e => e.date === dateStr);
                const visibleEvents = dayEvents.slice(0, 2);
                const overflow = dayEvents.length - 2;

                return (
                  <motion.div key={i} whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                    onClick={() => setEventModal(dateStr)}
                    style={{ height: 80, padding: '4px 3px', cursor: 'pointer', borderRadius: 6, transition: 'background 0.15s', position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: isToday ? 700 : 400, margin: '0 auto 2px',
                      background: isToday ? '#7C3AED' : 'transparent',
                      color: isToday ? '#FFF' : 'var(--text-muted)'
                    }}>{day}</div>
                    {visibleEvents.map(ev => (
                      <motion.div key={ev.id} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.3 }}
                        onClick={e => { e.stopPropagation(); setEventDetail(ev); }}
                        style={{ background: ev.color, borderRadius: 3, padding: '1px 4px', fontSize: 8, color: '#FFF',
                          fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transformOrigin: 'left',
                          marginBottom: 1, lineHeight: 1.4, cursor: 'pointer' }}>
                        {ev.time ? `${ev.time} ` : ''}{ev.title}
                      </motion.div>
                    ))}
                    {overflow > 0 && (
                      <div style={{ fontSize: 8, color: 'var(--text-faint)', fontWeight: 600, textAlign: 'center', marginTop: 1 }}>
                        +{overflow} more
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>



          </PanelCard>
        </motion.div>

        {/* ─── RIGHT COLUMN ─── */}
        <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* TO-DO LIST */}
          <motion.div variants={fadeUp}>
            <PanelCard>
              <SectionLabel icon={CheckCircle2}
                right={
                  <button onClick={() => setAddingTodo(true)}
                    style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: 'var(--bg-app)',
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={14} />
                  </button>
                }>
                To-Do List
              </SectionLabel>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <AnimatePresence mode="popLayout">
                  {todos.map(t => (
                    <motion.div key={t.id} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                      onClick={() => toggleTodo(t.id)}
                      style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 8,
                        cursor: 'pointer', transition: 'background 0.15s', background: 'transparent' }}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>

                      {/* Checkbox */}
                      <motion.div whileTap={{ scale: 1.25 }}
                        style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                          background: t.checked ? '#7C3AED' : 'transparent',
                          border: t.checked ? '2px solid #7C3AED' : '2px solid var(--text-faint)'
                        }}>
                        {t.checked && <Check size={12} color="#FFF" strokeWidth={3} />}
                      </motion.div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)',
                          textDecoration: t.checked ? 'line-through' : 'none', opacity: t.checked ? 0.5 : 1, transition: 'all 0.2s' }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{t.subtitle}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {addingTodo && <AddTodoInline onAdd={addTodo} onCancel={() => setAddingTodo(false)} />}
                </AnimatePresence>
              </div>
            </PanelCard>
          </motion.div>


        </motion.div>
      </div>

      {/* EVENT MODAL */}
      <AnimatePresence>
        {eventModal && <AddEventModal date={eventModal} onClose={() => setEventModal(null)} onAdd={addEvent} onAddTodo={addTodoFromEvent} />}
      </AnimatePresence>

      {/* EVENT DETAIL POPOVER */}
      <AnimatePresence>
        {eventDetail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEventDetail(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ scale: 0.92, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 10 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: eventDetail.color, flexShrink: 0 }} />
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{eventDetail.title}</h3>
                </div>
                <button onClick={() => setEventDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {eventDetail.date}{eventDetail.time ? ` at ${eventDetail.time}` : ' (All day)'}
              </div>
              {eventDetail.description && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6, padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 6 }}>
                  {eventDetail.description}
                </div>
              )}
              {eventDetail.deadline && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 12px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 6 }}>
                  <Bell size={13} color="#7C3AED" />
                  <span style={{ fontSize: 12, color: 'var(--text-main)', fontWeight: 500 }}>Deadline: {eventDetail.deadline}</span>
                  <Badge text={deadlineUrgency(eventDetail.deadline)} />
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const navBtnStyle = {
  background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-muted)',
  borderRadius: 5, padding: '4px 8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center'
};
