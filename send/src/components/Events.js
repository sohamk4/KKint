import React, { useState } from 'react';

const eventData = [
  {
    title: '+ AR 3D Design Concept',
    description: 'An interactive 3D design for mobile prototyping solutions.',
    image: '/images/event1.jpg',
  },
  {
    title: 'UI Dashboard Analytics',
    description: 'Dashboard design and data analysis integration.',
    image: '/images/event2.jpg',
  },
  {
    title: 'Color Swatch Testing',
    description: 'Testing different color palettes for brand identity.',
    image: '/images/event3.jpg',
  },
  {
    title: 'Mobile App Design',
    description: 'Settings and configuration screens for modern apps.',
    image: '/images/event4.jpg',
  },
];

const Events = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const styles = {
    section: {
      padding: '40px 15px',
      backgroundColor: '#f9fafb',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px',
      flexWrap: 'wrap',
      maxWidth: '1000px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    title: {
      fontSize: '36px',
      fontWeight: 700,
      fontFamily: 'landingFont',
      color: '#111',
    },
    highlight: {
      color: '#EA5444',
    },
    viewLink: {
      fontSize: '16px',
      color: '#EA5444',
      cursor: 'pointer',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    wrapper: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      maxWidth: '1000px',
      margin: '0 auto',
    },
    card: (index) => ({
      flex: hoveredIndex === null
        ? '1'
        : hoveredIndex === index
        ? '1.2'
        : '0.9',
      height: '380px',
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative',
      transition: 'flex 0.4s ease',
      cursor: 'pointer',
      boxShadow:
        hoveredIndex === index
          ? '0 10px 25px rgba(0,0,0,0.2)'
          : '0 6px 12px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
    }),
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    tag: {
      position: 'absolute',
      top: '12px',
      left: '12px',
      backgroundColor: '#EA5444',
      color: '#fff',
      padding: '6px 12px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 600,
      zIndex: 3,
    },
    content: {
      position: 'absolute',
      bottom: 0,
      backgroundColor: '#fff',
      padding: '16px',
      width: '100%',
      borderBottomLeftRadius: '20px',
      borderBottomRightRadius: '20px',
      boxSizing: 'border-box',
      height: '100px',
    },
    cardTitle: {
      fontSize: '15px',
      fontWeight: 700,
      margin: 0,
      color: '#111',
    },
    cardDesc: {
      fontSize: '13px',
      color: '#444',
      marginTop: '8px',
    },
  };

  return (
    <section style={styles.section} id="events">
      <div style={styles.header}>
        <h2 style={styles.title}>
          Upcoming <span style={styles.highlight}>Events</span>
        </h2>
        <span style={styles.viewLink}>
          View more Events ➜
        </span>
      </div>

      <div style={styles.wrapper}>
        {eventData.map((event, index) => (
          <div
            key={index}
            style={styles.card(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Tag only on the first card */}
            {index === 0 && <div style={styles.tag}>Upcoming Event</div>}

            <img src={event.image} alt={event.title} style={styles.image} />
            <div style={styles.content}>
              <h3 style={styles.cardTitle}>{event.title}</h3>
              <p style={styles.cardDesc}>{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Events;
