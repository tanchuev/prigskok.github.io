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
        // Получаем параметры, если они переданы
        const params = this.scene.settings.data || {};
        this.newScore = params.score;
        this.newHeight = params.height;
        this.newGameTime = params.gameTime;
        
        // Определяем, является ли устройство мобильным
        this.isMobile = !this.sys.game.device.os.desktop;
        
        // Получаем размеры экрана
        this.screenWidth = this.cameras.main.width;
        this.screenHeight = this.cameras.main.height;
        
        // Определяем наличие панели браузера и корректируем высоту
        this.browserBarHeight = window.innerHeight - this.game.canvas.offsetHeight;
        this.adjustedHeight = this.screenHeight - this.browserBarHeight;
        
        // Фоновое изображение
        this.add.image(this.screenWidth / 2, this.screenHeight / 2, 'background');
        
        // Затемнение для лучшей читаемости
        this.add.rectangle(this.screenWidth / 2, this.screenHeight / 2, 
            this.screenWidth, this.screenHeight, 0x000000, 0.7)
            .setOrigin(0.5);
        
        // Заголовок с учетом высоты панели браузера
        const titleY = Math.max(this.isMobile ? 70 : 90, this.browserBarHeight + 40);
        
        this.titleText = this.add.text(this.screenWidth / 2, titleY, 'ТАБЛИЦА РЕКОРДОВ', {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '36px' : '42px',
            color: '#ffcc00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);
        
        // Загружаем данные лидерборда
        let scores = [];
        const leaderboardData = localStorage.getItem('jumpGameLeaderboard');
        
        if (leaderboardData) {
            scores = JSON.parse(leaderboardData);
            
            // Сортируем по убыванию счета
            scores.sort((a, b) => b.score - a.score);
            
            // Ограничиваем до 20 лучших результатов
            scores = scores.slice(0, 20);
        }
        
        // Создаем таблицу результатов с учетом высоты панели браузера
        const tableHeaderY = titleY + (this.isMobile ? 60 : 70);
        const lineHeight = this.isMobile ? 30 : 35;
        
        // Заголовки колонок
        this.add.text(this.screenWidth * 0.15, tableHeaderY, 'МЕСТО', {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '22px' : '26px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);
        
        this.add.text(this.screenWidth * 0.4, tableHeaderY, 'ИГРОК', {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '22px' : '26px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);
        
        this.add.text(this.screenWidth * 0.7, tableHeaderY, 'СЧЕТ', {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '22px' : '26px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);
        
        // Определяем максимальное количество записей, которые поместятся на экране
        const availableHeight = this.adjustedHeight - tableHeaderY - (this.isMobile ? 100 : 120);
        const maxEntries = Math.min(Math.floor(availableHeight / lineHeight), scores.length, 20);
        
        // Выводим записи таблицы
        for (let i = 0; i < maxEntries; i++) {
            const entryY = tableHeaderY + (i + 1) * lineHeight;
            const score = scores[i];
            
            // Определяем, является ли эта запись новым результатом игрока
            const isPlayerNewScore = this.newScore && score.score === this.newScore;
            const textColor = isPlayerNewScore ? '#ffff00' : (i < 3 ? '#88ffff' : '#ffffff');
            
            // Место
            this.add.text(this.screenWidth * 0.15, entryY, `${i + 1}`, {
                fontFamily: 'unutterable',
                fontSize: this.isMobile ? '20px' : '24px',
                color: textColor,
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5, 0.5);
            
            // Имя игрока (ограничиваем длину для мобильных устройств)
            const displayName = this.isMobile && score.name.length > 10 
                ? score.name.substring(0, 10) + '...'
                : score.name;
                
            this.add.text(this.screenWidth * 0.4, entryY, displayName, {
                fontFamily: 'unutterable',
                fontSize: this.isMobile ? '20px' : '24px',
                color: textColor,
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5, 0.5);
            
            // Счет
            this.add.text(this.screenWidth * 0.7, entryY, `${score.score}`, {
                fontFamily: 'unutterable',
                fontSize: this.isMobile ? '20px' : '24px',
                color: textColor,
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5, 0.5);
        }
        
        // Кнопка "Вернуться назад" - с учетом высоты панели браузера
        const backY = Math.min(
            tableHeaderY + (maxEntries + 1.5) * lineHeight,
            this.adjustedHeight - (this.isMobile ? 50 : 70)
        );
        
        this.backButton = this.add.text(this.screenWidth / 2, backY, 'НАЗАД', {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '24px' : '28px',
            color: '#ffffff',
            backgroundColor: '#883333',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        // Эффекты для кнопки
        this.backButton.on('pointerover', () => {
            this.backButton.setStyle({ color: '#ffff00', backgroundColor: '#aa3333' });
        });
        
        this.backButton.on('pointerout', () => {
            this.backButton.setStyle({ color: '#ffffff', backgroundColor: '#883333' });
        });
        
        this.backButton.on('pointerdown', () => {
            this.backButton.setStyle({ color: '#ff8800' });
            this.scene.start('StartScene');
        });
        
        // Обработчик изменения размера экрана
        this.scale.on('resize', this.resize, this);
        
        // Добавляем слушатель события resize для отслеживания изменения высоты браузера
        window.addEventListener('resize', () => {
            this.updateBrowserBarHeight();
            this.resize();
        });
    }
    
    updateBrowserBarHeight() {
        // Обновляем информацию о высоте панели браузера
        this.browserBarHeight = window.innerHeight - this.game.canvas.offsetHeight;
        this.adjustedHeight = this.screenHeight - this.browserBarHeight;
    }
    
    resize(gameSize) {
        // Обновляем размеры экрана при изменении
        if (gameSize) {
            this.screenWidth = gameSize.width;
            this.screenHeight = gameSize.height;
        }
        
        // Обновляем информацию о панели браузера
        this.updateBrowserBarHeight();
        
        // Обновляем позицию заголовка с учетом высоты панели браузера
        const titleY = Math.max(this.isMobile ? 70 : 90, this.browserBarHeight + 40);
        this.titleText.setPosition(this.screenWidth / 2, titleY);
        
        // Обновляем позицию кнопки "Назад"
        const tableHeaderY = titleY + (this.isMobile ? 60 : 70);
        const lineHeight = this.isMobile ? 30 : 35;
        
        // Определяем количество записей в таблице
        const tableElements = this.children.list.filter(child => 
            child.type === 'Text' && 
            child !== this.titleText && 
            child !== this.backButton
        );
        
        // Примерное количество строк в таблице (без заголовков)
        const entriesCount = Math.floor((tableElements.length - 3) / 3);
        
        // Обновляем позицию кнопки "Вернуться назад"
        const backY = Math.min(
            tableHeaderY + (entriesCount + 1.5) * lineHeight,
            this.adjustedHeight - (this.isMobile ? 50 : 70)
        );
        
        this.backButton.setPosition(this.screenWidth / 2, backY);
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