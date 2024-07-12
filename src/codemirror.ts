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
    keymap
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
    StreamLanguage,
    bracketMatching,
    foldGutter,
    foldKeymap,
    indentOnInput,
    indentUnit
} from '@codemirror/language';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { lintKeymap } from '@codemirror/lint';

import { PG } from 'src/PG';
//import { perl } from '@codemirror/legacy-modes/mode/perl';
//import { perl } from '../lang-perl';

import { vim } from '@replit/codemirror-vim';
import { oneDark } from '@codemirror/theme-one-dark';

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
    StreamLanguage.define(PG),
    //StreamLanguage.define(perl),
    //perl(),
    oneDark
];

const createView = (elt: HTMLElement, doc = '') => {
    return new EditorView({ state: EditorState.create({ extensions, doc }), parent: elt });
};

export { extensions, createView };
