// Native fetch used (Node 18+)
const API_URL = 'http://localhost:3001/api';
const EMAIL = 'verifier@example.com';
const PASSWORD = 'password123';

async function verify() {
  console.log('1. Registering/Logging in User...');
  let token;
  
  try {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    
    if (loginRes.ok) {
        const data = await loginRes.json();
        token = data.token;
        console.log('   Logged in successfully.');
    } else {
        // Try registering
        const regRes = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: EMAIL, password: PASSWORD, name: 'Verifier', role: 'receiver' })
        });
        const data = await regRes.json();
        token = data.token;
         console.log('   Registered successfully.');
    }
  } catch (e) {
      console.error('   Auth failed:', e.message);
      return;
  }

  console.log('\n2. Fetching Available Donations (No Location)...');
  const res1 = await fetch(`${API_URL}/donations/available`, {
      headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res1.ok) {
      const data1 = await res1.json();
      console.log(`   Count: ${data1.donations?.length}`);
  } else {
      console.log(`   Error: ${res1.status}`);
  }

  console.log('\n3. Fetching Available Donations (With Location: NYC)...');
  const lat = 40.7128;
  const lng = -74.0060;
  
  const res2 = await fetch(`${API_URL}/donations/available?lat=${lat}&lng=${lng}`, {
      headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (res2.ok) {
      const data2 = await res2.json();
      console.log(`   Count: ${data2.donations?.length}`);
      if (data2.donations?.length > 0) {
          console.log('   First item distance:', data2.donations[0].distance_km);
      }
  } else {
      console.log(`   Error: ${res2.status}`);
  }
  
  console.log('\n4. Fetching My Donations (Simulate Dashboard)...');
  // NOTE: This user is 'receiver' role (registered above). 
  // listMyDonations usually requires 'donor' role?
  // Let's create a 'donor' token if needed.
  
  // Register a donor
  console.log('   Switching to Donor...');
  let donorToken;
  try {
      const donorEmail = 'verifier_donor@example.com';
      const r = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: donorEmail, password: PASSWORD, name: 'Donor Verifier', role: 'donor' })
      });
      if (!r.ok) {
           // login
           const l = await fetch(`${API_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: donorEmail, password: PASSWORD })
           });
           const d = await l.json();
           donorToken = d.token;
      } else {
           const d = await r.json();
           donorToken = d.token;
      }
  } catch(e) { console.log(e); }

  const res3 = await fetch(`${API_URL}/donations/mine`, {
      headers: { 'Authorization': `Bearer ${donorToken}` }
  });
  
  if (!res3.ok) {
      console.error(`❌ List Mine Failed: ${res3.status} ${res3.statusText}`);
      try {
          const errBody = await res3.text();
          console.error("   Error Body:", errBody);
      } catch (e) {}
  } else {
      const data3 = await res3.json();
      console.log(`✅ List Mine Success. Count: ${data3.donations?.length}`);
  }

  console.log('\n5. Creating a Test Donation to verify Fix...');
  // Needs FormData for file upload ideally, but backend accepts JSON if no file?
  // Backend uses multer. 'upload.single("image")'. 
  // If content-type is json, multer might skip? Or fail?
  // Let's rely on backend validation. Missing image might be allowed if optional?
  // Controller: imageUrl = await uploadDonationImage... if (file) ...
  // So it's optional.
  
  const newDonation = {
      title: "Test Apples",
      category: "Produce",
      food_type: "produce", // Lowercase to pass legacy logic too
      quantity_lbs: 10,
      unit: "lbs",
      expiry_date: new Date(Date.now() + 86400000).toISOString(),
      storage: "room_temp",
      location: "Test City",
      latitude: 40.7128,
      longitude: -74.0060,
      prepared_at: new Date().toISOString(),
      pickup_window_start: new Date().toISOString(),
      pickup_window_end: new Date(Date.now() + 3600000).toISOString(),
      notes: "Fresh"
  };

  // Multer expects multipart/form-data usually.
  // Converting to FormData simulation for fetch is hard in Node without library.
  // But we can try sending JSON. DonationController 'req.body' is populated by multer ONLY if multipart.
  // If JSON, express.json() populates it IF multer doesn't interfere.
  // 'upload.single' usually handles multipart.
  // If we send JSON, 'req.file' is undefined. 'req.body' should be populated if express.json() is used properly BEFORE/AFTER.
  // In server.js: app.use(express.json()); ... app.use('/api', routes);
  // Routes: router.post('/', verifyToken, upload.single...);
  // Multer typically handles parsing. It might ignore JSON body if content-type is application/json?
  // Or express.json() handles it?
  // Let's try JSON first.
  
  const createRes = await fetch(`${API_URL}/donations`, {
      method: 'POST',
      headers: { 
          'Authorization': `Bearer ${donorToken}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(newDonation)
  });

  if (createRes.ok) {
      const d = await createRes.json();
      console.log(`✅ Creation Success! ID: ${d.id}`);
      console.log(`   AI Priority: ${d.ai_priority} (Score: ${d.priority_score})`);
  } else {
      console.error(`❌ Creation Failed: ${createRes.status}`);
      try { console.error("   " + await createRes.text()); } catch(e){}
  }

}

verify();
