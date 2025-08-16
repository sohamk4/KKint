import React from 'react';

const placesData = [
  {
    name: 'ABC Turf',
    location: 'Andheri, Mumbai',
    image: '/images/turf.jpg',
    price: 'Rs.200',
    rating: '5.0',
  },
  {
    name: 'DEF Swimming Pool',
    location: 'Ghatkopar, Mumbai',
    image: '/images/pool.jpg',
    price: 'Rs.250',
    rating: '4.5',
  },
  {
    name: 'GHI Chess Tournament',
    location: 'Prabhadevi, Mumbai',
    image: '/images/chesst.jpg',
    price: 'Rs.350',
    rating: '3.4',
  },
  {
    name: 'JKL Badminton Court',
    location: 'Malad, Mumbai',
    image: '/images/badmintont.jpg',
    price: 'Rs.200',
    rating: '5.0',
  },
  {
    name: 'MNO Basketball Court',
    location: 'Lalbaug, Mumbai',
    image: '/images/basketballt.jpg',
    price: 'Rs.250',
    rating: '4.5',
  },
  {
    name: 'PQR Volleyball Court',
    location: 'Kharghar, Navi Mumbai',
    image: '/images/volleyballt.jpg',
    price: 'Rs.350',
    rating: '3.4',
  },
  {
    name: 'STU Cricket Ground',
    location: 'Chembur, Mumbai',
    image: '/images/crickett.jpg',
    price: 'Rs.300',
    rating: '4.2',
  },
  {
    name: 'VWX Tennis COurt',
    location: 'Goregaon, Mumbai',
    image: '/images/tennist.jpg',
    price: 'Rs.280',
    rating: '4.8',
  },
];

const Places = () => {
  return (
    <section style={styles.section}>
      {/* Header & Filter */}
      <div style={styles.headerBox}>
        <h2 style={styles.heading}>
          Your <span style={{ color: '#EA5444' }}>Game</span>. Your <span style={{ color: '#EA5444' }}>Venue</span>. One Click Away.
        </h2>
        <p style={styles.subheading}>
          Explore the Top-Rated Sports Locations for Your Next Tournament.
        </p>

        {/* Filter Bar */}
        <div style={styles.filterBar}>
          <div style={styles.filterItem}>
            <span role="img" aria-label="location">📍</span> Location
            <p style={styles.filterLabel}>Where are you going?</p>
          </div>
          <div style={styles.filterItem}>
            <span role="img" aria-label="person">👤</span> Person
            <p style={styles.filterLabel}>How many person?</p>
          </div>
          <div style={styles.filterItem}>
            <span role="img" aria-label="checkin">📅</span> Check In
            <p style={styles.filterLabel}>05 August 2023</p>
          </div>
          <div style={styles.filterItem}>
            <span role="img" aria-label="checkout">📅</span> Check Out
            <p style={styles.filterLabel}>16 August 2023</p>
          </div>
          <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
            <button style={styles.getStarted}>Get Started</button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={styles.grid}>
        {placesData.map((place, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.imageWrapper}>
              <img src={place.image} alt={place.name} style={styles.image} />
              <span style={styles.rating}>{place.rating} ★</span>
            </div>
            <div style={styles.info}>
              <h3 style={styles.placeName}>{place.name}</h3>
              <p style={styles.location}>{place.location}</p>
              <div style={styles.priceTag}>{place.price}</div>
            </div>
          </div>
        ))}
      </div>

      <button style={styles.viewMore}>View More</button>
    </section>
  );
};

const styles = {
  section: {
    padding: '60px 40px 50px',
    background: '#f9f9f9',
    borderRadius: '25px',
    boxShadow: '0 20px 30px rgba(0,0,0,0.15), 0 -20px 30px rgba(0,0,0,0.1), 20px 0 30px rgba(0,0,0,0.05), -20px 0 30px rgba(0,0,0,0.05)',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    marginBottom: '35px',
    overflow: 'visible',
  },
  headerBox: {
    backgroundColor: '#fff',
    padding: '40px 30px',
    borderRadius: '30px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
    marginBottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heading: {
    fontSize: '35px',
    fontWeight: '800',
    margin: '0 0 12px 0',
    textAlign: 'center',
  },
  subheading: {
    fontSize: '14px',
    color: '#777',
    marginBottom: '25px',
    textAlign: 'center',
  },
  filterBar: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '20px',
    borderRadius: '15px',
    background: '#f5f5f5',
    width: '100%',
  },
  filterItem: {
    flex: '1',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: '14px',
    minWidth: '130px',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: 'normal',
    color: '#777',
    marginTop: '4px',
  },
  getStarted: {
    backgroundColor: '#EA5444',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '25px',
    marginTop: '30px',
  },
  card: {
    background: '#fff',
    borderRadius: '15px',
    boxShadow: '0 12px 25px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrapper: {
    position: 'relative',
    height: '180px',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  rating: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#fff',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  info: {
    padding: '16px',
    textAlign: 'left',
    position: 'relative',
  },
  placeName: {
    margin: '0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#333',
  },
  location: {
    fontSize: '13px',
    color: '#777',
    marginBottom: '10px',
  },
  priceTag: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    backgroundColor: '#fff4e6',
    color: '#ea6544',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '10px',
    fontSize: '13px',
  },
  viewMore: {
    marginTop: '40px',
    backgroundColor: '#EA5444',
    border: 'none',
    color: '#fff',
    padding: '10px 24px',
    fontSize: '18px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
  },
};

export default Places;
