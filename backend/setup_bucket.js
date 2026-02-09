
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBucket() {
  console.log('Creating "donations" bucket...');
  const { data, error } = await supabase.storage.createBucket('donations', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  });

  if (error) {
    console.error('Error creating bucket:', error);
    // If it already exists, just try to update it to public
    if (error.message.includes('already exists')) {
        console.log('Bucket already exists. Updating to public...');
        const { data: updateData, error: updateError } = await supabase.storage.updateBucket('donations', {
            public: true,
            fileSizeLimit: 5242880,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        });
        if (updateError) {
            console.error('Error updating bucket:', updateError);
        } else {
            console.log('Bucket updated successfully.');
        }
    }
    return;
  }

  console.log('Bucket created successfully:', data);
}

setupBucket();
