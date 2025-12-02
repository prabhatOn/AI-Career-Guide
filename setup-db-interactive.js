const https = require('https');

const PROJECT_REF = 'aujiwuvqtzjzpbzfciez';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

console.log('\n🔐 Supabase Service Role Key Required\n');
console.log('To create database tables, we need your service_role key.\n');
console.log('📝 How to get it:');
console.log(`1. Open: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api`);
console.log('2. Scroll to "Project API keys"');
console.log('3. Click "Reveal" next to "service_role" key');
console.log('4. Copy the key\n');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Paste your service_role key here: ', (serviceKey) => {
  rl.close();
  
  if (!serviceKey || serviceKey.trim().length < 20) {
    console.log('\n❌ Invalid key. Please try again.\n');
    process.exit(1);
  }

  runFullSetup(serviceKey.trim());
});

async function runFullSetup(serviceKey) {
  console.log('\n🚀 Starting database setup...\n');

  const sqlStatements = [
    {
      name: 'Create chats table',
      sql: `
        CREATE TABLE IF NOT EXISTS chats (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          title TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'Create messages table',
      sql: `
        CREATE TABLE IF NOT EXISTS messages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'Create indexes',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
        CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
      `
    },
    {
      name: 'Enable Row Level Security',
      sql: `
        ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
      `
    },
    {
      name: 'Create RLS policies for chats',
      sql: `
        DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
        DROP POLICY IF EXISTS "Users can create their own chats" ON chats;
        DROP POLICY IF EXISTS "Users can update their own chats" ON chats;
        DROP POLICY IF EXISTS "Users can delete their own chats" ON chats;
        
        CREATE POLICY "Users can view their own chats" ON chats FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can create their own chats" ON chats FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own chats" ON chats FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own chats" ON chats FOR DELETE USING (auth.uid() = user_id);
      `
    },
    {
      name: 'Create RLS policies for messages',
      sql: `
        DROP POLICY IF EXISTS "Users can view messages from their chats" ON messages;
        DROP POLICY IF EXISTS "Users can create messages in their chats" ON messages;
        DROP POLICY IF EXISTS "Users can delete messages from their chats" ON messages;
        
        CREATE POLICY "Users can view messages from their chats" ON messages FOR SELECT 
        USING (EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));
        
        CREATE POLICY "Users can create messages in their chats" ON messages FOR INSERT 
        WITH CHECK (EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));
        
        CREATE POLICY "Users can delete messages from their chats" ON messages FOR DELETE 
        USING (EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));
      `
    }
  ];

  let completed = 0;
  
  for (const statement of sqlStatements) {
    process.stdout.write(`⏳ ${statement.name}... `);
    
    try {
      await executeSQL(serviceKey, statement.sql);
      console.log('✅');
      completed++;
      await sleep(200);
    } catch (error) {
      console.log('⚠️');
      console.log(`   ${error.message}`);
    }
  }

  console.log(`\n📊 Completed ${completed}/${sqlStatements.length} operations\n`);
  
  // Verify
  console.log('🔍 Verifying tables...\n');
  await verifyTables(serviceKey);
}

function executeSQL(serviceKey, sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`Status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function verifyTables(serviceKey) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, serviceKey);

    const { error: chatsError } = await supabase.from('chats').select('*').limit(0);
    const { error: messagesError } = await supabase.from('messages').select('*').limit(0);

    if (!chatsError) console.log('✅ Table "chats" is ready');
    if (!messagesError) console.log('✅ Table "messages" is ready');

    if (!chatsError && !messagesError) {
      console.log('\n🎉 Database setup completed successfully!');
      console.log('🚀 Your app is ready to use!\n');
      console.log('📱 Run the app: npx expo start\n');
    }
  } catch (error) {
    console.log('⚠️  Verification skipped:', error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
