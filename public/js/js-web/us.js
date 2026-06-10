// --- Lógica del Tema Oscuro ---
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("tema");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const darkModeActive = document.body.classList.contains("dark");
  themeToggle.textContent = darkModeActive ? "☀️" : "🌙";
  localStorage.setItem("tema", darkModeActive ? "dark" : "light");
});

// --- Lógica para la Matriz RACI (Sistema de Tabs) ---
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.sprint-tab');
  const sections = document.querySelectorAll('.sprint-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 1. Quitar la clase "active" de todos los botones y secciones
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      // 2. Agregar la clase "active" al botón clickeado
      tab.classList.add('active');
      
      // 3. Mostrar la sección correspondiente
      const targetId = tab.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });
});

