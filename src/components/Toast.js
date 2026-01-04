import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export const Toast = ({ message, type = 'info', duration = 2000, visible = true, onHide }) => {
  const [opacity] = useState(new Animated.Value(0));
  const [show, setShow] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShow(true);
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShow(false);
        onHide?.();
      });
    }
  }, [visible, duration, opacity, onHide]);

  if (!show) return null;

  const backgroundColor = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b',
  }[type] || '#3b82f6';

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[type] || 'ℹ';

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={[styles.toast, { backgroundColor }]}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

export const useToast = () => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (message, type = 'info', duration = 2000) => {
    setToast({
      visible: true,
      message,
      type,
    });

    const timeout = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, duration);

    return () => clearTimeout(timeout);
  };

  const showSuccess = (message, duration = 2000) => showToast(message, 'success', duration);
  const showError = (message, duration = 2500) => showToast(message, 'error', duration);
  const showInfo = (message, duration = 2000) => showToast(message, 'info', duration);
  const showWarning = (message, duration = 2000) => showToast(message, 'warning', duration);

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hideToast: () => setToast(prev => ({ ...prev, visible: false })),
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 50,
    paddingHorizontal: 16,
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  icon: {
    fontSize: 18,
    color: '#fff',
    marginRight: 12,
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
