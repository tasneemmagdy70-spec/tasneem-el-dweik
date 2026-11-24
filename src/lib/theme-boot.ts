/** Runs before first paint (inlined in layout.tsx): applies the saved theme so there's no flash,
 *  and marks a return visit in the same session (the short intro), so the loader reads 99 at once. */
export const THEME_KEY = "ed-theme";
export const THEME_BOOT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;if(sessionStorage.getItem("ed-intro-seen")==="1")document.documentElement.dataset.intro="quick";}catch(e){}})();`;