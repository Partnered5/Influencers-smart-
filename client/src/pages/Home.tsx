/* Studio Paper reminder: editorial software with warm ivory surfaces, ink navy structure, Studio Cobalt actions, ruled dividers, and contact-sheet previews. */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Clapperboard,
  Copy,
  FileText,
  Image as ImageIcon,
  Layers3,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Play,
  Plus,
  ScanFace,
  Settings2,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";

const avatarImage = "/manus-storage/influencer-smart-avatar-editorial_8c780a52.png";
const cobaltImage = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85";
const weekendImage = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=85";
const activeImage = "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=900&q=85";
const logoImage = "/manus-storage/influencer-smart-logo_c39c5a3f.png";

const navItems = [
  { label: "Overview", icon: Layers3 },
  { label: "Avatar studio", icon: ScanFace },
  { label: "Campaigns", icon: Clapperboard },
  { label: "Content library", icon: ImageIcon },
];

const styleOptions = [
  { label: "Editorial", detail: "Polished, considered", image: cobaltImage },
  { label: "Weekend", detail: "Warm, candid", image: weekendImage },
  { label: "Active", detail: "Energetic, direct", image: activeImage },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [activeStyle, setActiveStyle] = useState("Editorial");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState("Introduce Aria to a new audience with a thoughtful, everyday ritual.");
  const [selectedFormat, setSelectedFormat] = useState("Carousel");
  const [approved, setApproved] = useState(false);

  const activeLook = useMemo(
    () => styleOptions.find((item) => item.label === activeStyle) ?? styleOptions[0],
    [activeStyle],
  );

  function handleGenerate() {
    setGenerating(true);
    setApproved(false);
    window.setTimeout(() => {
      setGenerating(false);
      toast.success("Draft ready for your review", { description: "Aria’s voice and visual anchors were kept consistent." });
    }, 900);
  }

  function handleCopy() {
    navigator.clipboard?.writeText("Meet Aria Vale — a thoughtful virtual creator for the rituals that make a day feel like yours.");
    toast.success("Caption copied");
  }

  return (
    <div className="studio-shell min-h-screen bg-[#f8f5ef] text-[#1b2333]">
      <aside className={`studio-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><img src={logoImage} alt="" /></div>
          <div><div className="brand-name">Influencer</div><div className="brand-stamp">SMART / STUDIO</div></div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="workspace-label">Your workspace <ChevronDown size={14} /></div>
        <div className="workspace-card"><div className="workspace-avatar">AV</div><div><strong>Aria Vale</strong><span>Virtual creator</span></div><MoreHorizontal size={17} /></div>
        <nav className="studio-nav" aria-label="Studio navigation">
          <div className="nav-kicker">Workspace</div>
          {navItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => { setActiveNav(label); setMobileOpen(false); }} className={activeNav === label ? "active" : ""}><Icon size={17} /><span>{label}</span>{label === "Content library" && <span className="nav-count">12</span>}</button>)}
          <div className="nav-kicker nav-kicker-spaced">Project files</div>
          <button className="file-link"><FileText size={16} /><span>persona.md</span><span className="file-dot ready" /></button>
          <button className="file-link"><MessageSquareText size={16} /><span>voice.md</span><span className="file-dot ready" /></button>
          <button className="file-link"><ScanFace size={16} /><span>visual-anchor.md</span><span className="file-dot ready" /></button>
          <button className="file-link"><FileText size={16} /><span>brain.md</span><span className="file-dot muted" /></button>
        </nav>
        <div className="sidebar-bottom"><div className="disclosure-note"><span className="disclosure-dot" /> All output is labeled AI-generated.</div><button className="settings-button"><Settings2 size={16} /> Settings</button><div className="profile-row"><div className="profile-avatar">JM</div><div><strong>Jordan Miller</strong><span>Creator plan</span></div><ChevronDown size={15} /></div></div>
      </aside>

      <main className="studio-main">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><span className="slash">/</span><strong>{activeNav}</strong></div><div className="topbar-actions"><span className="status-pill"><span /> Autosaved 2m ago</span><button className="icon-button" aria-label="Notifications"><MessageSquareText size={18} /></button><button className="new-button" onClick={() => toast.info("Choose a studio to start a new draft")}> <Plus size={16} /> New project</button></div></header>

        <div className="content-wrap">
          <section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> Monday, 25 August 2026</div><h1>Make a creator<br /><em>people remember.</em></h1><p>Shape the point of view, then let the studio carry it across every frame.</p></div><div className="heading-actions"><button className="quiet-button" onClick={() => toast.info("A short tour is coming soon")}>Take a tour <ArrowUpRight size={15} /></button></div></section>

          <section className="overview-strip"><div><span className="metric-label">Active creator</span><strong>Aria Vale</strong></div><div><span className="metric-label">Consistency score</span><strong>94<span className="metric-unit">%</span></strong></div><div><span className="metric-label">Drafts this month</span><strong>08</strong></div><div className="strip-action"><button onClick={() => { setActiveNav("Avatar studio"); toast.success("Avatar studio opened"); }}>Open avatar studio <ArrowUpRight size={15} /></button></div></section>

          <section className="workspace-grid">
            <div className="preview-card card-surface">
              <div className="card-topline"><div><span className="section-number">01</span><span className="section-title">Live creator preview</span></div><span className="ai-label"><Sparkles size={13} /> AI GENERATED</span></div>
              <div className="portrait-stage"><img src={avatarImage} alt="Aria Vale, a fictional virtual creator in a cobalt blazer" /><div className="portrait-tag"><span className="tag-corner" /> ARIA / 01 <span>Editorial base</span></div><button className="preview-play" onClick={() => toast.info("Preview playback is available when a video draft is generated")} aria-label="Preview motion"><Play size={18} fill="currentColor" /></button></div>
              <div className="preview-footer"><div><strong>Aria Vale</strong><span>Fictional virtual creator · disclosed</span></div><button className="text-action" onClick={() => { setActiveNav("Avatar studio"); toast.info("Avatar studio opened"); }}>Edit identity <ArrowUpRight size={14} /></button></div>
            </div>

            <div className="right-stack">
              <div className="brief-card card-surface"><div className="card-topline"><div><span className="section-number">02</span><span className="section-title">Today’s brief</span></div><button className="more-icon" aria-label="More brief options"><MoreHorizontal size={17} /></button></div><h2>Small rituals,<br /><em>real feeling.</em></h2><p>Build a softer entry point for Aria’s everyday-living series.</p><div className="brief-meta"><div><span>Channel</span><strong>Instagram</strong></div><div><span>Format</span><strong>{selectedFormat}</strong></div><div><span>Due</span><strong>Today, 4:00 PM</strong></div></div><button className="primary-button full" onClick={handleGenerate} disabled={generating}>{generating ? <><span className="spinner" /> Developing draft...</> : <><WandSparkles size={16} /> Generate from brief</>}</button></div>
              <div className="consistency-card card-surface"><div className="card-topline"><div><span className="section-number">03</span><span className="section-title">Brand consistency</span></div><span className="score-badge">94 / 100</span></div><div className="progress-line"><span /></div><div className="consistency-row"><div><strong>Voice &amp; point of view</strong><span>Warm, specific, never salesy</span></div><Check size={17} /></div><div className="consistency-row"><div><strong>Visual anchor</strong><span>Identity held across 12 assets</span></div><Check size={17} /></div><div className="consistency-row warning"><div><strong>Disclosure stamp</strong><span>Applied to every export</span></div><Check size={17} /></div></div>
            </div>
          </section>

          <section className="lower-grid">
            <div className="lookbook-card card-surface"><div className="card-topline"><div><span className="section-number">04</span><span className="section-title">Select a look</span></div><button className="text-action" onClick={() => toast.info("More looks are available in Avatar studio")}>View all <ArrowUpRight size={14} /></button></div><div className="lookbook-grid">{styleOptions.map((style) => <button key={style.label} className={`look-card ${activeStyle === style.label ? "selected" : ""}`} onClick={() => setActiveStyle(style.label)}><img src={style.image} alt={`${style.label} look for Aria Vale`} /><span className="look-overlay" /><span className="look-check">{activeStyle === style.label && <Check size={13} />}</span><span className="look-label"><strong>{style.label}</strong><small>{style.detail}</small></span></button>)}</div></div>
            <div className="draft-card card-surface"><div className="card-topline"><div><span className="section-number">05</span><span className="section-title">Latest draft</span></div><span className="draft-state">Needs review</span></div><div className="draft-preview"><img src={activeLook.image} alt={`${activeStyle} campaign draft`} /><div className="draft-copy"><span className="tiny-label">CAPTION / V1</span><p>“The best parts of the day are usually the ones you make room for.”</p><div className="draft-actions"><button onClick={handleCopy}><Copy size={14} /> Copy caption</button><button onClick={() => { setApproved(true); toast.success("Draft marked ready"); }}>{approved ? <Check size={14} /> : <ArrowUpRight size={14} />} {approved ? "Ready to export" : "Review draft"}</button></div></div></div></div>
          </section>

          <section className="footer-tools"><span>Direct the story. Keep the disclosure.</span><div><button onClick={() => setSelectedFormat("Carousel")} className={selectedFormat === "Carousel" ? "selected" : ""}>Carousel</button><button onClick={() => setSelectedFormat("Reel")} className={selectedFormat === "Reel" ? "selected" : ""}>Reel</button><button onClick={() => setSelectedFormat("Story") } className={selectedFormat === "Story" ? "selected" : ""}>Story</button></div></section>
        </div>
      </main>
    </div>
  );
}
