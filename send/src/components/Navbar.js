import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../fonts.css';

const sections = ['home', 'places', 'sports', 'events', 'about', 'search']; // ✅ Added events here

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [hovered, setHovered] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      let current = 'home';

      sections.forEach((sectionId) => {
        const el = document.getElementById(sectionId);
        if (el && el.offsetTop - 100 <= scrollY) {
          current = sectionId;
        }
      });

      setActiveSection(current);

      const landingHeight = document.getElementById('home')?.offsetHeight || 0;
      setIsVisible(scrollY <= landingHeight - 60);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (section) => {
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(section);
    }
  };

  return (
    <nav
      style={{
        ...styles.navbar,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <img src={logo} alt="Logo" style={styles.logo} />

      <div style={styles.centerLinks}>
        {sections.map((sec) => {
          const isActive = activeSection === sec;
          const isHovered = hovered === sec;
          const color = isActive || isHovered ? '#EA5444' : '#000000';

          if (sec === 'search') {
            return (
              <div
                key={sec}
                style={styles.linkContainer}
                onMouseEnter={() => setShowSearchInput(true)}
                onMouseLeave={() => setShowSearchInput(false)}
              >
                <input
                  type="text"
                  placeholder="Search..."
                  style={{
                    ...styles.searchInputRevealed,
                    opacity: showSearchInput ? 1 : 0,
                    pointerEvents: showSearchInput ? 'auto' : 'none',
                    transform: showSearchInput ? 'scale(1)' : 'scale(0.8)',
                  }}
                />
                {!showSearchInput && (
                  <span style={{ ...styles.link, color }}>Search</span>
                )}
              </div>
            );
          }

          return (
            <span
              key={sec}
              onClick={() => handleClick(sec)}
              onMouseEnter={() => setHovered(sec)}
              onMouseLeave={() => setHovered(null)}
              style={{ ...styles.link, color }}
            >
              <span style={{ position: 'relative', display: 'inline-block' }}>
                {sec.charAt(0).toUpperCase() + sec.slice(1)}
                <span
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    left: 0,
                    height: '2px',
                    width: isActive || isHovered ? '100%' : '0',
                    backgroundColor: '#EA5444',
                    transition: 'width 0.3s ease-in-out',
                  }}
                />
              </span>
            </span>
          );
        })}
      </div>

      <button
        style={styles.loginButton}
        onClick={() => navigate('/login')}
      >
        Login
      </button>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    position: 'relative',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 30px',
    top: 0,
    zIndex: 1000,
    width: '100%',
    backgroundColor: 'white',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    height: '70px',
  },
  logo: {
    height: '65px',
    width: 'auto',
  },
  centerLinks: {
    display: 'flex',
    gap: '50px',
    alignItems: 'center',
  },
  link: {
    fontSize: '17px',
    fontWeight: '500',
    paddingTop: '0.5px',
    paddingBottom: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    letterSpacing: '1.5px',
    transform: 'translateY(-2px)',
  },
  linkContainer: {
    position: 'relative',
    width: '100px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease-in-out',
  },
  searchInputRevealed: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 1,
    padding: '6px 16px',
    fontSize: '16px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    outline: 'none',
    fontFamily: 'sans-serif',
    transition: 'opacity 0.4s ease, transform 0.4s ease',
    transform: 'scale(1)',
  },
  loginButton: {
    padding: '6px 18px',
    backgroundColor: '#EA5444',
    color: 'white',
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    border: 'none',
    borderRadius: '4px',
    fontFamily: 'sans-serif',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
};

export default Navbar;
