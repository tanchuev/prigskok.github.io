class HalloweenCreatureController {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.creature = null;
        this.currentSkin = 'frank'; // скин по умолчанию
        this.bouncyIdle = true; // активен ли bouncy idle
        this.testingKeysEnabled = true; // активны ли тестовые клавиши
        
        this.initialize();
    }
    
    initialize() {
        // Создаем существо из Spine анимации используя spine-phaser
        this.creature = this.scene.add.spine(this.x, this.y, 'halloweenCreature-data', 'halloweenCreature-atlas');
        
        // Проверяем наличие анимаций и скинов
        if (!this.creature) {
            console.error('Не удалось создать Spine объект');
            return;
        }
        
        // Устанавливаем начальную анимацию
        this.creature.animationState.setAnimation(0, 'idle', true);
        
        // Устанавливаем начальный скин
        this.SetSkin(this.currentSkin);
        
        // Настраиваем обработчики клавиш, если включены
        if (this.testingKeysEnabled) {
            this.setupKeyboardEvents();
        }
    }
    
    setupKeyboardEvents() {
        // Создаем обработчики для тестовых клавиш
        this.scene.input.keyboard.on('keydown-A', () => this.ShowAttack());
        this.scene.input.keyboard.on('keydown-H', () => this.ShowHurt());
        this.scene.input.keyboard.on('keydown-D', () => this.ShowDie());
        this.scene.input.keyboard.on('keydown-I', () => this.ShowIdle());
        this.scene.input.keyboard.on('keydown-J', () => this.ShowInvisible());
        
        // Добавляем клавиши для переключения скинов
        this.scene.input.keyboard.on('keydown-ONE', () => this.SetSkin('frank'));
        this.scene.input.keyboard.on('keydown-TWO', () => this.SetSkin('witch'));
        this.scene.input.keyboard.on('keydown-THREE', () => this.SetSkin('pumpkin'));
        this.scene.input.keyboard.on('keydown-FOUR', () => this.SetSkin('skull'));
    }
    
    // Включение/выключение тестовых клавиш
    setTestingKeysEnabled(enabled) {
        this.testingKeysEnabled = enabled;
        if (enabled) {
            this.setupKeyboardEvents();
        } else {
            // Удаляем обработчики, если отключены
            this.scene.input.keyboard.off('keydown-A');
            this.scene.input.keyboard.off('keydown-H');
            this.scene.input.keyboard.off('keydown-D');
            this.scene.input.keyboard.off('keydown-I');
            this.scene.input.keyboard.off('keydown-J');
            
            this.scene.input.keyboard.off('keydown-ONE');
            this.scene.input.keyboard.off('keydown-TWO');
            this.scene.input.keyboard.off('keydown-THREE');
            this.scene.input.keyboard.off('keydown-FOUR');
        }
    }
    
    // Включение/выключение bouncy idle анимации
    setBouncyIdle(enabled) {
        this.bouncyIdle = enabled;
        if (this.creature) {
            this.ShowIdle(); // Обновляем idle анимацию
        }
    }
    
    // Методы для анимаций
    ShowAttack() {
        if (!this.creature) return;
        
        const trackEntry = this.creature.animationState.setAnimation(0, 'attack', false);
        
        // Автоматически вернуться в idle после окончания анимации
        trackEntry.listener = {
            complete: () => {
                this.ShowIdle();
            }
        };
    }
    
    ShowHurt() {
        if (!this.creature) return;
        
        const trackEntry = this.creature.animationState.setAnimation(0, 'hurt', false);
        
        // Автоматически вернуться в idle после окончания анимации
        trackEntry.listener = {
            complete: () => {
                this.ShowIdle();
            }
        };
    }
    
    ShowDie() {
        if (!this.creature) return;
        
        this.creature.animationState.setAnimation(0, 'die', false);
    }
    
    ShowIdle() {
        if (!this.creature) return;
        
        // Проверяем, какой тип idle использовать
        if (this.bouncyIdle) {
            this.creature.animationState.setAnimation(0, 'idle', true); // Зацикленная bouncy idle анимация
        } else {
            this.creature.animationState.setAnimation(0, 'idle_minimal', true); // Зацикленная минимальная idle анимация
        }
    }
    
    ShowInvisible() {
        if (!this.creature) return;
        
        this.creature.setVisible(false);
    }
    
    // Установка скина персонажа
    SetSkin(skinName) {
        if (!this.creature) return;
        
        // Проверяем, существует ли такой скин
        if (['frank', 'witch', 'pumpkin', 'skull'].includes(skinName)) {
            this.currentSkin = skinName;
            
            // Находим скин в данных скелета
            const skeleton = this.creature.skeleton;
            const skeletonData = skeleton.data;
            const skin = skeletonData.findSkin(skinName);
            
            if (skin) {
                skeleton.setSkin(skin);
                skeleton.setSlotsToSetupPose();
                this.creature.setVisible(true); // На случай, если был невидимым
                
                // Возвращаем в idle состояние
                this.ShowIdle();
                
                return true;
            } else {
                console.error(`Скин "${skinName}" не найден в данных скелета`);
                return false;
            }
        } else {
            console.error(`Скин "${skinName}" не существует`);
            return false;
        }
    }
    
    // Получение текущего скина
    getCurrentSkin() {
        return this.currentSkin;
    }
    
    // Удаление объекта и всех его обработчиков
    destroy() {
        if (this.testingKeysEnabled) {
            this.setTestingKeysEnabled(false);
        }
        
        if (this.creature) {
            this.creature.destroy();
            this.creature = null;
        }
    }
} 