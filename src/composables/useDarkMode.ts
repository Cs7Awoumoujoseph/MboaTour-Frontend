import { ref, watchEffect } from "vue";

const STORAGE_KEY = "mboatour-theme";

function getInitialValue(): boolean {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

const isDark = ref(getInitialValue());

watchEffect(() => {
  const root = document.documentElement;
  if (isDark.value) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem(STORAGE_KEY, isDark.value ? "dark" : "light");
});

export function useDarkMode() {
  function toggleDarkMode() {
    isDark.value = !isDark.value;
  }

  return { isDark, toggleDarkMode };
}
