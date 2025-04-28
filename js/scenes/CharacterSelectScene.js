class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super('CharacterSelectScene');
        this.selectedCharacter = 'pumpkin'; // Персонаж по умолчанию
    }

    create() {
        // Получаем размеры экрана
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Определяем масштаб для мобильных устройств
        const isMobile = window.GAME_CONFIG.isMobile;
        const titleFontSize = isMobile ? '28px' : '36px';
        const namesFontSize = isMobile ? '14px' : '18px';
        const btnFontSize = isMobile ? '26px' : '32px';
        const backBtnFontSize = isMobile ? '16px' : '20px';
        
        // Фон
        const bg = this.add.image(width / 2, height / 2, 'background');
        const scaleX = width / bg.width;
        bg.setScale(scaleX, scaleX); // Сохраняем пропорции при масштабировании
        // Центрируем по вертикали если изображение слишком большое
        if (bg.height * scaleX > height) {
            bg.y = height / 2;
        }
        
        // Заголовок
        this.title = this.add.text(width / 2, height * 0.25, 'ВЫБЕРИТЕ ПЕРСОНАЖА', {
            fontFamily: 'unutterable',
            fontSize: titleFontSize,
            fill: '#ffffff',
            fontStyle: 'bold', 
            stroke: '#000000',
            strokeThickness: 4
        });
        this.title.setOrigin(0.5);
        
        // Рассчитываем позиции персонажей в зависимости от ширины экрана
        const charactersY = height * 0.55; // Примерно посередине между заголовком и кнопкой "Играть"
        const characterSpacing = width * 0.2; // Расстояние между персонажами (20% ширины экрана)
        const startX = width / 2 - characterSpacing * 1.5; // Начало расположения (для 4 персонажей)
        
        // Контейнеры для персонажей
        const characters = [
            { name: 'pumpkin', displayName: 'Тыква', x: startX, y: charactersY },
            { name: 'frank', displayName: 'Франкенштейн', x: startX + characterSpacing, y: charactersY },
            { name: 'witch', displayName: 'Ведьма', x: startX + characterSpacing * 2, y: charactersY },
            { name: 'skull', displayName: 'Череп', x: startX + characterSpacing * 3, y: charactersY }
        ];
        
        // Определяем размер кругов для персонажей
        const circleRadius = Math.min(width * 0.075, 60); // Не более 60px и не более 7.5% ширины экрана
        
        // Создаем контейнеры и персонажей
        this.characterContainers = [];
        
        characters.forEach(char => {
            // Создаем контейнер для персонажа
            const container = this.add.container(char.x, char.y);
            
            // Фон для персонажа
            const bg = this.add.circle(0, 0, circleRadius, 0x000000, 0.3);
            container.add(bg);
            
            // Масштаб персонажа
            const characterScale = isMobile ? 0.055 : 0.06;
            
            // Добавляем спрайт персонажа (Spine) со смещением по Y для центрирования
            const character = this.add.spine(0, 20, 'halloween-creature', 'halloween-creature-atlas'); // Сдвигаем немного вниз
            character.setScale(characterScale);
            character.skeleton.setSkinByName(char.name);
            character.skeleton.setSlotsToSetupPose();
            character.animationState.setAnimation(0, 'idle', true);
            container.add(character);
            
            // Добавляем текст с именем персонажа
            const nameText = this.add.text(0, circleRadius + 10, char.displayName, {
                fontFamily: 'unutterable',
                fontSize: namesFontSize,
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            });
            nameText.setOrigin(0.5);
            container.add(nameText);
            
            // Делаем КОНТЕЙНЕР интерактивным (вместо bg)
            container.setInteractive(new Phaser.Geom.Circle(0, 0, circleRadius), Phaser.Geom.Circle.Contains);
            
            // Эффекты при наведении (слушатель на КОНТЕЙНЕРЕ)
            container.on('pointerover', () => {
                bg.fillColor = 0x666666; // Меняем цвет bg
                bg.fillAlpha = 0.5;
                character.animationState.timeScale = 1.5;
            });
            
            container.on('pointerout', () => {
                if (this.selectedCharacter !== char.name) {
                    bg.fillColor = 0x000000; // Меняем цвет bg
                    bg.fillAlpha = 0.3;
                }
                character.animationState.timeScale = 1;
            });
            
            // Выбор персонажа при клике (слушатель на КОНТЕЙНЕРЕ)
            container.on('pointerdown', () => {
                this.selectCharacter(char.name);
            });
            
            // Сохраняем ссылки на элементы интерфейса
            this.characterContainers.push({
                name: char.name,
                container,
                bg,
                character
            });
        });
        
        // Выделяем персонажа по умолчанию
        this.selectCharacter(this.selectedCharacter);
        
        // Кнопка "Играть"
        this.playButton = this.add.text(width / 2, height * 0.85, 'ИГРАТЬ', {
            fontFamily: 'unutterable',
            fontSize: btnFontSize,
            fill: '#ffffff',
            backgroundColor: '#338833',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: 20,
                y: 10
            }
        });
        this.playButton.setOrigin(0.5);
        this.playButton.setInteractive();
        
        // Анимация кнопки при наведении
        this.playButton.on('pointerover', () => {
            this.playButton.setStyle({ fill: '#ffff00', backgroundColor: '#33aa33' });
        });
        this.playButton.on('pointerout', () => {
            this.playButton.setStyle({ fill: '#ffffff', backgroundColor: '#338833' });
        });
        
        // Запуск игры при нажатии
        this.playButton.on('pointerdown', () => {
            this.playButton.setStyle({ fill: '#ff8800' });
        });
        this.playButton.on('pointerup', () => {
            this.scene.start('GameScene', { selectedCharacter: this.selectedCharacter });
        });
        
        // Кнопка "Назад"
        this.backButton = this.add.text(width * 0.1, height * 0.07, '← НАЗАД', {
            fontFamily: 'unutterable',
            fontSize: backBtnFontSize,
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            padding: {
                x: 10,
                y: 5
            }
        });
        this.backButton.setInteractive();
        
        // Анимация кнопки при наведении
        this.backButton.on('pointerover', () => {
            this.backButton.setStyle({ fill: '#ffff00' });
        });
        this.backButton.on('pointerout', () => {
            this.backButton.setStyle({ fill: '#ffffff' });
        });
        
        // Возврат в меню при нажатии
        this.backButton.on('pointerdown', () => {
            this.backButton.setStyle({ fill: '#ff8800' });
        });
        this.backButton.on('pointerup', () => {
            this.scene.start('StartScene');
        });
        
        // Обработка изменения размера экрана
        this.scale.on('resize', this.resizeScene, this);
    }
    
    resizeScene() {
        if (!this.title || !this.playButton || !this.backButton) return;
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Обновляем фон
        const bg = this.children.list.find(child => child.type === 'Image' && child.texture.key === 'background');
        if (bg) {
            bg.x = width / 2;
            bg.y = height / 2;
            const scaleX = width / bg.width;
            bg.setScale(scaleX, scaleX);
            if (bg.height * scaleX > height) {
                bg.y = height / 2;
            }
        }
        
        // Обновляем заголовок
        this.title.setPosition(width / 2, height * 0.25);
        
        // Обновляем кнопки
        this.playButton.setPosition(width / 2, height * 0.85);
        this.backButton.setPosition(width * 0.1, height * 0.07);
        
        // Обновляем позиции персонажей
        this.updateCharacterPositions();
    }
    
    updateCharacterPositions() {
        if (!this.characterContainers || this.characterContainers.length === 0) return;
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const charactersY = height * 0.55;
        const characterSpacing = width * 0.2;
        const startX = width / 2 - characterSpacing * 1.5;
        
        // Определяем размер кругов для персонажей
        const circleRadius = Math.min(width * 0.075, 60);
        
        for (let i = 0; i < this.characterContainers.length; i++) {
            const containerInfo = this.characterContainers[i];
            const x = startX + characterSpacing * i;
            
            // Обновляем позицию контейнера
            containerInfo.container.x = x;
            containerInfo.container.y = charactersY;
            
            // Обновляем размер круга
            containerInfo.bg.radius = circleRadius;
            
            // Найдем текст с именем персонажа и обновим его позицию
            const nameText = containerInfo.container.list.find(item => item.type === 'Text');
            if (nameText) {
                nameText.y = circleRadius + 10;
            }
        }
    }
    
    selectCharacter(characterName) {
        // Обновляем выбранного персонажа
        this.selectedCharacter = characterName;
        
        // Обновляем визуальное отображение выбранного персонажа
        this.characterContainers.forEach(item => {
            if (item.name === characterName) {
                item.bg.fillColor = 0x3366ff;
                item.bg.fillAlpha = 0.6;
            } else {
                item.bg.fillColor = 0x000000;
                item.bg.fillAlpha = 0.3;
            }
        });
    }
} 