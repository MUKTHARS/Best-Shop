import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Image, Text, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import StockEntryScreen from './src/screens/StockEntryScreen';
import StockPreviewScreen from './src/screens/StockPreviewScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import UsersScreen from './src/screens/UsersScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [logoError, setLogoError] = useState(false); // ✅ Track image load error

  console.log('🧭 Navigation State:', {
    isLoading,
    isAuthenticated,
    user: user?.username,
    role: user?.role
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            {/* ✅ Dashboard header with logo (fallback to text if load fails) */}
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{
                headerTitleAlign: 'left',
                headerTitle: () =>
                  logoError ? (
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: '#333',
                        marginLeft: 10,
                      }}
                    >
                      Best Shop
                    </Text>
                  ) : (
                    <Image
                      source={require('./src/assets/images/logo.png')}
                      style={{
                        width: 75,
                        height: 75,
                        resizeMode: 'contain',
                        marginLeft: 10,
                      }}
                      onError={() => setLogoError(true)} // ✅ fallback trigger
                    />
                  ),
              }}
            />

            <Stack.Screen
              name="StockEntry"
              component={StockEntryScreen}
              options={{ title: 'Stock Entry' }}
            />
            <Stack.Screen
              name="StockPreview"
              component={StockPreviewScreen}
              options={{ title: 'Stock Preview' }}
            />
            <Stack.Screen
              name="Products"
              component={ProductsScreen}
              options={{ title: 'Products' }}
            />
            {user?.role === 'admin' && (
              <Stack.Screen
                name="Users"
                component={UsersScreen}
                options={{ title: 'User Management' }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
