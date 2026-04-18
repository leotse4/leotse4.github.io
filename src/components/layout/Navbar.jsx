import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  const links = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'Story' },
    { path: '/career', label: 'Career' },
    { path: '/interests', label: 'Interests' }
  ];

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          Leo<span className="text-accent" style={{ color: 'var(--accent)' }}>.</span>
        </Link>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          {links.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              style={{
                position: 'relative',
                fontWeight: 500,
                color: location.pathname === link.path ? 'var(--text-color)' : 'var(--muted)',
                transition: 'var(--transition)'
              }}
            >
              {link.label}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="underline"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '-4px',
                    height: '2px',
                    backgroundColor: 'var(--accent)',
                    borderRadius: '2px'
                  }}
                />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};
export default Navbar;
