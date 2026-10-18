# 小红书运营简报 · 计算不可约性

一个纯静态站点：把「账号数据 + 热门话题 + 行动建议」渲染成一页可读的简报。
零依赖、零构建，Cloudflare Pages 直接托管仓库即可。

## 结构

```
public/
  index.html      页面骨架
  styles.css      深色主题样式
  app.js          读取 JSON → 渲染 KPI / 话题条 / 笔记榜单（内联 SVG，无图表库）
  data/brief.json 唯一数据源：改这个文件，站点立刻变
```

## 本地预览

```bash
cd public && python3 -m http.server 8811
# 打开 http://127.0.0.1:8811/
```

## 更新内容

1. 直接编辑 `public/data/brief.json`（账号指标、话题热度、建议文案都在里面）；
2. `git add -A && git commit -m "brief: 2026-10-19" && git push`；
3. Cloudflare Pages 监听 `main` 分支，push 后自动重新发布（无需构建命令）。

每日 07:00（北京时间）的定时任务也会写这个文件并 push，所以通常不需要手动改。

## 部署到 Cloudflare Pages（首次，一次性）

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → **Connect to Git**；
2. 选择本仓库、分支 `main`；
3. Framework preset: **None**；Build command: 留空；Build output directory: `public`；
4. Save and Deploy。之后每次 `git push` 自动发布，域名形如 `https://<project>.pages.dev`。

## 数据口径

- 账号指标（粉丝/获赞/笔记数）来自登录态页面实测（CDP 读取，不读取 Cookie）；
- 话题热度是**综合排序**，不是平台官方指数，用于判断方向而不是精确排名；
- 所有来源在页面底部列出，未标注来源的数字不要当成事实引用。
