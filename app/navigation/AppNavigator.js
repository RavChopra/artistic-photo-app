import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import StyleSelectorScreen from '../screens/StyleSelectorScreen';

// Create the stack navigator
const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Artistic Photo App' }} 
        />
        <Stack.Screen 
          name="StyleSelector" 
          component={StyleSelectorScreen} 
          options={{ title: 'Select Style' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 