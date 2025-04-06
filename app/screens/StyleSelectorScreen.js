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
import * as ImagePicker from 'expo-image-picker';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorDisplay from '../components/ErrorDisplay';
import {
  ImageProcessingError,
  APIError,
  StyleSelectionError,
  ERROR_MESSAGES,
  handleImageError,
  handleAPIError,
  handleStyleError
} from '../utils/errorHandling';

const screenWidth = Dimensions.get('window').width;
const tileWidth = screenWidth / 2 - 15;
const screenHeight = Dimensions.get('window').height;
const thirdScreenHeight = screenHeight / 3;

// Import the styles from the original app
const stylesByCategory = {
  'Pop Culture': [
    { name: 'Cyberpunk', image: require('../../assets/styles/Cyberpunk.png') },
    { name: 'Steampunk', image: require('../../assets/styles/Steampunk.png')},
    { name: 'Anime', image: require('../../assets/styles/Anime.png') },
    { name: 'Studio Ghibli', image: require('../../assets/styles/Studio Ghibli.png') },
    { name: 'Pixel Art', image: require('../../assets/styles/Pixel Art.png') },
    { name: 'Cartoon Network', image: require('../../assets/styles/Cartoon Network.png') },
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

const StyleSelectorScreen = ({ route, navigation }) => {
  const { startType } = route.params || { startType: 'photo' };
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  // Set the screen title based on the start type
  useEffect(() => {
    let title = 'Select Style';
    if (startType === 'photo') {
      title = 'Transform Your Photo';
    } else if (startType === 'description') {
      title = 'Create from Description';
    } else if (startType === 'theme') {
      title = 'Explore by Theme';
    }
    navigation.setOptions({ title });
  }, [startType, navigation]);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new ImageProcessingError(ERROR_MESSAGES.IMAGE.UPLOAD_FAILED);
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        setError(null);
      }
    } catch (error) {
      setError(handleImageError(error));
    }
  };

  const handleGenerate = async () => {
    if (startType === 'photo' && !image) {
      setError(handleImageError(new ImageProcessingError(ERROR_MESSAGES.IMAGE.UPLOAD_FAILED)));
      return;
    }
    if (startType === 'description' && !description) {
      setError(handleStyleError(new StyleSelectionError('Please enter a description')));
      return;
    }
    if (!style) {
      setError(handleStyleError(new StyleSelectionError(ERROR_MESSAGES.STYLE.SELECTION_REQUIRED)));
      return;
    }

    setLoading(true);
    setError(null);
    
    let finalPrompt = '';
    if (startType === 'photo') {
      finalPrompt = `${description || 'A portrait'} in ${style} style`;
    } else if (startType === 'description') {
      finalPrompt = `${description} in ${style} style`;
    } else if (startType === 'theme') {
      finalPrompt = `Generate a ${style} style image based on the theme: ${description || 'artistic creation'}`;
    }
    
    try {
      const response = await fetch('https://your-backend-url.com/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: startType === 'photo' ? image : null, 
          style, 
          prompt: finalPrompt,
          startType 
        })
      });

      if (!response.ok) {
        throw new APIError(ERROR_MESSAGES.API.SERVER_ERROR, response.status);
      }

      const data = await response.json();
      if (!data.generatedImageUrl) {
        throw new APIError(ERROR_MESSAGES.API.INVALID_RESPONSE);
      }

      setGeneratedImage(data.generatedImageUrl);
    } catch (error) {
      setError(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleErrorAction = () => {
    setError(null);
  };

  const renderStyleTile = ({ name, image }) => (
    <TouchableOpacity
      key={name}
      style={[styles.tile, style === name && styles.selectedTile]}
      onPress={() => setStyle(name)}
    >
      <Image source={image} style={styles.previewImage} />
      <Text style={styles.tileText}>{name}</Text>
    </TouchableOpacity>
  );

  const renderInputSection = () => {
    if (startType === 'photo') {
      return (
        <>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadButtonText}>Upload Photo</Text>
          </TouchableOpacity>
          {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
        </>
      );
    } else if (startType === 'description' || startType === 'theme') {
      return (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            {startType === 'description' ? 'Describe what you want to create:' : 'Enter a theme:'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={startType === 'description' ? 
              "e.g. a magical forest with glowing mushrooms" : 
              "e.g. fantasy, nature, urban, abstract"}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }
    return null;
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {error && (
            <ErrorDisplay
              error={error}
              onAction={handleErrorAction}
            />
          )}

          {renderInputSection()}

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

          <TouchableOpacity 
            style={[styles.generateButton, (!style || (startType === 'photo' && !image) || (startType !== 'photo' && !description)) && styles.disabledButton]} 
            onPress={handleGenerate}
            disabled={!style || (startType === 'photo' && !image) || (startType !== 'photo' && !description) || loading}
          >
            <Text style={styles.generateButtonText}>
              {loading ? 'Generating...' : 'Generate Image'}
            </Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#f4511e" style={{ marginTop: 20 }} />}

          {generatedImage && (
            <>
              <Text style={styles.resultTitle}>Your AI Image:</Text>
              <Image source={{ uri: generatedImage }} style={styles.resultImage} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
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
  imagePreview: {
    width: '100%',
    height: 300,
    marginVertical: 20,
    borderRadius: 10,
    alignSelf: 'center',
  },
  resultImage: {
    width: '100%',
    height: 300,
    marginVertical: 20,
    borderRadius: 10,
    alignSelf: 'center',
  },
  uploadButton: {
    backgroundColor: '#f4511e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: '#f4511e',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
});

export default StyleSelectorScreen; 