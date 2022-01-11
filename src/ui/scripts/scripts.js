
// Setting up all dom elements we use 
const canvas = document.createElement('canvas')

const buttonAddImage = document.getElementById("buttonAddImage")
const buttonSwapImage = document.getElementById("buttonSwapImage")
const formColors = document.getElementById("formColors")
const colorHexInput = document.getElementsByClassName("ColorHexInput");
const colorPickers = document.getElementsByClassName("colorpicker");
const colorOpacityInput = document.getElementsByClassName("ColorOpacityInput");


const inputDuotoneFromHex = document.getElementById("inputDuotoneFromHex")
const inputDuotoneToHex = document.getElementById("inputDuotoneToHex")
const inputOverlayTopHex = document.getElementById("inputOverlayTopHex")
const inputOverlayBottomHex = document.getElementById("inputOverlayBottomHex")

const inputDuotoneFromHexPicker = document.getElementById("inputDuotoneFromHexPicker")
const inputDuotoneToHexPicker = document.getElementById("inputDuotoneToHexPicker")
const inputOverlayTopHexPicker = document.getElementById("inputOverlayTopHexPicker")
const inputOverlayBottomHexPicker = document.getElementById("inputOverlayBottomHexPicker")

const inputOverlayTopOpacity = document.getElementById("inputOverlayTopOpacity")
const inputOverlayBottomOpacity = document.getElementById("inputOverlayBottomOpacity")


// Setting up the colors for both Duotone and Overlay
let aColors = [
    {'duotoneFromHex' : {'input' : 'inputDuotoneFromHex', 'picker' : 'inputDuotoneFromHexPicker', 'value' : '0A5252', 'colortype': 'hex'}},
    {'duotoneToHex' : {'input' : 'inputDuotoneToHex', 'picker' : 'inputDuotoneFromHexPicker', 'value' : 'D1F8FF', 'colortype': 'hex'}},
    {'overlayTopHex' : {'input' : 'inputOverlayTopHex', 'picker' : 'inputDuotoneFromHexPicker', 'value' : '002E2D', 'colortype': 'hex'}},
    {'overlayBottomHex' : {'input' : 'inputOverlayBottomHex', 'picker' : 'inputDuotoneFromHexPicker', 'value' : '002E2D', 'colortype': 'hex'}},
]

let aOpacity = [
    {'overlayTopOpacity' : {'input' : 'inputOverlayTopOpacity', 'picker' : 'inputDuotoneFromHexPicker', 'value' : '.9', 'colortype': 'alpha'}},
    {'overlayBottomOpacity' : {'input' : 'inputOverlayBottomOpacity', 'picker' : 'inputDuotoneFromHexPicker', 'value' : '.05', 'colortype': 'alpha'}},
]


function getColorByName (name) {
    const obj =  aColors.find(o => o[name]) // Finding the right object
    return obj[name] // Using the object and referencing it again to get the object properties
}

function getOpacityByName (name) {
    const obj =  aOpacity.find(o => o[name]) // Finding the right object
    return obj[name] // Using the object and referencing it again to get the object properties
}

function setColorByName (name, color) {
    // console.log(name, color)
    const obj =  aColors.find(o => o[name]) // Finding the right object

    if (obj[name].colortype === "hex" && checkValidHex(color)) {
        obj[name].value = color
        updateForm()
        svgUpdate()
    }
}

function setOpacityByName (name, color) {
    // console.log(name, color)
    const obj =  aOpacity.find(o => o[name]) // Finding the right object

   if (obj[name].colortype === "alpha" && checkValidAlpha(color)) {
        obj[name].value = color
        updateForm()
        svgUpdate()
    }
}

let duotoneFromHex
let duotoneToHex
let overlayTopHex
let overlayBottomHex
let overlayTopOpacity
let overlayBottomOpacity

function updateForm () {
    duotoneFromHex = getColorByName ('duotoneFromHex')
    duotoneToHex = getColorByName ('duotoneToHex')
    overlayTopHex = getColorByName ('overlayTopHex')
    overlayBottomHex = getColorByName ('overlayBottomHex')
    overlayTopOpacity = getOpacityByName ('overlayTopOpacity')
    overlayBottomOpacity = getOpacityByName ('overlayBottomOpacity')

    inputDuotoneFromHex.value = duotoneFromHex.value.toUpperCase()
    inputDuotoneFromHexPicker.value = "#" + duotoneFromHex.value.toUpperCase()
    inputDuotoneToHex.value = duotoneToHex.value.toUpperCase()
    inputDuotoneToHexPicker.value = "#" + duotoneToHex.value.toUpperCase()
    inputOverlayTopHex.value = overlayTopHex.value.toUpperCase()
    inputOverlayTopHexPicker.value = "#" + overlayTopHex.value.toUpperCase()
    inputOverlayBottomHex.value = overlayBottomHex.value.toUpperCase()
    inputOverlayBottomHexPicker.value = "#" + overlayBottomHex.value.toUpperCase()
    inputOverlayTopOpacity.value = overlayTopOpacity.value.toUpperCase()
    inputOverlayBottomOpacity.value = overlayBottomOpacity.value.toUpperCase()
}

updateForm()

for (var i = 0; i < colorHexInput.length; i++) {
    colorHexInput[i].addEventListener('input', (event) => {
        const val = event.target.value
        setColorByName(event.target.dataset.name, val)
    })
}

for (var i = 0; i < colorPickers.length; i++) {
    colorPickers[i].addEventListener('input', (event) => {
        const val = event.target.value.replace('#', '')  // Remove # from value
        setColorByName(event.target.dataset.name, val)
    })
}

for (var i = 0; i < colorOpacityInput.length; i++) {
    colorOpacityInput[i].addEventListener('input', (event) => {
        const val = event.target.value
        setOpacityByName(event.target.dataset.name, val)
    })
}


function handleImageFromFigma () {
    parent.postMessage({ pluginMessage: {type: 'getImageFromSelection'}}, '*')
};
buttonAddImage.onclick = function() {
    handleImageFromFigma()
}	

// async function swapImage (canvas, ctx, imageData) {
async function swapImage (canvas, ctx, svg) {
    const imageData = await svgToCanvas(svg)
    
    const newBytes = await encode(canvas, ctx, imageData)
    parent.postMessage({ pluginMessage: {type:"swapImageInFigma", bytes: newBytes }}, '*')
};

// Create an event handler to receive messages from the main thread
window.onmessage = async (event) => {
    // Hide text in SBG when we add image from Figma
    document.getElementById("svgText").style.display = "none" 
    // Enable the "Apply changes" button
    buttonSwapImage.classList.remove("disabled");

    const bytes = event.data.pluginMessage
    const ctx = canvas.getContext('2d')
    const svg = await decode(canvas, ctx, bytes)

    // When the image is decoded we can 
    buttonSwapImage.onclick = function() {
        // swapImage (canvas, ctx, imageData)
        swapImage (canvas, ctx, svg)
    }
}

// Encoding an image is also done by sticking pixels in an HTML canvas and by asking the canvas to serialize it into an actual PNG file via canvas.toBlob()
async function encode(canvas, ctx, imageData) {
    ctx.putImageData(imageData, 0, 0)

    return await new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            const reader = new FileReader()
            reader.onload = () => resolve(new Uint8Array(reader.result))
            reader.onerror = () => reject(new Error('Could not read from blob'))
            reader.readAsArrayBuffer(blob)
        })
    })
}

// Decoding an image can be done by sticking it in an HTML canvas, since we can read individual pixels off the canvas.
async function decode(canvas, ctx, bytes) {

    const url = URL.createObjectURL(new Blob([bytes]))

    const image = await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject()
        img.src = url
    })

    canvas.width = image.width
    canvas.height = image.height
    ctx.drawImage(image, 0, 0)

    const dataURL = canvas.toDataURL();

    svgFilterSetup()

    // Create image for duotone in the SVG
    const svgImg = document.getElementById("svgImg");
    svgImg.setAttribute( "href", dataURL);
    svgImg.setAttribute( "filter", "url(#svgDuotone)");

    // Create rect for overlay in the SVG
    const svgRect = document.getElementById("svgRect");
    svgRect.setAttribute("fill", "url(#svgOverlay)");

    return document.getElementById("theSvg")
}

function svgFilterSetup () {
    const svg = document.getElementById("theSvg")
    svg.setAttribute("viewBox","0 0 " + canvas.width + " " +  canvas.height)
    svg.setAttribute("width",canvas.width)
    svg.setAttribute("height",canvas.height)
    
    // Create Duotone gradient filter
    const feFuncR = document.getElementById("feFuncR");
    const feFuncG = document.getElementById("feFuncG");
    const feFuncB = document.getElementById("feFuncB");

    feFuncR.setAttribute("tableValues",(hexToRgb(duotoneFromHex.value).r/256) + " " + (hexToRgb(duotoneToHex.value).r/256));
    feFuncG.setAttribute("tableValues",(hexToRgb(duotoneFromHex.value).g/256) + " " + (hexToRgb(duotoneToHex.value).g/256));
    feFuncB.setAttribute("tableValues",(hexToRgb(duotoneFromHex.value).b/256) + " " + (hexToRgb(duotoneToHex.value).b/256));

    // Create Overlay gradient filter
    const overlayTop = document.getElementById("overlayTop");
    const overlayBottom = document.getElementById("overlayBottom");
    overlayTop.setAttribute("stop-color","#" + overlayTopHex.value + alphaToHex(overlayTopOpacity.value));
    overlayBottom.setAttribute("stop-color","#" + overlayBottomHex.value + alphaToHex(overlayBottomOpacity.value));
}

function svgUpdate () {

    svgFilterSetup()

    // Create image for duotone in the SVG
    const svgImg = document.getElementById("svgImg");
    // svgImg.setAttribute( "href", dataURL);
    svgImg.setAttribute( "filter", "url(#svgDuotone)");

    // Create rect for overlay in the SVG
    const svgRect = document.getElementById("svgRect");
    svgRect.setAttribute("fill", "url(#svgOverlay)");

}

async function svgToCanvas(svg){
    let {width, height} = svg.getBBox(); 
    let clonedSvgElement = svg.cloneNode(true);
    let outerHTML = clonedSvgElement.outerHTML, blob = new Blob([outerHTML],{type:'image/svg+xml;charset=utf-8'});
    let blobURL = URL.createObjectURL(blob);

    const canvas = document.createElement('canvas')
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');

    // var img = document.querySelector('img');
    const img = document.createElement('img')

    var xml = new XMLSerializer().serializeToString(svg);
    var svg64 = btoa(xml);

    var image64 = 'data:image/svg+xml;base64,' + svg64;

    const image = await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject()
        img.src = image64;
    })
    
    context.drawImage(image, 0, 0 );
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    return imageData

}

////////
// Helpers
////////

function hexToRgb(hex) {
    // console.log("hex", hex)
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    // console.log("rgb", result)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function alphaToHex(_opacity) {
    let hexOpacity = Math.round(Math.min(Math.max(_opacity || 1, 0), 1) * 255).toString(16).toUpperCase();

    // Little hack when the opacity is too low and we only get one letter
    if (hexOpacity.length < 2) {
        hexOpacity = "0" + hexOpacity;
    }
    return hexOpacity
}

function checkValidHex (potentialHex) {
    const reg=/^#([0-9a-f]{3}){1,2}$/i;
    if (reg.test("#"+potentialHex)) {
        return true
    } else {
        parent.postMessage({ pluginMessage: {type:"figmaNotification", note: "Not a valid hex color" }}, '*')
        return false
    }
}

function checkValidAlpha (potentialAlpha) {
    if (potentialAlpha >= 0 && potentialAlpha <= 1) {
        return true
    } else {
        parent.postMessage({ pluginMessage: {type:"figmaNotification", note: "Not a valid alpha value" }}, '*')
        return false
    }
}