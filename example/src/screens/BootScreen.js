import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export const BootScreen = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#7B61FF" />
    <Text style={styles.text}>Starting Voice Assistant...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 16,
    fontWeight: '500',
  },
});
