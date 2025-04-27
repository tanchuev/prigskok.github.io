class MusicManager {
    constructor() {
        // Синглтон - только один экземпляр на всю игру
        if (MusicManager.instance) {
            return MusicManager.instance;
        }
        
        MusicManager.instance = this;
        
        // Музыкальные треки
        this.tracks = {};
        
        // Текущий трек
        this.currentTrack = null;
        
        // Состояние звука (вкл/выкл)
        this.isMuted = false;
        
        // Громкость (от 0 до 1)
        this.volume = 0.5;
    }
    
    // Инициализация с сценой
    init(scene) {
        if (!this.initialized) {
            this.mainScene = scene;
            this.initialized = true;
            
            // Загружаем основной трек, если еще не загружен
            if (!this.tracks.main_theme) {
                this.tracks.main_theme = scene.sound.add('main_theme', {
                    loop: true,
                    volume: this.volume
                });
            }
        }
    }
    
    // Воспроизведение трека
    playMusic(key = 'main_theme') {
        if (!this.initialized) {
            console.warn('MusicManager не инициализирован');
            return;
        }
        
        // Если трек уже проигрывается, ничего не делаем
        if (this.currentTrack === key && this.tracks[key].isPlaying) {
            return;
        }
        
        // Остановить текущий трек, если есть
        if (this.currentTrack && this.tracks[this.currentTrack]) {
            this.tracks[this.currentTrack].stop();
        }
        
        // Установить и воспроизвести новый трек
        this.currentTrack = key;
        
        if (!this.isMuted) {
            this.tracks[key].play();
        }
    }
    
    // Остановка музыки
    stopMusic() {
        if (this.currentTrack && this.tracks[this.currentTrack]) {
            this.tracks[this.currentTrack].stop();
        }
    }
    
    // Пауза/возобновление
    togglePause() {
        if (this.currentTrack && this.tracks[this.currentTrack]) {
            if (this.tracks[this.currentTrack].isPlaying) {
                this.tracks[this.currentTrack].pause();
            } else {
                this.tracks[this.currentTrack].resume();
            }
        }
    }
    
    // Включение/выключение звука
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            if (this.currentTrack && this.tracks[this.currentTrack]) {
                this.tracks[this.currentTrack].pause();
            }
        } else {
            if (this.currentTrack && this.tracks[this.currentTrack]) {
                this.tracks[this.currentTrack].resume();
            }
        }
        
        return this.isMuted;
    }
    
    // Установка громкости
    setVolume(value) {
        this.volume = value;
        
        // Применить ко всем трекам
        for (const key in this.tracks) {
            if (this.tracks.hasOwnProperty(key)) {
                this.tracks[key].setVolume(value);
            }
        }
    }
}

// Создаем глобальный экземпляр
window.musicManager = new MusicManager(); 