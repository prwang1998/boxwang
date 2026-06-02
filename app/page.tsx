'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { previewDocx, convertDocxToPdf } from '@/lib/docx-to-pdf';
import { previewPdf, convertPdfToDocx } from '@/lib/pdf-to-docx';
import { isDocxFile, isPdfFile, downloadBlob } from '@/lib/file-utils';
import { getRecommendPlaylists, getPlaylistDetail, searchPlaylists } from '@/lib/musicbox';
import { FileInfo, FileStatus, ConvertState, Song, PlayUrl, Playlist } from '@/types';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
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

  const fetchPlayUrl = async (song: Song): Promise<PlayUrl | null> => {
    try {
      const response = await fetch(`/api/music/url?id=${song.id}&source=${song.source}`);
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
      case 'image-download':
        return <ImageDownload />;
      case 'music-listen':
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Music Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-obsidian-50">全网歌曲免费听</h2>
                <p className="text-sm text-obsidian-100 mt-1">多源聚合，畅听无阻</p>
              </div>
              <div className="flex items-center gap-2">
                {!showSearch && !selectedPlaylist && (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="px-4 py-2.5 bg-primary/15 text-primary border border-primary/20 rounded-xl hover:bg-primary/25 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    搜索歌曲
                  </button>
                )}
                <button
                  onClick={() => setShowMusicSettings(!showMusicSettings)}
                  className="w-10 h-10 rounded-xl bg-surface-elevated border border-white/[0.06] text-obsidian-100 hover:text-primary hover:border-primary/20 transition-all duration-200 flex items-center justify-center"
                  title="网易云登录设置"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
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
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary"></div>
                    <p className="mt-3 text-obsidian-100 text-sm">加载推荐歌单...</p>
                  </div>
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
        return <NovelReader onSidebarCollapse={setSidebarCollapsed} playlist={playQueue} currentSong={currentSong} />;
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
            <div className="mb-10">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-obsidian-50 mb-2">
                文档格式转换
              </h1>
              <p className="text-obsidian-100 text-sm">上传 DOCX 或 PDF 文件，在线预览并转换格式</p>
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

      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <main className={`flex-1 p-4 md:p-8 pt-14 md:pt-8 pb-24 relative z-10 overflow-x-hidden transition-all duration-300 ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>
        {/* Mobile hamburger button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 w-10 h-10 rounded-xl bg-surface/80 backdrop-blur-xl border border-white/[0.06] flex items-center justify-center text-obsidian-100 hover:text-primary transition-all md:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {renderContent()}
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
        />
      )}
    </div>
  );
}
