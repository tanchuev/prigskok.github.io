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
        // Фон
        this.add.image(400, 300, 'background');
        
        // Заголовок "Игра окончена"
        this.add.text(400, 120, 'ИГРА ОКОНЧЕНА', {
            fontFamily: 'unutterable',
            fontSize: '58px',
            color: '#ff0000',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Отображаем счет
        this.add.text(400, 200, `Предел твоих возможностей: ${this.score}`, {
            fontFamily: 'unutterable',
            fontSize: '32px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Отображаем время прохождения
        this.add.text(400, 240, `Время: ${this.formatTime(this.gameTime)}`, {
            fontFamily: 'unutterable',
            fontSize: '28px',
            color: '#88ffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Получаем имя игрока и проверяем рейтинг в лидерборде
        const nickname = this.getCookie('playerNickname') || 'Аноним';
        const playerY = 280; // Позиция для имени игрока
        
        // Загружаем текущий лидерборд для проверки позиции
        let scores = [];
        const leaderboardData = localStorage.getItem('jumpGameLeaderboard');
        if (leaderboardData) {
            scores = JSON.parse(leaderboardData);
        }
        
        // Определяем, нужно ли показывать сообщение о рекорде
        let showRecordMessage = false;
        let recordMessage = '';
        let recordY = 320; // Позиция для сообщения о рекорде
        
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
        this.add.text(400, playerY, `Игрок: ${nickname}`, {
            fontFamily: 'unutterable',
            fontSize: '24px',
            color: '#ffff88',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Отображаем сообщение о рекорде, если нужно
        if (showRecordMessage) {
            this.add.text(400, recordY, recordMessage, {
                fontFamily: 'unutterable',
                fontSize: recordMessage.includes('НОВЫЙ РЕКОРД') ? '32px' : '24px',
                color: recordMessage.includes('НОВЫЙ РЕКОРД') ? '#ffff00' : '#aaaaff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
        }
        
        // Кнопки - смещаем их вниз, если есть сообщение о рекорде
        const buttonsStartY = showRecordMessage ? 380 : 350;
        
        // Кнопка "Играть снова"
        const playAgainButton = this.add.text(400, buttonsStartY, 'Я МОГУ БОЛЬШЕ!', {
            fontFamily: 'unutterable',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#338833',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: 20,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        
        // Кнопка "Лидерборд"
        const leaderboardButton = this.add.text(400, buttonsStartY + 60, 'ПОСМОТРЕТЬ РЕКОРДЫ', {
            fontFamily: 'unutterable',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#883388',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: 20,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        
        // Кнопка "Главное меню"
        const menuButton = this.add.text(400, buttonsStartY + 120, 'Я не могу больше :(', {
            fontFamily: 'unutterable',
            fontSize: '24px',
            color: '#ffffff',
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
        playAgainButton.on('pointerover', () => {
            playAgainButton.setStyle({ color: '#ffff00', backgroundColor: '#33aa33' });
        });
        
        playAgainButton.on('pointerout', () => {
            playAgainButton.setStyle({ color: '#ffffff', backgroundColor: '#338833' });
        });
        
        leaderboardButton.on('pointerover', () => {
            leaderboardButton.setStyle({ color: '#ffff00', backgroundColor: '#aa33aa' });
        });
        
        leaderboardButton.on('pointerout', () => {
            leaderboardButton.setStyle({ color: '#ffffff', backgroundColor: '#883388' });
        });
        
        menuButton.on('pointerover', () => {
            menuButton.setStyle({ color: '#ffff00', backgroundColor: '#888888' });
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setStyle({ color: '#ffffff', backgroundColor: '#666666' });
        });
        
        // Действия при нажатии
        playAgainButton.on('pointerdown', () => {
            playAgainButton.setStyle({ color: '#ff8800' });
            this.scene.start('CharacterSelectScene');
        });
        
        leaderboardButton.on('pointerdown', () => {
            leaderboardButton.setStyle({ color: '#ff8800' });
            this.scene.start('LeaderboardScene', { score: this.score, gameTime: this.gameTime });
        });
        
        menuButton.on('pointerdown', () => {
            menuButton.setStyle({ color: '#ff8800' });
            this.scene.start('StartScene');
        });
    }
    
    saveScore() {
        const nickname = this.getCookie('playerNickname') || 'Аноним';
        
        // Загружаем текущий лидерборд
        let scores = [];
        const leaderboardData = localStorage.getItem('jumpGameLeaderboard');
        if (leaderboardData) {
            scores = JSON.parse(leaderboardData);
        }
        
        // Добавляем новый результат
        scores.push({
            name: nickname,
            score: this.score,
            time: this.gameTime,
            date: new Date().toLocaleDateString()
        });
        
        // Сортируем по убыванию
        scores.sort((a, b) => b.score - a.score);
        
        // Ограничиваем 20 лучшими результатами
        if (scores.length > 20) {
            scores = scores.slice(0, 20);
        }
        
        // Сохраняем в localStorage
        localStorage.setItem('jumpGameLeaderboard', JSON.stringify(scores));
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