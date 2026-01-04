import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';

export const ReminderModal = ({ visible, videoTitle, onClose, onSave, autoDismissDelay = 1500 }) => {
  const [time, setTime] = useState('10:00');
  const [frequency, setFrequency] = useState('once');
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [intervalDays, setIntervalDays] = useState('1');
  const [successMessage, setSuccessMessage] = useState('');

  const frequencies = [
    { id: 'once', label: 'Una sola vez', icon: '⏰' },
    { id: 'daily', label: 'Diariamente', icon: '📅' },
    { id: 'weekly', label: 'Semanalmente', icon: '📆' },
    { id: 'custom', label: 'Cada X días', icon: '⚙️' },
  ];

  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Auto-dismiss después de guardar
  useEffect(() => {
    if (successMessage && autoDismissDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [successMessage, autoDismissDelay, onClose]);

  const handleSave = () => {
    setSuccessMessage('✓ Recordatorio guardado');
    onSave({
      time,
      frequency,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : null,
      intervalDays: frequency === 'custom' ? parseInt(intervalDays) : null,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
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
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Configurar Recordatorio</Text>
                <Pressable onPress={onClose}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </View>

              {/* Video Title */}
              <Text style={styles.videoTitle} numberOfLines={2}>
                {videoTitle}
              </Text>

          {/* Time Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hora</Text>
            <TextInput
              style={styles.timeInput}
              value={time}
              onChangeText={setTime}
              placeholder="HH:mm"
              maxLength={5}
            />
          </View>

          {/* Frequency Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frecuencia</Text>
            <FlatList
              data={frequencies}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.frequencyOption,
                    frequency === item.id && styles.frequencySelected,
                  ]}
                  onPress={() => setFrequency(item.id)}
                >
                  <Text style={styles.frequencyIcon}>{item.icon}</Text>
                  <Text style={styles.frequencyLabel}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>

          {/* Day of Week Selection (si frequency es weekly) */}
          {frequency === 'weekly' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Día de la Semana</Text>
              <View style={styles.daysContainer}>
                {days.map((day, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.dayButton,
                      dayOfWeek === index && styles.dayButtonSelected,
                    ]}
                    onPress={() => setDayOfWeek(index)}
                  >
                    <Text
                      style={[
                        styles.dayLabel,
                        dayOfWeek === index && styles.dayLabelSelected,
                      ]}
                    >
                      {day.substring(0, 3)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Interval Days Input (si frequency es custom) */}
          {frequency === 'custom' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cada cuántos días</Text>
              <TextInput
                style={styles.timeInput}
                value={intervalDays}
                onChangeText={setIntervalDays}
                placeholder="1"
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Guardar Recordatorio</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  videoTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
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
  timeInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1a1a1a',
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  frequencySelected: {
    backgroundColor: '#f0f0f0',
    borderColor: '#6366f1',
  },
  frequencyIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  frequencyLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  dayButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  dayLabelSelected: {
    color: '#fff',
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
  saveButton: {
    backgroundColor: '#6366f1',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
