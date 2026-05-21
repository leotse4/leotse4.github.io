import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="container animate-fade-in">
      <div style={{ maxWidth: '800px', padding: 'var(--section-padding)' }}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem' }}
        >
          My <span className="text-accent">Story</span>
        </motion.h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '1.1rem', lineHeight: 1.8 }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            My professional journey is anything but conventional. It started with an intense focus on precision, compliance, and structure...
          </motion.p>
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--accent)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>The Foundation: IT Audit</h3>
            <p className="text-muted">
              Working as an IT Auditor, I learned the importance of detail. I was analyzing complex systems, assessing risk, and communicating technical vulnerabilities to non-technical stakeholders. It was rigorous, analytical work that built my problem-solving backbone.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={{ padding: '2rem', backgroundColor: 'var(--primary)', color: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>The Pivot: Family Business</h3>
            <p style={{ opacity: 0.9 }}>
              Then came the pivot. My family's window cleaning franchise needed dedicated leadership to scale. Stepping away from the corporate ladder, I plunged into the vibrant, high-stakes world of small business operations and sales. I wasn't just finding risks anymore—I was taking them.
            </p>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            In the family business, I learned what it takes to manage a team, win client accounts, optimize day-to-day operations, and grow a bottom line. This unique blend of corporate analytical rigor and gritty entrepreneurial sales has defined my career ever since.
          </motion.p>
        </div>
      </div>
    </div>
  );
};
export default About;
