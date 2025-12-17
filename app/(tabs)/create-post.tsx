import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@/services/api';
import { useRouter } from 'expo-router';
import { ImageIcon, X } from 'lucide-react-native';

export default function CreatePostScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
    }
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Por favor, informe o título');
      return;
    }

    if (!content.trim()) {
      setError('Por favor, informe o conteúdo');
      return;
    }

    if (!image) {
      setError('Por favor, selecione uma imagem');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const fileExtension = image.uri.split('.').pop() || 'jpg';
      const fileName = `photo_${Date.now()}.${fileExtension}`;

      const photo = {
        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
        name: fileName,
        type: `image/${fileExtension}`,
      };

      await api.createPost(title, content, photo);

      Alert.alert('Sucesso', 'Post criado com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            setTitle('');
            setContent('');
            setImage(null);
            router.push('/(tabs)');
          },
        },
      ]);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar post');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Novo Post</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Imagem *</Text>
            {image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImage(null)}
                  disabled={loading}
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={pickImage}
                disabled={loading}
              >
                <ImageIcon size={32} color="#8e8e8e" />
                <Text style={styles.imagePickerText}>Selecionar foto</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o título do post"
              placeholderTextColor="#8e8e8e"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Conteúdo *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Compartilhe algo interessante..."
              placeholderTextColor="#8e8e8e"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Publicar</Text>
            )}
          </TouchableOpacity>
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
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#262626',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 8,
  },
  imagePicker: {
    backgroundColor: '#fafafa',
    borderWidth: 2,
    borderColor: '#dbdbdb',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8e8e8e',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#262626',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  button: {
    backgroundColor: '#0095f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
