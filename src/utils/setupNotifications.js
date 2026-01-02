import * as Notifications from 'expo-notifications';

// Solicitar permisos de notificación
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error solicitando permisos de notificación:', error);
    return false;
  }
};

// Manejar notificaciones recibidas
export const setupNotificationListeners = () => {
  // Notificación recibida cuando la app está en primer plano
  const foregroundSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notificación recibida (foreground):', notification);
    }
  );

  // Respuesta del usuario a la notificación
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('Respuesta de notificación:', response);
      // Aquí puedes navegar a la pantalla del video
    }
  );

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
};

// Cancelar todas las notificaciones
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error cancelando notificaciones:', error);
  }
};
