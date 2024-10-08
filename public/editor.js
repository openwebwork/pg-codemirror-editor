/* global PGCodeMirrorEditor */

const codeMirrorElt = document.querySelector('.pg-codemirror-editor');

if (codeMirrorElt instanceof HTMLElement) {
    const sourceInput = document.getElementsByName('editor-source')[0];
    const languageSelector = document.getElementById('select-language');
    const pgEditor = new PGCodeMirrorEditor.View(codeMirrorElt, {
        source: sourceInput.value,
        language: languageSelector?.value ?? 'pg'
    });

    document.getElementById('load-file')?.addEventListener('click', () => {
        const file = document.getElementsByName('problem-file')[0]?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.addEventListener('load', () => {
                sourceInput.value = reader.result;
                pgEditor.source = sourceInput.value;
            });
        }
    });

    languageSelector?.addEventListener('change', () => {
        pgEditor.setLanguage(languageSelector.value);
    });

    document.getElementById('get-source')?.addEventListener('click', () => {
        const element = document.createElement('a');
        element.href = `data:text/plain;charset=utf-8,${encodeURIComponent(pgEditor.source)}`;
        element.download = 'contents.pg';
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    });
}
