class CreatureScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CreatureScene' });
        this.creature = null;
        this.currentSkin = 'frank';
        this.useBouncy = true; // true = используем подпрыгивающую анимацию idle, false = используем статичную анимацию still
    }

    preload() {
        // Проверка доступности Spine плагина
        if (!this.spine) {
            console.error("Spine плагин не найден! Проверьте, что плагин правильно подключен в game.js");
            // Добавим сообщение об ошибке на экран
            this.add.text(400, 300, 'ОШИБКА: Spine плагин не найден!', { fontSize: '20px', fill: '#ff0000' }).setOrigin(0.5);
        } else {
            console.log("Spine плагин найден и готов к использованию");
        }
        
        // Загрузка фона, если его нет
        if (!this.textures.exists('sky')) {
            this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
        }
        
        // Добавим проверку на существование файлов
        this.verifyFileExists('./assets/images/CreatureScene/HalloweenCreature.skel');
        this.verifyFileExists('./assets/images/CreatureScene/HalloweenCreature.atlas');
        this.verifyFileExists('./assets/images/CreatureScene/HalloweenCreature.png');
        
        // Загрузка бинарного скелета и атласа
        this.load.spineBinary('halloween-creature', './assets/images/CreatureScene/HalloweenCreature.skel');
        this.load.spineAtlas('halloween-creature-atlas', './assets/images/CreatureScene/HalloweenCreature.atlas');
        
        // Отслеживаем ошибки загрузки
        this.load.on('loaderror', (file) => {
            console.error(`Ошибка загрузки файла: ${file.src}`);
        });
        
        // Отслеживаем успешную загрузку
        this.load.on('filecomplete', (key, type, data) => {
            console.log(`Файл успешно загружен: ${key}, тип: ${type}`);
        });
    }

    // Вспомогательная функция для проверки существования файла
    verifyFileExists(url) {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', url, false);
        try {
            xhr.send();
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log(`Файл существует: ${url}`);
                return true;
            } else {
                console.error(`Файл не существует: ${url}, статус: ${xhr.status}`);
                return false;
            }
        } catch (e) {
            console.error(`Ошибка проверки файла: ${url}`, e);
            return false;
        }
    }

    create() {
        // Фон
        this.add.image(400, 300, 'sky');
        
        // Создание Spine объекта с правильным положением
        this.creature = this.add.spine(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 50, // Центрируем по вертикали с небольшим смещением вниз
            'halloween-creature',
            'halloween-creature-atlas'
        );
        
        // Устанавливаем масштаб существа для размера примерно 50x50
        this.creature.setScale(0.08);
        
        // Включаем отображение отладочной информации
        console.log("Spine объект создан:", this.creature);
        console.log("Позиция:", this.creature.x, this.creature.y);
        console.log("Видимость:", this.creature.visible);
        
        // Проверяем загрузку текстур
        if (this.textures.exists('halloween-creature-atlas')) {
            console.log("Атлас текстур загружен успешно");
        } else {
            console.error("Атлас текстур не загружен!");
        }

        // Вывод всех доступных анимаций в консоль
        console.log("Доступные анимации:");
        if (this.creature && this.creature.skeleton && this.creature.skeleton.data) {
            const animations = this.creature.skeleton.data.animations;
            for (let i = 0; i < animations.length; i++) {
                console.log(`- ${animations[i].name}`);
            }
        }

        // Установка скина по умолчанию (frank, witch, pumpkin, skull)
        this.setSkin(this.currentSkin);
        
        // Запуск анимации Idle по умолчанию
        this.showIdle();

        // Добавление заголовка и инструкций
        this.add.text(400, 30, 'Хэллоуинские Существа', {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        const instructions = [
            'Управление:',
            'A - Атака',
            'H - Получение урона',
            'D - Смерть',
            'I - Ожидание',
            'J - Невидимость',
            'B - Переключение типа Idle',
            '1-4 - Смена персонажа'
        ];
        
        for (let i = 0; i < instructions.length; i++) {
            this.add.text(120, 80 + i * 25, instructions[i], {
                fontSize: '18px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            });
        }
        
        // Кнопка возврата в меню
        const backButton = this.add.text(400, 550, 'Вернуться в меню', {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive();
        
        backButton.on('pointerover', () => backButton.setStyle({ fill: '#ff8800' }));
        backButton.on('pointerout', () => backButton.setStyle({ fill: '#ffffff' }));
        backButton.on('pointerup', () => this.scene.start('StartScene'));

        // Обработка клавиш для тестирования
        this.input.keyboard.on('keydown-A', () => this.showAttack());
        this.input.keyboard.on('keydown-H', () => this.showHurt());
        this.input.keyboard.on('keydown-D', () => this.showDie());
        this.input.keyboard.on('keydown-I', () => this.showIdle());
        this.input.keyboard.on('keydown-J', () => this.showInvisible());
        this.input.keyboard.on('keydown-B', () => this.toggleBouncyIdle());
        
        // Переключение скинов (1-4)
        this.input.keyboard.on('keydown-ONE', () => this.setSkin('frank'));
        this.input.keyboard.on('keydown-TWO', () => this.setSkin('witch'));
        this.input.keyboard.on('keydown-THREE', () => this.setSkin('pumpkin'));
        this.input.keyboard.on('keydown-FOUR', () => this.setSkin('skull'));
    }

    // Переключение между типами Idle (подпрыгивающий и статичный)
    toggleBouncyIdle() {
        this.useBouncy = !this.useBouncy;
        this.showIdle();
    }

    // Методы воспроизведения анимаций
    showAttack() {
        try {
            this.creature.animationState.setAnimation(0, 'attack', false);
            // Возврат к idle после завершения анимации атаки
            this.creature.animationState.addAnimation(0, this.useBouncy ? 'idle' : 'still', true, 0);
        } catch (error) {
            console.error("Ошибка при воспроизведении анимации атаки:", error.message);
        }
    }

    showHurt() {
        try {
            this.creature.animationState.setAnimation(0, 'hurt', false);
            // Возврат к idle после завершения анимации получения урона
            this.creature.animationState.addAnimation(0, this.useBouncy ? 'idle' : 'still', true, 0);
        } catch (error) {
            console.error("Ошибка при воспроизведении анимации урона:", error.message);
        }
    }

    showDie() {
        try {
            this.creature.animationState.setAnimation(0, 'die', false);
        } catch (error) {
            console.error("Ошибка при воспроизведении анимации смерти:", error.message);
        }
    }

    showIdle() {
        try {
            // Используем подпрыгивающую или статичную анимацию в зависимости от флага
            const animation = this.useBouncy ? 'idle' : 'still';
            this.creature.animationState.setAnimation(0, animation, true);
        } catch (error) {
            console.error("Ошибка при воспроизведении анимации ожидания:", error.message);
        }
    }

    showInvisible() {
        try {
            this.creature.animationState.setAnimation(0, 'invisible', false);
            // Возвращаемся к Idle через 2 секунды
            this.time.delayedCall(2000, () => {
                this.showIdle();
            });
        } catch (error) {
            console.error("Ошибка при воспроизведении анимации невидимости:", error.message);
        }
    }

    // Метод для смены скина
    setSkin(skinName) {
        if (this.currentSkin !== skinName) {
            this.currentSkin = skinName;
            this.creature.skeleton.setSkinByName(skinName);
            this.creature.skeleton.setSlotsToSetupPose();
        }
    }
} 