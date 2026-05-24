import { createRequire } from 'node:module';

export default function katexPlugin() {
    const require = createRequire(import.meta.url);
    const katexCss = require.resolve('katex/dist/katex.min.css');
    return {
        name: 'katex-plugin',
        globalStyles: katexCss,
    };
}
