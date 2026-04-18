import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="container animate-fade-in">
      <section style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4rem', flexWrap: 'wrap', padding: '2rem 0' }}>
        <div style={{ flex: '1 1 500px' }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: '4rem', marginBottom: '1.5rem', color: 'var(--text-color)' }}
          >
            Adapting, <br />
            Managing, <br />
            <span className="text-accent">Growing.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted"
            style={{ fontSize: '1.25rem', marginBottom: '2.5rem', maxWidth: '600px' }}
          >
            I'm Leo. From navigating IT Audit complexities to running operations 
            at a family-owned window cleaning franchise, I've learned that adaptability is the ultimate skill.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
          >
            <Link to="/career" className="btn btn-primary">
              View My Career Journey <ArrowRight size={20} />
            </Link>
            <Link to="/about" className="btn glass" style={{ color: 'var(--text-color)' }}>
              Read My Story
            </Link>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ 
            width: '100%',
            maxWidth: '450px',
            aspectRatio: '1/1', 
            borderRadius: 'var(--radius-lg)', 
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'var(--font-heading)',
            fontSize: '2rem',
            transform: 'rotate(-3deg)',
            transition: 'transform 0.5s ease',
            cursor: 'pointer'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)'}
          onMouseOut={e => e.currentTarget.style.transform = 'rotate(-3deg)'}
          >
            Bridging Tech & Ops
          </div>
        </motion.div>
      </section>

      {/* Quick Summary Section */}
      <section style={{ padding: '6rem 0', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Key Strengths</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {['Risk Analysis & IT Audit', 'Sales & Account Management', 'Cross-functional Operations', 'Strategic Planning'].map((skill, i) => (
            <motion.div 
              key={skill}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1 }}
              className="glass"
              style={{ padding: '2rem', borderRadius: 'var(--radius)' }}
            >
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <ChevronRight className="text-accent" /> {skill}
              </h3>
              <p className="text-muted">Leveraging versatile experiences to drive meaningful results.</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default Landing;
