import React, { useMemo } from 'react';
import {
  AlertTriangle, CheckCircle2, Lightbulb, SpellCheck,
  Target, BookOpen, Zap, Shield, TrendingUp, X
} from 'lucide-react';

// ═══════════════════════════════════════════════
//  DICTIONARIES & RULES
// ═══════════════════════════════════════════════

const COMMON_MISSPELLINGS = {
  'teh': 'the', 'recieve': 'receive', 'occured': 'occurred', 'seperate': 'separate',
  'definately': 'definitely', 'accomodate': 'accommodate', 'occurence': 'occurrence',
  'managment': 'management', 'enviroment': 'environment', 'developement': 'development',
  'acheivement': 'achievement', 'acheive': 'achieve', 'beleive': 'believe',
  'buisness': 'business', 'calender': 'calendar', 'collegue': 'colleague',
  'commitee': 'committee', 'concensus': 'consensus', 'dilemna': 'dilemma',
  'existance': 'existence', 'foriegn': 'foreign', 'goverment': 'government',
  'harrass': 'harass', 'independant': 'independent', 'knowlege': 'knowledge',
  'liason': 'liaison', 'maintainance': 'maintenance', 'millenium': 'millennium',
  'neccessary': 'necessary', 'noticable': 'noticeable', 'parliment': 'parliament',
  'persistant': 'persistent', 'posession': 'possession', 'priviledge': 'privilege',
  'profesional': 'professional', 'recomend': 'recommend', 'refered': 'referred',
  'relevent': 'relevant', 'resistence': 'resistance', 'responsibilty': 'responsibility',
  'succesful': 'successful', 'suprise': 'surprise', 'threshhold': 'threshold',
  'untill': 'until', 'wierd': 'weird', 'whereever': 'wherever',
  'responsable': 'responsible', 'excercise': 'exercise', 'proffesional': 'professional',
  'strenght': 'strength', 'techincal': 'technical', 'manageing': 'managing',
  'analsis': 'analysis', 'implmentation': 'implementation', 'collaboraton': 'collaboration',
};

const SLANG_WORDS = {
  'gonna': 'going to', 'wanna': 'want to', 'gotta': 'have to', 'kinda': 'kind of',
  'sorta': 'sort of', 'dunno': 'do not know', 'ain\'t': 'is not / are not',
  'y\'all': 'you all', 'gonna': 'going to', 'lemme': 'let me', 'gimme': 'give me',
  'cuz': 'because', 'coz': 'because', 'tbh': 'to be honest', 'imo': 'in my opinion',
  'fyi': 'for your information', 'asap': 'as soon as possible',
  'lol': '(remove)', 'lmao': '(remove)', 'omg': '(remove)', 'wtf': '(remove)',
  'btw': 'by the way', 'ngl': '(remove)', 'fr': '(remove)',
  'stuff': 'materials/resources', 'things': 'elements/components', 'a lot': 'significantly/extensively',
  'got': 'obtained/received', 'did': 'executed/performed',
  'cool': 'effective/impressive', 'awesome': 'exceptional/outstanding',
  'nice': 'commendable/favorable', 'big': 'substantial/significant',
  'helped': 'facilitated/contributed to', 'worked on': 'contributed to/developed',
};

const HOOK_WORDS = [
  'Spearheaded', 'Orchestrated', 'Pioneered', 'Championed', 'Architected',
  'Engineered', 'Optimized', 'Streamlined', 'Transformed', 'Accelerated',
  'Established', 'Cultivated', 'Revitalized', 'Maximized', 'Leveraged',
  'Initiated', 'Implemented', 'Designed', 'Developed', 'Led',
  'Delivered', 'Reduced', 'Increased', 'Generated', 'Improved',
  'Automated', 'Resolved', 'Collaborated', 'Mentored', 'Negotiated',
];

const WEAK_VERBS = [
  'helped', 'assisted', 'worked', 'did', 'made', 'got', 'used', 'tried',
  'handled', 'was responsible for', 'participated in', 'involved in',
];

const ATS_SECTION_SUGGESTIONS = {
  chronological: {
    required: ['summary', 'experience', 'education', 'skills'],
    optional: ['certifications', 'projects', 'awards'],
    order: 'Summary → Experience → Education → Skills',
    tips: [
      'Keep your resume to 1-2 pages (ATS standard)',
      'Use reverse chronological order for experience',
      'Include measurable metrics in bullet points (numbers, percentages, dollar amounts)',
      'Each bullet should start with a strong action verb',
    ]
  },
  functional: {
    required: ['summary', 'skills', 'experience'],
    optional: ['projects', 'certifications', 'volunteer'],
    order: 'Summary → Skills → Experience → Education',
    tips: [
      'Lead with a strong skills section grouped by category',
      'Include a brief work history section even in functional format (ATS needs dates)',
      'Highlight transferable skills relevant to target role',
      'Include keywords from the job description',
    ]
  },
  combinational: {
    required: ['summary', 'skills', 'experience', 'education'],
    optional: ['certifications', 'projects', 'awards'],
    order: 'Summary → Skills → Experience → Education',
    tips: [
      'Balance skills showcase with chronological work history',
      'Group skills into relevant categories',
      'Back up skills with specific achievements in experience',
      'Ideal for mid-career professionals',
    ]
  },
};

// ═══════════════════════════════════════════════
//  ANALYSIS ENGINE
// ═══════════════════════════════════════════════

function analyzeText(text) {
  if (!text || typeof text !== 'string') return { spelling: [], slang: [], weakVerbs: [] };
  const words = text.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/);
  
  const spelling = [];
  const slang = [];
  const weakVerbs = [];

  words.forEach(word => {
    if (COMMON_MISSPELLINGS[word]) {
      spelling.push({ word, suggestion: COMMON_MISSPELLINGS[word] });
    }
    if (SLANG_WORDS[word]) {
      slang.push({ word, suggestion: SLANG_WORDS[word] });
    }
  });

  // Check for weak verb phrases
  const lowerText = text.toLowerCase();
  WEAK_VERBS.forEach(verb => {
    if (lowerText.includes(verb)) {
      weakVerbs.push({ word: verb, suggestion: `Use a stronger verb like: ${getAlternativeVerb(verb)}` });
    }
  });

  return { spelling, slang, weakVerbs };
}

function getAlternativeVerb(weak) {
  const map = {
    'helped': 'Facilitated, Enabled, Contributed to',
    'assisted': 'Supported, Facilitated, Advised',
    'worked': 'Collaborated, Developed, Executed',
    'did': 'Executed, Delivered, Accomplished',
    'made': 'Created, Developed, Produced',
    'got': 'Achieved, Obtained, Secured',
    'used': 'Leveraged, Utilized, Applied',
    'tried': 'Attempted, Pursued, Endeavored',
    'handled': 'Managed, Oversaw, Coordinated',
    'was responsible for': 'Spearheaded, Led, Directed',
    'participated in': 'Contributed to, Engaged in, Drove',
    'involved in': 'Led, Contributed to, Drove',
  };
  return map[weak] || 'Spearheaded, Led, Drove';
}

function analyzeBulletLength(bullets) {
  const issues = [];
  bullets.forEach((b, i) => {
    if (!b || !b.trim()) return;
    const words = b.trim().split(/\s+/).length;
    if (words < 6) {
      issues.push({ index: i, text: b, issue: 'Too short — aim for 10-20 words. Add metrics or context.', severity: 'warning' });
    } else if (words > 30) {
      issues.push({ index: i, text: b, issue: 'Too long — ATS scanners may truncate. Keep under 25 words.', severity: 'warning' });
    }
    // Check if starts with a strong verb
    const firstWord = b.trim().split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '');
    if (firstWord && !HOOK_WORDS.some(h => h.toLowerCase() === firstWord.toLowerCase())) {
      const suggested = HOOK_WORDS.slice(0, 3).join(', ');
      issues.push({ index: i, text: b, issue: `Consider starting with a power verb (e.g., ${suggested})`, severity: 'tip' });
    }
    // Check for metrics
    if (!/\d/.test(b)) {
      issues.push({ index: i, text: b, issue: 'Add quantifiable metrics (%, $, numbers) to strengthen impact.', severity: 'tip' });
    }
  });
  return issues;
}

// ═══════════════════════════════════════════════
//  FULL RESUME ANALYSIS
// ═══════════════════════════════════════════════

export function analyzeResume(data) {
  const results = {
    errors: [],      // Must fix
    warnings: [],    // Should fix
    suggestions: [], // Nice to have
    score: 100,
  };

  const { personal, experience, education, skills, customSections, settings } = data;
  const format = settings?.formatId || 'chronological';
  const atsRules = ATS_SECTION_SUGGESTIONS[format];

  // ─── PERSONAL SECTION CHECKS ───
  if (!personal.name?.trim()) results.errors.push({ section: 'Personal', message: 'Full name is required' });
  if (!personal.email?.trim()) results.errors.push({ section: 'Personal', message: 'Email address is required for ATS' });
  if (!personal.phone?.trim()) results.warnings.push({ section: 'Personal', message: 'Phone number is recommended' });
  if (!personal.location?.trim()) results.warnings.push({ section: 'Personal', message: 'Location is recommended (City, State format)' });
  if (!personal.summary?.trim()) {
    results.warnings.push({ section: 'Personal', message: 'Professional summary is highly recommended — it\'s the first thing recruiters read' });
  } else if (personal.summary.split(/\s+/).length < 15) {
    results.warnings.push({ section: 'Personal', message: 'Summary is too short. Aim for 2-3 sentences highlighting your unique value.' });
  } else if (personal.summary.split(/\s+/).length > 60) {
    results.warnings.push({ section: 'Personal', message: 'Summary is too long. Keep it to 2-3 concise sentences.' });
  }

  // Analyze personal text for spelling/slang
  Object.entries(personal).forEach(([field, val]) => {
    if (typeof val !== 'string') return;
    const analysis = analyzeText(val);
    analysis.spelling.forEach(s => results.errors.push({ section: 'Personal', message: `Spelling: "${s.word}" → "${s.suggestion}" in ${field}` }));
    analysis.slang.forEach(s => results.warnings.push({ section: 'Personal', message: `Informal language: "${s.word}" → "${s.suggestion}" in ${field}` }));
  });

  // ─── EXPERIENCE CHECKS ───
  if (!experience || experience.length === 0) {
    results.warnings.push({ section: 'Experience', message: 'Add at least one work experience entry' });
  } else {
    experience.forEach((exp, i) => {
      const label = exp.company || `Experience ${i + 1}`;
      if (!exp.company?.trim()) results.errors.push({ section: 'Experience', message: `Company name is missing for entry ${i + 1}` });
      if (!exp.role?.trim()) results.errors.push({ section: 'Experience', message: `Job role/title is missing for ${label}` });
      if (!exp.duration?.trim()) results.warnings.push({ section: 'Experience', message: `Duration is missing for ${label} — ATS requires dates` });
      
      if (!exp.bullets || exp.bullets.filter(b => b.trim()).length === 0) {
        results.warnings.push({ section: 'Experience', message: `Add bullet points to ${label} — recruiters expect 3-5 bullets per role` });
      } else {
        const activeBullets = exp.bullets.filter(b => b.trim());
        if (activeBullets.length < 2) {
          results.suggestions.push({ section: 'Experience', message: `${label}: Add more bullet points (3-5 recommended)` });
        }
        
        // Analyze each bullet
        const bulletIssues = analyzeBulletLength(activeBullets);
        bulletIssues.forEach(issue => {
          if (issue.severity === 'warning') {
            results.warnings.push({ section: 'Experience', message: `${label}: ${issue.issue}` });
          } else {
            results.suggestions.push({ section: 'Experience', message: `${label}: ${issue.issue}` });
          }
        });

        // Check bullet text for spelling/slang
        activeBullets.forEach(bullet => {
          const analysis = analyzeText(bullet);
          analysis.spelling.forEach(s => results.errors.push({ section: 'Experience', message: `Spelling in ${label}: "${s.word}" → "${s.suggestion}"` }));
          analysis.slang.forEach(s => results.warnings.push({ section: 'Experience', message: `Informal language in ${label}: "${s.word}" → "${s.suggestion}"` }));
          analysis.weakVerbs.forEach(s => results.suggestions.push({ section: 'Experience', message: `In ${label}: "${s.word}" — ${s.suggestion}` }));
        });
      }
    });
  }

  // ─── EDUCATION CHECKS ───
  if (atsRules.required.includes('education') && (!education || education.length === 0)) {
    results.suggestions.push({ section: 'Education', message: 'Consider adding your education — most ATS systems flag resumes without it' });
  }

  // ─── SKILLS CHECKS ───
  const totalSkills = (skills?.design?.length || 0) + (skills?.technical?.length || 0) + (skills?.soft?.length || 0);
  if (totalSkills === 0) {
    results.warnings.push({ section: 'Skills', message: 'Add skills — ATS systems match keywords from this section against job requirements' });
  } else if (totalSkills < 5) {
    results.suggestions.push({ section: 'Skills', message: 'Consider adding more skills (8-15 is ideal for ATS keyword matching)' });
  }

  // ─── FORMAT-SPECIFIC SUGGESTIONS ───
  atsRules.tips.forEach(tip => {
    results.suggestions.push({ section: 'ATS Tips', message: tip });
  });

  // Suggest optional sections
  atsRules.optional.forEach(sec => {
    const hasSection = customSections?.some(c => c.title?.toLowerCase().includes(sec));
    if (!hasSection) {
      results.suggestions.push({ section: 'Sections', message: `Consider adding a "${sec.charAt(0).toUpperCase() + sec.slice(1)}" section to strengthen your resume` });
    }
  });

  // ─── CALCULATE SCORE ───
  results.score = Math.max(0, 100 - (results.errors.length * 15) - (results.warnings.length * 5) - (results.suggestions.length * 1));

  return results;
}

// ═══════════════════════════════════════════════
//  SUGGESTIONS PANEL COMPONENT
// ═══════════════════════════════════════════════

const panelStyles = {
  container: {
    background: '#111113',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreCircle: (score) => ({
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: `3px solid ${score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    color: score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444',
  }),
  category: {
    padding: '12px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  item: {
    fontSize: 12,
    lineHeight: 1.6,
    padding: '6px 0',
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    color: '#A1A1AA',
  },
  dot: (color) => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
    marginTop: 6,
  }),
};

export function SuggestionsPanel({ data, isOpen, onClose }) {
  const analysis = useMemo(() => analyzeResume(data), [data]);

  if (!isOpen) return null;

  return (
    <div style={panelStyles.container}>
      {/* Header with Score */}
      <div style={panelStyles.header}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>Resume Analysis</div>
          <div style={{ fontSize: 11, color: '#71717A', marginTop: 2 }}>
            {analysis.errors.length} errors • {analysis.warnings.length} warnings • {analysis.suggestions.length} suggestions
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={panelStyles.scoreCircle(analysis.score)}>{analysis.score}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', padding: 4 }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Errors */}
      {analysis.errors.length > 0 && (
        <div style={panelStyles.category}>
          <div style={{ ...panelStyles.categoryTitle, color: '#EF4444' }}>
            <AlertTriangle size={13} /> Errors ({analysis.errors.length})
          </div>
          {analysis.errors.map((e, i) => (
            <div key={i} style={panelStyles.item}>
              <div style={panelStyles.dot('#EF4444')} />
              <div><span style={{ color: '#71717A', fontSize: 11 }}>{e.section}:</span> {e.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <div style={panelStyles.category}>
          <div style={{ ...panelStyles.categoryTitle, color: '#F59E0B' }}>
            <Shield size={13} /> Warnings ({analysis.warnings.length})
          </div>
          {analysis.warnings.map((w, i) => (
            <div key={i} style={panelStyles.item}>
              <div style={panelStyles.dot('#F59E0B')} />
              <div><span style={{ color: '#71717A', fontSize: 11 }}>{w.section}:</span> {w.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div style={panelStyles.category}>
          <div style={{ ...panelStyles.categoryTitle, color: '#3B82F6' }}>
            <Lightbulb size={13} /> Suggestions ({analysis.suggestions.length})
          </div>
          {analysis.suggestions.slice(0, 10).map((s, i) => (
            <div key={i} style={panelStyles.item}>
              <div style={panelStyles.dot('#3B82F6')} />
              <div><span style={{ color: '#71717A', fontSize: 11 }}>{s.section}:</span> {s.message}</div>
            </div>
          ))}
          {analysis.suggestions.length > 10 && (
            <div style={{ fontSize: 11, color: '#52525B', paddingTop: 4 }}>
              + {analysis.suggestions.length - 10} more suggestions
            </div>
          )}
        </div>
      )}

      {/* Power Verbs Reference */}
      <div style={panelStyles.category}>
        <div style={{ ...panelStyles.categoryTitle, color: '#10B981' }}>
          <Zap size={13} /> Power Verbs to Use
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          {HOOK_WORDS.slice(0, 15).map((word, i) => (
            <span key={i} style={{
              fontSize: 10, padding: '3px 8px', borderRadius: 4,
              background: 'rgba(16, 185, 129, 0.1)', color: '#10B981',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>{word}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SuggestionsPanel;
