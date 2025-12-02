# Supabase Database Setup

## Quick Setup Script

Run this SQL in your Supabase SQL Editor to set up all required tables and policies:

```sql
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
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

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chats', 'messages');
```

## Verification Queries

After running the setup, verify everything is working:

```sql
-- Check if tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('chats', 'messages');

-- Check policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('chats', 'messages');
```

## Authentication Setup

1. Go to Authentication > Settings in Supabase Dashboard
2. Enable Email authentication
3. Configure email templates (optional)
4. Set up OAuth providers (optional)

## Testing the Database

You can test the setup with these queries (after creating a user):

```sql
-- Insert a test chat (replace user_id with actual user UUID)
INSERT INTO chats (user_id, title) 
VALUES ('your-user-uuid-here', 'Test Chat')
RETURNING *;

-- Insert a test message (replace chat_id with actual chat UUID)
INSERT INTO messages (chat_id, role, content)
VALUES ('your-chat-uuid-here', 'user', 'Hello, this is a test message')
RETURNING *;

-- Query all chats for a user
SELECT * FROM chats WHERE user_id = 'your-user-uuid-here';

-- Query all messages for a chat
SELECT * FROM messages WHERE chat_id = 'your-chat-uuid-here';
```

## Troubleshooting

### Issue: "permission denied for table"
- Make sure RLS is enabled: `ALTER TABLE chats ENABLE ROW LEVEL SECURITY;`
- Verify policies are created correctly

### Issue: "new row violates row-level security policy"
- Check that you're authenticated as the correct user
- Verify the user_id matches the authenticated user

### Issue: "relation does not exist"
- Run the table creation SQL
- Check you're in the right schema (public)

## Backup & Recovery

To backup your database schema:

```sql
-- Export schema
pg_dump -U postgres -h your-project.supabase.co -d postgres --schema-only > schema.sql

-- Export data
pg_dump -U postgres -h your-project.supabase.co -d postgres --data-only > data.sql
```

## Performance Optimization

For better performance with large datasets:

```sql
-- Add additional indexes if needed
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_chats_title ON chats USING gin(to_tsvector('english', title));

-- Analyze tables for query optimization
ANALYZE chats;
ANALYZE messages;
```
