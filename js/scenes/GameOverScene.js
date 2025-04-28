class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        // Получаем набранный счет из GameScene
        this.score = data.score || 0;
        
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
        
        // Получаем имя игрока
        const nickname = this.getCookie('playerNickname') || 'Аноним';
        this.add.text(400, 250, `Игрок: ${nickname}`, {
            fontFamily: 'unutterable',
            fontSize: '24px',
            color: '#ffff88',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Проверяем рейтинг в лидерборде
        this.showLeaderboardPosition();
        
        // Кнопка "Играть снова"
        const playAgainButton = this.add.text(400, 350, 'Я МОГУ БОЛЬШЕ!', {
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
        const leaderboardButton = this.add.text(400, 410, 'ПОСМОТРЕТЬ РЕКОРДЫ', {
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
        const menuButton = this.add.text(400, 470, 'Я не могу больше :(', {
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
            this.scene.start('LeaderboardScene');
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
    
    showLeaderboardPosition() {
        // Загружаем текущий лидерборд
        let scores = [];
        const leaderboardData = localStorage.getItem('jumpGameLeaderboard');
        if (leaderboardData) {
            scores = JSON.parse(leaderboardData);
        }
        
        if (scores.length === 0) return;
        
        // Находим позицию текущего результата
        const nickname = this.getCookie('playerNickname') || 'Аноним';
        const position = scores.findIndex(score => 
            score.name === nickname && score.score === this.score);
        
        if (position >= 0) {
            let message = '';
            if (position === 0) {
                message = 'НОВЫЙ РЕКОРД! 🏆';
            } else {
                message = `Позиция в рейтинге: ${position + 1}`;
            }
            
            this.add.text(400, 300, message, {
                fontFamily: 'unutterable',
                fontSize: position === 0 ? '32px' : '24px',
                color: position === 0 ? '#ffff00' : '#aaaaff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
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
} 