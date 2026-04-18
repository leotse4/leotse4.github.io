import { Mail } from 'lucide-react';

const Github = ({ size = 24, color = "currentColor", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.5 5.5 0 0 0-1.5-3.89C18.8 3.32 18.2 1.5 18.2 1.5s-1.25-.4-4 1.5a13.9 13.9 0 0 0-7 0c-2.75-1.9-4-1.5-4-1.5-.2 2.3.4 5.3.4 5.3A5.5 5.5 0 0 0 2 12c0 5.23 3 6.42 6 6.76A4.8 4.8 0 0 0 7 22v-2" />
    <path d="M7 20c-5 1.5-7-3-7-3" />
  </svg>
);

const Linkedin = ({ size = 24, color = "currentColor", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '3rem 0', marginTop: 'auto' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--muted)' }}>
          <a href="https://www.linkedin.com/in/leonardotse/" target="_blank" rel="noreferrer" style={{ transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}><Linkedin size={24} /></a>
          <a href="#" style={{ transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}><Github size={24} /></a>
          <a href="#" style={{ transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}><Mail size={24} /></a>
        </div>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} Leo Tse. Built with React.
        </p>
      </div>
    </footer>
  );
};
export default Footer;
