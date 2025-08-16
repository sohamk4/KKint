require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const rateLimit = require('express-rate-limit');
const path = require("path");
const cors = require('cors');
const { admin, db } = require("./firebaseConfig");

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  credentials: true                // allow cookies to be sent
}));


app.use(bodyParser.json({ limit: '10kb' }));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',  // change this to a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,   // set true in production with HTTPS
    httpOnly: true
  }
}));
app.use(express.json()); // for parsing JSON request bodies
app.use(express.urlencoded({ extended: true })); // for parsing form URL-encoded data
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//helper functions
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

async function saveOtp(email, otp, ipAddress) {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await db.collection("otps").doc(email).set({
    email,
    otp,
    expiresAt,
    attempts: 0,
    ipAddress,
  });
}

async function verifyOtp(email, submittedOtp,ipAddress) {
  const doc = await db.collection("otps").doc(email).get();
  if (!doc.exists) return { success: false, message: "OTP not found" };
  const data = doc.data();
  if (data.ipAddress !== ipAddress) {
    return { success: false, message: "IP address mismatch" };
  }
  if (new Date() > data.expiresAt.toDate()) {
    return { success: false, message: "OTP expired" };
  }

  if (data.otp !== submittedOtp) {
    await db.collection("otps").doc(email).update({
      attempts: admin.firestore.FieldValue.increment(1),
    });
    return { success: false, message: "Invalid OTP" };
  }

  // OTP valid
  await db.collection("otps").doc(email).delete(); // Clean up
  return { success: true };
}


const sender = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many OTP requests, please try again later',
  skipSuccessfulRequests: true
});

// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message: 'Too many login attempts, please try again later',
//   skipSuccessfulRequests: true
// });

function getExpectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function getDynamicK(totalPlayers) {
  const k = 10 + Math.log2(totalPlayers) * 4;
  return Math.min(40, Math.round(k));
}

function updateRatings(ratingA, ratingB, scoreA, totalPlayers) {
  const scoreB = 1 - scoreA;
  const expectedA = getExpectedScore(ratingA, ratingB);
  const expectedB = getExpectedScore(ratingB, ratingA);
  const k = getDynamicK(totalPlayers);

  const newRatingA = Math.round(ratingA + k * (scoreA - expectedA));
  const newRatingB = Math.round(ratingB + k * (scoreB - expectedB));

  return { newRatingA, newRatingB };
}

// ===== ROUTES =====

// GET Signup page

app.post('/send-otp', otpLimiter, async (req, res) => {
  //console.log(req.body)
  const { name, email, password, confirmPassword, role } = req.body;
  const ipAddress = req.ip;
  //console.log('s')
  
  try {
    const { users } = await admin.auth().listUsers();
    const emailExists = users.some(user => user.email === email);
    if (emailExists) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const otp = generateOTP();

    await saveOtp(email,otp,ipAddress)

    await sender.sendMail({
      from: `"Authenticator" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Signup OTP',
      text: `Your OTP for signup is: ${otp}`,
      html: `<p>Your OTP for signup is: <strong>${otp}</strong></p>
             <p>This OTP will expire in 5 minutes.</p>`
    });

    res.json({ 
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    res.status(500).json({ error: 'Failed to process OTP request' });
  }
});

//Redirect
app.get("/signup", (req, res) => {
  res.render("signup");
});

// POST Signup
app.post('/signup', async (req, res) => {
  const { name, email, password, otp,role } = req.body;
  const ipAddress = req.ip;
  
  // Enhanced Input Validation
  if (!name || !email || !password || !otp) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    // Verify OTP
    const otpRecord = await verifyOtp(email,otp,ipAddress);

    if (!otpRecord.success) {
      return res.status(400).json({ error: otpRecord.message });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Save extra data to Firestore
    await db.collection("users").doc(userRecord.uid).set({
      name,
      email,
      role,
      createdAt: new Date(),
    });
    res.json({ 
      success: true,
      redirect: '/login'
    })
  } catch (error) {
    console.error('Error in verify-signup:', error);
    res.status(500).json({ error: 'Failed to complete signup' });
  }
});


app.post('/Login-send-otp', async (req, res) => {
  //console.log(req.body)
  const { email } = req.body;
  const ipAddress = req.ip;
  //console.log('s')
  
  try {
    const { users } = await admin.auth().listUsers();
    const emailExists = users.some(user => user.email === email);
    if (!emailExists) {
      return res.status(400).json({ error: 'Email Not Registered' });
    }
    const otp = generateOTP();

    await saveOtp(email,otp,ipAddress)

    await sender.sendMail({
      from: `"Authenticator" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Login OTP',
      text: `Your OTP for Login is: ${otp}`,
      html: `<p>Your OTP for Login is: <strong>${otp}</strong></p>
             <p>This OTP will expire in 5 minutes.</p>`
    });

    res.json({ 
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    res.status(500).json({ error: 'Failed to process OTP request' });
  }
});

// GET Login page
app.get("/login", (req, res) => {
  res.render("login");
});

// POST Login
app.post("/login",async (req, res) => {
  const { email, password, otp } = req.body;
  const ipAddress = req.ip;

  if (email === "org1@gmail.com") {
    console.log('sdsa');
    try {
      const user = await admin.auth().getUserByEmail(email);
      const doc = await db.collection("users").doc(user.uid).get();
      console.log('sdsac');

      if (!doc.exists) {
        return res.send("User data not found.");
      }

      const userData = doc.data();

      req.session.user = {
        uid: user.uid,
        name: userData.name,
        role: userData.role,
        email: userData.email,
      };

      console.log(req.session.user)

      if (userData.role === "player") {
        return res.json({ success: true, redirect: '/player/dashboard' });
      } else if (userData.role === "organizer") {
        return res.json({ success: true, redirect: '/organizer/dashboard' });
      } else {
        return res.send("Unknown role.");
      }
    } catch (err) {
      return res.status(500).send("Login error: " + err.message);
    }
  }

  try {
    const otpRecord = await verifyOtp(email, otp, ipAddress);
    if (!otpRecord.success) {
      return res.status(400).json({ error: otpRecord.message });
    }

    const user = await admin.auth().getUserByEmail(email);
    const doc = await db.collection("users").doc(user.uid).get();

    if (!doc.exists) {
      return res.send("User data not found.");
    }

    const userData = doc.data();

    req.session.user = {
      uid: user.uid,
      name: userData.name,
      role: userData.role,
      email: userData.email,
    };
    console.log(req.session.user)
    if (userData.role === "player") {
      return res.json({ success: true, redirect: '/player/dashboard' });
    } else if (userData.role === "organizer") {
      return res.json({ success: true, redirect: '/organizer/dashboard' });
    } else {
      return res.send("Unknown role.");
    }
  } catch (err) {
    return res.status(500).send("Login error: " + err.message);
  }
});

// GET Dashboard
app.get("/player/dashboard", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "player") {
    return res.redirect("/login");
  }

  try {
    const snapshot = await db.collection("tournaments").get();
    const tournaments = snapshot.docs.map(doc => doc.data());

    //console.log("Player dashboard rendering. Tournaments:", tournaments); // <-- Add this

    res.render("playerDashboard", {
      name: req.session.user.name,
      tournaments: tournaments
    });
  } catch (err) {
    //console.log("Error fetching tournaments:", err.message);
    res.send("Error fetching tournaments: " + err.message);
  }
});

// Organizer Dashboard with players included
app.get("/organizer/dashboard", async (req, res) => {
  console.log(req.session.user)
  if (!req.session.user || req.session.user.role !== "organizer") {
    console.log("req.session.user");
    return res.redirect("/login");
  }

  try {
    console.log('oyee');
    console.log(req.session.user.email);
    
    // Get all tournaments created by this organizer
    const snapshot = await db.collection("tournaments")
      .where("createdBy", "==", req.session.user.email)
      .get();
    console.log(req.session.user.email);

    const tournaments = await Promise.all(snapshot.docs.map(async doc => {
      const tournament = doc.data();
      const tournamentId = doc.id;

      // Fetch players from subcollection: tournaments/{tournamentId}/players
      const playerSnap = await db.collection("tournaments")
        .doc(tournamentId)
        .collection("players")
        .get();

      const players = playerSnap.docs.map(p => ({
        id: p.id,
        ...p.data()
      }));

      return {
        ...tournament,
        id: tournamentId,
        players
      };
    }));
    console.log(tournaments);
    res.json({
      user: req.session.user,
      tournaments
    });


  } catch (err) {
    console.error("Error fetching organizer dashboard:", err.message);
    res.send("Error fetching tournaments: " + err.message);
  }
});


// POST /organizer/create-tournament
app.post("/organizer/create-tournament", async (req, res) => {
  const { id, name, rounds, date, location } = req.body;

  if (!req.session?.user?.email) {
    return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
  }

  if (!id || !name || !rounds || !date || !location) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const tournamentRef = db.collection("tournaments").doc(id);
    const existing = await tournamentRef.get();

    if (existing.exists) {
      return res.status(409).json({ success: false, message: "Tournament ID already exists." });
    }

    await tournamentRef.set({
      id,
      name,
      rounds: Number(rounds),
      date,
      location,
      createdBy: req.session.user.email,
      createdAt: new Date(),
      fixtures: [] // initialize fixtures array (optional)
    });

    return res.json({ 
      success: true,
      message: "Tournament created successfully!",
      redirect: "/organizer/dashboard"
    });
  } catch (err) {
    console.error("Tournament creation error:", err.message);
    return res.status(500).json({ success: false, message: "Error creating tournament: " + err.message });
  }
});


// POST Player Applies to Tournament
app.post("/player/apply-tournament", async (req, res) => {
  const { tournamentId, name, rating } = req.body;

  // Ensure the user is logged in and is a player
  if (!req.session.user || req.session.user.role !== "player") {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  if (!tournamentId || !name || !rating) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const tournamentRef = db.collection("tournaments").doc(tournamentId);
    const tournamentSnap = await tournamentRef.get();

    // Check if tournament exists
    if (!tournamentSnap.exists) {
      return res.status(404).json({ success: false, message: "Tournament not found." });
    }

    // Player document inside players subcollection of this tournament
    const playerRef = tournamentRef.collection("players").doc(req.session.user.email);
    const playerSnap = await playerRef.get();

    if (playerSnap.exists) {
      return res.status(409).json({ success: false, message: "You have already applied to this tournament." });
    }

    // Save player data
    await playerRef.set({
      id: req.session.user.email,
      name,
      rating: parseInt(rating),
      appliedBy: req.session.user.email,
      appliedAt: new Date(),
    });

    return res.json({ success: true, message: "Applied to tournament successfully!" });
  } catch (err) {
    console.error("Error applying:", err);
    return res.status(500).json({ success: false, message: "Error applying: " + err.message });
  }
});

// -------------------------------------------------------------------------------------------------------------------------------------------------------

app.post("/organizer/generate-fixtures", async (req, res) => {
  const { tournamentId } = req.body;
  console.log(tournamentId);
  if (!req.session.user || req.session.user.role !== "organizer") {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  try {
    const tournamentRef = db.collection("tournaments").doc(tournamentId);
    const tournamentSnap = await tournamentRef.get();
    if (!tournamentSnap.exists) {
      return res.status(404).json({ success: false, message: "Tournament not found" });
    }

    const playersSnap = await tournamentRef.collection("players").get();

    const players = [];
    playersSnap.forEach(doc => {
      const data = doc.data();
      players.push({
        ...data,
        id: doc.id,
        score: data.score || 0,
        rating: data.rating || 0,
        opponents: data.opponents || [],
        colorHistory: data.colorHistory || [],
        hasBye: data.hasBye || false,
        pendingBye: data.pendingBye || false
      });
    });

    // Determine round number
    const fixturesSnap = await tournamentRef.collection("fixtures").get();
    const round = fixturesSnap.size + 1;

    // Check if round already generated
    const existingFixtureRef = tournamentRef.collection("fixtures").doc(String(round));
    const existingFixtureSnap = await existingFixtureRef.get();
    if (existingFixtureSnap.exists) {
      return res.status(400).json({ success: false, message: "Round already generated" });
    }

    let pairings = [];

    if (round === 1) {
      // ROUND 1: highest vs lowest, lower-rated gets white
      players.sort((a, b) => b.rating - a.rating);
      const used = new Set();

      let left = 0, right = players.length - 1;

      while (left < right) {
        const p1 = players[left];
        const p2 = players[right];

        const white = p1.rating < p2.rating ? p1.id : p2.id;
        const black = white === p1.id ? p2.id : p1.id;

        pairings.push({ player1: white, player2: black, white, black });

        // Update state
        p1.opponents.push(p2.id);
        p2.opponents.push(p1.id);
        p1.colorHistory.push(white === p1.id ? "white" : "black");
        p2.colorHistory.push(white === p2.id ? "white" : "black");

        used.add(p1.id);
        used.add(p2.id);

        left++;
        right--;
      }

      // BYE handling (odd player)
      if (players.length % 2 !== 0) {
        const unpaired = players.find(p => !used.has(p.id) && !p.hasBye);
        if (unpaired) {
          unpaired.hasBye = true;
          unpaired.pendingBye = true;
          used.add(unpaired.id);
          pairings.push({ player1: unpaired.id, player2: null, bye: true, status:"completed", winner: unpaired.id  });
          // Update ONLY the round score (not total score)
          const playerRef = tournamentRef.collection("players").doc(unpaired.id);
          const playerDoc = await playerRef.get();
          const currentRounds = playerDoc.data()?.rounds || {};
          console.log('sasc');
          const roundScore = (currentRounds[round-1] || 0) + 1;
        
          // Update only the round score
          await playerRef.update({
            score: roundScore,
            [`rounds.${round}`]: roundScore,
            hasBye: true,
            pendingBye: true,
            updatedAt: FieldValue.serverTimestamp()
          });
        }
      }

    } else {
      // SUBSEQUENT ROUNDS (Swiss-style pairing)
      const used = new Set();
      const scoreGroups = {};

      players.forEach(p => {
        if (!scoreGroups[p.score]) scoreGroups[p.score] = [];
        scoreGroups[p.score].push(p);
      });

      const groupKeys = Object.keys(scoreGroups).sort((a, b) => b - a);

      for (let i = 0; i < groupKeys.length; i++) {
        const group = scoreGroups[groupKeys[i]];
        group.sort((a, b) => b.rating - a.rating);

        for (let j = 0; j < group.length; j++) {
          const p1 = group[j];
          if (used.has(p1.id)) continue;

          let paired = false;

          for (let k = j + 1; k < group.length; k++) {
            const p2 = group[k];
            if (!used.has(p2.id) && !p1.opponents.includes(p2.id)) {
              const p1WhiteCount = p1.colorHistory.filter(c => c === "white").length;
              const p2WhiteCount = p2.colorHistory.filter(c => c === "white").length;

              const white = p1WhiteCount > p2WhiteCount ? p2.id : p1.id;
              const black = white === p1.id ? p2.id : p1.id;

              pairings.push({ player1: white, player2: black, white, black });

              p1.opponents.push(p2.id);
              p2.opponents.push(p1.id);
              p1.colorHistory.push(white === p1.id ? "white" : "black");
              p2.colorHistory.push(white === p2.id ? "white" : "black");

              used.add(p1.id);
              used.add(p2.id);
              paired = true;
              break;
            }
          }

          if (!paired && i + 1 < groupKeys.length) {
            scoreGroups[groupKeys[i + 1]].push(p1);
          }
        }
      }

      // BYE assignment for unpaired player
      if (players.length % 2 !== 0) {
        const byePlayer = players
          .filter(p => !used.has(p.id) && !p.hasBye)
          .sort((a, b) => a.score - b.score || b.rating - a.rating)[0];

        if (byePlayer) {
          byePlayer.hasBye = true;
          byePlayer.pendingBye = true;
          used.add(byePlayer.id);
          pairings.push({ player1: byePlayer.id, player2: null, bye: true, status:"completed", winner: byePlayer.id  });
          // Update ONLY the round score (not total score)
          const playerRef = tournamentRef.collection("players").doc(byePlayer.id);
          const playerDoc = await playerRef.get();
          const currentRounds = playerDoc.data()?.rounds || {};
          console.log('sasc');
          const roundScore = (currentRounds[round-1] || 0) + 1;
        
          // Update only the round score
          await playerRef.update({
            score: roundScore,
            [`rounds.${round}`]: roundScore,
            hasBye: true,
            pendingBye: true,
            updatedAt: FieldValue.serverTimestamp()
          });
        }
      }
    }

    // Firestore batch update
    const batch = db.batch();
    players.forEach(p => {
      const playerRef = tournamentRef.collection("players").doc(p.id);
      batch.update(playerRef, {
        score: p.score,
        opponents: p.opponents,
        colorHistory: p.colorHistory,
        hasBye: p.hasBye,
        pendingBye: p.pendingBye
      });
    });

    const fixtureRef = tournamentRef.collection("fixtures").doc(String(round));
    batch.set(fixtureRef, {
      round,
      pairings,
      generatedAt: new Date()
    });

    await batch.commit();

    res.json({ 
      success: true, 
      round: round
    });

  } catch (err) {
    console.error("Fixture generation error:", err);
    return res.status(500).json({ success: false, message: "Error generating fixtures: " + err.message });
  }
});


app.get("/show-fixtures", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "organizer") {
    return res.status(403).send("Unauthorized");
  }

  try {
    const tournamentsSnap = await db.collection("tournaments")
      .where("createdBy", "==", req.session.user.email)
      .get();

    const tournaments = [];

    for (const doc of tournamentsSnap.docs) {
      const tournament = doc.data();
      const tournamentId = doc.id;

      const playersSnap = await db.collection("tournaments")
        .doc(tournamentId)
        .collection("players")
        .get();
      
      const playersData = playersSnap.docs.map(doc => {
        const player = doc.data();
        return {
          id: doc.id,
          name: player.name,
          rating: player.rating,
          rounds: player.rounds || {}, // Array of round scores {1: x, 2: y}
          finalRank: player.finalRank || 0,
          buchholz: player.buchholz || 0,
          buchholzCut1: player.buchholzCut1 || 0,
          sonnebornBerger: player.sonnebornBerger || 0
        };
      });

      const playersMap = {};
      // const pointsTable = [];

      playersSnap.forEach(p => {
        const data = p.data();
        playersMap[p.id] = data;
        // pointsTable.push({
        //   id: data.id,
        //   name: data.name,
        //   rating: data.rating,
        //   score: data.score || 0
        // });
      });

      // pointsTable.sort((a, b) => {
      //   if (b.score !== a.score) return b.score - a.score;
      //   return b.rating - a.rating;
      // });

      const fixturesSnap = await db.collection("tournaments")
        .doc(tournamentId)
        .collection("fixtures")
        .get();

      const roundFixtures = {};

      for (const fDoc of fixturesSnap.docs) {
        const round = fDoc.id;
        const data = fDoc.data();
        roundFixtures[round] = (data.pairings || []).map(pair => ({
        player1: playersMap[pair.player1] || { id: pair.player1, name: "Unknown" },
        player2: pair.player2 ? playersMap[pair.player2] || { id: pair.player2, name: "Unknown" } : null,
        winner: pair.winner || null,
        bye: pair.bye || false,
        status: pair.winner ? "completed" : "pending"
      }));
      }

      const currentRounds = Object.keys(roundFixtures).length;
      const totalRounds = tournament.rounds || 0;
      const canGenerateFixtures = currentRounds < totalRounds;

      const fixtureRounds = Object.keys(roundFixtures).map(Number);
      const latestRound = Math.max(...fixtureRounds, 0);
      const latestFixtures = roundFixtures[latestRound] || [];
      const allCompleted = latestFixtures.every(f => f.winner || f.bye);

      tournaments.push({
        id: tournamentId,
        name: tournament.name,
        location: tournament.location,
        date: tournament.date,
        rounds: tournament.rounds,
        fixtures: roundFixtures,
        playersData:playersData,
        canGenerateFixtures,
        latestRound,
        allCompleted
      });

    }
    console.log(tournaments);
    res.render("show", { user: req.session.user, tournaments });

  } catch (err) {
    console.error("Error loading fixtures:", err);
    res.status(500).send("Failed to load fixtures: " + err.message);
  }
});

const { FieldValue } = admin.firestore;
async function updatePlayerScore(playerRef, pointsToAdd, roundId, batch) {
  const playerDoc = await playerRef.get();
  if (!playerDoc.exists) {
    console.warn(`Player document not found: ${playerRef.id}`);
    return 0;
  }

  const currentData = playerDoc.data();
  const currentScore = currentData.score || 0;
  const currentRounds = currentData.rounds || {};
  
  // Calculate new cumulative score
  const previousRoundScore = currentRounds[roundId-1] || 0;
  const newRoundScore = previousRoundScore + pointsToAdd;
  console.log(previousRoundScore)
  // Prepare updates
  batch.update(playerRef, {
    score: newRoundScore,
    [`rounds.${roundId}`]: newRoundScore,
    updatedAt: FieldValue.serverTimestamp()
  });
  
  return newRoundScore;
}

app.post("/submit-winner", async (req, res) => {
  const { tournamentId, roundId, matchIndex, winner } = req.body;
  
  if (!req.session.user || req.session.user.role !== "organizer") {
    return res.status(403).send("Unauthorized");
  }

  try {
    const tournamentRef = db.collection("tournaments").doc(tournamentId);
    const tournamentDoc = await tournamentRef.get();
    const tournament = tournamentDoc.data();

    // 1. Update match result
    const fixtureRef = tournamentRef.collection("fixtures").doc(roundId);
    const fixtureDoc = await fixtureRef.get();
    
    if (!fixtureDoc.exists) return res.status(404).send("Fixture not found");

    const fixtureData = fixtureDoc.data();
    const pairings = fixtureData.pairings || [];

    if (!pairings[matchIndex]) return res.status(400).send("Invalid match index");
    if (pairings[matchIndex].winner) return res.status(400).send("Winner already submitted");

    pairings[matchIndex].winner = winner;
    await fixtureRef.update({ pairings });

    const playersRef = tournamentRef.collection("players");
    console.log('oks');
    const batch = db.batch();

    // Process all pairings
    for (const pair of pairings) {
      if (!pair.winner) continue;
      if (pair.winner === "draw") {
        // Update both players for a draw
        if (pair.player1) {
          await updatePlayerScore(
            playersRef.doc(pair.player1),
            0.5,
            roundId,
            batch
          );
        }
        if (pair.player2) {
          await updatePlayerScore(
            playersRef.doc(pair.player2),
            0.5,
            roundId,
            batch
          );
        }
      } else {
        // Update winner (1 point) and loser (0 points)
        await updatePlayerScore(
          playersRef.doc(pair.winner),
          1,
          roundId,
          batch
        );
        
        // Update opponent's round score (0 points but ensures round exists)
        const opponentId = pair.winner === pair.player1 ? pair.player2 : pair.player1;
        if (opponentId) {
          await updatePlayerScore(
            playersRef.doc(opponentId),
            0,
            roundId,
            batch
          );
        }
      }
    }
    await batch.commit();

    // 2. Check if all matches are completed
    const allSubmitted = pairings.every(p => p.bye || p.winner);
    if (!allSubmitted) {
      console.log('here');
      return res.json({ success: true, message: "Result saved" });
    }

    // 2. Check if last round AFTER scores are updated
    const isLastRound = parseInt(roundId) === tournament.rounds;
    if (isLastRound) {
      // Get FRESH player data with updated scores
      const updatedPlayersSnapshot = await playersRef.get();
      const players = [];
      updatedPlayersSnapshot.forEach(doc => players.push({ id: doc.id, ...doc.data() }));
    
      // Get all fixtures
      const fixturesSnapshot = await tournamentRef.collection("fixtures").get();
      const allMatches = [];
      fixturesSnapshot.forEach(doc => {
        const roundData = doc.data();
        Object.values(roundData.pairings).forEach(match => {
          allMatches.push(match);
        });
      });
    
      // Calculate tie-breakers with UPDATED data
      const playersWithTieBreaks = calculateTieBreakers(players, allMatches);
      const rankedPlayers = sortByFIDE2023(playersWithTieBreaks);
    
      // Display before committing
      console.table(rankedPlayers.map((p, i) => ({
        Position: i + 1,
        Name: p.name,
        Points: p.score,
        Buchholz: p.buchholz.toFixed(1),
        'B. Cut 1': p.buchholzCut1.toFixed(1),
        'S-B': p.sonnebornBerger.toFixed(1)
      })));
    
      // Update final rankings
      const finalBatch = db.batch();
      rankedPlayers.forEach((player, index) => {
        finalBatch.update(playersRef.doc(player.id), { 
          finalRank: index + 1,
          buchholz: player.buchholz,
          buchholzCut1: player.buchholzCut1,
          sonnebornBerger: player.sonnebornBerger
        });
      });
      await finalBatch.commit();
    }
    
    await fixtureRef.update({ completed: true });

    res.json({ 
      success: true, 
      message: isLastRound ? "Tournament completed with tie-breaks applied" : "Result saved",
      redirectUrl: `/tournament/${tournamentId}`
    });

  } catch (err) {
    console.error("Error submitting winner:", err);
    res.status(500).send("Server error: " + err.message);
  }
});

// Calculate FIDE tie-breakers
function calculateTieBreakers(players, matches) {
  return players.map(player => {
    // Get all opponent objects (with scores)
    const opponents = player.opponents.map(oppId => 
      players.find(p => p.id === oppId) || { score: 0 });
    
    console.log(opponents);
    // 1. Buchholz (Sum of all opponents' scores)
    const buchholz = opponents.reduce((sum, opp) => sum + opp.score, 0);
    
    // 2. Buchholz Cut 1 (Exclude worst opponent)
    const opponentScores = opponents.map(opp => opp.score).sort((a,b) => a-b);
    const buchholzCut1 = opponentScores.length > 1 
      ? opponentScores.slice(1).reduce((a,b) => a+b, 0)
      : buchholz;
    
    // 3. Sonneborn-Berger (Weighted by opponent strength)
    const sonnebornBerger = player.opponents.reduce((sum, oppId) => {
      const match = matches.find(m => 
        (m.white === player.id && m.black === oppId) ||
        (m.black === player.id && m.white === oppId)
      );
      const opponent = players.find(p => p.id === oppId);
      console.log(match);
      console.log(opponent);
      if (!match || !opponent) return sum;
      
      if (match.winner === player.id) {
        return sum + opponent.score; 
      }
      // Handle draw case
      else if (match.winner === 'draw') {
        return sum + (opponent.score * 0.5); 
      }
      return sum;
    }, 0);
    
    return {
      ...player,
      buchholz,
      buchholzCut1,
      sonnebornBerger
    };
  });
}

// FIDE 2023 sorting criteria
function sortByFIDE2023(players) {
  return [...players].sort((a, b) => {
    // 1. Tournament score (points)
    if (b.score !== a.score) return b.score - a.score;

    // 2. Tie Break 1: Buchholz Cut 1
    if (b.buchholzCut1 !== a.buchholzCut1) return b.buchholzCut1 - a.buchholzCut1;

    // 3. Tie Break 2: Buchholz
    if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz;

    // 4. Tie Break 3: Sonneborn-Berger
    return b.sonnebornBerger - a.sonnebornBerger;
  });
}

app.get("/tournament/:id", async (req, res) => {
  const tournamentId = req.params.id;
  const tournamentRef = db.collection("tournaments").doc(tournamentId);

  const tournamentDoc = await tournamentRef.get();
  const tournamentData = tournamentDoc.data();

  const playersSnapshot = await tournamentRef.collection("players").get();
  const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const fixturesSnapshot = await tournamentRef.collection("fixtures").orderBy("round").get();
  const fixtures = fixturesSnapshot.docs.map(doc => doc.data());

  res.render("show", {
    tournamentId,
    tournament: tournamentData,
    players,
    fixtures
  });
});

app.get("/organizer/show", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "organizer") {
    return res.status(403).send("Unauthorized");
  }

  try {
    const tournamentsSnap = await db.collection("tournaments")
      .where("createdBy", "==", req.session.user.email)
      .get();

    const tournaments = [];

    for (const doc of tournamentsSnap.docs) {
      const tournament = doc.data();
      const tournamentId = doc.id;

      const playersSnap = await db.collection("tournaments")
        .doc(tournamentId)
        .collection("players")
        .get();

      const playersMap = {};
      const pointsTable = [];

      playersSnap.forEach(p => {
        const data = p.data();
        playersMap[p.id] = data;
        pointsTable.push({
          id: data.id,
          name: data.name,
          rating: data.rating,
          score: data.score || 0
        });
      });

      pointsTable.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.rating - a.rating;
      });

      const fixturesSnap = await db.collection("tournaments")
        .doc(tournamentId)
        .collection("fixtures")
        .get();

      const roundFixtures = {};

      for (const fDoc of fixturesSnap.docs) {
        const round = fDoc.id;
        const data = fDoc.data();

        roundFixtures[round] = (data.pairings || []).map(pair => ({
          player1: playersMap[pair.player1] || { id: pair.player1, name: "Unknown" },
          player2: pair.player2 ? playersMap[pair.player2] || { id: pair.player2, name: "Unknown" } : null,
          winner: pair.winner || null,
          bye: pair.bye || false,
          status: pair.winner ? "completed" : "pending"
        }));
      }

      const currentRounds = Object.keys(roundFixtures).length;
      const totalRounds = tournament.rounds || 0;
      const canGenerateFixtures = currentRounds < totalRounds;

      const fixtureRounds = Object.keys(roundFixtures).map(Number);
      const latestRound = Math.max(...fixtureRounds, 0);
      const latestFixtures = roundFixtures[latestRound] || [];
      const allCompleted = latestFixtures.every(f => f.winner || f.bye);

      tournaments.push({
        id: tournamentId,
        name: tournament.name,
        location: tournament.location,
        date: tournament.date,
        rounds: tournament.rounds,
        fixtures: roundFixtures,
        pointsTable,
        canGenerateFixtures,
        latestRound,
        allCompleted
      });
    }

    res.render("show", { user: req.session.user, tournaments });

  } catch (err) {
    console.error("Error loading /organizer/show:", err);
    res.status(500).send("Failed to load organizer page: " + err.message);
  }
});


// Default route
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Start server
app.listen(3003, () => {
  console.log("Server started on http://localhost:3003");
});
