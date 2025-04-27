class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        // Инициализация и запуск фоновой музыки через менеджер
        window.musicManager.init(this);
        window.musicManager.playMusic('main_theme');
        
        // Фон
        this.add.image(400, 300, 'background');
        
        // Заголовок игры
        const title = this.add.text(400, 150, 'ПРЫГ-СКОК', {
            fontFamily: 'unutterable',
            fontSize: '64px',
            fill: '#8B0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);
        
        // Кнопка начала игры
        const startButton = this.add.text(400, 350, 'НАЧАТЬ ИГРУ', {
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
        
        // Анимация кнопки при наведении
        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#ffff00', backgroundColor: '#33aa33' });
        });
        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#ffffff', backgroundColor: '#338833' });
        });
        
        // Запуск игры при нажатии
        startButton.on('pointerdown', () => {
            startButton.setStyle({ fill: '#ff8800' });
        });
        startButton.on('pointerup', () => {
            // Переход к экрану выбора персонажа вместо GameScene
            this.scene.start('CharacterSelectScene');
        });
        
        // Кнопка для показа существ - скрыта
        const creaturesButton = this.add.text(400, 390, 'Хэллоуинские Существа', {
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
            'Управление:',
            '- На компьютере: используйте стрелки для движения',
            '- На мобильных: нажимайте на левую/правую/верхнюю части экрана',
            'Цель: поднимайтесь как можно выше, избегая затопления'
        ];
        
        // Создаем текст с инструкциями
        for (let i = 0; i < instructions.length; i++) {
            this.add.text(400, 470 + i * 30, instructions[i], {
                fontFamily: 'unutterable',
                fontSize: '18px',
                fill: '#888888',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
        }
        
        // Анимация названия
        this.tweens.add({
            targets: title,
            y: 170,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
} 