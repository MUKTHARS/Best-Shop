import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import StockEntryScreen from './src/screens/StockEntryScreen';
import StockPreviewScreen from './src/screens/StockPreviewScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import UsersScreen from './src/screens/UsersScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="StockEntry" component={StockEntryScreen} />
            <Stack.Screen name="StockPreview" component={StockPreviewScreen} />
            <Stack.Screen name="Products" component={ProductsScreen} />
            {user.role === 'admin' && (
              <Stack.Screen name="Users" component={UsersScreen} />
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