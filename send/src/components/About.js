import React, { useState } from 'react';

const About = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const renderList = (items, baseIndex) =>
    items.map((item, idx) => (
      <li
        key={baseIndex + idx}
        style={{
          ...styles.listItem,
          color: hoveredIndex === baseIndex + idx ? '#ffd700' : 'white',
        }}
        onMouseEnter={() => setHoveredIndex(baseIndex + idx)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {item}
      </li>
    ));

  return (
    <section id="about" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.columnWrapper}>
          <div style={styles.column}>
            <h3 style={styles.title}>About</h3>
            <ul style={styles.list}>
              {renderList(['About Us', 'Features', 'New', 'Careers'], 0)}
            </ul>
          </div>
          <div style={styles.column}>
            <h3 style={styles.title}>Company</h3>
            <ul style={styles.list}>
              {renderList(['Our Team', 'Partner with Us', 'FAQ', 'Blog'], 10)}
            </ul>
          </div>
          <div style={styles.column}>
            <h3 style={styles.title}>Support</h3>
            <ul style={styles.list}>
              {renderList(['Account', 'Support Center', 'Feedback', 'Contact Us', 'Accessibility'], 20)}
            </ul>
          </div>
          <div style={styles.column}>
            <h3 style={styles.title}>Social Media</h3>
            <ul style={styles.list}>
              {renderList(['📷 Instagram', '📘 Facebook', '🐦 Twitter'], 30)}
            </ul>
          </div>
        </div>
        <div style={styles.bottomBar}>
          <p style={styles.copy}>&copy; 2025 Traver. Copyright and All rights reserved.</p>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '15px 0px 1px',
    backgroundColor: '#EA5444',
    color: 'white',
    fontFamily: 'sans-serif',
    marginTop: '0px',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  columnWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: '0px',
  },
  column: {
    flex: '1 1 200px',
    margin: '10px',
  },
  title: {
    fontSize: '15px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    lineHeight: '2',
    fontSize: '13px',
  },
  listItem: {
    transition: 'color 0.3s ease',
    cursor: 'pointer',
  },
  bottomBar: {
    borderTop: '1px solid rgba(255,255,255,0.3)',
    paddingTop: '3px',
    textAlign: 'center',
  },
  copy: {
    fontSize: '13px',
    color: '#fff',
  },
};

export default About;
