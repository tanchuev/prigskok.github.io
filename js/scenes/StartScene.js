class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        // Инициализация и запуск фоновой музыки через менеджер
        window.musicManager.init(this);
        window.musicManager.playMusic('main_theme');
        
        // Получаем размеры экрана
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Определяем масштаб для мобильных устройств
        const isMobile = window.GAME_CONFIG.isMobile;
        const scale = isMobile ? 0.8 : 1;
        const titleFontSize = isMobile ? '48px' : '64px';
        const btnFontSize = isMobile ? '26px' : '32px';
        const leaderboardFontSize = isMobile ? '24px' : '28px';
        
        // Фон
        const bg = this.add.image(width / 2, height / 2, 'background');
        const scaleX = width / bg.width;
        bg.setScale(scaleX, scaleX); // Сохраняем пропорции при масштабировании
        // Центрируем по вертикали если изображение слишком большое
        if (bg.height * scaleX > height) {
            bg.y = height / 2;
        }
        
        // Заголовок игры
        this.title = this.add.text(width / 2, height * 0.25, 'ПРЫГ-СКОК', {
            fontFamily: 'unutterable',
            fontSize: titleFontSize,
            fill: '#8B0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        this.title.setOrigin(0.5);
        
        // Получаем имя игрока из куки
        const nickname = this.getCookie('playerNickname');
        
        // Позиция для текста и кнопки редактирования имени
        const playerNameY = height * 0.38;
        
        if (nickname) {
            this.playerNameText = this.add.text(width / 2 - 60, playerNameY, `Игрок: ${nickname}`, {
                fontFamily: 'unutterable',
                fontSize: isMobile ? '20px' : '24px',
                fill: '#ffff88',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            
            // Кнопка редактирования никнейма
            this.editButton = this.add.text(width / 2 + 100, playerNameY, 'ИЗМЕНИТЬ', {
                fontFamily: 'unutterable',
                fontSize: isMobile ? '16px' : '18px',
                fill: '#ffffff',
                backgroundColor: '#555555',
                stroke: '#000000',
                strokeThickness: 2,
                padding: {
                    x: 10,
                    y: 5
                }
            });
            this.editButton.setOrigin(0.5);
            this.editButton.setInteractive();
            
            // Эффекты при наведении на кнопку редактирования
            this.editButton.on('pointerover', () => {
                this.editButton.setStyle({ fill: '#ffff00', backgroundColor: '#777777' });
            });
            
            this.editButton.on('pointerout', () => {
                this.editButton.setStyle({ fill: '#ffffff', backgroundColor: '#555555' });
            });
            
            // Действие при нажатии - переход к экрану ввода имени
            this.editButton.on('pointerdown', () => {
                this.editButton.setStyle({ fill: '#ff8800' });
            });
            
            this.editButton.on('pointerup', () => {
                this.scene.start('NicknameScene');
            });
        }
        
        // Кнопка начала игры
        this.startButton = this.add.text(width / 2, height * 0.57, 'НАЧАТЬ ИГРУ', {
            fontFamily: 'unutterable',
            fontSize: btnFontSize,
            fill: '#ffffff',
            backgroundColor: '#338833',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: 20,
                y: 10
            }
        });
        this.startButton.setOrigin(0.5);
        this.startButton.setInteractive();
        
        // Кнопка лидерборда
        this.leaderboardButton = this.add.text(width / 2, height * 0.75, 'ЛИДЕРБОРД', {
            fontFamily: 'unutterable',
            fontSize: leaderboardFontSize,
            fill: '#ffffff',
            backgroundColor: '#883388',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: 20,
                y: 10
            }
        });
        this.leaderboardButton.setOrigin(0.5);
        this.leaderboardButton.setInteractive();
        
        // Анимация кнопки начала игры при наведении
        this.startButton.on('pointerover', () => {
            this.startButton.setStyle({ fill: '#ffff00', backgroundColor: '#33aa33' });
        });
        this.startButton.on('pointerout', () => {
            this.startButton.setStyle({ fill: '#ffffff', backgroundColor: '#338833' });
        });
        
        // Анимация кнопки лидерборда при наведении
        this.leaderboardButton.on('pointerover', () => {
            this.leaderboardButton.setStyle({ fill: '#ffff00', backgroundColor: '#aa33aa' });
        });
        this.leaderboardButton.on('pointerout', () => {
            this.leaderboardButton.setStyle({ fill: '#ffffff', backgroundColor: '#883388' });
        });
        
        // Запуск игры при нажатии
        this.startButton.on('pointerdown', () => {
            this.startButton.setStyle({ fill: '#ff8800' });
        });
        this.startButton.on('pointerup', () => {
            // Переход к экрану выбора персонажа вместо GameScene
            this.scene.start('CharacterSelectScene');
        });
        
        // Переход к лидерборду при нажатии
        this.leaderboardButton.on('pointerdown', () => {
            this.leaderboardButton.setStyle({ fill: '#ff8800' });
        });
        this.leaderboardButton.on('pointerup', () => {
            this.scene.start('LeaderboardScene');
        });
        
        // Инструкции - всегда отображаем, независимо от высоты экрана
        const instructions = [
            '- Если вы читаете это, то знайте, что я спал по 4 часа в день, пока делал эту игру',
        ];
        
        // Создаем текст с инструкциями
        this.instructionsTexts = [];
        for (let i = 0; i < instructions.length; i++) {
            const text = this.add.text(width / 2, height * 0.9 + i * 30, instructions[i], {
                fontFamily: 'unutterable',
                fontSize: isMobile ? '12px' : '14px',
                fill: '#888888',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            this.instructionsTexts.push(text);
        }
        
        // Анимация названия
        this.tweens.add({
            targets: this.title,
            y: height * 0.25 + 20,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        // Обработка изменения размера экрана
        this.scale.on('resize', this.resizeScene, this);
    }
    
    resizeScene() {
        if (!this.title) return;
        
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
        
        // Обновляем позицию заголовка
        this.title.setPosition(width / 2, height * 0.25);
        
        // Обновляем позицию информации о пользователе
        if (this.playerNameText) {
            this.playerNameText.setPosition(width / 2 - 60, height * 0.38);
        }
        
        if (this.editButton) {
            this.editButton.setPosition(width / 2 + 100, height * 0.38);
        }
        
        // Обновляем позицию кнопок
        if (this.startButton) {
            this.startButton.setPosition(width / 2, height * 0.57);
        }
        
        if (this.leaderboardButton) {
            this.leaderboardButton.setPosition(width / 2, height * 0.75);
        }
        
        // Обновляем позицию инструкций
        if (this.instructionsTexts && this.instructionsTexts.length > 0) {
            this.instructionsTexts.forEach((text, i) => {
                text.setPosition(width / 2, height * 0.9 + i * 30);
            });
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