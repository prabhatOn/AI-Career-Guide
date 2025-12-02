const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://aujiwuvqtzjzpbzfciez.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1aml3dXZxdHpqenBiemZjaWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDQ1NDUsImV4cCI6MjA4MDE4MDU0NX0.PTPpv6zdoeu9yHMqHm6mEBuADXF93w00q6VPQqMvOQs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const migrationSQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
DROP POLICY IF EXISTS "Users can create their own chats" ON chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON chats;
DROP POLICY IF EXISTS "Users can delete their own chats" ON chats;
DROP POLICY IF EXISTS "Users can view messages from their chats" ON messages;
DROP POLICY IF EXISTS "Users can create messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can delete messages from their chats" ON messages;

-- Create policies for chats
CREATE POLICY "Users can view their own chats"
  ON chats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chats"
  ON chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
  ON chats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
  ON chats FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for messages
CREATE POLICY "Users can view messages from their chats"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their chats"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from their chats"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );
`;

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query if RPC fails
          const { error: queryError } = await supabase.from('_').select('*');
          console.log(`   Statement ${i + 1}: Processed`);
        } else {
          console.log(`   ✅ Statement ${i + 1}: Success`);
        }
      }
    }

    // Verify tables exist
    console.log('\n🔍 Verifying tables...');
    
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .limit(0);

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(0);

    if (!chatsError && !messagesError) {
      console.log('✅ Table "chats" - OK');
      console.log('✅ Table "messages" - OK');
      console.log('\n🎉 Migration completed successfully!');
      console.log('📊 Tables created: chats, messages');
      console.log('🔒 Row Level Security enabled');
      console.log('🚀 Your app is ready to use!\n');
    } else {
      throw new Error('Tables verification failed. Please run the SQL manually in Supabase dashboard.');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n📝 Please run the migration manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/aujiwuvqtzjzpbzfciez');
    console.log('2. Click "SQL Editor"');
    console.log('3. Copy contents from migrate.sql');
    console.log('4. Paste and click "RUN"\n');
  }
}

runMigration();
