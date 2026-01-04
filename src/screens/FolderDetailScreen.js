import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Pressable,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DatabaseService } from '../database/db';
import { VideoMetadataExtractor } from '../utils/videoMetadataExtractor';
import VideoCard from '../components/VideoCard';
import { FilterModal } from '../components/FilterModal';

export default function FolderDetailScreen({ route, navigation }) {
  const { folderId, folderName, openAddVideoWithUrl } = route.params;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    platforms: [],
    sortBy: 'newest',
    minImportance: 1,
    maxImportance: 5,
  });

  useEffect(() => {
    loadVideos();
  }, [folderId]);

  useEffect(() => {
    // Recargar videos cuando cambian los filtros
    loadVideos();
  }, [activeFilters]);

  useEffect(() => {
    // Configurar el botón de filtros en el header
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          style={{ marginRight: 16 }}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="funnel" size={24} color="#fff" />
        </Pressable>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    // Si viene con una URL desde deep linking, abrirla automáticamente
    if (openAddVideoWithUrl) {
      setVideoUrl(openAddVideoWithUrl);
      setModalVisible(true);
      // Extraer título automáticamente
      try {
        const platform = VideoMetadataExtractor.extractPlatform(openAddVideoWithUrl);
        const extractedTitle = VideoMetadataExtractor.extractTitleFromUrl(openAddVideoWithUrl, platform);
        if (extractedTitle) {
          setVideoTitle(extractedTitle);
        }
      } catch (error) {
        console.error('Error extrayendo título:', error);
      }
    }
  }, [openAddVideoWithUrl]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      // Usar filtros si están activos
      const hasActiveFilters =
        activeFilters.platforms.length > 0 ||
        activeFilters.sortBy !== 'newest' ||
        activeFilters.minImportance !== 1 ||
        activeFilters.maxImportance !== 5;

      const allVideos = hasActiveFilters
        ? await DatabaseService.getVideosByFolderWithFilters(folderId, activeFilters)
        : await DatabaseService.getVideosByFolder(folderId);
      setVideos(allVideos);
    } catch (error) {
      Alert.alert('Error', 'Error cargando videos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (url) => {
    setVideoUrl(url);
    
    // Extraer título automáticamente si la URL es válida
    if (url.trim()) {
      try {
        const platform = VideoMetadataExtractor.extractPlatform(url);
        const extractedTitle = VideoMetadataExtractor.extractTitleFromUrl(url, platform);
        
        if (extractedTitle && !videoTitle) {
          // Solo establecer el título si el usuario no ha ingresado uno manualmente
          setVideoTitle(extractedTitle);
        }
      } catch (error) {
        console.error('Error extrayendo título:', error);
      }
    }
  };

  const handleAddVideo = async () => {
    if (!videoUrl.trim() || !videoTitle.trim()) {
      Alert.alert('Error', 'Por favor completa URL y título');
      return;
    }

    try {
      const platform = VideoMetadataExtractor.extractPlatform(videoUrl);
      let thumbnail = null;

      if (platform === 'youtube') {
        thumbnail = VideoMetadataExtractor.getYouTubeThumbnail(videoUrl);
      }

      await DatabaseService.createVideo(
        folderId,
        videoTitle,
        videoUrl,
        platform,
        thumbnail,
        videoDescription
      );

      closeModalAndClear();
      await loadVideos();
      Alert.alert('Éxito', 'Video agregado correctamente');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const closeModalAndClear = () => {
    setVideoUrl('');
    setVideoTitle('');
    setVideoDescription('');
    setModalVisible(false);
  };

  const handleDeleteVideo = (videoId) => {
    Alert.alert(
      'Eliminar Video',
      '¿Estás seguro de que deseas eliminar este video?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await DatabaseService.deleteVideo(videoId);
              await loadVideos();
              Alert.alert('Éxito', 'Video eliminado');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {videos.length} {videos.length === 1 ? 'video' : 'videos'}
        </Text>
      </View>

      {/* Videos List */}
      {videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📽️</Text>
          <Text style={styles.emptyTitle}>Sin videos</Text>
          <Text style={styles.emptyText}>
            Agrega tu primer video a esta carpeta
          </Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('VideoDetail', {
                  videoId: item.id,
                  folderName,
                })
              }
              onLongPress={() => handleDeleteVideo(item.id)}
            >
              <VideoCard
                video={item}
              />
            </Pressable>
          )}
          contentContainerStyle={styles.videosList}
        />
      )}

      {/* Add Video FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      {/* Add Video Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Video</Text>
              <Pressable onPress={closeModalAndClear}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            {/* URL Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>URL del Video</Text>
              <TextInput
                style={styles.input}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor="#999"
                value={videoUrl}
                onChangeText={handleUrlChange}
                autoCapitalize="none"
              />
            </View>

            {/* Title Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Título</Text>
              <TextInput
                style={styles.input}
                placeholder="Título del video"
                placeholderTextColor="#999"
                value={videoTitle}
                onChangeText={setVideoTitle}
              />
            </View>

            {/* Description Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Descripción breve del video"
                placeholderTextColor="#999"
                value={videoDescription}
                onChangeText={setVideoDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={closeModalAndClear}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.addButton]}
                onPress={handleAddVideo}
              >
                <Text style={styles.addButtonText}>Agregar Video</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={setActiveFilters}
        currentFilters={activeFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statsText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  videosList: {
    paddingVertical: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabPressed: {
    opacity: 0.9,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
  },
  descriptionInput: {
    textAlignVertical: 'top',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#6366f1',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
