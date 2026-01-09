/**
- [INPUT]: 依赖 vitepress 默认主题与 CustomHome 组件
- [OUTPUT]: 导出扩展主题并注册 CustomHome
- [POS]: docs/.vitepress/theme 的主题入口
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
*/
// https://vitepress.dev/guide/custom-theme
import DefaultTheme from 'vitepress/theme';
import CustomHome from './CustomHome.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CustomHome', CustomHome);
  },
};
