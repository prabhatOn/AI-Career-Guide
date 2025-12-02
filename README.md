# AI Career Guide - React Native App

A professional, production-grade AI-powered career guidance mobile application built with React Native, Expo, Supabase, and Google Gemini AI.

## Features

- 🤖 **AI-Powered Career Guidance**: Personalized career recommendations using Google Gemini AI
- 💬 **ChatGPT-like Interface**: Modern, minimalist chat UI with message bubbles
- 📱 **Multiple Conversations**: Create and manage multiple chat sessions
- 💾 **Chat History**: All conversations saved and retrievable
- 🔐 **Secure Authentication**: User authentication with Supabase
- 🎨 **Professional UI**: Clean, modern design with smooth animations
- 📊 **Scalable Architecture**: Production-ready with best practices

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI** (for building): `npm install -g eas-cli`
- **Expo Go app** on your mobile device (for testing)

## Project Structure

```
mobile/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ChatListItem.tsx
│   ├── screens/           # Application screens
│   │   ├── AuthScreen.tsx
│   │   └── ChatScreen.tsx
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ChatContext.tsx
│   ├── services/          # External service integrations
│   │   ├── supabase.ts
│   │   └── gemini.ts
│   ├── types/             # TypeScript type definitions
│   │   └── database.ts
│   ├── constants/         # App constants and theme
│   │   └── theme.ts
│   ├── config/            # Configuration files
│   │   └── env.ts
│   └── navigation/        # Navigation setup
│       └── index.tsx
├── App.tsx               # Main application entry
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd b:\project\mobile
npm install
```

### 2. Configure Supabase

1. **Create a Supabase Project**:
   - Go to [https://supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details and create

2. **Set Up Database Tables**:
   - Go to SQL Editor in your Supabase dashboard
   - Run the following SQL:

```sql
-- Create chats table
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

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
```

3. **Get Your Supabase Credentials**:
   - Go to Settings > API
   - Copy the **Project URL**
   - Copy the **anon/public key**

### 3. Configure Google Gemini AI

1. **Get Gemini API Key**:
   - Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Click "Create API Key"
   - Copy your API key

### 4. Set Up Environment Variables

1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Edit `.env` and add your credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Never commit the `.env` file to version control!

### 5. Update Environment Configuration

Edit `src/config/env.ts` to load environment variables properly. For development, you can temporarily hardcode your values here (but don't commit them):

```typescript
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your_supabase_anon_key';
export const GEMINI_API_KEY = 'your_gemini_api_key';
```

## Running the App

### Development Mode

1. **Start the development server**:
```bash
npm start
```

2. **Run on your device**:
   - Install **Expo Go** from Play Store (Android) or App Store (iOS)
   - Scan the QR code shown in terminal with Expo Go
   - The app will load on your device

3. **Run on emulator**:
   - For Android: `npm run android` (requires Android Studio)
   - For iOS: `npm run ios` (requires Xcode on macOS)

### Testing the App

1. **Sign Up**: Create a new account with email and password
2. **Start Chatting**: Describe your education, hobbies, and interests
3. **Get Guidance**: Receive personalized career recommendations
4. **Create New Chats**: Click the menu (☰) and then (+) button
5. **View History**: Access all your previous conversations

## Building for Production

### Android APK/AAB

1. **Install EAS CLI** (if not already installed):
```bash
npm install -g eas-cli
```

2. **Login to Expo**:
```bash
eas login
```

3. **Configure build**:
```bash
eas build:configure
```

4. **Build APK for local installation**:
```bash
eas build --platform android --profile preview
```

5. **Build AAB for Play Store**:
```bash
eas build --platform android --profile production
```

The build will be processed in the cloud. Once complete, you'll get a download link for the APK/AAB file.

### iOS (requires Apple Developer Account)

```bash
eas build --platform ios --profile production
```

## Environment Variables for Production

For production builds, set environment variables in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "SUPABASE_URL": "your_production_url",
        "SUPABASE_ANON_KEY": "your_production_key",
        "GEMINI_API_KEY": "your_production_key"
      }
    }
  }
}
```

Or use Expo's secret management:
```bash
eas secret:create --name SUPABASE_URL --value your_value
eas secret:create --name SUPABASE_ANON_KEY --value your_value
eas secret:create --name GEMINI_API_KEY --value your_value
```

## Architecture & Best Practices

### State Management
- **Context API**: Used for global state (auth, chat)
- **Local State**: Component-level state with useState
- **Separation of Concerns**: Clear separation between UI, business logic, and services

### Code Organization
- **Components**: Reusable, presentational components
- **Screens**: Container components with business logic
- **Services**: External API integration layer
- **Contexts**: Global state and shared logic
- **Types**: TypeScript interfaces for type safety

### Performance Optimization
- **Memoization**: Use of useCallback for function memoization
- **List Optimization**: FlatList with proper keyExtractor
- **Lazy Loading**: Messages loaded per chat
- **Debouncing**: Input debouncing for better UX

### Security
- **Row Level Security**: Supabase RLS policies protect data
- **Environment Variables**: Sensitive data not in code
- **Authentication**: Secure auth flow with Supabase
- **Input Validation**: All user inputs validated

### Scalability
- **Modular Architecture**: Easy to extend and maintain
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error handling
- **Loading States**: Proper loading and error states

## Troubleshooting

### Common Issues

1. **"Cannot connect to Supabase"**:
   - Check your SUPABASE_URL and SUPABASE_ANON_KEY
   - Ensure database tables are created
   - Verify RLS policies are set up

2. **"Gemini API Error"**:
   - Verify your GEMINI_API_KEY is correct
   - Check you have API quota available
   - Ensure you're using a valid model name

3. **"Expo Go won't load app"**:
   - Ensure device and computer are on same network
   - Try restarting Expo Dev Server
   - Clear Expo cache: `expo start -c`

4. **Build fails**:
   - Check all dependencies are installed
   - Verify eas.json configuration
   - Review build logs for specific errors

### Getting Help

- **Expo Documentation**: https://docs.expo.dev
- **Supabase Documentation**: https://supabase.com/docs
- **Gemini AI Documentation**: https://ai.google.dev/docs

## Features Overview

### AI Career Guidance
The app uses Google Gemini AI with carefully engineered prompts to provide:
- Personalized career recommendations based on user profile
- Step-by-step roadmaps for career success
- Specific learning resources and certifications
- Industry insights and job market trends
- Practical advice tailored to individual goals

### Chat Management
- Create unlimited conversations
- Automatic chat title generation
- Chronological chat history
- Delete unwanted conversations
- Seamless switching between chats

### User Experience
- Professional, minimalist UI
- Smooth animations and transitions
- Responsive design for all screen sizes
- Intuitive navigation
- Real-time message updates

## Production Checklist

Before deploying to production:

- [ ] Replace all environment variables with production values
- [ ] Test all features thoroughly
- [ ] Set up proper error logging (e.g., Sentry)
- [ ] Configure analytics (e.g., Google Analytics)
- [ ] Set up crash reporting
- [ ] Test on multiple devices and screen sizes
- [ ] Optimize images and assets
- [ ] Review and update privacy policy
- [ ] Set up proper backend monitoring
- [ ] Configure rate limiting for APIs
- [ ] Test authentication flows
- [ ] Verify database backups are configured

## License

This project is private and proprietary.

## Support

For issues or questions, please refer to the documentation or contact support.
