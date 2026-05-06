let notificationAudioContext: AudioContext | null = null;

type AudioContextWindow = Window &
    typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
    };

const getNotificationAudioContext = () => {
    if (typeof window === "undefined") {
        return null;
    }

    const audioWindow = window as AudioContextWindow;
    const AudioContextConstructor =
        audioWindow.AudioContext ?? audioWindow.webkitAudioContext;

    if (!AudioContextConstructor) {
        return null;
    }

    if (!notificationAudioContext) {
        notificationAudioContext = new AudioContextConstructor();
    }

    return notificationAudioContext;
};

const scheduleTone = (
    audioContext: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    peakGain: number,
    options?: {
        oscillatorType?: OscillatorType;
        endFrequency?: number;
        attackMs?: number;
    },
) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const oscillatorType = options?.oscillatorType ?? "triangle";
    const endFrequency = options?.endFrequency ?? frequency;
    const attackSeconds = (options?.attackMs ?? 18) / 1000;

    oscillator.type = oscillatorType;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(
        endFrequency,
        startTime + duration,
    );

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(
        peakGain,
        startTime + attackSeconds,
    );
    gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + duration,
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.04);
};

const playChatNotificationSound = async () => {
    const audioContext = getNotificationAudioContext();

    if (!audioContext) {
        return;
    }

    try {
        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }
    } catch {
        return;
    }

    const startTime = audioContext.currentTime + 0.01;

    scheduleTone(audioContext, 523.25, startTime, 0.32, 0.026, {
        oscillatorType: "sine",
        endFrequency: 515,
        attackMs: 22,
    });
    scheduleTone(audioContext, 1046.5, startTime, 0.2, 0.006, {
        oscillatorType: "sine",
        endFrequency: 1024,
        attackMs: 10,
    });

    scheduleTone(audioContext, 659.25, startTime + 0.12, 0.36, 0.022, {
        oscillatorType: "sine",
        endFrequency: 646,
        attackMs: 24,
    });
    scheduleTone(audioContext, 1318.5, startTime + 0.12, 0.24, 0.005, {
        oscillatorType: "sine",
        endFrequency: 1288,
        attackMs: 12,
    });
};

export default playChatNotificationSound;
