# Eitan

个人博客：https://eitan.chronoresearch.org/

基于 [Shirone](https://github.com/LyraVoid/Shirone)，使用 Astro、Svelte 与 Tailwind CSS。

- 文章：`src/content/posts/`
- 系列：`src/content/series/`
- 关于：`src/content/spec/about.md`
- 站点配置：`src/config/`

环境：Node.js 26.13.0 或更高、pnpm 11.28.2。

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm build
```

推送到 main 后，GitHub Actions 自动构建并部署到 GitHub Pages。
