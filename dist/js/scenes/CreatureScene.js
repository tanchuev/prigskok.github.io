class CreatureScene extends Phaser.Scene {
    constructor() {
        super('CreatureScene');
        this.creatures = []; // массив для хранения всех созданных существ
    }

    preload() {
        // Загружаем файлы Spine анимации
        this.load.setPath('assets/images/CreatureScene/');
        this.load.spineBinary('halloweenCreature-data', 'HalloweenCreature.skel');
        this.load.spineAtlas('halloweenCreature-atlas', 'HalloweenCreature.atlas');
        
        // Загружаем фон для сцены
        this.load.image('creatureBackground', 'https://labs.phaser.io/assets/skies/space3.png');
    }

    create() {
        // Добавляем фон
        this.add.image(400, 300, 'creatureBackground');
        
        // Отображаем информацию о сцене
        this.add.text(20, 20, 'Персонажи из Spine анимации', { 
            fontSize: '24px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        
        // Добавляем инструкции по управлению
        this.add.text(20, 60, 'Управление:\nA - Атака\nH - Получение урона\nD - Смерть\nI - Ожидание\nJ - Невидимость\n\n1-4 - Выбор персонажа', {
            fontSize: '16px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 2
        });
        
        // Создаем персонажей - по одному с каждым скином
        this.createCreatures();
        
        // Добавляем кнопку возврата в стартовую сцену
        this.addBackButton();
    }
    
    createCreatures() {
        // Создаем четыре персонажа с разными скинами
        const skins = ['frank', 'witch', 'pumpkin', 'skull'];
        const positions = [
            { x: 200, y: 450 },
            { x: 400, y: 450 },
            { x: 600, y: 450 },
            { x: 200, y: 250 }
        ];
        
        // Создаем каждого персонажа и устанавливаем ему соответствующий скин
        for (let i = 0; i < skins.length; i++) {
            const creature = new HalloweenCreatureController(this, positions[i].x, positions[i].y);
            creature.SetSkin(skins[i]);
            
            // Добавляем текст с названием персонажа
            this.add.text(positions[i].x, positions[i].y + 100, skins[i], {
                fontSize: '18px',
                fill: '#fff',
                align: 'center'
            }).setOrigin(0.5);
            
            // Отключаем тестовые клавиши для всех, кроме первого персонажа
            if (i > 0) {
                creature.setTestingKeysEnabled(false);
            }
            
            this.creatures.push(creature);
        }
        
        // Добавляем переключатель для активного персонажа
        this.activeCreatureIndex = 0;
        this.input.keyboard.on('keydown', (event) => {
            // Переключение между персонажами с помощью цифр 1-4
            if (event.key >= '1' && event.key <= '4') {
                const index = parseInt(event.key) - 1;
                if (index !== this.activeCreatureIndex && index < this.creatures.length) {
                    // Отключаем тестовые клавиши у предыдущего активного персонажа
                    this.creatures[this.activeCreatureIndex].setTestingKeysEnabled(false);
                    
                    // Устанавливаем новый активный персонаж
                    this.activeCreatureIndex = index;
                    this.creatures[this.activeCreatureIndex].setTestingKeysEnabled(true);
                    
                    // Обновляем индикатор активного персонажа
                    this.updateActiveIndicator();
                }
            }
        });
        
        // Создаем индикатор активного персонажа
        this.activeIndicator = this.add.text(positions[0].x, positions[0].y - 80, '☞ АКТИВНЫЙ', {
            fontSize: '16px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    updateActiveIndicator() {
        // Перемещаем индикатор к активному персонажу
        if (this.activeIndicator && this.creatures[this.activeCreatureIndex]) {
            const position = {
                x: this.creatures[this.activeCreatureIndex].x,
                y: this.creatures[this.activeCreatureIndex].y - 80
            };
            this.activeIndicator.setPosition(position.x, position.y);
        }
    }
    
    addBackButton() {
        // Добавляем кнопку возврата на стартовую сцену
        const backButton = this.add.text(650, 550, 'Назад', {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: '#333',
            padding: { x: 10, y: 5 }
        }).setInteractive({ useHandCursor: true });
        
        // Добавляем эффекты при наведении
        backButton.on('pointerover', () => {
            backButton.setStyle({ fill: '#ff0' });
        });
        
        backButton.on('pointerout', () => {
            backButton.setStyle({ fill: '#fff' });
        });
        
        // Обработка клика
        backButton.on('pointerdown', () => {
            // Очищаем всех персонажей
            this.creatures.forEach(creature => creature.destroy());
            this.creatures = [];
            
            // Переходим на стартовую сцену
            this.scene.start('StartScene');
        });
    }
} 