const imageInput = document.getElementById("imageInput");
const imageContainer = document.getElementById("imagePreview");
const firstImageButton = document.getElementById("firstImageButton");
const addImageButton = document.getElementById("addImageButton");
const controls = document.getElementById("controls");
const buttonContainer = document.getElementById("buttonContainer")
const optionContainer = document.getElementById("optionContainer")
const groupButton = document.getElementById("groupButton");
const downloadButton = document.getElementById("downloadButton");
let groupedCanvasDataURL = null;


// Función para crear elementos de control de imagen
function createImageControls(image, id) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("image-wrapper");
    wrapper.id = `imageWrapper-${id}`;

    // Canvas
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    wrapper.appendChild(canvas);

    const controls = document.createElement("div");
    controls.classList.add("controls");

    controls.innerHTML = `
        <button id="deleteButton-${id}"><span class="mdi--trash"></span></button>
    `;
    wrapper.appendChild(controls);

    imageContainer.appendChild(wrapper);

    // Eventos de botones

    document.getElementById(`deleteButton-${id}`).addEventListener("click", () => {
        const wrapperToDelete = document.getElementById(`imageWrapper-${id}`);
        if (wrapperToDelete) {
            wrapperToDelete.remove();
        }
    });
}

function loadImages(files) {
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const uniqueId = `${Date.now()}-${index}`;
                createImageControls(img, uniqueId);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Limpia el valor del input para permitir seleccionar el mismo archivo
    imageInput.value = "";
}

// Evento del primer botón
firstImageButton.addEventListener("click", () => {
    imageInput.click(); // Abrir selector de archivos

    // Manejar carga de la primera imagen
    imageInput.addEventListener("change", function handleFirstImage(event) {
        loadImages(event.target.files);

        // Cambiar la visibilidad de los botones
        buttonContainer.style.display = "none"; 
        optionContainer.style.display = "flex"
        imageContainer.style.display = "flex";
        controls.style.display = "flex";

        // Desvincular el evento para evitar duplicados
        imageInput.removeEventListener("change", handleFirstImage);
    });
});

// Evento del segundo botón
addImageButton.addEventListener("click", () => {
    imageInput.click(); // Abrir selector de archivos
    imageInput.addEventListener("change", (event) => {
        loadImages(event.target.files); // Cargar más imágenes
    });
});

// Función para agrupar imágenes en un solo canvas a 300 DPI
function groupImagesHighDPI() {
    // Tamaño de una hoja A4 en píxeles a 300 DPI
    const a4Width = 2480; // Ancho en píxeles
    const a4Height = 3508; // Alto en píxeles

    const groupedCanvas = document.createElement("canvas");
    groupedCanvas.width = a4Width;
    groupedCanvas.height = a4Height;

    const ctx = groupedCanvas.getContext("2d");

    // Fondo blanco para el canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, a4Width, a4Height);

    const wrappers = document.querySelectorAll(".image-wrapper canvas");
    let currentX = 0;
    let currentY = 0;
    const padding = 20; // Espacio entre imágenes (ajustado para alta resolución)

    wrappers.forEach((canvas) => {
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Verificar si la imagen cabe en la fila actual
        if (currentX + imgWidth > a4Width) {
            currentX = 0; // Nueva fila
            currentY += imgHeight + padding;
        }

        // Verificar si cabe en la hoja
        if (currentY + imgHeight > a4Height) {
            alert("Las imágenes exceden el tamaño de una hoja A4.");
            return;
        }

        // Dibujar la imagen en el canvas principal
        ctx.drawImage(canvas, currentX, currentY, imgWidth, imgHeight);
        currentX += imgWidth + padding;
    });

    groupedCanvasDataURL = groupedCanvas.toDataURL("image/png");

    // Abrir una ventana emergente y mostrar la imagen
    const newWindow = window.open("", "_blank", "width=800,height=1000");
     if (newWindow) {
         const img = newWindow.document.createElement("img");
         img.src = groupedCanvas.toDataURL("image/png");
         img.style.maxWidth = "100%";
         img.style.height = "auto";
 
         newWindow.document.body.style.margin = "0";
         newWindow.document.body.style.display = "flex";
         newWindow.document.body.style.justifyContent = "center";
         newWindow.document.body.style.alignItems = "center";
         newWindow.document.body.appendChild(img);
 
         newWindow.document.title = "Vista previa - Imagen final";
     } else {
         alert("No se pudo abrir la ventana emergente. Verifica si está bloqueada por el navegador.");
     }
}

function downloadGroupedImage() {
    if (groupedCanvasDataURL) {
        const link = document.createElement("a");
        link.href = groupedCanvasDataURL;
        link.download = "imagen_final.png";
        link.click();
    } else {
        alert("Primero agrupa las imágenes antes de descargarlas.");
    }
}

// Eventos
downloadButton.addEventListener("click", downloadGroupedImage);

// Evento del botón Agrupar
groupButton.addEventListener("click", groupImagesHighDPI);
