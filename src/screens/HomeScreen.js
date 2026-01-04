import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Alert,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { DatabaseService } from '../database/db';
import { AuthService } from '../database/authService';
import FolderCard from '../components/FolderCard';
import { SelectFolderModal } from '../components/SelectFolderModal';

export default function HomeScreen({ navigation, route }) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectFolderModalVisible, setSelectFolderModalVisible] = useState(false);
  const [deepLinkVideoUrl, setDeepLinkVideoUrl] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [user, setUser] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editFolderColor, setEditFolderColor] = useState('#6366f1');

  const colors = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
    '#ef4444', // Red
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#06b6d4', // Sky Blue
    '#a855f7', // Purple
    '#ec4899', // Rose
    '#0ea5e9', // Bright Blue
    '#84cc16', // Lime
    '#f43f5e', // Crimson
    '#06b6d4', // Turquoise
    '#d946ef', // Fuchsia
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
  ];

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Verificar si vino con una URL de deep linking
    if (route?.params?.openAddVideoWithUrl) {
      setDeepLinkVideoUrl(route.params.openAddVideoWithUrl);
      setSelectFolderModalVisible(true);
      // Limpiar el parámetro
      navigation.setParams({ openAddVideoWithUrl: undefined });
    }
  }, [route?.params?.openAddVideoWithUrl]);

  useFocusEffect(
    React.useCallback(() => {
      loadFolders();
      
      // Sincronizar datos bidireccionales cuando enfocas la pantalla
      if (user) {
        DatabaseService.syncBidirectional(user.id)
          .catch(err => console.error('Sync error on focus:', err));
      }
    }, [user])
  );

  const initializeApp = async () => {
    try {
      // Inicializar base de datos
      await DatabaseService.initializeDatabase();

      // Obtener usuario actual
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await loadFolders();
      } else {
        Alert.alert('Error', 'No se pudo obtener la información del usuario');
      }
    } catch (error) {
      console.error('Error inicializando:', error);
      Alert.alert('Error', 'Error al inicializar la aplicación');
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        const allFolders = await DatabaseService.getFoldersByUser(currentUser.id);
        setFolders(allFolders);
      }
    } catch (error) {
      console.error('Error cargando carpetas:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la carpeta');
      return;
    }

    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        await DatabaseService.createFolder(
          currentUser.id,
          newFolderName,
          selectedColor
        );
        setNewFolderName('');
        setSelectedColor('#6366f1');
        setModalVisible(false);
        await loadFolders();
        Alert.alert('Éxito', 'Carpeta creada correctamente');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteFolder = (folderId) => {
    Alert.alert(
      'Eliminar Carpeta',
      '¿Estás seguro de que deseas eliminar esta carpeta? Se eliminarán todos los videos guardados.',
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await DatabaseService.deleteFolder(folderId);
              await loadFolders();
              Alert.alert('Éxito', 'Carpeta eliminada');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleOpenFolder = (folderId, folderName) => {
    navigation.navigate('FolderDetail', {
      folderId,
      folderName,
    });
  };

  const handleFolderSelectedFromDeepLink = ({ folderId, folderName, videoUrl }) => {
    setSelectFolderModalVisible(false);
    setDeepLinkVideoUrl(null);
    // Navegar a FolderDetail con la URL del video para agregar
    navigation.navigate('FolderDetail', {
      folderId,
      folderName,
      openAddVideoWithUrl: videoUrl,
    });
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setEditFolderName(folder.name);
    setEditFolderColor(folder.color || '#6366f1');
    setEditModalVisible(true);
  };

  const handleSaveEditFolder = async () => {
    if (!editFolderName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre');
      return;
    }

    try {
      await DatabaseService.updateFolder(editingFolder.id, editFolderName, editFolderColor);
      await loadFolders();
      setEditModalVisible(false);
      Alert.alert('Éxito', 'Carpeta actualizada correctamente');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const showFolderMenu = (folder) => {
    Alert.alert(
      folder.name,
      'Selecciona una acción',
      [
        {
          text: 'Editar',
          onPress: () => handleEditFolder(folder),
        },
        {
          text: 'Eliminar',
          onPress: () => handleDeleteFolder(folder.id),
          style: 'destructive',
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Deseas cerrar sesión?',
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          onPress: async () => {
            try {
              await AuthService.signOut();
              // La navegación se manejará automáticamente en App.js
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
      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greeting}>
            Hola, {user?.user_metadata?.username || 'usuario'}
          </Text>
          <Text style={styles.subtitle}>
            {folders.length} {folders.length === 1 ? 'carpeta' : 'carpetas'}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>🚪</Text>
        </Pressable>
      </View>

      {/* Folders List */}
      {folders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📁</Text>
          <Text style={styles.emptyTitle}>No hay carpetas</Text>
          <Text style={styles.emptyText}>
            Crea tu primera carpeta para empezar a guardar videos
          </Text>
        </View>
      ) : (
        <FlatList
          data={folders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.folderItemContainer}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => handleOpenFolder(item.id, item.name)}
              >
                <FolderCard folder={item} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.menuButton,
                  pressed && styles.menuButtonPressed,
                ]}
                onPress={() => showFolderMenu(item)}
              >
                <Text style={styles.menuButtonText}>⋮</Text>
              </Pressable>
            </View>
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.foldersList}
        />
      )}

      {/* Create Folder Button */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      {/* Create Folder Modal */}
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
              <Text style={styles.modalTitle}>Crear Nueva Carpeta</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            {/* Name Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nombre de la carpeta</Text>
              <TextInput
                style={styles.input}
                placeholder="ej: Recetas, Academias, Proyectos..."
                placeholderTextColor="#999"
                value={newFolderName}
                onChangeText={setNewFolderName}
              />
            </View>

            {/* Color Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Color</Text>
              <View style={styles.colorGrid}>
                {colors.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.createButton]}
                onPress={handleCreateFolder}
              >
                <Text style={styles.createButtonText}>Crear Carpeta</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Folder Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Carpeta</Text>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            {/* Name Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nombre de la carpeta</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la carpeta"
                placeholderTextColor="#999"
                value={editFolderName}
                onChangeText={setEditFolderName}
              />
            </View>

            {/* Color Picker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Color</Text>
              <View style={styles.colorPickerContainer}>
                {colors.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      editFolderColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setEditFolderColor(color)}
                  >
                    {editFolderColor === color && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.createButton]}
                onPress={handleSaveEditFolder}
              >
                <Text style={styles.createButtonText}>Guardar Cambios</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Select Folder Modal for Deep Link */}
      <SelectFolderModal
        visible={selectFolderModalVisible}
        videoUrl={deepLinkVideoUrl}
        onFolderSelected={handleFolderSelectedFromDeepLink}
        onClose={() => {
          setSelectFolderModalVisible(false);
          setDeepLinkVideoUrl(null);
        }}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonPressed: {
    backgroundColor: '#e0e0e0',
  },
  logoutButtonText: {
    fontSize: 20,
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
  foldersList: {
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  colorPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  colorOption: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  colorOptionSelected: {
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 8,
    shadowOpacity: 0.4,
  },
  checkmark: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
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
  createButton: {
    backgroundColor: '#6366f1',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  folderItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  menuButtonPressed: {
    backgroundColor: '#f0f0f0',
  },
  menuButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
});
