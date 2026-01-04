import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { DatabaseService } from '../database/db';
import { AuthService } from '../database/authService';

export const SelectFolderModal = ({ visible, videoUrl, onFolderSelected, onClose, autoDismissDelay = 2000 }) => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (visible) {
      loadFolders();
      setSuccessMessage('');
    }
  }, [visible]);

  // Auto-dismiss después de seleccionar
  useEffect(() => {
    if (successMessage && autoDismissDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [successMessage, autoDismissDelay, onClose]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        const allFolders = await DatabaseService.getFoldersByUser(currentUser.id);
        setFolders(allFolders);
        if (allFolders.length > 0) {
          setSelectedFolderId(allFolders[0].id);
        }
      }
    } catch (error) {
      console.error('Error cargando carpetas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedFolderId) {
      const selectedFolder = folders.find(f => f.id === selectedFolderId);
      setSuccessMessage('✓ Video guardado');
      // Esperar un poco antes de cerrar para mostrar confirmación visual
      setTimeout(() => {
        onFolderSelected({
          folderId: selectedFolderId,
          folderName: selectedFolder.name,
          videoUrl,
        });
      }, 300);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {successMessage ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Selecciona una carpeta</Text>
              <Text style={styles.subtitle}>Para guardar el video en:</Text>

              {loading ? (
                <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
              ) : folders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay carpetas disponibles</Text>
                  <Text style={styles.emptySubtext}>Crea una carpeta primero</Text>
                </View>
              ) : (
                <FlatList
                  data={folders}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.folderItem,
                        selectedFolderId === item.id && styles.folderItemSelected,
                      ]}
                      onPress={() => setSelectedFolderId(item.id)}
                    >
                      <View
                        style={[
                          styles.folderColor,
                          { backgroundColor: item.color || '#6366f1' },
                        ]}
                      />
                      <Text style={styles.folderName}>{item.name}</Text>
                      {selectedFolderId === item.id && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </Pressable>
                  )}
                />
              )}

              <View style={styles.buttonsContainer}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleConfirm}
                  disabled={!selectedFolderId}
                >
                  <Text style={styles.confirmButtonText}>Continuar</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    maxWidth: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  folderItemSelected: {
    backgroundColor: '#f0f0ff',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  folderColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  folderName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  checkmark: {
    fontSize: 18,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#6366f1',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  successText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    textAlign: 'center',
  },
});
