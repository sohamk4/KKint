import React, { useEffect, useState } from 'react';
import myImage from '../assets/mainphoto.png';
import image2 from '../assets/image2.png';
import image3 from '../assets/image3.png';
import '../fonts.css';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const images = [myImage, image2, image3];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(true); // ✅ For fade transition

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Start fade out
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setFade(true); // Fade in after image changes
      }, 500); // 500ms for fade out before changing image
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" style={styles.section}>
      <div style={styles.leftBox}>
        <h1 style={styles.heading}>Rise. Play. Conquer.</h1>
        <p style={styles.quote}>
          Your trusted partner for organizing sports events that blend excitement, strategy, and team spirit across schools and communities.
        </p>
        <button style={styles.button} onClick={() => navigate('/signin')}>
          Get Started
        </button>
      </div>

      <div style={styles.rightBox}>
        <img
          src={images[currentImageIndex]}
          alt="sports"
          style={{
            ...styles.image,
            opacity: fade ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out', // ✅ Smooth fade
          }}
        />
      </div>
    </section>
  );
};

const styles = {
  section: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '60px 80px',
    minHeight: '90vh',
    backgroundColor: 'transparent',
  },
  leftBox: {
    flex: 1,
    minWidth: '300px',
    paddingRight: '40px',
    textAlign: 'left',
    marginTop: '85px',
  },
  heading: {
    fontSize: '65px',
    fontWeight: 'bold',
    fontFamily: 'landingFont',
    marginBottom: '5px',
    color: '#222',
    lineHeight: '1.2',
  },
  quote: {
    fontSize: '18px',
    color: '#444',
    marginTop: '2px',
    marginBottom: '25px',
    maxWidth: '450px',
    lineHeight: '1.3',
  },
  button: {
    padding: '10px 28px',
    backgroundColor: '#EA5444',
    color: 'white',
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    border: 'none',
    borderRadius: '6px',
    fontFamily: 'sans-serif',
    cursor: 'pointer',
    transform: 'translateY(-5px)',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
  rightBox: {
    flex: 1,
    minWidth: '300px',
  },
  image: {
    width: '100%',                   // responsive width
    height: '650px',                 // ✅ increased height
    maxWidth: '1000px',              // ✅ increased width
    objectFit: 'contain',            // keeps full image visible
    transform: 'translateX(15px)',   // slight right shift (optional)
    borderRadius: '0',
    boxShadow: 'none',
    marginTop: '-80px',              // adjusted so it doesn’t push content down
    transition: 'opacity 0.5s ease-in-out',
    opacity: 1,
  }
  
  
};

export default Landing;
