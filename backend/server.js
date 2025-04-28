const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка middleware
app.use(cors());
app.use(bodyParser.json());

// Путь к файлу с данными
const dataFilePath = path.join(__dirname, 'leaderboard.json');

// Убедимся, что файл существует
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify([]));
}

// Функция для чтения данных из файла
function readLeaderboard() {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка чтения файла:', error);
    return [];
  }
}

// Функция для записи данных в файл
function writeLeaderboard(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Ошибка записи в файл:', error);
    return false;
  }
}

// Получение всех записей таблицы лидеров
app.get('/api/scores', (req, res) => {
  try {
    const leaderboard = readLeaderboard();
    // Сортировка по очкам (по убыванию)
    leaderboard.sort((a, b) => b.score - a.score);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
});

// Добавление новой записи в таблицу лидеров
app.post('/api/scores', (req, res) => {
  try {
    const { name, score, seconds, text } = req.body;
    
    if (!name || score === undefined) {
      return res.status(400).json({ error: 'Необходимо указать имя и счёт' });
    }
    
    const leaderboard = readLeaderboard();
    
    // Создание новой записи
    const newEntry = {
      name,
      score: parseInt(score, 10),
      seconds: seconds ? parseInt(seconds, 10) : 0,
      text: text || name,
      date: new Date().toISOString().split('T')[0] // Формат: YYYY-MM-DD
    };
    
    // Добавление записи
    leaderboard.push(newEntry);
    
    // Сортировка по очкам (по убыванию)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Запись в файл
    if (writeLeaderboard(leaderboard)) {
      res.status(201).json(leaderboard);
    } else {
      res.status(500).json({ error: 'Ошибка сохранения данных' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка добавления записи' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 