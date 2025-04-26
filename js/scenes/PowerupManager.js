class PowerupManager {
    constructor(scene) {
        this.scene = scene;
        this.powerups = this.scene.physics.add.group();
        this.spawnTimer = null;
        this.powerupTypes = [
            { type: 'speed', color: 0xffff00, chance: 25 },
            { type: 'bounce', color: 0x00ff00, chance: 25 },
            { type: 'shield', color: 0x0088ff, chance: 25 },
            { type: 'wings', color: 0xffffff, chance: 15 },
            { type: 'earthquake', color: 0x8b4513, chance: 10 }
        ];
        
        // Вероятность появления бонуса на платформе (по умолчанию 20%)
        this.platformPowerupChance = 0.2;
        
        // Режим генерации бонусов (по умолчанию 'both')
        // 'timer' - только по таймеру
        // 'platform' - только при создании платформ
        // 'both' - оба варианта
        this.spawningMode = 'both';
        
        // Создаем текстуры для бонусов
        this.createPowerupTextures();
    }
    
    // Создаем текстуры для разных типов бонусов
    createPowerupTextures() {
        // Временные текстуры для бонусов
        this.scene.textures.generate('powerup_speed', { data: ['8888'], pixelWidth: 32, pixelHeight: 32, palette: ['#ffff00'] });
        this.scene.textures.generate('powerup_bounce', { data: ['8888'], pixelWidth: 32, pixelHeight: 32, palette: ['#00ff00'] });
        this.scene.textures.generate('powerup_shield', { data: ['8888'], pixelWidth: 32, pixelHeight: 32, palette: ['#0088ff'] });
        this.scene.textures.generate('powerup_wings', { data: ['8888'], pixelWidth: 32, pixelHeight: 32, palette: ['#ffffff'] });
        this.scene.textures.generate('powerup_earthquake', { data: ['8888'], pixelWidth: 32, pixelHeight: 32, palette: ['#8b4513'] });
        
        // Частица для эффектов
        this.scene.textures.generate('particle', { data: ['8'], pixelWidth: 8, pixelHeight: 8, palette: ['#ffffff'] });
        
        // Временная текстура для крыльев
        this.scene.textures.generate('wings', { data: ['88', '88'], pixelWidth: 32, pixelHeight: 16, palette: ['#ffffff'] });
        
        // Индикатор крыльев
        this.scene.textures.generate('wings_indicator', { data: ['8'], pixelWidth: 10, pixelHeight: 10, palette: ['#ffffff'] });
    }
    
    // Начать спаунить бонусы с заданным интервалом
    startSpawning(interval = 20000, spawningMode = 'both') {
        // Устанавливаем режим генерации
        this.spawningMode = spawningMode;
        
        // Если выбран режим 'platform' или 'both', установим вероятность появления на платформах
        if (spawningMode === 'platform' || spawningMode === 'both') {
            // Увеличиваем вероятность в режиме только на платформах
            this.platformPowerupChance = spawningMode === 'platform' ? 0.3 : 0.2;
        }
        
        // Если режим не включает таймер, выходим
        if (spawningMode === 'platform') {
            // Останавливаем таймер, если он был
            if (this.spawnTimer) {
                this.spawnTimer.remove();
                this.spawnTimer = null;
            }
            return;
        }
        
        // Останавливаем предыдущий таймер, если он был
        if (this.spawnTimer) {
            this.spawnTimer.remove();
        }
        
        // Создаем новый таймер
        this.spawnTimer = this.scene.time.addEvent({
            delay: interval,
            callback: this.spawnRandomPowerup,
            callbackScope: this,
            loop: true
        });
        
        // Сразу создаем первый бонус
        this.spawnRandomPowerup();
    }
    
    // Создание бонуса на конкретной платформе
    spawnPowerupOnPlatform(platform) {
        // Выбираем случайный тип бонуса на основе весов
        const powerupType = this.getRandomPowerupType();
        
        // Создаем бонус над платформой
        const powerup = this.powerups.create(
            platform.x,
            platform.y - platform.height - 20,
            `powerup_${powerupType}`
        );
        
        // Устанавливаем тип бонуса как свойство
        powerup.powerupType = powerupType;
        
        // Устанавливаем depth ниже, чем у игрока
        powerup.setDepth(50);
        
        // Анимация парения
        this.scene.tweens.add({
            targets: powerup,
            y: powerup.y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Добавляем частицы для эффекта свечения
        const particles = this.scene.add.particles(powerup.x, powerup.y, 'particle', {
            lifespan: 1000,
            speed: { min: 30, max: 50 },
            scale: { start: 0.5, end: 0 },
            quantity: 1,
            frequency: 100,
            emitting: true
        });
        
        // Устанавливаем depth для частиц
        particles.setDepth(49);
        
        // Связываем частицы с бонусом
        powerup.particles = particles;
        
        // Обработка столкновения с игроком
        this.scene.physics.add.overlap(
            this.scene.player,
            powerup,
            this.collectPowerup,
            null,
            this
        );
        
        // Удаляем бонус через некоторое время, если его не собрали
        this.scene.time.delayedCall(15000, () => {
            if (powerup.active) {
                if (powerup.particles) {
                    powerup.particles.destroy();
                }
                powerup.destroy();
            }
        });
        
        return powerup;
    }
    
    // Остановить спаун бонусов
    stopSpawning() {
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }
    }
    
    // Создание случайного бонуса на случайной платформе
    spawnRandomPowerup() {
        // Получаем все активные платформы
        const platforms = [];
        
        // Собираем платформы из разных групп
        this.scene.allPlatforms.forEach(group => {
            group.getChildren().forEach(platform => {
                // Проверяем, что платформа видима и активна
                if (platform.active && platform.visible && platform.body.enable) {
                    platforms.push(platform);
                }
            });
        });
        
        // Если нет платформ, выходим
        if (platforms.length === 0) {
            return;
        }
        
        // Выбираем случайную платформу
        const platform = Phaser.Utils.Array.GetRandom(platforms);
        
        // Генерируем бонус на выбранной платформе
        this.spawnPowerupOnPlatform(platform);
    }
    
    // Выбор случайного типа бонуса на основе весов
    getRandomPowerupType() {
        // Суммируем все шансы
        const totalChance = this.powerupTypes.reduce((sum, type) => sum + type.chance, 0);
        
        // Выбираем случайное число
        const rand = Phaser.Math.Between(0, totalChance);
        
        // Определяем, какой тип выпал
        let cumulativeChance = 0;
        for (const powerupType of this.powerupTypes) {
            cumulativeChance += powerupType.chance;
            if (rand <= cumulativeChance) {
                return powerupType.type;
            }
        }
        
        // На всякий случай возвращаем первый тип
        return this.powerupTypes[0].type;
    }
    
    // Обработка сбора бонуса
    collectPowerup(player, powerup) {
        // Определяем тип бонуса
        const powerupType = powerup.powerupType;
        
        // Создаем эффект сбора
        this.createCollectEffect(powerup.x, powerup.y, powerupType);
        
        // Активируем соответствующий эффект
        switch (powerupType) {
            case 'speed':
            case 'bounce':
            case 'shield':
            case 'wings':
                // Бонусы для игрока
                this.scene.playerAbilities.activatePowerup(powerupType);
                break;
            case 'earthquake':
                // Создаем эффект землетрясения
                this.createEarthquakeEffect(powerup.x, powerup.y);
                break;
        }
        
        // Удаляем связанные частицы
        if (powerup.particles) {
            powerup.particles.destroy();
        }
        
        // Удаляем бонус
        powerup.destroy();
    }
    
    // Создание визуального эффекта при сборе бонуса
    createCollectEffect(x, y, type) {
        // Определяем цвет эффекта в зависимости от типа
        let color;
        switch (type) {
            case 'speed':
                color = 0xffff00;
                break;
            case 'bounce':
                color = 0x00ff00;
                break;
            case 'shield':
                color = 0x0088ff;
                break;
            case 'wings':
                color = 0xffffff;
                break;
            case 'earthquake':
                color = 0x8b4513;
                break;
            default:
                color = 0xffffff;
                break;
        }
        
        // Создаем вспышку
        const flash = this.scene.add.circle(x, y, 40, color, 0.7);
        flash.setDepth(80); // Выше платформ, но ниже игрока
        
        // Анимация исчезновения
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 2,
            duration: 300,
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Создаем частицы
        const particles = this.scene.add.particles(x, y, 'particle', {
            lifespan: 800,
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            quantity: 20,
            tint: color
        });
        particles.setDepth(79); // Выше платформ, но ниже игрока
        
        // Удаляем частицы через некоторое время
        this.scene.time.delayedCall(800, () => {
            particles.destroy();
        });
    }
    
    // Создание эффекта землетрясения
    createEarthquakeEffect(x, y) {
        // Создаем вспышку
        const flash = this.scene.add.circle(x, y, 60, 0x8b4513, 0.5);
        flash.setDepth(80); // Выше платформ, но ниже игрока
        
        // Анимация расширения
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 3,
            duration: 500,
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Эффект сотрясения камеры
        this.scene.cameras.main.shake(500, 0.02);
        
        // Получаем ближайшие платформы и применяем эффект
        this.applyEarthquakeToNearbyPlatforms(x, y, 200);
    }
    
    // Применение эффекта землетрясения к платформам в радиусе
    applyEarthquakeToNearbyPlatforms(x, y, radius) {
        // Проходим по всем группам платформ
        this.scene.allPlatforms.forEach(group => {
            group.getChildren().forEach(platform => {
                // Вычисляем расстояние от эпицентра до платформы
                const distance = Phaser.Math.Distance.Between(x, y, platform.x, platform.y);
                
                // Если платформа в радиусе действия и не хрупкая
                if (distance <= radius && platform.type !== 'fragile') {
                    // Эффект дрожания для платформы и ее контейнера
                    const targets = platform.container ? [platform.container] : [platform];
                    
                    this.scene.tweens.add({
                        targets: targets,
                        x: platform.x + Phaser.Math.Between(-10, 10),
                        y: platform.y + Phaser.Math.Between(-5, 5),
                        duration: 100,
                        yoyo: true,
                        repeat: 4
                    });
                }
                // Если хрупкая платформа, сразу разрушаем
                else if (distance <= radius && platform.type === 'fragile') {
                    if (!platform.isBreaking) {
                        platform.isBreaking = true;
                        
                        // Анимация разрушения
                        this.scene.tweens.add({
                            targets: platform.container || platform,
                            alpha: 0,
                            y: platform.y + 20,
                            duration: 300,
                            onStart: () => {
                                platform.body.enable = false;
                            },
                            onComplete: () => {
                                platform.destroy();
                            }
                        });
                    }
                }
            });
        });
    }
    
    // Обновление позиций эффектов для активных бонусов
    update() {
        // Обновляем частицы для активных бонусов
        this.powerups.getChildren().forEach(powerup => {
            if (powerup.particles) {
                powerup.particles.setPosition(powerup.x, powerup.y);
            }
        });
    }
} 