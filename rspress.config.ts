import * as path from 'node:path';
import { defineConfig } from '@rspress/core';

export default defineConfig({
  root: path.join(__dirname, 'books'),
  outDir: path.join(__dirname, 'docs'),
  lang: 'zh',
  builderConfig: {
    html: {
      tags: [
        {
          tag: 'script',
          children: "window.onload=function(){document.title='「万维飘」w3pua.com';setTimeout(function(){var imgs=document.querySelectorAll('img.rp-home-hero__image-img');imgs.forEach(function(img){var num=Math.floor(Math.random()*19)+1;img.src='/logo/'+num+'.svg';});},100);};",
        },
      ],
    },
  },
  locales: [
    {
      lang: 'en',
      label: 'English',
      title: 'WanWeiPiao',
      description: 'Excellent learning documentation',
    },
    {
      lang: 'zh',
      label: '简体中文',
      title: '万维飘',
      description: '优秀的学习文档',
    },
  ],
  icon: '/logo.png',
  logo: {
    light: '/logo.png',
    dark: '/logo.png',
  },
  markdown: {
    shiki: {
      langs: ['python', 'bash', 'javascript', 'typescript', 'json', 'yaml', 'toml', 'sql', 'html', 'css'],
    },
  },
  themeConfig: {
    locales: [
      {
        lang: 'en',
        outlineTitle: 'ON THIS PAGE',
      },
      {
        lang: 'zh',
        outlineTitle: '大纲',
      },
    ],
  },
  globalStyles: path.join(__dirname, 'theme/global.css'),
});
