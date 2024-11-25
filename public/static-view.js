/* global PGCodeMirrorEditor */

const codeMirrorElt = document.querySelector('.pg-codemirror-view');

if (codeMirrorElt instanceof HTMLElement) {
    const sourceInput = document.getElementsByName('view-source')[0];
    PGCodeMirrorEditor.runMode(sourceInput.value, codeMirrorElt);

    document.getElementById('load-file')?.addEventListener('click', () => {
        const file = document.getElementsByName('problem-file')[0]?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.addEventListener('load', () => {
                sourceInput.value = reader.result;
                PGCodeMirrorEditor.runMode(sourceInput.value, codeMirrorElt);
            });
        }
    });
}
