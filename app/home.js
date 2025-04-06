import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ErrorBoundary from './components/ErrorBoundary';
import { getPhotoAndStyle } from './utils/storage';

export default function HomeScreen() {
  const router = useRouter();
  const [savedData, setSavedData] = useState({
    photoUri: null,
    selectedStyle: null,
    styleImage: null,
  });

  useEffect(() => {
    // Load saved photo and style data when the component mounts
    const loadSavedData = async () => {
      const data = await getPhotoAndStyle();
      setSavedData(data);
    };
    
    loadSavedData();
  }, []);

  const navigateToUploadPhoto = () => {
    if (savedData.photoUri) {
      // If we have a saved photo, go directly to the style selector
      router.push({
        pathname: '/style-selector',
        params: { 
          photoUri: savedData.photoUri,
          existingStyle: savedData.selectedStyle,
          existingStyleImage: savedData.styleImage
        }
      });
    } else {
      // Otherwise, go to the upload photo screen
      router.push('/upload-photo');
    }
  };

  const navigateToStyleSelector = (startType) => {
    router.push({
      pathname: '/style-selector',
      params: { startType }
    });
  };

  const handleContinueWithPhoto = () => {
    if (savedData.photoUri) {
      router.push({
        pathname: '/screens/DescriptionScreen',
        params: {
          photoUri: savedData.photoUri,
          selectedStyle: savedData.selectedStyle,
          styleImage: savedData.styleImage,
          returnTo: 'start'
        }
      });
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Artistic Photo</Text>
          <Text style={styles.subtitle}>Transform your photos into artistic masterpieces</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.option} onPress={handleContinueWithPhoto}>
              <View style={styles.iconContainer}>
                <Ionicons name="camera" size={32} color="#007AFF" />
              </View>
              <Text style={styles.optionTitle}>
                {savedData.photoUri ? 'Continue with Photo' : 'Start with a Photo'}
              </Text>
              <Text style={styles.optionDescription}>
                {savedData.photoUri 
                  ? 'Continue with your uploaded photo' 
                  : 'Upload a photo to transform'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => navigateToStyleSelector('description')}>
              <View style={styles.iconContainer}>
                <Ionicons name="text" size={32} color="#007AFF" />
              </View>
              <Text style={styles.optionTitle}>Start with Description</Text>
              <Text style={styles.optionDescription}>Describe what you want to create</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => navigateToStyleSelector('theme')}>
              <View style={styles.iconContainer}>
                <Ionicons name="color-palette" size={32} color="#007AFF" />
              </View>
              <Text style={styles.optionTitle}>Start with Theme</Text>
              <Text style={styles.optionDescription}>Choose a theme to inspire your creation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 20,
  },
  option: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 