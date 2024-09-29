import { PGCodeMirrorEditor } from 'src/pg-codemirror-editor';
import 'src/app.scss';

const codeMirrorElt = document.querySelector('.pg-codemirror-editor');
if (codeMirrorElt instanceof HTMLElement) {
    const sourceInput = document.getElementsByName('editor-source')[0] as HTMLInputElement;
    const pgEditor = new PGCodeMirrorEditor(codeMirrorElt, { source: sourceInput.value });

    document.getElementById('load-file')?.addEventListener('click', () => {
        const file = (document.getElementsByName('problem-file')[0] as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.addEventListener('load', () => {
                sourceInput.value = reader.result as string;
                pgEditor.source = sourceInput.value;
            });
        }
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
