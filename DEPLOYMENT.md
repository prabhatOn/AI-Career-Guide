# AI Career Guide - Free Deployment Guide

## Quick Summary
Build an APK file → Share it anywhere → Anyone can install it on Android

---

## Step 1: Setup (One-time)

### Create Free Expo Account
1. Go to https://expo.dev/signup
2. Create account (FREE, no credit card)

### Login in Terminal
```powershell
npx eas login
```
Enter your Expo credentials.

### Configure Build
```powershell
npx eas build:configure
```
Press Enter to accept defaults.

---

## Step 2: Build APK

Run this command:
```powershell
npx eas build --platform android --profile preview
```

**What happens:**
- Build is queued on Expo's free servers
- Takes 10-20 minutes
- You get a download link when done

**Output example:**
```
Build completed!
Download: https://expo.dev/artifacts/eas/xxxxx.apk
```

---

## Step 3: Share Your App

### Option A: Direct Link
1. Copy the APK download link from EAS
2. Share via WhatsApp, Telegram, Email, etc.
3. Recipients tap link → Download → Install

### Option B: Upload to File Hosting (Permanent Link)
Upload your APK to any of these FREE services:

| Service | Link | Storage |
|---------|------|---------|
| Google Drive | drive.google.com | 15GB free |
| Dropbox | dropbox.com | 2GB free |
| MediaFire | mediafire.com | 10GB free |
| GitHub Releases | github.com | Unlimited |

**Recommended: GitHub Releases**
1. Create a GitHub repo for your app
2. Go to Releases → Create new release
3. Upload APK file
4. Share the release link

---

## Step 4: Installing on Android

### For Users Installing Your App:

1. **Download APK** from the link you shared

2. **Enable Installation** (first time only):
   - Open Settings
   - Search "Install unknown apps"
   - Allow your browser/file manager

3. **Install**: Tap the downloaded APK → Install → Open

---

## Step 5: Deploy PDF Parser (Optional - for PDF uploads)

If you want PDF file uploads to work:

### Quick Setup (5 minutes)
```powershell
# Login to Cloudflare (free account)
wrangler login

# Deploy the backend
cd backend
npm install
wrangler deploy
```

### Update Your App
After deployment, copy the URL and add to `src/config/env.ts`:
```typescript
export const PDF_PARSER_URL = 'https://pdf-parser.YOUR-SUBDOMAIN.workers.dev';
```

Then rebuild the APK.

---

## Quick Commands

```powershell
# Build APK (shareable installer)
npx eas build --platform android --profile preview

# Check build status
npx eas build:list

# Push updates to existing installs (no rebuild needed!)
npx eas update --branch preview --message "Fixed bugs"
```

---

## Sharing Made Easy

### Create a QR Code
1. Get your APK download link
2. Go to https://qr.io or any QR generator
3. Paste the link → Generate QR
4. Share the QR code image
5. People scan → Download → Install

### Create a Simple Download Page
Use GitHub Pages (free) or any free hosting:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Download AI Career Guide</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        .btn { background: #8B5CF6; color: white; padding: 20px 40px; 
               text-decoration: none; border-radius: 10px; font-size: 18px; }
    </style>
</head>
<body>
    <h1>AI Career Guide</h1>
    <p>Your personal AI career advisor</p>
    <br><br>
    <a href="YOUR_APK_LINK_HERE" class="btn">Download for Android</a>
    <br><br>
    <small>Tap to download, then install the APK</small>
</body>
</html>
```

---

## Updating Your App

### Method 1: OTA Updates (Instant, no reinstall)
```powershell
npx eas update --branch preview --message "New features"
```
Users get updates automatically next time they open the app!

### Method 2: New APK (for major changes)
```powershell
npx eas build --platform android --profile preview
```
Share the new download link.

---

## Cost: $0

Everything used is FREE:
- Expo EAS: 30 free builds/month
- Cloudflare Workers: 100k requests/day free
- Supabase: Free tier included
- Gemini API: Free tier included
- File hosting: Free options available

---

## Troubleshooting

**"App not installed" error:**
- Enable "Install from Unknown Sources" in phone settings

**"Parse error" when installing:**
- Make sure you downloaded the complete file
- Try downloading again

**Build failed:**
- Run `npx eas build:configure` again
- Check eas.json file exists

**PDF upload not working:**
- Deploy the backend (Step 5)
- Update PDF_PARSER_URL in env.ts
- Rebuild the APK
