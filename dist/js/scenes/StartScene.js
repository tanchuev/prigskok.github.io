class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        // Фон
        this.add.image(400, 300, 'sky');
        
        // Заголовок игры
        const title = this.add.text(400, 150, 'ПРЫГ-СКОК', {
            fontSize: '64px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);
        
        // Подзаголовок
        const subtitle = this.add.text(400, 230, 'Командная Высота', {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        subtitle.setOrigin(0.5);
        
        // Кнопка начала игры
        const startButton = this.add.text(400, 330, 'Начать игру', {
            fontSize: '36px',
            fill: '#ffffff',
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
            startButton.setStyle({ fill: '#ff8800' });
        });
        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#ffffff' });
        });
        
        // Запуск игры при нажатии
        startButton.on('pointerdown', () => {
            startButton.setStyle({ fill: '#ff0000' });
        });
        startButton.on('pointerup', () => {
            this.scene.start('GameScene');
        });
        
        // Кнопка для просмотра персонажей
        const creaturesButton = this.add.text(400, 400, 'Персонажи Spine', {
            fontSize: '28px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            padding: {
                x: 15,
                y: 8
            }
        });
        creaturesButton.setOrigin(0.5);
        creaturesButton.setInteractive();
        
        // Анимация кнопки персонажей при наведении
        creaturesButton.on('pointerover', () => {
            creaturesButton.setStyle({ fill: '#00ff88' });
        });
        creaturesButton.on('pointerout', () => {
            creaturesButton.setStyle({ fill: '#ffffff' });
        });
        
        // Запуск сцены с персонажами при нажатии
        creaturesButton.on('pointerdown', () => {
            creaturesButton.setStyle({ fill: '#00aaff' });
        });
        creaturesButton.on('pointerup', () => {
            this.scene.start('CreatureScene');
        });
        
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
                fontSize: '18px',
                fill: '#ffffff',
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