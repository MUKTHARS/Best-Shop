import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

const Loading = ({ size = 'large', color = '#007AFF', text = '' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default Loading;

// Full screen loading component
export const FullScreenLoading = ({ text = 'Loading...' }) => {
  return (
    <View style={styles.fullScreenContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.fullScreenText}>{text}</Text>
    </View>
  );
};

const fullScreenStyles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  fullScreenText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});