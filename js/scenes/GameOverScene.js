class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        // Получаем набранный счет и время из GameScene
        this.score = data.score || 0;
        this.gameTime = data.gameTime || 0;
        
        // Добавляем результат в лидерборд
        if (this.score > 0) {
            this.saveScore();
        }
    }

    create() {
        // Определяем, является ли устройство мобильным
        this.isMobile = !this.sys.game.device.os.desktop;
        
        // Получаем размеры экрана
        this.screenWidth = this.cameras.main.width;
        this.screenHeight = this.cameras.main.height;
        
        // Фон
        this.add.image(this.screenWidth / 2, this.screenHeight / 2, 'background');
        
        // Заголовок "Игра окончена"
        this.titleText = this.add.text(this.screenWidth / 2, this.isMobile ? 80 : 120, 'ИГРА ОКОНЧЕНА', {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '42px' : '58px',
            color: '#ff0000',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Отображаем счет
        this.scoreText = this.add.text(this.screenWidth / 2, this.isMobile ? 150 : 200, `Предел твоих возможностей: ${this.score}`, {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '24px' : '32px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Отображаем время прохождения
        this.timeText = this.add.text(this.screenWidth / 2, this.isMobile ? 190 : 240, `Время: ${this.formatTime(this.gameTime)}`, {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '22px' : '28px',
            color: '#88ffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Получаем имя игрока и проверяем рейтинг в лидерборде
        const nickname = this.getCookie('playerNickname') || 'Аноним';
        const playerY = this.isMobile ? 230 : 280; // Позиция для имени игрока
        
        // Загружаем текущий лидерборд для проверки позиции
        let scores = [];
        const leaderboardData = localStorage.getItem('jumpGameLeaderboard');
        if (leaderboardData) {
            scores = JSON.parse(leaderboardData);
        }
        
        // Определяем, нужно ли показывать сообщение о рекорде
        let showRecordMessage = false;
        let recordMessage = '';
        let recordY = this.isMobile ? 270 : 320; // Позиция для сообщения о рекорде
        
        if (scores.length > 0) {
            // Находим позицию текущего результата
            const position = scores.findIndex(score => 
                score.name === nickname && score.score === this.score);
            
            if (position >= 0) {
                showRecordMessage = true;
                if (position === 0) {
                    recordMessage = 'НОВЫЙ РЕКОРД! 🏆';
                } else {
                    recordMessage = `Позиция в рейтинге: ${position + 1}`;
                }
            }
        }
        
        // Отображаем имя игрока
        this.playerText = this.add.text(this.screenWidth / 2, playerY, `Игрок: ${nickname}`, {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '20px' : '24px',
            color: '#ffff88',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Отображаем сообщение о рекорде, если нужно
        if (showRecordMessage) {
            this.recordText = this.add.text(this.screenWidth / 2, recordY, recordMessage, {
                fontFamily: 'unutterable',
                fontSize: recordMessage.includes('НОВЫЙ РЕКОРД') ? 
                    (this.isMobile ? '28px' : '32px') : 
                    (this.isMobile ? '20px' : '24px'),
                color: recordMessage.includes('НОВЫЙ РЕКОРД') ? '#ffff00' : '#aaaaff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
        }
        
        // Кнопки - смещаем их вниз, если есть сообщение о рекорде
        const buttonsStartY = showRecordMessage ? 
                                (this.isMobile ? 320 : 380) : 
                                (this.isMobile ? 290 : 350);
        
        // Размер кнопок и отступы между ними
        const buttonFontSize = this.isMobile ? '22px' : '24px';
        const buttonPadding = this.isMobile ? { x: 15, y: 8 } : { x: 20, y: 10 };
        const buttonSpacing = this.isMobile ? 50 : 60;
        
        // Кнопка "Играть снова"
        this.playAgainButton = this.add.text(this.screenWidth / 2, buttonsStartY, 'Я МОГУ БОЛЬШЕ!', {
            fontFamily: 'unutterable',
            fontSize: buttonFontSize,
            color: '#ffffff',
            backgroundColor: '#338833',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            padding: buttonPadding
        }).setOrigin(0.5).setInteractive();
        
        // Кнопка "Лидерборд"
        this.leaderboardButton = this.add.text(this.screenWidth / 2, buttonsStartY + buttonSpacing, 'ПОСМОТРЕТЬ РЕКОРДЫ', {
            fontFamily: 'unutterable',
            fontSize: buttonFontSize,
            color: '#ffffff',
            backgroundColor: '#883388',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            padding: buttonPadding
        }).setOrigin(0.5).setInteractive();
        
        // Кнопка "Главное меню"
        this.menuButton = this.add.text(this.screenWidth / 2, buttonsStartY + buttonSpacing * 2, 'Я не могу больше :(', {
            fontFamily: 'unutterable',
            fontSize: buttonFontSize,
            color: '#ffffff',
            backgroundColor: '#666666',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            padding: buttonPadding
        }).setOrigin(0.5).setInteractive();
        
        // Эффекты при наведении
        this.playAgainButton.on('pointerover', () => {
            this.playAgainButton.setStyle({ color: '#ffff00', backgroundColor: '#33aa33' });
        });
        
        this.playAgainButton.on('pointerout', () => {
            this.playAgainButton.setStyle({ color: '#ffffff', backgroundColor: '#338833' });
        });
        
        this.leaderboardButton.on('pointerover', () => {
            this.leaderboardButton.setStyle({ color: '#ffff00', backgroundColor: '#aa33aa' });
        });
        
        this.leaderboardButton.on('pointerout', () => {
            this.leaderboardButton.setStyle({ color: '#ffffff', backgroundColor: '#883388' });
        });
        
        this.menuButton.on('pointerover', () => {
            this.menuButton.setStyle({ color: '#ffff00', backgroundColor: '#888888' });
        });
        
        this.menuButton.on('pointerout', () => {
            this.menuButton.setStyle({ color: '#ffffff', backgroundColor: '#666666' });
        });
        
        // Действия при нажатии
        this.playAgainButton.on('pointerdown', () => {
            this.playAgainButton.setStyle({ color: '#ff8800' });
            this.scene.start('CharacterSelectScene');
        });
        
        this.leaderboardButton.on('pointerdown', () => {
            this.leaderboardButton.setStyle({ color: '#ff8800' });
            this.scene.start('LeaderboardScene', { score: this.score, gameTime: this.gameTime });
        });
        
        this.menuButton.on('pointerdown', () => {
            this.menuButton.setStyle({ color: '#ff8800' });
            this.scene.start('StartScene');
        });
        
        // Добавляем обработчик изменения размера экрана
        this.scale.on('resize', this.resize, this);
    }
    
    resize(gameSize) {
        if (!gameSize) return;
        
        this.screenWidth = gameSize.width;
        this.screenHeight = gameSize.height;
        
        if (this.titleText) {
            this.titleText.setPosition(this.screenWidth / 2, this.isMobile ? 80 : 120);
        }
        
        if (this.scoreText) {
            this.scoreText.setPosition(this.screenWidth / 2, this.isMobile ? 150 : 200);
        }
        
        if (this.timeText) {
            this.timeText.setPosition(this.screenWidth / 2, this.isMobile ? 190 : 240);
        }
        
        if (this.playerText) {
            this.playerText.setPosition(this.screenWidth / 2, this.isMobile ? 230 : 280);
        }
        
        if (this.recordText) {
            this.recordText.setPosition(this.screenWidth / 2, this.isMobile ? 270 : 320);
        }
        
        const buttonsStartY = this.recordText ? 
                               (this.isMobile ? 320 : 380) : 
                               (this.isMobile ? 290 : 350);
        
        const buttonSpacing = this.isMobile ? 50 : 60;
        
        if (this.playAgainButton) {
            this.playAgainButton.setPosition(this.screenWidth / 2, buttonsStartY);
        }
        
        if (this.leaderboardButton) {
            this.leaderboardButton.setPosition(this.screenWidth / 2, buttonsStartY + buttonSpacing);
        }
        
        if (this.menuButton) {
            this.menuButton.setPosition(this.screenWidth / 2, buttonsStartY + buttonSpacing * 2);
        }
    }
    
    saveScore() {
        const nickname = this.getCookie('playerNickname') || 'Аноним';
        
        // Если dreamlo доступен, отправляем результат на сервер
        if (typeof dreamlo !== 'undefined') {
            try {
                // Ключи для dreamlo
                const publicKey = '680ed22b8f40bb18ac70df27';
                const privateKey = 'WJRxP_ErZ0uLBvmSL6uXBgdwIykOMp6kmqlN69KlSiuA';
                const useHttps = false;
                
                console.log('Инициализация dreamlo...');
                // Инициализируем dreamlo
                dreamlo.initialize(publicKey, privateKey, useHttps);
                
                // Создаем уникальное имя, добавляя время к никнейму
                const uniqueName = `${nickname}`;
                
                const scoreData = {
                    name: uniqueName,
                    points: this.score,
                    seconds: Math.floor(this.gameTime), // Убедимся, что отправляем целое число секунд
                    text: nickname // Сохраняем оригинальный никнейм в поле text
                };
                
                console.log('Отправка результата в dreamlo:', scoreData);
                console.log('Отправляемое время в секундах:', Math.floor(this.gameTime));
                
                // Отправляем счёт на сервер
                dreamlo.addScore(
                    scoreData, 
                    dreamlo.ScoreFormat.Object, 
                    dreamlo.SortOrder.PointsDescending, 
                    true
                )
                .then(scores => {
                    console.log('Результат успешно добавлен в dreamlo');
                    console.log('Количество записей в ответе:', scores.length);
                    
                    // Проверяем, есть ли в ответе наша новая запись
                    if (scores && scores.length > 0) {
                        const ourScore = scores.find(s => s.name === uniqueName);
                        if (ourScore) {
                            console.log('Наша запись в ответе:', ourScore);
                            console.log('Время в ответе (seconds):', ourScore.seconds);
                        }
                    }
                })
                .catch(error => {
                    console.error('Ошибка добавления результата в dreamlo:', error);
                    console.error('Полное сообщение об ошибке:', error.message);
                });
            } catch (e) {
                console.error('Ошибка при инициализации dreamlo в GameOverScene:', e);
            }
        } else {
            console.error('Библиотека dreamlo не загружена, результат не сохранен');
        }
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

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
} 