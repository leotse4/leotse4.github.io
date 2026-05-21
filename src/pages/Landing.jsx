import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="container animate-fade-in">
      <section className="landing-hero">
        <div className="landing-hero-text">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}
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
          className="landing-hero-graphic-container"
        >
          <div className="landing-hero-graphic">
            Bridging Tech & Ops
          </div>
        </motion.div>
      </section>

      {/* Quick Summary Section */}
      <section className="landing-strengths-section">
        <h2 className="landing-strengths-title">Key Strengths</h2>
        <div className="landing-strengths-grid">
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
