import { PGCodeMirrorEditor } from 'src/pg-codemirror-editor';
import 'src/style.scss';

const codeMirrorElt = document.querySelector('.pg-codemirror-editor');
if (codeMirrorElt instanceof HTMLElement) {
    const sourceInput = document.getElementsByName('editor-source')[0] as HTMLInputElement;
    const view = new PGCodeMirrorEditor(codeMirrorElt, { source: sourceInput.value });

    document.getElementById('load-file')?.addEventListener('click', () => {
        const file = (document.getElementsByName('problem-file')[0] as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.addEventListener('load', () => {
                sourceInput.value = reader.result as string;
                view.setSource(sourceInput.value);
            });
        }
    });
}
