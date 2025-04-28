// Конфигурация игры
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
        // Расширяем конфигурацию скейлинга
        fullscreenTarget: 'game-container',
        expandParent: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    input: {
        activePointers: 3, // Увеличиваем количество активных указателей для мультитача
        smoothFactor: 0.2, // Добавляем сглаживание для лучшего контроля
    },
    plugins: {
        scene: [
            { key: 'spine.SpinePlugin', plugin: spine.SpinePlugin, mapping: 'spine' }
        ]
    },
    dom: {
        createContainer: true
    },
    scene: [BootScene, NicknameScene, StartScene, CharacterSelectScene, GameScene, PauseScene, GameOverScene, CreatureScene, LeaderboardScene]
};

// Проверка инициализации spine плагина
if (typeof spine === 'undefined' || typeof spine.SpinePlugin === 'undefined') {
    console.error('Spine плагин не загружен! Проверьте подключение spine-phaser-v3.js в index.html');
} else {
    console.log('Spine плагин готов к использованию');
}

// Определение типа устройства
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Глобальные переменные
window.GAME_CONFIG = {
    isMobile: isMobile,
    defaultWidth: 800,
    defaultHeight: 600,
    joystickRadius: 60,
    isFullscreen: false,
    // Добавляем функции для работы с полноэкранным режимом
    toggleFullscreen: function(game) {
        if (document.fullscreenElement || 
            document.webkitFullscreenElement || 
            document.mozFullScreenElement || 
            document.msFullscreenElement) {
            // Выход из полноэкранного режима
            window.GAME_CONFIG.isFullscreen = false;
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } else {
            // Вход в полноэкранный режим
            window.GAME_CONFIG.isFullscreen = true;
            game.scale.startFullscreen();
        }
    }
};

// Создание игры
const game = new Phaser.Game(config);

// Добавляем обработчик загрузки для автоматического запуска полноэкранного режима на мобильных устройствах
document.addEventListener('DOMContentLoaded', function() {
    // Обработчики событий полноэкранного режима
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Добавляем кнопку полноэкранного режима
    const fullscreenButton = document.createElement('button');
    fullscreenButton.id = 'fullscreen-button';
    fullscreenButton.innerHTML = '⛶';
    fullscreenButton.style.position = 'absolute';
    fullscreenButton.style.zIndex = '1000';
    fullscreenButton.style.top = '10px';
    fullscreenButton.style.right = '10px';
    fullscreenButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    fullscreenButton.style.color = 'white';
    fullscreenButton.style.border = 'none';
    fullscreenButton.style.borderRadius = '5px';
    fullscreenButton.style.padding = '5px 10px';
    fullscreenButton.style.fontSize = '20px';
    fullscreenButton.style.cursor = 'pointer';
    fullscreenButton.style.display = 'block';
    fullscreenButton.onclick = function() {
        window.GAME_CONFIG.toggleFullscreen(game);
    };
    document.getElementById('game-container').appendChild(fullscreenButton);
    
    // Автоматический переход в полноэкранный режим на мобильных устройствах
    if (isMobile) {
        document.body.addEventListener('touchstart', function() {
            if (!window.GAME_CONFIG.isFullscreen) {
                window.GAME_CONFIG.toggleFullscreen(game);
            }
        }, { once: true });
    }
});

// Обработчик изменения состояния полноэкранного режима
function handleFullscreenChange() {
    const isFullscreen = !!(document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement);
    
    window.GAME_CONFIG.isFullscreen = isFullscreen;
    const fullscreenButton = document.getElementById('fullscreen-button');
    
    if (fullscreenButton) {
        fullscreenButton.innerHTML = isFullscreen ? '⮌' : '⛶';
    }
    
    // Обновляем размер игры с учетом панелей браузера
    if (game && game.scale) {
        console.log('Обновление размеров при изменении полноэкранного режима');
        game.scale.refresh();
    }
}

// Глобальные переменные для игры
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
    this.scoreText = this.add.text(16, 16, 'Высота: 0', { fontFamily: 'unutterable', fontSize: '32px', fill: '#fff' });
    
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
        this.add.text(400, 300, 'Игра окончена', { fontFamily: 'unutterable', fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 350, 'Нажмите F5 для перезапуска', { fontFamily: 'unutterable', fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
    }
    
    // Медленно поднимаем уровень затопления
    floodLevel += floodSpeed;
    this.floodRect.height = floodLevel;
    this.floodRect.y = 600 - floodLevel / 2;
} 