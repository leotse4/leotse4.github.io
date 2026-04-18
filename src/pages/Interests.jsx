import { motion } from 'framer-motion';

const Interests = () => {
  const interests = [
    { title: "Technology Trends", desc: "Keeping a pulse on how software and automation shift business landscapes." },
    { title: "Outdoor Activities", desc: "Finding balance and grit through hiking and exploring nature." },
    { title: "Community Building", desc: "Connecting people and fostering communities locally." }
  ];

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Beyond the <span className="text-accent">Resume</span></h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
          Who you work with matters just as much as what they do. Here's a glimpse into what keeps me energized outside of work.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {interests.map((item, i) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass"
            style={{ 
              height: '300px', 
              borderRadius: 'var(--radius)', 
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              background: `linear-gradient(to top, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.2)), var(--primary)`,
              color: 'white'
            }}
          >
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>{item.title}</h3>
            <p style={{ opacity: 0.8 }}>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Interests;
