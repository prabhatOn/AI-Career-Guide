# 📱 AI Career Guide - Installation & Usage Guide

## 🎯 What You're Getting

A **production-ready** React Native mobile app featuring:

- ✅ **AI-Powered Career Guidance** - Google Gemini AI integration
- ✅ **ChatGPT-like Interface** - Professional, modern chat UI
- ✅ **Multiple Conversations** - Create and manage unlimited chats
- ✅ **Full Chat History** - All messages saved and retrievable
- ✅ **User Authentication** - Secure login with Supabase
- ✅ **Scalable Architecture** - Production-grade React Native principles
- ✅ **Cross-Platform** - Works on Android & iOS

## 📋 Quick Installation (5 Minutes)

### Step 1: Install Dependencies
```bash
cd b:\project\mobile
npm install
```

### Step 2: Install Expo CLI (if needed)
```bash
npm install -g expo-cli
```

### Step 3: Configure Your Services

**A. Supabase (2 minutes)**

1. Go to [supabase.com](https://supabase.com) → New Project
2. In SQL Editor, paste and run:

```sql
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their chats" ON chats 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their messages" ON messages 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
  );
```

3. Settings → API → Copy your URL and anon key

**B. Gemini API (1 minute)**

1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Create API Key → Copy it

**C. Update Configuration**

Edit `src/config/env.ts`:

```typescript
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your_supabase_anon_key';
export const GEMINI_API_KEY = 'your_gemini_api_key';
```

### Step 4: Run the App
```bash
npm start
```

Then:
- Install "Expo Go" on your phone (Play Store/App Store)
- Scan the QR code shown in terminal
- App loads instantly! 🎉

## 📱 Building Installable APK

### For Testing/Direct Installation

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo (free account)
eas login

# Build APK
eas build --platform android --profile preview
```

Wait ~10-15 minutes → Download APK → Install on Android device!

## 🎨 Using the App

### First Time Setup
1. **Sign Up** - Create account with email/password
2. **Welcome Screen** - See the AI Career Guide intro
3. **Start Chatting** - Describe your background

### Example First Message:
```
Hi! I'm a final-year computer science student. I've learned Python, 
Java, and React. I enjoy building web apps and have completed several 
projects. I love problem-solving and participating in hackathons. 
I'm interested in software development but also curious about data 
science. What career paths would suit me?
```

### App Features

**💬 Chat Interface**
- Type your background, interests, hobbies
- Get AI-powered career recommendations
- Receive detailed roadmaps and guidance
- Save conversations automatically

**📋 Chat History**
- Click menu (☰) to see all conversations
- Create new chat with (+) button
- Switch between conversations
- Delete old chats

**🎯 Career Guidance**
- Personalized recommendations
- Step-by-step action plans
- Learning resources
- Industry insights
- Success strategies

## 📂 Project Structure

```
mobile/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Button.tsx           # Professional button component
│   │   ├── Input.tsx            # Form input with validation
│   │   ├── MessageBubble.tsx    # Chat message bubbles
│   │   └── ChatListItem.tsx     # Chat history items
│   ├── screens/          # Main app screens
│   │   ├── AuthScreen.tsx       # Login/signup
│   │   └── ChatScreen.tsx       # Main chat interface
│   ├── contexts/         # State management
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── ChatContext.tsx      # Chat management
│   ├── services/         # Backend integrations
│   │   ├── supabase.ts          # Database & auth
│   │   └── gemini.ts            # AI integration
│   ├── types/            # TypeScript types
│   ├── constants/        # Theme & styling
│   ├── config/           # App configuration
│   ├── navigation/       # Navigation setup
│   └── utils/            # Helper functions
├── App.tsx              # Main entry point
├── package.json         # Dependencies
└── README.md           # Full documentation
```

## 🛠️ Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google Gemini 1.5 Flash
- **State**: React Context API
- **Storage**: AsyncStorage

## 🔧 Development Commands

```bash
# Start development server
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Clear cache and restart
npm start -- --clear

# Build production APK
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

## 📖 Documentation

- **README.md** - Complete documentation
- **QUICKSTART.md** - 5-minute setup guide
- **SETUP.md** - Detailed setup instructions
- **DEPLOYMENT.md** - Publishing to app stores
- **SUPABASE_SETUP.md** - Database setup guide

## 🎯 Key Features Explained

### 1. AI Prompt Engineering
The app uses sophisticated prompt engineering to ensure AI provides:
- Relevant career suggestions
- Actionable roadmaps
- Specific resources
- Realistic timelines
- Industry insights

### 2. Chat Management
- Create unlimited conversations
- Automatic title generation
- Chronological message history
- Real-time updates
- Persistent storage

### 3. User Authentication
- Email/password signup
- Secure session management
- Row-level security
- Automatic session refresh
- Logout functionality

### 4. Professional UI/UX
- Minimalist design
- Modern color scheme
- Smooth animations
- Responsive layout
- Intuitive navigation

## 🚀 Deployment Options

### Option 1: Direct APK Installation
- Build APK with EAS
- Share APK file
- Users install directly
- No app store needed

### Option 2: Google Play Store
- Build production AAB
- Submit to Play Console
- $25 one-time fee
- Reach millions of users

### Option 3: Apple App Store
- Build iOS IPA
- Submit to App Store Connect
- $99/year developer account
- iOS users can download

## 💰 Cost Breakdown

### Free Tier (Perfect for Testing)
- Supabase: Free (500MB, 50K users)
- Gemini API: Free tier available
- Expo: Free
- **Total: $0/month**

### Production (Paid Features)
- Supabase Pro: $25/month
- Gemini API: Pay-per-use
- Google Play: $25 one-time
- Apple Store: $99/year

## ⚠️ Important Notes

### Security
- **Never commit `.env` file** to version control
- Use environment variables for production
- Keep API keys secure
- Enable rate limiting

### Performance
- Optimize images before upload
- Use FlatList for long lists
- Implement pagination if needed
- Monitor API usage

### Testing
- Test on multiple devices
- Test different screen sizes
- Test slow network conditions
- Test offline behavior (add later)

## 🆘 Troubleshooting

### "Cannot connect to database"
- Verify Supabase URL and key
- Check database tables exist
- Ensure RLS policies are set

### "Gemini API error"
- Verify API key is correct
- Check API quota/limits
- Ensure billing is set up if needed

### "App won't load"
- Clear Expo cache: `npm start -- --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check phone and PC on same WiFi

### "Build failed"
- Check `eas.json` exists
- Verify app.json configuration
- Review build logs for errors
- Ensure all dependencies installed

## 📞 Support & Resources

- **Expo Docs**: [docs.expo.dev](https://docs.expo.dev)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Gemini AI Docs**: [ai.google.dev/docs](https://ai.google.dev/docs)
- **React Native**: [reactnative.dev](https://reactnative.dev)

## ✅ Pre-Launch Checklist

Before releasing:

- [ ] All features tested
- [ ] Authentication works
- [ ] AI responses appropriate
- [ ] Chat history saving correctly
- [ ] UI looks good on all devices
- [ ] No console errors
- [ ] Environment variables set
- [ ] Database backups configured
- [ ] Privacy policy created
- [ ] Terms of service written
- [ ] App store assets prepared
- [ ] Screenshots captured
- [ ] App description written

## 🎉 You're All Set!

Your AI Career Guide app is ready to:
- ✅ Help users find perfect careers
- ✅ Provide personalized guidance
- ✅ Manage multiple conversations
- ✅ Scale to thousands of users
- ✅ Deploy to app stores

**Start developing**: `npm start`  
**Build APK**: `eas build --platform android --profile preview`  
**Deploy**: See DEPLOYMENT.md

Good luck with your AI Career Guide app! 🚀
