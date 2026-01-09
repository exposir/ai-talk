<script setup>
/**
- [INPUT]: 依赖 vitepress 的 withBase 与主题样式
- [OUTPUT]: 导出 CustomHome 首页组件
- [POS]: docs/.vitepress/theme 的首页渲染器
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
*/
import { withBase } from 'vitepress';
</script>

<template>
  <div class="custom-home">
    <!-- 终端风格头部 -->
    <header class="terminal-header">
      <div class="terminal-bar">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span class="terminal-title">~/ai-talk</span>
      </div>
      <div class="terminal-content">
        <div class="typing-line">
          <span class="prompt">→</span>
          <span class="command">cat about.txt</span>
        </div>
        <div class="output">
          <h1 class="glitch" data-text="AI Talk">AI Talk</h1>
          <p class="tagline">个人 AI 学习笔记 · LLM 应用架构设计与开发实践</p>
        </div>
        <div class="typing-line">
          <span class="prompt">→</span>
          <span class="cursor">_</span>
        </div>
      </div>
    </header>

    <!-- 快速导航卡片 -->
    <section class="nav-cards">
      <a :href="withBase('/guide/')" class="card primary">
        <div class="card-icon">📖</div>
        <div class="card-content">
          <h3>文档目录</h3>
          <p>查看所有学习笔记</p>
        </div>
        <span class="arrow">→</span>
      </a>

      <a :href="withBase('/claude-code/README')" class="card">
        <div class="card-icon">📘</div>
        <div class="card-content">
          <h3>Claude Code</h3>
          <p>Anthropic 终端 AI 助手</p>
        </div>
        <span class="arrow">→</span>
      </a>

      <a :href="withBase('/antigravity/README')" class="card">
        <div class="card-icon">📗</div>
        <div class="card-content">
          <h3>Antigravity</h3>
          <p>Google Agent-First IDE</p>
        </div>
        <span class="arrow">→</span>
      </a>

      <a :href="withBase('/ai-fundamentals/ai-models')" class="card">
        <div class="card-icon">🤖</div>
        <div class="card-content">
          <h3>AI 模型</h3>
          <p>最新 LLM 和多模态模型</p>
        </div>
        <span class="arrow">→</span>
      </a>

      <a :href="withBase('/tools-and-apis/ai-coding-tools')" class="card">
        <div class="card-icon">🔧</div>
        <div class="card-content">
          <h3>开发工具</h3>
          <p>AI 编程助手汇总</p>
        </div>
        <span class="arrow">→</span>
      </a>

      <a :href="withBase('/architecture/README')" class="card">
        <div class="card-icon">🏗️</div>
        <div class="card-content">
          <h3>架构设计</h3>
          <p>双引擎分层架构</p>
        </div>
        <span class="arrow">→</span>
      </a>
    </section>

    <!-- 个人信息区 -->
    <section class="about-section">
      <div class="bio">
        <div class="avatar">👨‍💻</div>
        <div class="info">
          <p class="greeting">// 关于这个项目</p>
          <p>记录 AI 编程工具的使用心得、LLM 应用架构的设计思考。</p>
          <div class="social-links">
            <a
              href="https://github.com/exposir"
              target="_blank"
              class="social-link"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="currentColor"
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="custom-footer">
      <p>Built with VitePress · Powered by AI 🤖</p>
    </footer>
  </div>
</template>

<style scoped>
/* ========== 浅色模式基础样式 ========== */
.custom-home {
  min-height: 100vh;
  background: #ffffff;
  color: #1e293b;
  font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
}

/* ========== 深色模式 ========== */
:global(.dark) .custom-home {
  background: #0d1117;
  color: #c9d1d9;
}

/* ========== 终端风格头部 ========== */
.terminal-header {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 20px 40px;
}

.terminal-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 12px 12px 0 0;
  border: 1px solid #e5e7eb;
  border-bottom: none;
}

:global(.dark) .terminal-bar {
  background: #21262d;
  border-color: #30363d;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red {
  background: #ff5f56;
}
.dot.yellow {
  background: #ffbd2e;
}
.dot.green {
  background: #27c93f;
}

.terminal-title {
  margin-left: auto;
  font-size: 12px;
  color: #64748b;
}

:global(.dark) .terminal-title {
  color: #8b949e;
}

.terminal-content {
  background: #fafafa;
  padding: 30px;
  border-radius: 0 0 12px 12px;
  border: 1px solid #e5e7eb;
  border-top: none;
}

:global(.dark) .terminal-content {
  background: #0d1117;
  border-color: #30363d;
}

.typing-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.prompt {
  color: #3b82f6;
  font-weight: bold;
}

:global(.dark) .prompt {
  color: #58a6ff;
}

.command {
  color: #16a34a;
}

:global(.dark) .command {
  color: #7ee787;
}

.cursor {
  color: #3b82f6;
  animation: blink 1s step-end infinite;
}

:global(.dark) .cursor {
  color: #58a6ff;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.output {
  padding: 20px 0 30px;
}

.output h1 {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  padding: 0.1em 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.glitch {
  position: relative;
  display: inline-block;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.6;
}

.glitch::before {
  transform: translate(2px, -1px);
  text-shadow: -2px 0 #22c55e;
  animation: glitch-shift 3s infinite;
}

.glitch::after {
  transform: translate(-2px, 1px);
  text-shadow: 2px 0 #ef4444;
  animation: glitch-shift 3s infinite reverse;
}

@keyframes glitch-shift {
  0%,
  100% {
    clip-path: inset(0 0 0 0);
  }
  20% {
    clip-path: inset(0 0 60% 0);
  }
  40% {
    clip-path: inset(40% 0 0 0);
  }
  60% {
    clip-path: inset(10% 0 50% 0);
  }
  80% {
    clip-path: inset(50% 0 10% 0);
  }
}

:global(.dark) .output h1 {
  background: linear-gradient(135deg, #58a6ff, #a371f7, #f778ba);
  -webkit-background-clip: text;
  background-clip: text;
}

.tagline {
  color: #64748b;
  font-size: 1.1rem;
  margin-top: 10px;
}

:global(.dark) .tagline {
  color: #8b949e;
}

/* ========== 导航卡片 ========== */
.nav-cards {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px 40px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  text-decoration: none;
  color: #1e293b;
  transition: all 0.3s ease;
}

:global(.dark) .card {
  background: #161b22;
  border-color: #30363d;
  color: #c9d1d9;
}

.card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.15);
}

:global(.dark) .card:hover {
  border-color: #58a6ff;
  box-shadow: 0 8px 30px rgba(88, 166, 255, 0.15);
}

.card.primary {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  border-color: #16a34a;
  color: #fff;
}

:global(.dark) .card.primary {
  background: linear-gradient(135deg, #238636 0%, #2ea043 100%);
  border-color: #238636;
}

.card.primary:hover {
  border-color: #22c55e;
  box-shadow: 0 8px 30px rgba(34, 197, 94, 0.3);
}

:global(.dark) .card.primary:hover {
  border-color: #3fb950;
  box-shadow: 0 8px 30px rgba(46, 160, 67, 0.3);
}

.card-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.card-content h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

:global(.dark) .card-content h3 {
  color: #f0f6fc;
}

.card.primary .card-content h3 {
  color: #fff;
}

.card-content p {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #64748b;
}

:global(.dark) .card-content p {
  color: #8b949e;
}

.card.primary .card-content p {
  color: rgba(255, 255, 255, 0.8);
}

.arrow {
  margin-left: auto;
  font-size: 1.2rem;
  color: #94a3b8;
  transition: transform 0.3s;
}

:global(.dark) .arrow {
  color: #8b949e;
}

.card:hover .arrow {
  transform: translateX(4px);
  color: #3b82f6;
}

:global(.dark) .card:hover .arrow {
  color: #58a6ff;
}

.card.primary .arrow,
.card.primary:hover .arrow {
  color: #fff;
}

/* ========== 个人信息区 ========== */
.about-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.bio {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

:global(.dark) .bio {
  background: #161b22;
  border-color: #30363d;
}

.avatar {
  font-size: 3rem;
  flex-shrink: 0;
}

.info {
  flex: 1;
}

.greeting {
  color: #16a34a;
  font-size: 0.9rem;
  margin: 0 0 8px;
}

:global(.dark) .greeting {
  color: #7ee787;
}

.info p {
  margin: 0;
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

:global(.dark) .social-link {
  color: #8b949e;
}

.social-link:hover {
  color: #3b82f6;
}

:global(.dark) .social-link:hover {
  color: #58a6ff;
}

/* ========== 页脚 ========== */
.custom-footer {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 0.85rem;
}

:global(.dark) .custom-footer {
  color: #484f58;
}

/* ========== 响应式 ========== */
@media (max-width: 640px) {
  .output h1 {
    font-size: 2rem;
  }

  .nav-cards {
    grid-template-columns: 1fr;
  }

  .bio {
    flex-direction: column;
    text-align: center;
  }
}
</style>
