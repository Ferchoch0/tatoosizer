const imageInput = document.getElementById("imageInput");
const imageContainer = document.getElementById("imagePreview");
const firstImageButton = document.getElementById("firstImageButton");
const addImageButton = document.getElementById("addImageButton");
const controls = document.getElementById("controls");
const buttonContainer = document.getElementById("buttonContainer")
const optionContainer = document.getElementById("optionContainer")


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
        <button id="downloadButton-${id}"><span class="line-md--download-loop"></span></button>
    `;
    wrapper.appendChild(controls);

    imageContainer.appendChild(wrapper);

    document.getElementById("widthCrop").value = image.width;
    document.getElementById("heightCrop").value = image.height;

    // Eventos de botones

    document.getElementById(`deleteButton-${id}`).addEventListener("click", () => {
        const wrapperToDelete = document.getElementById(`imageWrapper-${id}`);
        if (wrapperToDelete) {
            wrapperToDelete.remove();
        }
    });

    document.getElementById(`downloadButton-${id}`).addEventListener("click", () => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `imagen_redimensionada_${id}.png`; // Template string corregido
        link.click();
    });
}

document.getElementById("cropButton").addEventListener("click", () => {
    const newWidth = parseInt(document.getElementById("widthCrop").value);
    const newHeight = parseInt(document.getElementById("heightCrop").value);

    // Verificar que los valores sean válidos
    if (newWidth > 0 && newHeight > 0) {
        // Obtener todos los canvas de las imágenes
        const wrappers = document.querySelectorAll(".image-wrapper canvas");

        wrappers.forEach((canvas, index) => {
            const ctx = canvas.getContext("2d");
            const image = new Image();
            image.src = canvas.toDataURL("image/png"); // Obtener la imagen original del canvas

            image.onload = () => {
                // Redimensionar el canvas según los valores del input
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
                ctx.drawImage(image, 0, 0, newWidth, newHeight); // Redibujar la imagen con el nuevo tamaño
            };
        });
    } else {
        alert("Ingresa valores válidos para el redimensionado");
    }
});

document.getElementById("downloadButton").addEventListener("click", function () {
    const zip = new JSZip(); // Crear instancia de JSZip
    const imagesFolder = zip.folder("imagenes"); // Crear carpeta dentro del zip

    // Recorrer todas las imágenes en el contenedor
    const wrappers = document.querySelectorAll(".image-wrapper canvas");
    wrappers.forEach((canvas, index) => {
        const imageData = canvas.toDataURL("image/png").split(",")[1]; // Extraer datos de la imagen en Base64
        imagesFolder.file(`imagen_${index + 1}.png`, imageData, { base64: true }); // Agregar la imagen al zip
    });

    // Generar y descargar el archivo .zip
    zip.generateAsync({ type: "blob" }).then((content) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "imagenes.zip"; // Nombre del archivo
        link.click();
    });
});



// Función para cargar imágenes
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