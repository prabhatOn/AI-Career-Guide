# 🚀 Developer Quick Reference

## ⚡ Essential Commands

```bash
# Development
npm start                  # Start dev server
npm start -- --clear       # Start with cache cleared
npm run android           # Run on Android emulator
npm run ios               # Run on iOS simulator

# Building
eas build --platform android --profile preview      # Build APK
eas build --platform android --profile production  # Build AAB
eas build --platform ios --profile production      # Build iOS

# Utilities
npm install               # Install dependencies
expo doctor              # Check for issues
eas login                # Login to Expo
```

## 📁 File Locations

| What | Where |
|------|-------|
| Environment Config | `src/config/env.ts` |
| Theme/Colors | `src/constants/theme.ts` |
| Database Types | `src/types/database.ts` |
| Supabase Client | `src/services/supabase.ts` |
| AI Integration | `src/services/gemini.ts` |
| Auth Context | `src/contexts/AuthContext.tsx` |
| Chat Context | `src/contexts/ChatContext.tsx` |

## 🔧 Common Fixes

| Problem | Solution |
|---------|----------|
| Can't connect to database | Check `src/config/env.ts` credentials |
| "Module not found" | Run `npm install` |
| Expo won't start | `npm start -- --clear` |
| Build fails | Check `eas.json` exists |
| App crashes on device | Check console logs in terminal |
| White screen | Check authentication flow |

## 🎨 Theme Colors

```typescript
Primary: #6366F1      // Main brand color
Background: #FFFFFF   // App background
User Bubble: #6366F1  // User messages
Bot Bubble: #F3F4F6   // AI messages
Error: #EF4444        // Error messages
Success: #10B981      // Success messages
```

## 📝 Code Snippets

### Add New Screen
```typescript
// src/screens/NewScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const NewScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>New Screen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

### Add New Component
```typescript
// src/components/NewComponent.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NewComponentProps {
  title: string;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
});
```

### Add Database Query
```typescript
// In src/services/supabase.ts
export const customService = {
  getItem: async (id: string) => {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },
};
```

## 🔐 Environment Variables

```typescript
// src/config/env.ts
export const SUPABASE_URL = 'https://xxx.supabase.co';
export const SUPABASE_ANON_KEY = 'your_key_here';
export const GEMINI_API_KEY = 'your_key_here';
```

## 🗃️ Database Schema

```sql
chats
  - id (uuid)
  - user_id (uuid, FK)
  - title (text)
  - created_at (timestamp)
  - updated_at (timestamp)

messages
  - id (uuid)
  - chat_id (uuid, FK)
  - role (text: 'user' | 'assistant')
  - content (text)
  - created_at (timestamp)
```

## 🎯 Project Structure

```
src/
├── components/     # UI components (Button, Input, etc.)
├── screens/        # App screens (Auth, Chat)
├── contexts/       # State management
├── services/       # API integrations
├── types/          # TypeScript types
├── constants/      # Theme, colors
├── config/         # Environment config
├── navigation/     # Navigation setup
└── utils/          # Helper functions
```

## 📱 Testing Checklist

- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Create new chat
- [ ] Send message
- [ ] Receive AI response
- [ ] Switch between chats
- [ ] Delete chat
- [ ] Sign out

## 🐛 Debug Mode

```typescript
// In terminal where npm start is running:
// Press 'd' - Open developer menu
// Press 'r' - Reload app
// Press 'j' - Open debugger

// On device:
// Shake device - Open developer menu
```

## 📊 Key Hooks

```typescript
// Authentication
const { user, signIn, signOut } = useAuth();

// Chat management
const { 
  chats, 
  currentChat, 
  messages, 
  createNewChat,
  sendMessage,
  selectChat 
} = useChat();

// Navigation
const navigation = useNavigation();
navigation.navigate('ScreenName');
```

## 🚀 Deployment Steps

1. **Update versions** in `app.json`
2. **Configure env** for production
3. **Build**: `eas build --platform android --profile production`
4. **Wait** for build (~15 min)
5. **Download** APK/AAB
6. **Test** on real device
7. **Submit** to store

## 📚 Documentation Files

- `README.md` - Complete guide
- `INSTALL.md` - Installation guide
- `QUICKSTART.md` - Quick setup
- `SETUP.md` - Detailed setup
- `DEPLOYMENT.md` - Deployment guide
- `SUPABASE_SETUP.md` - Database setup
- `BEST_PRACTICES.md` - Code standards
- `PROJECT_SUMMARY.md` - Project overview

## 🆘 Get Help

1. Check error message in terminal
2. Search in documentation
3. Check Expo docs: docs.expo.dev
4. Check Supabase docs: supabase.com/docs
5. Check React Native docs: reactnative.dev

## 💡 Pro Tips

- **Use TypeScript**: Catches errors early
- **Test on real devices**: Simulators != real devices
- **Check console**: Most errors show there
- **Clear cache**: Fixes 80% of weird issues
- **Read errors**: Error messages are helpful
- **Version control**: Commit often
- **Ask for help**: Community is friendly

## 🎓 Learning Path

1. ✅ Setup project
2. ✅ Understand structure
3. 📖 Read code comments
4. 🔧 Make small changes
5. 🧪 Test changes
6. 📚 Read documentation
7. 🚀 Build and deploy

## ⚡ Shortcuts

| Action | Shortcut |
|--------|----------|
| Reload app | Shake device → Reload |
| Clear cache | `npm start -- --clear` |
| Stop server | Ctrl + C in terminal |
| View logs | Terminal where `npm start` runs |
| Debug JS | Shake → Debug |

## 🎯 Next Features to Add

- [ ] Push notifications
- [ ] Dark mode
- [ ] Export chat to PDF
- [ ] Share functionality
- [ ] Profile pictures
- [ ] Voice input
- [ ] Offline mode
- [ ] Analytics

---

**Keep this file handy for quick reference during development!** 📌
