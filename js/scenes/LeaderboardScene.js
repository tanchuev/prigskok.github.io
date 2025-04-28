class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super('LeaderboardScene');
        this.scores = [];
        
        // Инициализация dreamlo
        this.dreamloPublicKey = "680ed22b8f40bb18ac70df27";
        this.dreamloPrivateKey ="WJRxP_ErZ0uLBvmSL6uXBgdwIykOMp6kmqlN69KlSiuA";
        this.useHttps = false;
        
        // Для хранения UI элементов лидерборда
        this.leaderboardElements = [];
    }

    init(data) {
        // Загрузка данных происходит в create(), здесь ничего не делаем
        // Очищаем прошлые данные для перезагрузки
        this.scores = [];
        this.clearLeaderboard();
    }

    create() {
        // Получаем размеры экрана
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Определяем, является ли устройство мобильным
        this.isMobile = !this.sys.game.device.os.desktop;
        
        // Определяем масштаб для мобильных устройств
        const titleFontSize = this.isMobile ? '36px' : '48px';
        const btnFontSize = this.isMobile ? '20px' : '24px';
        
        // Фон
        const bg = this.add.image(width / 2, height / 2, 'background');
        const scaleX = width / bg.width;
        bg.setScale(scaleX, scaleX); // Сохраняем пропорции при масштабировании
        // Центрируем по вертикали если изображение слишком большое
        if (bg.height * scaleX > height) {
            bg.y = height / 2;
        }
        
        // Заголовок
        this.titleText = this.add.text(width / 2, this.isMobile ? height * 0.12 : height * 0.15, 'ЛИДЕРБОРД', {
            fontFamily: 'unutterable',
            fontSize: titleFontSize,
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Индикатор загрузки
        this.loadingText = this.add.text(width / 2, height * 0.4, 'Загрузка лидерборда...', {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '20px' : '24px',
            fill: '#888888',
            align: 'center'
        }).setOrigin(0.5);
        
        // Загружаем данные лидерборда
        this.loadLeaderboard();
        
        // Кнопка "Назад"
        this.backButton = this.add.text(width / 2, height * 0.85, 'НАЗАД', {
            fontFamily: 'unutterable',
            fontSize: btnFontSize,
            fill: '#ffffff',
            backgroundColor: '#666666',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: this.isMobile ? 15 : 20,
                y: this.isMobile ? 8 : 10
            }
        }).setOrigin(0.5).setInteractive();
        
        // Эффекты при наведении
        this.backButton.on('pointerover', () => {
            this.backButton.setStyle({ fill: '#ffff00', backgroundColor: '#888888' });
        });
        
        this.backButton.on('pointerout', () => {
            this.backButton.setStyle({ fill: '#ffffff', backgroundColor: '#666666' });
        });
        
        // Действие при нажатии
        this.backButton.on('pointerdown', () => {
            this.backButton.setStyle({ fill: '#ff8800' });
            this.scene.start('StartScene');
        });
        
        // Обработка изменения размера экрана
        this.scale.on('resize', this.resizeScene, this);
    }
    
    resizeScene() {
        if (!this.titleText || !this.backButton) return;
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Обновляем фон
        const bg = this.children.list.find(child => child.type === 'Image' && child.texture.key === 'background');
        if (bg) {
            bg.x = width / 2;
            bg.y = height / 2;
            const scaleX = width / bg.width;
            bg.setScale(scaleX, scaleX);
            if (bg.height * scaleX > height) {
                bg.y = height / 2;
            }
        }
        
        // Обновляем заголовок
        this.titleText.setPosition(width / 2, height * 0.15);
        
        // Обновляем текст загрузки
        if (this.loadingText) {
            this.loadingText.setPosition(width / 2, height * 0.4);
        }
        
        // Обновляем кнопку назад
        this.backButton.setPosition(width / 2, height * 0.85);
        
        // Обновляем позиции элементов лидерборда
        this.repositionLeaderboardElements();
    }
    
    repositionLeaderboardElements() {
        if (!this.leaderboardElements || this.leaderboardElements.length === 0) return;
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Если есть только сообщение "Пока нет результатов"
        if (this.leaderboardElements.length === 1 && 
            this.leaderboardElements[0].text === 'Пока нет результатов') {
            this.leaderboardElements[0].setPosition(width / 2, height * 0.4);
            return;
        }
        
        // Если отображается таблица лидеров
        // Заголовки таблицы (первые 5 элементов)
        if (this.leaderboardElements.length >= 5) {
            // Заголовки: МЕСТО, ИГРОК, ВЫСОТА, ВРЕМЯ, ДАТА
            const columnWidths = [0.15, 0.30, 0.50, 0.65, 0.82]; // Пропорции от ширины экрана
            
            for (let i = 0; i < 5; i++) {
                this.leaderboardElements[i].setPosition(width * columnWidths[i], height * 0.25);
            }
            
            // Данные таблицы
            if (this.leaderboardElements.length > 5) {
                const rows = Math.floor((this.leaderboardElements.length - 5) / 5); // Количество строк
                
                for (let row = 0; row < rows; row++) {
                    const y = height * 0.25 + (row + 1) * (height * 0.05);
                    
                    for (let col = 0; col < 5; col++) {
                        const index = 5 + row * 5 + col;
                        if (index < this.leaderboardElements.length) {
                            this.leaderboardElements[index].setPosition(width * columnWidths[col], y);
                        }
                    }
                }
            }
        }
    }
    
    // Очищаем все UI элементы лидерборда
    clearLeaderboard() {
        // Уничтожаем все элементы лидерборда
        if (this.leaderboardElements && this.leaderboardElements.length > 0) {
            for (let element of this.leaderboardElements) {
                if (element) element.destroy();
            }
        }
        
        // Очищаем массив
        this.leaderboardElements = [];
    }
    
    loadLeaderboard() {
        // Очищаем старые элементы лидерборда перед загрузкой новых
        this.clearLeaderboard();
        
        // Проверяем, загружена ли библиотека dreamlo.js
        if (typeof dreamlo === 'undefined') {
            this.loadingText.setText('Ошибка загрузки библиотеки dreamlo.js');
            console.error('Библиотека dreamlo не загружена');
            return;
        }
        
        try {
            // Инициализируем dreamlo
            dreamlo.initialize(this.dreamloPublicKey, this.dreamloPrivateKey, this.useHttps);
            
            console.log('Загрузка лидерборда с dreamlo...');
            // Загружаем данные из dreamlo
            dreamlo.getScores()
                .then(scores => {
                    console.log('Получены данные от dreamlo:', scores);
                    if (scores && scores.length > 0) {
                        this.scores = scores.map(entry => {
                            console.log('Запись из dreamlo:', entry);
                            
                            // Проверяем и обрабатываем значение seconds
                            let timeValue = 0;
                            if (entry.seconds && entry.seconds !== "") {
                                try {
                                    timeValue = parseInt(entry.seconds, 10);
                                    console.log('Преобразованное время:', timeValue);
                                } catch (e) {
                                    console.error('Ошибка преобразования времени:', e);
                                }
                            }
                            
                            return {
                                name: entry.name,
                                score: parseInt(entry.score, 10),
                                time: timeValue,
                                date: entry.date.split(' ')[0] // Получаем только дату без времени
                            };
                        });
                        this.displayLeaderboard();
                        this.loadingText.setVisible(false);
                    } else {
                        // Если на сервере нет данных
                        console.log('Нет данных на сервере');
                        this.loadingText.setText('Пока нет результатов в лидерборде');
                    }
                })
                .catch(error => {
                    console.error('Ошибка загрузки лидерборда:', error);
                    console.error('Полное сообщение об ошибке:', error.message);
                    
                    this.loadingText.setText('Ошибка загрузки лидерборда. Попробуйте позже.');
                });
        } catch (e) {
            console.error('Ошибка при инициализации dreamlo:', e);
            this.loadingText.setText('Ошибка инициализации dreamlo.');
        }
    }
    
    displayLeaderboard() {
        // Очищаем предыдущие элементы перед отображением
        this.clearLeaderboard();
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Определяем размеры шрифта в зависимости от устройства
        const headerFontSize = this.isMobile ? '16px' : '20px';
        const dataFontSize = this.isMobile ? '14px' : '18px';
        
        // Проверяем, есть ли данные для отображения
        if (!this.scores || this.scores.length === 0) {
            const noScoresText = this.add.text(width / 2, height * 0.4, 'Пока нет результатов', {
                fontFamily: 'unutterable',
                fontSize: this.isMobile ? '20px' : '24px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            this.leaderboardElements.push(noScoresText);
            return;
        }
        
        // Сортируем очки по убыванию
        this.scores.sort((a, b) => b.score - a.score);
        
        // Адаптируем пропорции колонок в зависимости от типа устройства
        const columnWidths = this.isMobile ? 
            [0.1, 0.35, 0.55, 0.70, 0.85] : // Мобильные (компактнее)
            [0.15, 0.30, 0.50, 0.65, 0.82]; // Десктоп
        
        // Заголовки таблицы
        const headers = ['МЕСТО', 'ИГРОК', 'ВЫСОТА', 'ВРЕМЯ', 'ДАТА'];
        for (let i = 0; i < headers.length; i++) {
            const headerText = this.add.text(width * columnWidths[i], height * 0.25, headers[i], {
                fontFamily: 'unutterable',
                fontSize: headerFontSize,
                fill: '#ffff88',
                align: i === 0 ? 'center' : 'left',
                stroke: '#000000',
                strokeThickness: 3
            });
            
            // Устанавливаем origin для каждого заголовка
            if (i === 0) {
                headerText.setOrigin(0.5, 0.5); // Центрируем колонку "МЕСТО"
            } else {
                headerText.setOrigin(0, 0.5); // Выравниваем остальные заголовки по левому краю
            }
            
            this.leaderboardElements.push(headerText);
        }
        
        // Ограничиваем количество отображаемых строк для мобильных устройств
        const maxRows = this.isMobile ? 8 : 10;
        const displayScores = this.scores.slice(0, maxRows);
        
        // Создаем таблицу очков
        for (let i = 0; i < displayScores.length; i++) {
            const score = displayScores[i];
            const y = height * 0.25 + (i + 1) * (this.isMobile ? height * 0.045 : height * 0.05);
            
            // Место (ранг)
            const rankText = this.add.text(width * columnWidths[0], y, (i + 1).toString(), {
                fontFamily: 'unutterable',
                fontSize: dataFontSize,
                fill: i < 3 ? '#ffff00' : '#ffffff', // Выделяем первые 3 места
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5, 0.5);
            
            // Имя игрока
            const nameText = this.add.text(width * columnWidths[1], y, score.name, {
                fontFamily: 'unutterable',
                fontSize: dataFontSize,
                fill: '#ffffff',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0, 0.5);
            
            // Счет
            const scoreText = this.add.text(width * columnWidths[2], y, score.score.toString(), {
                fontFamily: 'unutterable',
                fontSize: dataFontSize,
                fill: '#ffffff',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0, 0.5);
            
            // Время
            const timeText = this.add.text(width * columnWidths[3], y, this.formatTime(score.time), {
                fontFamily: 'unutterable',
                fontSize: dataFontSize,
                fill: '#88ffff',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0, 0.5);
            
            // Дата
            const dateText = this.add.text(width * columnWidths[4], y, score.date, {
                fontFamily: 'unutterable',
                fontSize: dataFontSize,
                fill: '#aaaaaa',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0, 0.5);
            
            // Добавляем элементы в массив для последующего управления
            this.leaderboardElements.push(rankText, nameText, scoreText, timeText, dateText);
        }
        
        // Скрываем индикатор загрузки
        if (this.loadingText) {
            this.loadingText.setVisible(false);
        }
    }
    
    formatTime(seconds) {
        // Проверяем тип и значение
        console.log('formatTime получил:', seconds, typeof seconds);
        
        // Преобразуем в число и проверяем на NaN
        let secs = Number(seconds);
        if (isNaN(secs) || secs === 0) {
            return '00:00';
        }
        
        // Убедимся, что это целое число
        secs = Math.floor(secs);
        
        const minutes = Math.floor(secs / 60);
        const remainingSecs = Math.floor(secs % 60);
        
        return `${minutes.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    }
    
    getCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    }
} 