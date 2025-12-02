const fs = require('fs');
const https = require('https');

const PROJECT_REF = 'aujiwuvqtzjzpbzfciez';

// Read the SQL file
const sqlContent = fs.readFileSync('migrate.sql', 'utf8');

console.log('🚀 Setting up Supabase database...\n');
console.log('📄 SQL Content loaded from migrate.sql\n');

// Extract individual SQL statements
const statements = sqlContent
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^DO \$\$/));

console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

// For now, let's create tables using a direct approach
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://aujiwuvqtzjzpbzfciez.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1aml3dXZxdHpqenBiemZjaWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDQ1NDUsImV4cCI6MjA4MDE4MDU0NX0.PTPpv6zdoeu9yHMqHm6mEBuADXF93w00q6VPQqMvOQs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function attemptTableCreation() {
  console.log('🔨 Attempting to create tables using Supabase client...\n');
  
  try {
    // First, let's try to create a simple test to see if we can create tables
    console.log('⏳ Testing database connection...');
    
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['chats', 'messages']);
    
    if (error) {
      console.log('❌ Cannot query information_schema, need service_role key');
      console.log('\n📋 Manual Setup Required:');
      console.log('1. Go to: https://supabase.com/dashboard/project/aujiwuvqtzjzpbzfciez/editor');
      console.log('2. Click "New Query"');
      console.log('3. Copy ALL content from migrate.sql file');
      console.log('4. Paste and click RUN');
      console.log('\n📄 SQL to copy:');
      console.log('─'.repeat(50));
      console.log(sqlContent);
      console.log('─'.repeat(50));
      return;
    }

    console.log('✅ Database connection successful');
    
    if (data && data.length > 0) {
      console.log(`✅ Found ${data.length} existing tables:`, data.map(t => t.table_name));
    } else {
      console.log('📝 No tables found - need to create them');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Try to verify what we can access
  console.log('\n🔍 Checking table access...');
  
  try {
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .limit(1);

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (!chatsError && !messagesError) {
      console.log('✅ Tables exist and are accessible!');
      console.log('🎉 Database is ready!');
      return true;
    } else {
      console.log('❌ Tables do not exist or are not accessible');
      if (chatsError) console.log(`   Chats error: ${chatsError.message}`);
      if (messagesError) console.log(`   Messages error: ${messagesError.message}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Access check failed:', error.message);
    return false;
  }
}

attemptTableCreation().then(success => {
  if (!success) {
    console.log('\n📋 QUICK SETUP GUIDE:');
    console.log('1. Open this link: https://supabase.com/dashboard/project/aujiwuvqtzjzpbzfciez/editor');
    console.log('2. Click "New Query" button');
    console.log('3. Copy the content from migrate.sql file in this folder');
    console.log('4. Paste it in the SQL editor');
    console.log('5. Click "RUN" button');
    console.log('6. Run: node check-db.js to verify');
    console.log('\n💡 The migrate.sql file contains all the necessary SQL commands.');
  }
});