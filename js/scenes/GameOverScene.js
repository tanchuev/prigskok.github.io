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
        // Получаем передаваемые данные со сцены игры
        const params = this.scene.settings.data || {};
        this.score = params.score || 0;
        this.height = params.height || 0;
        this.gameTime = params.gameTime || 0;
        
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
        
        this.titleText = this.add.text(this.screenWidth / 2, titleY, 'ИГРА ОКОНЧЕНА', {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '36px' : '48px',
            color: '#ff3333',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);
        
        // Отображение счета
        const scoreY = titleY + (this.isMobile ? 70 : 90);
        
        this.add.text(this.screenWidth / 2, scoreY, `СЧЁТ: ${this.score}`, {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '28px' : '36px',
            color: '#ffcc00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Отображение высоты
        const heightY = scoreY + (this.isMobile ? 50 : 60);
        
        this.add.text(this.screenWidth / 2, heightY, `ВЫСОТА: ${this.height} м`, {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '24px' : '32px',
            color: '#88ffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Отображение времени игры
        const timeY = heightY + (this.isMobile ? 50 : 60);
        
        this.add.text(this.screenWidth / 2, timeY, `ВРЕМЯ: ${this.formatTime(this.gameTime)}`, {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '24px' : '32px',
            color: '#88ffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Кнопки с учетом высоты панели браузера
        const buttonsBaseY = Math.min(
            timeY + (this.isMobile ? 80 : 100),
            this.adjustedHeight - (this.isMobile ? 160 : 180)
        );
        
        const buttonSpacing = this.isMobile ? 60 : 70;
        
        // Кнопка "Играть снова"
        this.playAgainButton = this.add.text(this.screenWidth / 2, buttonsBaseY, 'ИГРАТЬ СНОВА', {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '24px' : '28px',
            color: '#ffffff',
            backgroundColor: '#338833',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        // Кнопка "Таблица рекордов"
        this.leaderboardButton = this.add.text(this.screenWidth / 2, buttonsBaseY + buttonSpacing, 'ТАБЛИЦА РЕКОРДОВ', {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '24px' : '28px',
            color: '#ffffff',
            backgroundColor: '#333388',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        // Кнопка "Главное меню"
        this.menuButton = this.add.text(this.screenWidth / 2, buttonsBaseY + buttonSpacing * 2, 'ГЛАВНОЕ МЕНЮ', {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '24px' : '28px',
            color: '#ffffff',
            backgroundColor: '#883333',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        // Эффекты для кнопок
        this.setupButtonInteractivity(this.playAgainButton, '#338833', '#55aa55');
        this.setupButtonInteractivity(this.leaderboardButton, '#333388', '#5555aa');
        this.setupButtonInteractivity(this.menuButton, '#883333', '#aa5555');
        
        // Сохраняем результат игры в лидерборд
        this.saveScoreToLeaderboard();
        
        // Обработчик изменения размера экрана
        this.scale.on('resize', this.resize, this);
        
        // Добавляем слушатель события resize для отслеживания изменения высоты браузера
        window.addEventListener('resize', () => {
            this.updateBrowserBarHeight();
            this.resize();
        });
    }
    
    setupButtonInteractivity(button, baseColor, hoverColor) {
        button.on('pointerover', () => {
            button.setStyle({ color: '#ffff00', backgroundColor: hoverColor });
        });
        
        button.on('pointerout', () => {
            button.setStyle({ color: '#ffffff', backgroundColor: baseColor });
        });
        
        button.on('pointerdown', () => {
            button.setStyle({ color: '#ff8800' });
            
            if (button === this.playAgainButton) {
                this.scene.start('GameScene');
            } else if (button === this.leaderboardButton) {
                this.scene.start('LeaderboardScene', {
                    score: this.score,
                    height: this.height,
                    gameTime: this.gameTime
                });
            } else if (button === this.menuButton) {
                this.scene.start('StartScene');
            }
        });
    }
    
    saveScoreToLeaderboard() {
        // Получаем имя игрока из куки или используем "Аноним"
        const nickname = this.getCookie('playerNickname') || 'Аноним';
        
        // Получаем текущий лидерборд
        let leaderboardData = [];
        const savedData = localStorage.getItem('jumpGameLeaderboard');
        if (savedData) {
            leaderboardData = JSON.parse(savedData);
        }
        
        // Проверяем, существует ли уже такой результат
        const existingIndex = leaderboardData.findIndex(
            item => item.name === nickname && item.score === this.score
        );
        
        // Если нет, добавляем новый результат
        if (existingIndex === -1) {
            leaderboardData.push({
                name: nickname,
                score: this.score,
                height: this.height,
                date: new Date().toLocaleDateString(),
                gameTime: this.gameTime
            });
            
            // Сортируем по убыванию счета
            leaderboardData.sort((a, b) => b.score - a.score);
            
            // Ограничиваем до 20 лучших результатов
            if (leaderboardData.length > 20) {
                leaderboardData = leaderboardData.slice(0, 20);
            }
            
            // Сохраняем обновленный лидерборд
            localStorage.setItem('jumpGameLeaderboard', JSON.stringify(leaderboardData));
        }
    }
    
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
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
        
        // Получаем все текстовые элементы
        const texts = this.children.list.filter(child => child.type === 'Text');
        
        // Находим элементы с текстом счета, высоты и времени
        const scoreText = texts.find(text => text.text.includes('СЧЁТ'));
        const heightText = texts.find(text => text.text.includes('ВЫСОТА'));
        const timeText = texts.find(text => text.text.includes('ВРЕМЯ'));
        
        // Обновляем позиции элементов
        if (scoreText) {
            const scoreY = titleY + (this.isMobile ? 70 : 90);
            scoreText.setPosition(this.screenWidth / 2, scoreY);
            
            if (heightText) {
                const heightY = scoreY + (this.isMobile ? 50 : 60);
                heightText.setPosition(this.screenWidth / 2, heightY);
                
                if (timeText) {
                    const timeY = heightY + (this.isMobile ? 50 : 60);
                    timeText.setPosition(this.screenWidth / 2, timeY);
                    
                    // Обновляем позиции кнопок
                    const buttonsBaseY = Math.min(
                        timeY + (this.isMobile ? 80 : 100),
                        this.adjustedHeight - (this.isMobile ? 160 : 180)
                    );
                    
                    const buttonSpacing = this.isMobile ? 60 : 70;
                    
                    if (this.playAgainButton) {
                        this.playAgainButton.setPosition(this.screenWidth / 2, buttonsBaseY);
                    }
                    
                    if (this.leaderboardButton) {
                        this.leaderboardButton.setPosition(this.screenWidth / 2, buttonsBaseY + buttonSpacing);
                    }
                    
                    if (this.menuButton) {
                        this.menuButton.setPosition(this.screenWidth / 2, buttonsBaseY + buttonSpacing * 2);
                    }
                }
            }
        }
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
} 