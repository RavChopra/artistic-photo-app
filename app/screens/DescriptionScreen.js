import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, TextInput, Dimensions, Alert, ScrollView, Animated, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { handleImageError } from '../utils/errorHandling';
import { APP_VERSION, getFullVersion } from '../utils/version';
import { savePhotoAndStyle } from '../utils/storage';

export default function DescriptionScreen() {
  const router = useRouter();
  const { photoUri, selectedStyle, styleImage } = useLocalSearchParams();
  const [description, setDescription] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const photoOverlayOpacity = useRef(new Animated.Value(1)).current;
  const styleOverlayOpacity = useRef(new Animated.Value(1)).current;
  const styleNameOpacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Get image dimensions when photoUri changes
    if (photoUri) {
      Image.getSize(photoUri, (width, height) => {
        setImageDimensions({ width, height });
      }, (error) => {
        handleImageError(error);
      });
    }
  }, [photoUri]);

  useEffect(() => {
    // Fade out overlays after 2 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(photoOverlayOpacity, {
          toValue: 0,
          duration: 1000, // 1 second fade out
          useNativeDriver: true,
        }),
        Animated.timing(styleOverlayOpacity, {
          toValue: 0,
          duration: 1000, // 1 second fade out
          useNativeDriver: true,
        }),
        Animated.timing(styleNameOpacity, {
          toValue: 1,
          duration: 1000, // 1 second fade in
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        // Use a small timeout to ensure the keyboard is visible before scrolling
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleStylePress = () => {
    router.push({
      pathname: '/style-selector',
      params: { 
        photoUri,
        existingStyle: selectedStyle,
        existingStyleImage: styleImage
      },
    });
  };

  const handlePhotoPress = () => {
    router.push({
      pathname: '/upload-photo',
      params: { 
        returnTo: 'description',
        selectedStyle,
        styleImage,
        existingPhotoUri: photoUri
      },
    });
  };

  const handleBackToStart = async () => {
    // Save the current photo and style information before navigating back to start
    if (photoUri) {
      await savePhotoAndStyle(photoUri, selectedStyle, styleImage);
    }
    router.push('/');
  };

  const handleGenerate = () => {
    // Remove the validation check since description is now optional
    // TODO: Implement image generation logic
    console.log('Generating image with:', { photoUri, selectedStyle, description });
  };

  const focusInput = () => {
    // Focus the input first, then scroll
    inputRef.current?.focus();
    // Use a small timeout to ensure the keyboard is visible before scrolling
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  // Calculate the appropriate dimensions for the preview
  const getPreviewDimensions = () => {
    const screenWidth = Dimensions.get('window').width - 40; // Account for padding
    const screenHeight = Dimensions.get('window').height * 0.3; // Use 30% of screen height
    
    if (imageDimensions.width === 0 || imageDimensions.height === 0) {
      return { width: screenWidth, height: screenHeight };
    }
    
    const aspectRatio = imageDimensions.width / imageDimensions.height;
    
    if (aspectRatio > 1) {
      // Landscape image
      return {
        width: screenWidth,
        height: screenWidth / aspectRatio
      };
    } else {
      // Portrait image
      return {
        width: screenHeight * aspectRatio,
        height: screenHeight
      };
    }
  };

  const previewDimensions = getPreviewDimensions();

  // Parse the style image if it's a JSON string (for local images)
  const getStyleImageSource = () => {
    if (!styleImage) {
      return { uri: `https://via.placeholder.com/300x300?text=${encodeURIComponent(selectedStyle)}` };
    }
    
    try {
      // Check if it's a JSON string (local image)
      const parsedImage = JSON.parse(styleImage);
      return parsedImage;
    } catch (e) {
      // If it's not JSON, it's a URL string
      return { uri: styleImage };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackToStart}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
          <Text style={styles.backButtonText}>Back to Start</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Description</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Choose Photo</Text>
            <TouchableOpacity onPress={handlePhotoPress}>
              <View style={styles.photoPreviewContainer}>
                <Image 
                  source={{ uri: photoUri }} 
                  style={styles.photoPreview} 
                  resizeMode="cover"
                />
                <Animated.View style={[styles.changeOverlay, { opacity: photoOverlayOpacity }]}>
                  <Ionicons name="camera" size={24} color="#FFFFFF" />
                  <Text style={styles.changeText}>Change Photo</Text>
                </Animated.View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Choose Style</Text>
            <TouchableOpacity onPress={handleStylePress}>
              <View style={styles.stylePreviewContainer}>
                <Image 
                  source={getStyleImageSource()} 
                  style={styles.stylePreview} 
                  resizeMode="cover"
                />
                <Animated.View style={[styles.changeOverlay, { opacity: styleOverlayOpacity }]}>
                  <Ionicons name="brush" size={24} color="#FFFFFF" />
                  <Text style={styles.changeText}>Change Style</Text>
                </Animated.View>
                <Animated.View style={[styles.styleNameContainer, { opacity: styleNameOpacity }]}>
                  <Text style={styles.styleName}>{selectedStyle}</Text>
                </Animated.View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Add Description (Optional)</Text>
            <View style={styles.inputContainer}>
              {!description && (
                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderText}>Describe how you want your image to be transformed</Text>
                  <Text style={styles.placeholderTextItalic}>e.g. Me as a wizard in a cyberpunk city</Text>
                </View>
              )}
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.generateButton} 
            onPress={handleGenerate}
          >
            <Text style={styles.generateButtonText}>Generate</Text>
          </TouchableOpacity>
          
          {/* Add minimal padding at the bottom */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Text style={styles.versionText}>{getFullVersion()}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  photoPreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    height: 200,
    width: '100%',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  stylePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    height: 200,
    width: '100%',
  },
  stylePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  changeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  changeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  styleNameContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  styleName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  input: {
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    color: '#000000',
    textAlignVertical: 'top',
    width: '100%',
  },
  placeholderContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999999',
  },
  placeholderTextItalic: {
    fontSize: 16,
    color: '#999999',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    fontSize: 12,
    color: '#8E8E93',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
}); 