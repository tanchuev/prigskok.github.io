class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super('CharacterSelectScene');
        this.selectedCharacter = 'pumpkin'; // Персонаж по умолчанию
    }

    create() {
        // Фон
        this.add.image(400, 300, 'background');
        
        // Заголовок
        const title = this.add.text(400, 100, 'ВЫБЕРИТЕ ПЕРСОНАЖА', {
            fontFamily: 'unutterable',
            fontSize: '36px',
            fill: '#ffffff',
            fontStyle: 'bold', 
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        
        // Контейнеры для персонажей
        const characters = [
            { name: 'frank', displayName: 'Франкенштейн', x: 200, y: 250 },
            { name: 'witch', displayName: 'Ведьма', x: 400, y: 250 },
            { name: 'pumpkin', displayName: 'Тыква', x: 600, y: 250 },
            { name: 'skull', displayName: 'Череп', x: 400, y: 400 }
        ];
        
        // Создаем контейнеры и персонажей
        this.characterContainers = [];
        
        characters.forEach(char => {
            // Создаем контейнер для персонажа
            const container = this.add.container(char.x, char.y);
            
            // Фон для персонажа
            const bg = this.add.circle(0, 0, 60, 0x000000, 0.3);
            container.add(bg);
            
            // Добавляем спрайт персонажа (Spine) со смещением по Y для центрирования
            const character = this.add.spine(0, 20, 'halloween-creature', 'halloween-creature-atlas'); // Сдвигаем немного вниз
            character.setScale(0.06);
            character.skeleton.setSkinByName(char.name);
            character.skeleton.setSlotsToSetupPose();
            character.animationState.setAnimation(0, 'idle', true);
            container.add(character);
            
            // Добавляем текст с именем персонажа
            const nameText = this.add.text(0, 70, char.displayName, {
                fontFamily: 'unutterable',
                fontSize: '18px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            });
            nameText.setOrigin(0.5);
            container.add(nameText);
            
            // Делаем КОНТЕЙНЕР интерактивным (вместо bg)
            container.setInteractive(new Phaser.Geom.Circle(0, 0, 60), Phaser.Geom.Circle.Contains);
            
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
        const playButton = this.add.text(400, 520, 'ИГРАТЬ', {
            fontFamily: 'unutterable',
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#338833',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: 20,
                y: 10
            }
        });
        playButton.setOrigin(0.5);
        playButton.setInteractive();
        
        // Анимация кнопки при наведении
        playButton.on('pointerover', () => {
            playButton.setStyle({ fill: '#ffff00', backgroundColor: '#33aa33' });
        });
        playButton.on('pointerout', () => {
            playButton.setStyle({ fill: '#ffffff', backgroundColor: '#338833' });
        });
        
        // Запуск игры при нажатии
        playButton.on('pointerdown', () => {
            playButton.setStyle({ fill: '#ff8800' });
        });
        playButton.on('pointerup', () => {
            this.scene.start('GameScene', { selectedCharacter: this.selectedCharacter });
        });
        
        // Кнопка "Назад"
        const backButton = this.add.text(100, 40, '← НАЗАД', {
            fontFamily: 'unutterable',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            padding: {
                x: 10,
                y: 5
            }
        });
        backButton.setInteractive();
        
        // Анимация кнопки при наведении
        backButton.on('pointerover', () => {
            backButton.setStyle({ fill: '#ffff00' });
        });
        backButton.on('pointerout', () => {
            backButton.setStyle({ fill: '#ffffff' });
        });
        
        // Возврат в меню при нажатии
        backButton.on('pointerdown', () => {
            backButton.setStyle({ fill: '#ff8800' });
        });
        backButton.on('pointerup', () => {
            this.scene.start('StartScene');
        });
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