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
        
        // Высота, на которую поднялся игрок (счет)
        this.score = 0;
        this.highestScore = 0;
        
        // Параметры для процедурной генерации платформ
        this.lastPlatformY = 0;
        this.lastPlatformGenerationTime = undefined;
        this.waterLevel = 0;
        
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
        
        // Разные типы платформ с базовыми шансами появления
        this.platformTypes = {
            normal: { chance: 50 },
            fragile: { chance: 20 },
            slippery: { chance: 15 },
            vanishing: { chance: 10 },
            sticky: { chance: 5 }
        };
        
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
        
        this.waterLevel = 0;
        
        this.platformYMin = 120;
        this.platformYMax = 200;
        this.platformXMin = 70;
        this.lastPlatformY = 600;
        this.jumpVelocity = -450;
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
    }

    preload() {
        this.load.image('bg', 'assets/images/bg.jpg');
        this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
        
        this.load.spineBinary('halloween-creature', './assets/images/CreatureScene/HalloweenCreature.skel');
        this.load.spineAtlas('halloween-creature-atlas', './assets/images/CreatureScene/HalloweenCreature.atlas');
        
        // Загрузка звуковых файлов
        this.load.audio('jump', 'assets/sounds/jump.mp3');
        this.load.audio('score', 'assets/sounds/score.mp3');
        this.load.audio('gameover', 'assets/sounds/gameover.mp3');
        this.load.audio('powerup', 'assets/sounds/powerup.mp3');
        this.load.audio('platform', 'assets/sounds/platform.mp3');
        this.load.audio('doubleJump', 'assets/sounds/doublejump.mp3');
        this.load.audio('splash', 'assets/sounds/splash.mp3');
        
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
        
        // Объединенная группа всех платформ для коллизий
        this.allPlatforms = [
            this.platforms,
            this.fragilePlatforms,
            this.slipperyPlatforms,
            this.vanishingPlatforms,
            this.stickyPlatforms,
            this.movingPlatforms
        ];
        
        this.createPlatform(
            400, 
            600, 
            this.platformWidth * 1.4, 
            this.platformHeight, 
            'normal',
            false // Первая платформа не движется
        );
        this.lastPlatformY = 600;
        
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
        this.physics.world.debugGraphic.setVisible(true);
        
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
        
        this.powerupManager = new PowerupManager(this);
        this.powerupManager.startSpawning(20000, 'platform');
        
        this.setupCamera();
        
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.platformSound = this.sound.add('platform');
        this.jumpSound = this.sound.add('jump');
        this.scoreSound = this.sound.add('score');
        this.gameoverSound = this.sound.add('gameover');
        this.powerupSound = this.sound.add('powerup');
        this.doubleJumpSound = this.sound.add('doubleJump');
        this.splashSound = this.sound.add('splash');
        
        this.createMobileControls();
        
        this.createUI();
        
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
    }

    setupCollisions() {
        this.physics.add.collider(this.player, this.platforms, this.playerHitPlatform, null, this);
        this.physics.add.collider(this.player, this.fragilePlatforms, this.playerHitPlatform, null, this);
        this.physics.add.collider(this.player, this.slipperyPlatforms, this.playerHitPlatform, null, this);
        this.physics.add.collider(this.player, this.vanishingPlatforms, this.playerHitPlatform, null, this);
        this.physics.add.collider(this.player, this.stickyPlatforms, this.playerHitPlatform, null, this);
        this.physics.add.collider(this.player, this.movingPlatforms, this.playerHitPlatform, null, this);
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
        this.scoreText.setText('Высота: ' + this.score);
        
        // Обновляем отображение рамки коллизий
        this.drawDebugPlayerCollision();
        
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
        
        if (playerCheckpoint < this.lastPlatformCheckpoint - 100) {
            this.lastPlatformCheckpoint = playerCheckpoint;
            
            const platformGenerationThreshold = this.lastPlatformY + this.platformGenerationBuffer;
            if (this.player.y < platformGenerationThreshold) {
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

                this.powerupManager.stopSpawning();

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
        }
        
        // Сбрасываем состояние игрока перед обновлением
        this.player.onPlatform = false;
        this.player.currentPlatform = null;
        
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
                        this.player.body.velocity.x = (deltaX / delta) * 1000;
                    }
                }
            }
        }
        
        this.playerMovement();
        
        this.powerupManager.update();
        
        this.playerAbilities.updateAbilityIndicators();
        
        const onGround = this.player.body.touching.down;
        
        if (!onGround) {
            this.player.onPlatform = false;
            this.player.currentPlatform = null;
        }
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
                    
                    if (this.leftPressed) {
                        player.body.velocity.x = -350;
                    } else if (this.rightPressed) {
                        player.body.velocity.x = 350;
                    } else {
                        if (Math.abs(player.body.velocity.x) > 10) {
                            player.body.velocity.x *= 0.995;
                        } else {
                            player.body.velocity.x = (Math.random() < 0.5 ? -1 : 1) * 80;
                        }
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
                    
                case 'sticky':
                    player.body.velocity.x *= 0.85;
                    
                    if (!player.isOnStickyPlatform) {
                        player.isOnStickyPlatform = true;
                        
                        this.tweens.add({
                            targets: player,
                            y: player.y - 5,
                            duration: 100,
                            yoyo: true,
                            ease: 'Sine.easeOut'
                        });
                    }
                    break;
                    
                default:
                    player.isOnSlipperyPlatform = false;
                    break;
            }
            
            // Если платформа движется, обрабатываем это
            if (platform.isMoving) {
                // Уменьшаем горизонтальное скольжение игрока на платформе
                if (!this.leftPressed && !this.rightPressed) {
                    player.body.velocity.x = 0;
                }
            }
        } else {
            if (platform.type === 'sticky') {
                player.isOnStickyPlatform = false;
            }
            if (platform.type === 'slippery') {
                player.isOnSlipperyPlatform = false;
            }
        }
    }

    createUI() {
        this.scoreText = this.add.text(16, 16, 'Высота: 0', { 
            fontFamily: 'unutterable',
            fontSize: '32px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        this.scoreText.setScrollFactor(0);
        
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
        }
    }

    playerMovement() {
        if (!this.player || !this.player.body) return;
        
        const moveSpeed = 200;
        
        let isMoving = false;
        
        const slowdownFactor = 0.9;
        
        // Если игрок на движущейся платформе - особое поведение
        const onMovingPlatform = this.player.onPlatform && 
                                this.player.currentPlatform && 
                                this.player.currentPlatform.isMoving;
        
        if (this.leftPressed) {
            this.player.body.velocity.x = -moveSpeed;
            this.player.setFlipX(false);
            isMoving = true;
        } else if (this.rightPressed) {
            this.player.body.velocity.x = moveSpeed;
            this.player.setFlipX(true);
            isMoving = true;
        } else {
            // Если не на движущейся платформе, замедляем движение
            if (!onMovingPlatform) {
                this.player.body.velocity.x *= slowdownFactor;
                
                if (Math.abs(this.player.body.velocity.x) < 10) {
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
                    
                    if (this.sounds && this.sounds.jump) {
                        this.sounds.jump.play({ volume: 0.5 });
                    }
                    
                    this.createJumpDustEffect();
                    
                    if (this.player.isOnStickyPlatform) {
                        this.player.body.velocity.y *= 0.8;
                        this.player.isOnStickyPlatform = false;
                    }
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
            }
        }
        else if (!onGround) {
            if (this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'idle') {
                this.player.animationState.setAnimation(0, 'idle', true);
                this.player.animationState.timeScale = 0.3;
            }
        }
        else if (onGround && isMoving) {
            if (this.player.body.velocity.x < 0) {
                this.player.setFlipX(false);
                
                if (this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'still') {
                    this.player.animationState.setAnimation(0, 'still', true);
                    this.player.animationState.timeScale = 0.5;
                }
            } 
            else if (this.player.body.velocity.x > 0) {
                this.player.setFlipX(true);
                
                if (this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'still') {
                    this.player.animationState.setAnimation(0, 'still', true);
                    this.player.animationState.timeScale = 0.5;
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
            
        if (shouldGenerate) {
            this.lastPlatformGenerationTime = Date.now();
            
            const platformDensity = getPlatformDensity(this.score);
            const platformsToGenerate = 10; // Генерируем больше платформ за раз
            const generationHeight = 800; // Высота зоны генерации
            
            // Начинаем с последней сгенерированной платформы
            let currentY = this.lastPlatformY;
            
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
                const x = column.minX + Math.random() * (column.maxX - column.minX);
                
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
        }
    }

    getPlatformType(heightInfluence) {
        // Увеличиваем шанс специальных платформ с ростом высоты
        const specialChance = 0.6 + (heightInfluence * 0.3);
        
        if (Math.random() < specialChance) {
            let specialTypes = [];
            
            specialTypes.push('fragile', 'fragile');
            
            if (heightInfluence > 0.1) {
                specialTypes.push('slippery', 'slippery');
            }
            
            if (heightInfluence > 0.2) {
                specialTypes.push('vanishing');
            }
            
            if (heightInfluence > 0.2) {
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
        
        // Переопределяем метод уничтожения для корректной очистки
        const originalDestroy = platform.destroy;
        platform.destroy = function() {
            if (this.container) {
                this.container.destroy();
            }
            originalDestroy.call(this);
        };
        
        // Обновляем положение последней платформы
        this.lastPlatformY = Math.min(this.lastPlatformY, y);
        
        // Размещаем бонус с некоторой вероятностью
        if (this.powerupManager && Math.random() < this.powerupManager.platformPowerupChance) {
            this.powerupManager.spawnPowerupOnPlatform(platform);
        }
        
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
} 