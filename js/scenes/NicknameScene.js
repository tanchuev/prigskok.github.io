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
        this.add.image(400, 640, 'background');
        
        // Заголовок - меняем в зависимости от контекста
        const headerText = this.isEditing ? 'ИЗМЕНИТЬ ИМЯ' : 'КАК ТЕБЯ ЗОВУТ?';
        this.add.text(400, 400, headerText, {
            fontFamily: 'unutterable',
            fontSize: '48px',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Проверяем, есть ли сохраненный никнейм
        const savedNickname = this.getCookie('playerNickname');
        if (savedNickname) {
            this.nickname = savedNickname;
        }
        
        // Поле ввода (визуальное представление)
        const inputBox = this.add.graphics();
        inputBox.fillStyle(0x222222, 0.8);
        inputBox.fillRoundedRect(250, 500, 300, 60, 10);
        inputBox.lineStyle(2, 0xaaaaaa);
        inputBox.strokeRoundedRect(250, 500, 300, 60, 10);
        
        // Текст внутри поля ввода
        this.inputText = this.add.text(400, 530, this.nickname, {
            fontFamily: 'unutterable',
            fontSize: '24px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Делаем поле интерактивным
        inputBox.setInteractive(new Phaser.Geom.Rectangle(250, 500, 300, 60), Phaser.Geom.Rectangle.Contains);
        
        // Обработчик кликов по полю
        inputBox.on('pointerdown', () => {
            this.openKeyboard();
        });
        
        // Кнопка "Продолжить" - меняем текст в зависимости от контекста
        const continueText = this.isEditing ? 'СОХРАНИТЬ' : 'ПРОДОЛЖИТЬ';
        const continueButton = this.add.text(400, 600, continueText, {
            fontFamily: 'unutterable',
            fontSize: '28px',
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
        continueButton.on('pointerover', () => {
            continueButton.setStyle({ fill: '#ffff00', backgroundColor: '#33aa33' });
        });
        
        continueButton.on('pointerout', () => {
            continueButton.setStyle({ fill: '#ffffff', backgroundColor: '#338833' });
        });
        
        // Действие при нажатии
        continueButton.on('pointerdown', () => {
            if (this.nickname.trim().length > 0) {
                this.setCookie('playerNickname', this.nickname, 365); // сохраняем на год
                this.scene.start('StartScene');
            } else {
                // Визуальная подсказка, если имя не введено
                inputBox.clear();
                inputBox.fillStyle(0x662222, 0.8);
                inputBox.fillRoundedRect(250, 500, 300, 60, 10);
                inputBox.lineStyle(2, 0xff0000);
                inputBox.strokeRoundedRect(250, 500, 300, 60, 10);
                
                setTimeout(() => {
                    inputBox.clear();
                    inputBox.fillStyle(0x222222, 0.8);
                    inputBox.fillRoundedRect(250, 500, 300, 60, 10);
                    inputBox.lineStyle(2, 0xaaaaaa);
                    inputBox.strokeRoundedRect(250, 500, 300, 60, 10);
                }, 300);
            }
        });
        
        // Кнопка "Назад" (только при редактировании)
        if (this.isEditing) {
            const backButton = this.add.text(400, 680, 'ОТМЕНА', {
                fontFamily: 'unutterable',
                fontSize: '22px',
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
            backButton.on('pointerover', () => {
                backButton.setStyle({ fill: '#ffff00', backgroundColor: '#888888' });
            });
            
            backButton.on('pointerout', () => {
                backButton.setStyle({ fill: '#ffffff', backgroundColor: '#666666' });
            });
            
            // Действие при нажатии
            backButton.on('pointerdown', () => {
                backButton.setStyle({ fill: '#ff8800' });
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