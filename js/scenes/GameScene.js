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
        
        const bodyWidth = 600;
        const bodyHeight = 700;
        const bodyOffsetX_Left = -150;
        const bodyOffsetY = -bodyHeight;

        this.player.body.setSize(bodyWidth, bodyHeight);
        this.player.body.setOffset(bodyOffsetX_Left, bodyOffsetY);
        this.player.body.setBounce(0.2);
        
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
        this.cameras.main.setFollowOffset(0, -200);
        
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
        
        const cameraTargetY = Math.round(this.player.y) - 200;
        
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
        const MIN_HORIZONTAL_DISTANCE = 50;
        
        // Меняем вертикальное расстояние в зависимости от высоты
        let MIN_VERTICAL_OFFSET = this.platformYMin; 
        let MAX_VERTICAL_OFFSET = this.platformYMax;
        
        // Увеличиваем расстояние между платформами с ростом высоты, но не делаем его больше, чем игрок может преодолеть
        if (this.score > 1000) {
            MIN_VERTICAL_OFFSET += Math.min(MAX_JUMP_HEIGHT * 0.6, this.score / 60);
            MAX_VERTICAL_OFFSET += Math.min(MAX_JUMP_HEIGHT * 0.8, this.score / 50);
        }

        // Снижаем количество платформ в ряду с ростом высоты, но гарантируем минимум 1-2 платформы
        const heightFactor = Math.min(0.7, Math.max(0.1, this.score / 5000));
        // Гарантируем минимум 2 платформы на высоких уровнях, чтобы был альтернативный путь
        let platformsPerRowMax = Math.max(2, this.score > 3000 ? 1 + Math.floor(Math.random() * 2) : 2);
        let platformsPerRowMin = Math.max(1, platformsPerRowMax - 1);
        
        // Увеличиваем горизонтальное расстояние между платформами с ростом высоты, но не делаем его больше, чем игрок может преодолеть
        let horizontalDistance = MIN_HORIZONTAL_DISTANCE;
        if (this.score > 1000) {
            horizontalDistance += Math.min(MAX_JUMP_WIDTH * 0.4, this.score / 50);
        }

        const ROWS_TO_GENERATE = Math.min(this.generationRowsCount, 6);
        
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

        const shouldGenerate = !this.player || this.player.y < this.lastPlatformY + this.platformGenerationBuffer;
            
        if (shouldGenerate) {
            this.lastPlatformGenerationTime = Date.now();
            
            let currentY = this.lastPlatformY;
            let platformsGenerated = 0;
            
            // Массив для хранения платформ в каждом ряду для проверки вертикальной доступности
            const allGeneratedRows = [];

            for (let row = 0; row < ROWS_TO_GENERATE; row++) {
                const heightFactor = Math.min(0.7, Math.max(0.1, (this.score / 1000)));
                
                const verticalOffset = MIN_VERTICAL_OFFSET + 
                    Math.floor(Math.random() * heightFactor * (MAX_VERTICAL_OFFSET - MIN_VERTICAL_OFFSET));
                
                currentY -= verticalOffset;
                this.lastPlatformY = Math.min(this.lastPlatformY, currentY);
                
                const platformsInRow = Math.max(platformsPerRowMin, 1 + Math.floor(Math.random() * platformsPerRowMax));
                
                const rowPlatforms = [];
                
                let atLeastOnePlatformCreated = false;
                
                for (let i = 0; i < platformsInRow; i++) {
                    let attempts = 0;
                    let platformCreated = false;
                    
                    while (attempts < 5 && !platformCreated) {
                        attempts++;
                        
                        const widthMultiplier = 0.6 + Math.random() * 1.2;
                        // Уменьшаем размер платформ с ростом высоты
                        let heightScaleFactor = 1.0;
                        if (this.score > 1000) {
                            heightScaleFactor = Math.max(0.6, 1.0 - (this.score / 10000));
                        }
                        const width = this.platformWidth * widthMultiplier * heightScaleFactor;
                        
                        const x = this.platformXMin + width / 2 + 
                            Math.random() * (this.cameras.main.width - 2 * this.platformXMin - width);
                        
                        let overlaps = false;
                        for (const platform of rowPlatforms) {
                            if (Math.abs(platform.x - x) < (platform.displayWidth / 2 + width / 2 + horizontalDistance)) {
                                overlaps = true;
                                break;
                            }
                        }
                        
                        if (!overlaps || (i === 0 && attempts >= 3)) {
                            // Для теста - ВРЕМЕННО: все платформы определенного типа
                            let platformType = 'normal';
                            
                            if (this.score > 200) {
                                // Динамически изменяем шансы появления платформ в зависимости от высоты
                                const heightModifier = Math.min(0.7, Math.max(0.1, this.score / 5000));
                                
                                // С увеличением высоты шанс обычных платформ уменьшается, но не ниже minSafePlatformsPercent
                                const normalChance = Math.max(this.minSafePlatformsPercent, 50 - (this.score / 100));
                                
                                // С увеличением высоты шанс сложных платформ увеличивается
                                const fragileChance = Math.min(35, 20 + (this.score / 400));
                                const slipperyChance = Math.min(30, 15 + (this.score / 500));
                                const vanishingChance = Math.min(25, 10 + (this.score / 600));
                                const stickyChance = Math.min(20, 5 + (this.score / 700));
                                
                                // Обновляем шансы
                                this.platformTypes = {
                                    normal: { chance: normalChance },
                                    fragile: { chance: fragileChance },
                                    slippery: { chance: slipperyChance },
                                    vanishing: { chance: vanishingChance },
                                    sticky: { chance: stickyChance }
                                };
                                
                                // Рассчитываем тип платформы с учетом шансов
                                const typeRoll = Math.random();
                                const totalChance = 
                                    this.platformTypes.normal.chance + 
                                    this.platformTypes.fragile.chance + 
                                    this.platformTypes.slippery.chance + 
                                    this.platformTypes.vanishing.chance + 
                                    this.platformTypes.sticky.chance;
                                
                                let cumulativeChance = 0;
                                
                                for (const type in this.platformTypes) {
                                    cumulativeChance += this.platformTypes[type].chance / totalChance;
                                    if (typeRoll < cumulativeChance) {
                                        platformType = type;
                                        break;
                                    }
                                }
                                
                                // Подсчитываем количество "безопасных" платформ в текущем ряду
                                if (rowPlatforms.length > 0) {
                                    let safeCount = 0;
                                    for (const platform of rowPlatforms) {
                                        if (platform.type === 'normal' || platform.type === 'slippery' || platform.type === 'sticky') {
                                            safeCount++;
                                        }
                                    }
                                    
                                    // Если процент безопасных платформ ниже минимального, принудительно делаем эту платформу безопасной
                                    const safePercent = (safeCount / rowPlatforms.length) * 100;
                                    if (safePercent < this.minSafePlatformsPercent) {
                                        // Выбираем безопасный тип платформы
                                        const safeTypes = ['normal', 'slippery', 'sticky'];
                                        platformType = Phaser.Utils.Array.GetRandom(safeTypes);
                                    }
                                }
                            }
                            
                            // Первая платформа в ряду всегда достаточно безопасная для проходимости
                            if (!atLeastOnePlatformCreated) {
                                if (Math.random() < 0.7) {
                                    platformType = 'normal';
                                } else {
                                    // Иногда делаем первую платформу слегка сложнее, но всё равно проходимой
                                    platformType = Math.random() < 0.5 ? 'slippery' : 'sticky';
                                }
                            }
                            
                            // Определяем, будет ли платформа движущейся
                            // Увеличиваем шанс движущихся платформ с ростом высоты
                            const movingChance = Math.min(0.6, this.movingPlatformChance + (this.score / 5000));
                            const isMoving = this.score > 300 && Math.random() < movingChance;
                            
                            const platform = this.createPlatform(
                                x,
                                currentY,
                                width,
                                this.platformHeight,
                                platformType,
                                isMoving
                            );
                            
                            if (platform) {
                                rowPlatforms.push(platform);
                                platformCreated = true;
                                atLeastOnePlatformCreated = true;
                                platformsGenerated++;
                            }
                        }
                    }
                }
                
                // После генерации всех платформ в ряду проверяем их доступность
                if (rowPlatforms.length > 0) {
                    // Проверяем, нет ли слишком больших промежутков между платформами
                    rowPlatforms.sort((a, b) => a.x - b.x);
                    
                    for (let i = 0; i < rowPlatforms.length - 1; i++) {
                        const gap = Math.abs(rowPlatforms[i + 1].x - rowPlatforms[i].x);
                        if (gap > MAX_JUMP_WIDTH) {
                            // Если промежуток слишком большой, добавляем промежуточную платформу
                            const midX = rowPlatforms[i].x + (rowPlatforms[i + 1].x - rowPlatforms[i].x) / 2;
                            const midWidth = this.platformWidth * 0.8;
                            const newPlatform = this.createPlatform(
                                midX,
                                currentY,
                                midWidth,
                                this.platformHeight,
                                'normal',
                                false
                            );
                            
                            if (newPlatform) {
                                rowPlatforms.push(newPlatform);
                            }
                        }
                    }
                    
                    // Сохраняем платформы текущего ряда для проверки вертикальной доступности
                    allGeneratedRows.push({ y: currentY, platforms: [...rowPlatforms] });
                }
                
                // Если не удалось создать платформы в ряду, добавляем запасную
                if (!atLeastOnePlatformCreated) {
                    const x = 200 + Math.random() * 400;
                    const width = this.platformWidth * 1.0;
                    const platform = this.createPlatform(
                        x,
                        currentY,
                        width,
                        this.platformHeight,
                        'normal',
                        false // Запасные платформы не движутся для надежности
                    );
                    
                    if (platform) {
                        platformsGenerated++;
                        allGeneratedRows.push({ y: currentY, platforms: [platform] });
                    }
                }
            }
            
            // Проверяем вертикальную доступность между рядами
            for (let i = 1; i < allGeneratedRows.length; i++) {
                const lowerRow = allGeneratedRows[i-1];
                const upperRow = allGeneratedRows[i];
                
                // Вычисляем вертикальное расстояние между рядами
                const verticalGap = Math.abs(lowerRow.y - upperRow.y);
                
                // Если расстояние слишком большое, игрок не сможет достичь следующего ряда
                if (verticalGap > MAX_JUMP_HEIGHT) {
                    // Добавляем промежуточную платформу примерно посередине
                    const midY = lowerRow.y - verticalGap / 2;
                    
                    // Выбираем случайную платформу из нижнего ряда
                    const lowerPlatform = Phaser.Utils.Array.GetRandom(lowerRow.platforms);
                    
                    // Добавляем промежуточную платформу выше текущей
                    const bridgePlatform = this.createPlatform(
                        lowerPlatform.x,
                        midY,
                        this.platformWidth,
                        this.platformHeight,
                        'normal',
                        false
                    );
                }
                
                // Проверяем, есть ли достижимые пути между рядами
                let pathFound = false;
                
                for (const lowerPlatform of lowerRow.platforms) {
                    for (const upperPlatform of upperRow.platforms) {
                        // Вычисляем расстояние по диагонали
                        const dx = Math.abs(lowerPlatform.x - upperPlatform.x);
                        const dy = Math.abs(lowerPlatform.y - upperPlatform.y);
                        
                        // Если расстояние в пределах досягаемости, путь найден
                        if (dx <= MAX_JUMP_WIDTH && dy <= MAX_JUMP_HEIGHT) {
                            pathFound = true;
                            break;
                        }
                    }
                    if (pathFound) break;
                }
                
                // Если путь не найден, создаем мост между рядами
                if (!pathFound) {
                    const lowerPlatform = Phaser.Utils.Array.GetRandom(lowerRow.platforms);
                    const upperPlatform = Phaser.Utils.Array.GetRandom(upperRow.platforms);
                    
                    // Создаем промежуточную платформу
                    const midX = (lowerPlatform.x + upperPlatform.x) / 2;
                    const midY = (lowerPlatform.y + upperPlatform.y) / 2;
                    
                    this.createPlatform(
                        midX,
                        midY,
                        this.platformWidth,
                        this.platformHeight,
                        'normal',
                        false
                    );
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
        
        // Создаем физическое тело платформы
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
        
        // Настраиваем размеры физического тела
        const scaledWidth = width;
        const scaledHeight = 20;
        platform.setScale(scaledWidth / platform.width, scaledHeight / platform.height);
        platform.refreshBody();
        
        // Сохраняем тип и состояние платформы
        platform.type = type;
        platform.isMoving = isMoving;
        
        // Очищаем контейнер перед добавлением новых элементов
        platformContainer.removeAll(true);
        
        // УПРОЩЕННЫЙ ПОДХОД: Создаем платформу из трех частей - левая, средняя, правая
        
        // Рассчитываем масштабированные размеры текстур
        const scaledLeftWidth = leftWidth * this.platformTextureScale;
        const scaledMidWidth = midWidth * this.platformTextureScale;
        const scaledRightWidth = rightWidth * this.platformTextureScale;
        
        // 1. Добавляем левую часть
        const leftPartX = -width/2 + scaledLeftWidth/2;
        const leftPart = this.add.image(leftPartX, 0, `${textureKey}_left`);
        leftPart.setScale(this.platformTextureScale);
        leftPart.setName('leftPart');
        platformContainer.add(leftPart);
        
        // 2. Добавляем правую часть
        const rightPartX = width/2 - scaledRightWidth/2;
        const rightPart = this.add.image(rightPartX, 0, `${textureKey}_right`);
        rightPart.setScale(this.platformTextureScale);
        rightPart.setName('rightPart');
        platformContainer.add(rightPart);
        
        // 3. Вычисляем пространство для средней части
        const middleSpace = width - scaledLeftWidth - scaledRightWidth;
        
        // 4. Добавляем среднюю часть, но только если есть пространство
        if (middleSpace > 0) {
            // Средняя часть размещается в центре между левой и правой
            const midPartX = (leftPartX + rightPartX) / 2;
            
            // Создаем среднюю часть
            const midPart = this.add.image(midPartX, 0, `${textureKey}_mid`);
            
            // Масштабируем среднюю часть по ширине, чтобы заполнить всю середину
            const widthScale = middleSpace / scaledMidWidth;
            const heightScale = this.platformTextureScale;
            
            midPart.setScale(widthScale, heightScale);
            midPart.setName('midPart');
            platformContainer.add(midPart);
        }
        
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
                    const width = platform.width;
                    
                    const textureKey = `platform_${platform.type}`;
                    const leftTexture = this.textures.get(`${textureKey}_left`);
                    const midTexture = this.textures.get(`${textureKey}_mid`);
                    const rightTexture = this.textures.get(`${textureKey}_right`);
                    
                    if (leftTexture && midTexture && rightTexture) {
                        const leftWidth = leftTexture.source[0].width;
                        const midWidth = midTexture.source[0].width;
                        const rightWidth = rightTexture.source[0].width;
                        const platformHeight = leftTexture.source[0].height;
                        
                        const scaledHeight = 20;
                        platform.setScale(width / platform.width, scaledHeight / platform.height);
                        platform.refreshBody();
                        
                        const parts = platform.container.list;
                        
                        if (parts.length >= 2) {
                            // Первым элементом всегда должна быть левая часть, а последним - правая
                            const leftPart = parts[0];
                            const rightPart = parts[parts.length - 1];
                            
                            // Проверяем, правильно ли размещены текстуры
                            if (leftPart && leftPart.texture && leftPart.texture.key.includes('_left')) {
                                leftPart.setScale(this.platformTextureScale);
                                leftPart.x = -width/2 + (leftWidth*this.platformTextureScale)/2;
                            }
                            
                            if (rightPart && rightPart.texture && rightPart.texture.key.includes('_right')) {
                                rightPart.setScale(this.platformTextureScale);
                                rightPart.x = width/2 - (rightWidth*this.platformTextureScale)/2;
                            }
                            
                            // Если есть средние части, располагаем их равномерно между левой и правой
                            if (parts.length > 2) {
                                const midStartX = -width/2 + (leftWidth*this.platformTextureScale);
                                const scaledMidWidth = midWidth * this.platformTextureScale;
                                
                                for (let i = 1; i < parts.length - 1; i++) {
                                    const midPart = parts[i];
                                    if (midPart && midPart.texture && midPart.texture.key.includes('_mid')) {
                                        midPart.setScale(this.platformTextureScale);
                                        midPart.x = midStartX + scaledMidWidth/2 + (i-1) * scaledMidWidth;
                                    }
                                }
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