# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd b:\project\mobile
npm install
```

### Step 2: Set Up Supabase (2 minutes)

1. Create account at [supabase.com](https://supabase.com)
2. Click "New Project"
3. Go to SQL Editor and paste this:

```sql
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their chats" ON chats USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their messages" ON messages USING (
  EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
);
```

4. Go to Settings > API and copy:
   - Project URL
   - anon public key

### Step 3: Get Gemini API Key (1 minute)

1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### Step 4: Configure Environment

Open `src/config/env.ts` and replace with your values:

```typescript
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your_supabase_anon_key';
export const GEMINI_API_KEY = 'your_gemini_api_key';
```

### Step 5: Run the App

```bash
npm start
```

Then:
- Install "Expo Go" app on your phone
- Scan the QR code
- Start chatting!

## 📱 Building Installable APK

### Option 1: Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview
```

Wait for build to complete, then download APK from the link provided.

### Option 2: Local Build (Advanced)

Requires Android Studio setup. See README.md for details.

## 🎯 How to Use the App

1. **Sign Up**: Create account with email/password
2. **Start Chat**: Type your background, education, hobbies
3. **Get Guidance**: AI provides career recommendations
4. **New Chat**: Click menu (☰) then (+) button
5. **View History**: See all previous conversations

## 📊 Sample User Input

```
Hi! I'm a computer science student in my final year. 
I've studied programming in Python, Java, and JavaScript. 
I enjoy building web applications and have done several projects. 
My hobbies include reading tech blogs and participating in hackathons. 
I'm interested in both software development and data science. 
What career paths would you recommend for me?
```

## ❓ Troubleshooting

**Can't connect to Supabase?**
- Check URL and key in `src/config/env.ts`
- Verify tables were created in SQL Editor

**Gemini API not working?**
- Verify API key is correct
- Check you have API quota

**App won't load in Expo Go?**
- Make sure phone and PC are on same WiFi
- Try `npm start -- --clear`

**Build fails?**
- Run `npm install` again
- Check `eas.json` exists
- View build logs for specific error

## 🆘 Need Help?

- Check README.md for detailed documentation
- See SUPABASE_SETUP.md for database help
- Review code comments for implementation details

## 🎉 You're Ready!

The app is production-ready with:
- ✅ Professional UI/UX
- ✅ Secure authentication
- ✅ Real-time chat
- ✅ Chat history
- ✅ AI career guidance
- ✅ Scalable architecture
