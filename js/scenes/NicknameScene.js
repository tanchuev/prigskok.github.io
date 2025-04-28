class NicknameScene extends Phaser.Scene {
    constructor() {
        super('NicknameScene');
        this.nickname = '';
        this.isEditing = false;
    }
    
    init(data) {
        // Определяем, это редактирование имени или первичная установка
        this.isEditing = this.getCookie('playerNickname') !== null;
    }

    create() {
        // Фон
        this.add.image(400, 300, 'background');
        
        // Получаем размеры экрана
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Определяем масштаб для мобильных устройств
        const isMobile = window.GAME_CONFIG.isMobile;
        const scale = isMobile ? 0.8 : 1;
        const fontSize = isMobile ? '36px' : '48px';
        
        // Заголовок - меняем в зависимости от контекста
        const headerText = this.isEditing ? 'ИЗМЕНИТЬ ИМЯ' : 'КАК ТЕБЯ ЗОВУТ?';
        this.headerText = this.add.text(width / 2, height * 0.25, headerText, {
            fontFamily: 'unutterable',
            fontSize: fontSize,
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScale(scale);
        
        // Проверяем, есть ли сохраненный никнейм
        const savedNickname = this.getCookie('playerNickname');
        if (savedNickname) {
            this.nickname = savedNickname;
        }
        
        // Определяем размеры поля ввода
        const inputWidth = isMobile ? 280 : 300;
        const inputHeight = isMobile ? 50 : 60;
        const inputX = width / 2 - inputWidth / 2;
        const inputY = height * 0.4;
        
        // Поле ввода (визуальное представление)
        this.inputBox = this.add.graphics();
        this.inputBox.fillStyle(0x222222, 0.8);
        this.inputBox.fillRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
        this.inputBox.lineStyle(2, 0xaaaaaa);
        this.inputBox.strokeRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
        
        // Текст внутри поля ввода
        this.inputText = this.add.text(width / 2, inputY + inputHeight / 2, this.nickname, {
            fontFamily: 'unutterable',
            fontSize: isMobile ? '20px' : '24px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Делаем поле интерактивным
        this.inputBox.setInteractive(new Phaser.Geom.Rectangle(inputX, inputY, inputWidth, inputHeight), Phaser.Geom.Rectangle.Contains);
        
        // Обработчик кликов по полю
        this.inputBox.on('pointerdown', () => {
            this.openKeyboard();
        });
        
        // Кнопка "Продолжить" - меняем текст в зависимости от контекста
        const continueText = this.isEditing ? 'СОХРАНИТЬ' : 'ПРОДОЛЖИТЬ';
        const buttonY = height * 0.55;
        this.continueButton = this.add.text(width / 2, buttonY, continueText, {
            fontFamily: 'unutterable',
            fontSize: isMobile ? '24px' : '28px',
            fill: '#ffffff',
            backgroundColor: '#338833',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: 20,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        
        // Эффекты при наведении
        this.continueButton.on('pointerover', () => {
            this.continueButton.setStyle({ fill: '#ffff00', backgroundColor: '#33aa33' });
        });
        
        this.continueButton.on('pointerout', () => {
            this.continueButton.setStyle({ fill: '#ffffff', backgroundColor: '#338833' });
        });
        
        // Действие при нажатии
        this.continueButton.on('pointerdown', () => {
            if (this.nickname.trim().length > 0) {
                this.setCookie('playerNickname', this.nickname, 365); // сохраняем на год
                this.scene.start('StartScene');
            } else {
                // Визуальная подсказка, если имя не введено
                this.inputBox.clear();
                this.inputBox.fillStyle(0x662222, 0.8);
                this.inputBox.fillRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
                this.inputBox.lineStyle(2, 0xff0000);
                this.inputBox.strokeRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
                
                setTimeout(() => {
                    this.inputBox.clear();
                    this.inputBox.fillStyle(0x222222, 0.8);
                    this.inputBox.fillRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
                    this.inputBox.lineStyle(2, 0xaaaaaa);
                    this.inputBox.strokeRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
                }, 300);
            }
        });
        
        // Кнопка "Назад" (только при редактировании)
        if (this.isEditing) {
            const backButtonY = height * 0.65;
            this.backButton = this.add.text(width / 2, backButtonY, 'ОТМЕНА', {
                fontFamily: 'unutterable',
                fontSize: isMobile ? '20px' : '22px',
                fill: '#ffffff',
                backgroundColor: '#666666',
                stroke: '#000000',
                strokeThickness: 3,
                padding: {
                    x: 15,
                    y: 8
                }
            }).setOrigin(0.5).setInteractive();
            
            // Эффекты при наведении
            this.backButton.on('pointerover', () => {
                this.backButton.setStyle({ fill: '#ffff00', backgroundColor: '#888888' });
            });
            
            this.backButton.on('pointerout', () => {
                this.backButton.setStyle({ fill: '#ffffff', backgroundColor: '#666666' });
            });
            
            // Действие при нажатии
            this.backButton.on('pointerdown', () => {
                this.backButton.setStyle({ fill: '#ff8800' });
                this.scene.start('StartScene');
            });
        }
        
        // Слушаем нажатия клавиш
        this.input.keyboard.on('keydown', (event) => {
            if (event.keyCode === 8 && this.nickname.length > 0) {
                // Backspace - удаляем символ
                this.nickname = this.nickname.slice(0, -1);
            } else if (event.keyCode === 13) {
                // Enter - продолжаем, если имя введено
                if (this.nickname.trim().length > 0) {
                    this.setCookie('playerNickname', this.nickname, 365);
                    this.scene.start('StartScene');
                }
            } else if (event.key.length === 1 && this.nickname.length < 15) {
                // Обычные символы - добавляем к имени
                this.nickname += event.key;
            }
            
            this.inputText.setText(this.nickname);
        });
        
        // Обработка изменения размера экрана
        this.scale.on('resize', this.resizeScene, this);
    }
    
    resizeScene() {
        if (!this.headerText || !this.inputText || !this.continueButton) return;
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Обновляем позицию заголовка
        this.headerText.setPosition(width / 2, height * 0.25);
        
        // Обновляем позицию поля ввода
        const isMobile = window.GAME_CONFIG.isMobile;
        const inputWidth = isMobile ? 280 : 300;
        const inputHeight = isMobile ? 50 : 60;
        const inputX = width / 2 - inputWidth / 2;
        const inputY = height * 0.4;
        
        // Перерисовываем поле ввода
        this.inputBox.clear();
        this.inputBox.fillStyle(0x222222, 0.8);
        this.inputBox.fillRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
        this.inputBox.lineStyle(2, 0xaaaaaa);
        this.inputBox.strokeRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
        
        // Обновляем позицию текста ввода
        this.inputText.setPosition(width / 2, inputY + inputHeight / 2);
        
        // Обновляем позицию кнопки продолжения
        this.continueButton.setPosition(width / 2, height * 0.55);
        
        // Обновляем позицию кнопки отмены, если она есть
        if (this.backButton) {
            this.backButton.setPosition(width / 2, height * 0.65);
        }
    }
    
    openKeyboard() {
        // Для мобильных устройств
        if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
            const name = prompt('Введите ваше имя:', this.nickname);
            if (name !== null) {
                this.nickname = name.substring(0, 15); // Ограничение 15 символов
                this.inputText.setText(this.nickname);
            }
        }
    }
    
    setCookie(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
    }
    
    getCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    }
} 