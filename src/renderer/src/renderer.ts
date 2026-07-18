import { arrayBufferToImageData, init } from "../scanners/mikroblink"

function getHTMLElements() {
    return {
        input: document.querySelector<HTMLInputElement>('#input'),
        preview: document.querySelector<HTMLDivElement>('#preview'),
    };
}

function assertExists<T>(element:T | null | undefined, message:string):asserts element is T{
    if(element == null || element == undefined) throw new Error(message);
}

function getInputFile(fileSource:HTMLInputElement | DataTransfer):File{
    const file = fileSource.files?.[0];
    assertExists(file,'No file in input');
    return file;
}

function renderImage(image:HTMLImageElement, place:HTMLDivElement){
    place.replaceChildren(image);
}

function createImage(file:File) : HTMLImageElement {
    const image = document.createElement('img');
    const imageURL = URL.createObjectURL(file);
    image.onload = () => URL.revokeObjectURL(imageURL);
    image.src = imageURL;
    return image;
}

function showPreview(file:File, place:HTMLDivElement){
    const image = createImage(file);
    renderImage(image, place);
}

async function sendImageToMainProcess(file:File){
    const buffer = await file.arrayBuffer();
    const answer = await window.rendererAPI.sendImageForProcessing(buffer);
    const preprocessedImage = await arrayBufferToImageData(buffer);
    const session = await init();
    await session.process(preprocessedImage);
    const result = await session.getResult();
    console.log(result);
    console.log(answer);
}

async function handleFile(file:File, preview:HTMLDivElement){
    showPreview(file, preview);
    await sendImageToMainProcess(file);
}

const {input, preview} = getHTMLElements();

assertExists(input, 'Can not find input element on HTML page');
assertExists(preview, 'Can not find preview element on HTML page');

input.addEventListener('change', () => {
    const file = getInputFile(input);
    handleFile(file, preview);
});

preview.addEventListener('dragover', (event) => {
    event.preventDefault();
});

preview.addEventListener('dragenter', () => {
    preview.classList.add('dragging');
});


preview.addEventListener('dragleave', () => {
    preview.classList.remove('dragging');
});

preview.addEventListener('drop', (event) => {
    event.preventDefault();
    preview.classList.remove('dragging');
    assertExists(event.dataTransfer, 'Nothing had dropped');
    const file = getInputFile(event.dataTransfer);
    handleFile(file, preview);
});