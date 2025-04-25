class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Создаем текст загрузки
        const loadingText = this.add.text(400, 300, 'Загрузка...', {
            fontSize: '32px',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5);
        
        // Создаем индикатор загрузки
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 320, 320, 50);
        
        // Отображаем прогресс загрузки
        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 330, 300 * value, 30);
        });
        
        // Когда все ресурсы загружены, удаляем индикатор
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
        
        // Загрузка ресурсов (в дальнейшем будет больше)
        this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
        this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    }

    create() {
        // После загрузки переходим на стартовую сцену
        this.scene.start('StartScene');
    }
} 