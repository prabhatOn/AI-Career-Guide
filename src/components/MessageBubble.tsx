import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Message } from '../types/database';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface MessageBubbleProps {
  message: Message;
  onEdit?: (message: Message) => void;
}

// Simple markdown-like text formatter
const formatText = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, lineIndex) => {
    // Heading ## 
    if (line.startsWith('## ')) {
      elements.push(
        <Text key={lineIndex} style={styles.heading}>
          {line.replace('## ', '')}
        </Text>
      );
    }
    // Bullet points
    else if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
      const bulletText = line.replace(/^[\s]*[•\-\*][\s]*/, '');
      elements.push(
        <Text key={lineIndex} style={styles.bulletPoint}>
          {formatInlineStyles(bulletText)}
        </Text>
      );
    }
    // Numbered lists
    else if (/^\d+\./.test(line.trim())) {
      elements.push(
        <Text key={lineIndex} style={styles.numberedItem}>
          {formatInlineStyles(line)}
        </Text>
      );
    }
    // Regular text
    else if (line.trim()) {
      elements.push(
        <Text key={lineIndex} style={styles.paragraph}>
          {formatInlineStyles(line)}
        </Text>
      );
    }
    // Empty line
    else {
      elements.push(<View key={lineIndex} style={styles.spacer} />);
    }
  });
  
  return elements;
};

// Format inline styles like **bold**
const formatInlineStyles = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={index} style={styles.bold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return part;
  });
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onEdit }) => {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {isUser ? (
          <Text style={styles.userText}>{message.content}</Text>
        ) : (
          <View style={styles.formattedContent}>
            {formatText(message.content)}
          </View>
        )}
        <View style={styles.footer}>
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
            {formatTime(message.created_at)}
          </Text>
          {isUser && onEdit && (
            <TouchableOpacity onPress={() => onEdit(message)} style={styles.editButton}>
              <Text style={styles.editIcon}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 6,
    paddingHorizontal: SPACING.sm,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubble: {
    backgroundColor: COLORS.chat.userBubble,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: COLORS.chat.botBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  userText: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.chat.userText,
  },
  formattedContent: {
    flexDirection: 'column',
  },
  heading: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
    marginTop: 4,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.chat.botText,
    marginBottom: 2,
  },
  bulletPoint: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.chat.botText,
    marginLeft: 8,
    marginBottom: 2,
  },
  numberedItem: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.chat.botText,
    marginBottom: 2,
  },
  bold: {
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  spacer: {
    height: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  assistantTimestamp: {
    color: COLORS.text.tertiary,
  },
  editButton: {
    paddingLeft: SPACING.sm,
  },
  editIcon: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
