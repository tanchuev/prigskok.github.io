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
        
        // Разные типы платформ
        this.platformTypes = {
            normal: { chance: 25 },
            fragile: { chance: 20 },
            slippery: { chance: 15 },
            vanishing: { chance: 15 },
            sticky: { chance: 10 },
            moving: { chance: 15 }
        };
        
        this.gameTime = 0;
        
        this.platformGenerationBuffer = 600;
        this.maxPlatforms = 30;
        this.generationRowsCount = 8;
        
        this.selectedCharacter = 'pumpkin';
        
        // Параметры для движущихся платформ
        this.movingPlatformMinSpeed = 30;
        this.movingPlatformMaxSpeed = 70;
        
        // Параметры для расстояния движения платформ
        this.horizontalMinDistance = 100;
        this.horizontalMaxDistance = 200;
        this.verticalMinDistance = 50;
        this.verticalMaxDistance = 100;
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
            sticky: { chance: 10 },
            moving: { chance: 10 }
        };
        
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
        this.horizontalMaxDistance = 200;
        this.verticalMinDistance = 50;
        this.verticalMaxDistance = 100;
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
        const platformTypes = ['default', 'fragile', 'slippery', 'vanishing', 'sticky'];
        
        platformTypes.forEach(type => {
            this.load.image(`platform_${type === 'default' ? 'normal' : type}_left`, `assets/images/platforms/${type}_left.png`);
            this.load.image(`platform_${type === 'default' ? 'normal' : type}_mid`, `assets/images/platforms/${type}_mid.png`);
            this.load.image(`platform_${type === 'default' ? 'normal' : type}_right`, `assets/images/platforms/${type}_right.png`);
        });
        
        // Используем текстуры обычной платформы для движущейся
        this.load.image('platform_moving_left', 'assets/images/platforms/default_left.png');
        this.load.image('platform_moving_mid', 'assets/images/platforms/default_mid.png');
        this.load.image('platform_moving_right', 'assets/images/platforms/default_right.png');
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
        
        // Группа для движущихся платформ (использует динамические тела)
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
            'normal'
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
        if (this.player.onPlatform && this.player.currentPlatform && this.player.currentPlatform.type === 'moving') {
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
            if (platform.type === 'moving') {
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
                } else if (platform.type === 'moving') {
                    scoreValue = 15;
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
                        player.body.velocity.x = -200;
                    } else if (this.rightPressed) {
                        player.body.velocity.x = 200;
                    } else {
                        if (Math.abs(player.body.velocity.x) > 10) {
                            player.body.velocity.x *= 0.99;
                        } else {
                            player.body.velocity.x = (Math.random() < 0.5 ? -1 : 1) * 40;
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
                    
                case 'moving':
                    // Уменьшаем горизонтальное скольжение игрока на платформе
                    if (!this.leftPressed && !this.rightPressed) {
                        player.body.velocity.x = 0;
                    }
                    break;
                    
                default:
                    player.isOnSlipperyPlatform = false;
                    break;
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
                                this.player.currentPlatform.type === 'moving';
        
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
        const MAX_JUMP_HEIGHT = 250;
        const MAX_JUMP_WIDTH = 300;
        const MIN_HORIZONTAL_DISTANCE = 50;
        
        const MIN_VERTICAL_OFFSET = this.platformYMin; 
        const MAX_VERTICAL_OFFSET = this.platformYMax;

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
                'normal'
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

            for (let row = 0; row < ROWS_TO_GENERATE; row++) {
                const heightFactor = Math.min(0.7, Math.max(0.1, (this.score / 1000)));
                
                const verticalOffset = MIN_VERTICAL_OFFSET + 
                    Math.floor(Math.random() * heightFactor * (MAX_VERTICAL_OFFSET - MIN_VERTICAL_OFFSET));
                
                currentY -= verticalOffset;
                this.lastPlatformY = Math.min(this.lastPlatformY, currentY);
                
                const platformsInRow = 1 + Math.floor(Math.random() * 2);
                
                const rowPlatforms = [];
                
                let atLeastOnePlatformCreated = false;
                
                for (let i = 0; i < platformsInRow; i++) {
                    let attempts = 0;
                    let platformCreated = false;
                    
                    while (attempts < 5 && !platformCreated) {
                        attempts++;
                        
                        const widthMultiplier = 0.9 + Math.random() * 0.5;
                        const width = this.platformWidth * widthMultiplier;
                        
                        const x = this.platformXMin + width / 2 + 
                            Math.random() * (this.cameras.main.width - 2 * this.platformXMin - width);
                        
                        let overlaps = false;
                        for (const platform of rowPlatforms) {
                            if (Math.abs(platform.x - x) < (platform.displayWidth / 2 + width / 2 + MIN_HORIZONTAL_DISTANCE)) {
                                overlaps = true;
                                break;
                            }
                        }
                        
                        if (!overlaps || (i === 0 && attempts >= 3)) {
                            // ВРЕМЕННО: Все платформы движущиеся для тестирования
                            let platformType = 'moving';
                            
                            const platform = this.createPlatform(
                                x,
                                currentY,
                                width,
                                this.platformHeight,
                                platformType
                            );
                            
                            if (platform) {
                                // Добавляем случайную скорость для разнообразия теста
                                if (platform.type === 'moving') {
                                    // Случайно выбираем горизонтальное или вертикальное движение
                                    const directionTypeRoll = Math.random();
                                    if (directionTypeRoll < 0.7) { // 70% горизонтальных
                                        platform.movementDirection = 'horizontal';
                                        platform.targetPosition.x = platform.startPosition.x + (this.horizontalMinDistance + Math.random() * 
                                            (this.horizontalMaxDistance - this.horizontalMinDistance)) * (Math.random() < 0.5 ? 1 : -1);
                                        platform.targetPosition.y = platform.startPosition.y;
                                    } else { // 30% вертикальных
                                        platform.movementDirection = 'vertical';
                                        platform.targetPosition.x = platform.startPosition.x;
                                        platform.targetPosition.y = platform.startPosition.y + (this.verticalMinDistance + 
                                            Math.random() * (this.verticalMaxDistance - this.verticalMinDistance));
                                    }
                                    
                                    // Разная скорость
                                    platform.movementSpeed = this.movingPlatformMinSpeed + 
                                        Math.random() * (this.movingPlatformMaxSpeed - this.movingPlatformMinSpeed);
                                }
                                
                                rowPlatforms.push(platform);
                                platformCreated = true;
                                atLeastOnePlatformCreated = true;
                                platformsGenerated++;
                            }
                        }
                    }
                }
                
                if (!atLeastOnePlatformCreated) {
                    const x = 200 + Math.random() * 400;
                    const width = this.platformWidth * 1.0;
                    const platform = this.createPlatform(
                        x,
                        currentY,
                        width,
                        this.platformHeight,
                        'moving'
                    );
                    
                    if (platform) {
                        // Горизонтальное движение для запасных платформ
                        platform.movementDirection = 'horizontal';
                        platform.targetPosition.x = platform.startPosition.x + (this.horizontalMinDistance + 
                            Math.random() * (this.horizontalMaxDistance - this.horizontalMinDistance)) * (Math.random() < 0.5 ? 1 : -1);
                        platform.targetPosition.y = platform.startPosition.y;
                        platform.movementSpeed = this.movingPlatformMinSpeed + 
                            Math.random() * (this.movingPlatformMaxSpeed - this.movingPlatformMinSpeed);
                        
                        platformsGenerated++;
                    }
                }
            }
        }
    }

    getPlatformType(heightInfluence) {
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
            
            if (heightInfluence > 0.1) {
                specialTypes.push('moving', 'moving');
            }
            
            return Phaser.Utils.Array.GetRandom(specialTypes);
        }
        
        return 'normal';
    }

    createPlatform(x, y, width, height, type) {
        if (x === undefined || y === undefined || width === undefined || height === undefined) {
            console.error('Некорректные параметры для создания платформы:', { x, y, width, height, type });
            return null;
        }
        
        let group;
        let isStatic = true;
        
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
            case 'moving':
                group = this.movingPlatforms;
                isStatic = false;
                break;
            default:
                group = this.platforms;
                break;
        }
        
        let textureKey = `platform_${type}`;
        const leftTexture = this.textures.get(`${textureKey}_left`);
        const midTexture = this.textures.get(`${textureKey}_mid`);
        const rightTexture = this.textures.get(`${textureKey}_right`);
        
        if (!leftTexture || !midTexture || !rightTexture) {
            console.error(`Текстуры для платформы ${type} не найдены`);
            return null;
        }
        
        const leftWidth = leftTexture.source[0].width;
        const midWidth = midTexture.source[0].width;
        const rightWidth = rightTexture.source[0].width;
        const platformHeight = leftTexture.source[0].height;
        
        const platformContainer = this.add.container(x, y);
        platformContainer.setDepth(10);
        
        let platform;
        
        if (isStatic) {
            platform = group.create(x, y, `${textureKey}_mid`);
        } else {
            platform = group.create(x, y, `${textureKey}_mid`);
            platform.body.setImmovable(true);
            platform.body.allowGravity = false;
            
            // Добавляем параметры для движущихся платформ
            const movementDirection = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            const movementDistance = movementDirection === 'horizontal' ? 
                this.horizontalMinDistance + Math.random() * (this.horizontalMaxDistance - this.horizontalMinDistance) : 
                this.verticalMinDistance + Math.random() * (this.verticalMaxDistance - this.verticalMinDistance);
            const movementSpeed = this.movingPlatformMinSpeed + Math.random() * (this.movingPlatformMaxSpeed - this.movingPlatformMinSpeed);
            
            platform.movementDirection = movementDirection;
            platform.movementDistance = movementDistance;
            platform.movementSpeed = movementSpeed;
            platform.startPosition = { x, y };
            platform.targetPosition = { 
                x: movementDirection === 'horizontal' ? x + movementDistance : x,
                y: movementDirection === 'vertical' ? y + movementDistance : y
            };
            platform.movingForward = true;
            platform.lastX = x;
            platform.lastY = y;
        }
        
        platform.setVisible(false);
        
        const scaledWidth = width;
        const scaledHeight = 20;
        
        platform.setScale(scaledWidth / platform.width, scaledHeight / platform.height);
        platform.refreshBody();
        platform.type = type;
        
        const leftPart = this.add.image(-width/2 + (leftWidth*this.platformTextureScale)/2, 0, `${textureKey}_left`);
        leftPart.setScale(this.platformTextureScale);
        platformContainer.add(leftPart);
        
        const rightPart = this.add.image(width/2 - (rightWidth*this.platformTextureScale)/2, 0, `${textureKey}_right`);
        rightPart.setScale(this.platformTextureScale);
        platformContainer.add(rightPart);
        
        const availableWidth = width - (leftWidth*this.platformTextureScale) - (rightWidth*this.platformTextureScale);
        const midCount = Math.max(0, Math.floor(availableWidth / (midWidth*this.platformTextureScale)));
        
        if (midCount > 0) {
            const scaledMidWidth = midWidth * this.platformTextureScale;
            const midStartX = -width/2 + (leftWidth*this.platformTextureScale);
            
            for (let i = 0; i < midCount; i++) {
                const midPart = this.add.image(midStartX + scaledMidWidth/2 + i * scaledMidWidth, 0, `${textureKey}_mid`);
                midPart.setScale(this.platformTextureScale);
                platformContainer.add(midPart);
            }
        }
        
        platform.container = platformContainer;
        
        const originalDestroy = platform.destroy;
        platform.destroy = function() {
            if (this.container) {
                this.container.destroy();
            }
            originalDestroy.call(this);
        };
        
        this.lastPlatformY = Math.min(this.lastPlatformY, y);
        
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
                            const leftPart = parts[0];
                            leftPart.setScale(this.platformTextureScale);
                            leftPart.x = -width/2 + (leftWidth*this.platformTextureScale)/2;
                            
                            const rightPart = parts[parts.length - 1];
                            rightPart.setScale(this.platformTextureScale);
                            rightPart.x = width/2 - (rightWidth*this.platformTextureScale)/2;
                            
                            if (parts.length > 2) {
                                const midStartX = -width/2 + (leftWidth*this.platformTextureScale);
                                const scaledMidWidth = midWidth * this.platformTextureScale;
                                
                                for (let i = 1; i < parts.length - 1; i++) {
                                    const midPart = parts[i];
                                    midPart.setScale(this.platformTextureScale);
                                    midPart.x = midStartX + scaledMidWidth/2 + (i-1) * scaledMidWidth;
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