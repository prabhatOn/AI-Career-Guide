import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { MessageBubble } from '../components/MessageBubble';
import { ChatListItem } from '../components/ChatListItem';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import { PDF_PARSER_URL } from '../config/env';

const SIDEBAR_WIDTH = 260;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ChatScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const {
    chats,
    currentChat,
    messages,
    loading,
    sending,
    loadChats,
    createNewChat,
    selectChat,
    sendMessage,
    deleteChat,
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Pan responder for swipe to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          const newValue = Math.max(-SIDEBAR_WIDTH, gestureState.dx);
          sidebarAnim.setValue(newValue);
          overlayAnim.setValue(1 + (gestureState.dx / SIDEBAR_WIDTH));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50 || gestureState.vx < -0.5) {
          closeSidebar();
        } else {
          openSidebar();
        }
      },
    })
  ).current;

  const openSidebar = () => {
    setShowSidebar(true);
    Animated.parallel([
      Animated.spring(sidebarAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.spring(sidebarAnim, {
        toValue: -SIDEBAR_WIDTH,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowSidebar(false));
  };

  const toggleSidebar = () => {
    if (showSidebar) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;

    let messageText = inputText.trim();
    
    // Include uploaded file content if present
    if (uploadedFile) {
      messageText = `[Resume Content]\n${uploadedFile.content}\n\n[User Message]\n${messageText}`;
      setUploadedFile(null);
    }
    
    setInputText('');
    setEditingMessage(null);

    if (!currentChat) {
      const newChat = await createNewChat();
      if (newChat) {
        await sendMessage(messageText);
      }
    } else {
      await sendMessage(messageText);
    }
    
    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleEditMessage = (message: { id: string; content: string }) => {
    setInputText(message.content);
    setEditingMessage(message.id);
  };

  const handleCancelEdit = () => {
    setInputText('');
    setEditingMessage(null);
  };

  const handleUploadResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setUploading(true);
        
        try {
          // For text files, read directly
          if (file.mimeType === 'text/plain' || file.name.endsWith('.txt')) {
            const content = await FileSystem.readAsStringAsync(file.uri);
            setUploadedFile({ name: file.name, content });
            setUploading(false);
          } 
          // For PDF files, use the backend parser
          else if (file.mimeType === 'application/pdf' || file.name.endsWith('.pdf')) {
            if (!PDF_PARSER_URL) {
              Alert.alert(
                'PDF Parser Not Configured',
                'Please deploy the PDF parser backend and update PDF_PARSER_URL in config/env.ts\n\nFor now, please paste your resume text directly.',
                [{ text: 'OK' }]
              );
              setUploading(false);
              return;
            }
            
            // Read file as base64 and send to parser
            const base64 = await FileSystem.readAsStringAsync(file.uri, {
              encoding: 'base64',
            });
            
            // Convert base64 to blob for FormData
            const formData = new FormData();
            formData.append('file', {
              uri: file.uri,
              type: 'application/pdf',
              name: file.name,
            } as any);
            
            const response = await fetch(`${PDF_PARSER_URL}/parse`, {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) {
              throw new Error('Failed to parse PDF');
            }
            
            const data = await response.json();
            if (data.text) {
              setUploadedFile({ name: file.name, content: data.text });
            } else {
              throw new Error('No text extracted');
            }
            setUploading(false);
          }
          // For DOC/DOCX, show message
          else {
            Alert.alert(
              'DOC/DOCX Not Supported',
              'Please convert to PDF or paste your resume text directly.',
              [{ text: 'OK' }]
            );
            setUploading(false);
          }
        } catch (readError) {
          console.error('Error reading file:', readError);
          setUploading(false);
          Alert.alert(
            'Cannot Read File',
            'Please paste your resume text directly into the chat.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      setUploading(false);
    }
  };

  const handleNewChat = async () => {
    await createNewChat();
    closeSidebar();
  };

  const handleDeleteChat = (chatId: string) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteChat(chatId),
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <View style={styles.menuIconContainer}>
              <View style={styles.menuLine} />
              <View style={[styles.menuLine, styles.menuLineShort]} />
              <View style={styles.menuLine} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentChat?.title || 'New Chat'}
          </Text>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutIcon}>Exit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Main Chat Area */}
          <KeyboardAvoidingView 
            style={styles.chatArea}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
          >
            {loading && messages.length === 0 ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : messages.length === 0 ? (
              <View style={styles.centerContent}>
                <View style={styles.welcomeContainer}>
                  <View style={styles.welcomeLogo}>
                    <LinearGradient
                      colors={[COLORS.primaryLight, COLORS.primary]}
                      style={styles.welcomeLogoGradient}
                    >
                      <Text style={styles.welcomeLogoText}>CG</Text>
                    </LinearGradient>
                  </View>
                  <Text style={styles.welcomeTitle}>Career Guide</Text>
                  <Text style={styles.welcomeText}>
                    Share your background, interests, and goals to get personalized career advice.
                  </Text>
                  <View style={styles.welcomeHints}>
                    <Text style={styles.hintItem}>Educational background</Text>
                    <Text style={styles.hintItem}>Skills and interests</Text>
                    <Text style={styles.hintItem}>Career aspirations</Text>
                  </View>
                </View>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <MessageBubble 
                    message={item} 
                    onEdit={item.role === 'user' ? handleEditMessage : undefined}
                  />
                )}
                contentContainerStyle={styles.messageList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
              />
            )}

            {/* Input Area */}
            <View style={[styles.inputContainer, keyboardVisible && styles.inputContainerKeyboard]}>
              {editingMessage && (
                <View style={styles.editingBanner}>
                  <Text style={styles.editingText}>Editing message</Text>
                  <TouchableOpacity onPress={handleCancelEdit}>
                    <Text style={styles.cancelEditText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
              {uploadedFile && (
                <View style={styles.uploadedBanner}>
                  <Text style={styles.uploadedText} numberOfLines={1}>{uploadedFile.name}</Text>
                  <TouchableOpacity onPress={() => setUploadedFile(null)}>
                    <Text style={styles.removeUploadText}>x</Text>
                  </TouchableOpacity>
                </View>
              )}
              {uploading && (
                <View style={styles.uploadingBanner}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.uploadingText}>Processing file...</Text>
                </View>
              )}
              <View style={styles.inputWrapper}>
                <TouchableOpacity 
                  style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]} 
                  onPress={handleUploadResume}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color={COLORS.text.tertiary} />
                  ) : (
                    <Text style={styles.uploadIcon}>+</Text>
                  )}
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type your message..."
                  placeholderTextColor={COLORS.text.tertiary}
                  multiline
                  maxLength={1000}
                  editable={!sending}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!inputText.trim() || sending) && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim() || sending}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color={COLORS.text.inverse} />
                  ) : (
                    <Text style={styles.sendIcon}>Send</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>

          {/* Sidebar Overlay */}
          {showSidebar && (
            <Animated.View 
              style={[styles.overlay, { opacity: overlayAnim }]}
            >
              <TouchableOpacity 
                style={styles.overlayTouch} 
                onPress={closeSidebar}
                activeOpacity={1}
              />
            </Animated.View>
          )}

          {/* Sidebar */}
          {showSidebar && (
            <Animated.View 
              style={[
                styles.sidebar,
                { transform: [{ translateX: sidebarAnim }] }
              ]}
              {...panResponder.panHandlers}
            >
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Chats</Text>
                <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
                  <Text style={styles.newChatIcon}>+</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ChatListItem
                    chat={item}
                    isSelected={currentChat?.id === item.id}
                    onPress={() => {
                      selectChat(item.id);
                      closeSidebar();
                    }}
                    onDelete={() => handleDeleteChat(item.id)}
                  />
                )}
                contentContainerStyle={styles.chatList}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No conversations</Text>
                }
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.sidebarFooter}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {user?.email}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.background,
  },
  menuButton: {
    padding: SPACING.xs,
    width: 40,
  },
  menuIconContainer: {
    width: 20,
    height: 14,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 2,
    backgroundColor: COLORS.text.secondary,
    borderRadius: 1,
  },
  menuLineShort: {
    width: '70%',
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  signOutButton: {
    padding: SPACING.xs,
  },
  signOutIcon: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 10,
  },
  overlayTouch: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: COLORS.backgroundSecondary,
    borderRightWidth: 1,
    borderRightColor: COLORS.border.light,
    zIndex: 20,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    letterSpacing: 0.3,
  },
  newChatButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatIcon: {
    fontSize: 16,
    color: COLORS.text.inverse,
    fontWeight: '300',
  },
  chatList: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm,
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  sidebarFooter: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  userAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.inverse,
  },
  userEmail: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  chatArea: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  welcomeContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  welcomeLogo: {
    marginBottom: SPACING.md,
  },
  welcomeLogoGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeLogoText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.inverse,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  welcomeText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  welcomeHints: {
    alignItems: 'center',
  },
  hintItem: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginBottom: 4,
  },
  messageList: {
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  inputContainer: {
    padding: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  inputContainerKeyboard: {
    paddingBottom: SPACING.sm,
  },
  editingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  editingText: {
    fontSize: 11,
    color: COLORS.primary,
  },
  cancelEditText: {
    fontSize: 11,
    color: COLORS.status.error,
    fontWeight: '500',
  },
  uploadedBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  uploadedText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.status.success,
    marginRight: SPACING.sm,
  },
  removeUploadText: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  uploadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  uploadingText: {
    fontSize: 11,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
  },
  uploadButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: COLORS.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadIcon: {
    fontSize: 16,
    color: COLORS.text.tertiary,
    fontWeight: '300',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
    maxHeight: 80,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  sendButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginLeft: 6,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    fontSize: 12,
    color: COLORS.text.inverse,
    fontWeight: '600',
  },
});
