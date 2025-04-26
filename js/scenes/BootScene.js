class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Создаем текст загрузки
        const loadingText = this.add.text(400, 300, 'Загрузка...', {
            fontFamily: 'unutterable',
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
        this.load.image('background', 'assets/images/background.jpg');
        this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        
        // Создаем текстуру для кнопки программно
        const buttonGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        buttonGraphics.fillStyle(0x222222, 0.8);
        buttonGraphics.fillRoundedRect(0, 0, 100, 100, 16);
        buttonGraphics.lineStyle(2, 0x888888);
        buttonGraphics.strokeRoundedRect(0, 0, 100, 100, 16);
        buttonGraphics.generateTexture('button-bg', 100, 100);
        
        // Создаем текстуры для кнопок стрелок и назад
        const arrowLeftGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        arrowLeftGraphics.fillStyle(0x222222, 0.8);
        arrowLeftGraphics.fillRoundedRect(0, 0, 60, 60, 10);
        arrowLeftGraphics.lineStyle(3, 0xffffff);
        arrowLeftGraphics.lineBetween(40, 10, 20, 30);
        arrowLeftGraphics.lineBetween(20, 30, 40, 50);
        arrowLeftGraphics.generateTexture('btn-left', 60, 60);
        
        const arrowRightGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        arrowRightGraphics.fillStyle(0x222222, 0.8);
        arrowRightGraphics.fillRoundedRect(0, 0, 60, 60, 10);
        arrowRightGraphics.lineStyle(3, 0xffffff);
        arrowRightGraphics.lineBetween(20, 10, 40, 30);
        arrowRightGraphics.lineBetween(40, 30, 20, 50);
        arrowRightGraphics.generateTexture('btn-right', 60, 60);
        
        const backButtonGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        backButtonGraphics.fillStyle(0x222222, 0.8);
        backButtonGraphics.fillRoundedRect(0, 0, 80, 40, 10);
        backButtonGraphics.lineStyle(2, 0xffffff);
        backButtonGraphics.lineBetween(30, 10, 15, 20);
        backButtonGraphics.lineBetween(15, 20, 30, 30);
        backButtonGraphics.lineStyle(2, 0xffffff);
        backButtonGraphics.lineBetween(30, 20, 65, 20);
        backButtonGraphics.generateTexture('btn-back', 80, 40);
        
        // Загрузка Spine-файлов для существ (необходимо для сцены выбора персонажа)
        this.load.spineBinary('halloween-creature', './assets/images/CreatureScene/HalloweenCreature.skel');
        this.load.spineAtlas('halloween-creature-atlas', './assets/images/CreatureScene/HalloweenCreature.atlas');
    }

    create() {
        // После загрузки переходим на стартовую сцену
        this.scene.start('StartScene');
    }
} 