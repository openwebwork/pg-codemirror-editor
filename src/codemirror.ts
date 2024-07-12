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
    //defaultHighlightStyle,
    foldGutter,
    foldKeymap,
    indentOnInput,
    indentUnit
    //syntaxHighlighting
} from '@codemirror/language';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { lintKeymap } from '@codemirror/lint';

//import { javascript } from '@codemirror/lang-javascript';
//import { javascript } from '@codemirror/legacy-modes/mode/javascript';
//import { perl } from '@codemirror/legacy-modes/mode/perl';
import { PG } from './PG';
//import { perl } from '../lang-perl';

import { vim } from '@replit/codemirror-vim';
import { oneDark } from '@codemirror/theme-one-dark';
//import { materialDark } from 'cm6-theme-material-dark';

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
    //syntaxHighlighting(defaultHighlightStyle, { fallback: true }), // default theme syntax highlighting
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

    //javascript(),
    //StreamLanguage.define(javascript),
    //StreamLanguage.define(perl),
    StreamLanguage.define(PG),
    //perl(),

    //materialDark,
    oneDark
];

const createView = (elt: HTMLElement, doc = '') => {
    return new EditorView({ state: EditorState.create({ extensions, doc }), parent: elt });
};

export { extensions, createView };
