/** Runs before first paint (inlined in layout.tsx): applies the saved theme so there's no flash. */
export const THEME_KEY = "ed-theme";
export const THEME_BOOT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;}catch(e){}})();`;