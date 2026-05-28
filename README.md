# BoxWang 工具箱

基于 Next.js 14 的多功能在线工具集合，提供文档转换、图片下载、音乐播放等实用功能。

## 功能特性

### 文档工具
- **格式转换** — DOCX ↔ PDF 互转，支持在线预览

### 图片工具
- **图片下载** — 输入网页地址，批量提取并下载图片

### 音频工具
- **免费听歌** — 多源音乐搜索与播放（网易云、酷我）
- **备用听歌** — MusicBox 嵌入播放器
- **解析通道配置** — 自定义音乐解析源
- **API 测试** — 音乐接口调试工具

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14、React 18、TypeScript |
| 样式 | Tailwind CSS |
| 文档处理 | mammoth、pdf-lib、pdfjs-dist |
| 部署 | Vercel |

## 快速开始

### 环境要求

- Node.js >= 18
- npm 或 yarn

### 安装运行

```bash
# 克隆仓库
git clone https://github.com/prWang1998/BoxWang.git
cd BoxWang

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 构建部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 项目结构

```
BoxWang/
├── app/                    # Next.js App Router
│   ├── api/                # API 路由
│   │   ├── music/          # 音乐搜索、播放、歌词接口
│   │   ├── crawl-images/   # 图片爬取接口
│   │   └── netease/        # 网易云音乐接口
│   ├── layout.tsx          # 全局布局
│   └── page.tsx            # 主页面
├── components/             # React 组件
│   ├── Sidebar.tsx         # 侧边栏导航
│   ├── FileUpload.tsx      # 文件上传
│   ├── MusicPlayer.tsx     # 音乐播放器
│   └── ...
├── lib/                    # 核心逻辑
│   ├── docx-to-pdf.ts      # DOCX 转 PDF
│   ├── pdf-to-docx.ts      # PDF 转 DOCX
│   ├── music-api.ts        # 音乐 API 封装
│   └── ...
├── types/                  # TypeScript 类型定义
└── public/                 # 静态资源
```

## 使用说明

### 文档转换
1. 点击侧边栏「文档工具 → 格式转换」
2. 上传 DOCX 或 PDF 文件
3. 预览文件内容
4. 选择转换方向，点击转换按钮

### 音乐播放
1. 点击侧边栏「音频工具 → 免费听歌」
2. 搜索歌曲或浏览推荐歌单
3. 点击歌曲即可播放
4. 可选：在设置中填入网易云 MUSIC_U Cookie 解锁 VIP 歌曲

## License

MIT
