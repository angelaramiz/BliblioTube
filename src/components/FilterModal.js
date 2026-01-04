import React, { useState } from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', icon: 'logo-youtube' },
  { id: 'instagram', label: 'Instagram', icon: 'logo-instagram' },
  { id: 'reels', label: 'Instagram Reels', icon: 'logo-instagram' },
  { id: 'tiktok', label: 'TikTok', icon: 'logo-tiktok' },
  { id: 'facebook', label: 'Facebook', icon: 'logo-facebook' },
];

const IMPORTANCE_LEVELS = [
  { value: 1, label: 'Muy Baja', color: '#ef4444' },
  { value: 2, label: 'Baja', color: '#f97316' },
  { value: 3, label: 'Media', color: '#eab308' },
  { value: 4, label: 'Alta', color: '#22c55e' },
  { value: 5, label: 'Muy Alta', color: '#06b6d4' },
];

export function FilterModal({ visible, onClose, onApplyFilters, currentFilters = {} }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState(currentFilters.platforms || []);
  const [sortBy, setSortBy] = useState(currentFilters.sortBy || 'newest');
  const [importanceRange, setImportanceRange] = useState({
    min: currentFilters.minImportance || 1,
    max: currentFilters.maxImportance || 5,
  });

  const togglePlatform = (platformId) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  };

  const handleApplyFilters = () => {
    const filters = {
      platforms: selectedPlatforms,
      sortBy,
      minImportance: importanceRange.min,
      maxImportance: importanceRange.max,
    };
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    setSelectedPlatforms([]);
    setSortBy('newest');
    setImportanceRange({ min: 1, max: 5 });
    onApplyFilters({
      platforms: [],
      sortBy: 'newest',
      minImportance: 1,
      maxImportance: 5,
    });
    onClose();
  };

  const handleImportanceChange = (level, isMin) => {
    if (isMin) {
      if (level <= importanceRange.max) {
        setImportanceRange({ ...importanceRange, min: level });
      }
    } else {
      if (level >= importanceRange.min) {
        setImportanceRange({ ...importanceRange, max: level });
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filtrar Vídeos</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#1f2937" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Filtro de Plataforma */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Por Plataforma</Text>
              <View style={styles.platformContainer}>
                {PLATFORMS.map((platform) => (
                  <TouchableOpacity
                    key={platform.id}
                    style={[
                      styles.platformButton,
                      selectedPlatforms.includes(platform.id) && styles.platformButtonActive,
                    ]}
                    onPress={() => togglePlatform(platform.id)}
                  >
                    <Ionicons
                      name={platform.icon}
                      size={20}
                      color={
                        selectedPlatforms.includes(platform.id) ? '#fff' : '#6b7280'
                      }
                      style={styles.platformIcon}
                    />
                    <Text
                      style={[
                        styles.platformLabel,
                        selectedPlatforms.includes(platform.id) &&
                          styles.platformLabelActive,
                      ]}
                    >
                      {platform.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Filtro de Ordenamiento */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ordenar por Fecha</Text>
              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={[
                    styles.sortButton,
                    sortBy === 'newest' && styles.sortButtonActive,
                  ]}
                  onPress={() => setSortBy('newest')}
                >
                  <Ionicons
                    name="arrow-down"
                    size={18}
                    color={sortBy === 'newest' ? '#fff' : '#6b7280'}
                  />
                  <Text
                    style={[
                      styles.sortLabel,
                      sortBy === 'newest' && styles.sortLabelActive,
                    ]}
                  >
                    Más Reciente
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sortButton,
                    sortBy === 'oldest' && styles.sortButtonActive,
                  ]}
                  onPress={() => setSortBy('oldest')}
                >
                  <Ionicons
                    name="arrow-up"
                    size={18}
                    color={sortBy === 'oldest' ? '#fff' : '#6b7280'}
                  />
                  <Text
                    style={[
                      styles.sortLabel,
                      sortBy === 'oldest' && styles.sortLabelActive,
                    ]}
                  >
                    Más Antiguo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filtro de Importancia */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rango de Importancia</Text>
              <View style={styles.importanceContainer}>
                <View style={styles.importanceRange}>
                  <Text style={styles.rangeLabel}>Mínimo:</Text>
                  <View style={styles.starsContainer}>
                    {IMPORTANCE_LEVELS.map((level) => (
                      <TouchableOpacity
                        key={`min-${level.value}`}
                        style={[
                          styles.star,
                          importanceRange.min <= level.value &&
                            styles.starActive,
                        ]}
                        onPress={() => handleImportanceChange(level.value, true)}
                      >
                        <Ionicons
                          name={
                            importanceRange.min <= level.value
                              ? 'star'
                              : 'star-outline'
                          }
                          size={24}
                          color={
                            importanceRange.min <= level.value
                              ? level.color
                              : '#d1d5db'
                          }
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.importanceRange}>
                  <Text style={styles.rangeLabel}>Máximo:</Text>
                  <View style={styles.starsContainer}>
                    {IMPORTANCE_LEVELS.map((level) => (
                      <TouchableOpacity
                        key={`max-${level.value}`}
                        style={[
                          styles.star,
                          importanceRange.max >= level.value &&
                            styles.starActive,
                        ]}
                        onPress={() => handleImportanceChange(level.value, false)}
                      >
                        <Ionicons
                          name={
                            importanceRange.max >= level.value
                              ? 'star'
                              : 'star-outline'
                          }
                          size={24}
                          color={
                            importanceRange.max >= level.value
                              ? level.color
                              : '#d1d5db'
                          }
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.spacer} />
          </ScrollView>

          {/* Botones de Acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearButtonText}>Limpiar Filtros</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  platformContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  platformButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginBottom: 8,
  },
  platformButtonActive: {
    backgroundColor: '#6366f1',
  },
  platformIcon: {
    marginRight: 8,
  },
  platformLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  platformLabelActive: {
    color: '#fff',
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 6,
  },
  sortButtonActive: {
    backgroundColor: '#6366f1',
  },
  sortLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
  },
  sortLabelActive: {
    color: '#fff',
    fontWeight: '500',
  },
  importanceContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  importanceRange: {
    marginBottom: 16,
  },
  rangeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  star: {
    padding: 4,
  },
  starActive: {
    opacity: 1,
  },
  spacer: {
    height: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
