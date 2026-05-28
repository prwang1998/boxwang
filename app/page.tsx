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
import MusicPlayer from '@/components/MusicPlayer';
import PlaylistGrid from '@/components/PlaylistGrid';
import PlaylistDetail from '@/components/PlaylistDetail';
import MusicBoxEmbed from '@/components/MusicBoxEmbed';
import ParseChannelConfig from '@/components/ParseChannelConfig';
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

  // Playlist state
  const [recommendPlaylists, setRecommendPlaylists] = useState<Playlist[]>([]);
  const [searchPlaylistsResult, setSearchPlaylistsResult] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<{
    name: string;
    cover: string;
    tracks: Song[];
  } | null>(null);
  const [playlistLoading, setPlaylistLoading] = useState(false);

  // Load recommend playlists
  useEffect(() => {
    if (activeItem === 'music-listen' && !selectedPlaylist) {
      loadRecommendPlaylists();
    }
  }, [activeItem]);

  const loadRecommendPlaylists = async () => {
    setPlaylistLoading(true);
    try {
      const playlists = await getRecommendPlaylists(30);
      setRecommendPlaylists(playlists);
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
      // Search songs
      const response = await fetch(`/api/music/search?keyword=${encodeURIComponent(keyword)}&source=${source}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '搜索失败');
      }

      setSongs(data.songs || []);

      // Also search playlists
      const playlists = await searchPlaylists(keyword);
      setSearchPlaylistsResult(playlists);
    } catch (error: any) {
      alert(error.message || '搜索失败');
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePlaySong = async (song: Song) => {
    setCurrentSong(song);
    setMusicLoading(true);
    try {
      const response = await fetch(`/api/music/url?id=${song.id}&source=${song.source}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取播放链接失败');
      }

      setPlayUrl(data);
    } catch (error: any) {
      alert(error.message || '获取播放链接失败');
    } finally {
      setMusicLoading(false);
    }
  };

  const handlePlaylistClick = async (playlist: Playlist) => {
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

  const renderContent = () => {
    switch (activeItem) {
      case 'image-download':
        return <ImageDownload />;
      case 'music-listen':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">全网歌曲免费听</h2>
            <MusicSearch onSearch={handleMusicSearch} loading={searchLoading} />

            {playlistLoading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-gray-500">加载中...</p>
              </div>
            )}

            {selectedPlaylist ? (
              <PlaylistDetail
                name={selectedPlaylist.name}
                cover={selectedPlaylist.cover}
                tracks={selectedPlaylist.tracks}
                onPlay={handlePlaySong}
                currentSong={currentSong}
                onBack={() => setSelectedPlaylist(null)}
              />
            ) : (
              <>
                {/* Search Results */}
                {songs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">歌曲</h3>
                    <MusicList songs={songs} onPlay={handlePlaySong} currentSong={currentSong} />
                  </div>
                )}

                {/* Search Playlist Results */}
                {searchPlaylistsResult.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">歌单</h3>
                    <PlaylistGrid playlists={searchPlaylistsResult} onPlaylistClick={handlePlaylistClick} />
                  </div>
                )}

                {/* Recommend Playlists */}
                {songs.length === 0 && searchPlaylistsResult.length === 0 && !searchLoading && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">推荐歌单</h3>
                    <PlaylistGrid playlists={recommendPlaylists} onPlaylistClick={handlePlaylistClick} />
                  </div>
                )}
              </>
            )}

            {currentSong && (
              <MusicPlayer song={currentSong} playUrl={playUrl} loading={musicLoading} />
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
      <main className="flex-1 p-8 pb-32">
        {renderContent()}
      </main>
    </div>
  );
}
