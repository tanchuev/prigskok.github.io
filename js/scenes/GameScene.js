class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        // Инициализация переменных
        this.gameOver = false;
        this.score = 0;
        this.platformYMin = 60;  // Минимальное расстояние по Y между платформами (было 80)
        this.platformYMax = 100; // Максимальное расстояние по Y между платформами (было 120)
        this.platformXMin = 50;  // Минимальное расстояние платформы от края
        this.floodHeight = 0;    // Высота затопления
        this.floodSpeed = 0.2;   // Скорость затопления
        this.lastPlatformY = 600; // Начальная высота для платформ
        this.jumpVelocity = -350;
        this.cameraYMin = 99999;
        
        // Параметры для платформ
        this.platformWidth = 96;
        this.platformHeight = 20; // Уменьшаем высоту с 32 до 20
        
        // Разные типы платформ
        this.platformTypes = {
            normal: { chance: 60 }, // Обычная платформа
            fragile: { chance: 15 }, // Хрупкая платформа
            slippery: { chance: 15 }, // Скользкая платформа
            vanishing: { chance: 10 }  // Исчезающая платформа
        };
        
        // Мобильное управление
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        this.superJumpPressed = false;
        
        // Счетчик для отслеживания времени игры
        this.gameTime = 0;
    }

    preload() {
        // Временные ресурсы для прототипа
        this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
        this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        
        // Загрузка звуковых файлов
        this.load.audio('jump', 'assets/sounds/jump.mp3');
        this.load.audio('score', 'assets/sounds/score.mp3');
        this.load.audio('gameover', 'assets/sounds/gameover.mp3');
        this.load.audio('powerup', 'assets/sounds/powerup.mp3');
        this.load.audio('platform', 'assets/sounds/platform.mp3');
        this.load.audio('doubleJump', 'assets/sounds/doublejump.mp3');
        this.load.audio('splash', 'assets/sounds/splash.mp3');
        
        // Создаем текстуры для платформ разных типов
        this.createPlatformTextures();
    }

    // Создаем текстуры для платформ разных типов
    createPlatformTextures() {
        // Создаем более заметные текстуры для платформ
        const graphics = this.make.graphics();
        
        // Текстура для обычной платформы (зеленая)
        graphics.clear();
        graphics.lineStyle(2, 0x000000);
        graphics.fillStyle(0x4de94c);
        graphics.fillRect(0, 0, 96, 20); // Уменьшаем высоту с 32 до 20
        graphics.strokeRect(0, 0, 96, 20);
        graphics.generateTexture('platform_normal', 96, 20);
        
        // Текстура для хрупкой платформы (оранжевая)
        graphics.clear();
        graphics.lineStyle(2, 0x000000);
        graphics.fillStyle(0xe9a74d);
        graphics.fillRect(0, 0, 96, 20);
        graphics.strokeRect(0, 0, 96, 20);
        graphics.generateTexture('platform_fragile', 96, 20);
        
        // Текстура для скользкой платформы (голубая)
        graphics.clear();
        graphics.lineStyle(2, 0x000000);
        graphics.fillStyle(0x4de9e7);
        graphics.fillRect(0, 0, 96, 20);
        graphics.strokeRect(0, 0, 96, 20);
        graphics.generateTexture('platform_slippery', 96, 20);
        
        // Текстура для исчезающей платформы (розовая)
        graphics.clear();
        graphics.lineStyle(2, 0x000000);
        graphics.fillStyle(0xe94d9d);
        graphics.fillRect(0, 0, 96, 20);
        graphics.strokeRect(0, 0, 96, 20);
        graphics.generateTexture('platform_vanishing', 96, 20);
    }

    create() {
        // Фоновое изображение
        this.bg = this.add.tileSprite(400, 300, 800, 600, 'background');
        this.bg.setScrollFactor(0);
        
        // Звуки
        this.jumpSound = this.sound.add('jump');
        this.platformSound = this.sound.add('platform');
        this.scoreSound = this.sound.add('score');
        this.gameOverSound = this.sound.add('gameover');
        this.powerupSound = this.sound.add('powerup');
        
        // Переменные для отслеживания состояния игры
        this.score = 0;
        this.gameTime = 0;
        this.gameOver = false;
        this.respawnCount = 0;
        this.difficulty = 1; // Начальная сложность
        this.lastDifficultyIncrease = 0; // Время последнего увеличения сложности
        
        // Создаем группы для различных типов платформ
        this.allPlatforms = [];
        this.platforms = this.physics.add.group();
        this.allPlatforms.push(this.platforms);
        
        this.movingPlatforms = this.physics.add.group();
        this.allPlatforms.push(this.movingPlatforms);
        
        this.disappearingPlatforms = this.physics.add.group();
        this.allPlatforms.push(this.disappearingPlatforms);
        
        this.bouncyPlatforms = this.physics.add.group();
        this.allPlatforms.push(this.bouncyPlatforms);
        
        // Создаем игрока
        this.player = this.physics.add.sprite(400, 500, 'player');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        
        // Создаем способности игрока
        this.playerAbilities = new PlayerAbilities(this);
        
        // Менеджер бонусов
        this.powerupManager = new PowerupManager(this);
        
        // Создаем начальные платформы
        this.lastPlatformY = 550;
        this.generateInitialPlatforms();
        
        // Создаем вертикальные стены для ограничения игрока
        this.walls = this.physics.add.group();
        const leftWall = this.physics.add.sprite(0, 300, 'wall');
        leftWall.setImmovable(true);
        leftWall.displayWidth = 10;
        leftWall.displayHeight = 2000;
        leftWall.setVisible(false);
        
        const rightWall = this.physics.add.sprite(800, 300, 'wall');
        rightWall.setImmovable(true);
        rightWall.displayWidth = 10;
        rightWall.displayHeight = 2000;
        rightWall.setVisible(false);
        
        this.walls.add(leftWall);
        this.walls.add(rightWall);
        
        // Коллизии
        this.physics.add.collider(this.player, this.walls);
        
        // Добавляем коллизии для всех типов платформ
        this.allPlatforms.forEach(platformGroup => {
            this.physics.add.collider(this.player, platformGroup, this.handlePlatformCollision, null, this);
        });
        
        // Создаем анимации для игрока
        this.createPlayerAnimations();
        
        // Обработка клавиатуры
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Настраиваем камеру для следования за игроком вверх
        this.cameras.main.setBounds(0, -10000, 800, 20000);
        this.cameraYMin = 99999;
        
        // Создаем текст для отображения счета
        this.scoreText = this.add.text(16, 16, 'Высота: 0', {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3
        }).setScrollFactor(0);
        
        // Добавляем затопление
        this.flood = this.add.rectangle(400, 1000, 800, 200, 0x0000ff, 0.5);
        this.flood.setAlpha(0.7);
        this.floodSpeed = 10;
        this.floodStartY = 1000;
        
        // Создаем частицы для визуальных эффектов
        this.particles = this.add.particles('particle');
        
        // Настраиваем физику мира
        this.physics.world.setBounds(0, -10000, 800, 20000);
        
        // Обновляем состояния игрока
        this.playerState = {
            jumps: 0,
            maxJumps: 1,
            canDoubleJump: false
        };
        
        // Создание игрового мира
        this.createWorld();
        
        // Создание игрока
        this.createPlayer();
        
        // Настройка столкновений
        this.setupCollisions();
        
        // Создание интерфейса
        this.createUI();
        
        // Инициализация визуальных эффектов
        this.createVisualEffects();
    }

    setupCollisions() {
        // Коллизия с обычными платформами
        this.physics.add.collider(this.player, this.platforms);
        
        // Коллизия с движущимися платформами
        this.physics.add.collider(this.player, this.movingPlatforms);
        
        // Коллизия с исчезающими платформами
        this.physics.add.collider(this.player, this.disappearingPlatforms, (player, platform) => {
            if (player.body.touching.down) {
                this.tweens.add({
                    targets: platform,
                    alpha: 0,
                    y: platform.y + 10,
                    ease: 'Power1',
                    duration: 200,
                    onComplete: () => {
                        platform.destroy();
                    }
                });
            }
        });
        
        // Коллизия с пружинными платформами
        this.physics.add.collider(this.player, this.bouncyPlatforms, (player, platform) => {
            if (player.body.touching.down) {
                player.setVelocityY(-1000); // Сильный прыжок
                
                // Эффект сжатия и растяжения пружинной платформы
                this.tweens.add({
                    targets: platform,
                    scaleY: 0.7,
                    duration: 100,
                    yoyo: true
                });
                
                // Звук пружины
                if (this.bouncySound) {
                    this.bouncySound.play();
                }
            }
        });
    }

    setupCamera() {
        // Увеличиваем границы камеры для бесконечного подъема
        this.cameras.main.setBounds(0, -95000, 800, 100000);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        this.cameras.main.setDeadzone(400, 200);
    }

    update(time, delta) {
        if (this.gameOver) {
            return;
        }
        
        // Увеличиваем время игры
        this.gameTime += delta / 1000;
        
        // Обновляем сложность каждые 30 секунд
        if (this.gameTime - this.lastDifficultyIncrease > 30) {
            this.difficulty += 0.5;
            this.lastDifficultyIncrease = this.gameTime;
            
            // Оповещение о повышении сложности
            const diffText = this.add.text(400, this.cameras.main.scrollY + 200, 'Сложность повышена!', {
                fontSize: '32px',
                fill: '#ff0000',
                stroke: '#000',
                strokeThickness: 5
            }).setOrigin(0.5);
            
            // Анимированное исчезновение текста
            this.tweens.add({
                targets: diffText,
                alpha: 0,
                y: diffText.y - 50,
                duration: 2000,
                onComplete: () => diffText.destroy()
            });
        }
        
        // Обновляем уровень затопления
        this.updateFloodLevel();
        
        // Управление игроком
        this.handlePlayerMovement();
        
        // Определяем скорость подъема камеры
        const prevCameraY = this.cameras.main.scrollY;
        
        // Камера следует за игроком, только когда он движется вверх
        if (this.player.y < this.cameraYMin) {
            this.cameraYMin = this.player.y;
            this.cameras.main.scrollY = this.player.y - 300;
        }
        
        // Рассчитываем, как быстро поднимается камера
        const cameraRise = prevCameraY - this.cameras.main.scrollY;
        
        // Обновляем фон
        this.bg.tilePositionY -= cameraRise * 0.5;
        
        // Если игрок ниже зоны видимости, завершаем игру
        if (this.player.y > this.cameras.main.scrollY + 650) {
            this.gameOver = true;
            this.showGameOver();
            return;
        }
        
        // Если игрок коснулся воды, завершаем игру
        if (this.player.y > this.flood.y - 30) {
            this.gameOver = true;
            this.showGameOver();
            return;
        }
        
        // Обновляем отображение счета
        this.score = Math.max(this.score, Math.floor((600 - this.player.y) / 10));
        this.scoreText.setText(`Высота: ${this.score}`);
        
        // Генерируем новые платформы
        if (
            (cameraRise > 5) || // Если камера быстро поднимается
            (this.player.y < this.lastPlatformY - (250 - this.difficulty * 15)) // Регулируем расстояние между платформами
        ) {
            this.generatePlatform(this.player.y - 400);
            
            // С увеличением сложности повышаем шанс появления сложных платформ
            if (Math.random() < 0.3 + (this.difficulty * 0.05)) {
                this.generateSpecialPlatform(this.player.y - 400);
            }
        }
        
        // Обновляем движущиеся платформы
        this.updateMovingPlatforms();
        
        // Удаляем платформы, которые далеко внизу
        this.cleanupPlatforms();
        
        // Обновляем индикатор уровня затопления
        this.updateFloodIndicator();
        
        // Обновляем визуальные эффекты воды
        this.updateWaterEffects();
    }

    playerHitPlatform(player, platform) {
        // Обработка столкновения с разными типами платформ
        
        // Хрупкие платформы
        if (platform.texture.key === 'platform_fragile' && player.body.touching.down) {
            // Если игрок стоит на хрупкой платформе, запускаем таймер разрушения
            if (!platform.isBreaking) {
                platform.isBreaking = true;
                
                // Добавляем визуальный эффект
                platform.setTint(0xff8888);
                
                // Запускаем таймер разрушения
                this.time.delayedCall(1500, () => {
                    platform.body.enable = false;
                    
                    // Анимация разрушения
                    this.tweens.add({
                        targets: platform,
                        alpha: 0,
                        y: platform.y + 20,
                        duration: 300,
                        onComplete: () => {
                            platform.destroy();
                        }
                    });
                });
            }
        }
        
        // Скользкие платформы
        if (platform.texture.key === 'platform_slippery' && player.body.touching.down) {
            // Снижаем трение на скользких платформах
            player.body.friction.x = 0.05;
        } else if (player.body.touching.down) {
            // Возвращаем нормальное трение на других платформах
            player.body.friction.x = 1;
        }
        
        // Исчезающие платформы
        if (platform.texture.key === 'platform_vanishing' && player.body.touching.down) {
            if (!platform.isVanishing) {
                platform.isVanishing = true;
                
                // Мигание перед исчезновением
                this.tweens.add({
                    targets: platform,
                    alpha: 0.2,
                    yoyo: true,
                    repeat: 3,
                    duration: 150,
                    onComplete: () => {
                        // Исчезновение
                        platform.body.enable = false;
                        platform.alpha = 0;
                        
                        // Возвращение через некоторое время
                        this.time.delayedCall(3000, () => {
                            platform.body.enable = true;
                            platform.alpha = 1;
                            platform.isVanishing = false;
                        });
                    }
                });
            }
        }
    }

    createUI() {
        // Счет
        this.scoreText = this.add.text(16, 16, 'Счет: 0', { 
            fontSize: '24px', 
            fill: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setScrollFactor(0);
        
        // Индикатор уровня затопления
        this.floodIndicator = this.add.graphics().setScrollFactor(0);
        this.updateFloodIndicator();
        
        // Индикатор сложности
        this.difficultyText = this.add.text(16, 50, 'Уровень: 1', { 
            fontSize: '20px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        }).setScrollFactor(0);
    }

    createMobileControls() {
        // Определяем, запущена ли игра на мобильном устройстве
        if (!this.sys.game.device.os.desktop) {
            // Создаем левую и правую зоны нажатия
            const leftZone = this.add.zone(150, 400, 200, 400);
            leftZone.setScrollFactor(0);
            leftZone.setInteractive();
            leftZone.on('pointerdown', () => {
                this.leftPressed = true;
            });
            leftZone.on('pointerup', () => {
                this.leftPressed = false;
            });
            
            const rightZone = this.add.zone(650, 400, 200, 400);
            rightZone.setScrollFactor(0);
            rightZone.setInteractive();
            rightZone.on('pointerdown', () => {
                this.rightPressed = true;
            });
            rightZone.on('pointerup', () => {
                this.rightPressed = false;
            });
            
            // Зона для прыжка (верхняя часть экрана)
            const jumpZone = this.add.zone(400, 200, 800, 300);
            jumpZone.setScrollFactor(0);
            jumpZone.setInteractive();
            jumpZone.on('pointerdown', () => {
                this.jumpPressed = true;
            });
            jumpZone.on('pointerup', () => {
                this.jumpPressed = false;
            });
            
            // Зона для супер-прыжка (внизу экрана)
            const superJumpZone = this.add.zone(400, 500, 200, 100);
            superJumpZone.setScrollFactor(0);
            superJumpZone.setInteractive();
            superJumpZone.on('pointerdown', () => {
                this.superJumpPressed = true;
                this.playerAbilities.handleSuperJump();
            });
            superJumpZone.on('pointerup', () => {
                this.superJumpPressed = false;
                // Определяем направление
                let direction = null;
                if (this.leftPressed) direction = 'left';
                if (this.rightPressed) direction = 'right';
                this.playerAbilities.handleSuperJumpRelease(direction);
            });
            
            // Визуализация зон управления (для отладки)
            /*
            const graphics = this.add.graphics();
            graphics.lineStyle(2, 0xffff00);
            graphics.strokeRect(leftZone.x - leftZone.width/2, leftZone.y - leftZone.height/2, leftZone.width, leftZone.height);
            graphics.strokeRect(rightZone.x - rightZone.width/2, rightZone.y - rightZone.height/2, rightZone.width, rightZone.height);
            graphics.strokeRect(jumpZone.x - jumpZone.width/2, jumpZone.y - jumpZone.height/2, jumpZone.width, jumpZone.height);
            graphics.setScrollFactor(0);
            */
        } else {
            // Для ПК добавляем обработку клавиши для супер-прыжка
            this.input.keyboard.on('keydown-SHIFT', () => {
                this.superJumpPressed = true;
                this.playerAbilities.handleSuperJump();
            });
            
            this.input.keyboard.on('keyup-SHIFT', () => {
                this.superJumpPressed = false;
                // Определяем направление
                let direction = null;
                if (this.cursors.left.isDown) direction = 'left';
                if (this.cursors.right.isDown) direction = 'right';
                this.playerAbilities.handleSuperJumpRelease(direction);
            });
        }
    }

    playerMovement() {
        // Проверяем, находится ли игрок на земле
        const onGround = this.player.body.touching.down;
        
        // Движение влево-вправо через клавиатуру или мобильное управление
        if (this.cursors.left.isDown || this.leftPressed) {
            // Учитываем множитель скорости от бонуса
            const speedMultiplier = this.player.speedMultiplier || 1;
            this.player.setVelocityX(-160 * speedMultiplier);
        } else if (this.cursors.right.isDown || this.rightPressed) {
            // Учитываем множитель скорости от бонуса
            const speedMultiplier = this.player.speedMultiplier || 1;
            this.player.setVelocityX(160 * speedMultiplier);
        } else {
            // Если игрок на скользкой платформе, не останавливаем его полностью
            if (this.player.body.friction && this.player.body.friction.x < 0.2) {
                this.player.setVelocityX(this.player.body.velocity.x * 0.95);
            } else {
                this.player.setVelocityX(0);
            }
        }
        
        // Обработка прыжка через систему способностей
        if ((this.cursors.up.isDown || this.jumpPressed) && !this.superJumpPressed) {
            // Пытаемся выполнить прыжок через систему способностей
            if (this.playerAbilities.handleJump()) {
                this.jumpPressed = false; // Сбрасываем флаг для мобильного управления
            }
        }
    }

    generatePlatforms(startY) {
        // Генерация платформ от startY и выше
        let y = startY;
        
        // Генерируем фиксированное количество платформ вверх от startY
        const platformRows = 12; // Меньше рядов, но с большим расстоянием
        
        // Максимальная высота прыжка игрока (для расчета достижимости)
        const maxJumpHeight = 150;
        // Максимальное горизонтальное расстояние прыжка
        const maxJumpWidth = 200;
        // Минимальное горизонтальное расстояние между платформами
        const minHorizDistance = 120;
        // Минимальное смещение по X для платформ на разных уровнях (избегаем вертикального выравнивания)
        const minVerticalOffset = 70;
        
        // Массив для хранения сгенерированных платформ
        const generatedPlatforms = [];
        
        // Добавляем начальную платформу в массив
        generatedPlatforms.push({
            x: 400,
            y: startY,
            width: this.platformWidth * 2.5,
            type: 'normal'
        });
        
        // Создаем зоны экрана для более случайного распределения платформ
        const zones = [
            { x: 0, y: 0, width: 266, height: 800 },      // левая треть
            { x: 267, y: 0, width: 266, height: 800 },    // центральная треть
            { x: 534, y: 0, width: 266, height: 800 }     // правая треть
        ];
        
        // Увеличиваем диапазон высот между платформами
        this.platformYMin = 80;
        this.platformYMax = 120;
        
        // Предыдущие использованные зоны, чтобы не создавать платформы в той же зоне подряд
        let previousZones = [];
        
        for (let row = 0; row < platformRows; row++) {
            // Увеличиваем расстояние между рядами с высотой (150-200 пикселей)
            const heightFactor = 1 + (row / platformRows) * 0.6;
            y -= Phaser.Math.Between(
                Math.floor(this.platformYMin * heightFactor * 1.2), 
                Math.floor(this.platformYMax * heightFactor * 1.2)
            );
            
            // Количество платформ в ряду случайное от 1 до 3
            const platformCount = Phaser.Math.Between(1, 3);
            
            // Перемешиваем зоны для случайного выбора
            const shuffledZones = Phaser.Utils.Array.Shuffle([...zones]);
            
            // Выбираем зоны, которые не использовались в предыдущем ряду
            const availableZones = shuffledZones.filter(zone => !previousZones.includes(zones.indexOf(zone)));
            
            // Если нет доступных зон, используем все
            const zonesToUse = availableZones.length > 0 ? availableZones : shuffledZones;
            
            // Сбрасываем предыдущие зоны
            previousZones = [];
            
            // Создаем платформы в случайных зонах
            for (let i = 0; i < Math.min(platformCount, zonesToUse.length); i++) {
                const zone = zonesToUse[i];
                previousZones.push(zones.indexOf(zone));
                
                // Случайная позиция внутри зоны
                const xMin = zone.x + this.platformXMin;
                const xMax = zone.x + zone.width - this.platformXMin - this.platformWidth;
                let x = Phaser.Math.Between(xMin, xMax);
                
                // Проверяем, не стоит ли платформа под существующей
                let isUnderExisting = false;
                for (const plat of generatedPlatforms) {
                    // Проверяем только платформы выше, в пределах высоты прыжка
                    if (plat.y < y && Math.abs(plat.y - y) < maxJumpHeight * 2) {
                        // Если платформы близко по X, считаем что она под существующей
                        if (Math.abs(plat.x - x) < minVerticalOffset) {
                            isUnderExisting = true;
                            break;
                        }
                    }
                }
                
                // Если платформа под существующей, пробуем сместить её
                if (isUnderExisting) {
                    // Пробуем до 5 раз найти подходящую позицию
                    let found = false;
                    for (let attempt = 0; attempt < 5; attempt++) {
                        // Новая случайная позиция в текущей зоне
                        x = Phaser.Math.Between(xMin, xMax);
                        
                        isUnderExisting = false;
                        for (const plat of generatedPlatforms) {
                            if (plat.y < y && Math.abs(plat.y - y) < maxJumpHeight * 2 && 
                                Math.abs(plat.x - x) < minVerticalOffset) {
                                isUnderExisting = true;
                                break;
                            }
                        }
                        
                        if (!isUnderExisting) {
                            found = true;
                            break;
                        }
                    }
                    
                    // Если не удалось найти позицию, пропускаем эту платформу
                    if (!found) continue;
                }
                
                // Проверяем, что эта платформа достижима с любой другой ниже
                let isReachable = row === 0; // Первый ряд всегда достижим
                
                if (!isReachable) {
                    for (const plat of generatedPlatforms) {
                        // Проверяем только платформы ниже
                        if (plat.y > y) {
                            const dx = Math.abs(plat.x - x);
                            const dy = Math.abs(plat.y - y);
                            
                            // Если платформа в пределах прыжка
                            if (dy <= maxJumpHeight && dx <= maxJumpWidth) {
                                isReachable = true;
                                break;
                            }
                        }
                    }
                }
                
                // Если платформа недостижима, пропускаем её
                if (!isReachable) continue;
                
                // Проверяем, что эта платформа не перекрывается с другими в том же ряду
                let hasOverlap = false;
                for (const plat of generatedPlatforms) {
                    if (Math.abs(plat.y - y) < 15 && Math.abs(plat.x - x) < minHorizDistance) {
                        hasOverlap = true;
                        break;
                    }
                }
                
                // Если есть перекрытие, пропускаем
                if (hasOverlap) continue;
                
                // Определяем тип платформы в зависимости от высоты
                const heightInfluence = row / platformRows;
                const platformType = this.getPlatformType(heightInfluence);
                let platform;
                
                switch (platformType) {
                    case 'fragile':
                        platform = this.fragilePlatforms.create(x, y, 'platform_fragile');
                        break;
                    case 'slippery':
                        platform = this.slipperyPlatforms.create(x, y, 'platform_slippery');
                        break;
                    case 'vanishing':
                        platform = this.vanishingPlatforms.create(x, y, 'platform_vanishing');
                        break;
                    default:
                        platform = this.platforms.create(x, y, 'platform_normal');
                }
                
                // Случайный размер платформы (меньший разброс для предсказуемости)
                const scale = Phaser.Math.FloatBetween(0.85, 1.15);
                platform.setScale(scale, 1).refreshBody();
                
                // Добавляем в список сгенерированных платформ
                generatedPlatforms.push({
                    x: x,
                    y: y,
                    width: this.platformWidth * scale,
                    type: platformType
                });
            }
        }
        
        // Обновляем верхнюю границу сгенерированных платформ
        this.lastPlatformY = y < this.lastPlatformY ? y : this.lastPlatformY;
    }

    getPlatformType(heightInfluence = 0) {
        // Выбираем тип платформы на основе вероятности
        // Учитываем время игры и высоту - со временем и с высотой увеличиваем сложность
        
        // Начальное значение шанса для каждого типа
        let normal = this.platformTypes.normal.chance;
        let fragile = this.platformTypes.fragile.chance;
        let slippery = this.platformTypes.slippery.chance;
        let vanishing = this.platformTypes.vanishing.chance;
        
        // Увеличиваем сложность со временем
        if (this.gameTime > 30) { // Через 30 секунд начинаем усложнять
            // Уменьшаем шанс нормальных платформ
            normal = Math.max(30, normal - Math.floor(this.gameTime / 10));
            
            // Увеличиваем шанс сложных платформ
            fragile += Math.floor(this.gameTime / 30);
            slippery += Math.floor(this.gameTime / 30);
            vanishing += Math.floor(this.gameTime / 30);
        }
        
        // Влияние высоты - чем выше, тем меньше нормальных платформ
        normal = Math.max(20, normal - Math.floor(heightInfluence * 30));
        fragile += Math.floor(heightInfluence * 10);
        slippery += Math.floor(heightInfluence * 10);
        vanishing += Math.floor(heightInfluence * 10);
        
        // Общая сумма шансов
        const total = normal + fragile + slippery + vanishing;
        
        // Случайное число от 0 до total
        const rand = Phaser.Math.Between(0, total);
        
        // Определяем тип платформы
        if (rand < normal) {
            return 'normal';
        } else if (rand < normal + fragile) {
            return 'fragile';
        } else if (rand < normal + fragile + slippery) {
            return 'slippery';
        } else {
            return 'vanishing';
        }
    }

    updateFloodLevel() {
        // Базовая скорость подъема воды
        let currentSpeed = this.floodSpeed;
        
        // Увеличиваем скорость затопления со временем
        currentSpeed += Math.min(10, this.difficulty * 2); // Максимум +10 к базовой скорости
        
        // Если игрок высоко, увеличиваем скорость затопления дополнительно
        if (this.player.y < this.cameras.main.scrollY + 200) {
            currentSpeed *= 1.2;
        }
        
        // Обновляем позицию затопления
        this.flood.y -= currentSpeed * (1/60); // Нормализуем скорость к 60fps
        
        // Плавное подъятие уровня воды при перезапуске (если игрок использовал респаун)
        if (this.floodResetTimer && this.floodResetTimer > 0) {
            this.floodResetTimer -= 1/60;
            this.flood.y = this.floodTargetY + (this.floodStartY - this.floodTargetY) * this.floodResetTimer;
            if (this.floodResetTimer <= 0) {
                this.floodResetTimer = null;
            }
        }
    }

    increaseFloodSpeed() {
        // Увеличиваем скорость затопления со временем
        this.floodSpeed = Math.min(1, this.floodSpeed + 0.1);
        
        // Визуальный эффект при увеличении скорости
        this.cameras.main.flash(300, 0, 0, 255);
    }

    checkGameOver() {
        // Проверка, попал ли игрок в зону затопления
        // Вычисляем реальную Y-координату верхней границы затопления в мировых координатах
        const floodTopY = 600 - this.floodHeight + this.cameras.main.scrollY;
        
        if (this.player.y > floodTopY) {
            // Проверяем, есть ли активный щит
            if (this.playerAbilities.checkShield()) {
                // Если щит активен, просто отменяем падение и даем игроку возможность продолжить
                this.player.setVelocityY(-300); // Выталкиваем игрока вверх
                this.cameras.main.flash(300, 0, 128, 255); // Визуальный эффект активации щита
                return;
            }
            
            this.gameOver = true;
            this.player.setTint(0xff0000);
            
            // Останавливаем физику
            this.physics.pause();
            
            // Останавливаем спаун бонусов
            this.powerupManager.stopSpawning();
            
            // Отображаем сообщение о проигрыше
            const gameOverText = this.add.text(400, 300, 'Игра окончена', { 
                fontSize: '48px', 
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 6
            });
            gameOverText.setOrigin(0.5);
            gameOverText.setScrollFactor(0);
            
            // Отображаем результат
            const scoreText = this.add.text(400, 350, `Высота: ${this.score}`, { 
                fontSize: '32px', 
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4
            });
            scoreText.setOrigin(0.5);
            scoreText.setScrollFactor(0);
            
            const restartText = this.add.text(400, 400, 'Нажмите, чтобы начать снова', { 
                fontSize: '24px', 
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4
            });
            restartText.setOrigin(0.5);
            restartText.setScrollFactor(0);
            
            // Добавляем возможность перезапуска
            this.input.on('pointerdown', () => {
                this.scene.start('StartScene');
            });
        }
    }

    // Метод для возвращения игрока на платформу, если он упал слишком низко
    respawnPlayer() {
        // Ищем ближайшую платформу для респауна
        let closestPlatform = null;
        let closestDistance = Number.MAX_VALUE;
        
        this.allPlatforms.forEach(group => {
            group.getChildren().forEach(platform => {
                // Находим только платформы, которые выше игрока (чтобы не респаунить его еще ниже)
                if (platform.y < this.player.y) {
                    const distance = Math.abs(platform.y - this.player.y);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestPlatform = platform;
                    }
                }
            });
        });
        
        if (closestPlatform) {
            // Респауним игрока на ближайшей платформе
            this.player.x = closestPlatform.x;
            this.player.y = closestPlatform.y - 30; // 30 пикселей над платформой (было 50)
            this.player.setVelocity(0, 0);
            
            // Визуальный эффект респауна
            this.cameras.main.flash(300, 255, 0, 0);
        } else {
            // Если платформ нет, создаем новую и респауним на ней
            const respawnY = this.cameras.main.scrollY + 500;
            const respawnPlatform = this.platforms.create(400, respawnY, 'platform_normal');
            respawnPlatform.setScale(2, 1).refreshBody(); // Делаем её шире, но не выше
            
            this.player.x = 400;
            this.player.y = respawnY - 30; // 30 пикселей над платформой (было 50)
            this.player.setVelocity(0, 0);
            
            // Визуальный эффект респауна
            this.cameras.main.flash(300, 255, 0, 0);
        }
    }

    // Генерация обычной платформы
    generatePlatform(yPosition) {
        // Определяем минимальную ширину платформы в зависимости от сложности
        const minWidth = Math.max(50, 150 - this.difficulty * 10);
        
        // Базовая вероятность создания обычной платформы
        let regularPlatformChance = 0.7 - (this.difficulty * 0.05);
        regularPlatformChance = Math.max(0.3, regularPlatformChance); // Не меньше 30%
        
        // Случайная позиция по X
        const x = Phaser.Math.Between(minWidth/2 + 20, 800 - minWidth/2 - 20);
        const width = Phaser.Math.Between(minWidth, minWidth + 50);
        
        // Создаем платформу
        const platform = this.platforms.create(x, yPosition, 'platform');
        platform.displayWidth = width;
        platform.displayHeight = 20;
        platform.refreshBody();
        platform.setImmovable(true);
        
        // Обновляем позицию последней платформы
        this.lastPlatformY = yPosition;
    }
    
    // Генерация специальной платформы (движущейся, исчезающей или пружинящей)
    generateSpecialPlatform(yPosition) {
        // Случайная позиция по X
        const x = Phaser.Math.Between(100, 700);
        
        // Выбираем тип платформы с учетом сложности
        const platformType = Phaser.Math.Between(1, 10 + this.difficulty);
        
        if (platformType <= 4) {
            // Движущаяся платформа
            this.createMovingPlatform(x, yPosition);
        } else if (platformType <= 8) {
            // Исчезающая платформа
            this.createDisappearingPlatform(x, yPosition);
        } else {
            // Пружинящая платформа
            this.createBouncyPlatform(x, yPosition);
        }
    }
    
    // Создание движущейся платформы
    createMovingPlatform(x, yPosition) {
        const platform = this.movingPlatforms.create(x, yPosition, 'platform_moving');
        platform.displayWidth = 100;
        platform.displayHeight = 20;
        platform.refreshBody();
        platform.setImmovable(true);
        
        // Настраиваем движение
        platform.direction = Phaser.Math.Between(0, 1) ? 1 : -1;
        platform.speed = Phaser.Math.Between(50, 100) * (1 + this.difficulty * 0.2);
        
        this.lastPlatformY = yPosition;
    }
    
    // Создание исчезающей платформы
    createDisappearingPlatform(x, yPosition) {
        const platform = this.disappearingPlatforms.create(x, yPosition, 'platform_disappearing');
        platform.displayWidth = 100;
        platform.displayHeight = 20;
        platform.refreshBody();
        platform.setImmovable(true);
        platform.disappearDelay = 500 - this.difficulty * 30; // Уменьшаем время до исчезновения
        platform.alpha = 1;
        
        this.lastPlatformY = yPosition;
    }
    
    // Создание пружинящей платформы
    createBouncyPlatform(x, yPosition) {
        const platform = this.bouncyPlatforms.create(x, yPosition, 'platform_bouncy');
        platform.displayWidth = 80;
        platform.displayHeight = 20;
        platform.refreshBody();
        platform.setImmovable(true);
        platform.bounceForce = 700 + this.difficulty * 50; // Увеличиваем силу отскока
        
        this.lastPlatformY = yPosition;
    }

    // Обработка движения игрока
    handlePlayerMovement() {
        // Горизонтальное движение
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-350);
            this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(350);
            this.player.flipX = false;
        } else {
            // Плавное замедление
            this.player.setVelocityX(this.player.body.velocity.x * 0.8);
        }
        
        // Обработка прыжка
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-600);
            this.jumpSound.play();
            
            // Анимация прыжка
            this.tweens.add({
                targets: this.player,
                scaleX: 0.8,
                scaleY: 1.2,
                duration: 100,
                yoyo: true
            });
        }
    }
    
    // Обновление движущихся платформ
    updateMovingPlatforms() {
        this.movingPlatforms.getChildren().forEach(platform => {
            // Перемещаем платформу
            platform.x += platform.direction * platform.speed * (1/60);
            platform.refreshBody();
            
            // Меняем направление, если достигли края экрана
            if (platform.x < 100 || platform.x > 700) {
                platform.direction *= -1;
            }
        });
    }
    
    // Очистка платформ, которые находятся слишком низко
    cleanupPlatforms() {
        const cleanupY = this.cameras.main.scrollY + 800;
        
        // Проверяем все группы платформ
        [this.platforms, this.movingPlatforms, this.disappearingPlatforms, this.bouncyPlatforms].forEach(group => {
            group.getChildren().forEach(platform => {
                if (platform.y > cleanupY) {
                    platform.destroy();
                }
            });
        });
    }

    // Обновление индикатора уровня затопления
    updateFloodIndicator() {
        this.floodIndicator.clear();
        
        // Расчет процента заполнения
        const screenHeight = this.cameras.main.height;
        const playerPosition = this.player.y - this.cameras.main.scrollY;
        const floodPosition = this.floodY - this.cameras.main.scrollY;
        const dangerZone = floodPosition - playerPosition;
        const dangerPercentage = Math.min(Math.max(1 - (dangerZone / (screenHeight * 0.7)), 0), 1);
        
        // Выбор цвета в зависимости от опасности
        let color;
        if (dangerPercentage < 0.3) {
            color = 0x00ff00; // Зеленый - безопасно
        } else if (dangerPercentage < 0.7) {
            color = 0xffff00; // Желтый - будь осторожен
        } else {
            color = 0xff0000; // Красный - опасно
        }
        
        // Рисуем индикатор
        this.floodIndicator.fillStyle(color, 0.7);
        this.floodIndicator.fillRect(
            this.cameras.main.width - 30, 
            50, 
            20, 
            200 * dangerPercentage
        );
        
        // Рамка индикатора
        this.floodIndicator.lineStyle(2, 0xffffff, 1);
        this.floodIndicator.strokeRect(
            this.cameras.main.width - 30, 
            50, 
            20, 
            200
        );
    }
    
    // Создание визуальных эффектов и частиц
    createVisualEffects() {
        // Создаем менеджер частиц
        this.particleEmitters = {};
        
        // Создаем текстуры для частиц
        this.createParticleTextures();
        
        // Частицы для прыжка
        this.particleEmitters.jump = this.add.particles('particle_dust').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 50, max: 100 },
            angle: { min: 230, max: 310 },
            scale: { start: 0.6, end: 0 },
            lifespan: 300,
            quantity: 10,
            on: false
        });
        
        // Частицы для всплеска воды
        this.particleEmitters.splash = this.add.particles('particle_water').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 80, max: 160 },
            angle: { min: 230, max: 310 },
            scale: { start: 0.4, end: 0 },
            tint: 0x0099ff,
            lifespan: 500,
            quantity: 15,
            on: false
        });
        
        // Частицы для разрушения платформы
        this.particleEmitters.platformBreak = this.add.particles('particle_platform').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.4, end: 0 },
            lifespan: 600,
            quantity: 20,
            on: false
        });
        
        // Частицы для бонусов
        this.particleEmitters.powerup = this.add.particles('particle_star').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 20, max: 80 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            tint: 0xffff00,
            lifespan: 800,
            quantity: 15,
            on: false,
            frequency: 100,
            blendMode: 'ADD'
        });
        
        // Частицы для воды (постоянные)
        this.particleEmitters.water = this.add.particles('particle_bubble').createEmitter({
            x: 400,
            y: 0,
            speedY: { min: -50, max: -100 },
            speedX: { min: -20, max: 20 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: 0x0099ff,
            lifespan: 1500,
            frequency: 200,
            quantity: 1,
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Rectangle(-400, -20, 800, 20)
            }
        });
        
        // Добавляем свечение к игровым элементам
        this.postFXPlugin = this.plugins.get('rexShaderFX');
        
        if (this.postFXPlugin) {
            // Свечение для бонусов
            this.powerupManager.powerups.getChildren().forEach(powerup => {
                this.postFXPlugin.add(powerup, {
                    name: 'Glow',
                    intensity: 0.05,
                    color: 0xffff00
                });
            });
            
            // Пульсирующее свечение для специальных платформ
            this.bouncyPlatforms.getChildren().forEach(platform => {
                const glow = this.postFXPlugin.add(platform, {
                    name: 'Glow',
                    intensity: 0.03,
                    color: 0x00ff00
                });
                
                this.tweens.add({
                    targets: { intensity: 0.03 },
                    intensity: 0.1,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    onUpdate: (tween, target) => {
                        glow.setIntensity(target.intensity);
                    }
                });
            });
        }
    }
    
    createParticleTextures() {
        // Создаем текстуры для частиц
        const graphics = this.make.graphics();
        
        // Частица пыли для прыжка
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('particle_dust', 16, 16);
        
        // Частица воды для брызг
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('particle_water', 16, 16);
        
        // Частица для разрушения платформы
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 6, 6);
        graphics.generateTexture('particle_platform', 6, 6);
        
        // Частица для бонусов
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.beginPath();
        graphics.moveTo(8, 0);
        graphics.lineTo(10, 6);
        graphics.lineTo(16, 6);
        graphics.lineTo(11, 10);
        graphics.lineTo(13, 16);
        graphics.lineTo(8, 12);
        graphics.lineTo(3, 16);
        graphics.lineTo(5, 10);
        graphics.lineTo(0, 6);
        graphics.lineTo(6, 6);
        graphics.closePath();
        graphics.fill();
        graphics.generateTexture('particle_star', 16, 16);
        
        // Частица пузырька для воды
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(6, 6, 6);
        graphics.generateTexture('particle_bubble', 12, 12);
    }
    
    /**
     * Воспроизводит визуальный эффект прыжка в зависимости от окружения
     */
    playJumpEffect() {
        const playerX = this.player.x;
        const playerY = this.player.y;
        
        // Проверяем, находится ли игрок над водой
        const isAboveWater = this.isWaterNearby(playerX, playerY);
        
        if (isAboveWater) {
            // Эффект брызг, если игрок над водой
            
            // Звуковой эффект всплеска
            this.sound.play('splash', { volume: 0.5 });
            
            // Создаем эмиттер брызг
            const splashEmitter = this.add.particles(0, 0, 'particleBlue', {
                x: playerX,
                y: this.floodLevel,
                speed: { min: 50, max: 200 },
                angle: { min: 240, max: 300 },
                scale: { start: 0.6, end: 0 },
                lifespan: 800,
                gravityY: 300,
                quantity: 15,
                blendMode: 'ADD'
            });
            
            // Создаем круги на воде
            for (let i = 0; i < 3; i++) {
                const circle = this.add.circle(
                    playerX + Phaser.Math.Between(-10, 10), 
                    this.floodLevel, 
                    5 + i * 10, 
                    0x4fa7ff, 
                    0.7 - i * 0.2
                );
                
                this.tweens.add({
                    targets: circle,
                    radius: 30 + i * 20,
                    alpha: 0,
                    duration: 800 + i * 300,
                    onComplete: () => {
                        circle.destroy();
                    }
                });
            }
            
            // Автоматически останавливаем эмиттер через некоторое время
            this.time.delayedCall(300, () => {
                splashEmitter.stop();
            });
        } else {
            // Эффект пыли, если игрок на суше
            const dustEmitter = this.add.particles(0, 0, 'particleDust', {
                x: playerX,
                y: playerY + 30,
                speed: { min: 20, max: 80 },
                angle: { min: 230, max: 310 },
                scale: { start: 0.4, end: 0 },
                lifespan: 600,
                quantity: 8
            });
            
            // Автоматически останавливаем эмиттер через некоторое время
            this.time.delayedCall(200, () => {
                dustEmitter.stop();
            });
        }
        
        // Встряхиваем камеру для усиления эффекта
        this.cameras.main.shake(100, 0.005);
    }
    
    /**
     * Проверяет, находится ли игрок вблизи воды
     * @param {number} x - Координата x игрока
     * @param {number} y - Координата y игрока
     * @param {number} radius - Радиус проверки (по умолчанию 50)
     * @returns {boolean} - true, если игрок вблизи воды
     */
    isWaterNearby(x, y, radius = 50) {
        // Если игрок находится близко к уровню затопления
        if (Math.abs(y - this.floodLevel) < radius) {
            return true;
        }
        
        // Проверяем наличие скользких платформ поблизости (они обычно на воде)
        let waterPlatformNearby = false;
        this.platforms.getChildren().forEach(platform => {
            if (platform.type === 'slippery') {
                const dist = Phaser.Math.Distance.Between(x, y, platform.x, platform.y);
                if (dist < radius) {
                    waterPlatformNearby = true;
                }
            }
        });
        
        return waterPlatformNearby;
    }

    // Воспроизведение эффекта всплеска воды
    playSplashEffect(x, y) {
        this.particleEmitters.splash.setPosition(x, y);
        this.particleEmitters.splash.explode();
        
        // Круги на воде
        for (let i = 0; i < 3; i++) {
            let circle = this.add.circle(x, y, 5 + i * 10, 0x0099ff, 0.7);
            this.tweens.add({
                targets: circle,
                radius: 50 + i * 20,
                alpha: 0,
                duration: 800 + i * 200,
                onComplete: () => {
                    circle.destroy();
                }
            });
        }
    }
    
    // Воспроизведение эффекта разрушения платформы
    playPlatformBreakEffect(platform) {
        // Настраиваем цвет частиц в зависимости от типа платформы
        let tint = 0x4de94c; // Цвет обычной платформы
        
        if (platform.texture.key === 'platform_fragile') {
            tint = 0xe9a74d; // Оранжевый
        } else if (platform.texture.key === 'platform_slippery') {
            tint = 0x4de9e7; // Голубой
        } else if (platform.texture.key === 'platform_vanishing') {
            tint = 0xe94d9d; // Розовый
        }
        
        this.particleEmitters.platformBreak.setTint(tint);
        this.particleEmitters.platformBreak.setPosition(platform.x, platform.y);
        this.particleEmitters.platformBreak.explode();
    }
    
    // Обновление эффектов воды
    updateWaterEffects() {
        // Обновляем позицию эмиттера пузырьков
        this.particleEmitters.water.setPosition(400, this.flood.y);
        
        // Создаем эффект колебания воды
        const time = this.time.now / 500;
        const amplitude = 5;
        
        this.flood.displayHeight = 200 + Math.sin(time) * amplitude;
        
        // Если игрок близко к воде, показываем всплески
        const waterLevel = this.flood.y - this.flood.displayHeight / 2;
        const distanceToWater = this.player.y - waterLevel;
        
        if (distanceToWater > 0 && distanceToWater < 50) {
            if (this.nextSplashTime === undefined || this.time.now > this.nextSplashTime) {
                this.playSplashEffect(this.player.x, waterLevel);
                this.nextSplashTime = this.time.now + 300; // Каждые 300 мс
            }
        }
    }

    handleJump() {
        // ... existing code ...
        
        if (this.player.body.touching.down) {
            this.player.setVelocityY(-this.gameConfig.jumpVelocity);
            this.sound.play('jump');
            this.playerState.canDoubleJump = true;
            this.playJumpEffect();
        } else if (this.playerState.canDoubleJump) {
            this.player.setVelocityY(-this.gameConfig.doubleJumpVelocity);
            this.sound.play('doubleJump');
            this.playerState.canDoubleJump = false;
            this.playJumpEffect();
        }
        
        // ... existing code ...
    }
} 