import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const testConnection = async () => {
    try {
      console.log('🔍 Testing connection to backend...');
      const baseURL = 'http://10.150.253.4:8080';
      console.log('🌐 Testing connection to:', baseURL);
      
      const response = await fetch(`${baseURL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      
      console.log('🔍 Health check response status:', response.status);
      
      if (response.status === 200) {
        const responseData = await response.json();
        console.log('✅ Server is reachable:', responseData);
        return true;
      } else {
        console.log('❌ Server returned non-200 status:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Connection test failed:', error.message);
      Alert.alert(
        'Connection Error', 
        `Cannot connect to server: ${error.message}\n\nPlease ensure:\n• Backend server is running\n• Correct IP address: 10.150.253.4:8080\n• Network connection is stable`
      );
      return false;
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Validation Error', 'Please enter both username and password');
      console.log('❌ Login validation failed: Missing username or password');
      return;
    }

    console.log('🔐 Starting login process for user:', username);
    setIsLoading(true);

    try {
      // Test connection first
      console.log('🔄 Step 1: Testing server connection...');
      const isConnected = await testConnection();
      
      if (!isConnected) {
        console.log('❌ Step 1 Failed: Cannot connect to server');
        setIsLoading(false);
        return;
      }

      console.log('✅ Step 1 Passed: Server connection successful');
      console.log('🔄 Step 2: Attempting login...');

      const result = await login(username, password);
      
      if (result.success) {
        console.log('✅ Step 2 Passed: Login successful');
        console.log('👤 User authenticated:', result.user.username);
        // Navigation will happen automatically via AuthContext
      } else {
        console.log('❌ Step 2 Failed: Login failed -', result.error);
        Alert.alert('Login Failed', result.error || 'Invalid username or password');
      }
    } catch (error) {
      console.log('❌ Login process error:', error.message);
      Alert.alert('Login Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Image
  source={require('../assets/images/logo.png')}
  style={styles.logo}
/>

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
          editable={!isLoading}
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
          editable={!isLoading}
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
  debugInfo: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
  },
  logo: {
  width: 120,
  height: 120,
  resizeMode: 'contain',
  alignSelf: 'center',
  marginBottom: 20,
},

});

export default LoginScreen;