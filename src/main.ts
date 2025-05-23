import './app.css';
import App from './App.svelte';

if (import.meta.env.DEV) {
  import('@stagewise/toolbar').then(({ initToolbar }) => {
    const stagewiseConfig = { plugins: [] };
    initToolbar(stagewiseConfig);
  });
}

const target = document.getElementById('app');
if (!target) {
  throw new Error("Target element #app not found");
}

const app = new App({
  target,
});

export default app;
