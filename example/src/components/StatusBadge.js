import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const StatusBadge = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Downloading':
        return { color: '#3B82F6', label: 'Downloading' };
      case 'Setting up':
      case 'INITIALIZING':
        return { color: '#F59E0B', label: 'Setting up' };
      case 'Error':
      case 'ERROR':
        return { color: '#EF4444', label: 'Error' };
      case 'Ready':
      case 'READY':
        return { color: '#10B981', label: 'Ready' };
      default:
        return { color: '#6B7280', label: 'Offline' };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={styles.text}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1C23',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1D5DB',
  },
});
