/**
 * Сервис для работы с таблицей лидеров
 */
class LeaderboardService {
  constructor() {
    // URL API для таблицы лидеров
    this.apiUrl = 'http://localhost:3000/api/scores';
  }

  /**
   * Инициализация сервиса (для совместимости с dreamlo)
   * @param {string} publicKey - не используется
   * @param {string} privateKey - не используется
   * @param {boolean} useHttps - не используется
   */
  initialize(publicKey, privateKey, useHttps) {
    // Этот метод оставлен для совместимости с dreamlo API
    console.log('LeaderboardService инициализирован');
    return this;
  }

  /**
   * Получает все записи из таблицы лидеров
   * @returns {Promise<Array>} Promise с массивом записей
   */
  getScores() {
    return fetch(this.apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка при получении данных');
        }
        return response.json();
      })
      .catch(error => {
        console.error('Ошибка получения таблицы лидеров:', error);
        throw error;
      });
  }

  /**
   * Добавляет новую запись в таблицу лидеров
   * @param {Object} scoreData - данные о результате
   * @param {string} format - формат данных (для совместимости с dreamlo)
   * @param {string} sortOrder - порядок сортировки (для совместимости с dreamlo)
   * @param {boolean} overwrite - перезаписать ли существующую запись (для совместимости с dreamlo)
   * @returns {Promise<Array>} Promise с обновленным массивом записей
   */
  addScore(scoreData, format, sortOrder, overwrite) {
    return fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: scoreData.name,
        score: scoreData.points,
        seconds: scoreData.seconds,
        text: scoreData.text
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка при сохранении данных');
        }
        return response.json();
      })
      .catch(error => {
        console.error('Ошибка добавления записи:', error);
        throw error;
      });
  }
}

// Константы для совместимости с dreamlo
LeaderboardService.ScoreFormat = {
  Object: 'object'
};

LeaderboardService.SortOrder = {
  PointsDescending: 'points_desc'
};

// Создаем глобальный экземпляр сервиса вместо dreamlo
window.leaderboardService = new LeaderboardService(); 