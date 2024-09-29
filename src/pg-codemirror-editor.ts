import type { Extension } from '@codemirror/state';
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
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, foldGutter, foldKeymap, indentOnInput, indentUnit } from '@codemirror/language';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { lintKeymap } from '@codemirror/lint';
import 'src/pg-codemirror-editor.scss';

// Key bindings
import { emacs } from '@replit/codemirror-emacs';
import { vim } from '@replit/codemirror-vim';

// Themes
import { oneDark } from '@codemirror/theme-one-dark';
import { lightTheme } from 'src/light-theme';
import { basicDark } from 'cm6-theme-basic-dark';
import { basicLight } from 'cm6-theme-basic-light';
import { gruvboxDark } from 'cm6-theme-gruvbox-dark';
import { gruvboxLight } from 'cm6-theme-gruvbox-light';
import { materialDark } from 'cm6-theme-material-dark';
import { nord } from 'cm6-theme-nord';
import { solarizedDark } from 'cm6-theme-solarized-dark';
import { solarizedLight } from 'cm6-theme-solarized-light';
import * as themeMirrorThemes from 'thememirror';

// Languages
import { pg } from 'codemirror-lang-pg';

export interface InitializationOptions {
    source?: string;
    theme?: string;
    keyMap?: string;
}

export class PGCodeMirrorEditor {
    private view: EditorView;

    private extensions = [
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
        ])
    ];

    private keyMap = new Compartment();
    private selectedKeyMap = 'Default';
    private keyMaps = new Map<string, Extension>([
        ['Default', []],
        ['Emacs', emacs()],
        ['Vim', vim()]
    ]);

    private theme = new Compartment();
    private selectedTheme = 'Default Light';
    private themes = new Map<string, Extension>([
        ['Default Light', lightTheme],
        ['Amy', themeMirrorThemes.amy],
        ['Ayu Light', themeMirrorThemes.ayuLight],
        ['Barf', themeMirrorThemes.barf],
        ['Basic Dark', basicDark],
        ['Basic Light', basicLight],
        ['Bespin', themeMirrorThemes.bespin],
        ['Birds of Paradise', themeMirrorThemes.birdsOfParadise],
        ['Boys and Girls', themeMirrorThemes.boysAndGirls],
        ['Clouds', themeMirrorThemes.clouds],
        ['Cobalt', themeMirrorThemes.cobalt],
        ['Cool Glow', themeMirrorThemes.coolGlow],
        ['Dracula', themeMirrorThemes.dracula],
        ['Espresso', themeMirrorThemes.espresso],
        ['Gruvbox Dark', gruvboxDark],
        ['Gruvbox Light', gruvboxLight],
        ['Material Dark', materialDark],
        ['Noctis Lilac', themeMirrorThemes.noctisLilac],
        ['Nord', nord],
        ['One Dark', oneDark],
        ['Rose Pine Dawn', themeMirrorThemes.rosePineDawn],
        ['Smoothy', themeMirrorThemes.smoothy],
        ['Solarized Dark', solarizedDark],
        ['Solarized Light', solarizedLight],
        ['Solarized Light 2', themeMirrorThemes.solarizedLight],
        ['Tomorrow', themeMirrorThemes.tomorrow]
    ]);

    private language = new Compartment();

    constructor(
        private element: HTMLElement,
        options?: InitializationOptions
    ) {
        const doc = options?.source ?? '';

        const selectedKeyMap = localStorage.getItem('pg-cm-editor.key-map') ?? options?.keyMap ?? 'Default';
        const keyMap = this.keyMaps.get(selectedKeyMap);
        if (keyMap) {
            this.selectedKeyMap = selectedKeyMap;
            this.extensions.unshift(this.keyMap.of(keyMap));
        } else this.extensions.unshift(this.keyMap.of([]));

        const selectedTheme = localStorage.getItem('pg-cm-editor.theme') ?? options?.theme ?? 'Default Light';
        const theme = this.themes.get(selectedTheme);
        if (theme) {
            this.selectedTheme = selectedTheme;
            this.extensions.push(this.theme.of(theme));
        } else this.extensions.push(this.theme.of(lightTheme));

        this.extensions.push(this.language.of(pg()));

        this.extensions.push(
            showPanel.of((view: EditorView): Panel => {
                const dom = document.createElement('div');
                dom.classList.add('pg-cm-toolbar');

                const themeChangerDiv = document.createElement('div');
                themeChangerDiv.classList.add('pg-cm-toolbar-item');
                const themeChanger = document.createElement('select');
                themeChanger.id = 'pg-cm-theme-changer';
                const themeChangerLabel = document.createElement('label');
                themeChangerLabel.textContent = 'Theme: ';
                themeChangerLabel.setAttribute('for', 'pg-cm-theme-changer');
                for (const theme of this.themes.keys()) {
                    const option = document.createElement('option');
                    option.value = theme;
                    option.textContent = theme;
                    if (option.value === this.selectedTheme) option.selected = true;
                    themeChanger.append(option);
                }
                themeChanger.addEventListener('change', () => {
                    this.changeTheme(themeChanger.value);
                });
                themeChangerDiv.append(themeChangerLabel, themeChanger);
                dom.append(themeChangerDiv);

                const keyMapChangerDiv = document.createElement('div');
                keyMapChangerDiv.classList.add('pg-cm-toolbar-item');
                const keyMapChanger = document.createElement('select');
                keyMapChanger.id = 'pg-cm-key-map-changer';
                const keyMapChangerLabel = document.createElement('label');
                keyMapChangerLabel.textContent = 'Key Map: ';
                keyMapChangerLabel.setAttribute('for', 'pg-cm-key-map-changer');
                for (const keyMap of this.keyMaps.keys()) {
                    const option = document.createElement('option');
                    option.value = keyMap;
                    option.textContent = keyMap;
                    if (option.value === this.selectedKeyMap) option.selected = true;
                    keyMapChanger.append(option);
                }
                keyMapChanger.addEventListener('change', () => {
                    this.changeKeyMap(keyMapChanger.value);
                });
                keyMapChangerDiv.append(keyMapChangerLabel, keyMapChanger);
                dom.append(keyMapChangerDiv);

                const directionDiv = document.createElement('div');
                directionDiv.classList.add('pg-cm-toolbar-item');
                const directionToggle = document.createElement('input');
                directionToggle.name = 'pg-cm-direction-toggle';
                directionToggle.type = 'checkbox';
                directionToggle.id = 'pg-cm-direction-toggle';
                const directionToggleLabel = document.createElement('label');
                directionToggleLabel.setAttribute('for', 'pg-cm-direction-toggle');
                directionToggleLabel.textContent = 'Force editor to RTL';
                directionToggle.addEventListener('change', () => {
                    const content = view.dom.querySelector('.cm-content');
                    if (!content) return;
                    (content as HTMLElement).style.direction = directionToggle.checked ? 'rtl' : 'ltr';
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
    }

    set source(doc: string) {
        this.view.setState(EditorState.create({ doc, extensions: this.extensions }));
    }

    get source() {
        return this.view.state.doc.toString();
    }

    get availableThemes() {
        return this.themes.keys();
    }

    changeTheme(themeName: string) {
        const theme = this.themes.get(themeName);
        if (theme) {
            this.selectedTheme = themeName;
            localStorage.setItem('pg-cm-editor.theme', themeName);
            this.view.dispatch({ effects: this.theme.reconfigure(theme) });
        }
    }

    get availableKeyMaps() {
        return this.keyMaps.keys();
    }

    changeKeyMap(keyMapName: string) {
        const keyMap = this.keyMaps.get(keyMapName);
        if (keyMap) {
            this.selectedKeyMap = keyMapName;
            localStorage.setItem('pg-cm-editor.key-map', keyMapName);
            this.view.dispatch({ effects: this.keyMap.reconfigure(keyMap) });
        }
    }
}
