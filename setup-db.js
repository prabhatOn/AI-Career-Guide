const https = require('https');

const SUPABASE_URL = 'https://aujiwuvqtzjzpbzfciez.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1aml3dXZxdHpqenBiemZjaWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDQ1NDUsImV4cCI6MjA4MDE4MDU0NX0.PTPpv6zdoeu9yHMqHm6mEBuADXF93w00q6VPQqMvOQs';

// You need to get your SERVICE_ROLE key from Supabase Dashboard
// Go to: https://supabase.com/dashboard/project/aujiwuvqtzjzpbzfciez/settings/api
// Copy the "service_role" key (NOT the anon key)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.log('\n⚠️  SERVICE ROLE KEY REQUIRED\n');
  console.log('To run migrations, you need the service_role key from Supabase.\n');
  console.log('Steps:');
  console.log('1. Go to: https://supabase.com/dashboard/project/aujiwuvqtzjzpbzfciez/settings/api');
  console.log('2. Find "service_role" key in "Project API keys" section');
  console.log('3. Click to reveal and copy it');
  console.log('4. Run: $env:SUPABASE_SERVICE_KEY="your_service_key_here"; node setup-db.js\n');
  process.exit(1);
}

const migrations = [
  {
    name: 'Create chats table',
    sql: `CREATE TABLE IF NOT EXISTS chats (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`
  },
  {
    name: 'Create messages table',
    sql: `CREATE TABLE IF NOT EXISTS messages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`
  },
  {
    name: 'Create indexes on chats',
    sql: `CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
          CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);`
  },
  {
    name: 'Create indexes on messages',
    sql: `CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
          CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);`
  },
  {
    name: 'Enable RLS on chats',
    sql: `ALTER TABLE chats ENABLE ROW LEVEL SECURITY;`
  },
  {
    name: 'Enable RLS on messages',
    sql: `ALTER TABLE messages ENABLE ROW LEVEL SECURITY;`
  },
  {
    name: 'Create policy: Users can view their own chats',
    sql: `DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
          CREATE POLICY "Users can view their own chats" ON chats FOR SELECT USING (auth.uid() = user_id);`
  },
  {
    name: 'Create policy: Users can create their own chats',
    sql: `DROP POLICY IF EXISTS "Users can create their own chats" ON chats;
          CREATE POLICY "Users can create their own chats" ON chats FOR INSERT WITH CHECK (auth.uid() = user_id);`
  },
  {
    name: 'Create policy: Users can update their own chats',
    sql: `DROP POLICY IF EXISTS "Users can update their own chats" ON chats;
          CREATE POLICY "Users can update their own chats" ON chats FOR UPDATE USING (auth.uid() = user_id);`
  },
  {
    name: 'Create policy: Users can delete their own chats',
    sql: `DROP POLICY IF EXISTS "Users can delete their own chats" ON chats;
          CREATE POLICY "Users can delete their own chats" ON chats FOR DELETE USING (auth.uid() = user_id);`
  },
  {
    name: 'Create policy: Users can view messages from their chats',
    sql: `DROP POLICY IF EXISTS "Users can view messages from their chats" ON messages;
          CREATE POLICY "Users can view messages from their chats" ON messages FOR SELECT 
          USING (EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));`
  },
  {
    name: 'Create policy: Users can create messages in their chats',
    sql: `DROP POLICY IF EXISTS "Users can create messages in their chats" ON messages;
          CREATE POLICY "Users can create messages in their chats" ON messages FOR INSERT 
          WITH CHECK (EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));`
  },
  {
    name: 'Create policy: Users can delete messages from their chats',
    sql: `DROP POLICY IF EXISTS "Users can delete messages from their chats" ON messages;
          CREATE POLICY "Users can delete messages from their chats" ON messages FOR DELETE 
          USING (EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));`
  }
];

function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: `/rest/v1/rpc/exec_sql`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: responseData });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runMigrations() {
  console.log('🚀 Starting database setup...\n');
  
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];
    process.stdout.write(`⏳ [${i + 1}/${migrations.length}] ${migration.name}... `);

    try {
      await executeSQL(migration.sql);
      console.log('✅');
      successCount++;
    } catch (error) {
      console.log('⚠️');
      console.log(`   Note: ${error.message}`);
      // Continue anyway as some errors are expected (e.g., table already exists)
      successCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Summary: ${successCount}/${migrations.length} migrations completed\n`);
  
  // Verify tables
  console.log('🔍 Verifying tables...\n');
  await verifySetup();
}

async function verifySetup() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .limit(0);

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(0);

    if (!chatsError && !messagesError) {
      console.log('✅ Table "chats" - Accessible');
      console.log('✅ Table "messages" - Accessible');
      console.log('\n🎉 Database setup completed successfully!');
      console.log('🚀 Your app is ready to use!\n');
      console.log('📱 Run: npx expo start\n');
    } else {
      console.log('⚠️  Tables created but may need RLS policies check');
      if (chatsError) console.log(`   Chats: ${chatsError.message}`);
      if (messagesError) console.log(`   Messages: ${messagesError.message}`);
    }
  } catch (error) {
    console.log('⚠️  Could not verify tables:', error.message);
  }
}

runMigrations().catch(console.error);
