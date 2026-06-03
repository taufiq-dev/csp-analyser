// Apply stored theme before paint to avoid a flash of the wrong theme.
// External (not inline) so a strict script-src 'self' covers it without needing
// 'unsafe-inline' or a per-build hash.
(function () {
  try {
    var t = localStorage.getItem("theme");
    var dark =
      !t ||
      t === "dark" ||
      (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    var root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {}
})();
