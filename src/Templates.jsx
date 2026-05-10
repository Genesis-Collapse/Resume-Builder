import React from 'react';

// Default mock data for thumbnails
export const THUMBNAIL_DATA = {
  personal: {
    name: "Alex Morgan", title: "Product Designer",
    email: "alex@example.com", phone: "555-0192",
    location: "San Francisco, CA", linkedin: "linkedin.com/in/alexmorgan",
    website: "alexmorgan.design",
    summary: "Passionate designer building scalable, elegant systems with 5+ years of experience."
  },
  education: [
    { id: 'e1', institution: "Stanford University", degree: "B.S. Computer Science", year: "2018", gpa: "3.8" }
  ],
  experience: [
    { id: 'x1', role: "Senior Designer", company: "TechCorp", duration: "2020-Present", location: "SF, CA", bullets: ["Led major redesign cutting task time by 40%.", "Built component library used by 50+ engineers."] },
    { id: 'x2', role: "Designer", company: "StartupInc", duration: "2018-2020", location: "Remote", bullets: ["Built design system from scratch.", "Improved user onboarding flow by 25%."] }
  ],
  skills: { design: ["Figma", "Sketch"], technical: ["HTML", "CSS", "React"], soft: ["Leadership"] },
  customSections: [],
  settings: { formatId: 'chronological', accentColor: '#3B82F6', headerAlignment: 'left' }
};

// ═══════════════════════════════════════════════
//  SHARED HELPERS
// ═══════════════════════════════════════════════

const getAlign = (settings) => settings?.headerAlignment || 'left';

const SectionDivider = ({ color, style = 'line' }) => {
  if (style === 'thick') return <div style={{ borderBottom: `3px solid ${color}`, marginBottom: 14, marginTop: 4 }} />;
  return <div style={{ borderBottom: `1px solid #DDD`, marginBottom: 12, marginTop: 4 }} />;
};

const SkillsBlock = ({ skills, color, layout = 'inline' }) => {
  const allSkills = [
    ...(skills.design || []).map(s => ({ s, cat: 'Design' })),
    ...(skills.technical || []).map(s => ({ s, cat: 'Technical' })),
    ...(skills.soft || []).map(s => ({ s, cat: 'Soft Skills' })),
  ];
  const hasAny = allSkills.length > 0;
  if (!hasAny) return null;

  if (layout === 'grouped') {
    const cats = [
      { key: 'design', label: 'Design Tools', items: skills.design || [] },
      { key: 'technical', label: 'Technical Skills', items: skills.technical || [] },
      { key: 'soft', label: 'Soft Skills', items: skills.soft || [] },
    ].filter(c => c.items.length > 0);

    return (
      <div style={{ marginBottom: 16 }}>
        {cats.map(c => (
          <div key={c.key} style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 12, color: '#444' }}>{c.label}: </span>
            <span style={{ fontSize: 12, color: '#333' }}>{c.items.join(' • ')}</span>
          </div>
        ))}
      </div>
    );
  }

  // inline layout
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
      {allSkills.map((sk, i) => (
        <span key={i} style={{
          fontSize: 11, padding: '3px 10px', borderRadius: 3,
          background: `${color}12`, color: color, border: `1px solid ${color}30`,
          fontWeight: 500
        }}>{sk.s}</span>
      ))}
    </div>
  );
};

const EducationBlock = ({ education, color }) => {
  if (!education || education.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      {education.map((edu, i) => (
        <div key={edu.id || i} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <strong style={{ fontSize: 13 }}>{edu.institution}</strong>
            <span style={{ fontSize: 11, color: '#666' }}>{edu.year}</span>
          </div>
          <div style={{ fontSize: 12, color: '#555' }}>{edu.degree}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}</div>
        </div>
      ))}
    </div>
  );
};

const PhotoPlaceholder = ({ photo, color }) => (
  <div style={{ 
    width: 80, height: 80, borderRadius: 8, 
    border: photo ? 'none' : '2px dashed rgba(0,0,0,0.1)',
    background: photo ? 'none' : 'rgba(0,0,0,0.02)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0, position: 'relative'
  }}>
    {photo ? (
      <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : (
      <div style={{ textAlign: 'center', color: '#AAA', fontSize: 9, fontWeight: 600 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 4px', opacity: 0.5 }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        ADD PHOTO
      </div>
    )}
  </div>
);

const ProjectsBlock = ({ projects, color, fs = 12 }) => {
  if (!projects || projects.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      {projects.map((proj, i) => (
        <div key={proj.id || i} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <strong style={{ fontSize: fs + 1, color: 'inherit' }}>{proj.title}</strong>
            {(proj.linkUrl || proj.linkText) && (
              <a href={proj.linkUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ fontSize: fs - 1, color: color, textDecoration: 'none', fontWeight: 500 }}>
                {proj.linkText || proj.linkUrl || 'Link'}
              </a>
            )}
          </div>
          {proj.bullets && proj.bullets.filter(b => b.trim()).map((b, bi) => (
            <div key={bi} style={{ fontSize: fs, color: 'inherit', opacity: 0.85, paddingLeft: 14, position: 'relative', lineHeight: 1.6, marginBottom: 2, marginTop: 2 }}>
              <span style={{ position: 'absolute', left: 0, color }}>•</span> <span dangerouslySetInnerHTML={{__html: b}} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const ReferencesBlock = ({ references, color, fs = 12 }) => {
  if (!references || references.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      {references.map((ref, i) => (
        <div key={ref.id || i} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <strong style={{ fontSize: fs + 1 }}>{ref.name}</strong>
            {ref.relationship && <span style={{ fontSize: fs - 1, color, fontWeight: 500, fontStyle: 'italic' }}>{ref.relationship}</span>}
          </div>
          <div style={{ fontSize: fs, color: '#555', marginBottom: 2 }}>
            {ref.title}{ref.company ? ` at ${ref.company}` : ''}
          </div>
          <div style={{ fontSize: fs - 1, color: '#777' }}>
            {[ref.email, ref.phone].filter(Boolean).join(' • ')}
          </div>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════
//  MODERN TEMPLATE
// ═══════════════════════════════════════════════

export function ModernTemplate({ data }) {
  const { personal: p, experience, education, skills, projects, references, customSections, settings } = data;
  const color = settings?.accentColor || '#3B82F6';
  const align = getAlign(settings);
  const format = settings?.formatId || 'chronological';
  const fs = settings?.fontSize || 12;
  const sp = settings?.sectionSpacing || 16;
  const pad = settings?.pagePadding || 36;
  const font = settings?.fontFamily || 'Inter';
  const lh = settings?.lineHeight || 1.5;
  const ws = settings?.wordSpacing || 0;
  const ls = settings?.letterSpacing || 0;

  const renderExperience = () => {
    if (!experience || experience.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color, marginBottom: 10, letterSpacing: '0.05em' }}>
          {format === 'functional' ? 'Relevant Experience' : 'Professional Experience'}
        </div>
        <SectionDivider color={color} />
        {experience.map((exp, i) => (
          <div key={exp.id || i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: 13 }}>{exp.role}</strong>
              <span style={{ fontSize: 11, color: '#888' }}>{exp.duration}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 4 }}>
              {exp.company}{exp.location ? ` — ${exp.location}` : ''}
            </div>
            {exp.bullets && exp.bullets.filter(b => b.trim()).map((b, bi) => (
              <div key={bi} style={{ fontSize: 12, color: '#333', paddingLeft: 14, position: 'relative', lineHeight: 1.6, marginBottom: 2 }}>
                <span style={{ position: 'absolute', left: 0, color }}>•</span> {b}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    const hasSkills = (skills?.design?.length || 0) + (skills?.technical?.length || 0) + (skills?.soft?.length || 0) > 0;
    if (!hasSkills) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color, marginBottom: 10, letterSpacing: '0.05em' }}>Skills & Tools</div>
        <SectionDivider color={color} />
        {format === 'functional' ? (
          <SkillsBlock skills={skills} color={color} layout="grouped" />
        ) : (
          <SkillsBlock skills={skills} color={color} layout="inline" />
        )}
      </div>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color, marginBottom: 10, letterSpacing: '0.05em' }}>Education</div>
        <SectionDivider color={color} />
        <EducationBlock education={education} color={color} />
      </div>
    );
  };

  const renderCustom = () => {
    if (!customSections || customSections.length === 0) return null;
    return customSections.filter(s => s.title || s.content).map((sec, i) => (
      <div key={sec.id || i} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color, marginBottom: 10, letterSpacing: '0.05em' }}>{sec.title}</div>
        <SectionDivider color={color} />
        <div style={{ fontSize: fs, color: '#444', lineHeight: 1.6 }} className="rich-text-content" dangerouslySetInnerHTML={{ __html: sec.content }} />
      </div>
    ));
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color, marginBottom: 10, letterSpacing: '0.05em' }}>Projects</div>
        <SectionDivider color={color} />
        <ProjectsBlock projects={projects} color={color} fs={fs} />
      </div>
    );
  };

  const renderReferences = () => {
    if (!references || references.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color, marginBottom: 10, letterSpacing: '0.05em' }}>References</div>
        <SectionDivider color={color} />
        <ReferencesBlock references={references} color={color} fs={fs} />
      </div>
    );
  };

  // Order sections based on format
  const sections = format === 'functional'
    ? [renderSkills, renderProjects, renderExperience, renderEducation, renderReferences, renderCustom]
    : format === 'combinational'
    ? [renderSkills, renderExperience, renderProjects, renderEducation, renderReferences, renderCustom]
    : [renderExperience, renderProjects, renderEducation, renderSkills, renderReferences, renderCustom]; // chronological

  return (
    <div style={{
      background: '#FFF', color: '#111', fontFamily: `'${font}', 'Segoe UI', sans-serif`,
      padding: `${pad}px`, minHeight: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
      lineHeight: lh, fontSize: fs, wordSpacing: `${ws}px`, letterSpacing: `${ls}px`
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `3px solid ${color}`, paddingBottom: 14, marginBottom: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: align === 'center' ? 'center' : 'flex-end', flexDirection: align === 'right' ? 'row-reverse' : 'row'
      }}>
        <div style={{ textAlign: align, flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.03em' }}>{p.name}</div>
          {p.title && <div style={{ fontWeight: 600, fontSize: 13, color, marginTop: 2 }}>{p.title}</div>}
          <div style={{ fontSize: 11, color: '#888', marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
            {p.email && <span>{p.email}</span>}
            {p.phone && <><span>•</span><span>{p.phone}</span></>}
            {p.location && <><span>•</span><span>{p.location}</span></>}
            {p.linkedin && <><span>•</span><span>{p.linkedin}</span></>}
            {p.website && <><span>•</span><span>{p.website}</span></>}
          </div>
        </div>

      </div>

      {/* Summary */}
      {p.summary && (
        <div style={{ marginBottom: 18, fontSize: 12, color: '#444', lineHeight: 1.65, textAlign: align }}>
          {p.summary}
        </div>
      )}

      {/* Dynamic sections */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {sections.map((fn, i) => <React.Fragment key={i}>{fn()}</React.Fragment>)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  MINIMAL TEMPLATE
// ═══════════════════════════════════════════════

export function MinimalTemplate({ data }) {
  const { personal: p, experience, education, skills, projects, references, customSections, settings } = data;
  const color = settings?.accentColor || '#111';
  const align = getAlign(settings);
  const format = settings?.formatId || 'chronological';

  const renderExperience = () => {
    if (!experience || experience.length === 0) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#999', marginBottom: 12 }}>Experience</div>
        {experience.map((exp, i) => (
          <div key={exp.id || i} style={{ display: 'flex', marginBottom: 14, gap: 20 }}>
            <div style={{ width: 110, flexShrink: 0, fontSize: 11, color: '#999', paddingTop: 2 }}>{exp.duration}</div>
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: 13, marginBottom: 2 }}>{exp.role}</strong>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
              {exp.bullets && exp.bullets.filter(b => b.trim()).map((b, bi) => (
                <div key={bi} style={{ fontSize: 12, color: '#444', lineHeight: 1.6 }}>– {b}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    const hasSkills = (skills?.design?.length || 0) + (skills?.technical?.length || 0) + (skills?.soft?.length || 0) > 0;
    if (!hasSkills) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#999', marginBottom: 12 }}>Skills</div>
        <SkillsBlock skills={skills} color={color} layout="grouped" />
      </div>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#999', marginBottom: 12 }}>Education</div>
        <EducationBlock education={education} color={color} />
      </div>
    );
  };

  const renderCustom = () => {
    if (!customSections || customSections.length === 0) return null;
    return customSections.filter(s => s.title || s.content).map((sec, i) => (
      <div key={sec.id || i} style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#999', marginBottom: 12 }}>{sec.title}</div>
        <div style={{ fontSize: 12, color: '#444', lineHeight: 1.6 }} className="rich-text-content" dangerouslySetInnerHTML={{ __html: sec.content }} />
      </div>
    ));
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#999', marginBottom: 12 }}>Projects</div>
        <ProjectsBlock projects={projects} color={color} />
      </div>
    );
  };

  const renderReferences = () => {
    if (!references || references.length === 0) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#999', marginBottom: 12 }}>References</div>
        <ReferencesBlock references={references} color={color} />
      </div>
    );
  };

  const sections = format === 'functional'
    ? [renderSkills, renderProjects, renderExperience, renderEducation, renderReferences, renderCustom]
    : [renderExperience, renderProjects, renderEducation, renderSkills, renderReferences, renderCustom];

  return (
    <div style={{
      background: '#FFF', color: '#111', fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: '40px 44px', minHeight: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: align === 'right' ? 'row-reverse' : 'row', marginBottom: 6 }}>
        <div style={{ textAlign: align, flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color }}>{p.name}</div>
          {p.title && <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{p.title}</div>}
        </div>

      </div>
      <div style={{ textAlign: align, fontSize: 11, color: '#999', marginBottom: 24 }}>
        {[p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean).join(' • ')}
      </div>
      {p.summary && <div style={{ fontSize: 12, fontStyle: 'italic', textAlign: align, color: '#555', marginBottom: 24, lineHeight: 1.6 }}>"{p.summary}"</div>}
      <div style={{ borderTop: '1px solid #EEE', paddingTop: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {sections.map((fn, i) => <React.Fragment key={i}>{fn()}</React.Fragment>)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  EXECUTIVE TEMPLATE
// ═══════════════════════════════════════════════

export function ExecutiveTemplate({ data }) {
  const { personal: p, experience, education, skills, projects, references, customSections, settings } = data;
  const color = settings?.accentColor || '#1a1a2e';
  const align = getAlign(settings);
  const format = settings?.formatId || 'chronological';

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', borderBottom: `1px solid ${color}`, color, paddingBottom: 4, marginBottom: 12, letterSpacing: '0.06em' }}>
      {children}
    </div>
  );

  const renderExperience = () => {
    if (!experience || experience.length === 0) return null;
    return (
      <div style={{ marginBottom: 18 }}>
        <SectionTitle>Professional Experience</SectionTitle>
        {experience.map((exp, i) => (
          <div key={exp.id || i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: 14 }}>{exp.company}</strong>
              <span style={{ fontSize: 12, fontStyle: 'italic', color: '#666' }}>{exp.location}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontStyle: 'italic' }}>{exp.role}</span>
              <span style={{ fontSize: 11, color: '#888' }}>{exp.duration}</span>
            </div>
            {exp.bullets && exp.bullets.filter(b => b.trim()).map((b, bi) => (
              <div key={bi} style={{ fontSize: 12, color: '#333', lineHeight: 1.6, paddingLeft: 12 }}>• {b}</div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    const hasSkills = (skills?.design?.length || 0) + (skills?.technical?.length || 0) + (skills?.soft?.length || 0) > 0;
    if (!hasSkills) return null;
    return (
      <div style={{ marginBottom: 18 }}>
        <SectionTitle>Core Competencies</SectionTitle>
        <SkillsBlock skills={skills} color={color} layout="grouped" />
      </div>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <div style={{ marginBottom: 18 }}>
        <SectionTitle>Education</SectionTitle>
        <EducationBlock education={education} color={color} />
      </div>
    );
  };

  const renderCustom = () => {
    if (!customSections || customSections.length === 0) return null;
    return customSections.filter(s => s.title || s.content).map((sec, i) => (
      <div key={sec.id || i} style={{ marginBottom: 18 }}>
        <SectionTitle>{sec.title}</SectionTitle>
        <div style={{ fontSize: 12, color: '#444', lineHeight: 1.6 }} className="rich-text-content" dangerouslySetInnerHTML={{ __html: sec.content }} />
      </div>
    ));
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <div style={{ marginBottom: 18 }}>
        <SectionTitle>Key Projects</SectionTitle>
        <ProjectsBlock projects={projects} color={color} />
      </div>
    );
  };

  const renderReferences = () => {
    if (!references || references.length === 0) return null;
    return (
      <div style={{ marginBottom: 18 }}>
        <SectionTitle>References</SectionTitle>
        <ReferencesBlock references={references} color={color} />
      </div>
    );
  };

  const sections = format === 'functional'
    ? [renderSkills, renderProjects, renderExperience, renderEducation, renderReferences, renderCustom]
    : format === 'combinational'
    ? [renderSkills, renderExperience, renderProjects, renderEducation, renderReferences, renderCustom]
    : [renderExperience, renderProjects, renderEducation, renderSkills, renderReferences, renderCustom];

  return (
    <div style={{
      background: '#FAFAFA', color: '#222', fontFamily: 'Georgia, "Times New Roman", serif',
      padding: '40px 44px', minHeight: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box'
    }}>
      <div style={{ borderBottom: '2px solid #999', paddingBottom: 14, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: align === 'center' ? 'center' : 'flex-end', flexDirection: align === 'right' ? 'row-reverse' : 'row' }}>
        <div style={{ textAlign: align, flex: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color }}>{p.name}</div>
          {p.title && <div style={{ fontSize: 14, color: '#555', fontStyle: 'italic', marginTop: 2 }}>{p.title}</div>}
          <div style={{ fontSize: 11, color: '#888', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {[p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean).join(' | ')}
          </div>
        </div>

      </div>

      {p.summary && (
        <div style={{ marginBottom: 18, fontSize: 12, color: '#444', lineHeight: 1.65, textAlign: align }}>
          {p.summary}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {sections.map((fn, i) => <React.Fragment key={i}>{fn()}</React.Fragment>)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  PROFESSIONAL SIDEBAR TEMPLATE (Two-column with photo)
// ═══════════════════════════════════════════════

export function ProfessionalTemplate({ data }) {
  const { personal: p, experience, education, skills, projects, references, customSections, settings } = data;
  const color = settings?.accentColor || '#1B3A5C';
  const fs = settings?.fontSize || 12;
  const sp = settings?.sectionSpacing || 16;
  const pad = settings?.pagePadding || 0;
  const font = settings?.fontFamily || 'Inter';
  const format = settings?.formatId || 'chronological';

  const SideTitle = ({ children }) => (
    <div style={{ fontSize: fs + 2, fontWeight: 700, textTransform: 'uppercase', color: '#FFF', marginBottom: 10, letterSpacing: '0.06em', textAlign: 'center' }}>
      {children}
      <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.4)', margin: '6px auto 0' }} />
    </div>
  );

  const MainTitle = ({ children }) => (
    <div style={{ fontSize: fs + 2, fontWeight: 700, textTransform: 'uppercase', color: '#222', marginBottom: 8, borderBottom: `2px solid ${color}`, paddingBottom: 4, letterSpacing: '0.04em' }}>
      {children}
    </div>
  );

  const renderExperience = () => {
    if (!experience || experience.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <MainTitle>{format === 'functional' ? 'Relevant Experience' : 'Work Experience'}</MainTitle>
        {experience.map((exp, i) => (
          <div key={exp.id || i} style={{ marginBottom: sp - 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: fs + 1 }}>{exp.company}{exp.role ? `, ${exp.role}` : ''}</strong>
              <span style={{ fontSize: fs - 1, color: '#666' }}>{exp.duration}</span>
            </div>
            {exp.location && <div style={{ fontSize: fs - 1, color: '#888' }}>{exp.location}</div>}
            {exp.bullets?.filter(b => b.trim()).map((b, bi) => (
              <div key={bi} style={{ fontSize: fs, color: '#333', paddingLeft: 14, position: 'relative', lineHeight: 1.6, marginTop: 2 }}>
                <span style={{ position: 'absolute', left: 0 }}>•</span> {b}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <MainTitle>Education</MainTitle>
        {education.map((edu, i) => (
          <div key={edu.id || i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: fs }}>{edu.degree}</strong>
              <span style={{ fontSize: fs - 1, color: '#666' }}>{edu.year}</span>
            </div>
            <div style={{ fontSize: fs - 1, color: '#555' }}>{edu.institution}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderCustom = () => {
    if (!customSections || customSections.length === 0) return null;
    return customSections.filter(s => s.title || s.content).map((sec, i) => (
      <div key={sec.id || i} style={{ marginBottom: sp }}>
        <MainTitle>{sec.title}</MainTitle>
        <div style={{ fontSize: fs, color: '#444', lineHeight: 1.6 }} className="rich-text-content" dangerouslySetInnerHTML={{ __html: sec.content }} />
      </div>
    ));
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <MainTitle>Projects</MainTitle>
        <ProjectsBlock projects={projects} color={color} fs={fs} />
      </div>
    );
  };

  // Skills and strengths in sidebar
  const hasSkills = (skills?.design?.length || 0) + (skills?.technical?.length || 0) + (skills?.soft?.length || 0) > 0;

  return (
    <div style={{ display: 'flex', fontFamily: `'${font}', sans-serif`, minHeight: '100%', height: '100%', boxSizing: 'border-box', fontSize: fs, lineHeight: 1.5, background: '#FFF' }}>
      {/* SIDEBAR */}
      <div style={{ width: '32%', background: color, color: '#FFF', padding: `${pad}px ${pad * 0.6}px`, display: 'flex', flexDirection: 'column', gap: sp, flexShrink: 0 }}>
        {/* Photo */}
        <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: p.photo ? '4px solid rgba(255,255,255,0.3)' : '3px dashed rgba(255,255,255,0.3)', margin: '0 auto', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: p.photo ? 'none' : 'rgba(255,255,255,0.08)' }}>
          {p.photo ? (
            <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <div style={{ fontSize: 7, marginTop: 2, opacity: 0.7 }}>Add Photo</div>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: fs + 6, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{p.name}</div>
          {p.title && <div style={{ fontSize: fs, opacity: 0.85, marginTop: 4 }}>{p.title}</div>}
        </div>

        {/* Contact */}
        <div>
          <SideTitle>Contact</SideTitle>
          <div style={{ fontSize: fs - 1, lineHeight: 1.8 }}>
            {p.phone && <div>📞 {p.phone}</div>}
            {p.location && <div>📍 {p.location}</div>}
            {p.email && <div>✉ {p.email}</div>}
            {p.linkedin && <div>🔗 {p.linkedin}</div>}
          </div>
        </div>

        {/* Skills */}
        {hasSkills && (
          <div>
            <SideTitle>Skills</SideTitle>
            {[
              { label: 'Programming', items: skills.technical },
              { label: 'Design', items: skills.design },
            ].filter(c => c.items?.length > 0).map((c, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: fs - 1, fontWeight: 600 }}>• {c.label}: {c.items.join(', ')}</div>
              </div>
            ))}
          </div>
        )}

        {/* Soft Skills / Strengths */}
        {skills?.soft?.length > 0 && (
          <div>
            <SideTitle>Strengths</SideTitle>
            {skills.soft.map((s, i) => (
              <div key={i} style={{ fontSize: fs - 1, marginBottom: 4 }}>• {s}</div>
            ))}
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: `${pad}px ${pad * 0.8}px`, color: '#222', display: 'flex', flexDirection: 'column' }}>
        {/* Summary/Objective */}
        {p.summary && (
          <div style={{ marginBottom: sp }}>
            <MainTitle>Objective</MainTitle>
            <div style={{ fontSize: fs, color: '#444', lineHeight: 1.65 }}>{p.summary}</div>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {format === 'functional' ? (
            <>{renderEducation()}{renderProjects()}{renderExperience()}{renderCustom()}</>
          ) : (
            <>{renderExperience()}{renderProjects()}{renderEducation()}{renderCustom()}</>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  BOLD BAND TEMPLATE (Colored header band, single column, ATS-friendly)
// ═══════════════════════════════════════════════

export function BoldTemplate({ data }) {
  const { personal: p, experience, education, skills, projects, references, customSections, settings } = data;
  const color = settings?.accentColor || '#6B9AC4';
  const fs = settings?.fontSize || 12;
  const sp = settings?.sectionSpacing || 16;
  const pad = settings?.pagePadding || 36;
  const font = settings?.fontFamily || 'Inter';
  const format = settings?.formatId || 'chronological';
  const lightBg = `${color}18`;

  const SectionBar = ({ children }) => (
    <div style={{ background: lightBg, padding: '6px 12px', fontSize: fs + 1, fontWeight: 700, textTransform: 'uppercase', color: '#222', marginBottom: 10, borderLeft: `4px solid ${color}`, letterSpacing: '0.04em' }}>
      {children}
    </div>
  );

  const renderExperience = () => {
    if (!experience || experience.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <SectionBar>Work Experience</SectionBar>
        {experience.map((exp, i) => (
          <div key={exp.id || i} style={{ marginBottom: sp - 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: fs + 1 }}>{exp.role}{exp.company ? `, ${exp.company}` : ''}</strong>
              <span style={{ fontSize: fs - 1, color: color, fontWeight: 600 }}>{exp.duration}</span>
            </div>
            {exp.location && <div style={{ fontSize: fs - 1, color: '#888' }}>{exp.location}</div>}
            {exp.bullets?.filter(b => b.trim()).map((b, bi) => (
              <div key={bi} style={{ fontSize: fs, color: '#333', paddingLeft: 14, position: 'relative', lineHeight: 1.6, marginTop: 2 }}>
                <span style={{ position: 'absolute', left: 0 }}>•</span> {b}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <SectionBar>Education</SectionBar>
        {education.map((edu, i) => (
          <div key={edu.id || i} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ fontSize: fs }}>{edu.degree}</strong>
              <div style={{ fontSize: fs - 1, color: '#555' }}>{edu.institution}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}</div>
            </div>
            <span style={{ fontSize: fs - 1, color: color, fontWeight: 600 }}>{edu.year}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    const allItems = [
      ...(skills?.design || []).map(s => ({ s, cat: 'Design' })),
      ...(skills?.technical || []).map(s => ({ s, cat: 'Technical' })),
      ...(skills?.soft || []).map(s => ({ s, cat: 'Soft' })),
    ];
    if (allItems.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <SectionBar>Key Skills</SectionBar>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, fontSize: fs }}>
          {allItems.map((sk, i) => (
            <div key={i} style={{ padding: '3px 0', color: '#333' }}>• {sk.s}</div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustom = () => {
    if (!customSections || customSections.length === 0) return null;
    return customSections.filter(s => s.title || s.content).map((sec, i) => (
      <div key={sec.id || i} style={{ marginBottom: sp }}>
        <SectionBar>{sec.title}</SectionBar>
        <div style={{ fontSize: fs, color: '#444', lineHeight: 1.6 }} className="rich-text-content" dangerouslySetInnerHTML={{ __html: sec.content }} />
      </div>
    ));
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <SectionBar>Projects</SectionBar>
        <ProjectsBlock projects={projects} color={color} fs={fs} />
      </div>
    );
  };

  const sections = format === 'functional'
    ? [renderSkills, renderProjects, renderExperience, renderEducation, renderCustom]
    : [renderExperience, renderProjects, renderEducation, renderSkills, renderCustom];

  return (
    <div style={{ fontFamily: `'${font}', sans-serif`, minHeight: '100%', height: '100%', boxSizing: 'border-box', background: '#FFF', color: '#222' }}>
      {/* Header Band */}
      <div style={{ background: color, color: '#FFF', padding: `${pad * 0.7}px ${pad}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: fs + 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.name}</div>
          {p.title && <div style={{ fontSize: fs + 2, opacity: 0.9, marginTop: 4 }}>{p.title}</div>}
          <div style={{ fontSize: fs - 1, opacity: 0.8, marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {p.email && <span>{p.email}</span>}
            {p.phone && <><span>|</span><span>{p.phone}</span></>}
            {p.location && <><span>|</span><span>{p.location}</span></>}
            {p.linkedin && <><span>|</span><span>{p.linkedin}</span></>}
          </div>
        </div>
        {p.photo ? (
          <img src={p.photo} alt="Profile" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 90, height: 90, borderRadius: '50%', border: '3px dashed rgba(255,255,255,0.3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: `${pad * 0.6}px ${pad}px`, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {p.summary && (
          <div style={{ marginBottom: sp }}>
            <SectionBar>Summary</SectionBar>
            <div style={{ fontSize: fs, color: '#444', lineHeight: 1.65 }}>{p.summary}</div>
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {sections.map((fn, i) => <React.Fragment key={i}>{fn()}</React.Fragment>)}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  AVATAR TEMPLATE (Prominent centered/left photo)
// ═══════════════════════════════════════════════

export function AvatarTemplate({ data }) {
  const { personal: p, experience, education, skills, projects, references, customSections, settings } = data;
  const color = settings?.accentColor || '#E85D04';
  const fs = settings?.fontSize || 12;
  const sp = settings?.sectionSpacing || 16;
  const pad = settings?.pagePadding || 36;
  const font = settings?.fontFamily || 'Inter';
  const align = getAlign(settings);
  const format = settings?.formatId || 'chronological';

  const SectionBar = ({ children }) => (
    <div style={{ fontSize: fs + 2, fontWeight: 700, textTransform: 'uppercase', color: '#111', marginBottom: 12, borderBottom: `2px solid ${color}40`, paddingBottom: 6, display: 'inline-block' }}>
      {children}
    </div>
  );

  const renderExperience = () => {
    if (!experience || experience.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <SectionBar>Experience</SectionBar>
        {experience.map((exp, i) => (
          <div key={exp.id || i} style={{ marginBottom: sp - 4, display: 'flex', gap: 16 }}>
            <div style={{ width: 120, flexShrink: 0, fontSize: fs - 1, color: color, fontWeight: 600 }}>{exp.duration}</div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: fs + 1, display: 'block', marginBottom: 2 }}>{exp.role}</strong>
              <div style={{ fontSize: fs, color: '#555', marginBottom: 6 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ''}</div>
              {exp.bullets?.filter(b => b.trim()).map((b, bi) => (
                <div key={bi} style={{ fontSize: fs, color: '#333', paddingLeft: 14, position: 'relative', lineHeight: 1.6, marginTop: 2 }}>
                  <span style={{ position: 'absolute', left: 0, color: color }}>•</span> <span dangerouslySetInnerHTML={{__html: b}} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <SectionBar>Education</SectionBar>
        {education.map((edu, i) => (
          <div key={edu.id || i} style={{ marginBottom: 8, display: 'flex', gap: 16 }}>
             <div style={{ width: 120, flexShrink: 0, fontSize: fs - 1, color: color, fontWeight: 600 }}>{edu.year}</div>
             <div>
               <strong style={{ fontSize: fs }}>{edu.degree}</strong>
               <div style={{ fontSize: fs - 1, color: '#555' }}>{edu.institution}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}</div>
             </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    const allItems = [
      ...(skills?.design || []).map(s => ({ s, cat: 'Design' })),
      ...(skills?.technical || []).map(s => ({ s, cat: 'Technical' })),
      ...(skills?.soft || []).map(s => ({ s, cat: 'Soft' })),
    ];
    if (allItems.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <SectionBar>Skills</SectionBar>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {allItems.map((sk, i) => (
            <span key={i} style={{ padding: '4px 12px', borderRadius: 20, background: `${color}15`, color: color, fontSize: fs - 1, fontWeight: 500 }}>
              {sk.s}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderCustom = () => {
    if (!customSections || customSections.length === 0) return null;
    return customSections.filter(s => s.title || s.content).map((sec, i) => (
      <div key={sec.id || i} style={{ marginBottom: sp }}>
        <SectionBar>{sec.title}</SectionBar>
        <div style={{ fontSize: fs, color: '#444', lineHeight: 1.6 }} className="rich-text-content" dangerouslySetInnerHTML={{ __html: sec.content }} />
      </div>
    ));
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <SectionBar>Projects</SectionBar>
        <ProjectsBlock projects={projects} color={color} fs={fs} />
      </div>
    );
  };

  const sections = format === 'functional'
    ? [renderSkills, renderProjects, renderExperience, renderEducation, renderCustom]
    : [renderExperience, renderProjects, renderEducation, renderSkills, renderCustom];

  return (
    <div style={{ fontFamily: `'${font}', sans-serif`, minHeight: '100%', height: '100%', boxSizing: 'border-box', background: '#FAFAFA', color: '#222', padding: pad }}>
      
      {/* Profile Header */}
      <div style={{ display: 'flex', flexDirection: align === 'center' ? 'column' : align === 'right' ? 'row-reverse' : 'row', alignItems: 'center', gap: 32, marginBottom: 32, textAlign: align === 'right' ? 'right' : align === 'center' ? 'center' : 'left' }}>
        {p.photo ? (
          <img src={p.photo} alt="Profile" style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: `4px solid ${color}30`, boxShadow: `0 8px 24px ${color}20`, flexShrink: 0 }} />
        ) : (
          <div style={{ width: 140, height: 140, borderRadius: '50%', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, fontSize: 40, fontWeight: 800, flexShrink: 0 }}>
             {p.name ? p.name.charAt(0) : ''}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: fs + 24, fontWeight: 900, letterSpacing: '-0.03em', color: '#111', lineHeight: 1.1 }}>{p.name}</div>
          {p.title && <div style={{ fontSize: fs + 4, color: color, fontWeight: 600, marginTop: 8 }}>{p.title}</div>}
          <div style={{ fontSize: fs, color: '#666', marginTop: 12, display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
            {p.email && <span>{p.email}</span>}
            {p.phone && <><span>•</span><span>{p.phone}</span></>}
            {p.location && <><span>•</span><span>{p.location}</span></>}
            {p.linkedin && <><span>•</span><span>{p.linkedin}</span></>}
          </div>
        </div>
      </div>

      <div style={{ background: '#FFF', borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
        {p.summary && (
          <div style={{ marginBottom: sp + 8, fontSize: fs, color: '#444', lineHeight: 1.7 }}>
            {p.summary}
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sections.map((fn, i) => <React.Fragment key={i}>{fn()}</React.Fragment>)}
        </div>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════
//  SPLIT TEMPLATE (50/50 sidebar and main content)
// ═══════════════════════════════════════════════

export function SplitTemplate({ data }) {
  const { personal: p, experience, education, skills, projects, references, customSections, settings } = data;
  const color = settings?.accentColor || '#2A9D8F';
  const fs = settings?.fontSize || 12;
  const sp = settings?.sectionSpacing || 16;
  const font = settings?.fontFamily || 'Inter';
  const format = settings?.formatId || 'chronological';

  const MainTitle = ({ children }) => (
    <div style={{ fontSize: fs + 2, fontWeight: 700, textTransform: 'uppercase', color: '#111', marginBottom: 12, letterSpacing: '0.04em' }}>
      {children}
      <div style={{ width: 30, height: 3, background: color, marginTop: 4 }} />
    </div>
  );

  const renderExperience = () => {
    if (!experience || experience.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <MainTitle>{format === 'functional' ? 'Relevant Experience' : 'Work Experience'}</MainTitle>
        {experience.map((exp, i) => (
          <div key={exp.id || i} style={{ marginBottom: sp - 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: fs + 1 }}>{exp.company}</strong>
              <span style={{ fontSize: fs - 1, color: color, fontWeight: 600 }}>{exp.duration}</span>
            </div>
            <div style={{ fontSize: fs, color: '#666', marginBottom: 4 }}>{exp.role}{exp.location ? ` — ${exp.location}` : ''}</div>
            {exp.bullets?.filter(b => b.trim()).map((b, bi) => (
              <div key={bi} style={{ fontSize: fs, color: '#444', paddingLeft: 12, position: 'relative', lineHeight: 1.6, marginTop: 2 }}>
                <span style={{ position: 'absolute', left: 0, color: '#CCC' }}>•</span> <span dangerouslySetInnerHTML={{__html: b}} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <MainTitle>Projects</MainTitle>
        <ProjectsBlock projects={projects} color={color} fs={fs} />
      </div>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <div style={{ fontSize: fs + 1, fontWeight: 700, textTransform: 'uppercase', color: '#FFF', marginBottom: 12, letterSpacing: '0.04em' }}>Education</div>
        {education.map((edu, i) => (
          <div key={edu.id || i} style={{ marginBottom: 12 }}>
            <strong style={{ fontSize: fs, display: 'block', color: '#FFF' }}>{edu.degree}</strong>
            <div style={{ fontSize: fs - 1, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{edu.institution}</div>
            <div style={{ fontSize: fs - 1, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{edu.year}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    const allItems = [
      ...(skills?.design || []).map(s => ({ s, cat: 'Design' })),
      ...(skills?.technical || []).map(s => ({ s, cat: 'Technical' })),
      ...(skills?.soft || []).map(s => ({ s, cat: 'Soft' })),
    ];
    if (allItems.length === 0) return null;
    return (
      <div style={{ marginBottom: sp }}>
        <div style={{ fontSize: fs + 1, fontWeight: 700, textTransform: 'uppercase', color: '#FFF', marginBottom: 12, letterSpacing: '0.04em' }}>Skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {allItems.map((sk, i) => (
            <span key={i} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.15)', color: '#FFF', fontSize: fs - 1, borderRadius: 4 }}>
              {sk.s}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderCustom = () => {
    if (!customSections || customSections.length === 0) return null;
    return customSections.filter(s => s.title || s.content).map((sec, i) => (
      <div key={sec.id || i} style={{ marginBottom: sp }}>
        <MainTitle>{sec.title}</MainTitle>
        <div style={{ fontSize: fs, color: '#444', lineHeight: 1.6 }} className="rich-text-content" dangerouslySetInnerHTML={{ __html: sec.content }} />
      </div>
    ));
  };

  return (
    <div style={{ display: 'flex', fontFamily: `'${font}', sans-serif`, minHeight: '100%', height: '100%', boxSizing: 'border-box', background: '#FFF' }}>
      
      {/* Dark Sidebar */}
      <div style={{ width: '38%', background: '#1A1A1A', color: '#FFF', padding: 40, display: 'flex', flexDirection: 'column', gap: sp }}>
        {p.photo ? (
          <img src={p.photo} alt="Profile" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
        ) : (
          <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 8, marginBottom: 12, border: '3px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <div style={{ fontSize: 9, marginTop: 4, opacity: 0.7 }}>Add Photo</div>
            </div>
          </div>
        )}
        
        <div>
          <div style={{ fontSize: fs + 16, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: color }}>{p.name}</div>
          {p.title && <div style={{ fontSize: fs + 2, color: 'rgba(255,255,255,0.9)', marginTop: 8 }}>{p.title}</div>}
        </div>

        <div style={{ fontSize: fs - 1, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginTop: 12 }}>
          {p.email && <div>{p.email}</div>}
          {p.phone && <div>{p.phone}</div>}
          {p.location && <div>{p.location}</div>}
          {p.linkedin && <div>{p.linkedin}</div>}
        </div>

        {renderSkills()}
        {renderEducation()}
      </div>

      {/* Main Content */}
      <div style={{ width: '62%', padding: 40, display: 'flex', flexDirection: 'column', color: '#222' }}>
        {p.summary && (
          <div style={{ marginBottom: sp }}>
            <MainTitle>Profile</MainTitle>
            <div style={{ fontSize: fs, color: '#444', lineHeight: 1.7 }}>{p.summary}</div>
          </div>
        )}
        
        {format === 'functional' ? (
           <>{renderProjects()}{renderExperience()}{renderCustom()}</>
        ) : (
           <>{renderExperience()}{renderProjects()}{renderCustom()}</>
        )}
      </div>

    </div>
  );
}

export const TEMPLATES = {
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  professional: ProfessionalTemplate,
  bold: BoldTemplate,
  avatar: AvatarTemplate,
  split: SplitTemplate
};

