class PlayerAbilities {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        
        // Базовые способности
        this.abilities = {
            // Пассивное усиление прыжка
            enhancedJump: {
                active: true,
                // Увеличение прыжка на 20%
                effect: () => {
                    this.player.jumpStrength = this.scene.jumpVelocity * 1.2;
                }
            },
            
            // Двойной прыжок
            doubleJump: {
                active: false,
                cooldown: 8000, // 8 секунд
                lastUsed: 0,
                available: true,
                // Позволяет сделать второй прыжок в воздухе
                effect: () => {
                    if (this.abilities.doubleJump.available && !this.player.body.touching.down) {
                        this.player.setVelocityY(this.player.jumpStrength);
                        this.abilities.doubleJump.available = false;
                        this.abilities.doubleJump.lastUsed = Date.now();
                        
                        // Визуальный эффект
                        this.createJumpEffect();
                        
                        // Перезарядка
                        this.scene.time.delayedCall(this.abilities.doubleJump.cooldown, () => {
                            this.abilities.doubleJump.available = true;
                            
                            // Обновляем индикатор
                            if (this.scene.doubleJumpIndicator) {
                                this.scene.doubleJumpIndicator.setFillStyle(0x00ff00);
                            }
                        });
                    }
                }
            },
            
            // Супер-отскок
            superJump: {
                active: false,
                cooldown: 45000, // 45 секунд
                lastUsed: 0,
                available: true,
                charging: false,
                chargeLevel: 0,
                // Мощный прыжок с временной неуязвимостью
                effect: () => {
                    if (this.abilities.superJump.available && this.player.body.touching.down) {
                        // Начинаем заряжать прыжок
                        this.abilities.superJump.charging = true;
                        this.abilities.superJump.chargeLevel = 0;
                        
                        // Визуализация зарядки
                        this.showChargeEffect();
                    }
                },
                // Выполнение прыжка после зарядки
                execute: (direction) => {
                    if (this.abilities.superJump.charging) {
                        // Отключаем зарядку
                        this.abilities.superJump.charging = false;
                        
                        // Применяем супер-прыжок
                        const power = -800; // Мощность прыжка (было -600)
                        this.player.setVelocityY(power);
                        
                        // Если нажата клавиша направления, добавляем импульс по X
                        if (direction === 'left') {
                            this.player.setVelocityX(-300);
                        } else if (direction === 'right') {
                            this.player.setVelocityX(300);
                        }
                        
                        // Временная неуязвимость
                        this.player.setTint(0xffff00);
                        this.scene.time.delayedCall(1000, () => {
                            this.player.clearTint();
                        });
                        
                        // Визуальный эффект
                        this.createSuperJumpEffect();
                        
                        // Перезарядка
                        this.abilities.superJump.available = false;
                        this.abilities.superJump.lastUsed = Date.now();
                        
                        this.scene.time.delayedCall(this.abilities.superJump.cooldown, () => {
                            this.abilities.superJump.available = true;
                            
                            // Обновляем индикатор
                            if (this.scene.superJumpIndicator) {
                                this.scene.superJumpIndicator.setFillStyle(0xff8800);
                            }
                        });
                    }
                },
                // Отмена зарядки
                cancel: () => {
                    if (this.abilities.superJump.charging) {
                        this.abilities.superJump.charging = false;
                        if (this.chargeEffect) {
                            this.chargeEffect.destroy();
                        }
                    }
                }
            }
        };
        
        // Подбираемые бонусы
        this.powerups = {
            // Ускорение
            speed: {
                active: false,
                duration: 7000, // 7 секунд
                effect: () => {
                    this.powerups.speed.active = true;
                    this.player.speedMultiplier = 1.5;
                    
                    // Визуальный эффект
                    this.player.setTint(0xffff00);
                    
                    // Таймер окончания действия
                    this.scene.time.delayedCall(this.powerups.speed.duration, () => {
                        this.powerups.speed.active = false;
                        this.player.speedMultiplier = 1;
                        this.player.clearTint();
                    });
                }
            },
            
            // Пружинистость (увеличение высоты прыжка)
            bounce: {
                active: false,
                duration: 10000, // 10 секунд
                effect: () => {
                    this.powerups.bounce.active = true;
                    
                    // Сохраняем оригинальную силу прыжка
                    const originalJumpStrength = this.player.jumpStrength;
                    
                    // Увеличиваем силу прыжка на 30%
                    this.player.jumpStrength *= 1.3;
                    
                    // Визуальный эффект
                    const bounceEffect = this.scene.add.particles(0, 0, 'particle', {
                        lifespan: 500,
                        speed: { min: 50, max: 100 },
                        scale: { start: 0.5, end: 0 },
                        emitting: true,
                        follow: this.player
                    });
                    
                    // Таймер окончания действия
                    this.scene.time.delayedCall(this.powerups.bounce.duration, () => {
                        this.powerups.bounce.active = false;
                        this.player.jumpStrength = originalJumpStrength;
                        bounceEffect.destroy();
                    });
                }
            },
            
            // Щит (защита от одного падения)
            shield: {
                active: false,
                effect: () => {
                    this.powerups.shield.active = true;
                    
                    // Создаем визуальный эффект щита
                    this.shieldEffect = this.scene.add.circle(
                        this.player.x, 
                        this.player.y, 
                        30, 
                        0x0088ff, 
                        0.4
                    );
                    
                    // Щит следует за игроком
                    this.scene.update = this.scene.update.bind(this.scene);
                    const originalUpdate = this.scene.update;
                    this.scene.update = (time, delta) => {
                        originalUpdate(time, delta);
                        if (this.shieldEffect && this.powerups.shield.active) {
                            this.shieldEffect.x = this.player.x;
                            this.shieldEffect.y = this.player.y;
                        }
                    };
                }
            },
            
            // Временные крылья (3 прыжка в воздухе)
            wings: {
                active: false,
                duration: 15000, // 15 секунд
                jumpsLeft: 0,
                effect: () => {
                    this.powerups.wings.active = true;
                    this.powerups.wings.jumpsLeft = 3;
                    
                    // Визуальный эффект крыльев
                    this.wingsEffect = this.scene.add.sprite(
                        this.player.x, 
                        this.player.y,
                        'wings'
                    );
                    this.wingsEffect.setScale(0.5);
                    this.wingsEffect.setAlpha(0.7);
                    
                    // Крылья следуют за игроком
                    this.scene.update = this.scene.update.bind(this.scene);
                    const originalUpdate = this.scene.update;
                    this.scene.update = (time, delta) => {
                        originalUpdate(time, delta);
                        if (this.wingsEffect && this.powerups.wings.active) {
                            this.wingsEffect.x = this.player.x;
                            this.wingsEffect.y = this.player.y - 10;
                        }
                    };
                    
                    // Таймер окончания действия
                    this.scene.time.delayedCall(this.powerups.wings.duration, () => {
                        this.powerups.wings.active = false;
                        this.powerups.wings.jumpsLeft = 0;
                        if (this.wingsEffect) {
                            this.wingsEffect.destroy();
                        }
                    });
                },
                // Использование дополнительного прыжка
                useWingsJump: () => {
                    if (this.powerups.wings.active && this.powerups.wings.jumpsLeft > 0 && !this.player.body.touching.down) {
                        this.player.setVelocityY(this.player.jumpStrength);
                        this.powerups.wings.jumpsLeft--;
                        
                        // Обновляем отображение оставшихся прыжков
                        this.updateWingsJumpsIndicator();
                        
                        // Визуальный эффект
                        this.createWingsJumpEffect();
                        
                        // Если прыжки закончились
                        if (this.powerups.wings.jumpsLeft <= 0) {
                            this.powerups.wings.active = false;
                            if (this.wingsEffect) {
                                this.wingsEffect.destroy();
                            }
                        }
                        
                        return true;
                    }
                    return false;
                }
            }
        };
        
        // Инициализация
        this.init();
    }
    
    init() {
        // Устанавливаем начальные параметры
        this.player.jumpStrength = this.scene.jumpVelocity;
        this.player.speedMultiplier = 1;
        
        // Активируем пассивные способности
        this.abilities.enhancedJump.effect();
    }
    
    // Обработка нажатия на кнопку прыжка
    handleJump() {
        const onGround = this.player.body.touching.down;
        
        // Стандартный прыжок на земле
        if (onGround) {
            this.player.setVelocityY(this.player.jumpStrength);
            return true;
        }
        
        // Проверяем возможность двойного прыжка
        if (this.abilities.doubleJump.available && !onGround) {
            this.abilities.doubleJump.effect();
            return true;
        }
        
        // Проверяем возможность прыжка с крыльями
        if (this.powerups.wings.active && !onGround) {
            return this.powerups.wings.useWingsJump();
        }
        
        return false;
    }
    
    // Обработка нажатия на кнопку супер-прыжка
    handleSuperJump() {
        if (this.abilities.superJump.available && this.player.body.touching.down) {
            this.abilities.superJump.effect();
        }
    }
    
    // Обработка отпускания кнопки супер-прыжка
    handleSuperJumpRelease(direction) {
        if (this.abilities.superJump.charging) {
            this.abilities.superJump.execute(direction);
        }
    }
    
    // Создание эффекта двойного прыжка
    createJumpEffect() {
        // Создаем круговой след
        const circle = this.scene.add.circle(
            this.player.x,
            this.player.y,
            30,
            0xffffff,
            0.5
        );
        
        // Анимация исчезновения
        this.scene.tweens.add({
            targets: circle,
            alpha: 0,
            scale: 2,
            duration: 300,
            onComplete: () => {
                circle.destroy();
            }
        });
    }
    
    // Создание эффекта супер-прыжка
    createSuperJumpEffect() {
        // Создаем частицы
        const particles = this.scene.add.particles(
            this.player.x,
            this.player.y,
            'particle',
            {
                lifespan: 800,
                speed: { min: 100, max: 300 },
                scale: { start: 1, end: 0 },
                quantity: 20,
                blendMode: 'ADD'
            }
        );
        
        // Удаляем через некоторое время
        this.scene.time.delayedCall(800, () => {
            particles.destroy();
        });
    }
    
    // Показывает эффект зарядки для супер-прыжка
    showChargeEffect() {
        // Создаем эффект свечения вокруг игрока
        this.chargeEffect = this.scene.add.circle(
            this.player.x,
            this.player.y,
            20,
            0xffff00,
            0.5
        );
        
        // Анимация увеличения
        this.scene.tweens.add({
            targets: this.chargeEffect,
            scale: 2,
            duration: 700,
            ease: 'Linear',
            onUpdate: () => {
                this.chargeEffect.x = this.player.x;
                this.chargeEffect.y = this.player.y;
                this.abilities.superJump.chargeLevel = this.chargeEffect.scale;
            },
            onComplete: () => {
                // Автоматически выполняем прыжок после полной зарядки
                this.abilities.superJump.execute();
            }
        });
    }
    
    // Создание эффекта прыжка с крыльями
    createWingsJumpEffect() {
        // Создаем перьевой след
        const feathers = this.scene.add.particles(
            this.player.x,
            this.player.y,
            'particle',
            {
                lifespan: 600,
                speed: { min: 50, max: 100 },
                scale: { start: 0.5, end: 0 },
                quantity: 5,
                blendMode: 'ADD'
            }
        );
        
        // Удаляем через некоторое время
        this.scene.time.delayedCall(600, () => {
            feathers.destroy();
        });
    }
    
    // Обновляет индикатор оставшихся прыжков с крыльями
    updateWingsJumpsIndicator() {
        // Удаляем старые индикаторы
        if (this.wingsJumpsIndicators) {
            this.wingsJumpsIndicators.forEach(indicator => indicator.destroy());
        }
        
        // Создаем новые индикаторы
        this.wingsJumpsIndicators = [];
        for (let i = 0; i < this.powerups.wings.jumpsLeft; i++) {
            const indicator = this.scene.add.sprite(
                this.player.x - 20 + i * 20,
                this.player.y - 30,
                'wings_indicator'
            );
            indicator.setScale(0.3);
            this.wingsJumpsIndicators.push(indicator);
        }
    }
    
    // Активация подбираемого бонуса
    activatePowerup(type) {
        switch (type) {
            case 'speed':
                this.powerups.speed.effect();
                break;
            case 'bounce':
                this.powerups.bounce.effect();
                break;
            case 'shield':
                this.powerups.shield.effect();
                break;
            case 'wings':
                this.powerups.wings.effect();
                break;
        }
    }
    
    // Проверка на использование щита при падении
    checkShield() {
        if (this.powerups.shield.active) {
            this.powerups.shield.active = false;
            if (this.shieldEffect) {
                this.shieldEffect.destroy();
            }
            return true;
        }
        return false;
    }
    
    // Создание индикаторов способностей в интерфейсе
    createAbilityIndicators() {
        // Индикатор двойного прыжка
        this.scene.doubleJumpIndicator = this.scene.add.circle(
            730, 
            550, 
            20, 
            this.abilities.doubleJump.available ? 0x00ff00 : 0x888888
        );
        this.scene.doubleJumpIndicator.setScrollFactor(0);
        
        // Иконка двойного прыжка
        const djIcon = this.scene.add.text(
            730, 
            550, 
            '2J', 
            { 
                fontSize: '16px', 
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        djIcon.setScrollFactor(0);
        
        // Индикатор супер-прыжка
        this.scene.superJumpIndicator = this.scene.add.circle(
            680, 
            550, 
            25, 
            this.abilities.superJump.available ? 0xff8800 : 0x888888
        );
        this.scene.superJumpIndicator.setScrollFactor(0);
        
        // Иконка супер-прыжка
        const sjIcon = this.scene.add.text(
            680, 
            550, 
            'SJ', 
            { 
                fontSize: '16px', 
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        sjIcon.setScrollFactor(0);
    }
    
    // Обновление индикаторов способностей
    updateAbilityIndicators() {
        // Обновляем индикатор двойного прыжка
        if (this.scene.doubleJumpIndicator) {
            this.scene.doubleJumpIndicator.setFillStyle(
                this.abilities.doubleJump.available ? 0x00ff00 : 0x888888
            );
        }
        
        // Обновляем индикатор супер-прыжка
        if (this.scene.superJumpIndicator) {
            this.scene.superJumpIndicator.setFillStyle(
                this.abilities.superJump.available ? 0xff8800 : 0x888888
            );
        }
    }
} 