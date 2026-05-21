import { motion } from 'framer-motion';

const Interests = () => {
  const interests = [
    { 
      title: "Piano", 
      desc: "Finding moments of tranquility and creative expression through playing the piano.",
      image: "/images/piano.jpg"
    },
    { 
      title: "Running", 
      desc: "Building stamina and mental grit, one mile at a time.",
      image: "/images/running.jpg"
    },
    { 
      title: "Continuous Learning", 
      desc: "Deepening my knowledge of the world through mini-documentaries and deeply researched video essays on YouTube.",
      image: "/images/documentary.jpg"
    }
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--section-padding)' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Beyond the <span className="text-accent">Resume</span></h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
          Who you work with matters just as much as what they do. Here's a glimpse into what keeps me energized outside of work.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
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
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              background: `linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.2)), url('${item.image}') center/cover no-repeat, var(--primary)`,
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
