# Development Best Practices & Patterns

## 🏗️ Architecture Principles

### 1. Separation of Concerns
```
UI Components (src/components/)
    ↓ (props, callbacks)
Screens (src/screens/)
    ↓ (use hooks)
Contexts (src/contexts/)
    ↓ (call services)
Services (src/services/)
    ↓ (API calls)
External APIs (Supabase, Gemini)
```

### 2. Component Design Pattern

**Presentational Components** (in `components/`)
- Pure, reusable UI elements
- Receive data via props
- No business logic
- No API calls
- Styled consistently

**Container Components** (in `screens/`)
- Business logic
- State management
- API interactions
- Route handling

### 3. State Management Strategy

**Local State** - `useState`
- Component-specific data
- Form inputs
- UI toggles

**Context State** - `useContext`
- Auth state (user, session)
- Chat state (messages, chats)
- Global UI state

**Server State** - Supabase
- Persistent data
- User data
- Chat history

## 📝 Code Standards

### TypeScript Best Practices

```typescript
// ✅ DO: Define explicit types
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

// ❌ DON'T: Use 'any'
const handleData = (data: any) => { }

// ✅ DO: Use specific types
const handleData = (data: User) => { }

// ✅ DO: Use optional chaining
const email = user?.email ?? 'No email';

// ❌ DON'T: Nested conditionals
if (user) {
  if (user.email) { }
}
```

### React Patterns

```typescript
// ✅ DO: Memoize callbacks
const handlePress = useCallback(() => {
  doSomething();
}, [dependency]);

// ✅ DO: Memoize expensive computations
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);

// ✅ DO: Cleanup effects
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);

// ❌ DON'T: Call hooks conditionally
if (condition) {
  useEffect(() => { }); // Wrong!
}
```

### Styling Patterns

```typescript
// ✅ DO: Use StyleSheet.create
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
});

// ✅ DO: Use theme constants
const styles = StyleSheet.create({
  text: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
  },
});

// ❌ DON'T: Inline styles (performance)
<View style={{ flex: 1, padding: 16 }} />

// ✅ DO: Conditional styles
<View style={[styles.base, isActive && styles.active]} />
```

## 🔐 Security Best Practices

### Environment Variables

```typescript
// ✅ DO: Never commit secrets
// Use .env files (in .gitignore)
SUPABASE_URL=https://xxx.supabase.co
GEMINI_API_KEY=xxx

// ✅ DO: Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required environment variables');
}

// ❌ DON'T: Hardcode in source
const API_KEY = "abc123xyz"; // NEVER DO THIS
```

### Authentication

```typescript
// ✅ DO: Check auth state
const { user } = useAuth();
if (!user) return <AuthScreen />;

// ✅ DO: Validate user permissions
const canDelete = message.user_id === user.id;

// ✅ DO: Handle auth errors
try {
  await signIn(email, password);
} catch (error) {
  showError(error.message);
}
```

### Data Validation

```typescript
// ✅ DO: Validate inputs
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ✅ DO: Sanitize user input
const cleanInput = input.trim().slice(0, 1000);

// ✅ DO: Check for required fields
if (!email || !password) {
  setError('All fields required');
  return;
}
```

## 🎨 UI/UX Best Practices

### Loading States

```typescript
// ✅ DO: Show loading indicators
{loading && <ActivityIndicator />}

// ✅ DO: Disable buttons while loading
<Button disabled={loading} />

// ✅ DO: Handle empty states
{messages.length === 0 && <EmptyState />}
```

### Error Handling

```typescript
// ✅ DO: User-friendly error messages
catch (error) {
  Alert.alert(
    'Error',
    'Failed to load chats. Please try again.',
    [{ text: 'OK' }]
  );
}

// ✅ DO: Log errors for debugging
console.error('Chat load error:', error);

// ✅ DO: Provide fallbacks
const userName = user?.email ?? 'Guest';
```

### Performance

```typescript
// ✅ DO: Use FlatList for long lists
<FlatList
  data={messages}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <MessageBubble message={item} />}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
/>

// ❌ DON'T: Use ScrollView for long lists
<ScrollView>
  {messages.map(msg => <MessageBubble message={msg} />)}
</ScrollView>

// ✅ DO: Optimize images
<Image
  source={{ uri: imageUrl }}
  resizeMode="cover"
  style={{ width: 100, height: 100 }}
/>
```

## 🧪 Testing Strategies

### Manual Testing Checklist

**Authentication**
- [ ] Sign up with valid email
- [ ] Sign up with invalid email (should fail)
- [ ] Sign in with correct credentials
- [ ] Sign in with wrong credentials (should fail)
- [ ] Sign out and verify state cleared

**Chat Functionality**
- [ ] Create new chat
- [ ] Send message and receive response
- [ ] Switch between chats
- [ ] Delete chat
- [ ] Chat history persists after app restart

**UI/UX**
- [ ] Test on different screen sizes
- [ ] Test portrait and landscape
- [ ] Check keyboard behavior
- [ ] Verify scrolling smooth
- [ ] Test touch targets (not too small)

**Edge Cases**
- [ ] Very long messages
- [ ] Special characters in input
- [ ] Slow network conditions
- [ ] No internet connection
- [ ] App backgrounding/foregrounding

### Unit Testing (Future Enhancement)

```typescript
// Example test structure
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Test'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## 📊 Performance Optimization

### React Native Performance

```typescript
// ✅ DO: Avoid anonymous functions in render
// ❌ BAD
<Button onPress={() => handlePress(item.id)} />

// ✅ GOOD
const handleItemPress = useCallback(() => {
  handlePress(item.id);
}, [item.id]);
<Button onPress={handleItemPress} />

// ✅ DO: Use React.memo for expensive components
export const MessageBubble = React.memo<MessageBubbleProps>(
  ({ message }) => {
    // Component code
  }
);

// ✅ DO: Lazy load heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

### API Optimization

```typescript
// ✅ DO: Batch API calls
const loadInitialData = async () => {
  const [chats, profile] = await Promise.all([
    chatService.getUserChats(userId),
    profileService.getProfile(userId),
  ]);
};

// ✅ DO: Implement pagination
const loadMoreMessages = async (offset: number) => {
  const { data } = await messageService.getChatMessages(
    chatId,
    { offset, limit: 20 }
  );
};

// ✅ DO: Cache responses
const cachedData = useRef<Chat[]>([]);
```

## 🐛 Debugging Tips

### Console Logging

```typescript
// ✅ DO: Use descriptive logs
console.log('[ChatScreen] Loading messages for chat:', chatId);

// ✅ DO: Log state changes
useEffect(() => {
  console.log('[Auth] User state changed:', user?.email);
}, [user]);

// ✅ DO: Use different log levels
console.log('Info: Normal operation');
console.warn('Warning: Something unexpected');
console.error('Error: Something failed');
```

### React Native Debugger

```typescript
// Enable debugging
// 1. Shake device
// 2. Select "Debug"
// 3. Chrome DevTools opens

// Inspect Redux (if using)
// Inspect Network calls
// View Console logs
// Set breakpoints
```

## 🚀 Deployment Best Practices

### Pre-Deployment Checklist

```typescript
// ✅ Remove all console.logs in production
if (__DEV__) {
  console.log('Debug info');
}

// ✅ Verify environment variables
const config = {
  apiUrl: process.env.API_URL || 'default',
  environment: __DEV__ ? 'development' : 'production',
};

// ✅ Test on real devices
// - Low-end Android device
// - High-end Android device
// - iOS device (if possible)

// ✅ Test edge cases
// - Slow network
// - No network
// - App in background
// - Device rotation
```

### Version Management

```json
// In app.json
{
  "expo": {
    "version": "1.0.0",        // User-facing version
    "android": {
      "versionCode": 1         // Increment for each build
    },
    "ios": {
      "buildNumber": "1"       // Increment for each build
    }
  }
}
```

## 📚 Additional Resources

### Recommended Reading
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Expo Documentation](https://docs.expo.dev)
- [Supabase Best Practices](https://supabase.com/docs/guides/database/design)

### Tools & Extensions
- **VS Code Extensions**:
  - ES7+ React/Redux/React-Native snippets
  - Prettier
  - ESLint
  - React Native Tools

### Community Resources
- [React Native Discord](https://discord.gg/reactnative)
- [Expo Forums](https://forums.expo.dev)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

## 🎯 Future Enhancements

Consider adding:
- [ ] Push notifications
- [ ] Offline mode
- [ ] Voice input
- [ ] Export chat to PDF
- [ ] Share career plans
- [ ] Analytics dashboard
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Profile customization
- [ ] Career goal tracking

## 💡 Pro Tips

1. **Keep Components Small**: Max 200-300 lines
2. **Use TypeScript**: Catch errors early
3. **Test on Real Devices**: Simulators aren't enough
4. **Monitor Performance**: Use Flipper or React Native Debugger
5. **Version Control**: Commit often with clear messages
6. **Code Reviews**: Have someone review your code
7. **Documentation**: Comment complex logic
8. **User Feedback**: Implement analytics to understand usage
9. **Error Tracking**: Use Sentry or similar
10. **Stay Updated**: Keep dependencies current

Remember: **Good code is maintainable code!**
