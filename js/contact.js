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


const formContacto = document.getElementById('form-contacto');

formContacto.addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const telefono = document.getElementById('telefono').value;
  const email = document.getElementById('email').value;
  const fecha = document.getElementById('fecha').value;
  const mensaje = document.getElementById('mensaje').value;

  const mensajePostulacion = `==========================
 REGISTRO DE POSTULACIÓN
==========================
Candidato/a: ${nombre}
Teléfono: ${telefono}
Correo: ${email}
Fecha solicitada: ${fecha}

Mensaje / Consulta:
"${mensaje}"
==========================
¡Gracias por postular! Nos comunicaremos contigo a la brevedad.`;

  alert(mensajePostulacion);
  formContacto.reset();
});