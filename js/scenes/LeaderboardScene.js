class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super('LeaderboardScene');
        this.scores = [];
        
        // Инициализация сервиса лидерборда
        this.publicKey = "680ed22b8f40bb18ac70df27";
        this.privateKey ="WJRxP_ErZ0uLBvmSL6uXBgdwIykOMp6kmqlN69KlSiuA";
        this.useHttps = true;
        
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
        // Фон
        this.add.image(400, 640, 'background');
        
        // Заголовок
        this.add.text(400, 150, 'ЛИДЕРБОРД', {
            fontFamily: 'unutterable',
            fontSize: '48px',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Индикатор загрузки
        this.loadingText = this.add.text(400, 350, 'Загрузка лидерборда...', {
            fontFamily: 'unutterable',
            fontSize: '24px',
            fill: '#888888',
            align: 'center'
        }).setOrigin(0.5);
        
        // Загружаем данные лидерборда
        this.loadLeaderboard();
        
        // Кнопка "Назад"
        const backButton = this.add.text(400, 860, 'НАЗАД', {
            fontFamily: 'unutterable',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#666666',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: 20,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        
        // Эффекты при наведении
        backButton.on('pointerover', () => {
            backButton.setStyle({ fill: '#ffff00', backgroundColor: '#888888' });
        });
        
        backButton.on('pointerout', () => {
            backButton.setStyle({ fill: '#ffffff', backgroundColor: '#666666' });
        });
        
        // Действие при нажатии
        backButton.on('pointerdown', () => {
            backButton.setStyle({ fill: '#ff8800' });
            this.scene.start('StartScene');
        });
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
        
        // Проверяем, загружен ли сервис лидерборда
        if (typeof leaderboardService === 'undefined') {
            this.loadingText.setText('Ошибка загрузки сервиса лидерборда');
            console.error('Сервис лидерборда не загружен');
            return;
        }
        
        try {
            // Инициализируем сервис (для совместимости)
            leaderboardService.initialize(this.publicKey, this.privateKey, this.useHttps);
            
            console.log('Загрузка лидерборда...');
            // Загружаем данные
            leaderboardService.getScores()
                .then(scores => {
                    console.log('Получены данные:', scores);
                    if (scores && scores.length > 0) {
                        this.scores = scores.map(entry => {
                            console.log('Запись:', entry);
                            
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
                                date: entry.date,
                                text: entry.text
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
            console.error('Ошибка при инициализации сервиса лидерборда:', e);
            this.loadingText.setText('Ошибка инициализации сервиса.');
        }
    }
    
    updateLeaderboard(newScore, gameTime) {
        // Этот метод теперь не требуется, так как сохранение происходит только в GameOverScene
        // Оставлен для обратной совместимости
        console.log('Обновление лидерборда в LeaderboardScene больше не используется');
    }
    
    displayLeaderboard() {
        // Очищаем предыдущие элементы перед отображением
        this.clearLeaderboard();
        
        // Если данных нет
        if (!this.scores || this.scores.length === 0) {
            const noResultsText = this.add.text(400, 350, 'Пока нет результатов', {
                fontFamily: 'unutterable',
                fontSize: '24px',
                fill: '#888888',
                align: 'center'
            }).setOrigin(0.5);
            
            this.leaderboardElements.push(noResultsText);
            return;
        }
        
        // Очищаем текст загрузки
        this.loadingText.setVisible(false);
        
        // Заголовки таблицы
        this.leaderboardElements.push(
            this.add.text(100, 250, 'МЕСТО', {
                fontFamily: 'unutterable',
                fontSize: '24px',
                fill: '#aaaaaa'
            }).setOrigin(0.5)
        );
        
        this.leaderboardElements.push(
            this.add.text(220, 250, 'ИГРОК', {
                fontFamily: 'unutterable',
                fontSize: '24px',
                fill: '#aaaaaa'
            }).setOrigin(0.5)
        );
        
        this.leaderboardElements.push(
            this.add.text(400, 250, 'ВЫСОТА', {
                fontFamily: 'unutterable',
                fontSize: '24px',
                fill: '#aaaaaa'
            }).setOrigin(0.5)
        );
        
        this.leaderboardElements.push(
            this.add.text(530, 250, 'ВРЕМЯ', {
                fontFamily: 'unutterable',
                fontSize: '24px',
                fill: '#aaaaaa'
            }).setOrigin(0.5)
        );
        
        this.leaderboardElements.push(
            this.add.text(650, 250, 'ДАТА', {
                fontFamily: 'unutterable',
                fontSize: '24px',
                fill: '#aaaaaa'
            }).setOrigin(0.5)
        );
        
        // Определяем текущего игрока
        const currentNickname = this.getCookie('playerNickname') || 'Аноним';
        
        // Отображаем не более 10 лучших результатов
        const maxDisplay = Math.min(10, this.scores.length);
        for (let i = 0; i < maxDisplay; i++) {
            const score = this.scores[i];
            const y = 300 + i * 35;
            
            // Для dreamlo записей, используем поле text как имя игрока, если оно есть
            const playerName = score.text || score.name;
            
            // Проверяем, принадлежит ли результат текущему игроку
            // Для dreamlo записей проверяем, содержит ли имя никнейм текущего игрока
            const highlight = 
                playerName === currentNickname || 
                (score.name && score.name.includes(currentNickname));
            
            const color = highlight ? '#ffff00' : '#ffffff';
            const stroke = highlight ? '#aa5500' : '#000000';
            
            // Место
            this.leaderboardElements.push(
                this.add.text(100, y, `${i + 1}`, {
                    fontFamily: 'unutterable',
                    fontSize: '22px',
                    fill: color,
                    stroke: stroke,
                    strokeThickness: highlight ? 3 : 0
                }).setOrigin(0.5)
            );
            
            // Имя - используем поле text из dreamlo если доступно, иначе имя
            this.leaderboardElements.push(
                this.add.text(220, y, playerName, {
                    fontFamily: 'unutterable',
                    fontSize: '22px',
                    fill: color,
                    stroke: stroke,
                    strokeThickness: highlight ? 3 : 0
                }).setOrigin(0.5)
            );
            
            // Счет
            this.leaderboardElements.push(
                this.add.text(400, y, `${score.score}`, {
                    fontFamily: 'unutterable',
                    fontSize: '22px',
                    fill: color,
                    stroke: stroke,
                    strokeThickness: highlight ? 3 : 0
                }).setOrigin(0.5)
            );
            
            // Время
            this.leaderboardElements.push(
                this.add.text(530, y, this.formatTime(score.time || 0), {
                    fontFamily: 'unutterable',
                    fontSize: '22px',
                    fill: color,
                    stroke: stroke,
                    strokeThickness: highlight ? 3 : 0
                }).setOrigin(0.5)
            );
            
            // Дата
            this.leaderboardElements.push(
                this.add.text(650, y, score.date, {
                    fontFamily: 'unutterable',
                    fontSize: '22px',
                    fill: color,
                    stroke: stroke,
                    strokeThickness: highlight ? 3 : 0
                }).setOrigin(0.5)
            );
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