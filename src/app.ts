import { createView, extensions } from './codemirror';
import { EditorState } from '@codemirror/state';
import './style.scss';

const codeMirrorElt = document.createElement('div');
codeMirrorElt.id = 'codemirror-editor';
codeMirrorElt.classList.add('codemirror-editor');
document.getElementById('main-content')?.append(codeMirrorElt);
const view = createView(codeMirrorElt, (document.getElementById('problemSource') as HTMLInputElement)?.value ?? '');

document.getElementById('load-file').addEventListener('click', () => {
	const file = (document.getElementById('problemFile') as HTMLInputElement)?.files[0];
	if (file) {
		const reader = new FileReader();
		reader.readAsText(file);
		reader.addEventListener('load', () =>
			view.setState(EditorState.create({ doc: reader.result as string, extensions }))
		);
	}
});

//console.log(view.state.doc.toString());
