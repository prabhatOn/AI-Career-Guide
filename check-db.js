const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://aujiwuvqtzjzpbzfciez.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1aml3dXZxdHpqenBiemZjaWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDQ1NDUsImV4cCI6MjA4MDE4MDU0NX0.PTPpv6zdoeu9yHMqHm6mEBuADXF93w00q6VPQqMvOQs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTables() {
  console.log('🔍 Checking database tables...\n');

  try {
    // Try to query chats table
    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .limit(1);

    // Try to query messages table
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    console.log('📊 Database Status:\n');

    if (!chatsError) {
      console.log('✅ Table "chats" exists and is accessible');
    } else {
      console.log('❌ Table "chats" does not exist or is not accessible');
      console.log(`   Error: ${chatsError.message}`);
    }

    if (!messagesError) {
      console.log('✅ Table "messages" exists and is accessible');
    } else {
      console.log('❌ Table "messages" does not exist or is not accessible');
      console.log(`   Error: ${messagesError.message}`);
    }

    if (chatsError || messagesError) {
      console.log('\n📝 Tables need to be created. Please follow these steps:\n');
      console.log('1. Open Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/aujiwuvqtzjzpbzfciez\n');
      console.log('2. Click "SQL Editor" in the left sidebar\n');
      console.log('3. Click "New Query"\n');
      console.log('4. Copy the entire content from migrate.sql file\n');
      console.log('5. Paste into the SQL editor\n');
      console.log('6. Click "RUN" button (or press Ctrl+Enter)\n');
      console.log('7. You should see success messages\n');
      console.log('Then run this check again: node check-db.js\n');
    } else {
      console.log('\n🎉 All tables are set up correctly!');
      console.log('🚀 Your app is ready to use!\n');
      console.log('📱 To run the app, use: npx expo start\n');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

checkTables();
