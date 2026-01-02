import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Linking,
  FlatList,
} from 'react-native';
import { DatabaseService } from '../database/db';
import { NotificationService } from '../utils/notificationService';
import { VideoMetadataExtractor } from '../utils/videoMetadataExtractor';
import { formatDate } from '../utils/dateFormat';
import { ReminderModal } from '../components/ReminderModal';

export default function VideoDetailScreen({ route, navigation }) {
  const { videoId } = route.params;
  const [video, setVideo] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);

  useEffect(() => {
    loadVideoData();
  }, [videoId]);

  const loadVideoData = async () => {
    try {
      setLoading(true);
      const videoData = await DatabaseService.getVideoById(videoId);
      if (videoData) {
        setVideo(videoData);
        const remindersData = await DatabaseService.getRemindersByVideo(videoId);
        setReminders(remindersData);
      } else {
        Alert.alert('Error', 'No se encontró el video');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReminder = async (reminderData) => {
    try {
      const reminder = await DatabaseService.createReminder(
        videoId,
        reminderData.time,
        reminderData.frequency,
        reminderData.dayOfWeek,
        reminderData.intervalDays
      );

      await NotificationService.scheduleReminder(reminder, video.title);
      await loadVideoData();
      setReminderModalVisible(false);
      Alert.alert('Éxito', 'Recordatorio configurado');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteReminder = (reminderId) => {
    Alert.alert(
      'Eliminar Recordatorio',
      '¿Deseas eliminar este recordatorio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await DatabaseService.deleteReminder(reminderId);
              await loadVideoData();
              Alert.alert('Éxito', 'Recordatorio eliminado');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const openVideo = async () => {
    if (video.url) {
      try {
        // Intentar abrir directamente sin canOpenURL ya que no siempre funciona
        await Linking.openURL(video.url);
      } catch (error) {
        console.error('Error abriendo URL:', error);
        Alert.alert('Error', 'No se puede abrir esta URL. Verifica que tienes navegador instalado.');
      }
    }
  };
        Alert.alert('Error', error.message);
      }
    }
  };

  const platformColor = video
    ? VideoMetadataExtractor.getPlatformColor(video.platform)
    : '#999';
  const platformIcon = video
    ? VideoMetadataExtractor.getPlatformIcon(video.platform)
    : '🎬';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Video no encontrado</Text>
      </View>
    );
  }

  const frequencyLabels = {
    once: 'Una sola vez',
    daily: 'Diariamente',
    weekly: 'Semanalmente',
    custom: 'Cada X días',
  };

  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <ScrollView style={styles.container}>
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {video.thumbnail ? (
          <Image
            source={{ uri: video.thumbnail }}
            style={styles.thumbnail}
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <Text style={styles.placeholderIcon}>🎬</Text>
          </View>
        )}

        {/* Platform Badge */}
        <View style={[styles.platformBadge, { backgroundColor: platformColor }]}>
          <Text style={styles.platformIcon}>{platformIcon}</Text>
          <Text style={styles.platformName}>
            {video.platform.charAt(0).toUpperCase() + video.platform.slice(1)}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{video.title}</Text>

        {/* Date */}
        <Text style={styles.date}>{formatDate(video.savedDate)}</Text>

        {/* Description */}
        {video.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{video.description}</Text>
          </View>
        ) : null}

        {/* Open Button */}
        <Pressable
          style={({ pressed }) => [
            styles.openButton,
            pressed && styles.openButtonPressed,
          ]}
          onPress={openVideo}
        >
          <Text style={styles.openButtonIcon}>🔗</Text>
          <Text style={styles.openButtonText}>Ver en {video.platform}</Text>
        </Pressable>

        {/* Reminders Section */}
        <View style={styles.section}>
          <View style={styles.reminderHeaderContainer}>
            <Text style={styles.sectionTitle}>Recordatorios</Text>
            <Pressable
              style={({ pressed }) => [
                styles.addReminderButton,
                pressed && styles.addReminderButtonPressed,
              ]}
              onPress={() => setReminderModalVisible(true)}
            >
              <Text style={styles.addReminderButtonText}>+ Agregar</Text>
            </Pressable>
          </View>

          {reminders.length === 0 ? (
            <Text style={styles.noRemindersText}>
              Sin recordatorios configurados
            </Text>
          ) : (
            <FlatList
              data={reminders}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.reminderCard}>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderTime}>
                      ⏰ {item.time}
                    </Text>
                    <Text style={styles.reminderFrequency}>
                      {frequencyLabels[item.frequency]}
                      {item.frequency === 'weekly' && item.dayOfWeek !== null
                        ? ` - ${dayLabels[item.dayOfWeek]}`
                        : ''}
                      {item.frequency === 'custom' && item.intervalDays
                        ? ` - Cada ${item.intervalDays} días`
                        : ''}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleDeleteReminder(item.id)}
                    style={({ pressed }) => [
                      styles.deleteReminderButton,
                      pressed && styles.deleteReminderButtonPressed,
                    ]}
                  >
                    <Text style={styles.deleteReminderButtonText}>✕</Text>
                  </Pressable>
                </View>
              )}
            />
          )}
        </View>

        {/* Share Button */}
        <Pressable
          style={({ pressed }) => [
            styles.shareButton,
            pressed && styles.shareButtonPressed,
          ]}
        >
          <Text style={styles.shareButtonText}>📤 Compartir</Text>
        </Pressable>

        {/* Spacing */}
        <View style={{ height: 24 }} />
      </View>

      {/* Reminder Modal */}
      <ReminderModal
        visible={reminderModalVisible}
        videoTitle={video.title}
        onClose={() => setReminderModalVisible(false)}
        onSave={handleSaveReminder}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
    backgroundColor: '#f0f0f0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  placeholderIcon: {
    fontSize: 60,
  },
  platformBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  platformIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  platformName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  openButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  openButtonPressed: {
    opacity: 0.9,
  },
  openButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  openButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  reminderHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addReminderButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addReminderButtonPressed: {
    backgroundColor: '#e0e0e0',
  },
  addReminderButtonText: {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 12,
  },
  noRemindersText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  reminderCard: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  reminderFrequency: {
    fontSize: 12,
    color: '#666',
  },
  deleteReminderButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteReminderButtonPressed: {
    backgroundColor: '#e0e0e0',
  },
  deleteReminderButtonText: {
    color: '#999',
    fontSize: 16,
  },
  shareButton: {
    borderWidth: 2,
    borderColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonPressed: {
    backgroundColor: '#f0f0f0',
  },
  shareButtonText: {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 14,
  },
});
