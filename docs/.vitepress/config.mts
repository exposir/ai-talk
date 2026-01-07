import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'AI Talk',
  description: '个人 AI 学习笔记 - LLM 应用架构设计与开发实践',
  lang: 'zh-CN',
  base: '/ai-talk/',

  // 使用 notes 作为文档源目录
  srcDir: '../notes',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文档目录', link: '/guide/' },
      { text: 'Claude Code', link: '/claude-code/README' },
      { text: 'Antigravity', link: '/antigravity/README' },
      { text: '架构设计', link: '/architecture/README' },
      { text: '前端工程', link: '/frontend/singularity/README' },
    ],

    sidebar: {
      '/claude-code/': [
        {
          text: 'Claude Code',
          items: [
            { text: '概述', link: '/claude-code/README' },
            { text: '基础使用', link: '/claude-code/basic-usage' },
            { text: '斜杠命令', link: '/claude-code/slash-commands' },
            { text: '快捷键', link: '/claude-code/shortcuts' },
            { text: '设置', link: '/claude-code/settings' },
            { text: 'MCP', link: '/claude-code/mcp' },
            { text: 'Hooks', link: '/claude-code/hooks' },
            { text: 'Workflows', link: '/claude-code/workflows' },
            { text: 'IDE 集成', link: '/claude-code/ide-integrations' },
            { text: '前端架构', link: '/claude-code/frontend-architecture' },
            { text: '最佳实践', link: '/claude-code/best-practices' },
            { text: '社区实践', link: '/claude-code/community-practices' },
          ],
        },
      ],
      '/antigravity/': [
        {
          text: 'Antigravity',
          items: [
            { text: '概述', link: '/antigravity/README' },
            { text: '总览', link: '/antigravity/overview' },
            { text: '快速开始', link: '/antigravity/getting-started' },
            { text: '开发模式', link: '/antigravity/development-modes' },
            { text: 'Artifacts', link: '/antigravity/artifacts' },
            { text: '浏览器代理', link: '/antigravity/browser-agent' },
            { text: '代理管理器', link: '/antigravity/agent-manager' },
            { text: '高级配置', link: '/antigravity/advanced-config' },
            { text: '快捷键', link: '/antigravity/shortcuts' },
            { text: '定价与用量', link: '/antigravity/pricing-usage' },
            { text: '最佳实践', link: '/antigravity/best-practices' },
          ],
        },
      ],
      '/architecture/': [
        {
          text: '架构设计',
          items: [{ text: '概述', link: '/architecture/README' }],
        },
      ],
      '/frontend/singularity/': [
        {
          text: '奇点：下一代状态管理系统',
          items: [
            { text: '目录', link: '/frontend/singularity/README' },
            { text: '全景与库综述', link: '/frontend/singularity/landscape' },
            { text: '核心问题与愿景', link: '/frontend/singularity/problems-vision' },
            { text: '设计与路线图', link: '/frontend/singularity/design-roadmap' },
            { text: '术语与 QA', link: '/frontend/singularity/terminology-qa' },
            { text: 'API 细节与治理', link: '/frontend/singularity/api-governance' },
            { text: '核心规格', link: '/frontend/singularity/specs-core' },
            { text: '扩展规格', link: '/frontend/singularity/specs-advanced' },
            { text: '性能与 DevTools', link: '/frontend/singularity/performance-devtools' },
            { text: '验证与发布', link: '/frontend/singularity/validation-release' },
            { text: '运维与生态', link: '/frontend/singularity/ops-community' },
            { text: '附录', link: '/frontend/singularity/appendices' },
            { text: '参考资源', link: '/frontend/singularity/references' },
          ],
        },
      ],
      '/project-meta/': [
        {
          text: '项目规划',
          items: [
            { text: '命名规范', link: '/project-meta/naming-conventions' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/exposir' }],

    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
      label: '页面导航',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
  },
});
