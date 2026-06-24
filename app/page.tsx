'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import FileUpload from '@/components/FileUpload';
import FilePreview from '@/components/FilePreview';
import ConvertButton from '@/components/ConvertButton';
import StatusBar from '@/components/StatusBar';
import ImageDownload from '@/components/ImageDownload';
import MusicSearch from '@/components/MusicSearch';
import MusicList from '@/components/MusicList';
import MusicPlayer, { MusicPlayerState } from '@/components/MusicPlayer';
import PlayerPage from '@/components/PlayerPage';
import PlaylistGrid from '@/components/PlaylistGrid';
import PlaylistDetail from '@/components/PlaylistDetail';
import MusicBoxEmbed from '@/components/MusicBoxEmbed';
import ParseChannelConfig from '@/components/ParseChannelConfig';
import ApiTester from '@/components/ApiTester';
import NovelReader from '@/components/NovelReader';
import AboutPage from '@/components/AboutPage';
import { useTheme } from '@/app/theme-context';
import { useToast } from '@/app/toast-context';
import { extractDominantColor, applyAmbientColor } from '@/lib/color-extract';
import CharReveal from '@/components/CharReveal';
import PlaylistSkeleton from '@/components/PlaylistSkeleton';
import { previewDocx, convertDocxToPdf } from '@/lib/docx-to-pdf';
import { previewPdf, convertPdfToDocx } from '@/lib/pdf-to-docx';
import { isDocxFile, isPdfFile, downloadBlob } from '@/lib/file-utils';
import { getRecommendPlaylists, getPlaylistDetail, searchPlaylists } from '@/lib/musicbox';
import { FileInfo, FileStatus, ConvertState, Song, PlayUrl, Playlist } from '@/types';
import { QualityLevel } from '@/types/music';
import MovieSearch from '@/components/MovieSearch';
import MovieGrid from '@/components/MovieGrid';
import MovieDetailComponent from '@/components/MovieDetail';
import MovieSkeleton from '@/components/MovieSkeleton';
import MovieSourceSwitcher, { SourceInfo } from '@/components/MovieSourceSwitcher';
import { Movie, MovieDetail, VideoSource, MovieCategory } from '@/types/movie';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const isLight = theme === 'light';
  const [activeItem, setActiveItem] = useState('format-convert');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [state, setState] = useState<ConvertState>({
    file: null,
    status: 'idle',
    errorMessage: '',
    previewHtml: '',
  });

  // Music state
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playUrl, setPlayUrl] = useState<PlayUrl | null>(null);
  const [musicLoading, setMusicLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMusicSettings, setShowMusicSettings] = useState(false);
  const [musicUInput, setMusicUInput] = useState('');

  // Play queue state
  const [playQueue, setPlayQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playMode, setPlayMode] = useState<'sequential' | 'shuffle' | 'loop' | 'single'>('sequential');
  const [showPlayerPage, setShowPlayerPage] = useState(false);
  const [playerState, setPlayerState] = useState<MusicPlayerState>({ isPlaying: false, currentTime: 0, duration: 0, togglePlay: () => {}, seek: () => {} });
  const [currentQuality, setCurrentQuality] = useState<QualityLevel>('exhigh');

  const handleAddPlayNext = (song: Song) => {
    setPlayQueue(prev => {
      const exists = prev.find(s => s.id === song.id);
      if (exists) return prev;
      const insertAt = currentIndex >= 0 ? currentIndex + 1 : 0;
      const next = [...prev];
      next.splice(insertAt, 0, song);
      return next;
    });
  };

  // Load MUSIC_U from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('netease_music_u');
      if (saved) setMusicUInput(saved);
    } catch {}
  }, []);

  const handleSaveMusicU = () => {
    try {
      if (musicUInput.trim()) {
        localStorage.setItem('netease_music_u', musicUInput.trim());
      } else {
        localStorage.removeItem('netease_music_u');
      }
      setShowMusicSettings(false);
    } catch {}
  };

  // Playlist state
  const [recommendPlaylists, setRecommendPlaylists] = useState<Playlist[]>([]);
  const [searchPlaylistsResult, setSearchPlaylistsResult] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<{
    name: string;
    cover: string;
    tracks: Song[];
  } | null>(null);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [playlistsLoaded, setPlaylistsLoaded] = useState(false);

  // Movie state
  const [movieSearchResults, setMovieSearchResults] = useState<Movie[]>([]);
  const [movieSearchLoading, setMovieSearchLoading] = useState(false);
  const [movieShowSearch, setMovieShowSearch] = useState(false);
  const [recommendMovies, setRecommendMovies] = useState<Movie[]>([]);
  const [movieLoading, setMovieLoading] = useState(false);
  const [moviesLoaded, setMoviesLoaded] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
  const [movieVideoSources, setMovieVideoSources] = useState<VideoSource[]>([]);
  const [movieDetailLoading, setMovieDetailLoading] = useState(false);
  const [movieCategory, setMovieCategory] = useState<MovieCategory>('popular');
  const [moviePage, setMoviePage] = useState(1);
  const [movieTotalPages, setMovieTotalPages] = useState(1);
  const [movieSource, setMovieSource] = useState<string>('wujin');
  const [movieSources, setMovieSources] = useState<SourceInfo[]>([]);
  const [movieSourceLoading, setMovieSourceLoading] = useState(false);
  const [movieSourceLabel, setMovieSourceLabel] = useState('');
  const [hiddenSourceRevealed, setHiddenSourceRevealed] = useState(false);
  const aboutClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aboutClickCountRef = useRef(0);

  // 从 localStorage 恢复隐藏片源状态
  useEffect(() => {
    try {
      const revealed = localStorage.getItem('movie_hidden_source_revealed');
      if (revealed === 'true') setHiddenSourceRevealed(true);
    } catch {}
  }, []);

  // 侧边栏点击（带关于彩蛋）
  const handleSidebarItemClick = (id: string) => {
    setActiveItem(id);
    if (id === 'about') {
      aboutClickCountRef.current += 1;
      if (aboutClickCountRef.current >= 10) {
        setHiddenSourceRevealed(true);
        try { localStorage.setItem('movie_hidden_source_revealed', 'true'); } catch {}
        toast('🎬 已解锁隐藏片源！', 'success');
        aboutClickCountRef.current = 0;
      }
      // 2秒内无点击重置计数
      if (aboutClickTimerRef.current) clearTimeout(aboutClickTimerRef.current);
      aboutClickTimerRef.current = setTimeout(() => { aboutClickCountRef.current = 0; }, 2000);
    }
  };

  // Load recommend playlists when entering music page
  useEffect(() => {
    if (activeItem === 'music-listen' && !playlistsLoaded) {
      loadRecommendPlaylists();
    }
  }, [activeItem, playlistsLoaded]);

  const loadRecommendPlaylists = async () => {
    setPlaylistLoading(true);
    try {
      const playlists = await getRecommendPlaylists(30);
      setRecommendPlaylists(playlists);
      setPlaylistsLoaded(true);
    } catch (error) {
      console.error('Failed to load recommend playlists:', error);
    } finally {
      setPlaylistLoading(false);
    }
  };

  // Load movie sources on mount
  useEffect(() => {
    if (movieSources.length === 0) {
      loadMovieSources();
    }
  }, []);

  const loadMovieSources = async () => {
    try {
      const response = await fetch('/api/movie/sources');
      const data = await response.json();
      if (response.ok && data.sources) {
        setMovieSources(data.sources);
      }
    } catch (error) {
      console.error('Failed to load movie sources:', error);
    }
  };

  // Load recommend movies when entering movie page
  useEffect(() => {
    if (activeItem === 'movie-watch' && !moviesLoaded) {
      loadRecommendMovies();
    }
  }, [activeItem, moviesLoaded]);

  const loadRecommendMovies = async (category: MovieCategory = 'popular', page: number = 1, source?: string) => {
    setMovieLoading(true);
    const src = source || movieSource;
    try {
      const response = await fetch(`/api/movie/recommend?category=${category}&page=${page}&source=${src}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '获取推荐电影失败');
      if (page === 1) {
        setRecommendMovies(data.movies || []);
      } else {
        setRecommendMovies(prev => [...prev, ...(data.movies || [])]);
      }
      setMovieTotalPages(data.totalPages || 1);
      setMoviePage(page);
      setMoviesLoaded(true);
      setMovieCategory(category);
      if (data.sourceLabel) setMovieSourceLabel(data.sourceLabel);
    } catch (error: any) {
      toast(error.message || '获取推荐电影失败', 'error');
    } finally {
      setMovieLoading(false);
    }
  };

  const handleMovieSearch = async (keyword: string) => {
    setMovieSearchLoading(true);
    setSelectedMovie(null);
    try {
      const response = await fetch(`/api/movie/search?keyword=${encodeURIComponent(keyword)}&source=${movieSource}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '搜索失败');
      setMovieSearchResults(data.movies || []);
      if (data.sourceLabel) setMovieSourceLabel(data.sourceLabel);
    } catch (error: any) {
      toast(error.message || '搜索失败', 'error');
    } finally {
      setMovieSearchLoading(false);
    }
  };

  const handleMovieClick = async (movie: Movie) => {
    setMovieDetailLoading(true);
    setMovieShowSearch(false);
    try {
      const detailResponse = await fetch(`/api/movie/detail?id=${movie.id}&source=${movieSource}`);
      const detailData = await detailResponse.json();
      if (!detailResponse.ok) throw new Error(detailData.error || '获取电影详情失败');
      setSelectedMovie(detailData);
      setMovieVideoSources(detailData.videoSources || []);
      if (detailData.sourceLabel) setMovieSourceLabel(detailData.sourceLabel);
    } catch (error: any) {
      toast(error.message || '获取电影详情失败', 'error');
    } finally {
      setMovieDetailLoading(false);
    }
  };

  const handleMovieBack = () => {
    setSelectedMovie(null);
    setMovieVideoSources([]);
  };

  const handleMovieBackFromSearch = () => {
    setMovieShowSearch(false);
    setMovieSearchResults([]);
    setSelectedMovie(null);
  };

  const handleLoadMoreMovies = () => {
    if (moviePage < movieTotalPages) {
      loadRecommendMovies(movieCategory, moviePage + 1);
    }
  };

  const handleMovieCategoryChange = (category: MovieCategory) => {
    setMoviesLoaded(false);
    setRecommendMovies([]);
    loadRecommendMovies(category, 1, movieSource);
  };

  // 切换片源
  const handleMovieSourceChange = (sourceName: string) => {
    setMovieSource(sourceName);
    setSelectedMovie(null);
    setMovieShowSearch(false);
    setMovieSearchResults([]);
    loadRecommendMovies(movieCategory, 1, sourceName);
  };

  const handleFileSelect = async (file: File) => {
    const fileInfo: FileInfo = {
      name: file.name,
      size: file.size,
      type: isDocxFile(file) ? 'docx' : 'pdf',
      file,
    };

    setState({
      file: fileInfo,
      status: 'reading',
      errorMessage: '',
      previewHtml: '',
    });

    try {
      setState((prev) => ({ ...prev, status: 'previewing' }));
      let preview = '';

      if (isDocxFile(file)) {
        preview = await previewDocx(file);
      } else if (isPdfFile(file)) {
        preview = await previewPdf(file);
      }

      setState((prev) => ({
        ...prev,
        status: 'idle',
        previewHtml: preview,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: '预览失败，请检查文件格式',
      }));
    }
  };

  const handleConvert = async (direction: 'docx-to-pdf' | 'pdf-to-docx') => {
    if (!state.file) return;

    setState((prev) => ({ ...prev, status: 'converting', errorMessage: '' }));

    try {
      let blob: Blob;
      let filename: string;

      if (direction === 'docx-to-pdf') {
        blob = await convertDocxToPdf(state.file.file);
        filename = state.file.name.replace('.docx', '.pdf');
      } else {
        blob = await convertPdfToDocx(state.file.file);
        filename = state.file.name.replace('.pdf', '.docx');
      }

      downloadBlob(blob, filename);

      setState((prev) => ({ ...prev, status: 'success' }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: '转换失败，请检查文件是否损坏',
      }));
    }
  };

  const handleMusicSearch = async (keyword: string, source: string) => {
    setSearchLoading(true);
    setSelectedPlaylist(null);
    setSearchPlaylistsResult([]);

    try {
      const response = await fetch(`/api/music/search?keyword=${encodeURIComponent(keyword)}&source=${source}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '搜索失败');
      }

      const results = data.songs || [];
      setSongs(results);
      setPlayQueue(results);

      const playlists = await searchPlaylists(keyword);
      setSearchPlaylistsResult(playlists);
    } catch (error: any) {
      toast(error.message || '搜索失败', 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchPlayUrl = async (song: Song, quality?: QualityLevel): Promise<PlayUrl | null> => {
    try {
      const musicU = localStorage.getItem('netease_music_u') || '';
      const params = new URLSearchParams({
        id: song.id,
        source: song.source,
        quality: quality || currentQuality,
      });
      if (musicU) {
        params.set('musicU', musicU);
      }
      const response = await fetch(`/api/music/url?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '获取播放链接失败');
      return data;
    } catch (error: any) {
      toast(error.message || '获取播放链接失败', 'error');
      return null;
    }
  };

  const handlePlaySong = async (song: Song) => {
    const idx = playQueue.findIndex(s => s.id === song.id);
    if (idx >= 0) setCurrentIndex(idx);
    setCurrentSong(song);
    setMusicLoading(true);
    const url = await fetchPlayUrl(song);
    if (url) setPlayUrl(url);
    setMusicLoading(false);
  };

  const handleQualityChange = async (quality: QualityLevel) => {
    setCurrentQuality(quality);
    if (currentSong) {
      setMusicLoading(true);
      const url = await fetchPlayUrl(currentSong, quality);
      if (url) setPlayUrl(url);
      setMusicLoading(false);
    }
  };

  // 封面取色 → 环境光
  useEffect(() => {
    if (!currentSong?.cover) {
      applyAmbientColor(null);
      document.getElementById('ambient-bg')?.classList.remove('active');
      return;
    }
    extractDominantColor(currentSong.cover).then((color) => {
      applyAmbientColor(color);
      if (color) {
        document.getElementById('ambient-bg')?.classList.add('active');
        // 播放条环境光晕
        const glow = document.getElementById('player-ambient-glow');
        if (glow) glow.classList.add('active');
      }
    });
  }, [currentSong?.cover]);

  const handlePlayAll = async () => {
    if (!selectedPlaylist || selectedPlaylist.tracks.length === 0) return;
    setPlayQueue(selectedPlaylist.tracks);
    setCurrentIndex(0);
    const firstSong = selectedPlaylist.tracks[0];
    setCurrentSong(firstSong);
    setMusicLoading(true);
    const url = await fetchPlayUrl(firstSong);
    if (url) setPlayUrl(url);
    setMusicLoading(false);
  };

  const handlePlayIndex = useCallback(async (index: number) => {
    if (index < 0 || index >= playQueue.length) return;
    setCurrentIndex(index);
    const song = playQueue[index];
    setCurrentSong(song);
    setMusicLoading(true);
    const url = await fetchPlayUrl(song);
    if (url) setPlayUrl(url);
    setMusicLoading(false);
  }, [playQueue, fetchPlayUrl]);

  const handlePlaylistClick = async (playlist: Playlist) => {
    setShowSearch(false);
    setPlaylistLoading(true);
    try {
      const detail = await getPlaylistDetail(playlist.id);
      if (detail) {
        setSelectedPlaylist({
          name: detail.name,
          cover: detail.cover,
          tracks: detail.tracks,
        });
      } else {
        toast('获取歌单详情失败', 'error');
      }
    } catch (error) {
      toast('获取歌单详情失败', 'error');
    } finally {
      setPlaylistLoading(false);
    }
  };

  const handleBackFromSearch = () => {
    setShowSearch(false);
    setSongs([]);
    setSearchPlaylistsResult([]);
    setSelectedPlaylist(null);
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'movie-watch':
        return (
          <div className="space-y-8 animate-fade-in">
            {/* Movie Header */}
            <div className="relative">
              <span className="absolute right-0 top-0 text-[120px] leading-none font-display font-bold select-none pointer-events-none opacity-[0.03] translate-y-[-20px]">🎬</span>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-6 pb-2">
                <div>
                  <span className="eyebrow">多源聚合</span>
                  <h2 className="text-4xl sm:text-5xl font-display font-bold leading-tight tracking-[-0.03em] italic mt-2" style={{ color: isLight ? '#2c1f14' : '#f0e6d6' }}>
                    <CharReveal text="全网电影免费看" stagger={50} delay={100} />
                  </h2>
                  <p className="text-sm mt-3 max-w-xs" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.6)' }}>多源聚合，稳定播放，支持多清晰度切换</p>
                </div>
                <div className="flex items-center gap-2 pb-1">
                  {/* 片源切换器 */}
                  {movieSources.length > 0 && (
                    <MovieSourceSwitcher
                      sources={movieSources.filter(s => hiddenSourceRevealed || s.name !== 'modu')}
                      currentSource={movieSource}
                      onSourceChange={handleMovieSourceChange}
                      loading={movieLoading}
                    />
                  )}
                  {!movieShowSearch && !selectedMovie && (
                    <button
                      onClick={() => setMovieShowSearch(true)}
                      className="group px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                      style={{
                        background: 'linear-gradient(135deg, #e8a849, #d4943a)',
                        color: '#0c0907',
                        boxShadow: '0 4px 20px rgba(232,168,73,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
                      }}
                    >
                      搜索电影
                      <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Search View */}
            {movieShowSearch && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMovieBackFromSearch}
                    className="text-sm font-medium transition-colors flex items-center gap-1.5"
                    style={{ color: isLight ? '#8b6914' : '#e8a849' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    返回
                  </button>
                </div>
                <MovieSearch onSearch={handleMovieSearch} loading={movieSearchLoading} />

                {movieSearchLoading && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary"></div>
                    <p className="mt-3 text-sm" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.6)' }}>搜索中...</p>
                  </div>
                )}

                {!movieSearchLoading && movieSearchResults.length > 0 && (
                  <MovieGrid movies={movieSearchResults} onMovieClick={handleMovieClick} title="搜索结果" />
                )}

                {!movieSearchLoading && movieSearchResults.length === 0 && movieShowSearch && (
                  <div className="text-center py-16" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.6)' }}>
                    <div className="text-4xl mb-3 opacity-30">🔍</div>
                    <p className="text-sm">输入电影名开始搜索</p>
                  </div>
                )}
              </div>
            )}

            {/* Movie Detail View */}
            {selectedMovie && !movieShowSearch && (
              <MovieDetailComponent
                movie={selectedMovie}
                videoSources={movieVideoSources}
                onBack={handleMovieBack}
                onMovieClick={handleMovieClick}
                sourceLabel={movieSourceLabel}
              />
            )}

            {/* Movie Detail Loading */}
            {movieDetailLoading && (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary/30 border-t-primary"></div>
                <p className="mt-4 text-sm" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.6)' }}>加载电影详情中...</p>
              </div>
            )}

            {/* Home View - Recommend Movies */}
            {!movieShowSearch && !selectedMovie && !movieDetailLoading && (
              <>
                {/* 当前片源显示 */}
                {movieSourceLabel && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{
                      background: isLight ? 'rgba(74,222,128,0.1)' : 'rgba(74,222,128,0.08)',
                      color: isLight ? '#16a34a' : '#4ade80',
                      border: isLight ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(74,222,128,0.15)',
                    }}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: '#4ade80' }} />
                      数据来源: {movieSourceLabel}
                    </span>
                  </div>
                )}

                {/* Category Tabs */}
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.5)' }}>分类浏览</h3>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                      { key: 'popular' as MovieCategory, label: '🔥 热门', icon: '🔥' },
                      { key: 'top_rated' as MovieCategory, label: '⭐ 高分', icon: '⭐' },
                      { key: 'now_playing' as MovieCategory, label: '😂 喜剧', icon: '😂' },
                      { key: 'upcoming' as MovieCategory, label: '🚀 科幻', icon: '🚀' },
                      { key: 'trending' as MovieCategory, label: '💕 爱情', icon: '💕' },
                    ].map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => handleMovieCategoryChange(cat.key)}
                        className="px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 hover:scale-[1.05] active:scale-[0.95]"
                        style={movieCategory === cat.key ? {
                          background: 'linear-gradient(135deg, #e8a849, #d4943a)',
                          color: '#0c0907',
                          boxShadow: '0 4px 15px rgba(232,168,73,0.3)',
                        } : {
                          background: isLight ? 'rgba(180,150,100,0.1)' : 'rgba(255,255,255,0.06)',
                          color: isLight ? '#5a4a3a' : 'rgba(210,180,140,0.7)',
                          border: isLight ? '1px solid rgba(180,150,100,0.15)' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {movieLoading && (
                  <MovieSkeleton count={12} />
                )}

                {!movieLoading && recommendMovies.length > 0 && (
                  <MovieGrid movies={recommendMovies} onMovieClick={handleMovieClick} />
                )}

                {!movieLoading && recommendMovies.length === 0 && (
                  <div className="text-center py-16" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.6)' }}>
                    <div className="text-4xl mb-3 opacity-30">🎬</div>
                    <p className="text-sm">暂无推荐电影</p>
                    <button
                      onClick={() => loadRecommendMovies()}
                      className="mt-4 text-sm font-medium transition-colors"
                      style={{ color: isLight ? '#8b6914' : '#e8a849' }}
                    >
                      重新加载
                    </button>
                  </div>
                )}

                {/* Load More */}
                {!movieLoading && recommendMovies.length > 0 && moviePage < movieTotalPages && (
                  <div className="text-center pt-4 pb-8">
                    <button
                      onClick={handleLoadMoreMovies}
                      className="px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: isLight ? 'rgba(139,105,20,0.08)' : 'rgba(255,255,255,0.04)',
                        border: isLight ? '1px solid rgba(139,105,20,0.15)' : '1px solid rgba(255,255,255,0.06)',
                        color: isLight ? '#8b6914' : '#e8a849',
                      }}
                    >
                      {movieLoading ? '加载中...' : '加载更多'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      case 'image-download':
        return <ImageDownload />;
      case 'music-listen':
        return (
          <div className="space-y-8 animate-fade-in">
            {/* Music Header */}
            <div className="relative overflow-hidden">
              {/* 装饰大字符 */}
              <span className="absolute right-0 top-0 text-[120px] leading-none font-display font-bold select-none pointer-events-none opacity-[0.03] translate-y-[-20px]">♪</span>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-6 pb-2">
                <div>
                  <span className="eyebrow">多源聚合</span>
                  <h2 className="text-4xl sm:text-5xl font-display font-bold text-obsidian-50 leading-tight tracking-[-0.03em] italic mt-2">
                    <CharReveal text="全网歌曲免费听" stagger={50} delay={100} />
                  </h2>
                  <p className="text-sm text-obsidian-100 mt-3 max-w-xs">多源聚合，畅听无阻，支持歌词同步</p>
                </div>
                <div className="flex items-center gap-2 pb-1">
                  {!showSearch && !selectedPlaylist && (
                    <button
                      onClick={() => setShowSearch(true)}
                      className="group px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                      style={{
                        background: 'linear-gradient(135deg, #e8a849, #d4943a)',
                        color: '#0c0907',
                        boxShadow: '0 4px 20px rgba(232,168,73,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
                      }}
                    >
                      搜索歌曲
                      <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowMusicSettings(!showMusicSettings)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                    title="网易云登录设置"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                </div>
              </div>
            </div>

            {/* Music Settings - MUSIC_U Cookie */}
            {showMusicSettings && (
              <div className="bg-surface rounded-2xl p-5 border border-white/[0.06] animate-scale-in">
                <h3 className="text-sm font-semibold text-obsidian-50 mb-2">网易云音乐登录设置</h3>
                <p className="text-xs text-obsidian-100 mb-4 leading-relaxed">
                  设置 MUSIC_U Cookie 可解锁VIP歌曲。请从网易云音乐网页版获取 Cookie 中的 MUSIC_U 值。
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={musicUInput}
                    onChange={(e) => setMusicUInput(e.target.value)}
                    placeholder="粘贴 MUSIC_U Cookie 值"
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveMusicU}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-primary text-obsidian-700 text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setShowMusicSettings(false)}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-surface-elevated text-obsidian-100 text-sm rounded-xl border border-white/[0.06] hover:text-obsidian-50 hover:bg-surface-hover transition-all"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search View */}
            {showSearch && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBackFromSearch}
                    className="text-primary hover:text-primary-hover flex items-center gap-1.5 text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    返回
                  </button>
                </div>
                <MusicSearch onSearch={handleMusicSearch} loading={searchLoading} />

                {searchLoading && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary"></div>
                    <p className="mt-3 text-obsidian-100 text-sm">搜索中...</p>
                  </div>
                )}

                {!searchLoading && songs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-display font-semibold mb-3 text-obsidian-50">歌曲</h3>
                    <MusicList songs={songs} onPlay={handlePlaySong} currentSong={currentSong} onPlayNext={handleAddPlayNext} />
                  </div>
                )}

                {!searchLoading && searchPlaylistsResult.length > 0 && (
                  <div>
                    <h3 className="text-lg font-display font-semibold mb-3 text-obsidian-50">歌单</h3>
                    <PlaylistGrid playlists={searchPlaylistsResult} onPlaylistClick={handlePlaylistClick} />
                  </div>
                )}
              </div>
            )}

            {/* Playlist Detail View */}
            {selectedPlaylist && !showSearch && (
              <PlaylistDetail
                name={selectedPlaylist.name}
                cover={selectedPlaylist.cover}
                tracks={selectedPlaylist.tracks}
                onPlay={handlePlaySong}
                onPlayAll={handlePlayAll}
                onPlayNext={handleAddPlayNext}
                currentSong={currentSong}
                onBack={() => setSelectedPlaylist(null)}
              />
            )}

            {/* Home View - Recommend Playlists */}
            {!showSearch && !selectedPlaylist && (
              <>
                {playlistLoading && (
                  <PlaylistSkeleton count={10} />
                )}

                {!playlistLoading && recommendPlaylists.length > 0 && (
                  <div>
                    <h3 className="text-lg font-display font-semibold mb-4 text-obsidian-50">推荐歌单</h3>
                    <PlaylistGrid playlists={recommendPlaylists} onPlaylistClick={handlePlaylistClick} />
                  </div>
                )}

                {!playlistLoading && recommendPlaylists.length === 0 && (
                  <div className="text-center py-16 text-obsidian-100">
                    <div className="text-4xl mb-3 opacity-30">♪</div>
                    <p className="text-sm">暂无推荐歌单</p>
                    <button
                      onClick={loadRecommendPlaylists}
                      className="mt-4 text-primary hover:text-primary-hover text-sm font-medium transition-colors"
                    >
                      重新加载
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      case 'music-backup':
        return (
          <div className="space-y-6 animate-fade-in">
            <MusicBoxEmbed />
          </div>
        );
      case 'novel-reader':
        return <NovelReader onSidebarCollapse={setSidebarCollapsed} sidebarCollapsed={sidebarCollapsed} playlist={playQueue} currentSong={currentSong} />;
      case 'parse-channel-config':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-display font-bold text-obsidian-50">解析通道配置</h2>
              <p className="text-sm text-obsidian-100 mt-1">管理自定义音乐 API 通道</p>
            </div>
            <ParseChannelConfig />
          </div>
        );
      case 'api-tester':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-display font-bold text-obsidian-50">API 测试工具</h2>
              <p className="text-sm text-obsidian-100 mt-1">调试和测试音乐 API 端点</p>
            </div>
            <ApiTester />
          </div>
        );
      case 'about':
        return <AboutPage />;
      case 'settings':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-display font-bold text-obsidian-50">设置</h2>
              <p className="text-sm text-obsidian-100 mt-1">应用外观与偏好设置</p>
            </div>
            <div className="bg-surface rounded-2xl p-5 border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-obsidian-50 mb-4">外观设置</h3>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] transition-all duration-200"
              >
                <span className="text-lg">{theme === 'dark' ? '🌙' : '☀️'}</span>
                <span className="text-sm text-obsidian-50 flex-1 text-left">
                  {theme === 'dark' ? '深色模式' : '浅色模式'}
                </span>
                <div
                  className={`w-9 h-5 rounded-full transition-all duration-300 relative ${
                    theme === 'dark' ? 'bg-primary' : ''
                  }`}
                  style={theme === 'light' ? { background: 'rgba(180,150,100,0.25)' } : {}}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                    theme === 'dark' ? 'left-[18px]' : 'left-0.5'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        );
      case 'format-convert':
      default:
        return (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="relative overflow-hidden mb-10 pt-6 pb-2">
              <span className="absolute right-0 top-0 text-[120px] leading-none font-display font-bold select-none pointer-events-none opacity-[0.03] translate-y-[-10px]">⇄</span>
              <span className="eyebrow">在线工具</span>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-obsidian-50 mb-3 mt-2 leading-tight tracking-[-0.03em] italic">
                <CharReveal text="文档格式转换" stagger={55} delay={80} />
              </h1>
              <p className="text-obsidian-100 text-sm max-w-xs">上传 DOCX 或 PDF 文件，在线预览并转换格式</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <FileUpload onFileSelect={handleFileSelect} disabled={state.status === 'converting'} />

              {state.file && (
                <div className="animate-slide-up">
                  <FilePreview file={state.file} previewHtml={state.previewHtml} />
                </div>
              )}

              {state.file && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slide-up">
                  <ConvertButton
                    direction="docx-to-pdf"
                    onClick={() => handleConvert('docx-to-pdf')}
                    disabled={!state.file || state.status !== 'idle'}
                    loading={state.status === 'converting'}
                  />
                  <ConvertButton
                    direction="pdf-to-docx"
                    onClick={() => handleConvert('pdf-to-docx')}
                    disabled={!state.file || state.status !== 'idle'}
                    loading={state.status === 'converting'}
                  />
                </div>
              )}

              <StatusBar status={state.status} errorMessage={state.errorMessage} />
            </div>
          </div>
        );
    }
  };

  // Stable callbacks for PlayerPage to avoid re-renders
  const handlePlayerPrev = useCallback(() => {
    const idx = currentIndex > 0 ? currentIndex - 1 : playQueue.length - 1;
    if (idx >= 0) handlePlayIndex(idx);
  }, [currentIndex, playQueue, handlePlayIndex]);

  const handlePlayerNext = useCallback(() => {
    const idx = currentIndex < playQueue.length - 1 ? currentIndex + 1 : 0;
    if (idx >= 0) handlePlayIndex(idx);
  }, [currentIndex, playQueue, handlePlayIndex]);

  const handleCycleMode = useCallback(() => {
    const modes: typeof playMode[] = ['sequential', 'shuffle', 'loop', 'single'];
    setPlayMode(modes[(modes.indexOf(playMode) + 1) % modes.length]);
  }, [playMode]);

  const handleOpenPlayerPage = useCallback(() => setShowPlayerPage(true), []);
  const handleClosePlayerPage = useCallback(() => setShowPlayerPage(false), []);

  return (
    <div className="flex min-h-screen relative">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/[0.02] rounded-full blur-[100px]" />
      </div>

      <Sidebar activeItem={activeItem} onItemClick={handleSidebarItemClick} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <main className={`flex-1 p-4 md:p-8 pt-14 md:pt-8 pb-36 relative z-10 overflow-x-hidden transition-all duration-300 ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>
        {/* Mobile hamburger button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 w-10 h-10 rounded-xl bg-surface/80 backdrop-blur-xl border border-white/[0.06] flex items-center justify-center text-obsidian-100 hover:text-primary transition-all md:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div
          key={activeItem}
          className="page-transition-enter-active"
          style={{ animation: 'pageEnter 0.35s cubic-bezier(0.32,0.72,0,1) both' }}
        >
          {renderContent()}
        </div>
      </main>

      {/* Player Page */}
      {showPlayerPage && currentSong && (
        <PlayerPage
          song={currentSong}
          isPlaying={playerState.isPlaying}
          currentTime={playerState.currentTime}
          duration={playerState.duration}
          playMode={playMode}
          onTogglePlay={playerState.togglePlay}
          onPrev={handlePlayerPrev}
          onNext={handlePlayerNext}
          onCycleMode={handleCycleMode}
          onSeek={playerState.seek}
          onClose={handleClosePlayerPage}
        />
      )}

      {/* Global Music Player - Fixed at bottom, always rendered */}
      {currentSong && (
        <MusicPlayer
          song={currentSong}
          playUrl={playUrl}
          loading={musicLoading}
          playlist={playQueue}
          currentIndex={currentIndex}
          onPlayIndex={handlePlayIndex}
          playMode={playMode}
          onPlayModeChange={setPlayMode}
          onOpenPlayerPage={handleOpenPlayerPage}
          onStateChange={setPlayerState}
          currentQuality={currentQuality}
          onQualityChange={handleQualityChange}
        />
      )}
    </div>
  );
}
