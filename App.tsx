/**
 * Uzaktan Kumanda - LG & Philips TV Remote Control
 * React Native ile geliştrilmiş akıllı TV uzaktan kumanda uygulaması
 *
 * @format
 */

// WebSocket polyfill - React Native'in native WebSocket'i LG TV ile çalışmıyor
// Chrome Debugger kullanılırsa Chrome'un WebSocket'i kullanılır (çalışır)
// Bu yüzden polyfill eklenmeyecek - native veya Chrome'un WebSocket'i kullanılacak
if (typeof global.WebSocket === 'undefined') {
  console.warn('⚠️ WebSocket bulunamadı! Chrome Debugger açın.');
}

// Console log görünürlüğü artır
if (__DEV__) {
  console.log('🚀 Uygulama başlatılıyor...');
  console.log('📱 Platform: React Native');
  console.log('🔌 WebSocket: ', typeof WebSocket !== 'undefined' ? 'Hazır' : 'Eksik');
}

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreen';
import ControlScreen from './src/screens/ControlScreen';
import WebSocketTest from './src/screens/WebSocketTest';

const Stack = createStackNavigator();

function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Control" component={ControlScreen} />
            <Stack.Screen name="WebSocketTest" component={WebSocketTest} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
