// Конфигурация игры
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    // Добавляем плагин Spine
    plugins: {
        scene: [
            {
                key: 'spine.SpinePlugin',
                plugin: window.SpinePlugin,
                mapping: 'spine'
            }
        ]
    },
    scene: [BootScene, StartScene, GameScene, CreatureScene]
};

// Создание игры
const game = new Phaser.Game(config);

// Глобальные переменные
let player;
let platforms;
let cursors;
let gameOver = false;
let score = 0;
let highestPlatform = 0;
let floodLevel = 0;
let floodSpeed = 0.2;

// Загрузка ресурсов
function preload() {
    // Временные ресурсы для прототипа
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    
    // Для полноценной игры будем использовать собственные ассеты
}

// Создание игровых объектов
function create() {
    // Фон
    this.add.image(400, 300, 'sky');
    
    // Платформы
    platforms = this.physics.add.staticGroup();
    
    // Создаем начальную платформу
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    
    // Создаем несколько платформ
    platforms.create(600, 450, 'ground');
    platforms.create(50, 350, 'ground');
    platforms.create(750, 250, 'ground');
    platforms.create(400, 150, 'ground');
    
    // Создаем игрока
    player = this.physics.add.sprite(400, 450, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    // Создаем управление
    cursors = this.input.keyboard.createCursorKeys();
    
    // Создаем коллизию между игроком и платформами
    this.physics.add.collider(player, platforms);
    
    // Счет
    this.scoreText = this.add.text(16, 16, 'Высота: 0', { fontSize: '32px', fill: '#fff' });
    
    // Уровень затопления
    this.floodRect = this.add.rectangle(400, 600, 800, 10, 0x0000ff);
}

// Обновление игры
function update() {
    if (gameOver) {
        return;
    }
    
    // Обновляем счет в зависимости от высоты
    const playerHeight = 600 - player.y;
    score = Math.max(score, Math.floor(playerHeight));
    this.scoreText.setText('Высота: ' + score);
    
    // Базовое управление
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }
    
    // Прыжок
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-350);
    }
    
    // Проверка проигрыша (если игрок падает ниже затопления)
    if (player.y > 600 - this.floodRect.height) {
        this.physics.pause();
        player.setTint(0xff0000);
        gameOver = true;
        this.add.text(400, 300, 'Игра окончена', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 350, 'Нажмите F5 для перезапуска', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
    }
    
    // Медленно поднимаем уровень затопления
    floodLevel += floodSpeed;
    this.floodRect.height = floodLevel;
    this.floodRect.y = 600 - floodLevel / 2;
} 