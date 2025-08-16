import React, { useState, useEffect } from 'react';
import { TiChevronLeftOutline, TiChevronRightOutline } from 'react-icons/ti';
import { useNavigate } from 'react-router-dom';
import '../fonts.css';

const sportsData = [
  { title: 'Chess', image: '/images/chess.jpg', tag: 'STRATEGY' },
  { title: 'Football', image: '/images/football.jpg', tag: 'TEAM' },
  { title: 'Badminton', image: '/images/badminton.jpg', tag: 'SINGLES' },
  { title: 'Basketball', image: '/images/basketball.jpg', tag: 'COURT' },
  { title: 'Table Tennis', image: '/images/pingpong.jpg', tag: 'SPEED' },
  { title: 'Volleyball', image: '/images/volleyball.jpg', tag: 'TEAM' },
  { title: 'Cricket', image: '/images/cricket.jpg', tag: 'OUTDOOR' },
  { title: 'Swimming', image: '/images/swimming.jpg', tag: 'AQUATIC' },
  { title: 'Athletics', image: '/images/athletics.jpg', tag: 'TRACK' },
  { title: 'Tennis', image: '/images/tennis.jpg', tag: 'SINGLES' },
];

const MAX_VISIBILITY = 2;

const Card = ({ title, image, blur, onExplore, tag }) => (
  <div
    style={{
      ...cardStyles.card,
      backgroundImage: `url(${image})`,
      filter: blur ? 'blur(3px)' : 'none',
    }}
  >
    <div style={cardStyles.overlay}>
      <div style={cardStyles.tag}>{tag}</div>
      <h2 style={cardStyles.title}>{title}</h2>
      <button style={cardStyles.button} onClick={onExplore}>
        Explore Now
      </button>
    </div>
  </div>
);

const Carousel = ({ children }) => {
  const [active, setActive] = useState(0);
  const count = React.Children.count(children);

  return (
    <div style={carouselStyles.wrapper}>
      <button
        style={{ ...carouselStyles.nav, left: '10px' }}
        onClick={() => setActive((i) => (i - 1 + count) % count)}
      >
        <TiChevronLeftOutline size={24} />
      </button>

      <div style={carouselStyles.container}>
        {[...Array(count)].map((_, i) => {
          const logicalOffset = i - active;
          const centerOffset =
            logicalOffset > count / 2
              ? logicalOffset - count
              : logicalOffset < -count / 2
              ? logicalOffset + count
              : logicalOffset;

          const absOffset = Math.abs(centerOffset);
          const scale = 1 - absOffset * 0.08;
          const translateX = centerOffset * 255;
          const rotateY = centerOffset * -20;
          const opacity = absOffset > MAX_VISIBILITY ? 0 : 1;
          const zIndex = 100 - absOffset;
          const blur = absOffset > 0;
          const pointerEvents = absOffset > MAX_VISIBILITY ? 'none' : 'auto';

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                opacity,
                zIndex,
                pointerEvents,
                transition:
                  'transform 0.6s ease, opacity 0.6s ease, filter 0.4s ease',
              }}
            >
              {React.cloneElement(children[i], { blur })}
            </div>
          );
        })}
      </div>

      <button
        style={{ ...carouselStyles.nav, right: '10px' }}
        onClick={() => setActive((i) => (i + 1) % count)}
      >
        <TiChevronRightOutline size={24} />
      </button>
    </div>
  );
};

const Sports = () => {
  const [headingAnimated, setHeadingAnimated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setHeadingAnimated(true);
  }, []);

  return (
    <section id="sports" style={styles.section}>
      <style>{`
        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animated-heading {
          animation: fadeSlideIn 1s ease-out forwards;
        }
      `}</style>

      <h2
        className={`explore-heading ${headingAnimated ? 'visible' : ''}`}
        style={styles.heading}
      >
        <span style={{ color: '#EA5444' }}>Game</span>. <span style={{ color: '#EA5444' }}>Set</span>. <span style={{ color: '#EA5444' }}>Match</span>.
      </h2>
      

      <Carousel>
        {sportsData.map((sport, i) => (
          <Card
            key={i}
            title={sport.title}
            image={sport.image}
            tag={sport.tag}
            onExplore={() =>
              sport.title === 'Chess'
                ? navigate('/otps')
                : navigate(`/sports/${sport.title.toLowerCase().replace(/\s+/g, '-')}`)
            }
          />
        ))}
      </Carousel>
    </section>
  );
};

// ==== Styles ====

const styles = {
  section: {
    padding: '30px 0 40px',
    background: '#fff',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    marginBottom: '20px',
    fontFamily: 'sans-serif',
  },
  heading: {
    fontSize: '50px',
    fontWeight: '800',
    marginTop: '13px',
    marginBottom: '5px',
    color: '#222',
  },
};

const cardStyles = {
  card: {
    width: '350px',
    height: '450px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '20px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    transition: 'transform 0.4s ease',
  },
  overlay: {
    width: '100%',
    padding: '20px',
    background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.4))',
    borderBottomLeftRadius: '20px',
    borderBottomRightRadius: '20px',
    textAlign: 'left',
    color: '#000',
  },
  tag: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#EA5444',
    marginBottom: '8px',
  },
  title: {
    fontSize: '35px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  meta: {
    fontSize: '14px',
    color: '#444',
    marginBottom: '12px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#EA5444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background 0.3s ease',
  },
};

const carouselStyles = {
  wrapper: {
    position: 'relative',
    width: '100%',
    height: '540px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    perspective: '1500px',
    ooverflow: 'visible',
  },
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nav: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(234, 84, 68, 0.15)',
    border: 'none',
    borderRadius: '50%',
    padding: '10px',
    cursor: 'pointer',
    zIndex: 200,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
};

export default Sports;
