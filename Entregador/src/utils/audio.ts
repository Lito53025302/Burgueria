// Som de notificação curto (Electronic Chime)
const soundBase64 = "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";
// Nota: O base64 acima é um placeholder curto para evitar payload gigante. 
// Vou usar um link de CDN confiável para um som real de notificação, ou um base64 real curto se eu tiver.
// Melhor opção: Usar um link público de som de notificação curto.

const NOTIFICATION_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"; // Ding Sound

let audio: HTMLAudioElement | null = null;
let isPlaying = false;

export const initAudio = () => {
    if (!audio) {
        audio = new Audio(NOTIFICATION_URL);
        audio.loop = true;
    }
    // Tenta tocar e pausar imediatamente só para desbloquear no iOS/Android
    audio.play().then(() => {
        audio?.pause();
        audio!.currentTime = 0;
    }).catch(() => { });
};

export const startAlarm = () => {
    if (!audio) {
        audio = new Audio(NOTIFICATION_URL);
        audio.loop = true;
    }

    if (isPlaying) return;

    // Tenta vibrar (Android) - Longo
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([500, 500, 500, 500, 500]);
    }

    isPlaying = true;
    audio.currentTime = 0;
    audio.play().catch((err) => console.error("Erro ao tocar alarme:", err));
};

export const stopAlarm = () => {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    isPlaying = false;
};

export const playNotificationSound = startAlarm;
