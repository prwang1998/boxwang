'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Song } from '@/types/music';
import { useTheme } from '@/app/theme-context';
import { NovelSource } from '@/lib/novel-sources';

// 精美冒热气咖啡组件 — 可拖动
function FloatingCoffee() {
  const [isHovered, setIsHovered] = useState(false);

  // 拖动状态
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // 拖动处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setPosition({
          x: dragStartRef.current.posX + dx,
          y: dragStartRef.current.posY + dy,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  }, [position]);

  return (
    <div
      className="fixed z-50 select-none"
      style={{
        right: `calc(1.5rem - ${position.x}px)`,
        bottom: `calc(6rem - ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        animation: isDragging ? 'none' : 'coffeeFloat 4s ease-in-out infinite',
        filter: isHovered ? 'drop-shadow(0 0 16px rgba(139, 90, 43, 0.5))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
        transition: 'filter 0.3s ease',
      }}>
        <svg width="80" height="90" viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 热气 - 增强效果 */}
          <g>
            <path d="M30 22C30 22 27 14 31 9C35 4 29 -1 29 -1" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <animate attributeName="d" values="M30 22C30 22 27 14 31 9C35 4 29 -1 29 -1;M30 22C30 22 33 16 29 11C25 6 31 1 31 1;M30 22C30 22 27 14 31 9C35 4 29 -1 29 -1" dur="2.8s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.8s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="translate" values="0,0;-2,-4;0,0" dur="2.8s" repeatCount="indefinite"/>
            </path>
          </g>
          <g>
            <path d="M40 20C40 20 37 11 41 6C45 1 39 -4 39 -4" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" fill="none">
              <animate attributeName="d" values="M40 20C40 20 37 11 41 6C45 1 39 -4 39 -4;M40 20C40 20 43 13 39 8C35 3 41 -2 41 -2;M40 20C40 20 37 11 41 6C45 1 39 -4 39 -4" dur="3.2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.45;0.12;0.45" dur="3.2s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="translate" values="0,0;2,-5;0,0" dur="3.2s" repeatCount="indefinite"/>
            </path>
          </g>
          <g>
            <path d="M50 22C50 22 47 14 51 9C55 4 49 -1 49 -1" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <animate attributeName="d" values="M50 22C50 22 47 14 51 9C55 4 49 -1 49 -1;M50 22C50 22 53 16 49 11C45 6 51 1 51 1;M50 22C50 22 47 14 51 9C55 4 49 -1 49 -1" dur="3.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.35;0.08;0.35" dur="3.5s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="translate" values="0,0;-1,-4;0,0" dur="3.5s" repeatCount="indefinite"/>
            </path>
          </g>
          {/* 额外热气线条 */}
          <g>
            <path d="M35 24C35 24 33 16 36 11C39 6 34 1 34 1" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" fill="none">
              <animate attributeName="d" values="M35 24C35 24 33 16 36 11C39 6 34 1 34 1;M35 24C35 24 37 18 34 13C31 8 36 3 36 3;M35 24C35 24 33 16 36 11C39 6 34 1 34 1" dur="4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.3;0.05;0.3" dur="4s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="translate" values="0,0;1,-3;0,0" dur="4s" repeatCount="indefinite"/>
            </path>
          </g>
          <g>
            <path d="M45 23C45 23 43 15 46 10C49 5 44 0 44 0" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" fill="none">
              <animate attributeName="d" values="M45 23C45 23 43 15 46 10C49 5 44 0 44 0;M45 23C45 24 47 17 44 12C41 7 46 2 46 2;M45 23C45 23 43 15 46 10C49 5 44 0 44 0" dur="3.8s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.28;0.06;0.28" dur="3.8s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="translate" values="0,0;-1,-4;0,0" dur="3.8s" repeatCount="indefinite"/>
            </path>
          </g>

          {/* 杯碟 */}
          <ellipse cx="40" cy="82" rx="32" ry="6" fill="#8B6914"/>
          <ellipse cx="40" cy="81" rx="30" ry="5" fill="#A0782C"/>
          <ellipse cx="40" cy="80" rx="28" ry="4" fill="#B8860B"/>
          {/* 碟子高光 */}
          <ellipse cx="35" cy="79" rx="12" ry="2" fill="rgba(255,255,255,0.15)"/>

          {/* 杯身 */}
          <path d="M18 35C18 35 16 70 20 76C24 82 56 82 60 76C64 70 62 35 62 35" fill="#F5F5DC"/>
          <path d="M20 35C20 35 18 68 22 74C26 80 54 80 58 74C62 68 60 35 60 35" fill="#FFFAF0"/>

          {/* 杯身阴影 */}
          <path d="M22 40C22 40 20 65 24 72C28 78 52 78 56 72C60 65 58 40 58 40" fill="rgba(139,105,20,0.1)"/>

          {/* 杯身光泽 */}
          <path d="M25 38C25 38 24 55 26 62" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>

          {/* 咖啡液面 */}
          <ellipse cx="40" cy="38" rx="21" ry="8" fill="#3E2723"/>
          <ellipse cx="40" cy="37" rx="19" ry="7" fill="#4E342E"/>
          {/* 咖啡高光 */}
          <ellipse cx="36" cy="36" rx="8" ry="3" fill="rgba(255,255,255,0.1)"/>

          {/* 拉花 */}
          <path d="M35 37C35 37 38 34 40 37C42 34 45 37 45 37" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M37 39C37 39 39 37 40 39C41 37 43 39 43 39" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" fill="none"/>

          {/* 杯把手 */}
          <path d="M62 42C62 42 72 44 74 52C76 60 72 66 62 66" stroke="#F5F5DC" strokeWidth="5" strokeLinecap="round" fill="none"/>
          <path d="M62 44C62 44 70 46 72 52C74 58 70 64 62 64" stroke="#FFFAF0" strokeWidth="3" strokeLinecap="round" fill="none"/>

          {/* 杯口 */}
          <ellipse cx="40" cy="35" rx="22" ry="8" fill="none" stroke="#E8D5B7" strokeWidth="2"/>
          <ellipse cx="40" cy="34" rx="21" ry="7" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
        </svg>

        {/* 悬浮提示 */}
        {isHovered && !isDragging && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/40 whitespace-nowrap"
            style={{ animation: 'popIn 0.3s ease-out' }}
          >
            ☕ 拖动我
          </div>
        )}
      </div>

      {/* 动画样式 */}
      <style jsx>{`
        @keyframes coffeeFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes steamRise {
          0% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-8px); opacity: 0.1; }
          100% { transform: translateY(0); opacity: 0.3; }
        }
        @keyframes popIn {
          0% { transform: translate(-50%, 10px) scale(0.5); opacity: 0; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
function FloatingCharacter() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [blink, setBlink] = useState(false);
  const [bounce, setBounce] = useState(false);
  const characterRef = useRef<HTMLDivElement>(null);
  const reactionTimeoutRef = useRef<NodeJS.Timeout>();

  // 拖动状态
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // 跟踪鼠标位置
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setPosition({
          x: dragStartRef.current.posX + dx,
          y: dragStartRef.current.posY + dy,
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setBounce(true);
        setTimeout(() => setBounce(false), 300);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // 随机眨眼动画
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // 计算眼睛朝向
  const getEyePosition = useCallback(() => {
    if (!characterRef.current) return { leftX: 0, leftY: 0, rightX: 0, rightY: 0 };
    const rect = characterRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height * 0.32;

    const angle = Math.atan2(mousePos.y - centerY, mousePos.x - centerX);
    const distance = Math.min(2.5, Math.hypot(mousePos.x - centerX, mousePos.y - centerY) / 60);

    return {
      leftX: Math.cos(angle) * distance,
      leftY: Math.sin(angle) * distance,
      rightX: Math.cos(angle) * distance,
      rightY: Math.sin(angle) * distance,
    };
  }, [mousePos]);

  const eyePos = getEyePosition();

  // 拖动开始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  }, [position]);

  // 鼠标悬停反应
  const handleMouseEnter = useCallback(() => {
    if (isDragging) return;
    setIsHovered(true);
    const reactions = ['wink', 'blush', 'wave', 'heart', 'sparkle'];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    setReaction(randomReaction);
    if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    reactionTimeoutRef.current = setTimeout(() => setReaction(null), 2000);
  }, [isDragging]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={characterRef}
      className="fixed z-50 select-none"
      style={{
        right: `calc(1.5rem - ${position.x}px)`,
        bottom: `calc(6rem - ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        animation: bounce ? 'charBounce 0.3s ease-out' : isDragging ? 'none' : 'charFloat 4s ease-in-out infinite',
        filter: isHovered ? 'drop-shadow(0 0 16px rgba(255,182,193,0.5))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
        transition: isDragging ? 'none' : 'filter 0.3s ease',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 反应气泡 */}
      {reaction && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap" style={{ animation: 'popIn 0.3s ease-out' }}>
          {reaction === 'wink' && <span className="text-2xl">😉</span>}
          {reaction === 'blush' && <span className="text-2xl">☺️</span>}
          {reaction === 'wave' && <span className="text-2xl">👋</span>}
          {reaction === 'heart' && <span className="text-2xl">💖</span>}
          {reaction === 'sparkle' && <span className="text-2xl">✨</span>}
        </div>
      )}

      {/* 日漫风格 SVG 角色 */}
      <svg width="80" height="110" viewBox="0 0 80 110" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* === 头发后层 === */}
        <path d="M16 32C16 32 10 50 12 68C14 86 20 92 20 92L26 86C26 86 22 70 22 52C22 34 28 26 40 26C52 26 58 34 58 52C58 70 54 86 54 86L60 92C60 92 66 86 68 68C70 50 64 32 64 32C64 22 54 10 40 10C26 10 16 22 16 32Z" fill="#5B2C8E"/>
        <path d="M18 34C18 34 12 52 14 68C16 84 22 88 22 88L28 82C28 82 24 68 24 52C24 36 30 28 40 28C50 28 56 36 56 52C56 68 52 82 52 82L58 88C58 88 64 84 66 68C68 52 62 34 62 34C62 24 52 12 40 12C28 12 18 24 18 34Z" fill="#7B3FA0"/>

        {/* === 头发前层（刘海） === */}
        <path d="M22 32C22 32 28 18 34 14C38 12 36 22 42 18C46 14 44 12 48 14C52 16 58 32 58 32" fill="#5B2C8E"/>
        <path d="M24 32C24 32 30 20 36 16C40 14 38 24 44 20C48 16 46 14 50 16C54 18 56 32 56 32" fill="#7B3FA0"/>

        {/* 刘海高光 */}
        <path d="M30 22C30 22 34 16 38 16" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M44 18C44 18 48 14 50 16" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>

        {/* === 脸 === */}
        <ellipse cx="40" cy="40" rx="18" ry="20" fill="#FFE4D6"/>

        {/* 脸部阴影 */}
        <ellipse cx="40" cy="42" rx="17" ry="18" fill="rgba(255,200,180,0.15)"/>

        {/* === 眼睛 === */}
        {/* 左眼 */}
        <ellipse cx="33" cy="38" rx="5.5" ry="6.5" fill="white"/>
        <ellipse cx={33 + eyePos.leftX} cy={38 + eyePos.leftY} rx="3.5" ry="4" fill="#9B30FF"/>
        <ellipse cx={33 + eyePos.leftX} cy={38 + eyePos.leftY} rx="2" ry="2.5" fill="#2C1810"/>
        {!blink && (
          <>
            <circle cx={34 + eyePos.leftX * 0.5} cy={36 + eyePos.leftY * 0.5} r="1.2" fill="white"/>
            <circle cx={31 + eyePos.leftX * 0.3} cy={39 + eyePos.leftY * 0.3} r="0.6" fill="white" opacity="0.6"/>
          </>
        )}
        {blink && <path d="M27 38C27 38 30 36 33 38C36 40 39 38 39 38" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round"/>}

        {/* 右眼 */}
        <ellipse cx="47" cy="38" rx="5.5" ry="6.5" fill="white"/>
        <ellipse cx={47 + eyePos.rightX} cy={38 + eyePos.rightY} rx="3.5" ry="4" fill="#9B30FF"/>
        <ellipse cx={47 + eyePos.rightX} cy={38 + eyePos.rightY} rx="2" ry="2.5" fill="#2C1810"/>
        {!blink && (
          <>
            <circle cx={48 + eyePos.rightX * 0.5} cy={36 + eyePos.rightY * 0.5} r="1.2" fill="white"/>
            <circle cx={45 + eyePos.rightX * 0.3} cy={39 + eyePos.rightY * 0.3} r="0.6" fill="white" opacity="0.6"/>
          </>
        )}
        {blink && <path d="M41 38C41 38 44 36 47 38C50 40 53 38 53 38" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round"/>}

        {/* 眉毛 */}
        <path d="M28 32C28 32 30 30 35 31" stroke="#4A2060" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M52 32C52 32 50 30 45 31" stroke="#4A2060" strokeWidth="1.2" strokeLinecap="round"/>

        {/* === 腮红 === */}
        <ellipse cx="26" cy="44" rx="4" ry="2.5" fill="#FFB6C1" opacity={isHovered ? "0.7" : "0.35"}>
          {isHovered && <animate attributeName="opacity" values="0.35;0.7;0.35" dur="1s" repeatCount="2"/>}
        </ellipse>
        <ellipse cx="54" cy="44" rx="4" ry="2.5" fill="#FFB6C1" opacity={isHovered ? "0.7" : "0.35"}>
          {isHovered && <animate attributeName="opacity" values="0.35;0.7;0.35" dur="1s" repeatCount="2"/>}
        </ellipse>

        {/* === 鼻子 === */}
        <ellipse cx="40" cy="43" rx="1" ry="0.8" fill="#F0C0B0"/>

        {/* === 嘴巴 === */}
        {reaction === 'sparkle' ? (
          <path d="M36 48C36 48 38 52 40 52C42 52 44 48 44 48" stroke="#FF6B8A" strokeWidth="1.5" fill="#FF6B8A" strokeLinecap="round"/>
        ) : reaction === 'wink' ? (
          <path d="M37 48C37 48 39 50 40 50C41 50 43 48 43 48" stroke="#FF6B8A" strokeWidth="1.5" strokeLinecap="round"/>
        ) : (
          <path d="M37 48C37 48 39 51 40 51C41 51 43 48 43 48" stroke="#FF6B8A" strokeWidth="1.5" strokeLinecap="round"/>
        )}

        {/* === 发饰（猫耳蝴蝶结） === */}
        <g transform="translate(56, 22)">
          <path d="M0 0C0 0 -4 -8 0 -12C4 -8 0 0 0 0Z" fill="#FF69B4" stroke="#FF1493" strokeWidth="0.5"/>
          <path d="M0 0C0 0 4 -8 8 -10C6 -6 0 0 0 0Z" fill="#FF69B4" stroke="#FF1493" strokeWidth="0.5"/>
          <circle cx="2" cy="-2" r="2" fill="#FF1493"/>
          {isHovered && <animate attributeName="transform" type="rotate" values="0 2 -2;5 2 -2;-5 2 -2;0 2 -2" dur="0.5s" repeatCount="2"/>}
        </g>

        {/* === 头发侧马尾 === */}
        <path d="M16 34C16 34 8 44 10 58C12 72 14 78 14 78L18 74C18 74 16 64 16 52C16 40 18 34 18 34" fill="#5B2C8E"/>
        <path d="M64 34C64 34 72 44 70 58C68 72 66 78 66 78L62 74C62 74 64 64 64 52C64 40 62 34 62 34" fill="#5B2C8E"/>

        {/* === 身体 === */}
        {/* 领子 */}
        <path d="M32 56L40 62L48 56" fill="white" stroke="#DDD" strokeWidth="0.5"/>

        {/* 上衣 */}
        <path d="M30 56C30 56 28 60 28 66L52 66C52 60 50 56 50 56C50 56 46 58 40 58C34 58 30 56 30 56Z" fill="#FF69B4"/>
        <path d="M32 56C32 56 30 60 30 66L50 66C50 60 48 56 48 56C48 56 46 58 40 58C34 58 32 56 32 56Z" fill="#FF85C2"/>

        {/* 蝴蝶结腰带 */}
        <path d="M36 64C36 64 38 62 40 64C42 62 44 64 44 64" fill="#FF1493"/>
        <circle cx="40" cy="64" r="1.5" fill="#FF1493"/>

        {/* 裙子 */}
        <path d="M28 66C28 66 24 74 22 84C20 94 20 98 20 98L60 98C60 98 60 94 58 84C56 74 52 66 52 66C52 66 48 68 40 68C32 68 28 66 28 66Z" fill="#FF69B4"/>
        <path d="M30 66C30 66 26 74 24 84C22 94 22 98 22 98L58 98C58 98 58 94 56 84C54 74 50 66 50 66C50 66 48 68 40 68C32 68 30 66 30 66Z" fill="#FF85C2"/>

        {/* 裙子褶皱 */}
        <path d="M26 78C26 78 32 76 40 76C48 76 54 78 54 78" stroke="#FF1493" strokeWidth="0.8" opacity="0.5"/>
        <path d="M24 86C24 86 32 84 40 84C48 84 56 86 56 86" stroke="#FF1493" strokeWidth="0.8" opacity="0.5"/>

        {/* === 手臂 === */}
        {reaction === 'wave' ? (
          <>
            <path d="M28 60C28 60 20 54 18 48" stroke="#FFE4D6" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="17" cy="47" r="2.5" fill="#FFE4D6"/>
          </>
        ) : (
          <path d="M28 60C28 60 24 68 22 76" stroke="#FFE4D6" strokeWidth="4" strokeLinecap="round"/>
        )}
        <path d="M52 60C52 60 56 68 58 76" stroke="#FFE4D6" strokeWidth="4" strokeLinecap="round"/>

        {/* === 腿部 === */}
        <rect x="34" y="96" width="4" height="10" rx="2" fill="#FFE4D6"/>
        <rect x="42" y="96" width="4" height="10" rx="2" fill="#FFE4D6"/>

        {/* 鞋子 */}
        <ellipse cx="36" cy="107" rx="4" ry="2" fill="#9B30FF"/>
        <ellipse cx="44" cy="107" rx="4" ry="2" fill="#9B30FF"/>
      </svg>

      {/* 拖动提示 */}
      {isHovered && !isDragging && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/40 whitespace-nowrap">
          拖动我~
        </div>
      )}

      {/* 动画样式 */}
      <style jsx>{`
        @keyframes charFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes charBounce {
          0% { transform: translateY(-5px); }
          50% { transform: translateY(3px); }
          100% { transform: translateY(0px); }
        }
        @keyframes popIn {
          0% { transform: translate(-50%, 10px) scale(0.5); opacity: 0; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

interface Book {
  id: string;
  name: string;
  author: string;
  cover: string;
  description: string;
  lastChapter: string;
  source: string;
  url: string;
}

interface Chapter {
  id: string;
  title: string;
  url: string;
}

interface NovelReaderProps {
  onSidebarCollapse?: (collapsed: boolean) => void;
  sidebarCollapsed?: boolean;
  playlist?: Song[];
  currentSong?: Song | null;
}

// 主题配置
const THEMES = {
  light: {
    name: '浅色',
    bg: '#faf8f5',
    bgGradient: 'linear-gradient(180deg, #faf8f5 0%, #f5f0e8 100%)',
    toolbarBg: 'rgba(250,248,245,0.95)',
    text: '#2c2418',
    textSecondary: '#6b5e4f',
    textMuted: '#9a8e7f',
    border: 'rgba(180,150,100,0.15)',
    cardBg: 'linear-gradient(135deg, #ffffff 0%, #fefdfb 50%, #faf8f5 100%)',
    cardBorder: 'rgba(180,150,100,0.2)',
    cardText: '#2c2418',
    cardTextSecondary: '#6b5e4f',
    cardAccent: '#8b6914',
    drawerBg: 'linear-gradient(180deg, #faf8f5 0%, #f5f0e8 100%)',
    drawerActive: 'rgba(139,105,20,0.08)',
    drawerActiveText: '#8b6914',
    drawerText: '#6b5e4f',
    chapterBg: 'rgba(255,255,255,0.95)',
    chapterBorder: 'rgba(180,150,100,0.15)',
    chapterText: '#2c2418',
    chapterHoverText: '#8b6914',
    btnPrimary: 'linear-gradient(135deg, #8b6914 0%, #a67c1a 100%)',
    btnPrimaryText: '#fff',
    btnSecondary: 'rgba(139,105,20,0.08)',
    btnSecondaryText: '#c8b898',
  },
  dark: {
    name: '黑金',
    bg: '#0a0a0a',
    bgGradient: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%)',
    toolbarBg: 'rgba(10,10,10,0.98)',
    text: '#f0c878',
    textSecondary: 'rgba(232, 168, 73, 0.6)',
    textMuted: 'rgba(232, 168, 73, 0.3)',
    border: 'rgba(232, 168, 73, 0.12)',
    cardBg: 'linear-gradient(135deg, #141414 0%, #1a1a1a 50%, #0f0f0f 100%)',
    cardBorder: 'rgba(232, 168, 73, 0.15)',
    cardText: '#f0c878',
    cardTextSecondary: 'rgba(232, 168, 73, 0.5)',
    cardAccent: '#e8a849',
    drawerBg: 'linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)',
    drawerActive: 'rgba(232, 168, 73, 0.1)',
    drawerActiveText: '#f0c878',
    drawerText: 'rgba(232, 168, 73, 0.5)',
    chapterBg: 'rgba(15,15,15,0.95)',
    chapterBorder: 'rgba(232, 168, 73, 0.1)',
    chapterText: 'rgba(232, 168, 73, 0.7)',
    chapterHoverText: '#f0c878',
    btnPrimary: 'linear-gradient(135deg, #e8a849 0%, #c07a2a 100%)',
    btnPrimaryText: '#000',
    btnSecondary: 'rgba(232, 168, 73, 0.08)',
    btnSecondaryText: 'rgba(232, 168, 73, 0.6)',
  },
  green: {
    name: '护眼',
    bg: '#e8f0e0',
    bgGradient: 'linear-gradient(180deg, #e8f0e0 0%, #dce8d4 100%)',
    toolbarBg: 'rgba(232,240,224,0.95)',
    text: '#2c3828',
    textSecondary: '#5c6e54',
    textMuted: '#8a9c80',
    border: 'rgba(100,130,80,0.2)',
    cardBg: 'linear-gradient(135deg, #1e2a18 0%, #283420 50%, #1a2414 100%)',
    cardBorder: 'rgba(60,90,40,0.5)',
    cardText: '#d0dcc8',
    cardTextSecondary: '#8aaa78',
    cardAccent: '#7ab850',
    drawerBg: 'linear-gradient(180deg, #e8f0e0 0%, #dce8d4 100%)',
    drawerActive: 'rgba(80,140,40,0.12)',
    drawerActiveText: '#4a8a28',
    drawerText: '#4a6040',
    chapterBg: 'rgba(30,42,24,0.85)',
    chapterBorder: 'rgba(60,90,40,0.4)',
    chapterText: '#b8ccac',
    chapterHoverText: '#7ab850',
    btnPrimary: 'linear-gradient(135deg, #4a8a28 0%, #3a6a1e 100%)',
    btnPrimaryText: '#fff',
    btnSecondary: 'rgba(30,42,24,0.6)',
    btnSecondaryText: '#8aaa78',
  },
};

type ThemeKey = keyof typeof THEMES;

const FONTS = [
  { key: 'serif', name: '宋体', family: '"Noto Serif SC", "Source Han Serif CN", "STSong", "SimSun", serif' },
  { key: 'sans', name: '黑体', family: '"Noto Sans SC", "Source Han Sans CN", "Microsoft YaHei", "PingFang SC", sans-serif' },
  { key: 'kai', name: '楷体', family: '"KaiTi", "STKaiti", "AR PL UKai CN", "楷体", serif' },
  { key: 'fangsong', name: '仿宋', family: '"FangSong", "STFangsong", "仿宋", serif' },
  { key: 'lishu', name: '隶书', family: '"LiSu", "STLiti", "隶书", serif' },
];

export default function NovelReader({ onSidebarCollapse, sidebarCollapsed = false, playlist = [], currentSong = null }: NovelReaderProps) {
  const { theme: globalTheme } = useTheme();
  const [keyword, setKeyword] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [recommendBooks, setRecommendBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterContent, setChapterContent] = useState('');
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [hasSearched, setHasSearched] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [themeKey, setThemeKey] = useState<ThemeKey>(globalTheme === 'light' ? 'light' : 'dark');
  const [fontKey, setFontKey] = useState('serif');
  const [columnMode, setColumnMode] = useState<'single' | 'double'>('double');
  const [chapterOrder, setChapterOrder] = useState<'asc' | 'desc'>('asc');
  const [fontColorKey, setFontColorKey] = useState('default');
  const [showSourceManager, setShowSourceManager] = useState(false);
  const [sources, setSources] = useState<NovelSource[]>([]);
  const [newSource, setNewSource] = useState({ name: '', url: '', searchPath: '/search.php?q=' });
  const [editingSource, setEditingSource] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 字体颜色选项
  const FONT_COLORS = {
    default: { name: '默认', color: null }, // 使用主题颜色
    warm: { name: '暖白', color: '#f5e6d3' },
    cool: { name: '冷白', color: '#e8e8e8' },
    green: { name: '护眼绿', color: '#c8d6c0' },
  };

  const theme = THEMES[themeKey];
  const font = FONTS.find(f => f.key === fontKey) || FONTS[0];
  const fontColor = FONT_COLORS[fontColorKey as keyof typeof FONT_COLORS];
  const textColor = fontColor.color || theme.text;

  // 根据全局主题自动切换小说主题
  useEffect(() => {
    if (globalTheme === 'light') {
      setThemeKey('light');
    } else {
      setThemeKey('dark');
    }
  }, [globalTheme]);

  // 加载小说源配置
  useEffect(() => {
    loadSources();
  }, []);

  useEffect(() => { loadRecommend(); }, []);

  const loadSources = async () => {
    try {
      const res = await fetch('/api/novel/sources');
      const data = await res.json();
      if (data.sources) {
        setSources(data.sources);
      }
    } catch (e) {
      console.error('加载小说源失败:', e);
    }
  };

  const handleAddSource = async () => {
    if (!newSource.url) return;
    try {
      const res = await fetch('/api/novel/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', source: newSource }),
      });
      const data = await res.json();
      if (data.success) {
        setSources(prev => [...prev, data.source]);
        setNewSource({ name: '', url: '', searchPath: '/search.php?q=' });
      }
    } catch (e) {
      console.error('添加源失败:', e);
    }
  };

  const handleToggleSource = async (sourceId: string) => {
    try {
      const res = await fetch('/api/novel/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', source: { id: sourceId } }),
      });
      const data = await res.json();
      if (data.success) {
        setSources(prev => prev.map(s => s.id === sourceId ? { ...s, enabled: !s.enabled } : s));
      }
    } catch (e) {
      console.error('切换源状态失败:', e);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      const res = await fetch('/api/novel/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', source: { id: sourceId } }),
      });
      const data = await res.json();
      if (data.success) {
        setSources(prev => prev.filter(s => s.id !== sourceId));
      }
    } catch (e) {
      console.error('删除源失败:', e);
    }
  };

  // Bug4: 进入阅读视图时自动收起侧边栏
  useEffect(() => {
    if (chapterContent && currentChapter) {
      onSidebarCollapse?.(true);
    }
  }, [chapterContent, currentChapter, onSidebarCollapse]);

  const loadRecommend = async () => {
    setRecommendLoading(true);
    try {
      const res = await fetch('/api/novel/recommend');
      const data = await res.json();
      setRecommendBooks(data.books || []);
    } catch (e) {
      console.error('获取推荐失败:', e);
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSelectedBook(null);
    setChapters([]);
    setChapterContent('');
    setHasSearched(true);
    try {
      const res = await fetch(`/api/novel/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setBooks(data.books || []);
    } catch (e) {
      console.error('搜索失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = async (book: Book) => {
    setSelectedBook(book);
    setLoading(true);
    try {
      const url = book.url || book.id;
      const res = await fetch(`/api/novel/chapter?bookUrl=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.error) return;
      setChapters(data.chapters || []);
      if (data.book) {
        setSelectedBook({ ...book, ...data.book, url: book.url, id: book.id, source: book.source });
      }
    } catch (e) {
      console.error('获取章节失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReadChapter = async (chapter: Chapter) => {
    if (!selectedBook) return;
    setLoading(true);
    setCurrentChapter(chapter);
    setShowChapters(false);
    setShowSettings(false);
    try {
      const res = await fetch(
        `/api/novel/chapter?bookUrl=${encodeURIComponent(selectedBook.url || selectedBook.id)}&chapterUrl=${encodeURIComponent(chapter.url)}`
      );
      const data = await res.json();
      setChapterContent(data.content || '暂无内容');
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error('获取章节内容失败:', e);
      setChapterContent('获取内容失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
    setChapters([]);
    setChapterContent('');
    setCurrentChapter(null);
    setShowChapters(false);
    setShowSettings(false);
    onSidebarCollapse?.(false); // Bug4: 返回时恢复侧边栏
  };

  const handleBackToChapters = () => {
    setChapterContent('');
    setCurrentChapter(null);
    setShowChapters(false);
    setShowSettings(false);
    onSidebarCollapse?.(false); // Bug4: 返回时恢复侧边栏
  };

  const navChapter = (dir: -1 | 1) => {
    if (!currentChapter) return;
    // Bug2: 使用排序后的章节列表来导航
    const sorted = chapterOrder === 'desc' ? [...chapters].reverse() : chapters;
    const idx = sorted.findIndex(c => c.url === currentChapter.url);
    const next = idx + dir;
    if (next >= 0 && next < sorted.length) handleReadChapter(sorted[next]);
  };

  // 提取章节标题中的数字用于排序
  const extractChapterNum = (title: string): number => {
    // 匹配「第X章」「第X回」「第X节」等格式
    const match = title.match(/第\s*(\d+)\s*[章回节幕集卷]/);
    if (match) return parseInt(match[1], 10);
    // 备选：匹配开头的纯数字
    const numMatch = title.match(/^(\d+)/);
    if (numMatch) return parseInt(numMatch[1], 10);
    return 0;
  };

  // 获取排序后的章节列表（按章节号数字排序）
  const getSortedChapters = () => {
    const sorted = [...chapters].sort((a, b) => {
      const numA = extractChapterNum(a.title);
      const numB = extractChapterNum(b.title);
      return numA - numB;
    });
    return chapterOrder === 'asc' ? sorted : sorted.reverse();
  };

  // ==================== 封面占位 ====================
  const CoverPlaceholder = ({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) => {
    const colors = [
      'from-amber-700 to-red-900',
      'from-emerald-800 to-teal-950',
      'from-slate-700 to-slate-950',
      'from-rose-700 to-pink-950',
      'from-violet-700 to-purple-950',
      'from-orange-700 to-amber-950',
    ];
    const colorIdx = name.charCodeAt(0) % colors.length;
    const sizeClass = size === 'lg' ? 'w-28 h-40 text-3xl' : 'w-16 h-[88px] text-lg';
    return (
      <div className={`${sizeClass} bg-gradient-to-br ${colors[colorIdx]} rounded flex-shrink-0 flex items-center justify-center font-bold text-white/80 shadow-lg relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.05) 3px, rgba(255,255,255,0.05) 4px)' }}></div>
        <span className="relative z-10 drop-shadow-md">{name.charAt(0)}</span>
      </div>
    );
  };

  // ==================== 书籍卡片 ====================
  const BookCard = ({ book, onClick, index = 0, mode = 'double' }: { book: Book; onClick: () => void; index?: number; mode?: 'single' | 'double' }) => {
    if (mode === 'single') {
      return (
        <div
          onClick={onClick}
          className="group relative rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg overflow-hidden"
          style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
        >
          <div className="relative">
            {book.cover ? (
              <img src={book.cover} alt={book.name} className="w-full h-56 object-cover" style={{ borderBottom: `2px solid ${theme.cardBorder}` }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="w-full h-56 flex items-center justify-center" style={{ background: themeKey === 'light' ? 'linear-gradient(135deg, #f5f0e8, #e8e0d4)' : 'linear-gradient(135deg, #3d2b1f, #2d1f14)' }}>
                <span className="text-5xl font-bold" style={{ color: themeKey === 'light' ? 'rgba(139,105,20,0.2)' : 'rgba(255,255,255,0.2)' }}>{book.name.charAt(0)}</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.4))' }}></div>
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm truncate group-hover:text-amber-300 transition-colors" style={{ color: theme.cardText }}>{book.name}</h3>
            {book.author && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: theme.cardTextSecondary }}><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{book.author}</p>}
            {book.lastChapter && <p className="text-xs mt-1.5 truncate flex items-center gap-1" style={{ color: theme.cardAccent }}><svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>{book.lastChapter}</p>}
          </div>
        </div>
      );
    }

    return (
      <div onClick={onClick} className="group relative flex gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-amber-500 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {book.cover ? (
          <img src={book.cover} alt={book.name} className="w-16 h-[88px] object-cover rounded flex-shrink-0 shadow-md" style={{ border: themeKey === 'light' ? '2px solid rgba(180,150,100,0.15)' : '2px solid rgba(255,255,255,0.1)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <CoverPlaceholder name={book.name} />
        )}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h3 className="font-semibold text-[15px] truncate group-hover:text-amber-300 transition-colors" style={{ color: theme.cardText }}>{book.name}</h3>
            {book.author && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: theme.cardTextSecondary }}><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{book.author}</p>}
          </div>
          {book.lastChapter && <p className="text-xs mt-1.5 truncate flex items-center gap-1" style={{ color: theme.cardAccent }}><svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>{book.lastChapter}</p>}
        </div>
      </div>
    );
  };

  // ==================== 加载骨架 ====================
  const Skeleton = () => (
    <div className="space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="flex gap-4 p-4 rounded-xl" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <div className="w-16 h-[88px] rounded animate-pulse" style={{ background: themeKey === 'light' ? 'rgba(180,150,100,0.1)' : 'rgba(255,255,255,0.05)' }}></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: themeKey === 'light' ? 'rgba(180,150,100,0.1)' : 'rgba(255,255,255,0.05)' }}></div>
            <div className="h-3 w-1/3 rounded animate-pulse" style={{ background: themeKey === 'light' ? 'rgba(180,150,100,0.08)' : 'rgba(255,255,255,0.03)' }}></div>
            <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: themeKey === 'light' ? 'rgba(180,150,100,0.06)' : 'rgba(255,255,255,0.02)' }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  // ==================== 设置面板 ====================
  const SettingsPanel = () => (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)}></div>
      <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl shadow-2xl overflow-hidden" style={{ background: theme.toolbarBg, border: `1px solid ${theme.border}`, backdropFilter: 'blur(12px)' }}>
        <div className="p-3 border-b" style={{ borderColor: theme.border }}>
          <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>主题</p>
          <div className="flex gap-1.5">
            {Object.entries(THEMES).map(([key, t]) => (
              <button key={key} onClick={() => setThemeKey(key as ThemeKey)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${key === themeKey ? 'ring-2 ring-amber-500/50' : ''}`} style={{ background: t.bg, color: t.text, border: `1px solid ${t.border}` }}>{t.name}</button>
            ))}
          </div>
        </div>
        <div className="p-3 border-b" style={{ borderColor: theme.border }}>
          <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>字体</p>
          <div className="flex flex-col gap-1">
            {FONTS.map(f => (
              <button key={f.key} onClick={() => setFontKey(f.key)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${f.key === fontKey ? 'font-medium' : ''}`} style={{ background: f.key === fontKey ? theme.drawerActive : 'transparent', color: f.key === fontKey ? theme.drawerActiveText : theme.textSecondary, fontFamily: f.family }}>{f.name} — 示例文字</button>
            ))}
          </div>
        </div>
        <div className="p-3 border-b" style={{ borderColor: theme.border }}>
          <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>字号</p>
          <div className="flex items-center justify-between">
            <button onClick={() => setFontSize(s => Math.max(14, s - 2))} className="w-8 h-8 rounded-lg text-sm font-medium transition-colors" style={{ background: theme.btnSecondary, color: theme.btnSecondaryText }}>A-</button>
            <span className="text-sm font-medium" style={{ color: theme.text }}>{fontSize}px</span>
            <button onClick={() => setFontSize(s => Math.min(26, s + 2))} className="w-8 h-8 rounded-lg text-base font-medium transition-colors" style={{ background: theme.btnSecondary, color: theme.btnSecondaryText }}>A+</button>
          </div>
        </div>
        <div className="p-3 border-b" style={{ borderColor: theme.border }}>
          <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>字体颜色</p>
          <div className="flex gap-1.5">
            {Object.entries(FONT_COLORS).map(([key, fc]) => (
              <button
                key={key}
                onClick={() => setFontColorKey(key)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${key === fontColorKey ? 'ring-2 ring-amber-500/50' : ''}`}
                style={{
                  background: key === fontColorKey ? theme.drawerActive : theme.btnSecondary,
                  color: fc.color || theme.text,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {fc.name}
              </button>
            ))}
          </div>
        </div>
        <div className="p-3">
          <button
            onClick={() => {
              setShowSettings(false);
              setShowSourceManager(true);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ background: theme.btnSecondary, color: theme.btnSecondaryText }}
          >
            <span>小说源管理</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  // ==================== 阅读视图 ====================
  if (chapterContent && currentChapter) {
    const sorted = getSortedChapters();
    const currentIdx = sorted.findIndex(c => c.url === currentChapter.url);
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]" style={{ background: theme.bgGradient }}>
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: theme.border, background: theme.toolbarBg }}>
          <button onClick={handleBackToChapters} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: theme.textSecondary }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            目录
          </button>
          <button onClick={() => setShowChapters(!showChapters)} className="text-sm transition-colors truncate max-w-[200px]" style={{ color: theme.textSecondary }}>{currentChapter.title}</button>
          <div className="relative flex items-center gap-1.5">
            <button onClick={() => setShowSettings(!showSettings)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: theme.textSecondary, background: showSettings ? theme.drawerActive : 'transparent' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <div className={`transition-all duration-300 ease-out ${showSettings ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`} style={{ transformOrigin: 'top right' }}>
              {showSettings && <SettingsPanel />}
            </div>
          </div>
        </div>

        {/* Bug5: 侧边章节抽屉 - 添加 marginLeft 避开侧边栏 */}
        {showChapters && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowChapters(false)}></div>
            <div
              className="fixed top-0 bottom-0 z-50 w-72 overflow-y-auto shadow-2xl"
              style={{
                background: theme.drawerBg,
                // 移动端侧边栏是 overlay，不占位，从 0 开始
                // 桌面端根据侧边栏收起/展开动态计算
                left: typeof window !== 'undefined' && window.innerWidth < 768
                  ? '0px'
                  : sidebarCollapsed ? '72px' : '256px',
                transition: 'left 0.3s cubic-bezier(0.32,0.72,0,1)',
              }}
            >
              <div className="p-4 border-b" style={{ borderColor: theme.border }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold" style={{ color: theme.text }}>目录</h3>
                  <button onClick={() => setShowChapters(false)} style={{ color: theme.textMuted }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>共 {chapters.length} 章</p>
              </div>
              <div className="p-2">
                {sorted.map((ch, i) => (
                  <button
                    key={ch.id}
                    onClick={() => handleReadChapter(ch)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      background: ch.url === currentChapter.url ? theme.drawerActive : 'transparent',
                      color: ch.url === currentChapter.url ? theme.drawerActiveText : theme.drawerText,
                      fontWeight: ch.url === currentChapter.url ? 600 : 400,
                    }}
                  >
                    <span className="text-xs mr-2" style={{ color: theme.textMuted }}>{i + 1}</span>
                    {ch.title}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Bug3: 正文内容 + 底部固定导航 */}
        <div ref={contentRef} className="flex-1 overflow-y-auto" style={{ paddingBottom: currentSong ? '200px' : '100px' }}>
          <div className="max-w-2xl mx-auto px-6 py-8">
            <h1 className="text-xl font-bold mb-8 text-center" style={{ color: textColor, fontFamily: font.family }}>{currentChapter.title}</h1>
            <div className="leading-[2] whitespace-pre-wrap" style={{ fontSize: `${fontSize}px`, fontFamily: font.family, color: textColor, textIndent: '2em' }}>
              {chapterContent}
            </div>
          </div>
        </div>

        {/* Bug3: 固定底部导航栏 - 动态计算位置避免被播放栏覆盖 */}
        <div className="fixed left-0 right-0 z-30 border-t" style={{ borderColor: theme.border, background: theme.toolbarBg, backdropFilter: 'blur(12px)', bottom: currentSong ? '80px' : '0px' }}>
          <div className="flex items-center justify-between max-w-2xl mx-auto px-6 py-3">
            <button
              onClick={() => navChapter(-1)}
              disabled={currentIdx <= 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-30 shadow-sm"
              style={{ background: theme.btnPrimary, color: theme.btnPrimaryText }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              上一章
            </button>
            <span className="text-xs" style={{ color: theme.textMuted }}>{currentIdx + 1} / {chapters.length}</span>
            <button
              onClick={() => navChapter(1)}
              disabled={currentIdx >= chapters.length - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-30 shadow-sm"
              style={{ background: theme.btnPrimary, color: theme.btnPrimaryText }}
            >
              下一章
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* 悬浮咖啡 */}
        <FloatingCoffee />
      </div>
    );
  }

  // ==================== 主视图 ====================
  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <div className="relative overflow-hidden rounded-2xl p-6" style={{
        background: themeKey === 'light'
          ? 'linear-gradient(135deg, #ffffff 0%, #f8f6f3 50%, #f0ece6 100%)'
          : 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0a0a0a 100%)',
        border: themeKey === 'light'
          ? '1px solid rgba(180, 150, 100, 0.2)'
          : '1px solid rgba(232, 168, 73, 0.15)',
        boxShadow: themeKey === 'light'
          ? '0 2px 12px rgba(100, 80, 50, 0.06)'
          : '0 4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(232, 168, 73, 0.1)',
      }}>
        {/* 装饰线 */}
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{
          background: themeKey === 'light'
            ? 'linear-gradient(90deg, transparent, #8b6914, #a67c1a, #8b6914, transparent)'
            : 'linear-gradient(90deg, transparent, #e8a849, #f0c878, #e8a849, transparent)',
        }} />
        {/* 装饰纹理 */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${themeKey === 'light' ? '8b6914' : 'e8a849'}' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5" style={{ color: themeKey === 'light' ? '#8b6914' : '#e8a849' }} fill="currentColor" viewBox="0 0 24 24"><path d="M21 4H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1zM4 18V6h7v12H4zm9 0V6h7v12h-7z"/></svg>
            <h2 className="text-lg font-bold tracking-wide" style={{ color: themeKey === 'light' ? '#2c2418' : '#f0c878', fontFamily: 'serif' }}>免费看小说</h2>
          </div>
          <p className="text-xs ml-7" style={{ color: themeKey === 'light' ? '#6b5e4f' : 'rgba(232, 168, 73, 0.4)' }}>海量小说，随心阅读</p>
        </div>

        <div className="relative mt-4 z-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: themeKey === 'light' ? '#9a8e7f' : 'rgba(232, 168, 73, 0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索小说名或作者..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-shadow"
                style={{
                  background: themeKey === 'light' ? '#ffffff' : 'rgba(20,20,20,0.8)',
                  color: themeKey === 'light' ? '#2c2418' : '#f0c878',
                  border: themeKey === 'light' ? '1px solid rgba(180, 150, 100, 0.2)' : '1px solid rgba(232, 168, 73, 0.15)',
                }}
              />
            </div>
            <button onClick={handleSearch} disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50" style={{
              background: themeKey === 'light' ? 'linear-gradient(135deg, #8b6914 0%, #a67c1a 100%)' : 'linear-gradient(135deg, #e8a849 0%, #c07a2a 100%)',
              color: '#fff',
              boxShadow: themeKey === 'light' ? '0 2px 8px rgba(139, 105, 20, 0.2)' : '0 0 15px rgba(232, 168, 73, 0.2)',
            }}>
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>
        </div>
      </div>

      {/* 推荐小说 */}
      {!hasSearched && !selectedBook && !showSourceManager && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-700 to-red-800"></div>
              <h3 className="font-bold tracking-wide" style={{ color: theme.text, fontFamily: 'serif' }}>推荐阅读</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSourceManager(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{ background: theme.btnSecondary, color: theme.btnSecondaryText }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                小说源
              </button>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.border}` }}>
                <button onClick={() => setColumnMode('single')} className="px-2.5 py-1.5 text-xs transition-colors" style={{ background: columnMode === 'single' ? theme.btnPrimary : 'transparent', color: columnMode === 'single' ? theme.btnPrimaryText : theme.textMuted }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <button onClick={() => setColumnMode('double')} className="px-2.5 py-1.5 text-xs transition-colors" style={{ background: columnMode === 'double' ? theme.btnPrimary : 'transparent', color: columnMode === 'double' ? theme.btnPrimaryText : theme.textMuted }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                </button>
              </div>
            </div>
          </div>
          {recommendLoading ? <Skeleton /> : recommendBooks.length > 0 ? (
            <div className={columnMode === 'single' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
              {recommendBooks.map((book, i) => <BookCard key={book.id} book={book} onClick={() => handleSelectBook(book)} index={i} mode={columnMode} />)}
            </div>
          ) : <p className="text-center py-8 text-sm" style={{ color: theme.textMuted }}>暂无推荐</p>}
        </div>
      )}

      {/* 小说源管理 */}
      {showSourceManager && !selectedBook && (
        <div className="rounded-2xl overflow-hidden" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <div className="p-4 border-b" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold" style={{ color: theme.text }}>小说源管理</h3>
              <button onClick={() => setShowSourceManager(false)} style={{ color: theme.textMuted }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: theme.textMuted }}>管理小说搜索源，可添加自定义源</p>
          </div>

          {/* 添加新源 */}
          <div className="p-4 border-b" style={{ borderColor: theme.border }}>
            <p className="text-xs font-medium mb-3" style={{ color: theme.textMuted }}>添加新源</p>
            <div className="space-y-2">
              <input
                type="text"
                value={newSource.name}
                onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                placeholder="源名称（如：笔趣阁）"
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: themeKey === 'light' ? '#fff' : 'rgba(255,255,255,0.05)', color: theme.text, border: `1px solid ${theme.border}` }}
              />
              <input
                type="text"
                value={newSource.url}
                onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                placeholder="源地址（如：https://www.example.com）"
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: themeKey === 'light' ? '#fff' : 'rgba(255,255,255,0.05)', color: theme.text, border: `1px solid ${theme.border}` }}
              />
              <input
                type="text"
                value={newSource.searchPath}
                onChange={(e) => setNewSource(prev => ({ ...prev, searchPath: e.target.value }))}
                placeholder="搜索路径（如：/search.php?q=）"
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: themeKey === 'light' ? '#fff' : 'rgba(255,255,255,0.05)', color: theme.text, border: `1px solid ${theme.border}` }}
              />
              <button
                onClick={handleAddSource}
                disabled={!newSource.url}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: theme.btnPrimary, color: theme.btnPrimaryText }}
              >
                添加源
              </button>
            </div>
          </div>

          {/* 源列表 */}
          <div className="p-4">
            <p className="text-xs font-medium mb-3" style={{ color: theme.textMuted }}>已添加的源</p>
            <div className="space-y-2">
              {sources.map(source => (
                <div key={source.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: themeKey === 'light' ? 'rgba(139,105,20,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: theme.text }}>{source.name}</p>
                    <p className="text-xs truncate" style={{ color: theme.textMuted }}>{source.url}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button
                      onClick={() => handleToggleSource(source.id)}
                      className="w-10 h-6 rounded-full transition-colors relative"
                      style={{ background: source.enabled ? (themeKey === 'light' ? '#8b6914' : '#e8a849') : (themeKey === 'light' ? '#d4d0c8' : '#3a3a3a') }}
                    >
                      <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ left: source.enabled ? '22px' : '2px' }} />
                    </button>
                    {!source.id.startsWith('biquge') && (
                      <button
                        onClick={() => handleDeleteSource(source.id)}
                        className="p-1 rounded transition-colors"
                        style={{ color: theme.textMuted }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 面包屑导航 */}
      {(selectedBook || chapterContent) && (
        <div className="flex items-center gap-1.5 text-sm">
          <button onClick={handleBackToBooks} className="transition-colors hover:text-amber-700" style={{ color: theme.textMuted }}>书架</button>
          {selectedBook && (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.textMuted }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <button onClick={handleBackToChapters} className="transition-colors font-medium" style={{ color: !chapterContent ? theme.text : theme.textMuted }}>{selectedBook.name}</button>
            </>
          )}
          {chapterContent && currentChapter && (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.textMuted }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="font-medium truncate max-w-[200px]" style={{ color: theme.text }}>{currentChapter.title}</span>
            </>
          )}
        </div>
      )}

      {/* 搜索结果 */}
      {!selectedBook && hasSearched && books.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-700 to-red-800"></div>
            <h3 className="font-bold tracking-wide" style={{ color: theme.text, fontFamily: 'serif' }}>搜索结果</h3>
            <span className="text-xs ml-1" style={{ color: theme.textMuted }}>({books.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {books.map((book, i) => <BookCard key={book.id} book={book} onClick={() => handleSelectBook(book)} index={i} />)}
          </div>
        </div>
      )}

      {/* 书籍详情 + 章节列表 */}
      {selectedBook && !chapterContent && (
        <div>
          <div className="rounded-2xl p-5 mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2c2218 0%, #3a2a1c 50%, #241a10 100%)', border: '1px solid rgba(80,60,35,0.5)', boxShadow: '0 4px 20px rgba(30,20,10,0.2)' }}>
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 11px)' }}></div>
            <div className="relative z-10 flex gap-4">
              {selectedBook.cover ? (
                <img src={selectedBook.cover} alt={selectedBook.name} className="w-28 h-40 object-cover rounded-lg shadow-xl flex-shrink-0" style={{ border: '3px solid rgba(255,255,255,0.1)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : <CoverPlaceholder name={selectedBook.name} size="lg" />}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-amber-100" style={{ fontFamily: 'serif' }}>{selectedBook.name}</h3>
                  {selectedBook.author && <p className="text-sm text-amber-200/60 mt-1 flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{selectedBook.author}</p>}
                  {selectedBook.description && <p className="text-xs text-amber-200/40 mt-2 line-clamp-2 leading-relaxed">{selectedBook.description}</p>}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium text-amber-300/80" style={{ background: 'rgba(180,140,50,0.15)' }}>{chapters.length} 章</span>
                  {selectedBook.source && <span className="px-2.5 py-1 rounded-md text-xs text-amber-200/40" style={{ background: 'rgba(255,255,255,0.05)' }}>{selectedBook.source}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Bug2: 章节列表 - 排序逻辑修复 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-700 to-red-800"></div>
              <h3 className="font-bold tracking-wide" style={{ color: theme.text, fontFamily: 'serif' }}>章节列表</h3>
              <span className="text-xs ml-1" style={{ color: theme.textMuted }}>({chapters.length})</span>
            </div>
            <button
              onClick={() => setChapterOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
              style={{ background: theme.btnSecondary, color: theme.btnSecondaryText }}
            >
              {chapterOrder === 'asc' ? (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>正序</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m8-4v12m0 0l-4-4m4 4l4-4" /></svg>倒序</>
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {getSortedChapters().map((chapter, i) => (
              <button
                key={chapter.id}
                onClick={() => handleReadChapter(chapter)}
                className="group px-3 py-2.5 text-sm text-left rounded-lg transition-all truncate"
                style={{ background: theme.chapterBg, border: `1px solid ${theme.chapterBorder}`, color: theme.chapterText }}
              >
                <span>{chapter.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2" style={{ color: theme.textMuted }}>
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: theme.textMuted, borderTopColor: theme.cardAccent }}></div>
            <span className="text-sm">加载中...</span>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {!loading && !selectedBook && hasSearched && books.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 opacity-30">📚</div>
          <p className="text-sm" style={{ color: theme.textSecondary }}>未找到相关小说</p>
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>换个关键词试试</p>
          <button onClick={() => { setHasSearched(false); setBooks([]); }} className="mt-4 px-4 py-2 rounded-lg text-sm transition-colors" style={{ color: theme.cardAccent, border: `1px solid ${theme.border}` }}>查看推荐</button>
        </div>
      )}
    </div>
  );
}
