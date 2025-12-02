# 🚀 Quick Setup & Run Guide

## Step 1: Migrate Supabase Database (2 minutes)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/aujiwuvqtzjzpbzfciez

2. Click on **SQL Editor** in the left sidebar

3. Click **New Query**

4. Copy ALL the contents from `migrate.sql` file in this folder

5. Paste into the SQL Editor

6. Click **RUN** button (or press Ctrl+Enter)

7. You should see success messages:
   ```
   ✅ Database migration completed successfully!
   📊 Tables created: chats, messages
   🔒 Row Level Security enabled
   🚀 Your app is ready to use!
   ```

## Step 2: Verify Database Tables

In Supabase Dashboard:
1. Click **Table Editor** in left sidebar
2. You should see two tables:
   - `chats` (with columns: id, user_id, title, created_at, updated_at)
   - `messages` (with columns: id, chat_id, role, content, created_at)

## Step 3: Run on Emulator

### Option A: Android Emulator (If you have Android Studio)

```powershell
# Make sure Android emulator is running first
# Then run:
npm run android
```

### Option B: Expo Go on Real Device (Easiest)

```powershell
# Start the development server
npm start

# Then:
# 1. Install "Expo Go" app on your Android/iOS phone
# 2. Scan the QR code shown in terminal
# 3. App will load on your device!
```

### Option C: Expo Go in Browser (For testing UI)

```powershell
npm start
# Then press 'w' to open in web browser
```

## ✅ Verification Checklist

After running the app:

- [ ] App loads without errors
- [ ] You see the welcome screen with "AI Career Guide"
- [ ] You can click "Sign Up"
- [ ] You can create an account with email/password
- [ ] After signup, you see the chat interface
- [ ] You can send a message and get AI response

## 🎯 Test Message

Try sending this as your first message:

```
Hi! I'm a computer science student interested in web development. 
I know JavaScript, React, and Node.js. I enjoy building projects 
and learning new technologies. What career paths would you recommend?
```

You should get a detailed AI response with career suggestions!

## 🆘 Troubleshooting

**"Cannot connect to Supabase"**
- Make sure you ran the migration SQL
- Check tables exist in Table Editor
- Verify credentials in `src/config/env.ts`

**"Gemini API Error"**
- Verify API key is correct
- Check you have quota available at https://makersuite.google.com

**"App won't load"**
- Try: `npm start -- --clear` to clear cache
- Make sure you ran `npm install`
- Check terminal for error messages

**Android Emulator Issues**
- Make sure emulator is running before `npm run android`
- Or use Expo Go on real device (easier!)

## 📱 Current Status

✅ Environment variables configured  
⏳ Database migration needed (Step 1 above)  
⏳ Ready to run (Step 3 above)

## 🎉 Next Steps

1. ⬆️ Run migration SQL in Supabase (Step 1)
2. ✅ Verify tables created (Step 2)
3. 🚀 Run the app (Step 3)
4. 🧪 Test with a sample message
5. 🎊 Start building!

Good luck! 🚀
