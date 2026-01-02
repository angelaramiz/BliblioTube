import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const FolderCard = ({ folder }) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: folder.color || '#6366f1' },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>📁</Text>
        <Text style={styles.name}>{folder.name}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
});

export default FolderCard;
