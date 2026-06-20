document.addEventListener('DOMContentLoaded', () => {
  const integrantes = {
    'rosa-garibay-ramos': {
      nombre: 'Rosa Angelina Garibay Ramos',
      codigo: 'U22214918',
      carrera: 'Ing. Sistemas',
      archivo: 'rosa-garibay-ramos.pdf'
    },
    'gabriel-apac-martinez': {
      nombre: 'Gabriel Alejandro Apac Martínez',
      codigo: 'U23223910',
      carrera: 'Ing. Software',
      archivo: 'gabriel-apac-martinez.pdf'
    },
    'david-gonzales-pozo': {
      nombre: 'David Gonzales Pozo',
      codigo: 'U22229146',
      carrera: 'Ing. Software',
      archivo: 'david-gonzales-pozo.pdf'
    },
    'aldo-mestanza-orreaga': {
      nombre: 'Aldo Fernando Mestanza Orreaga',
      codigo: 'U23200404',
      carrera: 'Ing. Sistemas',
      archivo: 'aldo-mestanza-orreaga.pdf'
    },
    'fabrizio-correa-llacsa': {
      nombre: 'Fabrizio Correa Llacsa',
      codigo: 'U22306476',
      carrera: 'Ing. Software',
      archivo: 'fabrizio-correa-llacsa.pdf'
    },
    'francis-inche-nunez': {
      nombre: 'Francis Alejandro Inche Nuñez',
      codigo: 'U23240673',
      carrera: 'Ing. Software',
      archivo: 'francis-inche-nunez.pdf'
    }
  };

  const params = new URLSearchParams(window.location.search);
  const clave = params.get('integrante');

  const integrante = integrantes[clave] || integrantes['rosa-garibay-ramos'];

  const pdfUrl = `/media/media-cv/${integrante.archivo}`;


  console.log("rosa-garibay-ramos", pdfUrl);
  console.log("david-gonzales-pozo", pdfUrl);

  const title = document.getElementById('cvTitle');
  const info = document.getElementById('cvInfo');
  const viewer = document.getElementById('cvViewer');
  const view = document.getElementById('viewCv');
  const download = document.getElementById('downloadCv');
  const filePath = document.getElementById('cvFilePath');

  if (title) {
    title.textContent = `CV de ${integrante.nombre}`;
  }

  if (info) {
    info.textContent = `Código: ${integrante.codigo} | Carrera: ${integrante.carrera}`;
  }

  if (viewer) {
    viewer.src = pdfUrl;
    console.log("Iframe cargando:", viewer.src);
  }

  if (view) {
    view.href = pdfUrl;
  }

  if (download) {
    download.href = pdfUrl;
    download.setAttribute('download', integrante.archivo);
  }

  if (filePath) {
    filePath.textContent = `/public/media/media-cv/${integrante.archivo}`;
  }
});