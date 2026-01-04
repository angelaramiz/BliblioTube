import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  FlatList,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DatabaseService } from '../database/db';
import { AuthService } from '../database/authService';
import { extractTitleFromUrl } from '../utils/videoMetadataExtractor';
import { Toast, useToast } from '../components/Toast';

export default function QuickSaveScreen({ route, navigation }) {
  const { toast, showSuccess, showError } = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [importance, setImportance] = useState(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeQuickSave();
  }, []);

  const initializeQuickSave = async () => {
    try {
      // Obtener URL del deep link
      const url = route?.params?.videoUrl;
      if (url) {
        setVideoUrl(url);
        // Extraer título automáticamente
        const title = await extractTitleFromUrl(url);
        setVideoTitle(title);
      }

      // Obtener usuario actual
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await loadFolders(currentUser.id);
      } else {
        Alert.alert(
          'Sesión requerida',
          'Debes iniciar sesión para guardar videos',
          [{ text: 'OK', onPress: () => goBackToSource() }]
        );
      }
    } catch (error) {
      console.error('Error inicializando quick save:', error);
      showError('Error al procesar el enlace');
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async (userId) => {
    try {
      const allFolders = await DatabaseService.getFoldersByUser(userId);
      setFolders(allFolders);
      if (allFolders.length > 0) {
        setSelectedFolderId(allFolders[0].id);
      }
    } catch (error) {
      console.error('Error cargando carpetas:', error);
    }
  };

  const handleSaveVideo = async () => {
    if (!selectedFolderId) {
      showError('Por favor selecciona una carpeta');
      return;
    }

    setSaving(true);
    try {
      await DatabaseService.createVideo(
        selectedFolderId,
        videoTitle || 'Sin título',
        videoUrl,
        'unknown', // platform
        null, // thumbnail
        '', // description
        importance
      );

      showSuccess('Video guardado correctamente');
      setTimeout(() => goBackToSource(), 1500);
    } catch (error) {
      showError('No se pudo guardar el video: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const goBackToSource = () => {
    // Volver a la app anterior (YouTube, Instagram, etc)
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Guardar Video</Text>
        <Pressable onPress={goBackToSource} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* URL del video */}
        <View style={styles.section}>
          <Text style={styles.label}>Enlace del video:</Text>
          <Text style={styles.url} numberOfLines={2}>
            {videoUrl}
          </Text>
        </View>

        {/* Título del video */}
        <View style={styles.section}>
          <Text style={styles.label}>Título:</Text>
          <TextInput
            style={styles.input}
            value={videoTitle}
            onChangeText={setVideoTitle}
            placeholder="Título del video"
            placeholderTextColor="#999"
          />
        </View>

        {/* Seleccionar carpeta */}
        <View style={styles.section}>
          <Text style={styles.label}>Guardar en:</Text>
          {folders.length > 0 ? (
            <FlatList
              data={folders}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.folderOption,
                    selectedFolderId === item.id && styles.folderOptionSelected,
                  ]}
                  onPress={() => setSelectedFolderId(item.id)}
                >
                  <View
                    style={[
                      styles.folderColor,
                      { backgroundColor: item.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.folderName,
                      selectedFolderId === item.id &&
                        styles.folderNameSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {selectedFolderId === item.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              )}
            />
          ) : (
            <Text style={styles.noFolders}>No tienes carpetas creadas</Text>
          )}
        </View>

        {/* Nivel de importancia */}
        <View style={styles.section}>
          <Text style={styles.label}>Nivel de Importancia:</Text>
          <View style={styles.importanceContainer}>
            {[1, 2, 3, 4, 5].map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.starButton,
                  importance >= level && styles.starButtonActive,
                ]}
                onPress={() => setImportance(level)}
              >
                <Ionicons
                  name={importance >= level ? 'star' : 'star-outline'}
                  size={24}
                  color={
                    importance >= level
                      ? level <= 2
                        ? '#ef4444'
                        : level === 3
                        ? '#eab308'
                        : '#22c55e'
                      : '#d1d5db'
                  }
                />
              </Pressable>
            ))}
          </View>
          <Text style={styles.importanceLabel}>
            {['Muy Baja', 'Baja', 'Media', 'Alta', 'Muy Alta'][importance - 1]}
          </Text>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.footer}>
        <Pressable
          style={styles.cancelButton}
          onPress={goBackToSource}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </Pressable>

        <Pressable
          style={[
            styles.saveButton,
            (saving || !selectedFolderId) && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveVideo}
          disabled={saving || !selectedFolderId}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar</Text>
          )}
        </Pressable>
      </View>
      
      <Toast {...toast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  url: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    fontFamily: 'monospace',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: '#333',
  },
  folderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  folderOptionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f3ff',
  },
  folderColor: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
  },
  folderName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  folderNameSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  noFolders: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  importanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  starButtonActive: {
    opacity: 1,
  },
  importanceLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
