class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        // Получаем набранный счет из GameScene
        this.score = data.score || 0;
    }

    create() {
        // Фон
        this.add.image(400, 300, 'background');
        
        // Заголовок "Игра окончена"
        this.add.text(400, 150, 'ИГРА ОКОНЧЕНА', {
            fontFamily: 'unutterable',
            fontSize: '64px',
            color: '#ff0000',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Отображаем счет
        this.add.text(400, 250, `Предел твоих возможностей: ${this.score}`, {
            fontFamily: 'unutterable',
            fontSize: '32px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
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
        
        // Кнопка "Главное меню"
        const menuButton = this.add.text(400, 430, 'Я не могу больше :(', {
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
        
        menuButton.on('pointerdown', () => {
            menuButton.setStyle({ color: '#ff8800' });
            this.scene.start('StartScene');
        });
    }
} 