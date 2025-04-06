import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorDisplay from './components/ErrorDisplay';
import {
  ImageProcessingError,
  APIError,
  StyleSelectionError,
  ERROR_MESSAGES,
  handleImageError,
  handleAPIError,
  handleStyleError
} from './utils/errorHandling';
import { Ionicons } from '@expo/vector-icons';
import { savePhotoAndStyle } from './utils/storage';

const screenWidth = Dimensions.get('window').width;
const tileWidth = screenWidth / 2 - 15;
const screenHeight = Dimensions.get('window').height;
const thirdScreenHeight = screenHeight / 3;

// Import the styles from the original app
const stylesByCategory = {
  'Pop Culture': [
    { name: 'Cyberpunk', image: require('../assets/styles/Cyberpunk.png') },
    { name: 'Steampunk', image: require('../assets/styles/Steampunk.png')},
    { name: 'Anime', image: require('../assets/styles/Anime.png') },
    { name: 'Studio Ghibli', image: require('../assets/styles/Studio Ghibli.png') },
    { name: 'Pixel Art', image: require('../assets/styles/Pixel Art.png') },
    { name: 'Cartoon Network', image: require('../assets/styles/Cartoon Network.png') },
    { name: 'Tim Burton', image: 'https://via.placeholder.com/150x150?text=Tim+Burton' },
    { name: 'Pixar Style', image: 'https://via.placeholder.com/150x150?text=Pixar+Style' }
  ],
  'Traditional Art': [
    { name: 'Watercolour', image: 'https://via.placeholder.com/150x150?text=Watercolour' },
    { name: 'Oil Painting', image: 'https://via.placeholder.com/150x150?text=Oil+Painting' },
    { name: 'Charcoal Sketch', image: 'https://via.placeholder.com/150x150?text=Charcoal+Sketch' },
    { name: 'Van Gogh', image: 'https://via.placeholder.com/150x150?text=Van+Gogh' },
    { name: 'Impressionist', image: 'https://via.placeholder.com/150x150?text=Impressionist' },
    { name: 'Cubism', image: 'https://via.placeholder.com/150x150?text=Cubism' },
    { name: 'Baroque', image: 'https://via.placeholder.com/150x150?text=Baroque' },
    { name: 'Renaissance', image: 'https://via.placeholder.com/150x150?text=Renaissance' }
  ],
  'Digital Art': [
    { name: '3D Render', image: 'https://via.placeholder.com/150x150?text=3D+Render' },
    { name: 'Digital Painting', image: 'https://via.placeholder.com/150x150?text=Digital+Painting' },
    { name: 'Voxel Art', image: 'https://via.placeholder.com/150x150?text=Voxel+Art' },
    { name: 'Game UI Art', image: 'https://via.placeholder.com/150x150?text=Game+UI+Art' },
    { name: 'Concept Art', image: 'https://via.placeholder.com/150x150?text=Concept+Art' },
    { name: 'Matte Painting', image: 'https://via.placeholder.com/150x150?text=Matte+Painting' },
    { name: 'Low-poly Art', image: 'https://via.placeholder.com/150x150?text=Low+poly+Art' }
  ],
  'Photographic': [
    { name: 'Studio Photography', image: 'https://via.placeholder.com/150x150?text=Studio+Photography' },
    { name: 'Portrait with Bokeh', image: 'https://via.placeholder.com/150x150?text=Portrait+with+Bokeh' },
    { name: 'Vintage Polaroid', image: 'https://via.placeholder.com/150x150?text=Vintage+Polaroid' },
    { name: 'Black and White Film', image: 'https://via.placeholder.com/150x150?text=Black+and+White+Film' },
    { name: 'Macro Shot', image: 'https://via.placeholder.com/150x150?text=Macro+Shot' },
    { name: 'Tilt-shift', image: 'https://via.placeholder.com/150x150?text=Tilt+shift' },
    { name: 'Fisheye Lens', image: 'https://via.placeholder.com/150x150?text=Fisheye+Lens' }
  ],
  'Modern Styles': [
    { name: 'Pop Art', image: 'https://via.placeholder.com/150x150?text=Pop+Art' },
    { name: 'Minimalist Flat Design', image: 'https://via.placeholder.com/150x150?text=Minimalist+Flat+Design' },
    { name: 'Abstract Expressionism', image: 'https://via.placeholder.com/150x150?text=Abstract+Expressionism' },
    { name: 'Synthwave', image: 'https://via.placeholder.com/150x150?text=Synthwave' },
    { name: 'Vaporwave', image: 'https://via.placeholder.com/150x150?text=Vaporwave' }
  ]
};

export default function StyleSelectorScreen() {
  const router = useRouter();
  const { photoUri, returnTo, existingStyle, existingStyleImage } = useLocalSearchParams();
  const [selectedStyle, setSelectedStyle] = useState(
    existingStyle ? { name: existingStyle, image: existingStyleImage } : null
  );
  const [error, setError] = useState(null);

  // Check if both photo and style are selected
  const hasPhotoAndStyle = photoUri && selectedStyle;

  const handleStyleSelect = (style) => {
    setSelectedStyle(style);
    
    // Navigate to the description screen immediately when a style is selected
    router.push({
      pathname: '/description',
      params: {
        photoUri,
        selectedStyle: style.name,
        styleImage: typeof style.image === 'string' 
          ? style.image 
          : JSON.stringify(style.image)
      },
    });
  };

  const handleErrorAction = () => {
    setError(null);
  };

  const handlePhotoPress = () => {
    router.push({
      pathname: '/upload-photo',
      params: { 
        returnTo: 'style-selector',
        existingPhotoUri: photoUri,
        existingStyle: selectedStyle ? selectedStyle.name : null,
        existingStyleImage: selectedStyle ? (typeof selectedStyle.image === 'string' 
          ? selectedStyle.image 
          : JSON.stringify(selectedStyle.image)) : null
      },
    });
  };

  const handleBack = async () => {
    if (hasPhotoAndStyle) {
      // If both photo and style are selected, go back to preview
      router.push({
        pathname: '/description',
        params: { 
          photoUri,
          selectedStyle: selectedStyle.name,
          styleImage: typeof selectedStyle.image === 'string' 
            ? selectedStyle.image 
            : JSON.stringify(selectedStyle.image)
        },
      });
    } else {
      // Otherwise, go back to start
      // Save the current photo and style information before navigating back to start
      if (photoUri) {
        await savePhotoAndStyle(photoUri, selectedStyle ? selectedStyle.name : null, 
          selectedStyle ? (typeof selectedStyle.image === 'string' 
            ? selectedStyle.image 
            : JSON.stringify(selectedStyle.image)) : null);
      }
      router.push('/');
    }
  };

  const renderStyleTile = ({ name, image }) => (
    <TouchableOpacity
      key={name}
      style={[styles.tile, selectedStyle && selectedStyle.name === name && styles.selectedTile]}
      onPress={() => handleStyleSelect({ name, image })}
    >
      <Image 
        source={typeof image === 'string' ? { uri: image } : image} 
        style={styles.previewImage} 
        resizeMode="cover"
      />
      <Text style={styles.tileText}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
            <Text style={styles.backButtonText}>
              {hasPhotoAndStyle ? 'Back to Preview' : 'Back to Start'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Style</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {error && (
            <ErrorDisplay
              error={error}
              onAction={handleErrorAction}
            />
          )}

          <View style={styles.photoPreviewContainer}>
            <TouchableOpacity onPress={handlePhotoPress}>
              <Image 
                source={{ uri: photoUri }} 
                style={styles.photoPreview} 
                resizeMode="cover"
              />
              <View style={styles.changeOverlay}>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
                <Text style={styles.changeText}>Change Photo</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Select a Style:</Text>
          
          {Object.entries(stylesByCategory).map(([category, stylesArray]) => (
            <View key={category} style={{ height: thirdScreenHeight }}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <FlatList
                horizontal
                data={stylesArray}
                renderItem={({ item }) => renderStyleTile(item)}
                keyExtractor={(item) => item.name}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tileList}
              />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  scrollContent: {
    padding: 20,
  },
  imagePreviewContainer: {
    marginVertical: 20,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  tileList: {
    paddingHorizontal: 10,
  },
  tile: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: tileWidth,
    height: tileWidth,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedTile: {
    backgroundColor: '#cce5ff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  tileText: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  previewImage: {
    width: tileWidth,
    height: tileWidth,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addDescriptionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 20,
  },
  addDescriptionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoPreviewContainer: {
    marginVertical: 20,
  },
  photoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    alignSelf: 'center',
  },
  changeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  changeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 