import { EditorState } from '@codemirror/state';
import {
    EditorView,
    lineNumbers,
    highlightActiveLineGutter,
    highlightSpecialChars,
    drawSelection,
    dropCursor,
    rectangularSelection,
    crosshairCursor,
    highlightActiveLine,
    highlightTrailingWhitespace,
    keymap
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, foldGutter, foldKeymap, indentOnInput, indentUnit } from '@codemirror/language';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { lintKeymap } from '@codemirror/lint';
import { vim } from '@replit/codemirror-vim';
import { oneDark } from '@codemirror/theme-one-dark';
//import { lightTheme } from './light-theme';
import { pg } from 'codemirror-lang-pg';

const extensions = [
    vim(),
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentUnit.of('    '),
    EditorState.tabSize.of(4),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightTrailingWhitespace(),
    highlightSelectionMatches(),
    keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap,
        indentWithTab
    ]),
    pg(),
    //lightTheme
    oneDark
];

export interface InitializationOptions {
    source?: string;
}

export class PGCodeMirrorEditor {
    private source = '';
    private view: EditorView;

    constructor(
        private element: HTMLElement,
        options?: InitializationOptions
    ) {
        if (options?.source) this.source = options.source;
        this.view = new EditorView({
            state: EditorState.create({ extensions, doc: this.source }),
            parent: this.element
        });
    }

    setSource(source: string) {
        this.source = source;
        this.view.setState(EditorState.create({ doc: this.source, extensions }));
    }
}
