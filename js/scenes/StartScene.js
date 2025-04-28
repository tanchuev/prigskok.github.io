class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        // Инициализация и запуск фоновой музыки через менеджер
        window.musicManager.init(this);
        window.musicManager.playMusic('main_theme');
        
        // Фон
        this.add.image(400, 640, 'background');
        
        // Заголовок игры
        const title = this.add.text(400, 300, 'ПРЫГ-СКОК', {
            fontFamily: 'unutterable',
            fontSize: '64px',
            fill: '#8B0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);
        
        // Отображаем имя игрока, если оно есть
        const nickname = this.getCookie('playerNickname');
        if (nickname) {
            this.add.text(350, 400, `Игрок: ${nickname}`, {
                fontFamily: 'unutterable',
                fontSize: '24px',
                fill: '#ffff88',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5, 0.5);
            
            // Кнопка редактирования никнейма
            const editButton = this.add.text(480, 400, 'ИЗМЕНИТЬ', {
                fontFamily: 'unutterable',
                fontSize: '18px',
                fill: '#ffffff',
                backgroundColor: '#555555',
                stroke: '#000000',
                strokeThickness: 2,
                padding: {
                    x: 10,
                    y: 5
                }
            });
            editButton.setOrigin(0, 0.5);
            editButton.setInteractive();
            
            // Эффекты при наведении на кнопку редактирования
            editButton.on('pointerover', () => {
                editButton.setStyle({ fill: '#ffff00', backgroundColor: '#777777' });
            });
            
            editButton.on('pointerout', () => {
                editButton.setStyle({ fill: '#ffffff', backgroundColor: '#555555' });
            });
            
            // Действие при нажатии - переход к экрану ввода имени
            editButton.on('pointerdown', () => {
                editButton.setStyle({ fill: '#ff8800' });
            });
            
            editButton.on('pointerup', () => {
                this.scene.start('NicknameScene');
            });
        }
        
        // Кнопка начала игры
        const startButton = this.add.text(400, 550, 'НАЧАТЬ ИГРУ', {
            fontFamily: 'unutterable',
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#338833',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: 20,
                y: 10
            }
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive();
        
        // Кнопка лидерборда
        const leaderboardButton = this.add.text(400, 650, 'ЛИДЕРБОРД', {
            fontFamily: 'unutterable',
            fontSize: '28px',
            fill: '#ffffff',
            backgroundColor: '#883388',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: 20,
                y: 10
            }
        });
        leaderboardButton.setOrigin(0.5);
        leaderboardButton.setInteractive();
        
        // Анимация кнопки начала игры при наведении
        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#ffff00', backgroundColor: '#33aa33' });
        });
        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#ffffff', backgroundColor: '#338833' });
        });
        
        // Анимация кнопки лидерборда при наведении
        leaderboardButton.on('pointerover', () => {
            leaderboardButton.setStyle({ fill: '#ffff00', backgroundColor: '#aa33aa' });
        });
        leaderboardButton.on('pointerout', () => {
            leaderboardButton.setStyle({ fill: '#ffffff', backgroundColor: '#883388' });
        });
        
        // Запуск игры при нажатии
        startButton.on('pointerdown', () => {
            startButton.setStyle({ fill: '#ff8800' });
        });
        startButton.on('pointerup', () => {
            // Переход к экрану выбора персонажа вместо GameScene
            this.scene.start('CharacterSelectScene');
        });
        
        // Переход к лидерборду при нажатии
        leaderboardButton.on('pointerdown', () => {
            leaderboardButton.setStyle({ fill: '#ff8800' });
        });
        leaderboardButton.on('pointerup', () => {
            this.scene.start('LeaderboardScene');
        });
        
        // Кнопка для показа существ - скрыта
        const creaturesButton = this.add.text(400, 750, 'Хэллоуинские Существа', {
            fontFamily: 'unutterable',
            fontSize: '26px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            padding: {
                x: 20,
                y: 10
            }
        });
        creaturesButton.setOrigin(0.5);
        creaturesButton.setVisible(false); // Скрываем кнопку
        
        // Инструкции
        const instructions = [
            '- Если вы читаете это, то знайте, что я спал по 4 часа в день, пока делал эту игру',
        ];
        
        // Создаем текст с инструкциями
        for (let i = 0; i < instructions.length; i++) {
            this.add.text(400, 950 + i * 30, instructions[i], {
                fontFamily: 'unutterable',
                fontSize: '14px',
                fill: '#888888',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
        }
        
        // Анимация названия
        this.tweens.add({
            targets: title,
            y: 320,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
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