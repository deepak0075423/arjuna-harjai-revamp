/* ==========================================================================
   ARJUNA HARJAI - Custom Music Player
   ========================================================================== */

class MusicPlayer {
    constructor() {
        this.player = document.getElementById('musicPlayer');
        if (!this.player) return;

        // Elements
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressFill = document.getElementById('progressFill');
        this.progressInput = document.getElementById('progressInput');
        this.currentTimeEl = document.getElementById('currentTime');
        this.durationEl = document.getElementById('duration');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.playerTitle = document.getElementById('playerTitle');
        this.playerArtist = document.getElementById('playerArtist');
        this.playerArtwork = document.getElementById('playerArtwork');
        this.trackItems = document.querySelectorAll('.track-item');

        // State
        this.isPlaying = false;
        this.currentTrack = 0;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 0.8;
        this.progressInterval = null;

        // Track data (placeholder - would be replaced with actual audio files)
        this.tracks = [
            {
                title: 'Winter Ayun Waliye',
                artist: 'Arjuna Harjai',
                album: 'The One Minute Composer',
                duration: 225, // 3:45 in seconds
                artwork: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop'
            },
            {
                title: 'Mangoge Na',
                artist: 'Arjuna Harjai',
                album: 'The One Minute Composer',
                duration: 252, // 4:12 in seconds
                artwork: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop'
            },
            {
                title: 'Zikar Hai',
                artist: 'Arjuna Harjai',
                album: 'The One Minute Composer',
                duration: 208, // 3:28 in seconds
                artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
            },
            {
                title: 'Ankhiyaan',
                artist: 'Arjuna Harjai',
                album: 'Do Lafzon Ki Kahani',
                duration: 295, // 4:55 in seconds
                artwork: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop'
            }
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTrack(0);
        this.updateVolume();
    }

    bindEvents() {
        // Play/Pause
        this.playBtn.addEventListener('click', () => this.togglePlay());

        // Previous/Next
        this.prevBtn.addEventListener('click', () => this.prevTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());

        // Progress
        this.progressInput.addEventListener('input', (e) => this.seek(e.target.value));

        // Volume
        this.volumeSlider.addEventListener('input', (e) => {
            this.volume = e.target.value / 100;
            this.updateVolume();
        });

        // Track list clicks
        this.trackItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.loadTrack(index);
                this.play();
            });
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowLeft':
                    this.seekRelative(-10);
                    break;
                case 'ArrowRight':
                    this.seekRelative(10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.adjustVolume(0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.adjustVolume(-0.1);
                    break;
            }
        });
    }

    loadTrack(index) {
        this.currentTrack = index;
        const track = this.tracks[index];

        // Update UI
        this.playerTitle.textContent = track.title;
        this.playerArtist.textContent = track.artist;
        this.playerArtwork.src = track.artwork;
        this.duration = track.duration;
        this.currentTime = 0;

        // Update duration display
        this.durationEl.textContent = this.formatTime(track.duration);
        this.currentTimeEl.textContent = '0:00';
        this.progressFill.style.width = '0%';
        this.progressInput.value = 0;

        // Update track list active state
        this.trackItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        // Reset playing state if was playing
        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        this.playBtn.classList.add('playing');
        this.playerArtwork.parentElement.classList.add('playing');

        // Simulate playback with progress
        this.progressInterval = setInterval(() => {
            this.currentTime += 0.1;

            if (this.currentTime >= this.duration) {
                this.nextTrack();
                return;
            }

            this.updateProgress();
        }, 100);
    }

    pause() {
        this.isPlaying = false;
        this.playBtn.classList.remove('playing');
        this.playerArtwork.parentElement.classList.remove('playing');

        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    prevTrack() {
        let newIndex = this.currentTrack - 1;
        if (newIndex < 0) newIndex = this.tracks.length - 1;
        this.loadTrack(newIndex);
        if (this.isPlaying) this.play();
    }

    nextTrack() {
        let newIndex = this.currentTrack + 1;
        if (newIndex >= this.tracks.length) newIndex = 0;
        this.loadTrack(newIndex);
        if (this.isPlaying) this.play();
    }

    seek(value) {
        const seekTime = (value / 100) * this.duration;
        this.currentTime = seekTime;
        this.updateProgress();
    }

    seekRelative(seconds) {
        this.currentTime = Math.max(0, Math.min(this.duration, this.currentTime + seconds));
        this.updateProgress();
    }

    updateProgress() {
        const percent = (this.currentTime / this.duration) * 100;
        this.progressFill.style.width = `${percent}%`;
        this.progressInput.value = percent;
        this.currentTimeEl.textContent = this.formatTime(this.currentTime);
    }

    adjustVolume(delta) {
        this.volume = Math.max(0, Math.min(1, this.volume + delta));
        this.volumeSlider.value = this.volume * 100;
        this.updateVolume();
    }

    updateVolume() {
        // In a real implementation, this would set the audio element volume
        // For visual feedback, we could add a volume indicator animation
        console.log(`Volume: ${Math.round(this.volume * 100)}%`);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Spotify Embed Integration Helper
class SpotifyPlayer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    embedTrack(trackId) {
        if (!this.container) return;

        const iframe = document.createElement('iframe');
        iframe.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
        iframe.width = '100%';
        iframe.height = '152';
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        iframe.loading = 'lazy';

        this.container.innerHTML = '';
        this.container.appendChild(iframe);
    }

    embedPlaylist(playlistId) {
        if (!this.container) return;

        const iframe = document.createElement('iframe');
        iframe.src = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
        iframe.width = '100%';
        iframe.height = '380';
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        iframe.loading = 'lazy';

        this.container.innerHTML = '';
        this.container.appendChild(iframe);
    }

    embedArtist(artistId) {
        if (!this.container) return;

        const iframe = document.createElement('iframe');
        iframe.src = `https://open.spotify.com/embed/artist/${artistId}?utm_source=generator&theme=0`;
        iframe.width = '100%';
        iframe.height = '380';
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        iframe.loading = 'lazy';

        this.container.innerHTML = '';
        this.container.appendChild(iframe);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const musicPlayer = new MusicPlayer();

    // Uncomment to use Spotify embeds instead of custom player:
    // const spotify = new SpotifyPlayer('spotifyContainer');
    // spotify.embedArtist('6EwLfbS1MI8kZXTIwkGfHN'); // Arjuna Harjai's Spotify ID
});
