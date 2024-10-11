# PG CodeMirror 6 Editor

This package implements a CodeMirror 6 editor that is primarily intended for editing PG problem files for the WeBWorK
Online Homework Delivery System. However, it also supports editing Perl, HTML, XML, Mojolicious HTML templates, and
Mojolicious raw text templates since those are needed by webwork2.

The `dist/pg-codemirror-editor.js` can be used via a script tag and sets the global `PGCodeMirrorEditor` object. The
`PGCodeMirrorEditor.View` class is the only key in the object. It can be used as follows

```Javascript
const pgEditor = new PGCodeMirrorEditor.View(codeMirrorElt, { source: sourceCode });
```

## `PGCodeMirrorEditor.View` class

The following methods and attributes for the `PGCodeMirrorEditor.View` class are available. Note that although the theme
and keymap can be set via initialization options or provided methods, usually you do not want to do this. The theme and
keymap can be changed by the user via the user interface provided in the editor, and the user's choices are saved in
local storage in the browser.

### Constructor

The syntax for usage of the `PGCodeMirrorEditor.View` is

```Javascript
PGCodeMirrorEditor.View(
    element: HTMLElement,
    options?: {
        language?: string;
        source?: string;
        theme?: string;
        keyMap?: string;
});
```

The options are described below.

- `language`: One of 'pg', 'perl', 'html', 'xml', 'mt-html', or 'mt-text'. (Defaults to 'pg')
- `source`: A string containing the source code to edit. (Defaults to the empty string)
- `theme`: A string naming one of the following themes. (Defaults to 'Default')
  - 'Default': A modified version of the CodeMirror 6 default theme defined in `src/light-theme.ts`.
  - 'Amy': From the [thememirror](https://thememirror.net/) package.
  - 'Ayu Light': From the [thememirror](https://thememirror.net/) package.
  - 'Barf': From the [thememirror](https://thememirror.net/) package.
  - 'Basic Dark': From the [cm6-theme-basic-dark](https://github.com/craftzdog/cm6-themes) package.
  - 'Basic Light': From the [cm6-theme-basic-light](https://github.com/craftzdog/cm6-themes) package.
  - 'Bespin': From the [thememirror](https://thememirror.net/) package.
  - 'Birds of Paradise': From the [thememirror](https://thememirror.net/) package.
  - 'Boys and Girls': From the [thememirror](https://thememirror.net/) package.
  - 'Clouds': From the [thememirror](https://thememirror.net/) package.
  - 'Cobalt': From the [thememirror](https://thememirror.net/) package.
  - 'Cool Glow': From the [thememirror](https://thememirror.net/) package.
  - 'Dracula': From the [thememirror](https://thememirror.net/) package.
  - 'Espresso': From the [thememirror](https://thememirror.net/) package.
  - 'Gruvbox Dark': From the [cm6-theme-gruvbox-dark](https://github.com/craftzdog/cm6-themes) package.
  - 'Gruvbox Light': From the [cm6-theme-gruvbox-light](https://github.com/craftzdog/cm6-themes) package.
  - 'Material Dark': From the [cm6-theme-material-dark](https://github.com/craftzdog/cm6-themes) package.
  - 'Noctis Lilac': From the [thememirror](https://thememirror.net/) package.
  - 'Nord': From the [cm6-theme-nord](https://github.com/craftzdog/cm6-themes) package.
  - 'One Dark': From the [@codemirror/theme-one-dark](https://github.com/codemirror/theme-one-dark) package.
  - 'Rose Pine Dawn': From the [thememirror](https://thememirror.net/) package.
  - 'Smoothy': From the [thememirror](https://thememirror.net/) package.
  - 'Solarized Dark': From the [cm6-theme-solarized-dark](https://github.com/craftzdog/cm6-themes) package.
  - 'Solarized Light': From the [cm6-theme-solarized-light](https://github.com/craftzdog/cm6-themes) package.
  - 'Solarized Light 2': From the [thememirror](https://thememirror.net/) package.
  - 'Tomorrow': From the [thememirror](https://thememirror.net/) package.
- `keymap`: One of 'Default', 'Emacs', or 'Vim'. (Defaults to 'Default')

### `source: string`

Set the source code to be edited with the `source` getter, and get the current source with the `source` setter. Note
that setting the source will reset the editor state (including undo and redo history).

### `setLanguage(languageName: string): Promise<void>`

Set the language for the editor after initialization. The `languageName` must be one of the languages listed for the
constructor `language` option. Note that this method is `async`.

### `setTheme(themeName: string): Promise<void>`

Set the theme for the editor after initialization. The `themeName` must be one of the themes listed for the constructor
`theme` option. Note that this method is `async`.

### `setKeyMap(keyMapName: string): Promise<void>`

Set the keymap for the editor after initialization. The `keyMapName` must be one of the keymaps listed for the
constructor `keymap` option. Note that this method is `async`.

### `refresh(key: string): void`

Schedule a layout measurement for the editor. Provide a string `key` that identifies the call. When multiple requests
with the same key are scheduled, only the last one will actually be run.

## Development Testing

Executing `npm run serve` will make an html test page available at `http://localhost:8080`.
