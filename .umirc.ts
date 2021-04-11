import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'React 面试必知必会',
  mode: 'site',
  favicon: 'https://i.loli.net/2021/03/27/AbDY4Z8gmrlyT1w.png',
  logo: 'https://i.loli.net/2021/03/27/AbDY4Z8gmrlyT1w.png',
  locales: [
    ['zh-CN', '中文'],
    ['en-US', 'English'],
  ],
  navs: [
    null,
    {
      title: '洛竹早茶馆',
      path: 'https://youngjuning.js.org/',
    },
    {
      title: 'GitHub',
      path: 'https://github.com/youngjuning/react-interview',
    },
    {
      title: '掘金',
      path: 'https://juejin.cn/user/325111174662855/posts',
    },
  ],
  base: '/react-interview',
  publicPath: '/react-interview/',
  // more config: https://d.umijs.org/config
});
