import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
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

  // ===== SINCRONIZACIÓN CON SUPABASE =====
  static async syncLocalToSupabase(userId) {
    try {
      console.log('Iniciando sincronización local a Supabase...');

      // Obtener todas las carpetas locales del usuario
      const localFolders = await this.getFoldersByUser(userId);
      
      for (const folder of localFolders) {
        // Verificar si la carpeta ya existe en Supabase
        const { data: existingFolder } = await supabase
          .from('folders')
          .select('id')
          .eq('id', folder.id)
          .single();

        if (!existingFolder) {
          // Subir carpeta a Supabase
          const { error } = await supabase
            .from('folders')
            .insert({
              id: folder.id,
              user_id: folder.userId,
              name: folder.name,
              color: folder.color,
              created_at: new Date(folder.createdDate).toISOString(),
            });

          if (error) {
            console.error('Error subiendo carpeta a Supabase:', error);
          } else {
            console.log('Carpeta subida:', folder.name);
          }
        }

        // Sincronizar videos de esta carpeta
        const localVideos = await this.getVideosByFolder(folder.id);
        
        for (const video of localVideos) {
          // Verificar si el video ya existe en Supabase
          const { data: existingVideo } = await supabase
            .from('videos')
            .select('id')
            .eq('id', video.id)
            .single();

          if (!existingVideo) {
            // Subir video a Supabase
            const { error } = await supabase
              .from('videos')
              .insert({
                id: video.id,
                folder_id: video.folderId,
                title: video.title,
                url: video.url,
                platform: video.platform,
                thumbnail: video.thumbnail,
                description: video.description,
                saved_at: new Date(video.savedDate).toISOString(),
              });

            if (error) {
              console.error('Error subiendo video a Supabase:', error);
            } else {
              console.log('Video subido:', video.title);
            }

            // Sincronizar recordatorios del video
            const localReminders = await this.getRemindersByVideo(video.id);
            
            for (const reminder of localReminders) {
              // Verificar si el recordatorio ya existe en Supabase
              const { data: existingReminder } = await supabase
                .from('reminders')
                .select('id')
                .eq('id', reminder.id)
                .single();

              if (!existingReminder) {
                // Subir recordatorio a Supabase
                const { error } = await supabase
                  .from('reminders')
                  .insert({
                    id: reminder.id,
                    video_id: reminder.videoId,
                    time: reminder.time,
                    frequency: reminder.frequency,
                    day_of_week: reminder.dayOfWeek,
                    interval_days: reminder.intervalDays,
                    is_active: reminder.isActive,
                  });

                if (error) {
                  console.error('Error subiendo recordatorio a Supabase:', error);
                } else {
                  console.log('Recordatorio subido para video:', video.title);
                }
              }
            }
          }
        }
      }

      console.log('Sincronización completada');
    } catch (error) {
      console.error('Error en sincronización:', error);
    }
  }

  static async syncSupabaseToLocal(userId) {
    try {
      console.log('Iniciando sincronización Supabase a local...');

      // Obtener carpetas de Supabase
      const { data: supabaseFolders, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId);

      if (foldersError) {
        console.error('Error obteniendo carpetas de Supabase:', foldersError);
        return;
      }

      for (const folderData of supabaseFolders) {
        // Verificar si la carpeta existe localmente
        const localFolders = await this.getFoldersByUser(userId);
        const existingLocal = localFolders.find(f => f.id === folderData.id);

        if (!existingLocal) {
          // Insertar carpeta localmente
          await db.runAsync(
            'INSERT OR IGNORE INTO folders (id, userId, name, color, createdDate) VALUES (?, ?, ?, ?, ?)',
            [folderData.id, folderData.user_id, folderData.name, folderData.color, new Date(folderData.created_at).getTime()]
          );
          console.log('Carpeta descargada:', folderData.name);
        }

        // Obtener videos de Supabase para esta carpeta
        const { data: supabaseVideos, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .eq('folder_id', folderData.id);

        if (videosError) {
          console.error('Error obteniendo videos de Supabase:', videosError);
          continue;
        }

        for (const videoData of supabaseVideos) {
          // Verificar si el video existe localmente
          const localVideos = await this.getVideosByFolder(folderData.id);
          const existingVideo = localVideos.find(v => v.id === videoData.id);

          if (!existingVideo) {
            // Insertar video localmente
            await db.runAsync(
              'INSERT OR IGNORE INTO videos (id, folderId, title, url, platform, thumbnail, description, savedDate, reminders) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [videoData.id, videoData.folder_id, videoData.title, videoData.url, videoData.platform, videoData.thumbnail, videoData.description, new Date(videoData.saved_at).getTime(), '[]']
            );
            console.log('Video descargado:', videoData.title);

            // Obtener recordatorios de Supabase para este video
            const { data: supabaseReminders, error: remindersError } = await supabase
              .from('reminders')
              .select('*')
              .eq('video_id', videoData.id);

            if (remindersError) {
              console.error('Error obteniendo recordatorios de Supabase:', remindersError);
              continue;
            }

            for (const reminderData of supabaseReminders) {
              // Insertar recordatorio localmente
              await db.runAsync(
                'INSERT OR IGNORE INTO reminders (id, videoId, time, frequency, dayOfWeek, intervalDays, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [reminderData.id, reminderData.video_id, reminderData.time, reminderData.frequency, reminderData.day_of_week, reminderData.interval_days, reminderData.is_active ? 1 : 0]
              );
            }
          }
        }
      }

      console.log('Sincronización de Supabase a local completada');
    } catch (error) {
      console.error('Error en sincronización Supabase a local:', error);
    }
  }
}
