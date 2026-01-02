import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { Video } from '../models/Video';
import { Folder } from '../models/Folder';
import { Reminder } from '../models/Reminder';

const db = SQLite.openDatabaseSync('bibliotube.db');

export class DatabaseService {
  static async initializeDatabase() {
    try {
      // Crear tabla de carpetas
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS folders (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          name TEXT NOT NULL,
          color TEXT DEFAULT '#6366f1',
          createdDate INTEGER NOT NULL
        );
      `);

      // Crear tabla de videos
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS videos (
          id TEXT PRIMARY KEY,
          folderId TEXT NOT NULL,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          platform TEXT NOT NULL,
          thumbnail TEXT,
          description TEXT,
          savedDate INTEGER NOT NULL,
          reminders TEXT DEFAULT '[]',
          FOREIGN KEY (folderId) REFERENCES folders(id)
        );
      `);

      // Crear tabla de recordatorios
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS reminders (
          id TEXT PRIMARY KEY,
          videoId TEXT NOT NULL,
          time TEXT NOT NULL,
          frequency TEXT DEFAULT 'once',
          dayOfWeek INTEGER,
          intervalDays INTEGER,
          isActive INTEGER DEFAULT 1,
          FOREIGN KEY (videoId) REFERENCES videos(id)
        );
      `);

      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
    }
  }

  // ===== OPERACIONES DE CARPETAS =====
  static async createFolder(userId, name, color = '#6366f1') {
    try {
      const id = uuidv4();
      const folder = new Folder(id, userId, name, color);
      
      await db.runAsync(
        'INSERT INTO folders (id, userId, name, color, createdDate) VALUES (?, ?, ?, ?, ?)',
        [folder.id, folder.userId, folder.name, folder.color, folder.createdDate]
      );
      
      return folder;
    } catch (error) {
      console.error('Error creando carpeta:', error);
      throw error;
    }
  }

  static async getFoldersByUser(userId) {
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM folders WHERE userId = ? ORDER BY createdDate DESC',
        [userId]
      );
      return result.map(row => Folder.fromJSON(row));
    } catch (error) {
      console.error('Error obteniendo carpetas:', error);
      return [];
    }
  }

  static async updateFolder(id, name, color) {
    try {
      await db.runAsync(
        'UPDATE folders SET name = ?, color = ? WHERE id = ?',
        [name, color, id]
      );
    } catch (error) {
      console.error('Error actualizando carpeta:', error);
    }
  }

  static async deleteFolder(id) {
    try {
      // Eliminar videos asociados
      await db.runAsync('DELETE FROM videos WHERE folderId = ?', [id]);
      // Eliminar carpeta
      await db.runAsync('DELETE FROM folders WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error eliminando carpeta:', error);
    }
  }

  // ===== OPERACIONES DE VIDEOS =====
  static async createVideo(folderId, title, url, platform, thumbnail = null, description = '') {
    try {
      const id = uuidv4();
      const video = new Video(
        id,
        folderId,
        title,
        url,
        platform,
        thumbnail,
        description,
        new Date().getTime()
      );

      await db.runAsync(
        'INSERT INTO videos (id, folderId, title, url, platform, thumbnail, description, savedDate, reminders) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          video.id,
          video.folderId,
          video.title,
          video.url,
          video.platform,
          video.thumbnail,
          video.description,
          video.savedDate,
          JSON.stringify([]),
        ]
      );

      return video;
    } catch (error) {
      console.error('Error creando video:', error);
      throw error;
    }
  }

  static async getVideosByFolder(folderId) {
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM videos WHERE folderId = ? ORDER BY savedDate DESC',
        [folderId]
      );
      return result.map(row => Video.fromJSON(row));
    } catch (error) {
      console.error('Error obteniendo videos:', error);
      return [];
    }
  }

  static async getVideoById(videoId) {
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM videos WHERE id = ?',
        [videoId]
      );
      return result ? Video.fromJSON(result) : null;
    } catch (error) {
      console.error('Error obteniendo video:', error);
      return null;
    }
  }

  static async updateVideo(id, title, description, thumbnail) {
    try {
      await db.runAsync(
        'UPDATE videos SET title = ?, description = ?, thumbnail = ? WHERE id = ?',
        [title, description, thumbnail, id]
      );
    } catch (error) {
      console.error('Error actualizando video:', error);
    }
  }

  static async deleteVideo(id) {
    try {
      // Eliminar recordatorios asociados
      await db.runAsync('DELETE FROM reminders WHERE videoId = ?', [id]);
      // Eliminar video
      await db.runAsync('DELETE FROM videos WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error eliminando video:', error);
    }
  }

  // ===== OPERACIONES DE RECORDATORIOS =====
  static async createReminder(videoId, time, frequency = 'once', dayOfWeek = null, intervalDays = null) {
    try {
      const id = uuidv4();
      const reminder = new Reminder(id, videoId, time, frequency, dayOfWeek, intervalDays);

      await db.runAsync(
        'INSERT INTO reminders (id, videoId, time, frequency, dayOfWeek, intervalDays, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [reminder.id, reminder.videoId, reminder.time, reminder.frequency, reminder.dayOfWeek, reminder.intervalDays, 1]
      );

      return reminder;
    } catch (error) {
      console.error('Error creando recordatorio:', error);
      throw error;
    }
  }

  static async getRemindersByVideo(videoId) {
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM reminders WHERE videoId = ?',
        [videoId]
      );
      return result.map(row => Reminder.fromJSON(row));
    } catch (error) {
      console.error('Error obteniendo recordatorios:', error);
      return [];
    }
  }

  static async deleteReminder(reminderId) {
    try {
      await db.runAsync('DELETE FROM reminders WHERE id = ?', [reminderId]);
    } catch (error) {
      console.error('Error eliminando recordatorio:', error);
    }
  }

  static async updateReminderStatus(reminderId, isActive) {
    try {
      await db.runAsync(
        'UPDATE reminders SET isActive = ? WHERE id = ?',
        [isActive ? 1 : 0, reminderId]
      );
    } catch (error) {
      console.error('Error actualizando recordatorio:', error);
    }
  }
}
