class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        
        // Флаги нажатия клавиш управления
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        
        // Добавляем переменную для отслеживания последнего прыжка
        this.lastJumpTime = 0;
        this.jumpCooldown = 400; // Уменьшаем время между возможными прыжками
        
        // Высота, на которую поднялся игрок (счет)
        this.score = 0;
        this.highestScore = 0;
        
        // Параметры для процедурной генерации платформ
        this.lastPlatformY = 0;
        this.lastPlatformGenerationTime = undefined;
        this.waterLevel = 0;
        
        // Инициализация переменных
        this.gameOver = false;
        this.platformYMin = 120;  // Минимальное расстояние по Y между платформами (было 100)
        this.platformYMax = 200; // Максимальное расстояние по Y между платформами (было 180)
        this.platformXMin = 70;  // Минимальное расстояние платформы от края (было 50)
        this.lastGenerationTime = 0; // Для регулярной генерации платформ
        this.initialPlayerY = 570; // Начальная позиция игрока по Y
        this.maxHeightReached = 0; // Максимальная достигнутая высота
        
        // Параметры для платформ
        this.platformWidth = 86; // Уменьшаем ширину с 96 до 86
        this.platformHeight = 20; // Уменьшаем высоту с 32 до 20
        
        // Параметры для масштабирования текстур платформ
        this.platformTextureScale = 0.25; // Уменьшаем масштаб текстур
        
        
        // Разные типы платформ
        this.platformTypes = {
            normal: { chance: 25 }, // Обычная платформа (было 25, увеличено)
            fragile: { chance: 20 }, // Хрупкая платформа (было 20)
            slippery: { chance: 20 }, // Скользкая платформа (было 20)
            vanishing: { chance: 15 },  // Исчезающая платформа (было 15)
            sticky: { chance: 15 }  // Липкая платформа (было 15)
        };
        
        // Счетчик для отслеживания времени игры
        this.gameTime = 0;
        
        // Оптимизированные параметры для генерации платформ
        this.platformGenerationBuffer = 600; // Расстояние в пикселях до верхней платформы, при котором начинается генерация
        this.maxPlatforms = 30; // Ограничиваем количество платформ для производительности
        this.generationRowsCount = 8; // Количество рядов платформ, генерируемых за один вызов
        
        // Выбранный скин персонажа (по умолчанию тыква)
        this.selectedCharacter = 'pumpkin';
        // this.movingPlatforms = null; // Инициализация удалена, так как группа удалена
    }

    init(data) {
        // Получаем высший счет из предыдущих сессий
        this.highestScore = data.highScore || 0;
        
        // Получаем выбранного персонажа, если он был передан
        if (data.selectedCharacter) {
            this.selectedCharacter = data.selectedCharacter;
        }
        
        // Сбрасываем флаги нажатия клавиш
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        
        // Сбрасываем счет
        this.score = 0;
        
        // Сбрасываем генерацию платформ
        this.lastPlatformY = 0;
        this.lastPlatformGenerationTime = undefined;
        
        // Сбрасываем уровень воды
        this.waterLevel = 0;
        
        // Настройки игровой физики
        this.platformYMin = 120;  // Минимальное расстояние по Y между платформами (было 100)
        this.platformYMax = 200; // Максимальное расстояние по Y между платформами (было 180)
        this.platformXMin = 70;  // Минимальное расстояние платформы от края (было 50)
        this.lastPlatformY = 600; // Начальная высота для платформ
        this.jumpVelocity = -450; // Увеличиваем силу прыжка (было -350)
        this.lastGenerationTime = 0; // Для регулярной генерации платформ
        this.initialPlayerY = 570; // Начальная позиция игрока по Y
        this.maxHeightReached = 0; // Максимальная достигнутая высота
        
        // Параметры для платформ
        this.platformWidth = 86; // Уменьшаем ширину с 96 до 86
        this.platformHeight = 20; // Уменьшаем высоту с 32 до 20
        
        // Параметры для масштабирования текстур платформ
        this.platformTextureScale = 0.25; // Уменьшаем масштаб текстур
        
        // Типы движущихся платформ - УДАЛЕНО
        
        // Разные типы платформ
        this.platformTypes = {
            normal: { chance: 50 }, // Обычная платформа (было 25, увеличено)
            fragile: { chance: 15 }, // Хрупкая платформа (было 20)
            slippery: { chance: 15 }, // Скользкая платформа (было 20)
            vanishing: { chance: 10 },  // Исчезающая платформа (было 15)
            sticky: { chance: 10 }  // Липкая платформа (было 15)
            // moving: { chance: 25 }   // Движущиеся платформы - УДАЛЕНО
        };
        
        // Мобильное управление
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        
        // Счетчик для отслеживания времени игры
        this.gameTime = 0;
        
        // Группа для движущихся платформ - УДАЛЕНО
        // this.movingPlatforms = null;
    }

    preload() {
        // Загрузка фона
        this.load.image('bg', 'assets/images/bg.jpg');
        this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
        
        // Загрузка Spine-файлов для тыквы
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
            // Загружаем левую, среднюю и правую части для каждого типа платформы
            this.load.image(`platform_${type === 'default' ? 'normal' : type}_left`, `assets/images/platforms/${type}_left.png`);
            this.load.image(`platform_${type === 'default' ? 'normal' : type}_mid`, `assets/images/platforms/${type}_mid.png`);
            this.load.image(`platform_${type === 'default' ? 'normal' : type}_right`, `assets/images/platforms/${type}_right.png`);
        });
    }

    // Создаем текстуры для платформ разных типов
    createPlatformTextures() {
        // Метод пустой, так как мы теперь загружаем текстуры в preload
    }

    create() {
        // Установка границ мира, включая нижнюю границу
        this.physics.world.setBounds(0, -95000, 800, 95800); // Изменяем верхнюю границу для соответствия границам камеры
        this.physics.world.setBoundsCollision(true, true, false, true); // Отключаем коллизию только с верхней границей

        // Фон
        this.bg = this.add.tileSprite(400, 300, 800, 600, 'bg');
        this.bg.setScrollFactor(0);
        
        // Группы платформ
        this.platforms = this.physics.add.staticGroup();
        this.fragilePlatforms = this.physics.add.staticGroup();
        this.slipperyPlatforms = this.physics.add.staticGroup();
        this.vanishingPlatforms = this.physics.add.staticGroup();
        this.stickyPlatforms = this.physics.add.staticGroup();
        // this.movingPlatforms = this.physics.add.group(); // Движущиеся платформы (динамическая группа) - УДАЛЕНО
        
        // Объединенная группа всех платформ для коллизий
        this.allPlatforms = [
            this.platforms,
            this.fragilePlatforms,
            this.slipperyPlatforms,
            this.vanishingPlatforms,
            this.stickyPlatforms
            // this.movingPlatforms - УДАЛЕНО
        ];
        
        // Создание начальной платформы
        this.createPlatform(
            400, 
            600, 
            this.platformWidth * 1.4, 
            this.platformHeight, 
            'normal'
        );
        this.lastPlatformY = 600;
        
        // Создание игрока с использованием Spine
        this.player = this.add.spine(400, this.initialPlayerY, 'halloween-creature', 'halloween-creature-atlas');
        
        // Устанавливаем выбранный скин персонажа
        this.player.skeleton.setSkinByName(this.selectedCharacter);
        this.player.skeleton.setSlotsToSetupPose();
        
        // Запускаем анимацию still для начала
        this.player.animationState.setAnimation(0, 'still', true);
        
        // Устанавливаем масштаб объекта Spine
        this.player.setScale(0.08);
        
        // Устанавливаем высокий z-index для отображения персонажа на переднем плане
        this.player.setDepth(100);
        
        // Добавляем физическое тело к Spine-объекту
        this.physics.add.existing(this.player);
        
        // Константы для "идеальных" настроек физического тела
        const bodyWidth = 600;
        const bodyHeight = 700;
        const bodyOffsetX_Left = -150; // Смещение X, когда смотрит влево
        const bodyOffsetY = -bodyHeight;      // Постоянное смещение Y

        // Настройка физического тела
        this.player.body.setSize(bodyWidth, bodyHeight);
        this.player.body.setOffset(bodyOffsetX_Left, bodyOffsetY); // Начальное смещение (влево)
        this.player.body.setBounce(0.2);
        
        // Добавляем функцию для правильного отражения персонажа
        this.player.setFlipX = function(flip) {
            if (flip) { // Отражение вправо
                this.scaleX = -0.08;
                const offsetX_Right = bodyOffsetX_Left + bodyWidth; // Формула
                this.body.setOffset(offsetX_Right, bodyOffsetY);
            } else { // Отражение влево (или исходное состояние)
                this.scaleX = 0.08;
                this.body.setOffset(bodyOffsetX_Left, bodyOffsetY);
            }
        };
        
        // Сохраняем начальную позицию Y для расчета высоты
        this.initialPlayerY = this.player.y;
        this.maxHeightReached = 0;
        
        // Инициализация контрольных точек для оптимизации
        this.lastPlatformCheckpoint = this.player.y;
        this.lastCleanupCheckpoint = this.cameras.main.scrollY;
        
        // Теперь, когда игрок создан, генерируем платформы
        this.generatePlatforms();
        
        console.log(`Создан игрок на позиции Y=${this.initialPlayerY}`);
        
        // Игрок ДОЛЖЕН сталкиваться с границами мира, особенно с нижней
        this.player.body.collideWorldBounds = true;
        
        // Настройка коллизий
        this.setupCollisions();
        
        // Инициализация способностей игрока
        this.playerAbilities = new PlayerAbilities(this, this.player);
        
        // Инициализация менеджера бонусов
        this.powerupManager = new PowerupManager(this);
        this.powerupManager.startSpawning(20000, 'platform'); // Используем режим генерации только при создании платформ
        
        // Настройка камеры
        this.setupCamera();
        
        // Создание управления для горизонтального движения
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Инициализация звуковых эффектов
        this.platformSound = this.sound.add('platform');
        this.jumpSound = this.sound.add('jump');
        this.scoreSound = this.sound.add('score');
        this.gameoverSound = this.sound.add('gameover');
        this.powerupSound = this.sound.add('powerup');
        this.doubleJumpSound = this.sound.add('doubleJump');
        this.splashSound = this.sound.add('splash');
        
        // Добавление мобильного управления и кнопок способностей
        this.createMobileControls();
        
        // Интерфейс
        this.createUI();
        
        // Создание индикаторов способностей
        this.playerAbilities.createAbilityIndicators();

        // Настройка звуков для PlayerAbilities
        this.playerAbilities.sounds = {
            jump: this.jumpSound,
            doubleJump: this.doubleJumpSound
        };

        // Добавляю функцию для вызова паузы в существующий класс GameScene
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { gameScene: 'GameScene' });
        });

        // Также добавляем кнопку паузы для мобильных устройств
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
        // Настраиваем столкновения с обычными платформами
        const playerVsPlatforms = this.physics.add.collider(this.player, this.platforms, this.playerHitPlatform, null, this);
        
        // Настраиваем столкновения с хрупкими платформами
        const playerVsFragilePlatforms = this.physics.add.collider(this.player, this.fragilePlatforms, this.playerHitPlatform, null, this);
        
        // Настраиваем столкновения со скользкими платформами
        const playerVsSlipperyPlatforms = this.physics.add.collider(this.player, this.slipperyPlatforms, this.playerHitPlatform, null, this);
        
        // Настраиваем столкновения с исчезающими платформами
        const playerVsVanishingPlatforms = this.physics.add.collider(this.player, this.vanishingPlatforms, this.playerHitPlatform, null, this);
        
        // Настраиваем столкновения с липкими платформами
        const playerVsStickyPlatforms = this.physics.add.collider(this.player, this.stickyPlatforms, this.playerHitPlatform, null, this);
        
        // Настраиваем столкновения с движущимися платформами - УДАЛЕНО
        // const playerVsMovingPlatforms = this.physics.add.collider(this.player, this.movingPlatforms, this.playerHitPlatform, null, this);
    }

    setupCamera() {
        // Увеличиваем границы камеры для бесконечного подъема
        this.cameras.main.setBounds(0, -95000, 800, 100000);
        this.cameras.main.startFollow(this.player, false); // Отключаем автоследование, будем контролировать камеру вручную
        
        // Дополнительные настройки для плавного перемещения камеры
        this.cameras.main.setDeadzone(400, 200);
        this.cameras.main.setFollowOffset(0, -200); // Смещаем камеру вверх для лучшего обзора
        
        // Настраиваем параметры для оптимизации генерации платформ
        this.lastPlatformCheckpoint = 0; // Контрольная точка для проверки генерации платформ
        this.lastCleanupCheckpoint = 0; // Контрольная точка для очистки старых платформ
        
        this.player.onPlatform = false;
        // this.player.onMovingPlatform = false; // Удалено
        
        // Базовое управление
        this.playerMovement();
    }

    update(time, delta) {
        if (this.gameOver) {
            return;
        }
        
        // Увеличиваем счетчик времени
        this.gameTime += delta / 1000; // в секундах
        
        // Обновление фона
        this.bg.tilePositionY = -this.cameras.main.scrollY * 0.3;
        
        // Вычисляем текущую высоту относительно начальной позиции игрока
        // Учитываем, что направление Y инвертировано (вверх - отрицательные значения)
        const currentHeight = Math.floor(this.initialPlayerY - this.player.y);
        
        // Обновляем максимальную достигнутую высоту
        if (currentHeight > this.maxHeightReached) {
            this.maxHeightReached = currentHeight;
        }
        
        // Устанавливаем текущую высоту как счет
        this.score = this.maxHeightReached;
        this.scoreText.setText('Высота: ' + this.score);
        
        // Обрабатываем нажатия клавиш для управления персонажем
        // Обработка нажатий клавиш влево/вправо для ПК
        if (this.cursors.left.isDown) {
            this.leftPressed = true;
            this.rightPressed = false;
        } else if (this.cursors.right.isDown) {
            this.rightPressed = true;
            this.leftPressed = false;
        } else {
            // Если ни одна из клавиш не нажата, сбрасываем оба флага
            this.leftPressed = false;
            this.rightPressed = false;
        }
        
        // Обрабатываем нажатия клавиш для прыжка
        if (this.spaceKey && this.spaceKey.isDown) {
            this.jumpPressed = true;
        }
        
        // Упрощаем логику следования камеры за игроком
        // Плавное следование камеры за игроком с определенным смещением вверх
        const cameraTargetY = Math.round(this.player.y) - 200;
        
        // Более оптимизированное плавное движение камеры
        // Ограничиваем перемещение камеры только когда это действительно необходимо
        const smoothFactor = 0.1; // Фактор плавности (0.1 = 10% расстояния за кадр)
        
        // Только если разница значительна, перемещаем камеру
        const cameraDistance = cameraTargetY - this.cameras.main.scrollY;
        if (Math.abs(cameraDistance) > 5) {
            this.cameras.main.scrollY += cameraDistance * smoothFactor;
        }
        
        // Генерация новых платформ только когда игрок приближается к верхним платформам
        // Используем контрольные точки для оптимизации проверок
        const playerCheckpoint = Math.floor(this.player.y / 100) * 100;
        
        if (playerCheckpoint < this.lastPlatformCheckpoint - 100) {
            this.lastPlatformCheckpoint = playerCheckpoint;
            
            const platformGenerationThreshold = this.lastPlatformY + this.platformGenerationBuffer;
            if (this.player.y < platformGenerationThreshold) {
                this.generatePlatforms();
            }
        }
        
        // Проверяем, столкнулся ли игрок именно с НИЖНЕЙ ГРАНИЦЕЙ МИРА
        const bottomBoundY = this.physics.world.bounds.height;
        const playerBottomY = this.player.body.y + this.player.body.height;

        if (this.player.body.blocked.down && Math.abs(playerBottomY - bottomBoundY) < 5) {
            // Если игрок коснулся нижней границы мира, он проигрывает
            if (!this.gameOver) { // Убедимся, что это происходит только один раз
                this.gameOver = true;
                // Устанавливаем красный оттенок, устанавливая свойства r, g, b, a
                this.player.skeleton.color.r = 1;
                this.player.skeleton.color.g = 0.5;
                this.player.skeleton.color.b = 0.5;
                this.player.skeleton.color.a = 1;

                // Запускаем анимацию смерти
                this.player.animationState.setAnimation(0, 'die', false);

                // Останавливаем физику
                this.physics.pause();

                // Останавливаем спаун бонусов
                this.powerupManager.stopSpawning();

                // Вместо текстов о проигрыше, запускаем сцену GameOver
                this.time.delayedCall(1000, () => {
                    this.scene.start('GameOverScene', { score: this.score });
                });
            }
            return; // Выходим из update, если игра окончена
        }
        
        // Удаляем платформы, которые слишком далеко внизу (оптимизация)
        // Используем контрольные точки для очистки платформ
        const cleanupCheckpoint = Math.floor(this.cameras.main.scrollY / 300) * 300;
        
        if (cleanupCheckpoint > this.lastCleanupCheckpoint) {
            this.lastCleanupCheckpoint = cleanupCheckpoint;
            
            const cleanupThreshold = this.cameras.main.scrollY + 800; // Сокращаем зону очистки для большей оптимизации
            
            this.allPlatforms.forEach(group => {
                group.getChildren().forEach(platform => {
                    if (platform.y > cleanupThreshold) {
                        platform.destroy(); // Метод destroy уже обновлен для удаления контейнера
                    }
                });
            });
        }
        
        // Сбрасываем флаги платформы в начале каждого фрейма
        this.player.onPlatform = false;
        // this.player.onMovingPlatform = false; // Удалено
        this.player.currentPlatform = null;
        
        // Базовое управление
        this.playerMovement();
        
        // Обновление менеджера бонусов
        this.powerupManager.update();
        
        // Обновление индикаторов способностей
        this.playerAbilities.updateAbilityIndicators();
        
        // Проверяем, стоит ли игрок на земле
        const onGround = this.player.body.touching.down;
        
        // Если игрок не стоит на земле, сбрасываем флаги платформ
        if (!onGround) {
            this.player.onPlatform = false;
            // this.player.onMovingPlatform = false; // Удалено
            this.player.currentPlatform = null;
        }
    }

    playerHitPlatform(player, platform) {
        // Проверяем, что оба объекта активны
        if (!platform.active || !player.active) return;

        // Проверяем, что игрок находится над платформой
        const playerBottom = player.body.y + player.body.height;
        const platformTop = platform.body.y;
        const isLanding = playerBottom <= platformTop + 10 && player.body.velocity.y > 0;
        
        // Высчитываем, стоит ли персонаж на платформе
        const isStandingOn = player.body.touching.down && platform.body.touching.up;
        
        // Установка флагов для всех типов платформ
        if (isStandingOn) {
            player.onPlatform = true;
            player.currentPlatform = platform;
            
            // Дополнительно проверяем, является ли платформа движущейся - УДАЛЕНО
            // if (platform.movementType) {
            //     player.onMovingPlatform = true;
            // }

            // Очки начисляются только если это первое приземление на эту платформу
            if (isLanding && !platform.wasJumpedOn) {
                platform.wasJumpedOn = true;
                
                // Определяем стоимость прыжка на платформу в зависимости от типа
                let scoreValue = 5; // Базовая стоимость для обычной платформы
                
                // Увеличиваем стоимость платформы в зависимости от типа
                if (platform.type === 'fragile') {
                    scoreValue = 10; // Хрупкая платформа дает больше очков
                } else if (platform.type === 'slippery') {
                    scoreValue = 15; // Скользкая платформа дает еще больше очков
                } else if (platform.type === 'vanishing') {
                    scoreValue = 20; // Исчезающая платформа дает много очков
                } else if (platform.type === 'sticky') {
                    scoreValue = 10; // Липкая платформа
                } 
                // else if (platform.type === 'moving') { // Удалено
                //     scoreValue = 15; // Движущаяся платформа
                // }
                
                // Начисляем очки
                this.score += scoreValue;
                
                // Воспроизводим звук приземления на платформу
                if (this.sounds && this.sounds.platform) {
                    this.sounds.platform.play();
                }
            }
            
            // Обрабатываем специальное поведение платформ при приземлении на них
            switch (platform.type) {
                case 'fragile':
                    // Добавляем таймер для хрупкой платформы - она ломается через небольшой промежуток времени
                    if (!platform.breaking) {
                        platform.breaking = true;
                        const breakTimer = this.time.delayedCall(300, () => {
                            // Эффект разрушения платформы
                            if (platform.active && platform.container) {
                                // Анимируем разрушение
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
                    // На скользкой платформе игрок скользит в направлении движения
                    // Устанавливаем флаг скользкой платформы
                    player.isOnSlipperyPlatform = true;
                    
                    // Если игрок активно двигается, увеличиваем скорость
                    if (this.leftPressed) {
                        player.body.velocity.x = -200; // Увеличенная скорость влево
                    } else if (this.rightPressed) {
                        player.body.velocity.x = 200; // Увеличенная скорость вправо
                    } else {
                        // Если клавиши не нажаты, сохраняем скольжение в текущем направлении
                        // Уменьшаем замедление - скольжение дольше
                        if (Math.abs(player.body.velocity.x) > 10) {
                            player.body.velocity.x *= 0.99; // Очень медленное трение
                        } else {
                            // Если скорость очень мала, добавляем случайное скольжение
                            player.body.velocity.x = (Math.random() < 0.5 ? -1 : 1) * 40;
                        }
                    }
                    break;
                    
                case 'vanishing':
                    // Исчезающая платформа - исчезает сразу после отпрыгивания
                    if (!platform.vanishing) {
                        platform.vanishing = true;
                        
                        // Мигаем платформой перед исчезновением
                        const blinkTween = this.tweens.add({
                            targets: platform.container,
                            alpha: 0.2,
                            yoyo: true,
                            repeat: 2,
                            duration: 100,
                            onComplete: () => {
                                // Исчезаем и удаляем
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
                    // Липкая платформа - замедляет горизонтальное движение игрока
                    player.body.velocity.x *= 0.85; // Сильное замедление движения
                    
                    // Также замедляет начальную скорость следующего прыжка
                    if (!player.isOnStickyPlatform) {
                        player.isOnStickyPlatform = true;
                        
                        // Визуальный эффект "прилипания"
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
                    // Обычная платформа
                    // Сбрасываем флаг скользкой платформы
                    player.isOnSlipperyPlatform = false;
                    break;
            }
        } else {
            // Если игрок не стоит на платформе, сбрасываем флаги
            if (platform.type === 'sticky') {
                player.isOnStickyPlatform = false;
            }
            if (platform.type === 'slippery') {
                player.isOnSlipperyPlatform = false;
            }
        }
    }

    createUI() {
        // Создание UI элементов с фиксированной позицией относительно камеры
        this.scoreText = this.add.text(16, 16, 'Высота: 0', { 
            fontFamily: 'unutterable',
            fontSize: '32px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        this.scoreText.setScrollFactor(0);
        
        // Добавляем подсказки по управлению для ПК
        if (this.sys.game.device.os.desktop) {
            // Создаем подсказки по управлению
            const controlHint = this.add.text(16, 60, 
                'Управление: ←→ - движение, ПРОБЕЛ - прыжок, S - супер-прыжок', { 
                fontFamily: 'unutterable',
                fontSize: '16px', 
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 2
            });
            controlHint.setScrollFactor(0);
            
            // Через 5 секунд скрываем подсказку
            this.time.delayedCall(5000, () => {
                controlHint.alpha = 0;
            });
        }
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
            
            // Создаем видимые кнопки для способностей на мобильных устройствах
            // Кнопка обычного прыжка
            const jumpButton = this.add.circle(700, 500, 40, 0x4de9e7, 0.7);
            jumpButton.setScrollFactor(0);
            jumpButton.setInteractive();
            jumpButton.on('pointerdown', () => {
                this.jumpPressed = true;
            });
            jumpButton.on('pointerup', () => {
                this.jumpPressed = false;
            });
            
            // Текстовые подсказки на кнопках
            const jumpText = this.add.text(700, 500, "П", {
                fontFamily: 'unutterable',
                fontSize: '32px',
                fill: '#fff'
            }).setOrigin(0.5);
            jumpText.setScrollFactor(0);
        } else {
            // Для ПК добавляем обработку клавиш для способностей
            // Прыжок - пробел, используем метод update для проверки нажатия
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            
            // Сохраняем исходное обработчики, но теперь используем также прямую проверку клавиш
            this.spaceKey.on('down', () => {
                this.jumpPressed = true;
            });
            this.spaceKey.on('up', () => {
                this.jumpPressed = false;
            });
        }
    }

    playerMovement() {
        // Проверяем, что игрок существует
        if (!this.player || !this.player.body) return;
        
        // Устанавливаем базовую скорость игрока
        const moveSpeed = 200;
        
        // Флаг для определения, двигается ли игрок
        let isMoving = false;
        
        // Имитация трения/замедления, когда клавиши не нажаты
        const slowdownFactor = 0.9;
        
        // Проверяем нажатие клавиш и устанавливаем скорость
        if (this.leftPressed) {
            this.player.body.velocity.x = -moveSpeed;
            this.player.setFlipX(false);
            isMoving = true;
        } else if (this.rightPressed) {
            this.player.body.velocity.x = moveSpeed;
            this.player.setFlipX(true);
            isMoving = true;
        } else {
            // Плавное замедление, когда клавиши не нажаты
            this.player.body.velocity.x *= slowdownFactor;
            
            // Остановка, если скорость достаточно низкая
            if (Math.abs(this.player.body.velocity.x) < 10) {
                this.player.body.velocity.x = 0;
            }
        }
        
        // Проверяем нажатие клавиши прыжка
        if (this.jumpPressed) {
            const now = Date.now();
            
            // Проверяем, прошло ли достаточно времени с предыдущего прыжка
            if (now - this.lastJumpTime > this.jumpCooldown) {
                // Используем обработчик прыжка из PlayerAbilities для поддержки двойного прыжка
                const jumpPerformed = this.playerAbilities.handleJump();
                
                if (jumpPerformed) {
                    this.lastJumpTime = now;
                    
                    // Воспроизводим звук прыжка
                    if (this.sounds && this.sounds.jump) {
                        this.sounds.jump.play({ volume: 0.5 });
                    }
                    
                    // Создаем эффект пыли при прыжке
                    this.createJumpDustEffect();
                    
                    // Если игрок на липкой платформе, прыгаем ниже
                    if (this.player.isOnStickyPlatform) {
                        this.player.body.velocity.y *= 0.8;
                        this.player.isOnStickyPlatform = false;
                    }
                    
                    // Если игрок на движущейся платформе, добавляем импульс в зависимости от типа движения платформы - УДАЛЕНО
                    // if (this.player.onMovingPlatform && this.player.currentPlatform) {
                    //     if (this.player.currentPlatform.movementType === 'horizontal') {
                    //         // Добавляем горизонтальный импульс в направлении движения платформы
                    //         this.player.body.velocity.x += this.player.currentPlatform.moveSpeed * 
                    //                                        this.player.currentPlatform.moveDirection * 4;
                    //     } else if (this.player.currentPlatform.movementType === 'vertical') {
                    //         // Для платформы, движущейся вверх, увеличиваем высоту прыжка
                    //         if (this.player.currentPlatform.moveDirection < 0) {
                    //             this.player.body.velocity.y *= 1.2;
                    //         }
                    //     }
                        
                    //     // Сбрасываем флаги
                    //     this.player.onMovingPlatform = false;
                    //     this.player.currentPlatform = null;
                    // }
                }
            }
            
            // Сбрасываем флаг, чтобы прыжок не повторялся непрерывно
            this.jumpPressed = false;
        }
        
        // Обновляем анимацию в зависимости от того, движется ли игрок и на земле ли он
        this.updatePlayerAnimation(this.player.body.touching.down, isMoving);
    }
    
    updatePlayerAnimation(onGround, isMoving) {
        // Обновление анимации Spine-персонажа
        
        // Если игрок на земле и не движется
        if (onGround && !isMoving) {
            // Используем анимацию still для состояния на земле
            if (this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'still') {
                this.player.animationState.setAnimation(0, 'still', true);
            }
        }
        // Если игрок в воздухе
        else if (!onGround) {
            // Используем анимацию idle (прыжок) для состояния в воздухе
            if (this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'idle') {
                this.player.animationState.setAnimation(0, 'idle', true);
                
                // Скорость анимации замедляем, чтобы соответствовала движениям игрока
                this.player.animationState.timeScale = 0.3;
            }
        }
        // Если игрок на земле и движется
        else if (onGround && isMoving) {
            // Определяем направление движения для правильной ориентации
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
        // Физические константы для прыжков
        const MAX_JUMP_HEIGHT = 250; // Максимальная высота прыжка
        const MAX_JUMP_WIDTH = 300; // Максимальная ширина прыжка
        const MIN_HORIZONTAL_DISTANCE = 50; // Минимальное расстояние между платформами по горизонтали
        
        // Используем уже определенные в init() значения
        const MIN_VERTICAL_OFFSET = this.platformYMin; 
        const MAX_VERTICAL_OFFSET = this.platformYMax;

        // Уменьшаем количество генерируемых за раз рядов для оптимизации
        const ROWS_TO_GENERATE = Math.min(this.generationRowsCount, 6); // Максимум 6 рядов за раз
        
        // Быстрая проверка общего количества платформ
        const totalPlatforms = this.platforms.countActive() + this.fragilePlatforms.countActive() + 
            this.slipperyPlatforms.countActive() + this.vanishingPlatforms.countActive() + this.stickyPlatforms.countActive();
            
        // Если платформ нет, создаем начальную
        if (totalPlatforms === 0) {
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
        
        // Оптимизированная проверка количества существующих платформ
        if (totalPlatforms > this.maxPlatforms) {
            // Удаляем самые нижние платформы менее затратным способом
            this.allPlatforms.forEach(group => {
                const platforms = group.getChildren();
                
                // Сортируем только если нужно удалить много платформ
                if (platforms.length > 10) {
                    const toRemoveCount = Math.floor(platforms.length * 0.15); // Удаляем 15% платформ
                    
                    // Находим самые нижние платформы без полной сортировки
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
                    
                    // Удаляем найденные платформы
                    toRemove.forEach(platform => platform.destroy());
                }
            });
        }

        // Проверяем, нужно ли генерировать новые платформы
        const shouldGenerate = !this.player || this.player.y < this.lastPlatformY + this.platformGenerationBuffer;
            
        if (shouldGenerate) {
            this.lastPlatformGenerationTime = Date.now();
            
            let currentY = this.lastPlatformY;
            let platformsGenerated = 0;

            for (let row = 0; row < ROWS_TO_GENERATE; row++) {
                // Высота влияет на сложность: чем выше, тем сложнее, но не слишком
                const heightFactor = Math.min(0.7, Math.max(0.1, (this.score / 1000)));
                
                // Упрощенный расчет вертикального смещения
                const verticalOffset = MIN_VERTICAL_OFFSET + 
                    Math.floor(Math.random() * heightFactor * (MAX_VERTICAL_OFFSET - MIN_VERTICAL_OFFSET));
                
                currentY -= verticalOffset;
                this.lastPlatformY = Math.min(this.lastPlatformY, currentY);
                
                // Количество платформ в ряду - упрощаем расчет
                const platformsInRow = 1 + Math.floor(Math.random() * 2);
                
                // Создаем массив с платформами в текущем ряду для проверки перекрытий
                const rowPlatforms = [];
                
                let atLeastOnePlatformCreated = false;
                
                for (let i = 0; i < platformsInRow; i++) {
                    // Ограничиваем количество попыток создания платформы
                    let attempts = 0;
                    let platformCreated = false;
                    
                    while (attempts < 5 && !platformCreated) {
                        attempts++;
                        
                        // Упрощаем расчет ширины платформы
                        const widthMultiplier = 0.9 + Math.random() * 0.5;
                        const width = this.platformWidth * widthMultiplier;
                        
                        // Упрощаем расчет позиции X
                        const x = this.platformXMin + width / 2 + 
                            Math.random() * (this.cameras.main.width - 2 * this.platformXMin - width);
                        
                        // Проверяем перекрытие с существующими платформами в этом ряду
                        let overlaps = false;
                        for (const platform of rowPlatforms) {
                            if (Math.abs(platform.x - x) < (platform.displayWidth / 2 + width / 2 + MIN_HORIZONTAL_DISTANCE)) {
                                overlaps = true;
                                break;
                            }
                        }
                        
                        if (!overlaps || (i === 0 && attempts >= 3)) {
                            // Упрощаем определение типа платформы
                            let platformType = 'normal';
                            
                            if (this.score > 200) {
                                const typeRoll = Math.random();
                                
                                if (typeRoll < 0.2) {
                                    platformType = 'fragile';
                                } else if (typeRoll < 0.4) {
                                    platformType = 'slippery';
                                } else if (typeRoll < 0.5 && this.score > 500) {
                                    platformType = 'vanishing';
                                } else if (typeRoll < 0.6 && this.score > 400) {
                                    platformType = 'sticky';
                                } 
                                // else if (typeRoll < 0.8 && this.score > 300) { // Удалено
                                //     platformType = 'moving';
                                // }
                            }
                            
                            // Упрощаем логику гарантированной нормальной платформы
                            if (!atLeastOnePlatformCreated && (this.score < 400 || Math.random() < 0.7)) {
                                platformType = 'normal';
                            }
                            
                            // Создаем платформу
                            const platform = this.createPlatform(
                                x,
                                currentY,
                                width,
                                this.platformHeight,
                                platformType
                            );
                            
                            // Упрощаем логику звуковых эффектов
                            if (platform) {
                                rowPlatforms.push(platform);
                                platformCreated = true;
                                atLeastOnePlatformCreated = true;
                                platformsGenerated++;
                            }
                        }
                    }
                }
                
                // Если не создано ни одной платформы, создаем одну гарантированную в центре
                if (!atLeastOnePlatformCreated) {
                    const x = 200 + Math.random() * 400;
                    const width = this.platformWidth * 1.0;
                    this.createPlatform(
                        x,
                        currentY,
                        width,
                        this.platformHeight,
                        'normal'
                    );
                    
                    platformsGenerated++;
                }
            }
        }
    }

    getPlatformType(heightInfluence) {
        // Шанс получить особый тип платформы - значительно увеличен
        const specialChance = 0.6 + (heightInfluence * 0.3); // Было 0.3 + (heightInfluence * 0.5)
        
        // Шанс, что обычная платформа будет заменена на особую
        if (Math.random() < specialChance) {
            // Увеличиваем разнообразие платформ с ростом высоты
            let specialTypes = [];
            
            // На любой высоте могут быть хрупкие платформы (больше шансов)
            specialTypes.push('fragile', 'fragile');
            
            // Скользкие платформы появляются раньше
            if (heightInfluence > 0.1) { // Было 0.2
                specialTypes.push('slippery', 'slippery');
            }
            
            // Исчезающие платформы появляются раньше
            if (heightInfluence > 0.2) { // Было 0.3
                specialTypes.push('vanishing');
            }
            
            // Липкие платформы появляются примерно на той же высоте, что и исчезающие
            if (heightInfluence > 0.2) {
                specialTypes.push('sticky', 'sticky');
            }
            
            // Случайный выбор из доступных типов особых платформ
            return Phaser.Utils.Array.GetRandom(specialTypes);
        }
        
        // Иначе возвращаем обычную платформу
        return 'normal';
    }

    createPlatform(x, y, width, height, type) {
        // Проверка входных параметров
        if (x === undefined || y === undefined || width === undefined || height === undefined) {
            console.error('Некорректные параметры для создания платформы:', { x, y, width, height, type });
            return null;
        }
        
        // Выбираем соответствующую группу для платформы в зависимости от её типа
        let group;
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
        
        // Определяем текстуры для частей платформы
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
        
        // Создаем контейнер для объединения частей платформы
        const platformContainer = this.add.container(x, y);
        platformContainer.setDepth(10); // Устанавливаем depth ниже, чем у игрока
        
        // Создаем основную физическую платформу
        const platform = group.create(x, y, `${textureKey}_mid`);
        platform.setVisible(false); // Скрываем, так как будем использовать свои спрайты
        
        // Корректируем размер физического тела с учетом масштаба текстур
        const scaledWidth = width;
        const scaledHeight = 20; // Фиксированная высота для всех платформ
        
        platform.setScale(scaledWidth / platform.width, scaledHeight / platform.height);
        platform.refreshBody();
        platform.type = type; // Устанавливаем тип для проверки в коллизиях
        
        // Код для движущихся платформ - УДАЛЕН БЛОК
        // if (type === 'moving') { ... } 
        
        // Создаем визуальные части платформы
        // Левая часть
        const leftPart = this.add.image(-width/2 + (leftWidth*this.platformTextureScale)/2, 0, `${textureKey}_left`);
        leftPart.setScale(this.platformTextureScale); // Используем глобальный масштаб
        platformContainer.add(leftPart);
        
        // Правая часть
        const rightPart = this.add.image(width/2 - (rightWidth*this.platformTextureScale)/2, 0, `${textureKey}_right`);
        rightPart.setScale(this.platformTextureScale); // Используем глобальный масштаб
        platformContainer.add(rightPart);
        
        // Определяем сколько средних частей нам нужно
        const availableWidth = width - (leftWidth*this.platformTextureScale) - (rightWidth*this.platformTextureScale);
        const midCount = Math.max(0, Math.floor(availableWidth / (midWidth*this.platformTextureScale)));
        
        // Создаем средние части, если они нужны
        if (midCount > 0) {
            const scaledMidWidth = midWidth * this.platformTextureScale;
            const midStartX = -width/2 + (leftWidth*this.platformTextureScale);
            
            for (let i = 0; i < midCount; i++) {
                const midPart = this.add.image(midStartX + scaledMidWidth/2 + i * scaledMidWidth, 0, `${textureKey}_mid`);
                midPart.setScale(this.platformTextureScale); // Используем глобальный масштаб
                platformContainer.add(midPart);
            }
        }
        
        // Связываем контейнер с платформой для отображения
        platform.container = platformContainer;
        
        // Расширяем метод уничтожения платформы
        const originalDestroy = platform.destroy;
        platform.destroy = function() {
            if (this.container) {
                this.container.destroy();
            }
            originalDestroy.call(this);
        };
        
        // Обновляем последнюю позицию Y
        this.lastPlatformY = Math.min(this.lastPlatformY, y);
        
        // Шанс появления бонуса на платформе
        if (this.powerupManager && Math.random() < this.powerupManager.platformPowerupChance) {
            // Генерируем бонус прямо над платформой
            this.powerupManager.spawnPowerupOnPlatform(platform);
        }
        
        return platform;
    }

    // Метод для обновления масштаба всех существующих платформ
    updatePlatformScales() {
        this.allPlatforms.forEach(group => {
            group.getChildren().forEach(platform => {
                if (platform.container) {
                    const width = platform.width;
                    
                    // Находим текстуры платформы для расчетов
                    const textureKey = `platform_${platform.type}`;
                    const leftTexture = this.textures.get(`${textureKey}_left`);
                    const midTexture = this.textures.get(`${textureKey}_mid`);
                    const rightTexture = this.textures.get(`${textureKey}_right`);
                    
                    if (leftTexture && midTexture && rightTexture) {
                        const leftWidth = leftTexture.source[0].width;
                        const midWidth = midTexture.source[0].width;
                        const rightWidth = rightTexture.source[0].width;
                        const platformHeight = leftTexture.source[0].height;
                        
                        // Обновляем физическое тело
                        const scaledHeight = 20; // Фиксированная высота для всех платформ
                        platform.setScale(width / platform.width, scaledHeight / platform.height);
                        platform.refreshBody();
                        
                        // Берем части из контейнера
                        const parts = platform.container.list;
                        
                        if (parts.length >= 2) {
                            // Обновляем позицию и масштаб левой части (обычно первый элемент)
                            const leftPart = parts[0];
                            leftPart.setScale(this.platformTextureScale);
                            leftPart.x = -width/2 + (leftWidth*this.platformTextureScale)/2;
                            
                            // Обновляем позицию и масштаб правой части (обычно последний элемент)
                            const rightPart = parts[parts.length - 1];
                            rightPart.setScale(this.platformTextureScale);
                            rightPart.x = width/2 - (rightWidth*this.platformTextureScale)/2;
                            
                            // Обновляем средние части если они есть
                            if (parts.length > 2) {
                                const midStartX = -width/2 + (leftWidth*this.platformTextureScale);
                                const scaledMidWidth = midWidth * this.platformTextureScale;
                                
                                // Перебираем все средние части (исключая первую и последнюю)
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

    // Метод для обновления движущихся платформ - УДАЛЕН МЕТОД
    // updateMovingPlatforms(delta) { ... }
    
    // Создание эффекта пыли при прыжке
    createJumpDustEffect() {
        // Проверяем, что игрок существует
        if (!this.player) return;
        
        // Создаем простой эффект пыли под игроком без использования частиц
        const dustCount = 10; // Количество частиц пыли
        
        for (let i = 0; i < dustCount; i++) {
            // Расположение частицы пыли под ногами игрока, со случайным смещением
            const x = this.player.x + Phaser.Math.Between(-20, 20);
            const y = this.player.y + 30 + Phaser.Math.Between(-5, 5);
            
            // Создаем круг как визуальное представление частицы пыли
            const dust = this.add.circle(x, y, Phaser.Math.Between(2, 4), 0xcccccc, 0.7);
            dust.setDepth(90);
            
            // Анимируем движение и исчезновение частицы
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