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
        // Определяем, является ли устройство мобильным
        this.isMobile = !this.sys.game.device.os.desktop;
        
        // Фон
        this.bgImage = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        this.bgImage.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Получаем размеры экрана
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Определяем размеры для разных устройств
        const scale = this.isMobile ? 0.8 : 1;
        const fontSize = this.isMobile ? '36px' : '48px';
        
        // Добавляем кнопку полноэкранного режима
        this.setupFullscreenButton();
        
        // Заголовок - меняем в зависимости от контекста
        const headerText = this.isEditing ? 'ИЗМЕНИТЬ ИМЯ' : 'КАК ТЕБЯ ЗОВУТ?';
        this.headerText = this.add.text(width / 2, this.isMobile ? height * 0.2 : height * 0.25, headerText, {
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
        const inputWidth = this.isMobile ? Math.min(width * 0.7, 280) : 300;
        const inputHeight = this.isMobile ? 50 : 60;
        const inputX = width / 2 - inputWidth / 2;
        const inputY = this.isMobile ? height * 0.35 : height * 0.4;
        
        // Создаем интерактивную зону вокруг поля ввода для более удобного нажатия на мобильных устройствах
        const hitAreaPadding = 20;
        
        // Поле ввода (визуальное представление)
        this.inputBox = this.add.graphics();
        this.inputBox.fillStyle(0x222222, 0.8);
        this.inputBox.fillRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
        this.inputBox.lineStyle(2, 0xaaaaaa);
        this.inputBox.strokeRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
        
        // Создаем увеличенную зону нажатия для поля ввода
        const inputZone = this.add.zone(
            inputX - hitAreaPadding, 
            inputY - hitAreaPadding, 
            inputWidth + hitAreaPadding * 2, 
            inputHeight + hitAreaPadding * 2
        );
        inputZone.setOrigin(0, 0);
        inputZone.setInteractive();
        
        // Текст внутри поля ввода
        this.inputText = this.add.text(width / 2, inputY + inputHeight / 2, this.nickname, {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '20px' : '24px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Текст с подсказкой, если поле пустое
        this.placeholderText = this.add.text(width / 2, inputY + inputHeight / 2, 'нажмите чтобы ввести имя', {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '16px' : '18px',
            fill: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        this.placeholderText.setVisible(this.nickname === '');
        
        // Обработчик кликов по полю
        inputZone.on('pointerdown', () => {
            this.openKeyboard();
        });
        
        // Кнопка "Продолжить" - меняем текст в зависимости от контекста
        const continueText = this.isEditing ? 'СОХРАНИТЬ' : 'ПРОДОЛЖИТЬ';
        const buttonY = this.isMobile ? height * 0.5 : height * 0.55;
        const buttonPadding = this.isMobile ? 
              { x: 15, y: 8 } : 
              { x: 20, y: 10 };
              
        this.continueButton = this.add.text(width / 2, buttonY, continueText, {
            fontFamily: 'unutterable',
            fontSize: this.isMobile ? '24px' : '28px',
            fill: '#ffffff',
            backgroundColor: '#338833',
            stroke: '#000000',
            strokeThickness: 4,
            padding: buttonPadding
        }).setOrigin(0.5).setInteractive();
        
        // Создаем увеличенную зону нажатия для кнопки на мобильных устройствах
        if (this.isMobile) {
            this.continueButton.hitArea = new Phaser.Geom.Rectangle(
                -this.continueButton.width/2 - hitAreaPadding, 
                -this.continueButton.height/2 - hitAreaPadding, 
                this.continueButton.width + hitAreaPadding*2, 
                this.continueButton.height + hitAreaPadding*2
            );
        }
        
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
                // Добавляем тактильную обратную связь на мобильных устройствах
                if (this.isMobile && window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(50);
                }
                
                this.setCookie('playerNickname', this.nickname, 365); // сохраняем на год
                this.scene.start('StartScene');
            } else {
                // Визуальная подсказка, если имя не введено
                this.inputBox.clear();
                this.inputBox.fillStyle(0x662222, 0.8);
                this.inputBox.fillRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
                this.inputBox.lineStyle(2, 0xff0000);
                this.inputBox.strokeRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
                
                // Показываем сообщение с ошибкой
                this.showError('Введите имя!');
                
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
            const backButtonY = this.isMobile ? height * 0.6 : height * 0.65;
            this.backButton = this.add.text(width / 2, backButtonY, 'ОТМЕНА', {
                fontFamily: 'unutterable',
                fontSize: this.isMobile ? '20px' : '22px',
                fill: '#ffffff',
                backgroundColor: '#666666',
                stroke: '#000000',
                strokeThickness: 3,
                padding: {
                    x: 15,
                    y: 8
                }
            }).setOrigin(0.5).setInteractive();
            
            // Увеличенная зона нажатия для кнопки отмены
            if (this.isMobile) {
                this.backButton.hitArea = new Phaser.Geom.Rectangle(
                    -this.backButton.width/2 - hitAreaPadding, 
                    -this.backButton.height/2 - hitAreaPadding, 
                    this.backButton.width + hitAreaPadding*2, 
                    this.backButton.height + hitAreaPadding*2
                );
            }
            
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
        
        // Слушаем нажатия клавиш для десктопа
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
            
            this.updateInputText();
        });
        
        // Обработка изменения размера экрана
        this.scale.on('resize', this.resizeScene, this);
    }
    
    setupFullscreenButton() {
        // Только если поддерживается полноэкранный режим
        if (this.scale.fullscreen.available) {
            const fsBtnX = this.cameras.main.width - 20;
            const fsBtnY = 20;
            
            // Кнопка переключения полноэкранного режима
            this.fullscreenButton = this.add.image(fsBtnX, fsBtnY, 'fullscreen-button')
                .setOrigin(1, 0)
                .setScale(0.5)
                .setAlpha(0.7)
                .setScrollFactor(0)
                .setDepth(1000)
                .setInteractive();
                
            // Обработка нажатия на кнопку
            this.fullscreenButton.on('pointerup', () => {
                window.GAME_CONFIG.toggleFullscreen(this.game);
            });
        }
    }
    
    showError(message) {
        if (this.errorText) {
            this.errorText.destroy();
        }
        
        this.errorText = this.add.text(
            this.cameras.main.width / 2, 
            this.isMobile ? 
                this.cameras.main.height * 0.42 : 
                this.cameras.main.height * 0.47, 
            message, 
            {
                fontFamily: 'unutterable',
                fontSize: this.isMobile ? '18px' : '20px',
                fill: '#ff5555',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        // Анимируем текст ошибки
        this.tweens.add({
            targets: this.errorText,
            alpha: { from: 1, to: 0 },
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                if (this.errorText) {
                    this.errorText.destroy();
                    this.errorText = null;
                }
            }
        });
    }
    
    updateInputText() {
        this.inputText.setText(this.nickname);
        this.placeholderText.setVisible(this.nickname === '');
    }
    
    resizeScene() {
        if (!this.headerText || !this.inputText) return;
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Обновляем фон
        if (this.bgImage) {
            this.bgImage.setPosition(width / 2, height / 2);
            this.bgImage.setDisplaySize(width, height);
        }
        
        // Обновляем позицию кнопки переключения полноэкранного режима
        if (this.fullscreenButton) {
            this.fullscreenButton.setPosition(width - 20, 20);
        }
        
        // Обновляем позицию заголовка
        this.headerText.setPosition(width / 2, this.isMobile ? height * 0.2 : height * 0.25);
        
        // Обновляем позицию поля ввода
        const inputWidth = this.isMobile ? Math.min(width * 0.7, 280) : 300;
        const inputHeight = this.isMobile ? 50 : 60;
        const inputX = width / 2 - inputWidth / 2;
        const inputY = this.isMobile ? height * 0.35 : height * 0.4;
        
        // Перерисовываем поле ввода
        this.inputBox.clear();
        this.inputBox.fillStyle(0x222222, 0.8);
        this.inputBox.fillRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
        this.inputBox.lineStyle(2, 0xaaaaaa);
        this.inputBox.strokeRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
        
        // Обновляем позицию текста ввода
        this.inputText.setPosition(width / 2, inputY + inputHeight / 2);
        
        // Обновляем позицию плейсхолдера
        this.placeholderText.setPosition(width / 2, inputY + inputHeight / 2);
        
        // Обновляем позицию кнопки продолжения
        const buttonY = this.isMobile ? height * 0.5 : height * 0.55;
        this.continueButton.setPosition(width / 2, buttonY);
        
        // Обновляем позицию кнопки отмены, если она есть
        if (this.backButton) {
            const backButtonY = this.isMobile ? height * 0.6 : height * 0.65;
            this.backButton.setPosition(width / 2, backButtonY);
        }
        
        // Обновляем позицию текста ошибки, если он есть
        if (this.errorText) {
            this.errorText.setPosition(
                width / 2, 
                this.isMobile ? height * 0.42 : height * 0.47
            );
        }
    }
    
    openKeyboard() {
        // Для мобильных устройств показываем системную клавиатуру
        if (this.isMobile) {
            const maxLength = 15;
            const name = prompt('Введите ваше имя (макс. ' + maxLength + ' символов):', this.nickname);
            if (name !== null) {
                this.nickname = name.substring(0, maxLength);
                this.updateInputText();
            }
        } else {
            // На десктопе просто активируем фокус на игровом холсте для ввода с клавиатуры
            this.game.canvas.focus();
            
            // Визуальный индикатор активного режима ввода
            this.inputBox.clear();
            this.inputBox.fillStyle(0x333355, 0.8);
            
            const inputWidth = this.isMobile ? Math.min(this.cameras.main.width * 0.7, 280) : 300;
            const inputHeight = this.isMobile ? 50 : 60;
            const inputX = this.cameras.main.width / 2 - inputWidth / 2;
            const inputY = this.isMobile ? this.cameras.main.height * 0.35 : this.cameras.main.height * 0.4;
            
            this.inputBox.fillRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
            this.inputBox.lineStyle(2, 0x88aaff);
            this.inputBox.strokeRoundedRect(inputX, inputY, inputWidth, inputHeight, 10);
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