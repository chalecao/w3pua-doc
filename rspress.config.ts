import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import katex from './plugins/katex';

function renderMathScript() {
  return `
    (function() {
      function renderMathInElement(container) {
        if (!container) return;
        
        var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
        var textNodes = [];
        while(walker.nextNode()) textNodes.push(walker.currentNode);
        
        textNodes.forEach(function(textNode) {
          var text = textNode.textContent;
          if (!text || (!text.includes('$$') && !text.includes('$'))) return;
          
          var parent = textNode.parentNode;
          if (!parent) return;
          if (parent.tagName === 'PRE' || parent.tagName === 'CODE' || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') return;
          
          var newHtml = text.replace(/\\$\\$([\\s\\S]*?)\\$\\$/g, function(match, formula) {
            try {
              return '<div class="math math-display">' + katex.renderToString(formula.trim(), {displayMode: true, throwOnError: false}) + '</div>';
            } catch(e) { return match; }
          }).replace(/\\$([^\\$\\n]+?)\\$/g, function(match, formula) {
            try {
              return katex.renderToString(formula.trim(), {displayMode: false, throwOnError: false});
            } catch(e) { return match; }
          });
          
          if (newHtml !== text) {
            var span = document.createElement('span');
            span.innerHTML = newHtml;
            parent.replaceChild(span, textNode);
          }
        });
      }

      function onRouteChange() {
        setTimeout(function() {
          var container = document.getElementById('__rspress_root');
          if (container) {
            renderMathInElement(container);
          }
        }, 100);
      }

      if (typeof window !== 'undefined') {
        if (window.__RSPRESS__) {
          window.__RSPRESS__.addEventListener('routeChangeComplete', onRouteChange);
        } else {
          window.addEventListener('popstate', onRouteChange);
          var originalPushState = history.pushState;
          history.pushState = function() {
            originalPushState.apply(this, arguments);
            onRouteChange();
          };
        }
        
        document.addEventListener('DOMContentLoaded', function() {
          onRouteChange();
        });
        
        setTimeout(onRouteChange, 500);
        setTimeout(onRouteChange, 1000);
        setTimeout(onRouteChange, 2000);
      }
    })();
  `;
}

export default defineConfig({
  root: path.join(__dirname, 'books'),
  outDir: path.join(__dirname, 'docs'),
  lang: 'zh',
  plugins: [katex()],
  builderConfig: {
    html: {
      tags: [
        {
          tag: 'script',
          children: "window.onload=function(){document.title='「万维飘」w3pua.com';setTimeout(function(){var imgs=document.querySelectorAll('img.rp-home-hero__image-img');imgs.forEach(function(img){var num=Math.floor(Math.random()*19)+1;img.src='/logo/'+num+'.svg';});},100);};",
        },
        {
          tag: 'link',
          attrs: { rel: 'stylesheet', href: '/katex.min.css' },
        },
        {
          tag: 'script',
          attrs: { src: '/katex.min.js' },
        },
        {
          tag: 'script',
          children: renderMathScript(),
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
