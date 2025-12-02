import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Chat } from '../types/database';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onPress: () => void;
  onDelete: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isSelected,
  onPress,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.title, isSelected && styles.titleSelected]} numberOfLines={1}>
          {chat.title}
        </Text>
        <Text style={styles.date}>{formatDate(chat.updated_at)}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.deleteIcon}>x</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 24) {
    return 'Today';
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedContainer: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.border.light,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  titleSelected: {
    color: COLORS.text.primary,
  },
  date: {
    fontSize: 10,
    color: COLORS.text.tertiary,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 14,
    color: COLORS.text.tertiary,
  },
});
