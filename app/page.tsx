'use client';

import { useState, useEffect } from 'react';
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
import { previewDocx, convertDocxToPdf } from '@/lib/docx-to-pdf';
import { previewPdf, convertPdfToDocx } from '@/lib/pdf-to-docx';
import { isDocxFile, isPdfFile, downloadBlob } from '@/lib/file-utils';
import { getRecommendPlaylists, getPlaylistDetail, searchPlaylists } from '@/lib/musicbox';
import { FileInfo, FileStatus, ConvertState, Song, PlayUrl, Playlist } from '@/types';

export default function Home() {
  const [activeItem, setActiveItem] = useState('format-convert');
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
      alert(error.message || '搜索失败');
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
      alert(error.message || '获取播放链接失败');
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

  const handlePlayIndex = async (index: number) => {
    if (index < 0 || index >= playQueue.length) return;
    setCurrentIndex(index);
    const song = playQueue[index];
    setCurrentSong(song);
    setMusicLoading(true);
    const url = await fetchPlayUrl(song);
    if (url) setPlayUrl(url);
    setMusicLoading(false);
  };

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
        alert('获取歌单详情失败');
      }
    } catch (error) {
      alert('获取歌单详情失败');
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">全网歌曲免费听</h2>
              <div className="flex items-center gap-2">
                {!showSearch && !selectedPlaylist && (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    搜索歌曲
                  </button>
                )}
                <button
                  onClick={() => setShowMusicSettings(!showMusicSettings)}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title="网易云登录设置"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Music Settings - MUSIC_U Cookie */}
            {showMusicSettings && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold mb-2">网易云音乐登录设置</h3>
                <p className="text-xs text-gray-500 mb-3">
                  设置 MUSIC_U Cookie 可解锁VIP歌曲。请从网易云音乐网页版获取 Cookie 中的 MUSIC_U 值。
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={musicUInput}
                    onChange={(e) => setMusicUInput(e.target.value)}
                    placeholder="粘贴 MUSIC_U Cookie 值"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleSaveMusicU}
                    className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setShowMusicSettings(false)}
                    className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* Search View */}
            {showSearch && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBackFromSearch}
                    className="text-primary hover:text-blue-600 flex items-center gap-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    返回
                  </button>
                </div>
                <MusicSearch onSearch={handleMusicSearch} loading={searchLoading} />

                {searchLoading && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-gray-500">搜索中...</p>
                  </div>
                )}

                {!searchLoading && songs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">歌曲</h3>
                    <MusicList songs={songs} onPlay={handlePlaySong} currentSong={currentSong} onPlayNext={handleAddPlayNext} />
                  </div>
                )}

                {!searchLoading && searchPlaylistsResult.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">歌单</h3>
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
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-gray-500">加载推荐歌单...</p>
                  </div>
                )}

                {!playlistLoading && recommendPlaylists.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">推荐歌单</h3>
                    <PlaylistGrid playlists={recommendPlaylists} onPlaylistClick={handlePlaylistClick} />
                  </div>
                )}

                {!playlistLoading && recommendPlaylists.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p>暂无推荐歌单</p>
                    <button
                      onClick={loadRecommendPlaylists}
                      className="mt-4 text-primary hover:text-blue-600"
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
          <div className="space-y-6">
            <MusicBoxEmbed />
          </div>
        );
      case 'parse-channel-config':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">解析通道配置</h2>
            <ParseChannelConfig />
          </div>
        );
      case 'api-tester':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">API 测试工具</h2>
            <ApiTester />
          </div>
        );
      case 'format-convert':
      default:
        return (
          <>
            <h1 className="text-3xl font-bold mb-8">文档格式转换</h1>

            <div className="max-w-4xl mx-auto space-y-6">
              <FileUpload onFileSelect={handleFileSelect} disabled={state.status === 'converting'} />

              {state.file && (
                <FilePreview file={state.file} previewHtml={state.previewHtml} />
              )}

              {state.file && (
                <div className="flex gap-4 justify-center">
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
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
      <main className="flex-1 p-8 pb-24">
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
          onPrev={() => {
            const idx = currentIndex > 0 ? currentIndex - 1 : playQueue.length - 1;
            if (idx >= 0) handlePlayIndex(idx);
          }}
          onNext={() => {
            const idx = currentIndex < playQueue.length - 1 ? currentIndex + 1 : 0;
            if (idx >= 0) handlePlayIndex(idx);
          }}
          onCycleMode={() => {
            const modes: typeof playMode[] = ['sequential', 'shuffle', 'loop', 'single'];
            setPlayMode(modes[(modes.indexOf(playMode) + 1) % modes.length]);
          }}
          onSeek={(time) => playerState.seek(time)}
          onClose={() => setShowPlayerPage(false)}
        />
      )}

      {/* Global Music Player - Fixed at bottom */}
      {currentSong && activeItem === 'music-listen' && (
        <MusicPlayer
          song={currentSong}
          playUrl={playUrl}
          loading={musicLoading}
          playlist={playQueue}
          currentIndex={currentIndex}
          onPlayIndex={handlePlayIndex}
          playMode={playMode}
          onPlayModeChange={setPlayMode}
          onOpenPlayerPage={() => setShowPlayerPage(true)}
          onStateChange={setPlayerState}
        />
      )}
    </div>
  );
}
