import { tags as t } from '@lezer/highlight';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';

export const lightHighlightStyle = HighlightStyle.define([
    { tag: t.meta, color: '#404740' },
    { tag: t.link, textDecoration: 'underline' },
    { tag: t.heading, textDecoration: 'underline', fontWeight: 'bold' },
    { tag: t.emphasis, fontStyle: 'italic' },
    { tag: t.strong, fontWeight: 'bold' },
    { tag: t.strikethrough, textDecoration: 'line-through' },
    { tag: t.keyword, color: '#708' },
    { tag: [t.atom, t.bool, t.url, t.contentSeparator, t.labelName], color: '#219' },
    { tag: [t.literal, t.inserted], color: '#164' },
    { tag: [t.string, t.deleted], color: '#a11' },
    { tag: [t.regexp, t.escape, t.special(t.string)], color: '#e40' },
    { tag: t.definition(t.variableName), color: '#00f' },
    { tag: t.variableName, color: '#30a' },
    { tag: t.local(t.variableName), color: '#30a' },
    { tag: [t.typeName, t.namespace], color: '#085' },
    { tag: t.className, color: '#167' },
    { tag: [t.special(t.variableName), t.macroName], color: '#256' },
    { tag: t.definition(t.propertyName), color: '#00c' },
    { tag: [t.processingInstruction, t.inserted], color: '#05a' },
    { tag: t.comment, color: '#940' },
    { tag: t.invalid, color: '#f00' }
]);

export const lightTheme = syntaxHighlighting(lightHighlightStyle, { fallback: true });
