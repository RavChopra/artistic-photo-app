import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ErrorBoundary from '../components/ErrorBoundary';

const HomeScreen = () => {
  const navigation = useNavigation();

  const navigateToStyleSelector = (startType) => {
    navigation.navigate('StyleSelector', { startType });
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>🎨 Artistic Photo App</Text>
        <Text style={styles.subtitle}>Choose how you want to start:</Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigateToStyleSelector('photo')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📷</Text>
            </View>
            <Text style={styles.optionTitle}>Start with a Photo</Text>
            <Text style={styles.optionDescription}>
              Upload an existing photo and transform it with artistic styles
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigateToStyleSelector('description')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>✍️</Text>
            </View>
            <Text style={styles.optionTitle}>Start with a Description</Text>
            <Text style={styles.optionDescription}>
              Describe what you want to create and let AI generate it
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigateToStyleSelector('theme')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🎭</Text>
            </View>
            <Text style={styles.optionTitle}>Start with a Theme</Text>
            <Text style={styles.optionDescription}>
              Choose a theme and explore different artistic interpretations
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 30,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  optionDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
});

export default HomeScreen; 