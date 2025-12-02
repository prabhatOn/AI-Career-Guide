# 🚀 Setup Script Instructions

This guide will help you set up the AI Career Guide app step by step.

## Prerequisites Check

Before running the setup, ensure you have:

- [ ] Node.js installed (v16+): Run `node --version`
- [ ] npm installed: Run `npm --version`
- [ ] Internet connection for downloading dependencies

## Automated Setup (Recommended)

### Windows PowerShell

```powershell
# Navigate to project directory
cd b:\project\mobile

# Install dependencies
npm install

# Install Expo CLI globally (if not installed)
npm install -g expo-cli eas-cli

# Verify installation
expo --version
eas --version
```

### What Gets Installed

The setup will install:
- React Native and Expo (mobile framework)
- Navigation libraries (for app navigation)
- Supabase SDK (database and auth)
- Google Generative AI (Gemini API)
- TypeScript and dev tools

Total size: ~500MB

## Configuration Steps

### 1. Supabase Setup

1. **Create Account**: Visit [supabase.com](https://supabase.com) and sign up
2. **New Project**: Click "New Project", fill details
3. **Run SQL**: Copy SQL from `SUPABASE_SETUP.md` and run in SQL Editor
4. **Get Credentials**: 
   - Go to Settings > API
   - Copy "Project URL"
   - Copy "anon public" key

### 2. Gemini API Setup

1. **Get API Key**: Visit [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. **Create Key**: Click "Create API Key"
3. **Copy Key**: Save it for next step

### 3. Environment Configuration

Edit `src/config/env.ts`:

```typescript
export const SUPABASE_URL = 'https://xxxxx.supabase.co'; // Your URL
export const SUPABASE_ANON_KEY = 'your-key-here';        // Your key
export const GEMINI_API_KEY = 'your-key-here';           // Your key
```

**Important**: Replace the placeholder values with your actual credentials!

## Verification

### Test the Setup

```powershell
# Start development server
npm start
```

You should see:
- QR code in terminal
- "Metro waiting on..." message
- No error messages

### Test on Device

1. Install "Expo Go" from app store
2. Scan QR code
3. App should load on your phone
4. Try signing up with test email

## Common Issues & Fixes

### Issue: "Cannot find module"
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Issue: "Expo command not found"
```powershell
# Install Expo CLI globally
npm install -g expo-cli
```

### Issue: "Port 8081 already in use"
```powershell
# Kill process using the port
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess -Force
# Or start on different port
npm start -- --port 8082
```

### Issue: "Network error" in app
- Check that `src/config/env.ts` has correct URLs
- Verify Supabase project is active
- Check API keys are valid

### Issue: "Cannot connect to Metro"
- Ensure phone and PC on same WiFi
- Disable VPN if active
- Try: `npm start -- --tunnel`

## Folder Structure After Setup

```
mobile/
├── node_modules/          ✅ Installed
├── src/                   ✅ Source code
│   ├── components/        ✅ UI components
│   ├── screens/           ✅ App screens
│   ├── contexts/          ✅ State management
│   ├── services/          ✅ API integrations
│   ├── types/             ✅ TypeScript types
│   ├── constants/         ✅ Theme & constants
│   ├── config/            ⚠️  CONFIGURE THIS
│   ├── navigation/        ✅ Navigation setup
│   └── utils/             ✅ Helper functions
├── assets/                ⚠️  Add icons (optional)
├── App.tsx               ✅ Main entry point
├── package.json          ✅ Dependencies
└── README.md            ✅ Documentation
```

## Next Steps

After successful setup:

1. ✅ Configure environment variables
2. ✅ Set up Supabase database
3. ✅ Test app on device
4. ✅ Create test account
5. ✅ Test chat functionality
6. 📱 Build APK (see DEPLOYMENT.md)
7. 🚀 Deploy to production

## Development Workflow

### Daily Development

```powershell
# Start dev server
npm start

# Clear cache if issues
npm start -- --clear

# Run on specific platform
npm run android  # Android emulator
npm run ios      # iOS simulator (macOS only)
```

### Making Changes

1. Edit files in `src/` directory
2. Save file (app auto-reloads)
3. Test changes on device
4. Commit to version control

### Building for Production

```powershell
# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview

# Wait for build (~10-15 min)
# Download APK from provided link
```

## Getting Help

If you encounter issues:

1. Check `README.md` for detailed docs
2. Review `QUICKSTART.md` for basics
3. See `DEPLOYMENT.md` for building
4. Check `SUPABASE_SETUP.md` for database help

## Success Indicators

You're ready to develop when:

- ✅ `npm start` runs without errors
- ✅ QR code displays in terminal
- ✅ App loads on Expo Go
- ✅ Can create account
- ✅ Can send messages and get AI responses

## Development Tips

1. **Hot Reload**: Changes auto-update in app
2. **Shake Device**: Opens developer menu
3. **Console Logs**: View in terminal where you ran `npm start`
4. **Error Messages**: Shown in app in red screen
5. **Debugging**: Use React Native Debugger or Chrome DevTools

## Production Checklist

Before going live:

- [ ] Replace all credentials with production values
- [ ] Test on multiple devices
- [ ] Test authentication flow
- [ ] Test chat functionality
- [ ] Verify AI responses are appropriate
- [ ] Check database permissions
- [ ] Set up error tracking
- [ ] Configure analytics
- [ ] Create privacy policy
- [ ] Prepare app store assets
- [ ] Build production APK/IPA
- [ ] Test production build
- [ ] Submit to app stores

Good luck with your app! 🎉
