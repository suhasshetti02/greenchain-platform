
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Error listing buckets:', error);
    return;
  }

  console.log('Buckets:', data);
  
  const donationsBucket = data.find(b => b.name === 'donations');
  if (donationsBucket) {
    console.log('Donations bucket exists.');
    console.log('Is public:', donationsBucket.public);
  } else {
    console.log('Donations bucket DOES NOT exist.');
  }
}

checkBuckets();
