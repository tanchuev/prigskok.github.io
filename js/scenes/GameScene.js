class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        // Инициализация переменных
        this.gameOver = false;
        this.score = 0;
        this.platformYMin = 80;  // Минимальное расстояние по Y между платформами
        this.platformYMax = 120; // Максимальное расстояние по Y между платформами
        this.platformXMin = 50;  // Минимальное расстояние платформы от края
        this.floodHeight = 0;    // Высота затопления
        this.floodSpeed = 0.2;   // Скорость затопления
        this.lastPlatformY = 600; // Начальная высота для платформ
        this.jumpVelocity = -350;
        this.cameraYMin = 99999;
        
        // Параметры для платформ
        this.platformWidth = 96;
        this.platformHeight = 32;
        
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
        graphics.fillRect(0, 0, 96, 32);
        graphics.strokeRect(0, 0, 96, 32);
        graphics.generateTexture('platform_normal', 96, 32);
        
        // Текстура для хрупкой платформы (оранжевая)
        graphics.clear();
        graphics.lineStyle(2, 0x000000);
        graphics.fillStyle(0xe9a74d);
        graphics.fillRect(0, 0, 96, 32);
        graphics.strokeRect(0, 0, 96, 32);
        graphics.generateTexture('platform_fragile', 96, 32);
        
        // Текстура для скользкой платформы (голубая)
        graphics.clear();
        graphics.lineStyle(2, 0x000000);
        graphics.fillStyle(0x4de9e7);
        graphics.fillRect(0, 0, 96, 32);
        graphics.strokeRect(0, 0, 96, 32);
        graphics.generateTexture('platform_slippery', 96, 32);
        
        // Текстура для исчезающей платформы (розовая)
        graphics.clear();
        graphics.lineStyle(2, 0x000000);
        graphics.fillStyle(0xe94d9d);
        graphics.fillRect(0, 0, 96, 32);
        graphics.strokeRect(0, 0, 96, 32);
        graphics.generateTexture('platform_vanishing', 96, 32);
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
        startingPlatform.setScale(2).refreshBody();
        
        // Создание процедурно-генерируемых платформ
        this.generatePlatforms(600);
        
        // Создание игрока
        this.player = this.physics.add.sprite(400, 550, 'player');
        this.player.setBounce(0.2);
        
        // Игрок не должен выходить за боковые границы, но может двигаться вверх
        this.player.setCollideWorldBounds(false);
        
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
        this.powerupManager.startSpawning();
        
        // Настройка камеры
        this.setupCamera();
        
        // Создание управления
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Добавление мобильного управления
        this.createMobileControls();
        
        // Интерфейс
        this.createUI();
        
        // Создание индикаторов способностей
        this.playerAbilities.createAbilityIndicators();
        
        // Уровень затопления - фиксируем в нижней части экрана
        this.floodRect = this.add.rectangle(400, 600, 800, 10, 0x0000ff);
        this.floodRect.setScrollFactor(0); // Привязываем к камере
        this.floodHeight = 0; // Реальная высота уровня воды
        
        // Добавление таймера для увеличения сложности
        this.time.addEvent({
            delay: 10000, // 10 секунд
            callback: this.increaseFloodSpeed,
            callbackScope: this,
            loop: true
        });
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
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        this.cameras.main.setDeadzone(400, 200);
    }

    update(time, delta) {
        if (this.gameOver) {
            return;
        }
        
        // Увеличиваем счетчик времени
        this.gameTime += delta / 1000; // в секундах
        
        // Обновление фона
        this.bg.tilePositionY = -this.cameras.main.scrollY * 0.3;
        
        // Обновление счета в зависимости от высоты
        this.score = Math.max(this.score, Math.floor(600 - this.player.y + this.cameras.main.scrollY));
        this.scoreText.setText('Высота: ' + this.score);
        
        // Отслеживание минимального Y камеры
        const previousCameraY = this.cameraYMin;
        this.cameraYMin = Math.min(this.cameraYMin, this.cameras.main.scrollY);
        
        // Генерация новых платформ, если камера поднялась достаточно высоко
        // Используем более гибкое условие для генерации платформ
        if (this.cameras.main.scrollY < this.lastPlatformY - 600 || this.player.y < this.lastPlatformY - 400) {
            this.generatePlatforms(this.lastPlatformY - 800);
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
        if (this.player.y > this.cameras.main.scrollY + 1200) {
            // Если игрок упал слишком низко, пытаемся вернуть его на последнюю платформу
            this.respawnPlayer();
        }
        
        // Удаляем платформы, которые слишком далеко внизу (оптимизация)
        const cleanupThreshold = this.cameras.main.scrollY + 1200; // 1200 пикселей ниже текущего положения камеры
        
        this.allPlatforms.forEach(group => {
            group.getChildren().forEach(platform => {
                if (platform.y > cleanupThreshold) {
                    platform.destroy();
                }
            });
        });
        
        // Базовое управление
        this.playerMovement();
        
        // Обновление уровня затопления
        this.updateFloodLevel();
        
        // Обновление менеджера бонусов
        this.powerupManager.update();
        
        // Обновление индикаторов способностей
        this.playerAbilities.updateAbilityIndicators();
        
        // Обновляем позицию боковых стен каждый кадр, чтобы они следовали за камерой
        this.walls.getChildren().forEach(wall => {
            wall.y = this.cameras.main.scrollY + 300;
        });
        
        // Проверка проигрыша (если игрок падает ниже затопления)
        this.checkGameOver();
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
        // Создание UI элементов с фиксированной позицией относительно камеры
        this.scoreText = this.add.text(16, 16, 'Высота: 0', { 
            fontSize: '32px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        this.scoreText.setScrollFactor(0);
        
        // Индикатор уровня затопления
        this.floodSpeedText = this.add.text(16, 60, 'Скорость воды: 1x', {
            fontSize: '20px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3
        });
        this.floodSpeedText.setScrollFactor(0);
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
        // вместо проверки y >= 0, так как у нас могут быть отрицательные координаты
        const platformRows = 15; // Количество рядов платформ для генерации
        
        for (let row = 0; row < platformRows; row++) {
            const platformCount = Phaser.Math.Between(2, 4); // Количество платформ на одной высоте
            
            for (let i = 0; i < platformCount; i++) {
                const x = Phaser.Math.Between(this.platformXMin, 800 - this.platformXMin);
                
                // Определяем тип платформы на основе вероятности
                const platformType = this.getPlatformType();
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
                
                // Случайный размер платформы
                const scale = Phaser.Math.FloatBetween(0.8, 1.2);
                platform.setScale(scale, 1).refreshBody();
            }
            
            // Следующая высота для платформ
            y -= Phaser.Math.Between(this.platformYMin, this.platformYMax);
        }
        
        this.lastPlatformY = startY < this.lastPlatformY ? startY : this.lastPlatformY;
    }

    getPlatformType() {
        // Выбираем тип платформы на основе вероятности
        // Учитываем время игры - со временем увеличиваем сложность
        
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
        // Постепенное увеличение уровня затопления
        this.floodHeight += this.floodSpeed;
        
        // Обновление прямоугольника затопления
        this.floodRect.height = 10 + 100 * (this.floodSpeed / 0.2); // Визуально увеличиваем высоту воды при росте скорости
        this.floodRect.y = 600 - this.floodRect.height / 2;
        
        // Обновляем текст скорости затопления
        const floodSpeedMultiplier = Math.round(this.floodSpeed / 0.2 * 10) / 10;
        this.floodSpeedText.setText(`Скорость воды: ${floodSpeedMultiplier}x`);
        
        // Эффект усиления цвета при увеличении скорости
        if (floodSpeedMultiplier > 1) {
            const blueValue = Math.max(0, 255 - floodSpeedMultiplier * 30);
            const color = Phaser.Display.Color.GetColor(0, 0, blueValue);
            this.floodRect.setFillStyle(color);
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
            this.player.y = closestPlatform.y - 50; // 50 пикселей над платформой
            this.player.setVelocity(0, 0);
            
            // Визуальный эффект респауна
            this.cameras.main.flash(300, 255, 0, 0);
        } else {
            // Если платформ нет, создаем новую и респауним на ней
            const respawnY = this.cameras.main.scrollY + 500;
            const respawnPlatform = this.platforms.create(400, respawnY, 'platform_normal');
            respawnPlatform.setScale(2).refreshBody();
            
            this.player.x = 400;
            this.player.y = respawnY - 50;
            this.player.setVelocity(0, 0);
            
            // Визуальный эффект респауна
            this.cameras.main.flash(300, 255, 0, 0);
        }
    }
} 