var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var theFill;
var thePaint;
/*
TODO

- Kolla alltid om det är något lager valt
    - om det inte är det så visa text i UI som säger det
    - är det felaktigt lager så säg det
    - är det flera lager så säg det
- Om användaren byter lager, gör om allt
- Lägg till reglage/inputs för att uppdatera färger
- Lägg till knapp för att uppdatera bilden i Figma

*/
figma.showUI(__html__, { width: 480, height: 600 });
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    if (msg.type === 'swapImageInFigma') {
        const newBytes = msg.bytes;
        // Create a new paint for the new image. Uploading the image will give us an image hash.
        const newPaint = JSON.parse(JSON.stringify(thePaint));
        newPaint.imageHash = figma.createImage(newBytes).hash;
        const theFills = [newPaint];
        theFill.fills = theFills;
    }
    if (msg.type === 'getImageFromSelection') {
        if (figma.currentPage.selection.length === 0) {
            figma.notify('Please select an image', {
                timeout: 2000,
            });
        }
        else if (figma.currentPage.selection.length > 0 && figma.currentPage.selection.length < 2) {
            const currentSelection = figma.currentPage.selection[0];
            // @ts-ignore  since fills creates TS error
            if (currentSelection.fills.length > 0 && currentSelection.fills.length < 2 && currentSelection.fills[0].type === 'IMAGE') {
                theFill = currentSelection;
                // @ts-ignore  since fills creates TS error
                thePaint = currentSelection.fills[0];
                // Paints reference image by their hash
                const image = figma.getImageByHash(thePaint.imageHash);
                // Get the bytes of file stored in PNG format
                const bytes = yield image.getBytesAsync();
                // Send the raw bytes of the file to the worker
                figma.ui.postMessage(bytes);
            }
            else {
                figma.notify("You have multiple layers in your object or it's not a image fill", {
                    timeout: 2000,
                });
            }
        }
        else if (figma.currentPage.selection.length >= 2) {
            figma.notify('You have multiple object selected, please select only one image', {
                timeout: 2000,
            });
        }
    }
    if (msg.type === 'figmaNotification') {
        figma.notify(msg.note, {
            timeout: 2000,
        });
    }
});
