# BoxWang 工具箱 — 视觉效果风格指南

## 一、整体风格定位

**黑金奢华风格** — 以纯黑为底，金色为魂，打造高端、精致、有质感的视觉体验。

---

## 二、色彩系统

### 主色调
| 色彩 | 色值 | 用途 |
|------|------|------|
| 主金色 | `#e8a849` | 品牌色、主要交互元素 |
| 亮金色 | `#f0c878` | 高光、渐变过渡 |
| 暗金色 | `#c07a2a` | 按钮渐变终点 |
| 玫瑰金 | `#b76e79` | 辅助装饰、流光效果 |
| 香槟色 | `#f7e7ce` | 轻点缀、渐变过渡 |

### 背景色系
| 色彩 | 色值 | 用途 |
|------|------|------|
| 深黑 | `#0a0a0a` | 主背景 |
| 表面黑 | `#141414` | 卡片、面板 |
| 抬升黑 | `#1e1e1e` | 输入框、悬浮态 |
| 悬浮黑 | `#282828` | Hover 状态 |

### 文字色系
| 色彩 | 色值 | 用途 |
|------|------|------|
| 主文字 | `#f5f0eb` | 标题、重要内容 |
| 金色文字 | `#f0c878` | 强调标题 |
| 次文字 | `rgba(232,168,73,0.6)` | 副标题 |
| 弱文字 | `rgba(232,168,73,0.3)` | 辅助信息 |

---

## 三、核心视觉效果

### 1. 玻璃拟态 (Glassmorphism)
```css
.glass {
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
```
- 四级玻璃效果：`glass` → `glass-subtle` → `glass-heavy` → `glass-ultra`
- 应用于：播放器、侧边栏、弹窗、搜索框

### 2. 金属光泽 (Metal Sheen)
```css
.metal-sheen {
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.03) 100%);
  animation: metalSheen 4s ease-in-out infinite;
}
```
- 应用于：Logo、播放按钮、重要卡片

### 3. 动态光晕 (Dynamic Glow)
```css
.animate-glow-breathe {
  animation: glowBreathe 6s ease-in-out infinite;
}

@keyframes glowBreathe {
  0%, 100% { box-shadow: 0 0 15px rgba(232,168,73,0.08), 0 0 30px rgba(232,168,73,0.04); }
  50% { box-shadow: 0 0 25px rgba(232,168,73,0.15), 0 0 50px rgba(232,168,73,0.08); }
}
```
- 应用于：Logo、播放按钮、活跃状态元素

### 4. 渐变文字 (Gradient Text)
```css
.text-gradient-silk {
  background: linear-gradient(135deg, #f0c878 0%, #e8a849 25%, #b76e79 50%, #e8a849 75%, #f0c878 100%);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  animation: silkFlow 8s ease infinite;
}
```
- 应用于：页面标题、重要文字

### 5. 装饰分割线
```css
.separator-gradient {
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(232,168,73,0.3), rgba(183,110,121,0.2), rgba(232,168,73,0.3), transparent);
}
```
- 应用于：标题下方、区域分隔

---

## 四、背景效果

### 多层环境光晕
- 左上角：金色主光晕 (`blur-[150px]`)
- 右下角：玫瑰金辅光晕 (`blur-[120px]`)
- 中心：香槟色微光 (`blur-[180px]`)
- 极光旋转：缓慢旋转的彩色光带

### 星空粒子
- 10 个闪烁星点，不同位置和延迟
- 5 个漂浮粒子，随机运动轨迹
- 极其细微，营造深度感

### 噪点纹理
- 512px 分辨率精细噪点
- 透明度 0.012，增加质感

---

## 五、组件规范

### 侧边栏 (黑金风格)
- 纯黑渐变背景
- 金色装饰线（顶部、右侧、底部）
- 展开项带金色边框和背景
- Logo 金色渐变 + 光晕呼吸

### 歌单卡片
- 悬浮时：`scale-110` 放大
- 动态光晕边框：多层径向渐变脉冲
- 播放次数：毛玻璃徽章

### 播放器
- 黑胶唱片：14 圈精细沟槽 + 金属光泽
- 中心贴纸：封面圆形裁切，随唱片旋转
- 底部控制栏：`glass-heavy` 效果

### 小说阅读 (黑金风格)
- 主题色：金色文字 + 黑色背景
- 卡片：深黑渐变 + 金色边框
- 搜索框：深色背景 + 金色文字
- 按钮：金色渐变 + 黑色文字

---

## 六、动画规范

### 基础动画
| 动画 | 时长 | 用途 |
|------|------|------|
| `fade-in` | 0.5s | 元素进入 |
| `slide-up` | 0.5s | 卡片进入 |
| `scale-in` | 0.3s | 弹窗进入 |
| `glow-pulse` | 4s | 光晕呼吸 |
| `float` | 6s | 悬浮漂浮 |

### 交互动画
- 按钮悬浮：`scale-105` + 阴影增强
- 卡片悬浮：`scale-110` + 光晕显现
- 输入聚焦：边框变金 + 光晕扩散

---

## 七、字体规范

| 用途 | 字体 | 备选 |
|------|------|------|
| 标题 | Noto Serif SC | Georgia, serif |
| 正文 | DM Sans | system-ui, sans-serif |
| 歌词 | LXGW WenKai | Noto Serif SC |
| 代码 | JetBrains Mono | ui-monospace |

---

## 八、阴影系统

| 名称 | 值 | 用途 |
|------|------|------|
| `glow` | `0 0 20px rgba(232,168,73,0.15)` | 轻光晕 |
| `glow-lg` | `0 0 40px rgba(232,168,73,0.2)` | 中光晕 |
| `glow-xl` | `0 0 60px rgba(232,168,73,0.25)` | 强光晕 |
| `glass` | `0 8px 32px rgba(0,0,0,0.3)` | 玻璃阴影 |
| `elevated` | `0 20px 60px rgba(0,0,0,0.5)` | 浮层阴影 |

---

## 九、设计原则

1. **克制用色**：黑金为主，不引入其他色彩
2. **层次分明**：通过透明度和模糊度创造深度
3. **动态平衡**：动画柔和，不喧宾夺主
4. **质感优先**：金属光泽、玻璃拟态、噪点纹理
5. **细节精致**：装饰线、角落点缀、微交互

---

*最后更新：2026/05/29*
