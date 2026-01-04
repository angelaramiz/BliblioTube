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
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS folders (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          name TEXT NOT NULL,
          color TEXT DEFAULT '#6366f1',
          createdDate INTEGER NOT NULL
        );
      `);

      // Crear tabla de videos
      await db.runAsync(`
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
          importance INTEGER DEFAULT 3,
          FOREIGN KEY (folderId) REFERENCES folders(id)
        );
      `);

      // Migración: Agregar columna importance si no existe
      try {
        await db.runAsync(`ALTER TABLE videos ADD COLUMN importance INTEGER DEFAULT 3;`);
        console.log('✓ Columna importance agregada a tabla videos');
      } catch (error) {
        // La columna ya existe, esto es normal
        console.log('ℹ️ Columna importance ya existe');
      }

      // Crear tabla de recordatorios
      await db.runAsync(`
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
  static async createVideo(folderId, title, url, platform, thumbnail = null, description = '', importance = 3) {
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
        new Date().getTime(),
        [],
        importance
      );

      await db.runAsync(
        'INSERT INTO videos (id, folderId, title, url, platform, thumbnail, description, savedDate, reminders, importance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
          video.importance,
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

  static async getVideosByFolderWithFilters(folderId, filters = {}) {
    try {
      let query = 'SELECT * FROM videos WHERE folderId = ?';
      const params = [folderId];

      // Aplicar filtro de plataforma
      if (filters.platforms && filters.platforms.length > 0) {
        const placeholders = filters.platforms.map(() => '?').join(',');
        query += ` AND platform IN (${placeholders})`;
        params.push(...filters.platforms);
      }

      // Aplicar filtro de importancia
      if (filters.minImportance !== undefined || filters.maxImportance !== undefined) {
        if (filters.minImportance !== undefined) {
          query += ' AND importance >= ?';
          params.push(filters.minImportance);
        }
        if (filters.maxImportance !== undefined) {
          query += ' AND importance <= ?';
          params.push(filters.maxImportance);
        }
      }

      // Aplicar ordenamiento por fecha
      const sortBy = filters.sortBy || 'newest';
      query += sortBy === 'newest' ? ' ORDER BY savedDate DESC' : ' ORDER BY savedDate ASC';

      const result = await db.getAllAsync(query, params);
      return result.map(row => Video.fromJSON(row));
    } catch (error) {
      console.error('Error obteniendo videos con filtros:', error);
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

  static async updateVideo(id, title, description, thumbnail, importance = null) {
    try {
      if (importance !== null) {
        await db.runAsync(
          'UPDATE videos SET title = ?, description = ?, thumbnail = ?, importance = ? WHERE id = ?',
          [title, description, thumbnail, importance, id]
        );
      } else {
        await db.runAsync(
          'UPDATE videos SET title = ?, description = ?, thumbnail = ? WHERE id = ?',
          [title, description, thumbnail, id]
        );
      }
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
  
  // Sincronización unificada bidireccional
  static async syncBidirectional(userId) {
    try {
      console.log('🔄 Iniciando sincronización bidireccional...');
      const startTime = Date.now();

      // Paso 1: Sincronizar cambios locales a Supabase
      await this.syncLocalToSupabase(userId);
      
      // Paso 2: Sincronizar cambios de Supabase a local
      await this.syncSupabaseToLocal(userId);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Sincronización completada en ${duration}ms`);
    } catch (error) {
      console.error('❌ Error en sincronización bidireccional:', error);
      throw error;
    }
  }

  // Sincronización local → Supabase (con detección de cambios)
  static async syncLocalToSupabase(userId) {
    try {
      console.log('📤 Sincronizando cambios locales a Supabase...');

      const localFolders = await this.getFoldersByUser(userId);
      let foldersSync = 0;
      let videosSync = 0;
      let remindersSync = 0;
      
      for (const folder of localFolders) {
        try {
          // Obtener carpeta de Supabase
          const { data: supabaseFolder, error: folderError } = await supabase
            .from('folders')
            .select('*')
            .eq('id', folder.id)
            .single();

          if (folderError && folderError.code !== 'PGRST116') {
            throw folderError;
          }

          if (!supabaseFolder) {
            // Insertar carpeta nueva
            const { error: insertError } = await supabase
              .from('folders')
              .insert({
                id: folder.id,
                user_id: folder.userId,
                name: folder.name,
                color: folder.color,
                created_at: new Date(folder.createdDate).toISOString(),
              });

            if (insertError) {
              console.warn('⚠️ Error insertando carpeta (ignorado):', folder.name, insertError.message);
              // No lanzar error, continuar con la sincronización
            } else {
              foldersSync++;
              console.log('✓ Carpeta creada:', folder.name);
            }
          } else {
            // Actualizar carpeta existente si cambió
            if (supabaseFolder.name !== folder.name || supabaseFolder.color !== folder.color) {
              const { error: updateError } = await supabase
                .from('folders')
                .update({
                  name: folder.name,
                  color: folder.color,
                })
                .eq('id', folder.id);

              if (updateError) {
                console.error('❌ Error actualizando carpeta:', folder.name, updateError);
              } else {
                foldersSync++;
                console.log('✓ Carpeta actualizada:', folder.name);
              }
            }
          }

          // Sincronizar videos de esta carpeta
          const localVideos = await this.getVideosByFolder(folder.id);
          
          for (const video of localVideos) {
            try {
              const { data: supabaseVideo, error: videoError } = await supabase
                .from('videos')
                .select('*')
                .eq('id', video.id)
                .single();

              if (videoError && videoError.code !== 'PGRST116') {
                throw videoError;
              }

              if (!supabaseVideo) {
                // Insertar video nuevo
                const { error: insertError } = await supabase
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
                    importance: video.importance || 3,
                  });

                if (insertError) {
                  console.error('❌ Error insertando video:', video.title, insertError);
                } else {
                  videosSync++;
                  console.log('✓ Video creado:', video.title);
                }
              } else {
                // Actualizar video existente si cambió
                const hasChanges =
                  supabaseVideo.title !== video.title ||
                  supabaseVideo.description !== video.description ||
                  supabaseVideo.thumbnail !== video.thumbnail ||
                  supabaseVideo.importance !== (video.importance || 3);

                if (hasChanges) {
                  const { error: updateError } = await supabase
                    .from('videos')
                    .update({
                      title: video.title,
                      description: video.description,
                      thumbnail: video.thumbnail,
                      importance: video.importance || 3,
                    })
                    .eq('id', video.id);

                  if (updateError) {
                    console.error('❌ Error actualizando video:', video.title, updateError);
                  } else {
                    videosSync++;
                    console.log('✓ Video actualizado:', video.title);
                  }
                }
              }

              // Sincronizar recordatorios del video
              const localReminders = await this.getRemindersByVideo(video.id);
              
              for (const reminder of localReminders) {
                try {
                  const { data: supabaseReminder, error: reminderError } = await supabase
                    .from('reminders')
                    .select('*')
                    .eq('id', reminder.id)
                    .single();

                  if (reminderError && reminderError.code !== 'PGRST116') {
                    throw reminderError;
                  }

                  if (!supabaseReminder) {
                    // Insertar recordatorio nuevo
                    const { error: insertError } = await supabase
                      .from('reminders')
                      .insert({
                        id: reminder.id,
                        video_id: reminder.videoId,
                        time: reminder.time,
                        frequency: reminder.frequency,
                        day_of_week: reminder.dayOfWeek,
                        interval_days: reminder.intervalDays,
                        is_active: reminder.isActive ? 1 : 0,
                      });

                    if (insertError) {
                      console.error('❌ Error insertando recordatorio:', insertError);
                    } else {
                      remindersSync++;
                      console.log('✓ Recordatorio creado');
                    }
                  }
                } catch (reminderError) {
                  console.error('❌ Error sincronizando recordatorio:', reminderError);
                }
              }
            } catch (videoError) {
              console.error('❌ Error sincronizando video:', videoError);
            }
          }
        } catch (folderError) {
          console.error('❌ Error sincronizando carpeta:', folderError);
        }
      }

      console.log(`📤 Local → Supabase: ${foldersSync} carpetas, ${videosSync} videos, ${remindersSync} recordatorios`);
    } catch (error) {
      console.error('❌ Error en sincronización local → Supabase:', error);
      throw error;
    }
  }

  // Sincronización Supabase → local (con detección de cambios)
  static async syncSupabaseToLocal(userId) {
    try {
      console.log('📥 Sincronizando cambios de Supabase a local...');

      const { data: supabaseFolders, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId);

      if (foldersError) {
        throw foldersError;
      }

      let foldersSync = 0;
      let videosSync = 0;
      let remindersSync = 0;

      const localFolders = await this.getFoldersByUser(userId);

      for (const folderData of supabaseFolders || []) {
        try {
          const existingLocal = localFolders.find(f => f.id === folderData.id);

          if (!existingLocal) {
            // Insertar carpeta nueva localmente
            await db.runAsync(
              'INSERT OR IGNORE INTO folders (id, userId, name, color, createdDate) VALUES (?, ?, ?, ?, ?)',
              [
                folderData.id,
                folderData.user_id,
                folderData.name,
                folderData.color,
                new Date(folderData.created_at).getTime(),
              ]
            );
            foldersSync++;
            console.log('✓ Carpeta descargada:', folderData.name);
          }

          // Obtener videos de Supabase para esta carpeta
          const { data: supabaseVideos, error: videosError } = await supabase
            .from('videos')
            .select('*')
            .eq('folder_id', folderData.id);

          if (videosError) {
            throw videosError;
          }

          const localVideos = await this.getVideosByFolder(folderData.id);

          for (const videoData of supabaseVideos || []) {
            try {
              const existingVideo = localVideos.find(v => v.id === videoData.id);

              if (!existingVideo) {
                // Insertar video nuevo localmente
                await db.runAsync(
                  'INSERT OR IGNORE INTO videos (id, folderId, title, url, platform, thumbnail, description, savedDate, reminders, importance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                  [
                    videoData.id,
                    videoData.folder_id,
                    videoData.title,
                    videoData.url,
                    videoData.platform,
                    videoData.thumbnail,
                    videoData.description,
                    new Date(videoData.saved_at).getTime(),
                    '[]',
                    videoData.importance || 3,
                  ]
                );
                videosSync++;
                console.log('✓ Video descargado:', videoData.title);
              } else {
                // Actualizar si hay cambios
                const hasChanges =
                  existingVideo.title !== videoData.title ||
                  existingVideo.description !== videoData.description ||
                  existingVideo.thumbnail !== videoData.thumbnail ||
                  existingVideo.importance !== (videoData.importance || 3);

                if (hasChanges) {
                  await this.updateVideo(
                    videoData.id,
                    videoData.title,
                    videoData.description,
                    videoData.thumbnail,
                    videoData.importance || 3
                  );
                  videosSync++;
                  console.log('✓ Video actualizado:', videoData.title);
                }
              }

              // Obtener recordatorios de Supabase para este video
              const { data: supabaseReminders, error: remindersError } = await supabase
                .from('reminders')
                .select('*')
                .eq('video_id', videoData.id);

              if (remindersError) {
                throw remindersError;
              }

              for (const reminderData of supabaseReminders || []) {
                try {
                  // Insertar recordatorio localmente si no existe
                  await db.runAsync(
                    'INSERT OR IGNORE INTO reminders (id, videoId, time, frequency, dayOfWeek, intervalDays, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [
                      reminderData.id,
                      reminderData.video_id,
                      reminderData.time,
                      reminderData.frequency,
                      reminderData.day_of_week,
                      reminderData.interval_days,
                      reminderData.is_active ? 1 : 0,
                    ]
                  );
                  remindersSync++;
                } catch (reminderError) {
                  console.error('❌ Error sincronizando recordatorio:', reminderError);
                }
              }
            } catch (videoError) {
              console.error('❌ Error sincronizando video:', videoError);
            }
          }
        } catch (folderError) {
          console.error('❌ Error sincronizando carpeta:', folderError);
        }
      }

      console.log(`📥 Supabase → Local: ${foldersSync} carpetas, ${videosSync} videos, ${remindersSync} recordatorios`);
    } catch (error) {
      console.error('❌ Error en sincronización Supabase → Local:', error);
      throw error;
    }
  }
}
