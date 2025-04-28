class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Загрузка фонов и необходимых текстур
        this.load.image('background', 'assets/images/ui/background.png');
        this.load.image('logo', 'assets/images/ui/logo.png');
        this.load.image('loading-bar', 'assets/images/ui/loading-bar.png');
        this.load.image('fullscreen-button', 'assets/images/ui/fullscreen-button.png');
        
        // Загрузка звуков
        this.load.audio('menu-music', 'assets/sounds/main_theme.mp3');
        this.load.audio('click-sound', 'assets/sounds/platform.mp3');
        
        // Создаем полосу загрузки
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Загрузка...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        // Обновление полосы загрузки
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });
        
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
    }
    
    create() {
        // Настройка масштабирования и адаптации к экрану
        this.setupScreenAdaptation();
        
        // Настройка полноэкранного режима и интерфейса
        this.setupFullscreenMode();
        
        // Звуковые эффекты
        this.addSounds();
        
        // Переходим к сцене ввода никнейма
        setTimeout(() => {
            this.scene.start('NicknameScene');
        }, 500);
    }
    
    setupScreenAdaptation() {
        // Определяем, является ли устройство мобильным
        const isMobile = !this.sys.game.device.os.desktop;
        
        // Получаем реальные размеры экрана с учетом панели браузера
        const canvas = this.sys.game.canvas;
        const deviceWidth = window.innerWidth;
        const deviceHeight = window.innerHeight;
        
        // Обновляем размеры канваса и масштабирование
        this.scale.resize(deviceWidth, deviceHeight);
        
        // Устанавливаем границы мира в соответствии с размерами экрана
        if (isMobile) {
            // На мобильных устройствах учитываем панель адресной строки
            // Используем 90% высоты для компенсации возможных UI-элементов браузера
            const safeHeight = deviceHeight * 0.9;
            
            // Сохраняем эти размеры для использования в других сценах
            window.GAME_CONFIG.safeWidth = deviceWidth;
            window.GAME_CONFIG.safeHeight = safeHeight;
            
            console.log(`Настройка экрана для мобильного: ${deviceWidth}x${safeHeight}`);
        } else {
            // На десктопе используем полный размер окна
            window.GAME_CONFIG.safeWidth = deviceWidth;
            window.GAME_CONFIG.safeHeight = deviceHeight;
            
            console.log(`Настройка экрана для десктопа: ${deviceWidth}x${deviceHeight}`);
        }
        
        // Добавляем обработчик изменения размера окна
        this.scale.on('resize', this.handleResize, this);
    }
    
    handleResize(gameSize) {
        // Обновляем размеры при изменении размера окна
        const width = gameSize.width;
        const height = gameSize.height;
        
        // Обновляем мировые границы и камеры
        this.cameras.main.setSize(width, height);
        
        // Обновляем сохраненные значения
        window.GAME_CONFIG.safeWidth = width;
        window.GAME_CONFIG.safeHeight = height;
        
        console.log(`Изменение размера экрана: ${width}x${height}`);
    }
    
    setupFullscreenMode() {
        // Только если браузер поддерживает полноэкранный режим
        if (this.scale.fullscreen.available) {
            // Создаем кнопку полноэкранного режима в правом верхнем углу
            const fullscreenButton = this.add.image(
                this.cameras.main.width - 20, 
                20, 
                'fullscreen-button'
            ).setOrigin(1, 0);
            
            fullscreenButton.setInteractive();
            fullscreenButton.setScale(0.5);
            fullscreenButton.setAlpha(0.7);
            
            // При нажатии на кнопку переключаем режим
            fullscreenButton.on('pointerup', () => {
                window.GAME_CONFIG.toggleFullscreen(this.game);
            });
            
            // Добавляем поддержку для автоматического входа в полноэкранный режим на мобильных устройствах
            if (!this.sys.game.device.os.desktop && !window.GAME_CONFIG.isFullscreen) {
                this.input.once('pointerdown', () => {
                    window.GAME_CONFIG.toggleFullscreen(this.game);
                });
            }
        }
    }
    
    addSounds() {
        // Фоновая музыка для меню
        const menuMusic = this.sound.add('menu-music', {
            volume: 0.5,
            loop: true
        });
        
        // Звук клика для кнопок
        const clickSound = this.sound.add('click-sound', {
            volume: 0.5
        });
        
        // Сохраняем звуки в глобальной конфигурации
        window.GAME_CONFIG.sounds = {
            menuMusic: menuMusic,
            clickSound: clickSound
        };
        
        // Запускаем фоновую музыку
        menuMusic.play();
    }
} 