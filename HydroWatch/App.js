import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { AppProvider } from './state/AppContext';
import { StatusBar } from 'react-native';

const App = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" />
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;