import { motion } from 'framer-motion';
import { Briefcase, Shield, Download, GraduationCap } from 'lucide-react';

const Career = () => {
  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--section-padding)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Experience <span className="text-accent">& Skills</span></h1>
        <a 
          href="/Resume_Leo_Tse.pdf" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
        >
          <Download size={20} /> Resume PDF
        </a>
      </div>

      <div className="career-grid">
        <div className="timeline">
          
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="timeline-item">
            <div className="timeline-badge" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
              <Briefcase size={20} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>District Operations Manager</h2>
            <h3 className="text-muted" style={{ fontWeight: 500, marginBottom: '1rem' }}>Fish Window Cleaning &bull; 11/2025 - Current</h3>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Manage the customer journey of residential and commercial businesses via HubSpot, achieving a 99%+ customer retention rate across 200+ accounts by leveraging HubSpot to automate engagement sequences and personalize the customer journey.</li>
              <li>Organize routes for cleaning schedules, balancing client requests with cleaner resource utilization.</li>
              <li>Design proposal documents for large scale projects, winning business for over $30,000 annual window cleaning revenue.</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="timeline-item">
            <div className="timeline-badge" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
              <Shield size={20} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Internal IT Audit Senior</h2>
            <h3 className="text-muted" style={{ fontWeight: 500, marginBottom: '1rem' }}>Rakuten International &bull; 07/2023 - 10/2025</h3>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Managed end-to-end project lifecycles for SOX ITGC control assessments for Rakuten’s e-commerce and advertising subsidiaries, adapting regulatory strategy based on subsidiaries’ audit maturity.</li>
              <li>Streamlined cross-functional reporting by developing automated Excel/Python scripts, reducing manual data processing by 60+ hours annually and improving reporting accuracy for global stakeholders.</li>
              <li>Visualized complex business processes with Microsoft Visio, simplifying technical explanations for external auditors.</li>
              <li>Established relationships with multiple global stakeholders to educate on the importance of compliance, resulting in several clients to adopt control recommendations with high priority.</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="timeline-item">
            <div className="timeline-badge" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
              <Shield size={20} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>IT Audit Staff</h2>
            <h3 className="text-muted" style={{ fontWeight: 500, marginBottom: '1rem' }}>EY &bull; 07/2021 - 07/2023</h3>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Led technical discovery and requirements gathering sessions with product leads to identify operational risks and map data workflows for high-scale ads-serving platforms.</li>
              <li>Analyzed Python/SQL scripts to validate security controls and explain data pipelines to non-technical stakeholders, ensuring technical fixes met compliance standards.</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="timeline-item">
            <div className="timeline-badge" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
              <GraduationCap size={20} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Santa Clara University</h2>
            <h3 className="text-muted" style={{ fontWeight: 500, marginBottom: '1rem' }}>Leavey School of Business &bull; B.S. in Commerce</h3>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Major: Management Information Systems</li>
              <li>Minors: Computer Science and Engineering, Business Analytics</li>
              <li>Activities and Societies: Delta Sigma Pi, ACE Leadership Program</li>
            </ul>
          </motion.div>

        </div>

        <div className="skills-matrix" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Operational & Languages</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Project Management', 'Process Automation', 'Vendor Coordination', 'English (Fluent)', 'Japanese (Conversational)'].map(s => (
                <span key={s} style={{ background: 'var(--border)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.9rem', color: 'var(--text-color)' }}>{s}</span>
              ))}
            </div>
          </div>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Technical & Software</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['SQL', 'Python', 'HubSpot', 'JIRA', 'Monday.com', 'Google Suite', 'Microsoft Office'].map(s => (
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
