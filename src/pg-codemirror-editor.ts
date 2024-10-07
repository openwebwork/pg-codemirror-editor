import type { Extension, StateCommand, Transaction } from '@codemirror/state';
import { EditorState, Compartment } from '@codemirror/state';
import type { Panel } from '@codemirror/view';
import {
    EditorView,
    crosshairCursor,
    drawSelection,
    dropCursor,
    highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars,
    highlightTrailingWhitespace,
    keymap,
    lineNumbers,
    rectangularSelection,
    showPanel
} from '@codemirror/view';
import {
    CommentTokens,
    defaultKeymap,
    history,
    historyKeymap,
    indentWithTab,
    toggleLineComment,
    toggleBlockCommentByLine
} from '@codemirror/commands';
import { bracketMatching, foldGutter, foldKeymap, indentOnInput, indentUnit, syntaxTree } from '@codemirror/language';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import type { SyntaxNode } from '@lezer/common';
import { lightTheme } from 'src/light-theme';
import 'src/pg-codemirror-editor.scss';

export interface InitializationOptions {
    language?: string;
    source?: string;
    theme?: string;
    keyMap?: string;
}

// FIXME: This is highly inefficient. It scans to the top of the document every time toggleComment is called.
const inDescriptionBlock = (state: EditorState, currentPos: number) => {
    let line;
    for (let pos = currentPos - 1; pos > 0; pos = line.from - 1) {
        line = state.doc.lineAt(pos);
        if (/^\s*#{0,2}\s*ENDDESCRIPTION/.test(line.text)) return false;
        if (/^\s*#{0,2}\s*DESCRIPTION/.test(line.text)) return true;
    }
    return false;
};

const inLatexImageBlock = (state: EditorState, currentPos: number) => {
    let inHeredoc = false;
    for (let pos: SyntaxNode | null = syntaxTree(state).resolveInner(currentPos, 1); pos; pos = pos.parent) {
        if (pos.name === 'HeredocEndIdentifier') break;
        if (pos.name === 'InterpolatedHeredocBody') inHeredoc = true;
        if (pos.name === 'LaTeXImageCode') return inHeredoc;
        if (pos.type.isTop) break;
    }
    return false;
};

const toggleComment: StateCommand = (target: { state: EditorState; dispatch: (transaction: Transaction) => void }) => {
    const line = target.state.doc.lineAt(target.state.selection.main.from);
    const data: readonly CommentTokens[] = target.state.languageDataAt('commentTokens', line.from);
    const config = data.length ? data[0] : {};

    if (config.line) {
        if (
            RegExp(
                '^\\s*#{0,2}\\s*(DESCRIPTION|KEYWORDS|DBsubject|DBchapter|DBsection|Date|Author|Institution' +
                    '|MO|Static|TitleText|EditionText|AuthorText|Section|Problem|Language|Level)'
            ).test(line.text) ||
            inDescriptionBlock(target.state, line.from)
        )
            config.line = '##';
        else if (inLatexImageBlock(target.state, target.state.selection.main.from)) config.line = '%';
        else config.line = '#';
    }

    // Note that config.line will not be set in a PGML or PG text block.  The config.block setting will be used in a
    // PGML block, and PG text blocks don't have comments.
    return config.line ? toggleLineComment(target) : config.block ? toggleBlockCommentByLine(target) : false;
};

export class View {
    private static instanceCount = 0;

    private view: EditorView;
    private instance: number;

    private keyMapSelect?: HTMLSelectElement;
    private themeSelect?: HTMLSelectElement;

    private keyMap = new Compartment();
    private theme = new Compartment();
    private language = new Compartment();

    private extensions = [
        this.keyMap.of([]),
        lineNumbers(),
        EditorView.lineWrapping,
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
            { key: 'Mod-/', run: toggleComment },
            ...defaultKeymap.filter((k) => k.key !== 'Mod-Enter'),
            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...completionKeymap,
            indentWithTab
        ]),
        this.theme.of(lightTheme),
        this.language.of([])
    ];

    private currentLanguage = 'pg';
    private languages = new Map<string, () => Promise<Extension>>([
        ['pg', async () => (await import(/* webpackChunkName: 'pg' */ 'codemirror-lang-pg')).pg()],
        ['perl', async () => (await import(/* webpackChunkName: 'perl' */ 'codemirror-lang-perl')).perl()],
        ['html', async () => (await import(/* webpackChunkName: 'html' */ '@codemirror/lang-html')).html()],
        ['xml', async () => (await import(/* webpackChunkName: 'xml' */ '@codemirror/lang-xml')).xml()]
    ]);

    private currentKeyMap = 'Default';
    private keyMaps = new Map<string, Extension | (() => Promise<Extension>)>([
        ['Default', []],
        ['Emacs', async () => (await import(/* webpackChunkName: 'emacs' */ '@replit/codemirror-emacs')).emacs()],
        ['Vim', async () => (await import(/* webpackChunkName: 'vim' */ '@replit/codemirror-vim')).vim()]
    ]);

    private currentTheme = 'Default';
    private themes = new Map<string, Extension | (() => Promise<Extension>)>([
        ['Default', lightTheme],
        ['Amy', async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).amy],
        ['Ayu Light', async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).ayuLight],
        ['Barf', async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).barf],
        [
            'Basic Dark',
            async () => (await import(/* webpackChunkName: 'basic-dark' */ 'cm6-theme-basic-dark')).basicDark
        ],
        [
            'Basic Light',
            async () => (await import(/* webpackChunkName: 'basic-light' */ 'cm6-theme-basic-light')).basicLight
        ],
        ['Bespin', async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).bespin],
        [
            'Birds of Paradise',
            async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).birdsOfParadise
        ],
        [
            'Boys and Girls',
            async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).boysAndGirls
        ],
        ['Clouds', async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).clouds],
        ['Cobalt', async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).cobalt],
        ['Cool Glow', async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).coolGlow],
        ['Dracula', async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).dracula],
        ['Espresso', async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).espresso],
        [
            'Gruvbox Dark',
            async () => (await import(/* webpackChunkName: 'gruvbox-dark' */ 'cm6-theme-gruvbox-dark')).gruvboxDark
        ],
        [
            'Gruvbox Light',
            async () => (await import(/* webpackChunkName: 'gruvgox-light' */ 'cm6-theme-gruvbox-light')).gruvboxLight
        ],
        [
            'Material Dark',
            async () => (await import(/* webpackChunkName: 'material-dark' */ 'cm6-theme-material-dark')).materialDark
        ],
        ['Noctis Lilac', async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).noctisLilac],
        ['Nord', async () => (await import(/* webpackChunkName: 'nord' */ 'cm6-theme-nord')).nord],
        [
            'One Dark',
            async () => (await import(/* webpackChunkName: 'one-dark' */ '@codemirror/theme-one-dark')).oneDark
        ],
        [
            'Rose Pine Dawn',
            async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).rosePineDawn
        ],
        ['Smoothy', async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).smoothy],
        [
            'Solarized Dark',
            async () =>
                (await import(/* webpackChunkName: 'solarized-dark' */ 'cm6-theme-solarized-dark')).solarizedDark
        ],
        [
            'Solarized Light',
            async () =>
                (await import(/* webpackChunkName: 'solarized-light' */ 'cm6-theme-solarized-light')).solarizedLight
        ],
        [
            'Solarized Light 2',
            async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).solarizedLight
        ],
        ['Tomorrow', async () => (await import(/* webpackChunkName: 'thememirror' */ 'thememirror')).tomorrow]
    ]);

    constructor(
        private element: HTMLElement,
        options?: InitializationOptions
    ) {
        this.instance = ++View.instanceCount;
        const doc = options?.source ?? '';

        this.extensions.push(
            showPanel.of((view: EditorView): Panel => {
                const dom = document.createElement('div');
                dom.classList.add('pg-cm-toolbar');

                const themeDiv = document.createElement('div');
                themeDiv.classList.add('pg-cm-toolbar-item');
                this.themeSelect = document.createElement('select');
                this.themeSelect.id = 'pg-cm-theme-changer';
                const themeLabel = document.createElement('label');
                themeLabel.textContent = 'Theme: ';
                themeLabel.setAttribute('for', 'pg-cm-theme-changer');
                for (const theme of this.themes.keys()) {
                    const option = document.createElement('option');
                    option.value = theme;
                    option.textContent = theme;
                    if (option.value === this.currentTheme) option.selected = true;
                    this.themeSelect.append(option);
                }
                this.themeSelect.addEventListener('change', () => {
                    if (this.themeSelect) void this.setTheme(this.themeSelect.value);
                });
                themeDiv.append(themeLabel, this.themeSelect);
                dom.append(themeDiv);

                const keyMapDiv = document.createElement('div');
                keyMapDiv.classList.add('pg-cm-toolbar-item');
                this.keyMapSelect = document.createElement('select');
                this.keyMapSelect.id = `pg-cm-key-map-changer-${this.instance.toString()}`;
                const keyMapLabel = document.createElement('label');
                keyMapLabel.textContent = 'Key Map: ';
                keyMapLabel.setAttribute('for', this.keyMapSelect.id);
                for (const keyMap of this.keyMaps.keys()) {
                    const option = document.createElement('option');
                    option.value = keyMap;
                    option.textContent = keyMap;
                    if (option.value === this.currentKeyMap) option.selected = true;
                    this.keyMapSelect.append(option);
                }
                this.keyMapSelect.addEventListener('change', () => {
                    if (this.keyMapSelect) void this.setKeyMap(this.keyMapSelect.value);
                });
                keyMapDiv.append(keyMapLabel, this.keyMapSelect);
                dom.append(keyMapDiv);

                const spellDiv = document.createElement('div');
                spellDiv.classList.add('pg-cm-toolbar-item');
                const spellToggle = document.createElement('input');
                spellToggle.name = 'pg-cm-spell-toggle';
                spellToggle.type = 'checkbox';
                spellToggle.id = `pg-cm-spell-toggle-${this.instance.toString()}`;
                const spellToggleLabel = document.createElement('label');
                spellToggleLabel.setAttribute('for', spellToggle.id);
                spellToggleLabel.textContent = 'Enable Spell Checking';
                spellToggle.addEventListener('change', () => {
                    const content = view.dom.querySelector('.cm-content');
                    content?.setAttribute('spellcheck', spellToggle.checked ? 'true' : 'false');
                    (content as HTMLElement).focus();
                });
                spellDiv.append(spellToggle, spellToggleLabel);
                dom.append(spellDiv);

                const directionDiv = document.createElement('div');
                directionDiv.classList.add('pg-cm-toolbar-item');
                const directionToggle = document.createElement('input');
                directionToggle.name = 'pg-cm-direction-toggle';
                directionToggle.type = 'checkbox';
                directionToggle.id = `pg-cm-direction-toggle-${this.instance.toString()}`;
                const directionToggleLabel = document.createElement('label');
                directionToggleLabel.setAttribute('for', directionToggle.id);
                directionToggleLabel.textContent = 'Force RTL';
                directionToggle.addEventListener('change', () => {
                    const scroller = view.dom.querySelector('.cm-scroller');
                    if (!scroller) return;
                    (scroller as HTMLElement).style.direction = directionToggle.checked ? 'rtl' : 'ltr';
                });
                directionDiv.append(directionToggle, directionToggleLabel);
                dom.append(directionDiv);

                return { dom };
            })
        );

        this.view = new EditorView({
            state: EditorState.create({ doc, extensions: this.extensions }),
            parent: this.element
        });

        const selectedLanguage = options?.language ?? 'pg';
        void this.setLanguage(selectedLanguage);

        const selectedKeyMap = localStorage.getItem('pg-cm-editor.key-map') ?? options?.keyMap ?? 'Default';
        if (selectedKeyMap !== 'Default') void this.setKeyMap(selectedKeyMap);
        const selectedTheme = localStorage.getItem('pg-cm-editor.theme') ?? options?.theme ?? 'Default';
        if (selectedTheme !== 'Default') void this.setTheme(selectedTheme);
    }

    set source(doc: string) {
        this.view.setState(EditorState.create({ doc, extensions: this.extensions }));
        void this.setLanguage(this.currentLanguage);
        void this.setTheme(this.currentTheme);
        void this.setKeyMap(this.currentKeyMap);
    }

    get source() {
        return this.view.state.doc.toString();
    }

    async setLanguage(languageName: string) {
        const language = this.languages.get(languageName);
        if (language) {
            this.currentLanguage = languageName;
            this.view.dispatch({ effects: this.language.reconfigure(await language()) });
        }
    }

    async setTheme(themeName: string) {
        const theme = this.themes.get(themeName);
        if (theme) {
            this.currentTheme = themeName;
            localStorage.setItem('pg-cm-editor.theme', themeName);
            if (this.themeSelect) this.themeSelect.value = themeName;
            this.view.dispatch({
                effects: this.theme.reconfigure(typeof theme === 'function' ? await theme() : theme)
            });
        }
    }

    async setKeyMap(keyMapName: string) {
        const keyMap = this.keyMaps.get(keyMapName);
        if (keyMap) {
            this.currentKeyMap = keyMapName;
            localStorage.setItem('pg-cm-editor.key-map', keyMapName);
            if (this.keyMapSelect) this.keyMapSelect.value = keyMapName;
            this.view.dispatch({
                effects: this.keyMap.reconfigure(typeof keyMap === 'function' ? await keyMap() : keyMap)
            });
        }
    }

    refresh(key: string) {
        this.view.requestMeasure({
            read() {
                // ignore
            },
            key
        });
    }
}
