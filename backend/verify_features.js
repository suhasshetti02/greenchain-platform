const API_URL = 'http://localhost:3001/api';

async function verifyFeatures() {
  console.log('--- Feature Verification ---');
  
  // 1. Setup Donor & Receiver
  console.log('1. Auth Setup...');
  // Receiver
  const rEmail = 'receiver_feat@example.com';
  const rawPass = 'password123';
  let rToken = await getToken(rEmail, 'receiver', 'Receiver Feat');
  // Donor
  const dEmail = 'donor_feat@example.com';
  let dToken = await getToken(dEmail, 'donor', 'Donor Feat');

  console.log('   Tokens acquired.');

  // 2. Update Receiver Location
  console.log('\n2. Updating Receiver Location (NYC)...');
  const locRes = await fetch(`${API_URL}/users/me/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${rToken}` },
      body: JSON.stringify({ lat: 40.7128, lng: -74.0060, location_label: "New York, NY" })
  });
  console.log(`   Status: ${locRes.status}`);
  if (locRes.ok) console.log(`   Body: ${JSON.stringify(await locRes.json())}`);

  // 3. Create Donation (Donor)
  console.log('\n3. Creating Donation (Philly - ~150km away)...');
  // Philly coords: 39.9526, -75.1652
  const donRes = await fetch(`${API_URL}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dToken}` },
      body: JSON.stringify({
          title: "Philly Cheese Steaks",
          category: "Prepared",
          food_type: "cooked",
          quantity_lbs: 5,
          expiry_date: new Date(Date.now() + 86400000).toISOString(),
          prepared_at: new Date().toISOString(),
          location: "Philadelphia, PA",
          latitude: 39.9526,
          longitude: -75.1652,
          notes: "Hot"
      })
  });
  const donation = await donRes.json();
  console.log(`   Created ID: ${donation.id}`);

  // 4. List Available (Receiver) - Check Distance
  console.log('\n4. Listing Available (Expect Distance)...');
  const listRes = await fetch(`${API_URL}/donations/available`, {
      headers: { 'Authorization': `Bearer ${rToken}` }
  });
  const listData = await listRes.json();
  const found = listData.donations?.find(d => d.id === donation.id);
  if (found) {
      console.log(`   Found Donation. Distance: ${found.distance_km} km`);
      // Should be around 90-100 km (NYC to Philly)
  } else {
      console.error('   Donation NOT found in list.');
  }

  // 5. Claim Donation (Scheduled)
  console.log('\n5. Claiming with Schedule...');
  const scheduleTime = new Date(Date.now() + 3600000).toISOString();
  const claimRes = await fetch(`${API_URL}/donations/${donation.id}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${rToken}` },
      body: JSON.stringify({ scheduled_pickup: scheduleTime })
  });
  console.log(`   Claim Status: ${claimRes.status}`);

  // 6. Confirm Pickup (Donor)
  console.log('\n6. Confirming Pickup (Reputation Check)...');
  const confirmRes = await fetch(`${API_URL}/donations/${donation.id}/confirm-pickup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dToken}` },
      body: JSON.stringify({ confirmed: true })
  });
  const confirmData = await confirmRes.json();
  console.log(`   Confirm Body: ${JSON.stringify(confirmData)}`);
  
  // 7. Test Admin No-Show logic (Optional call)
  console.log('\n7. Triggering No-Show Check (Admin)...');
  const adminRes = await fetch(`${API_URL}/admin/check-no-shows`, {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${dToken}` } // Assuming donor works or ignored
  });
  console.log(`   Admin Job Status: ${adminRes.status}`);
}

async function getToken(email, role, name) {
    const login = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
    });
    if (login.ok) return (await login.json()).token;
    
    const reg = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123', name, role })
    });
    return (await reg.json()).token;
}

verifyFeatures();
