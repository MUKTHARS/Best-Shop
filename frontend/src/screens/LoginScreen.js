import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/api';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const testConnection = async () => {
    try {
      console.log('🔍 Testing connection to backend...');
      const response = await fetch('http://10.0.2.2:8080/login', { // Changed to 10.0.2.2 for Android
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'test', password: 'test' }),
      });
      console.log('🔍 Connection test response status:', response.status);
      return response.status !== 404;
    } catch (error) {
      console.log('❌ Connection test failed:', error.message);
      console.log('🔧 Debug info:', {
        url: 'http://10.0.2.2:8080/login',
        errorType: error.name,
        message: error.message
      });
      return false;
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      console.log('❌ Login validation failed: Missing username or password');
      return;
    }

    console.log('🔐 Starting login process for user:', username);
    setIsLoading(true);

    // Test connection first
    console.log('🔄 Step 1: Testing server connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.log('❌ Step 1 Failed: Cannot connect to server');
      console.log('🔧 Troubleshooting steps:');
      console.log('   1. Check if backend server is running on port 8080');
      console.log('   2. Verify 10.0.2.2:8080 is accessible from Android emulator');
      console.log('   3. Check if any firewall is blocking the connection');
      console.log('   4. Ensure backend is not running on a different port');
      setIsLoading(false);
      return;
    }

    console.log('✅ Step 1 Passed: Server connection successful');
    console.log('🔄 Step 2: Attempting login...');

    const result = await login(username, password);
    setIsLoading(false);

    if (!result.success) {
      console.log('❌ Step 2 Failed: Login failed -', result.error);
      console.log('🔧 Login details:', { username, error: result.error });
    } else {
      console.log('✅ Step 2 Passed: Login successful');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Stock Management</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
        
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#333333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  demoText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  debugText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#999',
    fontSize: 12,
  },
});

export default LoginScreen;