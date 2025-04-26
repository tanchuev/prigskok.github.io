class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    init(data) {
        this.gameScene = data.gameScene;
    }

    create() {
        // Полупрозрачный черный фон
        this.overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        
        // Заголовок "Пауза"
        this.add.text(400, 200, 'ПАУЗА', {
            fontFamily: 'unutterable',
            fontSize: '64px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Кнопка "Продолжить"
        const continueButton = this.add.text(400, 300, 'Продолжить', {
            fontFamily: 'unutterable',
            fontSize: '32px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: 20,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        
        // Кнопка "Главное меню"
        const menuButton = this.add.text(400, 380, 'Главное меню', {
            fontFamily: 'unutterable',
            fontSize: '32px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: 20,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        
        // Эффекты при наведении
        continueButton.on('pointerover', () => {
            continueButton.setStyle({ color: '#ffff00' });
        });
        
        continueButton.on('pointerout', () => {
            continueButton.setStyle({ color: '#ffffff' });
        });
        
        menuButton.on('pointerover', () => {
            menuButton.setStyle({ color: '#ffff00' });
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setStyle({ color: '#ffffff' });
        });
        
        // Действия при нажатии
        continueButton.on('pointerdown', () => {
            this.scene.resume(this.gameScene);
            this.scene.stop();
        });
        
        menuButton.on('pointerdown', () => {
            this.scene.stop(this.gameScene);
            this.scene.stop();
            this.scene.start('StartScene');
        });
        
        // Возобновление игры при нажатии Esc
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.resume(this.gameScene);
            this.scene.stop();
        });
    }
} 