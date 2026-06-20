
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

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.sprint-tab');
  const sections = document.querySelectorAll('.sprint-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      
      const targetId = tab.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });
});

