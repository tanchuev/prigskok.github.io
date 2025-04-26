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
        
        // Разные типы платформ
        this.platformTypes = {
            normal: { chance: 30 }, // Обычная платформа (было 50, изначально 60)
            fragile: { chance: 25 }, // Хрупкая платформа (было 20, изначально 15)
            slippery: { chance: 25 }, // Скользкая платформа (было 20, изначально 15)
            vanishing: { chance: 20 }  // Исчезающая платформа (было 10)
        };
        
        // Счетчик для отслеживания времени игры
        this.gameTime = 0;
        
        // Оптимизированные параметры для генерации платформ
        this.platformGenerationBuffer = 600; // Расстояние в пикселях до верхней платформы, при котором начинается генерация
        this.maxPlatforms = 30; // Ограничиваем количество платформ для производительности
        this.generationRowsCount = 8; // Количество рядов платформ, генерируемых за один вызов
    }

    init(data) {
        // Получаем высший счет из предыдущих сессий
        this.highestScore = data.highScore || 0;
        
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
        
        // Разные типы платформ
        this.platformTypes = {
            normal: { chance: 30 }, // Обычная платформа (было 50, изначально 60)
            fragile: { chance: 25 }, // Хрупкая платформа (было 20, изначально 15)
            slippery: { chance: 25 }, // Скользкая платформа (было 20, изначально 15)
            vanishing: { chance: 20 }  // Исчезающая платформа (было 10)
        };
        
        // Мобильное управление
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        
        // Счетчик для отслеживания времени игры
        this.gameTime = 0;
    }

    preload() {
        // Временные ресурсы для прототипа
        this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
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
        // Размеры мира - увеличиваем высоту мира значительно
        this.physics.world.bounds.width = 800;
        this.physics.world.bounds.height = 100000; // Значительно больший мир по вертикали
        
        // Фон
        this.bg = this.add.tileSprite(400, 300, 800, 600, 'sky');
        this.bg.setScrollFactor(0);
        
        // Группы платформ
        this.platforms = this.physics.add.staticGroup();
        this.fragilePlatforms = this.physics.add.staticGroup();
        this.slipperyPlatforms = this.physics.add.staticGroup();
        this.vanishingPlatforms = this.physics.add.staticGroup();
        
        // Объединенная группа всех платформ для коллизий
        this.allPlatforms = [
            this.platforms,
            this.fragilePlatforms,
            this.slipperyPlatforms,
            this.vanishingPlatforms
        ];
        
        // Создание начальной платформы
        const startingPlatform = this.platforms.create(400, 600, 'platform_normal');
        startingPlatform.setScale(2.5, 1).refreshBody(); // Делаем её шире, но не выше
        this.lastPlatformY = 600;
        
        // Создание игрока с использованием Spine
        this.player = this.add.spine(400, this.initialPlayerY, 'halloween-creature', 'halloween-creature-atlas');
        
        // Устанавливаем скин тыквы
        this.player.skeleton.setSkinByName('pumpkin');
        this.player.skeleton.setSlotsToSetupPose();
        
        // Запускаем анимацию still для начала
        this.player.animationState.setAnimation(0, 'still', true);
        
        // Устанавливаем масштаб объекта Spine
        this.player.setScale(0.15);
        
        // Добавляем физическое тело к Spine-объекту
        this.physics.add.existing(this.player);
        
        // Настройка физического тела
        this.player.body.setSize(80, 80);
        this.player.body.setOffset(-40, -40);
        this.player.body.setBounce(0.2);
        
        // Сохраняем начальную позицию Y для расчета высоты
        this.initialPlayerY = this.player.y;
        this.maxHeightReached = 0;
        
        // Инициализация контрольных точек для оптимизации
        this.lastPlatformCheckpoint = this.player.y;
        this.lastCleanupCheckpoint = this.cameras.main.scrollY;
        
        // Теперь, когда игрок создан, генерируем платформы
        this.generatePlatforms();
        
        console.log(`Создан игрок на позиции Y=${this.initialPlayerY}`);
        
        // Игрок не должен выходить за боковые границы, но может двигаться вверх
        this.player.body.collideWorldBounds = false;
        
        // Создаем невидимые стены по бокам для предотвращения выхода игрока за боковые границы
        this.walls = this.physics.add.staticGroup();
        this.walls.create(5, 300, 'ground').setScale(0.1, 100).refreshBody();    // Левая стена
        this.walls.create(795, 300, 'ground').setScale(0.1, 100).refreshBody();  // Правая стена
        
        // Коллизия с боковыми стенами
        this.physics.add.collider(this.player, this.walls);
        
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
        
        // Добавление мобильного управления и кнопок способностей
        this.createMobileControls();
        
        // Интерфейс
        this.createUI();
        
        // Создание индикаторов способностей
        this.playerAbilities.createAbilityIndicators();
    }

    setupCollisions() {
        // Настройка коллизий для всех типов платформ
        this.allPlatforms.forEach(group => {
            this.physics.add.collider(this.player, group, this.playerHitPlatform, null, this);
        });
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
                console.log(`Запускаем генерацию платформ, игрок Y=${this.player.y}, порог=${platformGenerationThreshold}`);
                this.generatePlatforms();
            }
        }
        
        // Проверяем, не приблизился ли игрок к верхней границе мира
        if (this.player.y < this.physics.world.bounds.height * 0.1) {
            // Расширяем мир вверх при необходимости
            this.physics.world.bounds.height += 10000;
            this.physics.world.bounds.y -= 10000;
            
            // Обновляем границы камеры
            this.cameras.main.setBounds(0, this.physics.world.bounds.y, 800, this.physics.world.bounds.height);
            
            // Обновляем боковые стены
            this.walls.getChildren().forEach(wall => {
                wall.y = this.cameras.main.scrollY + 300;
            });
        }
        
        // Проверяем, не упал ли игрок слишком низко
        if (this.player.y > this.cameras.main.scrollY + 800) {
            // Если игрок упал за нижнюю границу экрана, он проигрывает
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
            
            return;
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
                        platform.destroy();
                    }
                });
            });
            
            console.log(`Очистка старых платформ, порог: ${cleanupThreshold}`);
        }
        
        // Базовое управление
        this.playerMovement();
        
        // Обновление менеджера бонусов
        this.powerupManager.update();
        
        // Обновление индикаторов способностей
        this.playerAbilities.updateAbilityIndicators();
        
        // Обновляем позицию боковых стен каждый кадр, чтобы они следовали за камерой
        this.walls.getChildren().forEach(wall => {
            wall.y = this.cameras.main.scrollY + 300;
        });
    }

    playerHitPlatform(player, platform) {
        // Если игрок приземлился на платформу
        if (player.body.touching.down) {
            // Проверяем направление движения для правильной анимации
            if (player.body.velocity.x < 0) {
                // Движение влево
                player.scaleX = -0.15; // Меняем на положительный, чтобы персонаж смотрел влево
                player.animationState.setAnimation(0, 'idle', true);
                player.animationState.timeScale = 0.5;
            } else if (player.body.velocity.x > 0) {
                // Движение вправо
                player.scaleX = 0.15; // Меняем на отрицательный, чтобы персонаж смотрел вправо
                player.animationState.setAnimation(0, 'idle', true);
                player.animationState.timeScale = 0.5;
            } else {
                // Стоит на месте
                player.animationState.setAnimation(0, 'still', true);
            }
        }
        
        // Обработка столкновения с разными типами платформ
        
        // Сбрасываем доступность двойного прыжка при касании любой платформы
        if (this.playerAbilities && player.body.touching.down) {
            // Если двойной прыжок на перезарядке, не сбрасываем таймер
            if (!this.playerAbilities.abilities.doubleJump.available &&
                Date.now() - this.playerAbilities.abilities.doubleJump.lastUsed < this.playerAbilities.abilities.doubleJump.cooldown) {
                // Перезарядка в процессе, не восстанавливаем
            } else {
                // Восстанавливаем доступность двойного прыжка
                this.playerAbilities.abilities.doubleJump.available = true;
                
                // Обновляем UI индикатор
                this.playerAbilities.updateAbilityIndicators();
            }
        }
        
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
        // Создание UI элементов с фиксированной позицией относительно камеры
        this.scoreText = this.add.text(16, 16, 'Высота: 0', { 
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
        // Проверяем, находится ли игрок на земле
        const onGround = this.player.body.touching.down;
        let isMoving = false;
        
        // Движение влево-вправо через клавиатуру или мобильное управление
        if (this.cursors.left.isDown || this.leftPressed) {
            // Учитываем множитель скорости от бонуса
            const speedMultiplier = this.player.speedMultiplier || 1;
            const targetVelocity = -160 * speedMultiplier;
            
            // Применяем плавное ускорение вместо резкого изменения скорости
            const currentVelocity = this.player.body.velocity.x;
            const acceleration = 15 * speedMultiplier; // Скорость изменения
            
            // Постепенно приближаем скорость к целевой
            if (currentVelocity > targetVelocity) {
                this.player.body.setVelocityX(Math.max(targetVelocity, currentVelocity - acceleration));
            }
            
            // Проигрываем анимацию движения влево и отражаем спрайт
            if (onGround) {
                this.player.scaleX = -0.15; // Меняем на положительный, чтобы персонаж смотрел влево
                if (this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'idle') {
                    this.player.animationState.setAnimation(0, 'idle', true);
                    this.player.animationState.timeScale = 0.5;
                }
            }
            isMoving = true;
        } else if (this.cursors.right.isDown || this.rightPressed) {
            // Учитываем множитель скорости от бонуса
            const speedMultiplier = this.player.speedMultiplier || 1;
            const targetVelocity = 160 * speedMultiplier;
            
            // Применяем плавное ускорение вместо резкого изменения скорости
            const currentVelocity = this.player.body.velocity.x;
            const acceleration = 15 * speedMultiplier; // Скорость изменения
            
            // Постепенно приближаем скорость к целевой
            if (currentVelocity < targetVelocity) {
                this.player.body.setVelocityX(Math.min(targetVelocity, currentVelocity + acceleration));
            }
            
            // Проигрываем анимацию движения вправо и не отражаем спрайт
            if (onGround) {
                this.player.scaleX = 0.15; // Меняем на отрицательный, чтобы персонаж смотрел вправо
                if (this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'idle') {
                    this.player.animationState.setAnimation(0, 'idle', true);
                    this.player.animationState.timeScale = 0.5;
                }
            }
            isMoving = true;
        } else {
            // Если игрок на скользкой платформе, не останавливаем его полностью
            if (this.player.body.friction && this.player.body.friction.x < 0.2) {
                this.player.body.setVelocityX(this.player.body.velocity.x * 0.95);
                isMoving = Math.abs(this.player.body.velocity.x) > 20;
            } else {
                // Плавное замедление вместо резкой остановки
                const currentVelocity = this.player.body.velocity.x;
                const deceleration = 10; // Скорость замедления
                
                if (Math.abs(currentVelocity) < deceleration) {
                    this.player.body.setVelocityX(0);
                    isMoving = false;
                } else if (currentVelocity > 0) {
                    this.player.body.setVelocityX(currentVelocity - deceleration);
                    isMoving = true;
                } else {
                    this.player.body.setVelocityX(currentVelocity + deceleration);
                    isMoving = true;
                }
            }
            
            // Если игрок на земле и не двигается, проигрываем анимацию бездействия
            if (onGround && !isMoving && this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'still') {
                this.player.animationState.setAnimation(0, 'still', true);
            }
        }
        
        // Обработка прыжка с мгновенной реакцией
        const currentTime = Date.now();
        if (this.jumpPressed) {
            if (currentTime > this.lastJumpTime + this.jumpCooldown) {
                // Сразу пытаемся выполнить прыжок
                if (this.playerAbilities.handleJump()) {
                    this.lastJumpTime = currentTime;
                    
                    // Для Spine используем анимацию idle для прыжка
                    this.player.animationState.setAnimation(0, 'idle', true);
                    this.player.animationState.timeScale = 0.3;
                }
            }
        }
        
        // Обновляем анимации в зависимости от состояния
        this.updatePlayerAnimation(onGround, isMoving);
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
                this.player.scaleX = -0.15; // Меняем на положительный, чтобы персонаж смотрел влево
                
                if (this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'idle') {
                    this.player.animationState.setAnimation(0, 'idle', true);
                    this.player.animationState.timeScale = 0.5;
                }
            } 
            else if (this.player.body.velocity.x > 0) {
                this.player.scaleX = 0.15; // Меняем на отрицательный, чтобы персонаж смотрел вправо
                
                if (this.player.animationState.getCurrent(0) && this.player.animationState.getCurrent(0).animation.name !== 'idle') {
                    this.player.animationState.setAnimation(0, 'idle', true);
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
            this.slipperyPlatforms.countActive() + this.vanishingPlatforms.countActive();
            
        // Логируем только в режиме отладки или с меньшей частотой
        if (totalPlatforms % 10 === 0) {
            console.log(`Генерация платформ. Всего: ${totalPlatforms}, Высота: ${this.score}, lastPlatformY: ${this.lastPlatformY}`);
        }
        
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
                                }
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
            default:
                group = this.platforms;
                break;
        }
        
        // Создаем платформу и добавляем в нужную группу
        const platform = group.create(x, y, `platform_${type}`);
        
        // Проверяем, что платформа создана успешно
        if (!platform) {
            console.error('Не удалось создать платформу:', { x, y, width, height, type });
            return null;
        }
        
        // Устанавливаем размер платформы
        platform.setScale(width / platform.width, height / platform.height);
        platform.refreshBody();
        
        // Устанавливаем тип платформы для возможности проверки в коллизиях
        platform.type = type;
        
        // Обновляем последнюю позицию Y
        this.lastPlatformY = Math.min(this.lastPlatformY, y);
        
        // Шанс появления бонуса на платформе
        if (this.powerupManager && Math.random() < this.powerupManager.platformPowerupChance) {
            // Генерируем бонус прямо над платформой
            this.powerupManager.spawnPowerupOnPlatform(platform);
        }
        
        return platform;
    }
} 