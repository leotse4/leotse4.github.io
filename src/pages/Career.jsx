import { motion } from 'framer-motion';
import { Briefcase, Shield, Download, GraduationCap } from 'lucide-react';

const Career = () => {
  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--section-padding)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Experience <span className="text-accent">& Skills</span></h1>
        <button className="btn btn-primary"><Download size={20} /> Resume PDF</button>
      </div>

      <div className="career-grid">
        <div className="timeline">
          
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="timeline-item">
            <div className="timeline-badge" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
              <Briefcase size={20} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>District Operations Manager</h2>
            <h3 className="text-muted" style={{ fontWeight: 500, marginBottom: '1rem' }}>Fish Window Cleaning &bull; 11/2025 - Present</h3>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Expand business and obtain clients via marketing campaigns in Hubspot to reach 200+ business owners.</li>
              <li>Create, build, and execute projects for reaching key markets such as restaurants, realtors, and property managers.</li>
              <li>Oversee estimation and bidding for large commercial and residential projects, identifying equipment requirements and potential risks.</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="timeline-item">
            <div className="timeline-badge" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
              <Shield size={20} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Internal IT Audit Senior</h2>
            <h3 className="text-muted" style={{ fontWeight: 500, marginBottom: '1rem' }}>Rakuten International &bull; 07/2023 - 10/2025</h3>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Managed end-to-end project lifecycles for ISO 27001 ISMS and SOX-based control assessments across international teams.</li>
              <li>Spearheaded a reporting improvement initiative by developing Python/Excel scripts with AI, reducing manual data processing by 5 hours monthly.</li>
              <li>Performed gap-analysis assessments for clients seeking SOC 2 reports, ISO 27018 compliance, and PII/privacy initiatives.</li>
              <li>Enabled cross-function collaboration on IT-reliant control implementation, reducing external costs and improving operational maturity.</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="timeline-item">
            <div className="timeline-badge" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
              <Shield size={20} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>IT Audit Staff</h2>
            <h3 className="text-muted" style={{ fontWeight: 500, marginBottom: '1rem' }}>EY &bull; 07/2021 - 07/2023</h3>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Led requirements gathering sessions and process walkthroughs to map workflows and identify operational risks within ads-serving and video streaming product lines.</li>
              <li>Designed technical documentation including data flow diagrams (Visio) and pseudocode analysis of Python/SQL scripts.</li>
              <li>Developed testing protocols for AI-based spam-filtration systems to ensure data accuracy and reliability.</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="timeline-item">
            <div className="timeline-badge" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
              <GraduationCap size={20} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Santa Clara University</h2>
            <h3 className="text-muted" style={{ fontWeight: 500, marginBottom: '1rem' }}>B.S. Management Information Systems</h3>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Minors in Computer Science and Engineering, Business Analytics.</li>
              <li>Activities: Delta Sigma Pi, ACE Leadership Program.</li>
            </ul>
          </motion.div>

        </div>

        <div className="skills-matrix" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Business Acumen</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Project Management', 'B2B Sales', 'Operations', 'Compliance', 'ISO 27001', 'SOX'].map(s => (
                <span key={s} style={{ background: 'var(--border)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.9rem', color: 'var(--text-color)' }}>{s}</span>
              ))}
            </div>
          </div>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Technical Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Python', 'SQL', 'Risk Assessment', 'JIRA', 'Hubspot', 'Data Analysis'].map(s => (
                <span key={s} style={{ background: 'var(--border)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.9rem', color: 'var(--text-color)' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Career;
