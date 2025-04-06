import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { handleImageError } from '../utils/errorHandling';
import { savePhotoAndStyle } from '../utils/storage';

export default function UploadPhotoScreen() {
  const router = useRouter();
  const { returnTo, selectedStyle, styleImage, existingPhotoUri } = useLocalSearchParams();
  const [photoUri, setPhotoUri] = useState(existingPhotoUri || null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // If we have an existing photo, get its dimensions
    if (existingPhotoUri) {
      Image.getSize(existingPhotoUri, (width, height) => {
        setImageDimensions({ width, height });
      });
    }
  }, [existingPhotoUri]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Set to false to allow full image capture
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);
        
        // Get image dimensions
        Image.getSize(uri, (width, height) => {
          setImageDimensions({ width, height });
        });
      }
    } catch (error) {
      handleImageError(error);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false, // Set to false to allow full image capture
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);
        
        // Get image dimensions
        Image.getSize(uri, (width, height) => {
          setImageDimensions({ width, height });
        });
      }
    } catch (error) {
      handleImageError(error);
    }
  };

  const handleContinue = () => {
    if (photoUri) {
      if (returnTo === 'description' && selectedStyle && styleImage) {
        // If we're returning to the description screen, go back with the new photo
        router.push({
          pathname: '/description',
          params: { 
            photoUri,
            selectedStyle,
            styleImage
          },
        });
      } else {
        // Otherwise, go to the style selector
        router.push({
          pathname: '/style-selector',
          params: { 
            photoUri,
            existingStyle: selectedStyle,
            existingStyleImage: styleImage
          },
        });
      }
    } else {
      Alert.alert('Photo Required', 'Please select or take a photo to continue');
    }
  };

  const handleBackToStart = async () => {
    // Save the current photo and style information before navigating back to start
    if (photoUri) {
      await savePhotoAndStyle(photoUri, selectedStyle, styleImage);
    }
    router.push('/');
  };

  const handleBack = () => {
    if (returnTo === 'description' && selectedStyle && styleImage) {
      // If we're returning to the description screen, go back with the existing photo
      router.push({
        pathname: '/description',
        params: { 
          photoUri: existingPhotoUri,
          selectedStyle,
          styleImage
        },
      });
    } else {
      // Otherwise, go back to start
      router.push('/');
    }
  };

  // Calculate the appropriate dimensions for the preview
  const getPreviewDimensions = () => {
    const screenWidth = Dimensions.get('window').width - 40; // Account for padding
    const screenHeight = Dimensions.get('window').height * 0.5; // Use 50% of screen height
    
    if (imageDimensions.width === 0 || imageDimensions.height === 0) {
      return { width: screenWidth, height: screenHeight }; // Allow vertical stretching
    }
    
    const aspectRatio = imageDimensions.width / imageDimensions.height;
    
    if (aspectRatio > 1) {
      // Landscape image
      return {
        width: screenWidth,
        height: screenWidth / aspectRatio
      };
    } else {
      // Portrait or square image
      return {
        width: screenWidth,
        height: Math.min(screenHeight, screenWidth / aspectRatio) // Allow stretching up to screenHeight
      };
    }
  };

  const previewDimensions = getPreviewDimensions();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
          <Text style={styles.backButtonText}>
            {returnTo === 'description' && selectedStyle && styleImage ? 'Back to Preview' : 'Back to Start'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {returnTo === 'description' ? 'Description' : 'Start'}
        </Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              {existingPhotoUri 
                ? 'Choose a different photo or take a new one' 
                : 'Choose a photo from your gallery or take a new one'}
            </Text>

            {photoUri ? (
              <View style={styles.previewContainer}>
                <View style={[
                  styles.imageContainer,
                  {
                    width: previewDimensions.width,
                    height: previewDimensions.height,
                    borderRadius: 12,
                  }
                ]}>
                  <Image 
                    source={{ uri: photoUri }} 
                    style={styles.preview} 
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
                    <Ionicons name="images" size={20} color="#007AFF" />
                    <Text style={styles.changeButtonText}>Change Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.changeButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={20} color="#007AFF" />
                    <Text style={styles.changeButtonText}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.option} onPress={pickImage}>
                  <Ionicons name="images" size={32} color="#007AFF" />
                  <Text style={styles.optionText}>Choose from Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={takePhoto}>
                  <Ionicons name="camera" size={32} color="#007AFF" />
                  <Text style={styles.optionText}>Take a Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.continueButton, !photoUri && styles.disabledButton]} 
              onPress={handleContinue}
              disabled={!photoUri}
            >
              <Text style={styles.continueButtonText}>
                {returnTo === 'description' ? 'Update Photo' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Add extra padding at the bottom to ensure content is visible above keyboard */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#fff',
    position: 'relative',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 16,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 17,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  option: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    width: '45%',
  },
  optionText: {
    marginTop: 8,
    fontSize: 16,
    color: '#007AFF',
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  imageContainer: {
    backgroundColor: '#F2F2F7',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  changeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  changeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
}); 