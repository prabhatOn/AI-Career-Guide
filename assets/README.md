# Assets Folder

This folder contains app assets like icons and splash screens.

## Required Assets

For a production-ready app, you need to create:

### 1. App Icon (icon.png)
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Design: Simple, recognizable icon representing career guidance

Suggested design:
- 🎯 Target icon with gradient
- 💼 Briefcase with AI elements
- 🚀 Rocket representing career growth
- 📊 Graph showing upward trajectory

### 2. Adaptive Icon (adaptive-icon.png) - Android
- Size: 1024x1024 pixels
- Safe zone: Center 66% of image
- Background layer compatible

### 3. Splash Screen (splash.png)
- Size: 1242x2436 pixels (scales to all devices)
- Format: PNG
- Design: App icon + app name
- Background: White or brand color

### 4. Favicon (favicon.png) - Web
- Size: 48x48 pixels
- Format: PNG or ICO

## Creating Assets

### Option 1: Use Online Tools
- **Canva**: Free design tool
- **Figma**: Professional design
- **Icon Kitchen**: Android icon generator
- **App Icon Generator**: iOS icon generator

### Option 2: Use Asset Generator
```bash
npx expo-asset-generator -i path/to/icon.png
```

### Option 3: Placeholder Assets
For development, you can use simple colored squares:

1. Create a 1024x1024 purple square
2. Add text "AI Career Guide"
3. Save as icon.png
4. Copy to adaptive-icon.png and splash.png

## Quick Placeholder Setup

If you want to test immediately, create simple placeholder images:

**icon.png** - Purple square with "AC" text
**adaptive-icon.png** - Same as icon.png
**splash.png** - White background with app icon
**favicon.png** - Small version of icon

## Design Guidelines

### Colors
- Primary: #6366F1 (Indigo)
- Secondary: #818CF8 (Light Indigo)
- Accent: #4F46E5 (Dark Indigo)

### Style
- Modern and professional
- Minimalist design
- Clear and recognizable
- Works in small sizes

### Platform Specific
- **iOS**: Follows Apple Human Interface Guidelines
- **Android**: Follows Material Design
- **Web**: Simple and fast loading

## Using Custom Fonts (Optional)

To add custom fonts:

```bash
npx expo install expo-font @expo-google-fonts/inter
```

Then in App.tsx:
```typescript
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
```

## After Adding Assets

1. Restart Expo dev server: `npm start -- --clear`
2. Rebuild app if using EAS Build
3. Test on multiple devices

## Resources

- [Expo Asset Guide](https://docs.expo.dev/guides/assets/)
- [App Icon Generator](https://www.appicon.co/)
- [Material Design Icons](https://materialdesignicons.com/)
- [Unsplash](https://unsplash.com/) - Free images
