const previewText = document.getElementById("name");
const handle = previewText.querySelector(".handle");
const rotateHandle = previewText.querySelector(".rotate");
const leftAlignBtn = document.getElementById("left-align");
const centerAlignBtn = document.getElementById("center-align");
const rightAlignBtn = document.getElementById("right-align");
const textBlend = document.getElementById("text-blend");

const alignButtons = document.querySelectorAll(".align-btn");

const MOVE_STEP = 5;
const FAST_STEP = 20;
const FINE_STEP = 1;
let rotation = 0;

// Handle text control

let pos = { x: 100, y: 100 };
let scale = 1;

let isDragging = false;
let isResizing = false;

let startMouse = { x: 0, y: 0 };
let startPos = { x: 0, y: 0 };
let startScale = 1;

// Rotate variable

let isRotating = false;
let center = { x: 0, y: 0 };
let startAngle = 0;
let startRotation = 0;

// max width
let isResizingLeft = false;
let startWidth = 0;
let startX = 0;

function update() {
  previewText.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale}) rotate(${rotation}deg)`;
}

// Select
previewText.setAttribute("draggable", false);

previewText.addEventListener("dragstart", (e) => {
  e.preventDefault();
});

previewText.addEventListener("mousedown", (e) => {
  if (e.target === handle) return;
  previewText.classList.add("selected");

  isDragging = true;
  startMouse.x = e.clientX;
  startMouse.y = e.clientY;
  startPos = { ...pos };
});

// Resize
handle.addEventListener("mousedown", (e) => {
  e.stopPropagation();
  previewText.classList.add("selected");

  isResizing = true;
  startMouse.x = e.clientX;
  startMouse.y = e.clientY;
  startScale = scale;
});

document.addEventListener("mousemove", (e) => {
  // Drag
  if (isDragging) {
    pos.x = startPos.x + (e.clientX - startMouse.x);
    pos.y = startPos.y + (e.clientY - startMouse.y);
    update();
  }

  // Resize
  if (isResizing) {
    const dx = e.clientX - startMouse.x;
    const dy = e.clientY - startMouse.y;
    const delta = (dx + dy) * 0.005;

    scale = Math.max(0.2, startScale + delta);
    update();
  }

  // Rotate
  if (isRotating) {
    const angle = Math.atan2(e.clientY - center.y, e.clientX - center.x);
    const delta = angle - startAngle;

    rotation = startRotation + (delta * 180) / Math.PI;
    update();
  }

  // width
  if (isResizingLeft) {
    const dx = e.clientX - startMouse.x;

    let newWidth = startWidth - dx;
    newWidth = Math.max(50, newWidth); // min width

    previewText.style.width = newWidth + "px";

    // shift position so right side stays fixed
    pos.x = startX + dx;

    update();
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  isResizing = false;
  isResizingLeft = false;
});

// Click outside to deselect
document.addEventListener("mousedown", (e) => {
  if (!previewText.contains(e.target)) {
    previewText.classList.remove("selected");
  }
});

// rotate
rotateHandle.addEventListener("mousedown", (e) => {
  e.stopPropagation();
  e.preventDefault();

  isRotating = true;
  previewText.classList.add("selected");

  const rect = previewText.getBoundingClientRect();
  center.x = rect.left + rect.width / 2;
  center.y = rect.top + rect.height / 2;

  startAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x);
  startRotation = rotation;
});

document.addEventListener("mouseup", () => {
  isRotating = false;
});

update();

// algin text control
function setActiveAlign(button) {
  alignButtons.forEach((btn) => {
    btn.classList.remove("active-align");
  });

  button.classList.add("active-align");
}

// Left
leftAlignBtn.addEventListener("click", () => {
  previewText.style.textAlign = "left";
  setActiveAlign(leftAlignBtn);
});

// Center
centerAlignBtn.addEventListener("click", () => {
  previewText.style.textAlign = "center";
  setActiveAlign(centerAlignBtn);
});

// Right
rightAlignBtn.addEventListener("click", () => {
  previewText.style.textAlign = "right";
  setActiveAlign(rightAlignBtn);
});

// Default align active
setActiveAlign(leftAlignBtn);

// text blend
textBlend.addEventListener("change", () => {
  previewText.style.mixBlendMode = textBlend.value;
});

// set max width
const leftHandle = previewText.querySelector(".left");

leftHandle.addEventListener("mousedown", (e) => {
  e.stopPropagation();
  e.preventDefault();

  isResizingLeft = true;
  previewText.classList.add("selected");

  startMouse.x = e.clientX;
  startWidth = previewText.offsetWidth;
  startX = pos.x;
});

document.addEventListener("keydown", (e) => {
  // only move when selected
  if (!previewText.classList.contains("selected")) return;

  let step = MOVE_STEP;
  if (e.shiftKey) step = FAST_STEP;
  if (e.altKey) step = FINE_STEP;

  let moved = true;

  switch (e.key) {
    case "ArrowUp":
      pos.y -= step;
      break;
    case "ArrowDown":
      pos.y += step;
      break;
    case "ArrowLeft":
      pos.x -= step;
      break;
    case "ArrowRight":
      pos.x += step;
      break;
    default:
      moved = false;
  }

  if (moved) {
    e.preventDefault(); // prevent page scroll
    update();
  }
});
// End Handle text control

function toggleDownloadButton() {
  const renderedName = document.getElementById("Rendered-name");
  const downloadButton = document.getElementById("download-all-button");
  if (renderedName.innerHTML.trim() === "") {
    downloadButton.classList.add("hidden");
  } else {
    downloadButton.classList.remove("hidden");
  }
}

// Buat render nama
function renderNames() {
  const input = document.getElementById("names-input").value;
  const template = document.getElementById("message-template").value;
  const names = input
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name !== "");
  const container = document.getElementById("Rendered-name");
  container.innerHTML = "";

  names.forEach((name, index) => {
    const nameItem = document.createElement("div");
    nameItem.className = "name-item";

    // TOP ROW
    const topRow = document.createElement("div");
    topRow.className = "name-top-row";

    // Name
    const nameText = document.createElement("span");
    nameText.textContent = `${index + 1}. ${name}`;
    // Download button
    const downloadButton = document.createElement("button");
    downloadButton.id = "download-button";

    downloadButton.onclick = (e) => {
      e.stopPropagation();

      previewText.childNodes[0].nodeValue = name;

      downloadAsImage(name, index);
    };

    topRow.appendChild(nameText);

    topRow.appendChild(downloadButton);

    // Generated Message
    if (template.includes("{name}")) {
      const generatedMessage = document.createElement("div");

      generatedMessage.className = "generated-message";

      const finalMessage = template.replaceAll("{name}", name);

      generatedMessage.textContent = finalMessage;

      generatedMessage.addEventListener("click", async (e) => {
        e.stopPropagation();

        await navigator.clipboard.writeText(finalMessage);

        const oldText = generatedMessage.textContent;

        generatedMessage.textContent = "Copied!";

        generatedMessage.classList.add("copied");

        setTimeout(() => {
          generatedMessage.textContent = oldText;

          generatedMessage.classList.remove("copied");
        }, 1000);
      });

      nameItem.appendChild(topRow);

      nameItem.appendChild(generatedMessage);
    } else {
      nameItem.appendChild(topRow);
    }

    // Preview selected
    nameItem.addEventListener("click", () => {
      previewText.childNodes[0].nodeValue = name;

      document.querySelectorAll(".name-item").forEach((item) => {
        item.classList.remove("active-name-item");
      });

      nameItem.classList.add("active-name-item");
    });

    container.appendChild(nameItem);
  });

  // Auto preview first name
  if (names.length > 0) {
    previewText.childNodes[0].nodeValue = names[0];
    const firstItem = container.querySelector(".name-item");
    if (firstItem) {
      firstItem.classList.add("active-name-item");
    }
  }
  toggleDownloadButton();
}

toggleDownloadButton();

// buat download gambar
function downloadAsImage(name, index) {
  const captureElement = document.getElementById("image-preview");
  const width = document.getElementById("width").value;
  const height = document.getElementById("height").value;
  captureElement.style.transform = "scale(1)";
  captureElement.style.width = `${width}px`;
  captureElement.style.height = `${height}px`;
  console.log(width, height);
  html2canvas(captureElement, {
    width: width, // custom width
    height: height, // custom height
  }).then(function (canvas) {
    var dataURL = canvas.toDataURL("image/png");
    var link = document.createElement("a");
    link.download = `${name}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    captureElement.style.transform = "scale(0.5)";
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const LHeight = document.getElementById("line-height");
  const textColor = document.getElementById("text-color-picker");
  const name = document.getElementById("name");

  textColor.addEventListener("input", function () {
    name.style.color = textColor.value;
  });
  LHeight.addEventListener("input", function () {
    name.style.lineHeight = LHeight.value + "px";
  });
});
window.addEventListener("DOMContentLoaded", function () {
  hardReload();
});

// Buat validasi kalo misal input name kosong, tombol render result akan disable
const input = document.getElementById("names-input");
const renderBtn = document.getElementById("render-button");
const width = document.getElementById("width");
const height = document.getElementById("height");
input.addEventListener("input", function () {
  if (input.value === "") {
    renderBtn.disabled = true;
  } else {
    renderBtn.disabled = false;
  }
});
// Buat clear all value
function hardReload() {
  const inputName = document.getElementById("names-input");
  const width = document.getElementById("width");
  const height = document.getElementById("height");
  const renderBtn = document.getElementById("render-button");
  const style = document.getElementById("font-family");
  const nameColor = document.getElementById("text-color-picker");
  const lineHeight = document.getElementById("line-height");
  const msgInput = document.getElementById("message-template");

  inputName.value = "";
  width.value = "";
  height.value = "";
  renderBtn.disabled = true;
  style.value = "";
  nameColor.value = "#ffffff";
  lineHeight.value = 67;
  msgInput.value = "";
}
// Buat upload gambar undangannya
document
  .getElementById("upload-invitation")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "photo";
        img.id = "inv-image";

        const oldImg = document.getElementById("inv-image");
        if (oldImg) {
          document.getElementById("image-preview").removeChild(oldImg);
        }

        document.getElementById("image-preview").appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });

// Buat upload font family
document
  .getElementById("font-family")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const fontData = e.target.result;
        const fontName = file.name.split(".")[0];

        const style = document.createElement("style");
        style.innerHTML = `
                @font-face {
                    font-family: '${fontName}';
                    src: url(${fontData});
                }
                #image-preview p {
                    font-family: '${fontName}';
                }
            `;
        document.head.appendChild(style);
      };
      reader.readAsDataURL(file);
    }
  });
function downloadAllImages() {
  const names = document
    .getElementById("names-input")
    .value.split(",")
    .map((name) => name.trim());
  const zip = new JSZip();
  const downloadButtonAll = document.getElementById("download-all-button");
  const captureElement = document.getElementById("image-preview");
  const width = document.getElementById("width").value;
  const height = document.getElementById("height").value;
  captureElement.style.transform = "scale(1)";
  captureElement.style.width = `${width}px`;
  captureElement.style.height = `${height}px`;
  let promises = [];
  downloadButtonAll.textContent = "Downloading...";
  downloadButtonAll.style.backgroundColor = "#faff70";
  downloadButtonAll.style.color = "#000000";

  names.forEach((name, index) => {
    promises.push(
      new Promise((resolve, reject) => {
        const previewText = document.getElementById("name");
        previewText.textContent = name;
        html2canvas(captureElement, {
          width: width,
          height: height,
        })
          .then((canvas) => {
            canvas.toBlob((blob) => {
              zip.file(`${name}.png`, blob);
              resolve();
            });
          })
          .catch((error) => reject(error));
      }),
    );
  });

  Promise.all(promises)
    .then(() => {
      zip.generateAsync({ type: "blob" }).then((content) => {
        setTimeout(() => {
          downloadButtonAll.textContent = "All downloaded";
          downloadButtonAll.style.backgroundColor = "#75ff70";
          downloadButtonAll.style.color = "#000000";
          setTimeout(() => {
            downloadButtonAll.textContent = "Download";
            downloadButtonAll.style.backgroundColor = "#b53df9";
            downloadButtonAll.style.color = "#ffffff";
          }, 3000);
        }, 300);
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        captureElement.style.transform = "scale(0.5)";
      });
    })
    .catch((error) => {
      console.error("Error generating zip file:", error);
    });
}
