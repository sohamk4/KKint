import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OtpLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('sa');
    if (formData.email === "org1@gmail.com") {
      console.log('sad');
      const response = await fetch('http://localhost:3003/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
         navigate('/Organized');
      } else {
        alert(result.error || "Login failed.");
      }
    } else if (!otpSent) {
      const response = await fetch('/Login-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.message === "OTP sent successfully") {
        setOtpSent(true);
      } else {
        alert(result.error || "Error sending OTP.");
      }
    } else {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        window.location.href = result.redirect;
      } else {
        alert(result.error || "Login failed.");
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f4f4f4'
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', color: '#EA5444', marginBottom: '20px' }}>Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          {otpSent && (
            <div style={{ marginBottom: '15px' }}>
              <label>Enter OTP:</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
          )}
          <button type="submit" style={{
            width: '100%',
            backgroundColor: '#EA5444',
            color: 'white',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            {otpSent ? 'Verify OTP & Login' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/signup" style={{ color: '#EA5444', textDecoration: 'none' }}>
            New user? Signup
          </a>
        </p>
      </div>
    </div>
  );
};

export default OtpLogin;
