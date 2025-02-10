import { ClassList } from '@aldinh777/kerad';
import type { CSSProperties } from './styles';
import type { State } from '@aldinh777/reactive';
import type { GlobalEvents } from './events';

type SafeLiterals<T> = T | (string & {});
export type StateAttributes<T = {}> = { [K in keyof T]: SafeLiterals<T[K]> | State<Extract<T[K], string>> };
export type HtmlAttributesNoEvents<T = {}> = Partial<StateAttributes<T> & GlobalAttribute>;
export type HtmlAttributes<T = {}> = HtmlAttributesNoEvents<T & GlobalEvents>;

export type GlobalAttribute = StateAttributes<{
    accesskey: string;
    class: string | ClassList;
    contenteditable: string;
    dir: string;
    draggable: string;
    hidden: string;
    id: string;
    inert: string;
    inputmode: string;
    lang: string;
    popover: string;
    spellcheck: string;
    style: string | Partial<CSSProperties>;
    tabindex: string;
    title: string;
    translate: string;
}>;

/**
 * source: https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
 */
export type MimeTypes =
    | 'audio/aac'
    | 'application/x-abiword'
    | 'application/x-freearc'
    | 'video/x-msvideo'
    | 'application/vnd.amazon.ebook'
    | 'application/octet-stream'
    | 'image/bmp'
    | 'application/x-bzip'
    | 'application/x-bzip2'
    | 'application/x-csh'
    | 'text/css'
    | 'text/csv'
    | 'application/msword'
    | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    | 'application/vnd.ms-fontobject'
    | 'application/epub+zip'
    | 'application/gzip'
    | 'image/gif'
    | 'text/html'
    | 'text/html'
    | 'image/vnd.microsoft.icon'
    | 'text/calendar'
    | 'application/java-archive'
    | '.jpg'
    | 'text/javascript'
    | 'application/json'
    | 'application/ld+json'
    | '.midi'
    | 'text/javascript'
    | 'audio/mpeg'
    | 'video/mpeg'
    | 'application/vnd.apple.installer+xml'
    | 'application/vnd.oasis.opendocument.presentation'
    | 'application/vnd.oasis.opendocument.spreadsheet'
    | 'application/vnd.oasis.opendocument.text'
    | 'audio/ogg'
    | 'video/ogg'
    | 'application/ogg'
    | 'audio/opus'
    | 'font/otf'
    | 'image/png'
    | 'application/pdf'
    | 'application/php'
    | 'application/vnd.ms-powerpoint'
    | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    | 'application/vnd.rar'
    | 'application/rtf'
    | 'application/x-sh'
    | 'image/svg+xml'
    | 'application/x-shockwave-flash'
    | 'application/x-tar'
    | 'image/tiff'
    | 'image/tiff'
    | 'video/mp2t'
    | 'font/ttf'
    | 'text/plain'
    | 'application/vnd.visio'
    | 'audio/wav'
    | 'audio/webm'
    | 'video/webm'
    | 'image/webp'
    | 'font/woff'
    | 'font/woff2'
    | 'application/xhtml+xml'
    | 'application/vnd.ms-excel'
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    | 'XML'
    | 'application/vnd.mozilla.xul+xml'
    | 'application/zip'
    | 'video/3gpp'
    | 'video/3gpp2'
    | 'application/x-7z-compressed';

export type AnchorRelation =
    | 'alternate'
    | 'author'
    | 'bookmark'
    | 'external'
    | 'help'
    | 'license'
    | 'next'
    | 'nofollow'
    | 'noreferrer'
    | 'noopener'
    | 'prefetch'
    | 'prev'
    | 'search'
    | 'tag';

export type FormRelation =
    | 'external'
    | 'help'
    | 'license'
    | 'next'
    | 'nofollow'
    | 'noreferrer'
    | 'noopener'
    | 'opener'
    | 'prev'
    | 'search';

export type LinkRelation =
    | 'alternate'
    | 'author'
    | 'dns-prefetch'
    | 'help'
    | 'icon'
    | 'license'
    | 'next'
    | 'pingback'
    | 'preconnect'
    | 'prefetch'
    | 'preload'
    | 'prerender'
    | 'prev'
    | 'search'
    | 'stylesheet';
