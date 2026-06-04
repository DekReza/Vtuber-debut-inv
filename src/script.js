const previewText = document.getElementById("name");
const handlesLayer = document.getElementById("handles-layer"); // New handles layer
const handle = document.getElementById("handle-resize");
const rotateHandle = document.getElementById("handle-rotate");
const leftHandle = document.getElementById("handle-resize-left");
const leftAlignBtn = document.getElementById("left-align");
const centerAlignBtn = document.getElementById("center-align");
const rightAlignBtn = document.getElementById("right-align");
const textBlend = document.getElementById("text-blend");

const alignButtons = document.querySelectorAll(".align-btn");

const MOVE_STEP = 5;
const FAST_STEP = 20;
const FINE_STEP = 1;
let rotation = 0;

let pos = { x: 100, y: 100 };
let scale = 1;

let isDragging = false;
let isResizing = false;

let startMouse = { x: 0, y: 0 };
let startPos = { x: 0, y: 0 };
let startScale = 1;

let isRotating = false;
let center = { x: 0, y: 0 };
let startAngle = 0;
let startRotation = 0;

let isResizingLeft = false;
let startWidth = 0;
let startX = 0;

// Update synchronizes both the text and the invisible handles layer
function update() {
  previewText.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale}) rotate(${rotation}deg)`;

  handlesLayer.style.width = previewText.offsetWidth + "px";
  handlesLayer.style.height = previewText.offsetHeight + "px";
  handlesLayer.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale}) rotate(${rotation}deg)`;
}

previewText.setAttribute("draggable", false);

previewText.addEventListener("dragstart", (e) => {
  e.preventDefault();
});

previewText.addEventListener("mousedown", (e) => {
  handlesLayer.classList.add("selected");

  isDragging = true;
  startMouse.x = e.clientX;
  startMouse.y = e.clientY;
  startPos = { ...pos };
});

handle.addEventListener("mousedown", (e) => {
  e.stopPropagation();
  handlesLayer.classList.add("selected");

  isResizing = true;
  startMouse.x = e.clientX;
  startMouse.y = e.clientY;
  startScale = scale;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    pos.x = startPos.x + (e.clientX - startMouse.x);
    pos.y = startPos.y + (e.clientY - startMouse.y);
    update();
  }

  if (isResizing) {
    const dx = e.clientX - startMouse.x;
    const dy = e.clientY - startMouse.y;
    const delta = (dx + dy) * 0.005;

    scale = Math.max(0.2, startScale + delta);
    update();
  }

  if (isRotating) {
    const angle = Math.atan2(e.clientY - center.y, e.clientX - center.x);
    const delta = angle - startAngle;

    rotation = startRotation + (delta * 180) / Math.PI;
    update();
  }

  if (isResizingLeft) {
    const dx = e.clientX - startMouse.x;
    let newWidth = startWidth - dx;
    newWidth = Math.max(50, newWidth);

    previewText.style.width = newWidth + "px";
    pos.x = startX + dx;
    update();
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  isResizing = false;
  isResizingLeft = false;
});

document.addEventListener("mousedown", (e) => {
  if (!previewText.contains(e.target) && !handlesLayer.contains(e.target)) {
    handlesLayer.classList.remove("selected");
  }
});

rotateHandle.addEventListener("mousedown", (e) => {
  e.stopPropagation();
  e.preventDefault();

  isRotating = true;
  handlesLayer.classList.add("selected");

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

function setActiveAlign(button) {
  alignButtons.forEach((btn) => {
    btn.classList.remove("active-align");
  });
  button.classList.add("active-align");
}

leftAlignBtn.addEventListener("click", () => {
  previewText.style.textAlign = "left";
  setActiveAlign(leftAlignBtn);
});

centerAlignBtn.addEventListener("click", () => {
  previewText.style.textAlign = "center";
  setActiveAlign(centerAlignBtn);
});

rightAlignBtn.addEventListener("click", () => {
  previewText.style.textAlign = "right";
  setActiveAlign(rightAlignBtn);
});

setActiveAlign(leftAlignBtn);

// Blend mode applied directly to parent text layer
textBlend.addEventListener("change", () => {
  previewText.style.mixBlendMode = textBlend.value;
});

leftHandle.addEventListener("mousedown", (e) => {
  e.stopPropagation();
  e.preventDefault();

  isResizingLeft = true;
  handlesLayer.classList.add("selected");

  startMouse.x = e.clientX;
  startWidth = previewText.offsetWidth;
  startX = pos.x;
});

document.addEventListener("keydown", (e) => {
  if (!handlesLayer.classList.contains("selected")) return;

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
    e.preventDefault();
    update();
  }
});

function toggleDownloadButton() {
  const renderedName = document.getElementById("Rendered-name");
  const downloadButton = document.getElementById("download-all-button");
  if (renderedName.innerHTML.trim() === "") {
    downloadButton.classList.add("hidden");
  } else {
    downloadButton.classList.remove("hidden");
  }
}

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

    const topRow = document.createElement("div");
    topRow.className = "name-top-row";

    const nameText = document.createElement("span");
    nameText.textContent = `${index + 1}. ${name}`;

    const downloadButton = document.createElement("button");
    downloadButton.id = "download-button";

    downloadButton.onclick = (e) => {
      e.stopPropagation();
      previewText.textContent = name;
      update();
      downloadAsImage(name, index);
    };

    topRow.appendChild(nameText);
    topRow.appendChild(downloadButton);

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

    nameItem.addEventListener("click", () => {
      previewText.textContent = name;
      update();
      document.querySelectorAll(".name-item").forEach((item) => {
        item.classList.remove("active-name-item");
      });
      nameItem.classList.add("active-name-item");
    });

    container.appendChild(nameItem);
  });

  if (names.length > 0) {
    previewText.textContent = names[0];
    update();
    const firstItem = container.querySelector(".name-item");
    if (firstItem) {
      firstItem.classList.add("active-name-item");
    }
  }
  toggleDownloadButton();
}

toggleDownloadButton();

function downloadAsImage(name, index) {
  const captureElement = document.getElementById("image-preview");
  const invImage = document.getElementById("inv-image");
  const textBlendMode = document.getElementById("text-blend").value;

  const width = invImage.naturalWidth;
  const height = invImage.naturalHeight;

  captureElement.style.transform = "scale(1)";
  captureElement.style.width = `${width}px`;
  captureElement.style.height = `${height}px`;

  invImage.style.display = "none";
  handlesLayer.style.display = "none";

  const currentBlendMode = previewText.style.mixBlendMode;
  previewText.style.mixBlendMode = "normal";

  html2canvas(captureElement, {
    width: width,
    height: height,
    scale: 1,
    backgroundColor: null,
  }).then(function (textCanvas) {
    invImage.style.display = "block";
    handlesLayer.style.display = "block";
    previewText.style.mixBlendMode = currentBlendMode;

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = width;
    finalCanvas.height = height;
    const ctx = finalCanvas.getContext("2d");

    ctx.drawImage(invImage, 0, 0, width, height);

    ctx.globalCompositeOperation =
      textBlendMode === "normal" ? "source-over" : textBlendMode;

    ctx.drawImage(textCanvas, 0, 0);

    var dataURL = finalCanvas.toDataURL("image/png");
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

  textColor.addEventListener("input", function () {
    previewText.style.color = textColor.value;
  });
  LHeight.addEventListener("input", function () {
    previewText.style.lineHeight = LHeight.value + "px";
  });
});

window.addEventListener("DOMContentLoaded", function () {
  hardReload();
});

const input = document.getElementById("names-input");
const renderBtn = document.getElementById("render-button");
input.addEventListener("input", function () {
  if (input.value === "") {
    renderBtn.disabled = true;
  } else {
    renderBtn.disabled = false;
  }
});

function hardReload() {
  const inputName = document.getElementById("names-input");
  const renderBtn = document.getElementById("render-button");
  const style = document.getElementById("font-family");
  const nameColor = document.getElementById("text-color-picker");
  const lineHeight = document.getElementById("line-height");
  const msgInput = document.getElementById("message-template");
  const textBlendSelector = document.getElementById("text-blend");

  inputName.value = "";
  renderBtn.disabled = true;
  style.value = "";
  nameColor.value = "#ffffff";
  lineHeight.value = 67;
  msgInput.value = "";
  textBlendSelector.value = "normal";
}

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
        const previewContainer = document.getElementById("image-preview");

        if (oldImg) {
          previewContainer.removeChild(oldImg);
        }

        previewContainer.insertBefore(img, previewText);
      };
      reader.readAsDataURL(file);
    }
  });

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
                #image-preview p, #image-preview div {
                    font-family: '${fontName}';
                }
            `;
        document.head.appendChild(style);
      };
      reader.readAsDataURL(file);
    }
  });

async function downloadAllImages() {
  const names = document
    .getElementById("names-input")
    .value.split(",")
    .map((name) => name.trim());

  const zip = new JSZip();
  const downloadButtonAll = document.getElementById("download-all-button");
  const captureElement = document.getElementById("image-preview");
  const invImage = document.getElementById("inv-image");
  const textBlendMode = document.getElementById("text-blend").value;

  const width = invImage.naturalWidth;
  const height = invImage.naturalHeight;

  captureElement.style.transform = "scale(1)";
  captureElement.style.width = `${width}px`;
  captureElement.style.height = `${height}px`;

  downloadButtonAll.textContent = "Downloading...";
  downloadButtonAll.style.backgroundColor = "#faff70";
  downloadButtonAll.style.color = "#000000";

  invImage.style.display = "none";
  handlesLayer.style.display = "none";

  const currentBlendMode = previewText.style.mixBlendMode;
  previewText.style.mixBlendMode = "normal";

  try {
    for (const name of names) {
      previewText.textContent = name;
      update();

      const textCanvas = await html2canvas(captureElement, {
        width: width,
        height: height,
        scale: 1,
        backgroundColor: null,
      });

      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = width;
      finalCanvas.height = height;
      const ctx = finalCanvas.getContext("2d");

      ctx.drawImage(invImage, 0, 0, width, height);
      ctx.globalCompositeOperation =
        textBlendMode === "normal" ? "source-over" : textBlendMode;
      ctx.drawImage(textCanvas, 0, 0);

      const blob = await new Promise((resolve) => finalCanvas.toBlob(resolve));
      zip.file(`${name}.png`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });

    setTimeout(() => {
      downloadButtonAll.textContent = "All downloaded";
      downloadButtonAll.style.backgroundColor = "#75ff70";
      downloadButtonAll.style.color = "#000000";
      setTimeout(() => {
        downloadButtonAll.textContent = "Download All";
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
  } catch (error) {
    console.error("Error generating zip file:", error);
  } finally {
    invImage.style.display = "block";
    handlesLayer.style.display = "block";
    previewText.style.mixBlendMode = currentBlendMode;
    captureElement.style.transform = "scale(0.5)";
  }
}
