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
//import { perl } from 'codemirror-lang-perl';
//import { pg } from 'codemirror-lang-pg';

import { vim } from '@replit/codemirror-vim';

//import { lightTheme } from './light-theme';
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
    StreamLanguage.define(PG),
    //perl(),
    //pg(),
    //lightTheme
    oneDark
];

const createView = (elt: HTMLElement, doc = '') => {
    return new EditorView({ state: EditorState.create({ extensions, doc }), parent: elt });
};

export { extensions, createView };
