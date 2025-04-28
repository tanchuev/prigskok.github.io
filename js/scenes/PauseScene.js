class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    init(data) {
        this.gameScene = data.gameScene;
        
        // Приостанавливаем музыку при входе в паузу
        window.musicManager.togglePause();
    }

    create() {
        // Получаем размеры игрового окна
        const { width, height } = this.scale.gameSize;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Полупрозрачный черный фон на весь экран
        this.overlay = this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.7);
        
        // Заголовок "Пауза"
        this.add.text(centerX, centerY - 100, 'ПАУЗА', {
            fontFamily: 'unutterable',
            fontSize: '64px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Кнопка "Продолжить"
        const continueButton = this.add.text(centerX, centerY, 'Вернуться', {
            fontFamily: 'unutterable',
            fontSize: '32px',
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
        const menuButton = this.add.text(centerX, centerY + 80, 'Сдаться', {
            fontFamily: 'unutterable',
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#aa3333',
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
            continueButton.setStyle({ color: '#ffff00', backgroundColor: '#33aa33' });
        });
        
        continueButton.on('pointerout', () => {
            continueButton.setStyle({ color: '#ffffff', backgroundColor: '#338833' });
        });
        
        menuButton.on('pointerover', () => {
            menuButton.setStyle({ color: '#ffff00', backgroundColor: '#cc3333' });
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setStyle({ color: '#ffffff', backgroundColor: '#aa3333' });
        });
        
        // Действия при нажатии
        continueButton.on('pointerdown', () => {
            continueButton.setStyle({ color: '#ff8800' });
            // Возобновляем музыку при выходе из паузы
            window.musicManager.togglePause();
            this.scene.resume(this.gameScene);
            this.scene.stop();
        });
        
        menuButton.on('pointerdown', () => {
            menuButton.setStyle({ color: '#ff8800' });
            // Возобновляем музыку при возврате в главное меню
            window.musicManager.togglePause();
            this.scene.stop(this.gameScene);
            this.scene.stop();
            this.scene.start('StartScene');
        });
        
        // Возобновление игры при нажатии Esc
        this.input.keyboard.on('keydown-ESC', () => {
            // Возобновляем музыку при выходе из паузы
            window.musicManager.togglePause();
            this.scene.resume(this.gameScene);
            this.scene.stop();
        });
        
        // Обработка изменения размера окна
        this.scale.on('resize', this.resize, this);
    }
    
    resize() {
        // Получаем новые размеры игрового окна
        const { width, height } = this.scale.gameSize;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Обновляем размер и позицию оверлея
        if (this.overlay) {
            this.overlay.setSize(width, height);
            this.overlay.setPosition(centerX, centerY);
        }
    }
} 