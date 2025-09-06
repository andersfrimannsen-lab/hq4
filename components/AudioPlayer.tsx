import React, { useState, useRef, useEffect, useCallback } from 'react';
import playlistData from '../music.json';

interface Track {
    url: string;
    title: string;
}

// SVG Icons
const VolumeUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

const VolumeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

const AudioPlayer: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    // Initialize state directly from the imported JSON to ensure the player renders immediately.
    const [playlist] = useState<Track[]>(playlistData || []);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.2); // Start with low volume
    const [showSlider, setShowSlider] = useState(false);

    const playAudio = useCallback(() => {
        audioRef.current?.play().catch(error => {
            console.log("Autoplay prevented:", error);
            setIsPlaying(false);
        });
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = volume;
        audio.muted = isMuted;

        if (isPlaying) {
            playAudio();
        } else {
            audio.pause();
        }
    }, [volume, isMuted, isPlaying, playAudio]);

    useEffect(() => {
        const handleFirstInteraction = () => {
            if (!isPlaying) {
                setIsPlaying(true);
            }
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
        };

        window.addEventListener('click', handleFirstInteraction);
        window.addEventListener('keydown', handleFirstInteraction);

        return () => {
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
        };
    }, [isPlaying]);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
        }
    };

    const toggleMute = () => {
        setIsMuted(prevMuted => !prevMuted);
    };

    const handleTrackEnd = () => {
        setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    };
    
    const handleSkip = () => {
        if (playlist.length > 0) {
            setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
        }
    };

    useEffect(() => {
        if (isPlaying && playlist.length > 0) {
            playAudio();
        }
    }, [currentTrackIndex, isPlaying, playAudio, playlist.length]);

    if (playlist.length === 0) {
        return null; // Don't render the player if there's no music
    }

    return (
        <div 
            className="flex items-center gap-2 group"
            onMouseEnter={() => setShowSlider(true)}
            onMouseLeave={() => setShowSlider(false)}
        >
            <audio
                ref={audioRef}
                src={playlist[currentTrackIndex]?.url}
                onEnded={handleTrackEnd}
                loop={false}
                key={currentTrackIndex} // Add key to force re-render on track change
            />
             <button
                onClick={handleSkip}
                className="p-2 text-white bg-black/30 rounded-full backdrop-blur-sm shadow-lg hover:bg-black/50 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Skip to next track"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
            <button
                onClick={toggleMute}
                className="p-2 text-white bg-black/30 rounded-full backdrop-blur-sm shadow-lg hover:bg-black/50 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted || volume === 0 ? (
                    <VolumeOffIcon className="w-6 h-6" />
                ) : (
                    <VolumeUpIcon className="w-6 h-6" />
                )}
            </button>
            <div className={`transition-all duration-300 ease-in-out ${showSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'} overflow-hidden`}>
                 <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    aria-label="Volume slider"
                />
            </div>
        </div>
    );
};

export default AudioPlayer;