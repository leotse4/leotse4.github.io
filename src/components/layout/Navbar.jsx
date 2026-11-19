import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const links = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'Story' },
    { path: '/career', label: 'Career' },
    { path: '/interests', label: 'Interests' },
    { path: '/recipes', label: 'Recipe tool' }
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuVariants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: -20 },
    open: { opacity: 1, y: 0 }
  };

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', zIndex: 60 }}>
          Leo<span className="text-accent" style={{ color: 'var(--accent)' }}>.</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hide-on-mobile" style={{ gap: '2rem' }}>
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

        {/* Mobile Toggle Button */}
        <button 
          className="show-on-mobile"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-color)',
            cursor: 'pointer',
            padding: '0.5rem',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="mobile-nav-menu"
          >
            {links.map((link) => (
              <motion.div key={link.path} variants={itemVariants}>
                <Link
                  to={link.path}
                  className="mobile-nav-link"
                  style={{
                    color: location.pathname === link.path ? 'var(--accent)' : 'var(--text-color)'
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

