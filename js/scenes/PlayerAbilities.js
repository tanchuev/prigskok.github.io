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
                active: true,
                cooldown: 8000, // 8 секунд
                lastUsed: 0,
                available: true,
                // Позволяет сделать второй прыжок в воздухе
                effect: () => {
                    if (this.abilities.doubleJump.available && !this.player.body.touching.down) {
                        // Округляем значение для прыжка
                        const jumpVelocity = Math.round(this.player.jumpStrength);
                        this.player.body.setVelocityY(jumpVelocity);
                        
                        this.abilities.doubleJump.available = false;
                        this.abilities.doubleJump.lastUsed = Date.now();
                        
                        // Воспроизводим звук двойного прыжка
                        if (this.sounds && this.sounds.doubleJump) {
                            this.sounds.doubleJump.play({ volume: 0.6 });
                        }
                        
                        // Визуальный эффект
                        this.createJumpEffect();
                        
                        // Перезарядка
                        this.scene.time.delayedCall(this.abilities.doubleJump.cooldown, () => {
                            this.abilities.doubleJump.available = true;
                            
                            // Обновляем индикатор на UI
                            if (this.scene.doubleJumpIndicator) {
                                this.scene.doubleJumpIndicator.setFillStyle(0x0066cc);
                            }
                            
                            // Обновляем индикатор прогресса
                            if (this.scene.doubleJumpProgressIndicator) {
                                this.scene.doubleJumpProgressIndicator.visible = false;
                            }
                        });
                    }
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
    
    // Метод для обновления значения jumpStrength при изменении jumpVelocity
    updateJumpStrength() {
        // Обновляем базовое значение
        this.player.jumpStrength = this.scene.jumpVelocity;
        
        // Применяем эффект усиленного прыжка, если он активен
        if (this.abilities.enhancedJump.active) {
            this.abilities.enhancedJump.effect();
        }
    }
    
    // Проверка наличия платформы в пределах указанного расстояния снизу от игрока
    isPlatformNearby(distance = 15) {
        if (!this.player || !this.player.body) return false;
        
        // Создаем временный объект для проверки перекрытия
        const playerBottom = this.player.body.y + this.player.body.height;
        const playerWidth = this.player.body.width;
        const playerX = this.player.body.x;
        
        // Создаем зону проверки под игроком
        const checkZone = {
            x: playerX,
            y: playerBottom,
            width: playerWidth,
            height: distance,
            right: playerX + playerWidth,
            bottom: playerBottom + distance
        };
        
        // Проверяем наличие платформ в зоне проверки
        let platformFound = false;
        
        // Проверяем все группы платформ из GameScene
        this.scene.allPlatforms.forEach(group => {
            group.getChildren().forEach(platform => {
                if (platformFound) return; // Если уже нашли, пропускаем
                
                // Проверка пересечения с платформой
                if (this.checkOverlap(checkZone, platform.body)) {
                    platformFound = true;
                }
            });
        });
        
        return platformFound;
    }
    
    // Проверка пересечения двух прямоугольников
    checkOverlap(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
    
    // Обработка нажатия на кнопку прыжка
    handleJump() {
        // Если игрок на земле, выполняем обычный прыжок
        if (this.player.body.touching.down) {
            // Округляем значение для прыжка
            const jumpVelocity = Math.round(this.player.jumpStrength);
            this.player.body.setVelocityY(jumpVelocity); // jumpStrength уже содержит отрицательное значение
            
            // Визуальный эффект
            this.createJumpEffect();
            
            return true;
        }
        // Проверяем, есть ли платформа в пределах 15 пикселей снизу
        else if (this.isPlatformNearby(15)) {
            // Выполняем обычный прыжок, как будто игрок на земле
            const jumpVelocity = Math.round(this.player.jumpStrength);
            this.player.body.setVelocityY(jumpVelocity);
            
            // Визуальный эффект
            this.createJumpEffect();
            
            return true;
        }
        // Если игрок в воздухе, пробуем использовать двойной прыжок
        else if (this.abilities.doubleJump.active && this.abilities.doubleJump.available) {
            this.abilities.doubleJump.effect();
            return true;
        }
        
        return false;
    }
    
    createJumpEffect() {
        // Создаем эффект пыли при прыжке
        const dustCount = 8;
        
        for (let i = 0; i < dustCount; i++) {
            const x = this.player.x + Phaser.Math.Between(-20, 20);
            const y = this.player.y + 30 + Phaser.Math.Between(-5, 5);
            
            const dust = this.scene.add.circle(x, y, Phaser.Math.Between(2, 4), 0xcccccc, 0.7);
            dust.setDepth(90);
            
            this.scene.tweens.add({
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
    
    createAbilityIndicators() {
        // Индикатор двойного прыжка теперь создается в GameScene в методе createDoubleJumpIcon
    }
    
    updateAbilityIndicators() {
        // Индикатор двойного прыжка теперь обновляется в GameScene в методе updateDoubleJumpIcon
    }
} 