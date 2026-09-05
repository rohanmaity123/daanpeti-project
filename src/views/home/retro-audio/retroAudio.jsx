import { useEffect, useRef, useState } from "react";
import "../../../scss/musicPlayer.scss";
import { supabase } from "../../../utils/supabaseClient";
import { AboutSection, FaqSection, ShopFooter } from "../../../components/retro-music/shopSections";

const TABLE_NAME = "songs";
const ID_COLUMN = "youtube_id";
const ORDER_COLUMN = "sort_order"; // set to null to skip explicit ordering

// Used only if the Supabase fetch fails or the table is empty, so the
// player still works instead of showing a dead UI.
const FALLBACK_SONGS = [
    "y2BPZuB-pHc",
    "abFSx0pGL_c",
    "xwPTUOvR0Oo",
]

const SHOP_NAME = "ভোল্টা দার দকান";

function BengaliMusicPlayer() {
    const ytContainerRef = useRef(null);
    const playerRef = useRef(null);
    const progressTimerRef = useRef(null);
    const songIndexRef = useRef(0);
    const goToTrackRef = useRef(() => { });
    const songsRef = useRef(FALLBACK_SONGS);

    const [songs, setSongs] = useState(null); // null = still loading
    const [songsError, setSongsError] = useState(null);
    const [songIndex, setSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackName, setTrackName] = useState("Loading...");
    const [channelName, setChannelName] = useState("YouTube");
    const [coverUrl, setCoverUrl] = useState("");
    const [timeNow, setTimeNow] = useState("0:00");
    const [timeTotal, setTimeTotal] = useState("0:00");
    const [progressPct, setProgressPct] = useState(0);
    const [volume, setVolume] = useState(100);
    const [showVolume, setShowVolume] = useState(false);

    const formatTime = (s) => {
        if (!s || Number.isNaN(s)) return "0:00";
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? "0" : ""}${sec}`;
    };
    function getRandomIndex(currentIndex, length) {
        if (length <= 1) return 0;
        let idx;
        do {
            idx = Math.floor(Math.random() * length);
        } while (idx === currentIndex);
        return idx;
    }
    // ── Fetch the playlist from Supabase on mount ───────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function fetchSongs() {
            try {
                let query = supabase.from(TABLE_NAME).select(ID_COLUMN);
                if (ORDER_COLUMN) {
                    query = query.order(ORDER_COLUMN, { ascending: true });
                }
                const { data, error } = await query;
                if (error) throw error;
                const ids = (data || [])
                    .map((row) => row[ID_COLUMN])
                    .filter((id) => typeof id === "string" && id.length > 0);

                if (cancelled) return;

                if (ids.length > 0) {
                    songsRef.current = ids;
                    songIndexRef.current = Math.floor(Math.random() * ids.length); // random start
                    setSongs(ids);
                } else {
                    songsRef.current = FALLBACK_SONGS;
                    songIndexRef.current = Math.floor(Math.random() * FALLBACK_SONGS.length);
                    setSongs(FALLBACK_SONGS);
                }
            } catch (err) {
                if (cancelled) return;
                console.warn("Could not load songs from Supabase, using fallback list:", err);
                songsRef.current = FALLBACK_SONGS;
                setSongs(FALLBACK_SONGS);
                setSongsError(err.message || "Failed to load songs");
            }
        }

        fetchSongs();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        songIndexRef.current = songIndex;
    }, [songIndex]);

    // ── Set up the YouTube player once the playlist is known ────────────────
    useEffect(() => {
        if (!songs || songs.length === 0) return;

        setCoverUrl(`https://img.youtube.com/vi/${songs[songIndexRef.current] || songs[0]}/hqdefault.jpg`);

        let cancelled = false;

        function goToTrack(index, autoplay) {
            const p = playerRef.current;
            const list = songsRef.current;
            if (!p || typeof p.loadVideoById !== "function" || !list.length) return;
            const wrapped = ((index % list.length) + list.length) % list.length;
            songIndexRef.current = wrapped;
            setSongIndex(wrapped);
            if (autoplay) p.loadVideoById(list[wrapped]);
            else p.cueVideoById(list[wrapped]);
        }
        goToTrackRef.current = goToTrack;

        function updateTrackData() {
            const p = playerRef.current;
            if (!p || typeof p.getVideoData !== "function") return;
            try {
                const data = p.getVideoData();
                if (data?.title) setTrackName(data.title);
                if (data?.author) setChannelName(data.author);
                if (data?.video_id) {
                    setCoverUrl(`https://img.youtube.com/vi/${data.video_id}/hqdefault.jpg`);
                }
            } catch (e) { }
        }

        function startProgressMonitor() {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = setInterval(() => {
                const p = playerRef.current;
                if (p && p.getCurrentTime && p.getDuration) {
                    const cur = p.getCurrentTime() || 0;
                    const dur = p.getDuration() || 0;
                    setTimeNow(formatTime(cur));
                    setTimeTotal(formatTime(dur));
                    setProgressPct(dur > 0 ? (cur / dur) * 100 : 0);
                }
            }, 500);
        }

        function createPlayer() {
            if (cancelled || playerRef.current) return;
            playerRef.current = new window.YT.Player(ytContainerRef.current, {
                height: "0",
                width: "0",
                videoId: songsRef.current[songIndexRef.current],
                playerVars: {
                    controls: 0,
                    disablekb: 1,
                    playsinline: 1,
                    rel: 0,
                },
                events: {
                    onReady: (e) => {
                        e.target.setVolume(100);
                        updateTrackData();
                    },
                    onStateChange: (e) => {
                        const YT = window.YT;
                        if (e.data === YT.PlayerState.PLAYING) {
                            setIsPlaying(true);
                            updateTrackData();
                            startProgressMonitor();
                        } else if (e.data === YT.PlayerState.PAUSED) {
                            setIsPlaying(false);
                        } else if (e.data === YT.PlayerState.ENDED) {
                            setIsPlaying(false);
                            const list = songsRef.current;
                            goToTrack(getRandomIndex(songIndexRef.current, list.length), true);
                        } else {
                            updateTrackData();
                        }
                    },
                },
            });
        }

        if (window.YT && window.YT.Player) {
            createPlayer();
        } else {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(tag);
            const prevReady = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (prevReady) prevReady();
                createPlayer();
            };
        }

        return () => {
            cancelled = true;
            clearInterval(progressTimerRef.current);
            if (playerRef.current?.destroy) playerRef.current.destroy();
            playerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [songs]);

    const nextTrack = () => {
        const list = songsRef.current;
        goToTrackRef.current(getRandomIndex(songIndexRef.current, list.length), true);
    };
    const prevTrack = () => goToTrackRef.current(songIndexRef.current - 1, true);

    const togglePlay = () => {
        const p = playerRef.current;
        if (!p || typeof p.playVideo !== "function") return;
        if (isPlaying) p.pauseVideo();
        else p.playVideo();
    };

    const handleSeek = (e) => {
        const p = playerRef.current;
        if (!p || !p.getDuration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        p.seekTo(pct * p.getDuration(), true);
    };

    const handleVolumeChange = (e) => {
        const level = Number(e.target.value);
        setVolume(level);
        const p = playerRef.current;
        if (!p) return;
        if (level === 0) p.mute();
        else {
            p.unMute();
            p.setVolume(level);
        }
    };

    const hasMultipleSongs = (songs?.length || 0) > 1;

    return (
        <div className="bmp-wrap">
            <h1 className="bmp-shopname">{SHOP_NAME}</h1>

            <section className="music-player" aria-label={`${SHOP_NAME} music player`}>
                <button
                    className="music-cover-frame"
                    type="button"
                    onClick={togglePlay}
                    aria-label="Play from cover art"
                >
                    <div
                        className={`music-cover ${isPlaying ? "spinning" : ""}`}
                        style={{ backgroundImage: `url('${coverUrl}')` }}
                    />
                    <span className="music-cover-hole" aria-hidden="true" />
                </button>

                <div className="track-block">
                    <div className="track-top">
                        <div className="track-name">
                            {songs === null ? "Loading songs…" : trackName}
                        </div>
                    </div>
                    <p className="station">
                        Credits: <span>{channelName}</span>
                    </p>
                    <div className="progress-row">
                        <span>{timeNow}</span>
                        <div
                            className="progress"
                            role="slider"
                            aria-label="Track progress"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(progressPct)}
                            tabIndex={0}
                            onClick={handleSeek}
                        >
                            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                        </div>
                        <span>{timeTotal}</span>
                    </div>
                </div>

                <div className="player-actions">
                    <button
                        className="icon-button"
                        type="button"
                        onClick={prevTrack}
                        disabled={!hasMultipleSongs}
                        aria-label="Previous track"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m19 20-9-8 9-8v16Z" />
                            <path d="M5 19V5" />
                        </svg>
                    </button>

                    <button
                        className="icon-button play-button"
                        type="button"
                        onClick={togglePlay}
                        disabled={songs === null}
                        aria-label={isPlaying ? "Pause music" : "Play music"}
                    >
                        {isPlaying ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M8 5v14l11-7-11-7Z" />
                            </svg>
                        )}
                    </button>

                    <button
                        className="icon-button"
                        type="button"
                        onClick={nextTrack}
                        disabled={!hasMultipleSongs}
                        aria-label="Next track"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m5 4 9 8-9 8V4Z" />
                            <path d="M19 5v14" />
                        </svg>
                    </button>

                    <div className="relative">
                        <button
                            className="icon-button"
                            type="button"
                            onClick={() => setShowVolume((v) => !v)}
                            aria-label={volume > 0 ? `Volume: ${volume}%` : "Muted"}
                        >
                            {volume > 0 ? (
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                                    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                                    <path d="m22 9-6 6" />
                                    <path d="m16 9 6 6" />
                                </svg>
                            )}
                        </button>
                        {showVolume && (
                            <div className="volume-popover">
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    aria-label="Volume level"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {songsError && (
                <p className="bmp-error">Could not load the playlist ({songsError}) — playing a default list instead.</p>
            )}

            <div ref={ytContainerRef} style={{ display: "none" }} />
        </div>
    );
}

export default function VoltaDarDokanPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <>
            <BengaliMusicPlayer />
            <AboutSection />
            <FaqSection />
            <ShopFooter />
        </>
    );
}