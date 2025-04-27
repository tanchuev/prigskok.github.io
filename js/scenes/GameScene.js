class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        
        // Флаги нажатия клавиш управления
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        
        // Добавляем переменную для отслеживания последнего прыжка
        this.lastJumpTime = 0;
        this.jumpCooldown = 400;
        
        // Добавляем переменную для отслеживания последнего направления движения
        this.lastDirection = 1; // 1 = вправо, -1 = влево
        
        // Высота, на которую поднялся игрок (счет)
        this.score = 0;
        this.highestScore = 0;
        
        // Параметры для процедурной генерации платформ
        this.lastPlatformY = 0;
        this.lastPlatformGenerationTime = undefined;
        this.waterLevel = 0;
        this.lastPlatformCheckpoint = 600; // Инициализация этой переменной для правильного отслеживания контрольных точек
        this.lastCleanupCheckpoint = 0;
        
        this.gameOver = false;
        this.platformYMin = 120;
        this.platformYMax = 200;
        this.platformXMin = 70;
        this.lastGenerationTime = 0;
        this.initialPlayerY = 570;
        this.maxHeightReached = 0;
        
        this.platformWidth = 86;
        this.platformHeight = 20;
        
        this.platformTextureScale = 0.25;
        
        // Шанс, что платформа будет движущейся (для всех типов)
        this.movingPlatformChance = 0.15;
        
        this.gameTime = 0;
        
        this.platformGenerationBuffer = 800; // Увеличиваем буфер для лучшей генерации
        this.maxPlatforms = 40; // Увеличиваем максимальное количество платформ
        this.generationRowsCount = 10; // Увеличиваем количество генерируемых рядов
        
        this.selectedCharacter = 'pumpkin';
        
        // Параметры для движущихся платформ
        this.movingPlatformMinSpeed = 30;
        this.movingPlatformMaxSpeed = 70;
        this.movingPlatformVerticalMaxSpeed = 50; // Более низкая максимальная скорость для вертикальных платформ
        
        // Параметры для расстояния движения платформ
        this.horizontalMinDistance = 100;
        this.horizontalMaxDistance = 300; // Увеличено до 300
        this.verticalMinDistance = 50;
        this.verticalMaxDistance = 300; // Увеличено до 150
        
        // Максимальные возможности прыжка игрока для определения проходимости
        this.playerMaxJumpHeight = 250;
        this.playerMaxJumpDistance = 300;
        
        // Минимальный процент "надежных" (не хрупких и не исчезающих) платформ для гарантии проходимости
        this.minSafePlatformsPercent = 30;
        
        // Добавляем коэффициент замедления для липкой платформы
        this.stickySlowdownFactor = 0.2;
        
        // Параметры для бонусных предметов
        this.itemScale = 0.75; // Масштаб предметов
        
        // Множители для комбинирования эффектов
        this.jumpVelocityMultiplier = 1;
        this.jumpCooldownMultiplier = 1;
        this.playerSpeedMultiplier = 1;
        
        // Типы бонусных предметов и их шансы появления
        this.itemTypes = {
            // Бонусы
            jump_boost: { 
                chance: 0,
                duration: 5000, // 5 секунд
                speedMultiplier: 2, // Множитель скорости прыжка
                animationSpeedMultiplier: 2, // Множитель скорости анимации
                type: 'bonus'
            },
            jump_height: { 
                chance: 18,
                duration: 5000, // 5 секунд
                heightMultiplier: 1.6, // Множитель высоты прыжка
                type: 'bonus'
            },
            // Помехи для других игроков
            shockwave: { 
                chance: 13,
                radius: 1500, // Радиус действия
                force: 1500, // Сила отталкивания
                type: 'obstacle'
            },
            freeze: { 
                chance: 13,
                duration: 3000, // 3 секунды
                slowdownFactor: 0.4, // Коэффициент замедления
                type: 'obstacle'
            },
            // Ловушки
            decrease_jump: { 
                chance: 13,
                duration: 4000, // 4 секунды
                heightMultiplier: 0.7, // Множитель высоты прыжка
                type: 'trap'
            },
            knockback: { 
                chance: 13,
                force: 1000, // Сила отброса
                type: 'trap'
            }
        };
        
        // Активные эффекты бонусов
        this.activeEffects = [];
    }

    init(data) {
        this.highestScore = data.highScore || 0;
        
        if (data.selectedCharacter) {
            this.selectedCharacter = data.selectedCharacter;
        }
        
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        
        this.score = 0;
        
        this.lastPlatformY = 0;
        this.lastPlatformGenerationTime = undefined;
        this.lastPlatformCheckpoint = 600; // Инициализация в init методе тоже
        this.lastCleanupCheckpoint = 0;
        
        this.waterLevel = 0;
        
        this.platformYMin = 120;
        this.platformYMax = 200;
        this.platformXMin = 70;
        this.lastPlatformY = 600;
        this.jumpVelocity = -450;
        this.jumpCooldown = 300; // Добавляем базовое значение кулдауна
        this.moveSpeed = 200; // Базовая скорость персонажа
        this.lastGenerationTime = 0;
        this.initialPlayerY = 570;
        this.maxHeightReached = 0;
        
        this.platformWidth = 86;
        this.platformHeight = 20;
        
        this.platformTextureScale = 0.25;
        
        
        // Разные типы платформ
        this.platformTypes = {
            normal: { chance: 40 },
            fragile: { chance: 15 },
            slippery: { chance: 15 },
            vanishing: { chance: 10 },
            sticky: { chance: 10 }
        };
    
        // Разные типы платформ
        this.platformTypes = {
            normal: { chance: 40 },
            fragile: { chance: 15 },
            slippery: { chance: 15 },
            vanishing: { chance: 10 },
            sticky: { chance: 10 }
        };
        
        // Шанс, что платформа будет движущейся (для всех типов)
        this.movingPlatformChance = 0.2;
        
        // Мобильное управление
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        
        this.gameTime = 0;
        
        // Параметры для движущихся платформ
        this.movingPlatformMinSpeed = 30;
        this.movingPlatformMaxSpeed = 70;
        
        // Параметры для расстояния движения платформ
        this.horizontalMinDistance = 100;
        this.horizontalMaxDistance = 300; // Увеличено до 300
        this.verticalMinDistance = 50;
        this.verticalMaxDistance = 300; // Увеличено до 150
        
        // Сбрасываем активные эффекты бонусов
        this.activeEffects = [];
        
        // Сбрасываем множители эффектов
        this.jumpVelocityMultiplier = 1;
        this.jumpCooldownMultiplier = 1;
        this.playerSpeedMultiplier = 1;
    }

    preload() {
        this.load.image('bg', 'assets/images/bg.jpg');
        this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
        
        this.load.spineBinary('halloween-creature', './assets/images/CreatureScene/HalloweenCreature.skel');
        this.load.spineAtlas('halloween-creature-atlas', './assets/images/CreatureScene/HalloweenCreature.atlas');
        
        // Загрузка иконки двойного прыжка
        this.load.image('double_jump', 'assets/images/double_jump.png');
        
        // Загрузка звуковых файлов
        this.load.audio('jump', 'assets/sounds/jump.mp3');
        this.load.audio('score', 'assets/sounds/score.mp3');
        this.load.audio('gameover', 'assets/sounds/gameover.mp3');
        this.load.audio('powerup', 'assets/sounds/powerup.mp3');
        this.load.audio('platform', 'assets/sounds/platform.mp3');
        this.load.audio('doubleJump', 'assets/sounds/doublejump.mp3');
        this.load.audio('splash', 'assets/sounds/splash.mp3');
        
        // Загрузка звуков для бонусных предметов
        this.load.audio('item_jump_boost', 'assets/sounds/items/jump_boost.ogg');
        this.load.audio('item_jump_height', 'assets/sounds/items/jump_height.ogg');
        this.load.audio('item_shockwave', 'assets/sounds/items/shockwave.ogg');
        this.load.audio('item_freeze', 'assets/sounds/items/freeze.ogg');
        this.load.audio('item_decrease_jump', 'assets/sounds/items/decrease_jump.ogg');
        this.load.audio('item_knockback', 'assets/sounds/items/knockback.ogg');
        
        // Загрузка изображений бонусных предметов
        this.load.image('item_jump_boost', 'assets/images/items/jump_boost.png');
        this.load.image('item_jump_height', 'assets/images/items/jump_height.png');
        this.load.image('item_shockwave', 'assets/images/items/shockwave.png');
        this.load.image('item_freeze', 'assets/images/items/freeze.png');
        this.load.image('item_decrease_jump', 'assets/images/items/decrease_jump.png');
        this.load.image('item_knockback', 'assets/images/items/knockback.png');
        
        // Загружаем текстуры платформ
        // Типы платформ: normal (default) - обычная, fragile - хрупкая, slippery - скользкая, 
        // vanishing - исчезающая, sticky - липкая
        
        // Правильное соответствие текстур для каждого типа платформ
        this.load.image('platform_normal_left', 'assets/images/platforms/default_left.png');
        this.load.image('platform_normal_mid', 'assets/images/platforms/default_mid.png');
        this.load.image('platform_normal_right', 'assets/images/platforms/default_right.png');
        
        this.load.image('platform_fragile_left', 'assets/images/platforms/fragile_left.png');
        this.load.image('platform_fragile_mid', 'assets/images/platforms/fragile_mid.png');
        this.load.image('platform_fragile_right', 'assets/images/platforms/fragile_right.png');
        
        this.load.image('platform_slippery_left', 'assets/images/platforms/slippery_left.png');
        this.load.image('platform_slippery_mid', 'assets/images/platforms/slippery_mid.png');
        this.load.image('platform_slippery_right', 'assets/images/platforms/slippery_right.png');
        
        this.load.image('platform_vanishing_left', 'assets/images/platforms/vanishing_left.png');
        this.load.image('platform_vanishing_mid', 'assets/images/platforms/vanishing_mid.png');
        this.load.image('platform_vanishing_right', 'assets/images/platforms/vanishing_right.png');
        
        this.load.image('platform_sticky_left', 'assets/images/platforms/sticky_left.png');
        this.load.image('platform_sticky_mid', 'assets/images/platforms/sticky_mid.png');
        this.load.image('platform_sticky_right', 'assets/images/platforms/sticky_right.png');
    }

    create() {
        this.physics.world.setBounds(0, -95000, 800, 95800); // Изменяем верхнюю границу для соответствия границам камеры
        this.physics.world.setBoundsCollision(true, true, false, true); // Отключаем коллизию только с верхней границей

        this.bg = this.add.tileSprite(400, 300, 800, 600, 'bg');
        this.bg.setScrollFactor(0);
        
        // Группы платформ
        this.platforms = this.physics.add.staticGroup();
        this.fragilePlatforms = this.physics.add.staticGroup();
        this.slipperyPlatforms = this.physics.add.staticGroup();
        this.vanishingPlatforms = this.physics.add.staticGroup();
        this.stickyPlatforms = this.physics.add.staticGroup();
        
        // Группа для движущихся платформ (будет содержать платформы любого типа, которые движутся)
        this.movingPlatforms = this.physics.add.group();
        
        // Добавляем инициализацию группы для предметов как статическую группу
        this.items = this.physics.add.staticGroup();
        
        // Объединенная группа всех платформ для коллизий
        this.allPlatforms = [
            this.platforms,
            this.fragilePlatforms,
            this.slipperyPlatforms,
            this.vanishingPlatforms,
            this.stickyPlatforms,
            this.movingPlatforms
        ];
        
        // Графика для отладки зоны проверки прыжка с близкой платформы
        this.jumpZoneDebugGraphics = this.add.graphics();
        this.jumpZoneDebugGraphics.setDepth(200);
        // По умолчанию отладка отключена
        this.debugJumpZone = false;
        
        this.createPlatform(
            400, 
            600, 
            this.platformWidth * 1.4, 
            this.platformHeight, 
            'normal',
            false // Первая платформа не движется
        );
        this.lastPlatformY = 600;
        
        // Генерируем начальные платформы для диапазона высот 600-800
        this.generatePlatforms();
        
        this.player = this.add.spine(400, this.initialPlayerY, 'halloween-creature', 'halloween-creature-atlas');
        
        this.player.skeleton.setSkinByName(this.selectedCharacter);
        this.player.skeleton.setSlotsToSetupPose();
        
        this.player.animationState.setAnimation(0, 'still', true);
        
        this.player.setScale(0.08);
        
        this.player.setDepth(100);
        
        this.physics.add.existing(this.player);
        
        const bodyWidth = 500;
        const bodyHeight = 700;
        const bodyOffsetX_Left = -150;
        const bodyOffsetY = -bodyHeight;

        this.player.body.setSize(bodyWidth, bodyHeight);
        this.player.body.setOffset(bodyOffsetX_Left, bodyOffsetY);
        this.player.body.setBounce(0.2);
        
        // Добавляем отображение рамки коллизий персонажа
        this.debugGraphics = this.add.graphics();
        this.debugGraphics.setDepth(150);
        
        // Включаем отображение рамки коллизий в настройках физики
        this.physics.world.createDebugGraphic();
        this.physics.world.debugGraphic.setVisible(false);
        
        this.player.setFlipX = function(flip) {
            if (flip) { // Отражение вправо
                this.scaleX = -0.08;
                const offsetX_Right = bodyOffsetX_Left + bodyWidth;
                this.body.setOffset(offsetX_Right, bodyOffsetY);
            } else { // Отражение влево (или исходное состояние)
                this.scaleX = 0.08;
                this.body.setOffset(bodyOffsetX_Left, bodyOffsetY);
            }
        };
        
        this.initialPlayerY = this.player.y;
        this.maxHeightReached = 0;
        
        this.lastPlatformCheckpoint = this.player.y;
        this.lastCleanupCheckpoint = this.cameras.main.scrollY;
        
        this.generatePlatforms();
        
        console.log(`Создан игрок на позиции Y=${this.initialPlayerY}`);
        
        this.player.body.collideWorldBounds = true;
        
        this.setupCollisions();
        
        this.playerAbilities = new PlayerAbilities(this, this.player);
        
        this.setupCamera();
        
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.platformSound = this.sound.add('platform');
        this.jumpSound = this.sound.add('jump');
        this.scoreSound = this.sound.add('score');
        this.gameoverSound = this.sound.add('gameover');
        this.powerupSound = this.sound.add('powerup');
        this.doubleJumpSound = this.sound.add('doubleJump');
        this.splashSound = this.sound.add('splash');
        
        // Добавляем звуки для бонусных предметов
        this.itemSounds = {
            jump_boost: this.sound.add('item_jump_boost'),
            jump_height: this.sound.add('item_jump_height'),
            shockwave: this.sound.add('item_shockwave'),
            freeze: this.sound.add('item_freeze'),
            decrease_jump: this.sound.add('item_decrease_jump'),
            knockback: this.sound.add('item_knockback')
        };
        
        this.createMobileControls();
        
        this.createUI();
        
        // Создаем интерфейс для отображения активных эффектов
        this.createEffectsUI();
        
        this.playerAbilities.createAbilityIndicators();

        this.playerAbilities.sounds = {
            jump: this.jumpSound,
            doubleJump: this.doubleJumpSound
        };

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { gameScene: 'GameScene' });
        });

        const pauseButton = this.add.image(750, 50, 'button-bg')
            .setScale(0.3)
            .setInteractive()
            .setDepth(100);

        const pauseText = this.add.text(750, 50, 'II', {
            fontFamily: 'unutterable',
            fontSize: '32px',
            color: '#00FFFF',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        pauseButton.on('pointerdown', () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { gameScene: 'GameScene' });
        });
        
        // Инициализируем значения с учетом множителей
        this.updateJumpVelocity();
        this.updateJumpCooldown();
        this.updatePlayerSpeed();
    }

    setupCollisions() {
        this.physics.add.collider(this.player, this.platforms, this.playerHitPlatform, null, this);
        this.physics.add.collider(this.player, this.fragilePlatforms, this.playerHitPlatform, null, this);
        this.physics.add.collider(this.player, this.slipperyPlatforms, this.playerHitPlatform, null, this);
        this.physics.add.collider(this.player, this.vanishingPlatforms, this.playerHitPlatform, null, this);
        this.physics.add.collider(this.player, this.stickyPlatforms, this.playerHitPlatform, null, this);
        this.physics.add.collider(this.player, this.movingPlatforms, this.playerHitPlatform, null, this);
        
        // Коллизия с бонусными предметами
        this.physics.add.overlap(this.player, this.items, this.playerCollectItem, null, this);
    }

    setupCamera() {
        this.cameras.main.setBounds(0, -95000, 800, 100000);
        this.cameras.main.startFollow(this.player, false);
        
        this.cameras.main.setDeadzone(400, 200);
        this.cameras.main.setFollowOffset(0, 100);
        
        this.lastPlatformCheckpoint = 0;
        this.lastCleanupCheckpoint = 0;
        
        this.player.onPlatform = false;
        
        this.playerMovement();
    }

    update(time, delta) {
        if (this.gameOver) {
            return;
        }
        
        this.gameTime += delta / 1000;
        
        this.bg.tilePositionY = -this.cameras.main.scrollY * 0.3;
        
        const currentHeight = Math.floor(this.initialPlayerY - this.player.y);
        
        if (currentHeight > this.maxHeightReached) {
            this.maxHeightReached = currentHeight;
        }
        
        this.score = this.maxHeightReached;
        this.scoreText.setText('Предел твоих возможностей: ' + this.score);
        
        // Обновляем отображение рамки коллизий
        // this.drawDebugPlayerCollision();
        
        // Отрисовка зоны проверки прыжка с близкой платформы (если отладка включена)
        if (this.debugJumpZone) {
            this.drawJumpZoneDebug();
        }
        
        if (this.cursors.left.isDown) {
            this.leftPressed = true;
            this.rightPressed = false;
        } else if (this.cursors.right.isDown) {
            this.rightPressed = true;
            this.leftPressed = false;
        } else {
            this.leftPressed = false;
            this.rightPressed = false;
        }
        
        if (this.spaceKey && this.spaceKey.isDown) {
            this.jumpPressed = true;
        }
        
        const cameraTargetY = Math.round(this.player.y) - 350;
        
        const smoothFactor = 0.1;
        
        const cameraDistance = cameraTargetY - this.cameras.main.scrollY;
        if (Math.abs(cameraDistance) > 5) {
            this.cameras.main.scrollY += cameraDistance * smoothFactor;
        }
        
        const playerCheckpoint = Math.floor(this.player.y / 100) * 100;
        
        // Изменённое условие: проверяем, нужно ли генерировать новые платформы
        if (playerCheckpoint < this.lastPlatformCheckpoint - 100 || this.lastPlatformCheckpoint === undefined) {
            this.lastPlatformCheckpoint = playerCheckpoint;
            
            const platformGenerationThreshold = this.lastPlatformY + this.platformGenerationBuffer;
            // Генерируем платформы если игрок поднялся выше порога или если высота последней платформы меньше 800
            if (this.player.y < platformGenerationThreshold || this.lastPlatformY < 800) {
                this.generatePlatforms();
            }
        }
        
        const bottomBoundY = this.physics.world.bounds.height;
        const playerBottomY = this.player.body.y + this.player.body.height;

        if (this.player.body.blocked.down && Math.abs(playerBottomY - bottomBoundY) < 5) {
            if (!this.gameOver) {
                this.gameOver = true;
                this.player.skeleton.color.r = 1;
                this.player.skeleton.color.g = 0.5;
                this.player.skeleton.color.b = 0.5;
                this.player.skeleton.color.a = 1;

                this.player.animationState.setAnimation(0, 'die', false);

                this.physics.pause();

                this.time.delayedCall(1000, () => {
                    this.scene.start('GameOverScene', { score: this.score });
                });
            }
            return;
        }
        
        const cleanupCheckpoint = Math.floor(this.cameras.main.scrollY / 300) * 300;
        
        if (cleanupCheckpoint > this.lastCleanupCheckpoint) {
            this.lastCleanupCheckpoint = cleanupCheckpoint;
            
            const cleanupThreshold = this.cameras.main.scrollY + 800;
            
            this.allPlatforms.forEach(group => {
                group.getChildren().forEach(platform => {
                    if (platform.y > cleanupThreshold) {
                        platform.destroy();
                    }
                });
            });
            
            // Очищаем предметы, которые оказались ниже порога очистки
            this.items.getChildren().forEach(item => {
                if (item.y > cleanupThreshold) {
                    if (item.platform) {
                        item.platform.item = null;
                    }
                    item.destroy();
                }
            });
        }
        
        // Сбрасываем состояние игрока перед обновлением, если он не на земле
        if (!this.player.body.touching.down) {
            this.player.onPlatform = false;
            this.player.currentPlatform = null;
            this.player.isOnSlipperyPlatform = false;
        }
        
        // Обновляем движущиеся платформы перед перемещением игрока
        this.movingPlatforms.getChildren().forEach(platform => {
            this.updateMovingPlatform(platform, delta);
        });

        // Проверяем коллизии с платформами
        this.allPlatforms.forEach(group => {
            this.physics.collide(this.player, group, this.playerHitPlatform, null, this);
        });
        
        // Если игрок стоит на движущейся платформе, перемещаем его вместе с ней
        if (this.player.onPlatform && this.player.currentPlatform && this.player.currentPlatform.isMoving) {
            const platform = this.player.currentPlatform;
            if (platform.lastX !== undefined && platform.lastY !== undefined) {
                const deltaX = platform.x - platform.lastX;
                const deltaY = platform.y - platform.lastY;
                
                // Принудительно перемещаем игрока вместе с платформой
                this.player.x += deltaX;
                this.player.y += deltaY;
                
                // Для горизонтального движения также устанавливаем скорость
                if (Math.abs(deltaX) > 0.001 && platform.movementDirection === 'horizontal') {
                    // Применяем скорость только если игрок не пытается двигаться самостоятельно
                    if (!this.leftPressed && !this.rightPressed) {
                        if (platform.type === 'slippery') {
                            // Для скользких платформ добавляем скорость к существующей скорости игрока
                            this.player.body.velocity.x += (deltaX / delta) * 1000;
                        } else {
                            this.player.body.velocity.x = (deltaX / delta) * 1000;
                        }
                    }
                }
            }
        }
        
        this.playerMovement();
        
        // Обновляем индикатор двойного прыжка
        this.updateDoubleJumpIcon();
        
        // Обновляем индикаторы способностей игрока
        this.playerAbilities.updateAbilityIndicators();
        
        // Обновляем активные эффекты бонусов
        this.updateActiveEffects();
        
        const onGround = this.player.body.touching.down;
        
        if (!onGround) {
            this.player.onPlatform = false;
            this.player.currentPlatform = null;
        }
        
        // Включаем отображение границ коллизий только для предметов
        // this.drawItemCollisionDebug();
    }

    drawDebugPlayerCollision() {
        if (!this.player || !this.player.body) return;
        
        this.debugGraphics.clear();
        
        // Рисуем рамку коллизий персонажа
        this.debugGraphics.lineStyle(2, 0xff0000, 1);
        
        const x = this.player.body.x;
        const y = this.player.body.y;
        const width = this.player.body.width;
        const height = this.player.body.height;
        
        this.debugGraphics.strokeRect(x, y, width, height);
    }

    playerHitPlatform(player, platform) {
        if (!platform.active || !player.active) return;

        const playerBottom = player.body.y + player.body.height;
        const platformTop = platform.body.y;
        const isLanding = playerBottom <= platformTop + 10 && player.body.velocity.y > 0;
        
        const isStandingOn = player.body.touching.down && platform.body.touching.up;
        
        if (isStandingOn) {
            player.onPlatform = true;
            player.currentPlatform = platform;
            
            // Сохраняем смещение игрока относительно центра платформы
            if (platform.isMoving) {
                player.platformOffset = player.x - platform.x;
            }
            
            if (isLanding && !platform.wasJumpedOn) {
                platform.wasJumpedOn = true;
                
                let scoreValue = 5;
                
                if (platform.type === 'fragile') {
                    scoreValue = 10;
                } else if (platform.type === 'slippery') {
                    scoreValue = 15;
                } else if (platform.type === 'vanishing') {
                    scoreValue = 20;
                } else if (platform.type === 'sticky') {
                    scoreValue = 10;
                }
                
                this.score += scoreValue;
                
                if (this.sounds && this.sounds.platform) {
                    this.sounds.platform.play();
                }
            }
            
            switch (platform.type) {
                case 'fragile':
                    if (!platform.breaking) {
                        platform.breaking = true;
                        const breakTimer = this.time.delayedCall(300, () => {
                            if (platform.active && platform.container) {
                                this.tweens.add({
                                    targets: platform.container,
                                    alpha: 0,
                                    y: platform.container.y + 20,
                                    duration: 300,
                                    ease: 'Power2',
                                    onComplete: () => {
                                        platform.destroy();
                                    }
                                });
                            }
                        });
                    }
                    break;
                
                case 'slippery':
                    player.isOnSlipperyPlatform = true;
                    
                    const currentVelocity = player.body.velocity.x * 1.1;
                    let targetVelocity = currentVelocity;
                    
                    if (this.leftPressed) {
                        targetVelocity = -this.moveSpeed * 1.5;
                        this.lastDirection = -1; 
                    } else if (this.rightPressed) {
                        targetVelocity = this.moveSpeed * 1.5;
                        this.lastDirection = 1; 
                    } else {
                        // Сохраняем инерцию с минимальным трением
                        if (Math.abs(currentVelocity) > 10) {
                            // Мягкое замедление, очень малое трение для плавного скольжения
                            targetVelocity = currentVelocity * 0.99; 
                            // Сохраняем направление движения
                            this.lastDirection = currentVelocity > 0 ? 1 : -1;
                        } else {
                            // Если скорость совсем низкая, добавляем небольшое скольжение в последнем направлении
                            targetVelocity = this.lastDirection * 150;
                        }
                    }
                    
                    // Применяем скорость напрямую без интерполяции для более выраженного эффекта
                    player.body.velocity.x = targetVelocity;
                    
                    console.log('Скользкая платформа: скорость = ' + player.body.velocity.x);
                    break;
                    
                case 'vanishing':
                    if (!platform.vanishing) {
                        platform.vanishing = true;
                        
                        const blinkTween = this.tweens.add({
                            targets: platform.container,
                            alpha: 0.2,
                            yoyo: true,
                            repeat: 2,
                            duration: 100,
                            onComplete: () => {
                                this.tweens.add({
                                    targets: platform.container,
                                    alpha: 0,
                                    duration: 150,
                                    onComplete: () => {
                                        platform.destroy();
                                    }
                                });
                            }
                        });
                    }
                    break;
                    
                case 'sticky':
                    // Устанавливаем флаг, что игрок на липкой платформе
                    player.isOnStickyPlatform = true;
                    
                    if (!player.stuckOnPlatform) {
                        player.stuckOnPlatform = true;
                        
                        this.tweens.add({
                            targets: player,
                            y: player.y - 5,
                            duration: 100,
                            yoyo: true,
                            ease: 'Sine.easeOut'
                        });
                        
                        // Применяем коэффициент замедления вместо фиксированного значения
                        player.body.velocity.x *= this.stickySlowdownFactor;
                    }
                    break;
                    
                default:
                    player.isOnSlipperyPlatform = false;
                    break;
            }
            
            // Если платформа движется, обрабатываем это
            if (platform.isMoving) {
                // Уменьшаем горизонтальное скольжение игрока на платформе
                if (!this.leftPressed && !this.rightPressed && platform.type !== 'slippery') {
                    player.body.velocity.x = 0;
                }
            }
        } else {
            if (platform.type === 'sticky') {
                player.isOnStickyPlatform = false;
                player.stuckOnPlatform = false;
            }
            if (platform.type === 'slippery') {
                player.isOnSlipperyPlatform = false;
            }
        }
    }
    
    // Активация эффекта платформы при прыжке рядом с ней (без коллизии)
    activatePlatformEffectFromNearbyJump(player, platform) {
        if (!platform.active || !player.active) return;
        
        // Помечаем платформу как использованную для начисления очков
        if (!platform.wasJumpedOn) {
            platform.wasJumpedOn = true;
            
            // Начисление очков за платформу
            let scoreValue = 5;
            
            if (platform.type === 'fragile') {
                scoreValue = 10;
            } else if (platform.type === 'slippery') {
                scoreValue = 15;
            } else if (platform.type === 'vanishing') {
                scoreValue = 20;
            } else if (platform.type === 'sticky') {
                scoreValue = 10;
            }
            
            this.score += scoreValue;
            
            // Воспроизводим звук платформы
            if (this.sounds && this.sounds.platform) {
                this.sounds.platform.play();
            }
        }
        
        // Применяем эффект в зависимости от типа платформы
        switch (platform.type) {
            case 'fragile':
                if (!platform.breaking) {
                    platform.breaking = true;
                    const breakTimer = this.time.delayedCall(300, () => {
                        if (platform.active && platform.container) {
                            this.tweens.add({
                                targets: platform.container,
                                alpha: 0,
                                y: platform.container.y + 20,
                                duration: 300,
                                ease: 'Power2',
                                onComplete: () => {
                                    platform.destroy();
                                }
                            });
                        }
                    });
                }
                break;
                
            case 'vanishing':
                if (!platform.vanishing) {
                    platform.vanishing = true;
                    
                    const blinkTween = this.tweens.add({
                        targets: platform.container,
                        alpha: 0.2,
                        yoyo: true,
                        repeat: 2,
                        duration: 100,
                        onComplete: () => {
                            this.tweens.add({
                                targets: platform.container,
                                alpha: 0,
                                duration: 150,
                                onComplete: () => {
                                    platform.destroy();
                                }
                            });
                        }
                    });
                }
                break;
                
            // Другие типы платформ (slippery, sticky) не активируются,
            // так как их эффекты имеют смысл только при физическом контакте
        }
    }

    createUI() {
        this.scoreText = this.add.text(16, 16, 'Предел твоих возможностей: 0', { 
            fontFamily: 'unutterable',
            fontSize: '20px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1000); // Устанавливаем высокое значение глубины, чтобы текст был поверх всех объектов
        
        if (this.sys.game.device.os.desktop) {
            const controlHint = this.add.text(16, 60, 
                'Управление: ←→ - движение, ПРОБЕЛ - прыжок, S - супер-прыжок', { 
                fontFamily: 'unutterable',
                fontSize: '16px', 
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 2
            });
            controlHint.setScrollFactor(0);
            controlHint.setDepth(1000); // Также устанавливаем высокую глубину для подсказки
            
            this.time.delayedCall(5000, () => {
                controlHint.alpha = 0;
            });
        }
    }

    createMobileControls() {
        if (!this.sys.game.device.os.desktop) {
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
            
            const jumpButton = this.add.circle(700, 500, 40, 0x4de9e7, 0.7);
            jumpButton.setScrollFactor(0);
            jumpButton.setInteractive();
            jumpButton.on('pointerdown', () => {
                this.jumpPressed = true;
            });
            jumpButton.on('pointerup', () => {
                this.jumpPressed = false;
            });
            
            const jumpText = this.add.text(700, 500, "П", {
                fontFamily: 'unutterable',
                fontSize: '32px',
                fill: '#fff'
            }).setOrigin(0.5);
            jumpText.setScrollFactor(0);
        } else {
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            
            this.spaceKey.on('down', () => {
                this.jumpPressed = true;
            });
            this.spaceKey.on('up', () => {
                this.jumpPressed = false;
            });
            
            // Добавляем клавишу D для переключения отладки зоны прыжка
            const dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            dKey.on('down', () => {
                // Переключаем флаг отладки
                this.debugJumpZone = !this.debugJumpZone;
                
                // Если отладка отключена, очищаем графику
                if (!this.debugJumpZone && this.jumpZoneDebugGraphics) {
                    this.jumpZoneDebugGraphics.clear();
                }
            });
        }
    }

    playerMovement() {
        if (!this.player || !this.player.body) return;
        
        const isMoving = this.player.body.velocity.x !== 0;
        
        // Проверяем, не находимся ли мы на липкой платформе
        if (this.player.stuckOnPlatform) {
            // Замедляем движение, но не останавливаем полностью
            if (this.leftPressed) {
                this.player.body.velocity.x = -this.moveSpeed * this.stickySlowdownFactor;
                this.player.setFlipX(false);
            } else if (this.rightPressed) {
                this.player.body.velocity.x = this.moveSpeed * this.stickySlowdownFactor;
                this.player.setFlipX(true);
            } else {
                this.player.body.velocity.x = 0;
            }
        } else if (!this.player.knockbackActive) { // Добавляем проверку флага knockbackActive
            // Если игрок на скользкой платформе, не сбрасываем его скорость
            if (this.player.isOnSlipperyPlatform) {
                // Учитываем направление движения
                if (this.leftPressed) {
                    this.player.body.velocity.x = -this.moveSpeed * 1.5;
                    this.player.setFlipX(false);
                    this.lastDirection = -1;
                } else if (this.rightPressed) {
                    this.player.body.velocity.x = this.moveSpeed * 1.5;
                    this.player.setFlipX(true);
                    this.lastDirection = 1;
                } 
                // Если нет нажатий, скорость сохраняется в playerHitPlatform
            } else {
                // Стандартное горизонтальное движение
                if (this.leftPressed) {
                    this.player.body.velocity.x = -this.moveSpeed;
                    this.player.setFlipX(false);
                } else if (this.rightPressed) {
                    this.player.body.velocity.x = this.moveSpeed;
                    this.player.setFlipX(true);
                } else {
                    this.player.body.velocity.x = 0;
                }
            }
        }
        
        if (this.jumpPressed) {
            const now = Date.now();
            
            if (now - this.lastJumpTime > this.jumpCooldown) {                
                const jumpPerformed = this.playerAbilities.handleJump();
                
                if (jumpPerformed) {
                    this.lastJumpTime = now;
                    
                    this.createJumpDustEffect();
                    
                    if (this.player.isOnStickyPlatform) {
                        this.player.body.velocity.y *= 0.7;
                        this.player.isOnStickyPlatform = false;
                        this.player.stuckOnPlatform = false;
                    }
                    
                    // Обновляем скорость анимации при прыжке
                    this.updateAnimationSpeed();
                }
            }
            
            this.jumpPressed = false;
        }
        
        this.updatePlayerAnimation(this.player.body.touching.down, isMoving);
    }
    
    updatePlayerAnimation(onGround, isMoving) {
        if (onGround && !isMoving) {
            if (this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'still') {
                this.player.animationState.setAnimation(0, 'still', true);
                // Применяем множитель скорости анимации
                this.updateAnimationSpeed();
            }
        }
        else if (!onGround) {
            if (this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'idle') {
                this.player.animationState.setAnimation(0, 'idle', true);
                // Базовая скорость для прыжка
                this.player.animationState.timeScale = 0.3;
                // Применяем множитель скорости анимации
                this.updateAnimationSpeed();
            }
        }
        else if (onGround && isMoving) {
            if (this.player.body.velocity.x < 0) {
                this.player.setFlipX(false);
                
                if (this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'still') {
                    this.player.animationState.setAnimation(0, 'still', true);
                    this.player.animationState.timeScale = 0.5;
                    // Применяем множитель скорости анимации
                    this.updateAnimationSpeed();
                }
            } 
            else if (this.player.body.velocity.x > 0) {
                this.player.setFlipX(true);
                
                if (this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'still') {
                    this.player.animationState.setAnimation(0, 'still', true);
                    this.player.animationState.timeScale = 0.5;
                    // Применяем множитель скорости анимации
                    this.updateAnimationSpeed();
                }
            }
        }
    }

    generatePlatforms() {
        const MAX_JUMP_HEIGHT = this.playerMaxJumpHeight;
        const MAX_JUMP_WIDTH = this.playerMaxJumpDistance;
        
        // Константы для генерации платформ в стиле Doodle Jump
        const MIN_PLATFORM_STEP = 60;  // Минимальное вертикальное расстояние между платформами
        const MAX_PLATFORM_STEP = 120; // Максимальное вертикальное расстояние между платформами
        
        // Минимальное допустимое расстояние между платформами (для проверки перекрытия)
        const MIN_VERTICAL_GAP = 70;   // Увеличено минимальное вертикальное расстояние
        const MIN_HORIZONTAL_GAP = 30; // Минимальное горизонтальное расстояние между краями платформ
        
        // Увеличиваем расстояние между платформами с ростом высоты
        const getStepForHeight = (score) => {
            let step = MIN_PLATFORM_STEP;
            if (score > 500) {
                step += Math.min(40, score / 50);
            }
            return Math.min(MAX_PLATFORM_STEP, step);
        };
        
        // Плотность платформ (сколько платформ на экран)
        const getPlatformDensity = (score) => {
            if (score < 500) {
                return 8; // Больше платформ внизу
            } else if (score < 2000) {
                return 6;
            } else {
                return 5; // Меньше платформ на большой высоте
            }
        };
        
        // Ширина платформ с учетом высоты
        const getPlatformWidth = (score) => {
            const baseWidth = this.platformWidth;
            
            if (score < 300) {
                return baseWidth * (1.0 + Math.random() * 0.5); // 1.0-1.5x в начале
            } else {
                // Постепенное уменьшение размера платформ
                const scaleFactor = Math.max(0.6, 1.0 - (score / 10000));
                return baseWidth * scaleFactor * (0.8 + Math.random() * 0.5);
            }
        };
        
        // Функция проверки перекрытия платформ с учетом их размеров
        const checkPlatformOverlap = (x1, y1, width1, x2, y2, width2) => {
            const distanceX = Math.abs(x1 - x2);
            const distanceY = Math.abs(y1 - y2);
            
            // Проверяем горизонтальное и вертикальное перекрытие
            const horizontalOverlap = distanceX < (width1/2 + width2/2 + MIN_HORIZONTAL_GAP);
            const verticalOverlap = distanceY < MIN_VERTICAL_GAP;
            
            return horizontalOverlap && verticalOverlap;
        };
        
        // Функция получения списка всех активных платформ на экране
        const getAllPlatforms = () => {
            const platforms = [];
            this.allPlatforms.forEach(group => {
                group.getChildren().forEach(platform => {
                    platforms.push(platform);
                });
            });
            return platforms;
        };
        
        // Проверка наличия платформ в определенном диапазоне высоты
        const hasPlatformsInRange = (minY, maxY) => {
            for (const group of this.allPlatforms) {
                for (const platform of group.getChildren()) {
                    if (platform.y >= minY && platform.y <= maxY) {
                        return true;
                    }
                }
            }
            return false;
        };
        
        const totalPlatforms = this.platforms.countActive() + this.fragilePlatforms.countActive() + 
            this.slipperyPlatforms.countActive() + this.vanishingPlatforms.countActive() + 
            this.stickyPlatforms.countActive() + this.movingPlatforms.countActive();
            
        if (totalPlatforms === 0) {
            // Первая платформа (стартовая) - обычная для удобства начала игры
            this.createPlatform(
                this.cameras.main.width / 2,
                this.cameras.main.height - 100,
                this.platformWidth * 2.5,
                this.platformHeight,
                'normal',
                false // Не двигается
            );
            this.lastPlatformY = this.cameras.main.height - 100;
            
            // Добавляем несколько дополнительных платформ внизу для начала игры
            let lastY = this.lastPlatformY;
            const initialPlatformsCount = 8;
            
            for (let i = 0; i < initialPlatformsCount; i++) {
                // Увеличиваем расстояние между платформами в начале игры
                lastY -= 90 + Math.random() * 30;
                
                // Чередуем позиции слева направо
                let x;
                if (i % 3 === 0) {
                    // Левая часть экрана
                    x = this.cameras.main.width * 0.25 + (Math.random() - 0.5) * 100;
                } else if (i % 3 === 1) {
                    // Правая часть экрана
                    x = this.cameras.main.width * 0.75 + (Math.random() - 0.5) * 100;
                } else {
                    // Середина экрана
                    x = this.cameras.main.width * 0.5 + (Math.random() - 0.5) * 150;
                }
                
                // Ограничиваем x, чтобы платформа не выходила за края экрана
                const platformWidth = this.platformWidth * 1.5;
                x = Math.max(platformWidth/2 + 10, Math.min(this.cameras.main.width - platformWidth/2 - 10, x));
                
                this.createPlatform(
                    x,
                    lastY,
                    platformWidth,
                    this.platformHeight,
                    'normal',
                    false
                );
            }
            
            // Обновляем последнюю Y-координату
            this.lastPlatformY = lastY;
            
            return;
        }
        
        if (totalPlatforms > this.maxPlatforms) {
            this.allPlatforms.forEach(group => {
                const platforms = group.getChildren();
                
                if (platforms.length > 10) {
                    const toRemoveCount = Math.floor(platforms.length * 0.15);
                    
                    let toRemove = [];
                    for (let i = 0; i < toRemoveCount; i++) {
                        let lowestPlatform = null;
                        let lowestY = -Infinity;
                        
                        platforms.forEach(platform => {
                            if (!toRemove.includes(platform) && platform.y > lowestY) {
                                lowestPlatform = platform;
                                lowestY = platform.y;
                            }
                        });
                        
                        if (lowestPlatform) {
                            toRemove.push(lowestPlatform);
                        }
                    }
                    
                    toRemove.forEach(platform => platform.destroy());
                }
            });
        }

        // Проверяем, нужно ли генерировать новые платформы
        const viewportTop = this.cameras.main.scrollY;
        const bufferZone = 800; // Буферная зона над видимой областью
        const shouldGenerate = !this.player || this.lastPlatformY > viewportTop - bufferZone;
        
        // Проверяем, есть ли платформы на высотах 600-800
        const needPlatformsInInitialRange = !hasPlatformsInRange(600, 800) && this.score < 300;
        
        if (shouldGenerate || needPlatformsInInitialRange) {
            this.lastPlatformGenerationTime = Date.now();
            
            // Если нужны платформы на начальных высотах, временно меняем lastPlatformY
            let tempLastPlatformY = this.lastPlatformY;
            if (needPlatformsInInitialRange) {
                tempLastPlatformY = 800; // Начинаем генерацию с высоты 800
            }
            
            const platformDensity = getPlatformDensity(this.score);
            const platformsToGenerate = needPlatformsInInitialRange ? 15 : 10; // Больше платформ, если генерируем начальный диапазон
            const generationHeight = 800; // Высота зоны генерации
            
            // Начинаем с последней сгенерированной платформы
            let currentY = tempLastPlatformY;
            
            // Массив для хранения всех сгенерированных платформ
            const allGeneratedPlatforms = [];
            
            // Получаем все существующие платформы для проверки перекрытий
            const existingPlatforms = getAllPlatforms();
            
            // Создаем координатную сетку для генерации платформ
            // Разбиваем экран на 3 колонки и используем разные колонки для соседних платформ
            const columns = [
                { minX: 80, maxX: this.cameras.main.width * 0.33 - 20 },                  // Левая колонка
                { minX: this.cameras.main.width * 0.33 + 20, maxX: this.cameras.main.width * 0.66 - 20 }, // Средняя колонка
                { minX: this.cameras.main.width * 0.66 + 20, maxX: this.cameras.main.width - 80 }       // Правая колонка
            ];
            
            let lastColumnIndex = -1; // Для отслеживания последней использованной колонки
            
            for (let i = 0; i < platformsToGenerate; i++) {
                // Рассчитываем шаг для текущей высоты
                const step = getStepForHeight(this.score);
                
                // Следующая Y-координата с небольшой вариацией
                currentY -= step + Math.random() * 20;
                
                // Выбираем колонку, отличную от предыдущей, для разнообразия и избегания перекрытий
                let columnIndex;
                do {
                    columnIndex = Math.floor(Math.random() * columns.length);
                } while (columnIndex === lastColumnIndex && columns.length > 1);
                
                lastColumnIndex = columnIndex;
                const column = columns[columnIndex];
                
                // Случайная X-координата внутри выбранной колонки
                let x = column.minX + Math.random() * (column.maxX - column.minX);
                
                // Вычисляем ширину платформы
                const width = getPlatformWidth(this.score);
                
                // Выбираем тип платформы в зависимости от высоты
                let platformType = 'normal';
                let isMoving = false;
                
                if (this.score > 100) {
                    // Определяем шансы для разных типов платформ
                    const normalChance = Math.max(this.minSafePlatformsPercent, 80 - (this.score / 100));
                    const fragileChance = Math.min(30, 5 + (this.score / 400));
                    const slipperyChance = Math.min(25, 5 + (this.score / 500));
                    const vanishingChance = Math.min(20, 3 + (this.score / 600));
                    const stickyChance = Math.min(15, 2 + (this.score / 700));
                    
                    // Общая сумма шансов
                    const totalChance = normalChance + fragileChance + slipperyChance + vanishingChance + stickyChance;
                    
                    // Выбираем тип платформы случайным образом
                    const rand = Math.random() * totalChance;
                    
                    if (rand < normalChance) {
                        platformType = 'normal';
                    } else if (rand < normalChance + fragileChance) {
                        platformType = 'fragile';
                    } else if (rand < normalChance + fragileChance + slipperyChance) {
                        platformType = 'slippery';
                    } else if (rand < normalChance + fragileChance + slipperyChance + vanishingChance) {
                        platformType = 'vanishing';
                    } else {
                        platformType = 'sticky';
                    }
                    
                    // Определяем, будет ли платформа движущейся
                    // Новая формула: чем выше игрок, тем больше вероятность движущихся платформ
                    // При достижении высоты 7000-10000 вероятность 80-95%
                    const movingChance = Math.min(0.95, 0.1 + (this.score / 7500));
                    isMoving = this.score > 300 && Math.random() < movingChance;
                }
                
                // Первые платформы всегда нормальные
                if (i < 3 && this.score < 200) {
                    platformType = 'normal';
                    isMoving = false;
                }
                
                // Проверяем, нет ли конфликта с существующими платформами
                let overlaps = false;
                
                // Проверяем перекрытие с недавно созданными платформами
                for (const platform of allGeneratedPlatforms) {
                    if (checkPlatformOverlap(platform.x, platform.y, platform.displayWidth, x, currentY, width)) {
                        overlaps = true;
                        break;
                    }
                }
                
                // Проверяем перекрытие с уже существующими платформами
                if (!overlaps) {
                    for (const platform of existingPlatforms) {
                        if (checkPlatformOverlap(platform.x, platform.y, platform.displayWidth, x, currentY, width)) {
                            overlaps = true;
                            break;
                        }
                    }
                }
                
                // Если есть перекрытие, пробуем найти другую позицию в той же колонке
                if (overlaps) {
                    let attempts = 0;
                    const maxAttempts = 3;
                    
                    while (overlaps && attempts < maxAttempts) {
                        // Смещаем Y-координату вверх
                        currentY -= 30 + Math.random() * 20;
                        
                        // Генерируем новую X-координату в той же колонке
                        const newX = column.minX + Math.random() * (column.maxX - column.minX);
                        
                        overlaps = false;
                        
                        // Проверяем снова новую позицию
                        for (const platform of allGeneratedPlatforms) {
                            if (checkPlatformOverlap(platform.x, platform.y, platform.displayWidth, newX, currentY, width)) {
                                overlaps = true;
                                break;
                            }
                        }
                        
                        if (!overlaps) {
                            for (const platform of existingPlatforms) {
                                if (checkPlatformOverlap(platform.x, platform.y, platform.displayWidth, newX, currentY, width)) {
                                    overlaps = true;
                                    break;
                                }
                            }
                        }
                        
                        if (!overlaps) {
                            // Найдена хорошая позиция
                            x = newX;
                        }
                        
                        attempts++;
                    }
                }
                
                // Создаем платформу только если нет перекрытия
                if (!overlaps) {
                    const platform = this.createPlatform(
                        x,
                        currentY,
                        width,
                        this.platformHeight,
                        platformType,
                        isMoving
                    );
                    
                    if (platform) {
                        allGeneratedPlatforms.push(platform);
                        existingPlatforms.push(platform); // Добавляем в список для проверки будущих платформ
                        this.lastPlatformY = Math.min(this.lastPlatformY, currentY);
                    }
                }
            }
            
            // Проверяем проходимость - добавляем дополнительные платформы, если расстояние слишком большое
            allGeneratedPlatforms.sort((a, b) => b.y - a.y); // Сортируем по возрастанию высоты (сверху вниз)
            
            for (let i = 1; i < allGeneratedPlatforms.length; i++) {
                const lowerPlatform = allGeneratedPlatforms[i-1];
                const upperPlatform = allGeneratedPlatforms[i];
                
                const dx = Math.abs(lowerPlatform.x - upperPlatform.x);
                const dy = Math.abs(lowerPlatform.y - upperPlatform.y);
                
                // Если платформы слишком далеко друг от друга для прыжка
                if ((dx > MAX_JUMP_WIDTH && dy > 0) || dy > MAX_JUMP_HEIGHT) {
                    // Вычисляем промежуточную позицию
                    const midX = (lowerPlatform.x + upperPlatform.x) / 2 + (Math.random() - 0.5) * 50;
                    const midY = (lowerPlatform.y + upperPlatform.y) / 2;
                    
                    // Проверяем на перекрытие с существующими платформами
                    let bridgeOverlaps = false;
                    const bridgeWidth = this.platformWidth * 1.2;
                    
                    for (const platform of [...allGeneratedPlatforms, ...existingPlatforms]) {
                        if (checkPlatformOverlap(platform.x, platform.y, platform.displayWidth, midX, midY, bridgeWidth)) {
                            bridgeOverlaps = true;
                            break;
                        }
                    }
                    
                    // Создаем промежуточную платформу только если нет перекрытия
                    if (!bridgeOverlaps) {
                        const bridgePlatform = this.createPlatform(
                            midX,
                            midY,
                            bridgeWidth,
                            this.platformHeight,
                            'normal',
                            false
                        );
                        
                        if (bridgePlatform) {
                            allGeneratedPlatforms.push(bridgePlatform);
                            existingPlatforms.push(bridgePlatform);
                        }
                    }
                }
            }

            // В конце функции восстанавливаем lastPlatformY, если мы его временно меняли
            if (needPlatformsInInitialRange && allGeneratedPlatforms.length > 0) {
                // Используем минимальную Y-координату из сгенерированных платформ
                allGeneratedPlatforms.sort((a, b) => a.y - b.y);
                this.lastPlatformY = allGeneratedPlatforms[0].y;
            }
        }
    }

    getPlatformType(heightInfluence) {
        // Увеличиваем шанс специальных платформ и снижаем порог их появления
        const specialChance = 0.7 + (heightInfluence * 0.2);
        
        if (Math.random() < specialChance) {
            let specialTypes = [];
            
            // Хрупкие платформы доступны сразу
            specialTypes.push('fragile', 'fragile');
            
            // Скользкие платформы появляются раньше
            if (heightInfluence > 0.05) {
                specialTypes.push('slippery', 'slippery');
            }
            
            // Исчезающие платформы появляются раньше
            if (heightInfluence > 0.1) {
                specialTypes.push('vanishing');
            }
            
            // Липкие платформы появляются раньше
            if (heightInfluence > 0.1) {
                specialTypes.push('sticky', 'sticky');
            }
            
            return Phaser.Utils.Array.GetRandom(specialTypes);
        }
        
        return 'normal';
    }

    createPlatform(x, y, width, height, type, isMoving = false) {
        if (x === undefined || y === undefined || width === undefined || height === undefined) {
            console.error('Некорректные параметры для создания платформы:', { x, y, width, height, type });
            return null;
        }
        
        let group;
        
        // Определяем группу в зависимости от типа платформы
        if (isMoving) {
            group = this.movingPlatforms;
        } else {
            switch(type) {
                case 'fragile':
                    group = this.fragilePlatforms;
                    break;
                case 'slippery':
                    group = this.slipperyPlatforms;
                    break;
                case 'vanishing':
                    group = this.vanishingPlatforms;
                    break;
                case 'sticky':
                    group = this.stickyPlatforms;
                    break;
                default:
                    group = this.platforms;
                    break;
            }
        }
        
        let textureKey = `platform_${type}`;
        
        // Проверяем доступность текстур
        if (!this.textures.exists(`${textureKey}_left`) || 
            !this.textures.exists(`${textureKey}_mid`) || 
            !this.textures.exists(`${textureKey}_right`)) {
            console.error(`Текстуры для платформы ${type} не найдены`);
            return null;
        }
        
        // Получаем размеры из текстур
        const leftTexture = this.textures.get(`${textureKey}_left`);
        const midTexture = this.textures.get(`${textureKey}_mid`);
        const rightTexture = this.textures.get(`${textureKey}_right`);
        
        const leftWidth = leftTexture.source[0].width;
        const midWidth = midTexture.source[0].width;
        const rightWidth = rightTexture.source[0].width;
        
        // Создаем контейнер для визуальных элементов
        const platformContainer = this.add.container(x, y);
        platformContainer.setDepth(10);
        
        // Рассчитываем масштабированные размеры текстур
        const scaledLeftWidth = leftWidth * this.platformTextureScale;
        const scaledMidWidth = midWidth * this.platformTextureScale;
        const scaledRightWidth = rightWidth * this.platformTextureScale;
        
        // Вычисляем общую визуальную ширину платформы
        const visualWidth = width;
        
        // Создаем физическое тело платформы с размерами равными визуальным
        let platform;
        if (isMoving) {
            platform = group.create(x, y, `${textureKey}_mid`);
            platform.body.setImmovable(true);
            platform.body.allowGravity = false;
            
            // Параметры для движущихся платформ
            const movementDirection = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            const movementDistance = movementDirection === 'horizontal' ? 
                this.horizontalMinDistance + Math.random() * (this.horizontalMaxDistance - this.horizontalMinDistance) : 
                this.verticalMinDistance + Math.random() * (this.verticalMaxDistance - this.verticalMinDistance);
            const movementSpeed = this.movingPlatformMinSpeed + Math.random() * (
                movementDirection === 'horizontal' ? 
                (this.movingPlatformMaxSpeed - this.movingPlatformMinSpeed) : 
                (this.movingPlatformVerticalMaxSpeed - this.movingPlatformMinSpeed)
            );
            
            platform.movementDirection = movementDirection;
            platform.movementDistance = movementDistance;
            platform.movementSpeed = movementSpeed;
            platform.startPosition = { x, y };
            platform.targetPosition = { 
                x: movementDirection === 'horizontal' ? x + movementDistance * (Math.random() < 0.5 ? 1 : -1) : x,
                y: movementDirection === 'vertical' ? y + movementDistance : y
            };
            platform.movingForward = true;
            platform.lastX = x;
            platform.lastY = y;
        } else {
            platform = group.create(x, y, `${textureKey}_mid`);
        }
        
        // Скрываем физическое тело (будет видна только визуальная часть)
        platform.setVisible(false);
        
        // Настраиваем размеры физического тела точно под визуальные размеры
        const scaledWidth = visualWidth;
        const scaledHeight = height;
        platform.setScale(scaledWidth / platform.width, scaledHeight / platform.height);
        platform.refreshBody();
        
        // Сохраняем тип и состояние платформы
        platform.type = type;
        platform.isMoving = isMoving;
        platform.visualWidth = visualWidth;
        
        // Очищаем контейнер перед добавлением новых элементов
        platformContainer.removeAll(true);
        
        // 1. Добавляем левую часть
        const leftPartX = -visualWidth/2 + scaledLeftWidth/2;
        const leftPart = this.add.image(leftPartX, 0, `${textureKey}_left`);
        leftPart.setScale(this.platformTextureScale);
        leftPart.setName('leftPart');
        platformContainer.add(leftPart);
        
        // 3. Вычисляем пространство для средней части
        const middleSpace = visualWidth - scaledLeftWidth - scaledRightWidth;
        
        // 4. Добавляем среднюю часть, но только если есть пространство
        if (middleSpace > 0) {
            // Создаем среднюю часть
            const midPartX = (leftPartX + scaledLeftWidth/2) + middleSpace/2;
            const midPart = this.add.image(midPartX, 0, `${textureKey}_mid`);
            
            // Масштабируем среднюю часть по ширине, чтобы заполнить всю середину
            const widthScale = middleSpace / scaledMidWidth;
            const heightScale = this.platformTextureScale;
            
            midPart.setScale(widthScale, heightScale);
            midPart.setName('midPart');
            platformContainer.add(midPart);
        }
        
        // 2. Добавляем правую часть ПОСЛЕДНЕЙ, гарантируя что она будет последней в списке
        const rightPartX = visualWidth/2 - scaledRightWidth/2;
        const rightPart = this.add.image(rightPartX, 0, `${textureKey}_right`);
        rightPart.setScale(this.platformTextureScale);
        rightPart.setName('rightPart');
        platformContainer.add(rightPart);
        
        // Сохраняем ссылку на контейнер
        platform.container = platformContainer;
        
        // Рассчитываем шанс появления предмета в зависимости от высоты (score)
        // Плавная прогрессия шансов (увеличена и начинается раньше):
        // - 20% сразу с начала игры
        // - 25% на высоте 1000
        // - 30% на высоте 3000
        // - 35% на высоте 5000 и выше
        let itemChance = 0.2; // Базовый шанс появления предметов
        
        if (this.score <= 1000) {
            // Линейная интерполяция между 0.20 и 0.25
            itemChance = 0.20 + (this.score) * 0.05 / 1000;
        } else if (this.score <= 3000) {
            // Линейная интерполяция между 0.25 и 0.30
            itemChance = 0.25 + (this.score - 1000) * 0.05 / 2000;
        } else if (this.score <= 5000) {
            // Линейная интерполяция между 0.30 и 0.35
            itemChance = 0.30 + (this.score - 3000) * 0.05 / 2000;
        } else {
            // Максимальный шанс 35%
            itemChance = 0.35;
        }
        
        // Для движущихся платформ немного увеличиваем шанс появления предметов
        if (isMoving) {
            itemChance += 0.05;
        }
        
        if (Math.random() < itemChance) {
            this.createItem(platform);
        }
        
        // Переопределяем метод уничтожения для корректной очистки
        const originalDestroy = platform.destroy;
        platform.destroy = function() {
            if (this.container) {
                this.container.destroy();
            }
            if (this.item) {
                this.item.destroy();
            }
            originalDestroy.call(this);
        };
        
        // Обновляем положение последней платформы
        this.lastPlatformY = Math.min(this.lastPlatformY, y);
        
        return platform;
    }

    updateMovingPlatform(platform, delta) {
        if (!platform.active || !platform.movementDirection) return;
        
        // Сохраняем текущую позицию для расчета смещения
        platform.lastX = platform.x;
        platform.lastY = platform.y;
        
        const speed = platform.movementSpeed * (delta / 1000);
        
        if (platform.movingForward) {
            // Движение к целевой позиции
            const distanceX = platform.targetPosition.x - platform.x;
            const distanceY = platform.targetPosition.y - platform.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            if (distance < speed) {
                // Если платформа достигла целевой точки
                platform.x = platform.targetPosition.x;
                platform.y = platform.targetPosition.y;
                platform.movingForward = false;
            } else {
                // Перемещаем платформу в направлении цели
                const directionX = distanceX / distance;
                const directionY = distanceY / distance;
                
                platform.x += directionX * speed;
                platform.y += directionY * speed;
            }
        } else {
            // Движение к начальной позиции
            const distanceX = platform.startPosition.x - platform.x;
            const distanceY = platform.startPosition.y - platform.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            if (distance < speed) {
                // Если платформа вернулась в начальную точку
                platform.x = platform.startPosition.x;
                platform.y = platform.startPosition.y;
                platform.movingForward = true;
            } else {
                // Перемещаем платформу в направлении начальной точки
                const directionX = distanceX / distance;
                const directionY = distanceY / distance;
                
                platform.x += directionX * speed;
                platform.y += directionY * speed;
            }
        }
        
        // Устанавливаем скорость для физического тела платформы
        const velocityX = (platform.x - platform.lastX) * (1000 / delta);
        const velocityY = (platform.y - platform.lastY) * (1000 / delta);
        platform.body.velocity.x = velocityX;
        platform.body.velocity.y = velocityY;
        
        // Обновляем положение контейнера с визуальными элементами
        if (platform.container) {
            platform.container.x = platform.x;
            platform.container.y = platform.y;
        }
        
        // Обновляем положение предмета, если он есть на платформе
        if (platform.item && platform.item.active) {
            const item = platform.item;
            item.x = platform.x;
            
            // Обрабатываем предметы с разными типами анимации
            if (item.customHoverTween && item.customHoverTween.isPlaying()) {
                // Если есть кастомная анимация парения, используем её прогресс
                const baseY = platform.y + item.hoverOffset;
                const amplitude = item.hoverAmplitude || 7;
                
                // Вычисляем Y-позицию на основе синусоидального движения
                const progress = item.hoverProgress || 0;
                const offset = Math.sin(progress * Math.PI) * amplitude;
                item.y = baseY - offset;
                
                // Обновляем физическое тело предмета
                item.body.position.x = item.x - item.body.width / 2;
                item.body.position.y = item.y - item.body.height / 2;
                item.body.updateFromGameObject();
            } else if (item.initialYOffset !== undefined) {
                // Для обычных предметов просто обновляем базовую позицию
                if (item.hoverTween) {
                    const baseY = platform.y + item.initialYOffset;
                    
                    // Обновляем параметры существующей анимации
                    const currentY = item.y;
                    const currentAmplitude = Math.abs(currentY - baseY);
                    
                    if (currentAmplitude < 1) {
                        // Если анимация в крайней точке, обновляем целевые значения
                        item.hoverTween.updateTo('y', baseY - 7, true);
                    } else {
                        // Иначе сохраняем амплитуду, но смещаем базовую точку
                        const isMovingUp = item.hoverTween.isPlaying() && item.y > baseY;
                        const targetY = isMovingUp ? baseY - 7 : baseY;
                        item.hoverTween.updateTo('y', targetY, true);
                    }
                    
                    // Обновляем физическое тело предмета после обновления tween
                    item.body.position.x = item.x - item.body.width / 2;
                    item.body.position.y = item.y - item.body.height / 2;
                    item.body.updateFromGameObject();
                } else {
                    // Если нет анимации, просто обновляем положение
                    item.y = platform.y + item.initialYOffset;
                    
                    // Обновляем физическое тело предмета
                    item.body.position.x = item.x - item.body.width / 2;
                    item.body.position.y = item.y - item.body.height / 2;
                }
            }
            
            // Обновляем флаг для Arcade Physics, указывающий что тело перемещено
            item.refreshBody(); // Полностью пересоздаем колизионное тело с новыми координатами
            
            // Восстанавливаем кастомные размеры коллизии
            if (item.customBodySize && item.customBodyOffset) {
                item.body.setSize(item.customBodySize.width, item.customBodySize.height);
                item.body.setOffset(item.customBodyOffset.x, item.customBodyOffset.y);
            } else {
                item.refreshBody();
            }
        }
    }

    updatePlatformScales() {
        this.allPlatforms.forEach(group => {
            group.getChildren().forEach(platform => {
                if (platform.container) {
                    const width = platform.visualWidth || platform.width;
                    
                    const textureKey = `platform_${platform.type}`;
                    const leftTexture = this.textures.get(`${textureKey}_left`);
                    const midTexture = this.textures.get(`${textureKey}_mid`);
                    const rightTexture = this.textures.get(`${textureKey}_right`);
                    
                    if (leftTexture && midTexture && rightTexture) {
                        const leftWidth = leftTexture.source[0].width;
                        const midWidth = midTexture.source[0].width;
                        const rightWidth = rightTexture.source[0].width;
                        const platformHeight = leftTexture.source[0].height;
                        
                        // Обновляем физическое тело платформы
                        const scaledHeight = this.platformHeight;
                        platform.setScale(width / platform.width, scaledHeight / platform.height);
                        platform.refreshBody();
                        
                        const parts = platform.container.list;
                        
                        // Находим части по именам вместо позиций в массиве
                        let leftPart = null;
                        let rightPart = null;
                        let midParts = [];
                        
                        parts.forEach(part => {
                            if (part.name === 'leftPart') {
                                leftPart = part;
                            } else if (part.name === 'rightPart') {
                                rightPart = part;
                            } else if (part.name === 'midPart') {
                                midParts.push(part);
                            }
                        });
                        
                        // Обновляем левую часть
                        if (leftPart) {
                            leftPart.setScale(this.platformTextureScale);
                            leftPart.x = -width/2 + (leftWidth*this.platformTextureScale)/2;
                        }
                        
                        // Обновляем правую часть
                        if (rightPart) {
                            rightPart.setScale(this.platformTextureScale);
                            rightPart.x = width/2 - (rightWidth*this.platformTextureScale)/2;
                        }
                        
                        // Обновляем средние части
                        if (midParts.length > 0) {
                            const scaledLeftWidth = leftWidth * this.platformTextureScale;
                            const scaledRightWidth = rightWidth * this.platformTextureScale;
                            const middleSpace = width - scaledLeftWidth - scaledRightWidth;
                            
                            if (middleSpace > 0 && midParts.length === 1) {
                                const midPart = midParts[0];
                                const midPartX = -width/2 + scaledLeftWidth + middleSpace/2;
                                const widthScale = middleSpace / (midWidth * this.platformTextureScale);
                                
                                midPart.x = midPartX;
                                midPart.setScale(widthScale, this.platformTextureScale);
                            }
                        }
                    }
                }
            });
        });
    }

    createJumpDustEffect() {
        if (!this.player) return;
        
        const dustCount = 10;
        
        for (let i = 0; i < dustCount; i++) {
            const x = this.player.x + Phaser.Math.Between(-20, 20);
            const y = this.player.y + 30 + Phaser.Math.Between(-5, 5);
            
            const dust = this.add.circle(x, y, Phaser.Math.Between(2, 4), 0xcccccc, 0.7);
            dust.setDepth(90);
            
            this.tweens.add({
                targets: dust,
                x: x + Phaser.Math.Between(-30, 30),
                y: y + Phaser.Math.Between(10, 25),
                alpha: 0,
                scale: { from: 1, to: 0.5 },
                duration: Phaser.Math.Between(200, 400),
                ease: 'Power2',
                onComplete: () => {
                    dust.destroy();
                }
            });
        }
    }

    // Метод для отрисовки зоны проверки прыжка с близкой платформы
    drawJumpZoneDebug() {
        if (!this.player || !this.player.body || !this.jumpZoneDebugGraphics) return;
        
        this.jumpZoneDebugGraphics.clear();
        
        // Получаем параметры игрока
        const playerBottom = this.player.body.y + this.player.body.height;
        const playerWidth = this.player.body.width;
        const playerX = this.player.body.x;
        
        // Рисуем прямоугольник зоны проверки платформ для прыжка
        this.jumpZoneDebugGraphics.lineStyle(2, 0x00ff00, 0.8);
        this.jumpZoneDebugGraphics.strokeRect(playerX, playerBottom, playerWidth, 15);
        
        // Проверяем, нашлась ли платформа рядом
        const platformNearby = this.playerAbilities.isPlatformNearby();
        
        // Если платформа найдена, меняем цвет прямоугольника
        if (platformNearby) {
            this.jumpZoneDebugGraphics.fillStyle(0x00ff00, 0.3);
            this.jumpZoneDebugGraphics.fillRect(playerX, playerBottom, playerWidth, 15);
        }
    }

    createItem(platform) {
        // Если на платформе уже есть предмет, не создаем новый
        if (platform.item) return;
        
        // Выбираем случайный тип предмета на основе шансов
        const itemType = this.getRandomItemType();
        if (!itemType) return;
        
        // Получаем размер текстуры предмета
        const itemTexture = this.textures.get(`item_${itemType}`);
        const itemHeight = itemTexture.getSourceImage().height * this.itemScale;
        
        // Создаем предмет
        const x = platform.x;
        const y = platform.y - (itemHeight / 2) + 10; // Учитываем половину высоты предмета
        
        const item = this.items.create(x, y, `item_${itemType}`);
        item.setScale(this.itemScale);
        item.setDepth(20); // Чтобы отображался над платформами
        
        // Если платформа движущаяся, сохраняем начальное смещение по Y
        if (platform.isMoving) {
            item.initialYOffset = y - platform.y;
        }
        
        // Фиксируем предмет в пространстве и уменьшаем зону коллизий
        item.body.allowGravity = false;
        item.body.immovable = true;
        
        // Уменьшаем размер коллизии до 30% от видимого размера
        const texWidth = item.width * 0.3;
        const texHeight = item.height * 0.3;
        item.body.setSize(texWidth, texHeight);
        item.body.setOffset((item.width - texWidth) / 2, (item.height - texHeight) / 2);
        
        // Сохраняем размеры физического тела для правильного обновления
        item.customBodySize = { width: texWidth, height: texHeight };
        item.customBodyOffset = { 
            x: (item.width - texWidth) / 2, 
            y: (item.height - texHeight) / 2 
        };
        
        // Добавляем анимацию "парения"
        const hoverTween = this.tweens.add({
            targets: item,
            y: y - 7, // Небольшая амплитуда парения
            duration: 1000, // Медленное плавное движение
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        // Если предмет на движущейся платформе, настраиваем специальную анимацию
        if (platform.isMoving) {
            // Останавливаем стандартную анимацию парения и сохраняем свойства
            hoverTween.pause();
            item.hoverAmplitude = 7; // Амплитуда парения
            item.hoverOffset = item.initialYOffset; // Начальное смещение от платформы
            
            // Создаем кастомную анимацию парения, которая будет обновляться в updateMovingPlatform
            const customHoverTween = this.tweens.add({
                targets: { value: 0 }, // Используем фиктивную цель
                value: 1,
                duration: 1000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                onUpdate: (tween) => {
                    // Не обновляем позицию здесь, это будет делаться в updateMovingPlatform
                    // Только сохраняем прогресс анимации
                    item.hoverProgress = tween.progress;
                }
            });
            
            // Сохраняем ссылку на кастомную анимацию
            item.customHoverTween = customHoverTween;
        }
        
        // Добавляем свечение в зависимости от типа предмета
        let tint;
        if (this.itemTypes[itemType].type === 'bonus') {
            tint = 0x00ff00; // Зеленый для бонусов
        } else if (this.itemTypes[itemType].type === 'obstacle') {
            tint = 0xffff00; // Желтый для помех
        } else {
            tint = 0xff0000; // Красный для ловушек
        }
        
        // Добавляем тонкую рамку вместо мерцания
        item.setTint(tint);
        
        // Привязываем предмет к платформе и сохраняем ссылки
        platform.item = item;
        item.platform = platform;
        item.itemType = itemType;
        item.itemData = this.itemTypes[itemType];
        item.hoverTween = hoverTween; // Сохраняем ссылку на анимацию
        
        // Создаем границы коллизии для визуализации
        if (!this.itemDebugGraphics) {
            this.itemDebugGraphics = this.add.graphics();
        }
        
        return item;
    }

    getRandomItemType() {
        // Создаем массив шансов для каждого типа предмета
        const items = [];
        let totalChance = 0;
        
        // Увеличиваем базовые шансы для всех типов предметов
        // Это обеспечит более равномерное распределение разных типов предметов
        for (const [type, data] of Object.entries(this.itemTypes)) {
            // Увеличиваем шанс редких предметов на 30%
            let adjustedChance = data.chance * 1.3;
            
            totalChance += adjustedChance;
            items.push({ type, chance: adjustedChance });
        }
        
        // Выбираем случайный предмет на основе шансов
        let random = Math.random() * totalChance;
        let currentChance = 0;
        
        for (const item of items) {
            currentChance += item.chance;
            if (random <= currentChance) {
                return item.type;
            }
        }
        
        // В случае ошибки возвращаем первый тип предмета
        return items.length > 0 ? items[0].type : null;
    }

    playerCollectItem(player, item) {
        if (!item.active) return;
        
        // Получаем тип предмета и его данные
        const itemType = item.itemType;
        const itemData = item.itemData;
        
        // Воспроизводим звук
        if (this.itemSounds[itemType]) {
            this.itemSounds[itemType].play();
        } else {
            this.powerupSound.play();
        }
        
        // Применяем эффект в зависимости от типа предмета
        switch (itemType) {
            case 'jump_boost':
                this.applyJumpBoost(itemData);
                break;
            case 'jump_height':
                this.applyJumpHeight(itemData);
                break;
            case 'shockwave':
                this.applyShockwave(itemData);
                break;
            case 'freeze':
                this.applyFreeze(itemData);
                break;
            case 'decrease_jump':
                this.applyDecreaseJump(itemData);
                break;
            case 'knockback':
                this.applyKnockback(itemData);
                break;
        }
        
        // Удаляем предмет
        item.platform.item = null;
        item.destroy();
    }

    // Методы для применения эффектов предметов
    
    applyJumpBoost(itemData) {
        // Проверяем, есть ли активный эффект этого типа
        const existingEffect = this.activeEffects.find(effect => effect.type === 'jump_boost');
        
        if (existingEffect) {
            // Продлеваем время действия эффекта
            if (existingEffect.timer) {
                existingEffect.timer.remove();
            }
            
            // Обновляем время начала и таймер эффекта
            existingEffect.startTime = Date.now();
            existingEffect.timer = this.time.delayedCall(itemData.duration, () => {
                // Удаляем эффект из активных
                this.removeEffect(existingEffect.id);
                
                // Перерассчитываем множитель для всех оставшихся активных эффектов
                this.recalculateJumpCooldownMultiplier();
                
                // Обновляем скорость анимации
                this.updateAnimationSpeed();
            }, [], this);
            
            // Обновляем таймер отображения
            this.updateEffectTimer(existingEffect);
        } else {
            // Применяем эффект ускорения прыжков из конфигурации
            this.jumpCooldownMultiplier = 1.0 / itemData.speedMultiplier;
            
            // Обновляем реальное значение jumpCooldown
            this.updateJumpCooldown();
            
            // Добавляем эффект в активные эффекты
            const effectId = 'jump_boost_' + Date.now();
            const effect = {
                id: effectId,
                type: 'jump_boost',
                name: 'Ускорение прыжков',
                factor: itemData.speedMultiplier, // Сохраняем коэффициент эффекта
                animationSpeedFactor: itemData.animationSpeedMultiplier, // Сохраняем коэффициент скорости анимации
                timer: this.time.delayedCall(itemData.duration, () => {
                    // Удаляем эффект из активных
                    this.removeEffect(effectId);
                    
                    // Перерассчитываем множитель для всех оставшихся активных эффектов
                    this.recalculateJumpCooldownMultiplier();
                    
                    // Обновляем скорость анимации
                    this.updateAnimationSpeed();
                }, [], this),
                startTime: Date.now(),
                duration: itemData.duration
            };
            
            this.activeEffects.push(effect);
            
            // Добавляем визуальный индикатор эффекта
            this.addEffectIcon(effect);
            
            // Обновляем скорость анимации
            this.updateAnimationSpeed();
        }
    }
    
    recalculateJumpCooldownMultiplier() {
        // Сбрасываем множитель к базовому значению
        this.jumpCooldownMultiplier = 1.0;
        
        // Применяем множитель от активного эффекта jump_boost (если есть)
        const jumpBoostEffect = this.activeEffects.find(effect => effect.type === 'jump_boost');
        if (jumpBoostEffect && jumpBoostEffect.factor) {
            // Применяем множитель обратно, как в методе applyJumpBoost
            this.jumpCooldownMultiplier = this.jumpCooldownMultiplier / jumpBoostEffect.factor;
        }
        
        // Обновляем значение cooldown
        this.updateJumpCooldown();
    }
    
    applyJumpHeight(itemData) {
        // Проверяем, есть ли активный эффект этого типа
        const existingEffect = this.activeEffects.find(effect => effect.type === 'jump_height');
        
        if (existingEffect) {
            // Продлеваем время действия эффекта
            if (existingEffect.timer) {
                existingEffect.timer.remove();
            }
            
            // Обновляем время начала и таймер эффекта
            existingEffect.startTime = Date.now();
            existingEffect.timer = this.time.delayedCall(itemData.duration, () => {
                // Удаляем эффект из активных
                this.removeEffect(existingEffect.id);
                
                // Пересчитываем множители для всех оставшихся активных эффектов
                this.recalculateJumpVelocityMultiplier();
            }, [], this);
            
            // Обновляем таймер отображения
            this.updateEffectTimer(existingEffect);
        } else {
            // Применяем новый эффект увеличения высоты прыжка (учитываем только конфигурацию)
            this.jumpVelocityMultiplier = 1.0 * itemData.heightMultiplier;
            
            // Обновляем реальное значение jumpVelocity
            this.updateJumpVelocity();
            
            // Добавляем эффект в активные эффекты
            const effectId = 'jump_height_' + Date.now();
            const effect = {
                id: effectId,
                type: 'jump_height',
                name: 'Увеличение высоты прыжков',
                factor: itemData.heightMultiplier, // Сохраняем коэффициент эффекта
                timer: this.time.delayedCall(itemData.duration, () => {
                    // Удаляем эффект из активных
                    this.removeEffect(effectId);
                    
                    // Пересчитываем множители для всех оставшихся активных эффектов
                    this.recalculateJumpVelocityMultiplier();
                }, [], this),
                startTime: Date.now(),
                duration: itemData.duration
            };
            
            this.activeEffects.push(effect);
            
            // Добавляем визуальный индикатор эффекта
            this.addEffectIcon(effect);
        }
    }
    
    // Новый метод для перерасчета множителя скорости прыжка с учетом активных эффектов
    recalculateJumpVelocityMultiplier() {
        // Сбрасываем множитель к базовому значению
        this.jumpVelocityMultiplier = 1.0;
        
        // Проверяем наличие эффектов jump_height и decrease_jump (берем только один из каждого типа)
        const jumpHeightEffect = this.activeEffects.find(effect => effect.type === 'jump_height');
        const decreaseJumpEffect = this.activeEffects.find(effect => effect.type === 'decrease_jump');
        
        // Применяем множитель jump_height, если есть
        if (jumpHeightEffect && jumpHeightEffect.factor) {
            this.jumpVelocityMultiplier *= jumpHeightEffect.factor;
        }
        
        // Применяем множитель decrease_jump, если есть
        if (decreaseJumpEffect && decreaseJumpEffect.factor) {
            this.jumpVelocityMultiplier *= decreaseJumpEffect.factor;
        }
        
        // Обновляем значение jumpVelocity
        this.updateJumpVelocity();
    }
    
    applyShockwave(itemData) {
        // Создаем визуальный эффект ударной волны
        const shockwave = this.add.circle(this.player.x, this.player.y, 10, 0xffffff, 0.7);
        shockwave.setDepth(50);
        
        // Анимируем расширение ударной волны
        this.tweens.add({
            targets: shockwave,
            radius: itemData.radius,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                shockwave.destroy();
            }
        });
        
        // TODO: Добавить отталкивание других игроков, когда они будут реализованы
        // Для демонстрации создадим эффект на платформах рядом
        this.allPlatforms.forEach(group => {
            group.getChildren().forEach(platform => {
                const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, platform.x, platform.y);
                if (distance < itemData.radius && distance > 0) {
                    // Слегка встряхиваем платформу для визуального эффекта
                    this.tweens.add({
                        targets: platform.container,
                        y: platform.y + 10,
                        duration: 100,
                        yoyo: true,
                        repeat: 2
                    });
                }
            });
        });
        
        // Визуальное оповещение о срабатывании эффекта (без таймера, т.к. эффект мгновенный)
        this.showTemporaryMessage('Ударная волна!', 0xffff00);
    }
    
    applyFreeze(itemData) {
        // Проверяем, есть ли активный эффект этого типа
        const existingEffect = this.activeEffects.find(effect => effect.type === 'freeze');
        
        if (existingEffect) {
            // Продлеваем время действия эффекта
            if (existingEffect.timer) {
                existingEffect.timer.remove();
            }
            
            // Обновляем время начала и таймер эффекта
            existingEffect.startTime = Date.now();
            existingEffect.timer = this.time.delayedCall(itemData.duration, () => {
                // Удаляем эффект из активных
                this.removeEffect(existingEffect.id);
                
                // Восстанавливаем скорость передвижения
                this.player.speedMultiplier = 1;
                this.updatePlayerSpeed();
            }, [], this);
            
            // Обновляем таймер отображения
            this.updateEffectTimer(existingEffect);
        } else {
            // Применяем эффект замедления
            this.player.speedMultiplier = itemData.slowdownFactor;
            
            // Обновляем скорость передвижения
            this.updatePlayerSpeed();
            
            // Создаем эффект льда вокруг игрока
            const iceParticles = this.add.particles(this.player.x, this.player.y, 'snowflake', {
                speed: 20,
                scale: { start: 0.3, end: 0 },
                quantity: 5,
                lifespan: 1000,
                alpha: { start: 0.5, end: 0 },
                blendMode: 'ADD',
                follow: this.player
            });
            
            // Добавляем эффект в активные эффекты
            const effectId = 'freeze_' + Date.now();
            const effect = {
                id: effectId,
                type: 'freeze',
                name: 'Замедление',
                particles: iceParticles,
                factor: itemData.slowdownFactor,
                timer: this.time.delayedCall(itemData.duration, () => {
                    // Удаляем эффект из активных
                    this.removeEffect(effectId);
                    
                    // Восстанавливаем скорость передвижения
                    this.player.speedMultiplier = 1;
                    this.updatePlayerSpeed();
                    
                    // Останавливаем и удаляем частицы
                    iceParticles.destroy();
                }, [], this),
                startTime: Date.now(),
                duration: itemData.duration
            };
            
            this.activeEffects.push(effect);
            
            // Добавляем визуальный индикатор эффекта
            this.addEffectIcon(effect);
        }
    }
    
    applyDecreaseJump(itemData) {
        // Проверяем, есть ли активный эффект этого типа
        const existingEffect = this.activeEffects.find(effect => effect.type === 'decrease_jump');
        
        if (existingEffect) {
            // Продлеваем время действия эффекта
            if (existingEffect.timer) {
                existingEffect.timer.remove();
            }
            
            // Обновляем время начала и таймер эффекта
            existingEffect.startTime = Date.now();
            existingEffect.timer = this.time.delayedCall(itemData.duration, () => {
                // Удаляем эффект из активных
                this.removeEffect(existingEffect.id);
                
                // Перерассчитываем множитель для всех оставшихся активных эффектов
                this.recalculateJumpVelocityMultiplier();
            }, [], this);
            
            // Обновляем таймер отображения
            this.updateEffectTimer(existingEffect);
        } else {
            // Применяем эффект уменьшения высоты прыжка из конфигурации
            this.jumpVelocityMultiplier = 1.0 * itemData.heightMultiplier;
            
            // Обновляем реальное значение jumpVelocity
            this.updateJumpVelocity();
            
            // Добавляем эффект в активные эффекты
            const effectId = 'decrease_jump_' + Date.now();
            const effect = {
                id: effectId,
                type: 'decrease_jump',
                name: 'Уменьшение высоты прыжков',
                factor: itemData.heightMultiplier, // Сохраняем коэффициент эффекта
                timer: this.time.delayedCall(itemData.duration, () => {
                    // Удаляем эффект из активных
                    this.removeEffect(effectId);
                    
                    // Перерассчитываем множитель для всех оставшихся активных эффектов
                    this.recalculateJumpVelocityMultiplier();
                }, [], this),
                startTime: Date.now(),
                duration: itemData.duration
            };
            
            this.activeEffects.push(effect);
            
            // Добавляем визуальный индикатор эффекта
            this.addEffectIcon(effect);
        }
    }
    
    applyKnockback(itemData) {
        // Определяем случайное направление отброса
        const direction = Math.random() < 0.5 ? -1 : 1;
        
        // Применяем силу отброса по горизонтали, увеличиваем силу для заметного эффекта
        this.player.body.velocity.x = direction * itemData.force * 1.5;
        
        // Устанавливаем флаг knockbackActive, чтобы предотвратить сброс скорости в playerMovement
        this.player.knockbackActive = true;
        
        // Отключаем флаг через короткое время
        this.time.delayedCall(500, () => {
            this.player.knockbackActive = false;
        });
        
        // Создаем эффект частиц для визуализации отброса
        const particles = this.add.particles(this.player.x, this.player.y, 'item_knockback', {
            speed: 100,
            scale: { start: 0.2, end: 0 },
            quantity: 10,
            lifespan: 500,
            alpha: { start: 0.8, end: 0 },
            blendMode: 'ADD'
        });
        
        // Уничтожаем эффект через время
        this.time.delayedCall(500, () => {
            particles.destroy();
        });
        
        // Визуальное оповещение о срабатывании эффекта (без таймера, т.к. эффект мгновенный)
        this.showTemporaryMessage('Отброс!', 0xff6600);
    }
    
    removeEffect(typeOrId) {
        // Находим эффект по типу или идентификатору
        const index = this.activeEffects.findIndex(effect => 
            effect.type === typeOrId || effect.id === typeOrId
        );
        
        if (index !== -1) {
            const effect = this.activeEffects[index];
            console.log(`Удаление эффекта: ${effect.type} с ID ${effect.id}`);
            
            // Отменяем таймер, если он существует
            if (effect.timer) {
                effect.timer.remove();
            }
            
            // Удаляем визуальное отображение эффекта
            this.removeEffectIcon(effect);
            
            // Удаляем эффект из массива
            this.activeEffects.splice(index, 1);
            
            // Если был удален эффект jump_boost, обновляем скорость анимации
            if (effect.type === 'jump_boost') {
                this.updateAnimationSpeed();
            }
            
            console.log(`Активные эффекты после удаления:`, 
                this.activeEffects.map(e => `${e.type} (ID: ${e.id})`));
            
            return true;
        }
        
        return false;
    }
    
    updateActiveEffects() {
        // Обновляем индикацию активных эффектов
        for (const effect of this.activeEffects) {
            this.updateEffectTimer(effect);
        }
    }
    
    addEffectIcon(effect) {
        // Если уже есть иконка этого эффекта, удаляем её
        if (this.effectsUI[effect.id]) {
            this.removeEffectIcon(effect);
        }
        
        // Создаем контейнер для эффекта
        const effectContainer = this.add.container(0, 0);
        
        // Определяем цвет фона в зависимости от типа эффекта
        let bgColor;
        if (effect.type.includes('jump_boost') || effect.type.includes('jump_height')) {
            bgColor = 0x00ff00; // Зеленый для положительных эффектов
        } else if (effect.type.includes('decrease_jump')) {
            bgColor = 0xff0000; // Красный для негативных эффектов
        } else {
            bgColor = 0xffff00; // Желтый для других эффектов
        }
        
        // Создаем круглый фон для иконки
        const iconBg = this.add.circle(20, 20, 20, bgColor, 0.8).setOrigin(0.5);
        effectContainer.add(iconBg);
        
        // Создаем иконку эффекта
        const iconKey = `item_${effect.type.split('_')[0]}_${effect.type.split('_')[1]}`;
        const icon = this.add.image(20, 20, iconKey).setOrigin(0.5);
        icon.setScale(0.4);
        effectContainer.add(icon);
        
        // Добавляем индикатор оставшегося времени в виде круговой полосы
        const timerArc = this.add.graphics();
        effectContainer.add(timerArc);
        
        // Сохраняем ссылку на контейнер и элементы для обновления таймера
        this.effectsUI[effect.id] = {
            container: effectContainer,
            timerArc: timerArc,
            maxDuration: effect.duration
        };
        
        // Обновляем таймер сразу
        this.updateEffectTimer(effect);
        
        // Добавляем в контейнер эффектов
        this.effectsIconsContainer.add(effectContainer);
        
        // Перепозиционируем все иконки
        this.repositionEffectIcons();
    }
    
    removeEffectIcon(effect) {
        if (this.effectsUI[effect.id]) {
            // Удаляем контейнер с иконкой
            this.effectsUI[effect.id].container.destroy();
            
            // Удаляем ссылку на элементы
            delete this.effectsUI[effect.id];
            
            // Перепозиционируем оставшиеся эффекты
            this.repositionEffectIcons();
        }
    }
    
    updateEffectTimer(effect) {
        if (this.effectsUI[effect.id]) {
            const remainingTime = effect.duration - (Date.now() - effect.startTime);
            const progress = Math.max(0, Math.min(1, remainingTime / this.effectsUI[effect.id].maxDuration));
            
            // Обновляем круговую полосу таймера
            const timerArc = this.effectsUI[effect.id].timerArc;
            timerArc.clear();
            
            // Рисуем серую полную окружность (фон)
            timerArc.lineStyle(3, 0x666666, 0.5);
            timerArc.strokeCircle(20, 20, 22);
            
            // Рисуем белую дугу, показывающую оставшееся время
            if (progress > 0) {
                timerArc.lineStyle(3, 0xFFFFFF, 1);
                timerArc.beginPath();
                timerArc.arc(20, 20, 22, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(270 + 360 * progress), false);
                timerArc.strokePath();
            }
        }
    }
    
    repositionEffectIcons() {
        // Перепозиционируем иконки эффектов в один ряд
        const effectIds = Object.keys(this.effectsUI);
        
        effectIds.forEach((id, index) => {
            const container = this.effectsUI[id].container;
            container.x = index * 50;
            container.y = 0;
        });
    }
    
    formatTime(ms) {
        // Форматируем время в секундах с одним знаком после запятой
        return (ms / 1000).toFixed(1);
    }
    
    showTemporaryMessage(message, color = 0xffffff) {
        // Создаем текстовое сообщение для мгновенных эффектов
        const text = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, message, {
            fontFamily: 'unutterable',
            fontSize: '24px',
            color: this.rgbToHex(color),
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        text.setScrollFactor(0);
        text.setDepth(200);
        
        // Анимируем появление и исчезновение
        this.tweens.add({
            targets: text,
            alpha: { from: 0, to: 1 },
            y: { from: this.cameras.main.centerY - 50, to: this.cameras.main.centerY - 150 },
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: text,
                    alpha: 0,
                    duration: 500,
                    delay: 500,
                    onComplete: () => {
                        text.destroy();
                    }
                });
            }
        });
    }
    
    rgbToHex(color) {
        // Конвертирует числовое представление цвета в строку "#RRGGBB"
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    createEffectsUI() {
        // Создаем контейнер для отображения активных эффектов
        this.effectsContainer = this.add.container(16, 100);
        this.effectsContainer.setScrollFactor(0);
        this.effectsContainer.setDepth(200);
        
        // Контейнер для иконок эффектов
        this.effectsIconsContainer = this.add.container(0, 0);
        this.effectsContainer.add(this.effectsIconsContainer);
        
        // Объект для хранения и отслеживания визуальных эффектов на экране
        this.effectsUI = {};
        
        // Добавляем индикатор двойного прыжка в том же стиле, что и эффекты
        this.createDoubleJumpIcon();
    }

    // Добавляем новый метод для создания иконки двойного прыжка
    createDoubleJumpIcon() {
        // Создаем контейнер для эффекта
        const doubleJumpContainer = this.add.container(0, 0);
        
        // Создаем круглый фон для иконки
        const iconBg = this.add.circle(20, 20, 20, 0x0066cc, 0.8).setOrigin(0.5);
        doubleJumpContainer.add(iconBg);
        
        // Создаем иконку эффекта
        const icon = this.add.image(20, 20, 'double_jump').setOrigin(0.5);
        icon.setScale(0.4);
        doubleJumpContainer.add(icon);
        
        // Добавляем индикатор кулдауна в виде круговой полосы
        const timerArc = this.add.graphics();
        doubleJumpContainer.add(timerArc);
        
        // Сохраняем ссылку на контейнер и элементы
        this.doubleJumpUI = {
            container: doubleJumpContainer,
            timerArc: timerArc,
            iconBg: iconBg
        };
        
        // Добавляем в контейнер эффектов
        this.effectsIconsContainer.add(doubleJumpContainer);
        
        // Перепозиционируем все иконки
        this.repositionEffectIcons();
    }
    
    // Обновление индикатора двойного прыжка
    updateDoubleJumpIcon() {
        if (this.doubleJumpUI && this.playerAbilities) {
            const doubleJump = this.playerAbilities.abilities.doubleJump;
            
            // Обновляем цвет фона в зависимости от доступности
            if (!doubleJump.available) {
                this.doubleJumpUI.iconBg.setFillStyle(0x888888, 0.8);
                
                // Рассчитываем прогресс кулдауна
                const now = Date.now();
                const elapsed = now - doubleJump.lastUsed;
                const cooldown = doubleJump.cooldown;
                const progress = Math.min(1, elapsed / cooldown);
                
                // Обновляем круговую полосу таймера
                const timerArc = this.doubleJumpUI.timerArc;
                timerArc.clear();
                
                // Рисуем серую полную окружность (фон)
                timerArc.lineStyle(3, 0x666666, 0.5);
                timerArc.strokeCircle(20, 20, 22);
                
                // Рисуем белую дугу, показывающую оставшееся время
                if (progress > 0) {
                    timerArc.lineStyle(3, 0xFFFFFF, 1);
                    timerArc.beginPath();
                    timerArc.arc(20, 20, 22, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(270 + 360 * progress), false);
                    timerArc.strokePath();
                }
            } else {
                this.doubleJumpUI.iconBg.setFillStyle(0x0066cc, 0.8);
                
                // Очищаем индикатор прогресса
                this.doubleJumpUI.timerArc.clear();
                
                // Рисуем полную окружность
                this.doubleJumpUI.timerArc.lineStyle(3, 0xFFFFFF, 0.5);
                this.doubleJumpUI.timerArc.strokeCircle(20, 20, 22);
            }
        }
    }

    repositionEffectIcons() {
        // Перепозиционируем иконки эффектов в один ряд
        // Всегда помещаем двойной прыжок первым, затем активные эффекты
        let xPosition = 0;
        
        // Сначала размещаем двойной прыжок, если он есть
        if (this.doubleJumpUI) {
            this.doubleJumpUI.container.x = xPosition;
            this.doubleJumpUI.container.y = 0;
            xPosition += 50;
        }
        
        // Затем размещаем все активные эффекты
        const effectIds = Object.keys(this.effectsUI);
        effectIds.forEach((id) => {
            const container = this.effectsUI[id].container;
            container.x = xPosition;
            container.y = 0;
            xPosition += 50;
        });
    }

    // Добавляем новый метод для отображения границ коллизий предметов
    drawItemCollisionDebug() {
        if (!this.itemDebugGraphics) {
            this.itemDebugGraphics = this.add.graphics();
        }
        
        this.itemDebugGraphics.clear();
        this.itemDebugGraphics.lineStyle(2, 0xffff00);
        
        if (this.items) {
            this.items.getChildren().forEach(item => {
                const bounds = item.getBounds();
                this.itemDebugGraphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            });
        }
    }

    // Методы для обновления характеристик персонажа при изменении множителей
    updateJumpVelocity() {
        // Базовое значение из init метода (-450)
        const baseJumpVelocity = -450;
        
        // Для предотвращения накопления эффектов, всегда сбрасываем к базовому значению
        // и применяем текущий множитель
        this.jumpVelocity = baseJumpVelocity * this.jumpVelocityMultiplier;
        
        // Выводим отладочную информацию
        this.debugEffectMultipliers();
        
        // Обновляем jumpStrength в PlayerAbilities
        if (this.playerAbilities) {
            this.playerAbilities.updateJumpStrength();
        }
    }

    updateJumpCooldown() {
        // Базовое значение кулдауна
        const baseCooldown = 300;
        
        // Для предотвращения накопления эффектов, всегда сбрасываем к базовому значению
        // и применяем текущий множитель
        this.jumpCooldown = baseCooldown * this.jumpCooldownMultiplier;
        
        // Выводим отладочную информацию
        this.debugEffectMultipliers();
    }
    
    // Отладочный метод для проверки множителей
    debugEffectMultipliers() {
        console.log(`=== ТЕКУЩИЕ МНОЖИТЕЛИ ===`);
        console.log(`Множитель высоты прыжка: ${this.jumpVelocityMultiplier.toFixed(2)}`);
        console.log(`Множитель кулдауна прыжка: ${this.jumpCooldownMultiplier.toFixed(2)}`);
        console.log(`Множитель скорости игрока: ${this.playerSpeedMultiplier.toFixed(2)}`);
        console.log(`Прыжок: ${this.jumpVelocity}, Кулдаун: ${this.jumpCooldown}, Скорость: ${this.moveSpeed}`);
        console.log(`Количество активных эффектов: ${this.activeEffects.length}`);
        this.activeEffects.forEach(effect => {
            console.log(`  - ${effect.type} (ID: ${effect.id}), множитель: ${effect.factor || 'нет'}`);
        });
        console.log(`=======================`);
    }

    updatePlayerSpeed() {
        // Базовое значение скорости, определенное в init методе
        const baseSpeed = 200;
        
        // Для предотвращения накопления эффектов, всегда сбрасываем к базовому значению
        // и применяем текущий множитель
        this.moveSpeed = baseSpeed * this.playerSpeedMultiplier;
        
        // Вывод в консоль для отладки (можно удалить в финальной версии)
        console.log(`Обновление скорости игрока: ${this.moveSpeed} (множитель: ${this.playerSpeedMultiplier})`);
    }

    // Добавляем метод для обновления скорости анимации на основе активных эффектов
    updateAnimationSpeed() {
        if (!this.player || !this.player.animationState) return;
        
        // Получаем текущую базовую скорость анимации
        let baseTimeScale = this.player.animationState.timeScale;
        let animSpeedMultiplier = 1.0;
        
        // Проверяем все активные эффекты jump_boost
        this.activeEffects.forEach(effect => {
            if (effect.type === 'jump_boost' && effect.animationSpeedFactor) {
                animSpeedMultiplier *= effect.animationSpeedFactor;
            }
        });
        
        // Применяем множитель к базовой скорости
        this.player.animationState.timeScale = baseTimeScale * animSpeedMultiplier;
    }
} 