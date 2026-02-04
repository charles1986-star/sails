import { useEffect, useRef, useState } from 'react';
import { getAuthHeader } from '../utils/auth';

export default function MediaPlayer({ videoId, title = 'Media Player' }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoId || !videoRef.current) return;

    const loadVideo = async () => {
      try {
        setLoading(true);
        const headers = getAuthHeader();
        const token = headers.Authorization ? headers.Authorization.split(' ')[1] : '';

        // Try HLS first (modern approach)
        const hlsUrl = `http://localhost:5000/api/hls/playlist/${videoId}?token=${token}`;

        // Check if browser supports HLS natively
        if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = hlsUrl;
          setLoading(false);
        } else if (window.Hls) {
          // Use HLS.js library for broader support
          const hls = new window.Hls();
          hls.loadSource(hlsUrl);
          hls.attachMedia(videoRef.current);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            setLoading(false);
          });
          hls.on(window.Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data);
            setError('Failed to load video stream');
            setLoading(false);
          });
        } else {
          // Fallback to progressive download
          const fallbackUrl = `http://localhost:5000/api/stream/${videoId}?token=${token}`;
          videoRef.current.src = fallbackUrl;
          setLoading(false);
        }
      } catch (err) {
        setError(err.message || 'Failed to load video');
        setLoading(false);
      }
    };

    loadVideo();
  }, [videoId]);

  return (
    <div className="media-player-container">
      <h3>{title}</h3>
      {error && <div className="player-error">{error}</div>}
      {loading && <div className="player-loading">Loading video...</div>}
      <video
        ref={videoRef}
        controls
        style={{ width: '100%', maxWidth: '800px', height: 'auto' }}
        onError={() => setError('Error playing video')}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
