class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super('LeaderboardScene');
        this.scores = [];
    }

    init(data) {
        // Если передан новый счет, обновляем лидерборд
        if (data && data.score) {
            this.updateLeaderboard(data.score, data.gameTime || 0);
        }
    }

    create() {
        // Фон
        this.add.image(400, 300, 'background');
        
        // Заголовок
        this.add.text(400, 80, 'ЛИДЕРБОРД', {
            fontFamily: 'unutterable',
            fontSize: '48px',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Загружаем данные лидерборда
        this.loadLeaderboard();
        
        // Отображаем топ-10 игроков
        this.displayLeaderboard();
        
        // Кнопка "Назад"
        const backButton = this.add.text(400, 530, 'НАЗАД', {
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
    
    loadLeaderboard() {
        // Загружаем данные из localStorage
        const leaderboardData = localStorage.getItem('jumpGameLeaderboard');
        if (leaderboardData) {
            this.scores = JSON.parse(leaderboardData);
        } else {
            this.scores = [];
        }
    }
    
    updateLeaderboard(newScore, gameTime) {
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
            score: newScore,
            time: gameTime, // Используем переданное время
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
    
    displayLeaderboard() {
        // Если данных нет
        if (this.scores.length === 0) {
            this.add.text(400, 280, 'Пока нет результатов', {
                fontFamily: 'unutterable',
                fontSize: '24px',
                fill: '#888888',
                align: 'center'
            }).setOrigin(0.5);
            return;
        }
        
        // Заголовки таблицы
        this.add.text(100, 150, 'МЕСТО', {
            fontFamily: 'unutterable',
            fontSize: '24px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);
        
        this.add.text(220, 150, 'ИГРОК', {
            fontFamily: 'unutterable',
            fontSize: '24px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);
        
        this.add.text(400, 150, 'ВЫСОТА', {
            fontFamily: 'unutterable',
            fontSize: '24px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);
        
        this.add.text(530, 150, 'ВРЕМЯ', {
            fontFamily: 'unutterable',
            fontSize: '24px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);
        
        this.add.text(650, 150, 'ДАТА', {
            fontFamily: 'unutterable',
            fontSize: '24px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);
        
        // Определяем текущего игрока
        const currentNickname = this.getCookie('playerNickname') || 'Аноним';
        
        // Отображаем не более 10 лучших результатов
        const maxDisplay = Math.min(10, this.scores.length);
        for (let i = 0; i < maxDisplay; i++) {
            const score = this.scores[i];
            const y = 190 + i * 30;
            const highlight = score.name === currentNickname;
            const color = highlight ? '#ffff00' : '#ffffff';
            const stroke = highlight ? '#aa5500' : '#000000';
            
            // Место
            this.add.text(100, y, `${i + 1}`, {
                fontFamily: 'unutterable',
                fontSize: '22px',
                fill: color,
                stroke: stroke,
                strokeThickness: highlight ? 3 : 0
            }).setOrigin(0.5);
            
            // Имя
            this.add.text(220, y, score.name, {
                fontFamily: 'unutterable',
                fontSize: '22px',
                fill: color,
                stroke: stroke,
                strokeThickness: highlight ? 3 : 0
            }).setOrigin(0.5);
            
            // Счет
            this.add.text(400, y, `${score.score}`, {
                fontFamily: 'unutterable',
                fontSize: '22px',
                fill: color,
                stroke: stroke,
                strokeThickness: highlight ? 3 : 0
            }).setOrigin(0.5);
            
            // Время
            this.add.text(530, y, this.formatTime(score.time || 0), {
                fontFamily: 'unutterable',
                fontSize: '22px',
                fill: color,
                stroke: stroke,
                strokeThickness: highlight ? 3 : 0
            }).setOrigin(0.5);
            
            // Дата
            this.add.text(650, y, score.date, {
                fontFamily: 'unutterable',
                fontSize: '22px',
                fill: color,
                stroke: stroke,
                strokeThickness: highlight ? 3 : 0
            }).setOrigin(0.5);
        }
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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