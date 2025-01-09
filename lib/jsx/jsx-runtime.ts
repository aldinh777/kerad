import type { Context } from '@aldinh777/kerad-core';
import type { State } from '@aldinh777/reactive';
import type { WatchableList } from '@aldinh777/reactive/list/utils';
import type {
    AnchorRelation,
    FormRelation,
    HtmlAttributes,
    HtmlAttributesNoEvents,
    LinkRelation,
    MimeTypes
} from './types';

type TargetOptions = '_blank' | '_self' | '_parent' | '_top';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            a: HtmlAttributes<{
                download: string;
                href: string;
                hreflang: string;
                media: string;
                ping: string;
                referrerpolicy: ReferrerPolicy;
                rel: AnchorRelation;
                target: TargetOptions;
                type: MimeTypes;
            }>;
            abbr: HtmlAttributes;
            address: HtmlAttributes;
            area: HtmlAttributes<{
                alt: string;
                coords: string;
                download: string;
                href: string;
                hreflang: string;
                media: string;
                referrerpolicy: ReferrerPolicy;
                rel: AnchorRelation;
                shape: 'default' | 'circle' | 'poly' | 'rect';
                target: TargetOptions;
                type: MimeTypes;
            }>;
            article: HtmlAttributes;
            aside: HtmlAttributes;
            audio: HtmlAttributes<{
                autoplay: boolean;
                controls: boolean;
                loop: boolean;
                muted: boolean;
                preload: 'none' | 'metadata' | 'auto';
                src: string;
            }>;
            b: HtmlAttributes;
            base: HtmlAttributes<{
                href: string;
                target: TargetOptions;
            }>;
            bdi: HtmlAttributes;
            bdo: HtmlAttributes<{
                dir: 'ltr' | 'rtl' | 'auto';
            }>;
            big: HtmlAttributes;
            blockquote: HtmlAttributes<{
                cite: string;
            }>;
            body: HtmlAttributes;
            br: HtmlAttributes;
            button: HtmlAttributes<{
                autofocus: boolean;
                disabled: boolean;
                form: string;
                formaction: string;
                formenctype: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
                formmethod: 'get' | 'post';
                formnovalidate: boolean;
                formtarget: TargetOptions;
                popovertarget: string;
                popovertargetaction: string;
                name: string;
                type: 'submit' | 'reset' | 'button';
                value: string;
            }>;
            canvas: HtmlAttributes<{
                height: string;
                width: string;
            }>;
            caption: HtmlAttributes;
            cite: HtmlAttributes;
            /**
             * kerad specific elements
             *
             * fetch client-side component from url
             */
            clientside: HtmlAttributesNoEvents<{
                src: string;
            }>;
            code: HtmlAttributes;
            col: HtmlAttributes<{
                span: string;
            }>;
            colgroup: HtmlAttributes<{
                span: string;
            }>;
            data: HtmlAttributesNoEvents<{
                value: string;
            }>;
            datalist: HtmlAttributes;
            dd: HtmlAttributes;
            del: HtmlAttributes;
            details: HtmlAttributes<{
                open: boolean;
            }>;
            dfn: HtmlAttributes;
            dialog: HtmlAttributes<{
                open: boolean;
            }>;
            div: HtmlAttributes;
            dl: HtmlAttributes;
            dt: HtmlAttributes;
            em: HtmlAttributes;
            embed: HtmlAttributes<{
                height: string;
                src: string;
                type: MimeTypes;
                width: string;
            }>;
            fieldset: HtmlAttributes<{
                disabled: boolean;
                form: string;
                name: string;
            }>;
            figcaption: HtmlAttributes;
            figure: HtmlAttributes;
            footer: HtmlAttributes;
            form: HtmlAttributes<{
                'accept-charset': string;
                action: string;
                autocomplete: 'on' | 'off';
                enctype: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
                method: 'dialog' | 'get' | 'post';
                name: string;
                novalidate: boolean;
                rel: FormRelation;
                /**
                 * kerad specific attribute
                 *
                 * describes the action to be taken after the form is submitted
                 */
                aftersubmit: 'reset' | 'none';
            }>;
            h1: HtmlAttributes;
            h2: HtmlAttributes;
            h3: HtmlAttributes;
            h4: HtmlAttributes;
            h5: HtmlAttributes;
            h6: HtmlAttributes;
            head: HtmlAttributesNoEvents;
            header: HtmlAttributes;
            hgroup: HtmlAttributes;
            hr: HtmlAttributes;
            html: HtmlAttributesNoEvents<{
                xmlns: string;
            }>;
            i: HtmlAttributes;
            iframe: HtmlAttributes<{
                allow: string;
                allowfullscreen: boolean;
                allowpaymentrequest: boolean;
                height: string;
                loading: 'eager' | 'lazy';
                name: string;
                referrerpolicy: ReferrerPolicy;
                sandbox:
                    | 'allow-forms'
                    | 'allow-pointer-lock'
                    | 'allow-popups'
                    | 'allow-same-origin'
                    | 'allow-scripts'
                    | 'allow-top-navigation';
                src: string;
                srcdoc: string;
                width: string;
            }>;
            img: HtmlAttributes<{
                alt: string;
                crossorigin: 'anonymous' | 'use-credentials';
                height: string;
                ismap: boolean;
                loading: 'lazy' | 'eager';
                longdesc: string;
                referrerpolicy: ReferrerPolicy;
                sizes: string;
                src: string;
                srcset: string;
                usemap: string;
                width: string;
            }>;
            input: HtmlAttributes<{
                accept: MimeTypes;
                alt: string;
                autocomplete: 'on' | 'off';
                checked: boolean;
                dirname: string;
                disabled: boolean;
                form: string;
                formaction: string;
                formenctype: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
                formmethod: 'get' | 'post';
                formnovalidate: boolean;
                formtarget: TargetOptions;
                height: string;
                list: string;
                max: string;
                maxlength: number;
                min: string;
                minlength: number;
                multiple: boolean;
                name: string;
                pattern: string;
                placeholder: string;
                popovertarget: string;
                popovertargetaction: 'hide' | 'show' | 'toggle';
                readonly: boolean;
                required: boolean;
                size: number;
                src: string;
                step: string;
                type:
                    | 'button'
                    | 'checkbox'
                    | 'color'
                    | 'date'
                    | 'datetime-local'
                    | 'email'
                    | 'file'
                    | 'hidden'
                    | 'image'
                    | 'month'
                    | 'number'
                    | 'password'
                    | 'radio'
                    | 'range'
                    | 'reset'
                    | 'search'
                    | 'submit'
                    | 'tel'
                    | 'text'
                    | 'time'
                    | 'url'
                    | 'week';
                value: string;
                width: string;
            }>;
            ins: HtmlAttributes<{
                cite: string;
                datetime: string;
            }>;
            kbd: HtmlAttributes;
            label: HtmlAttributes<{
                for: string;
                form: string;
            }>;
            legend: HtmlAttributes;
            li: HtmlAttributes<{
                value: string;
            }>;
            link: HtmlAttributes<{
                crossorigin: 'anonymous' | 'use-credentials';
                href: string;
                hreflang: string;
                media: string;
                referrerpolicy: ReferrerPolicy;
                rel: LinkRelation;
                sizes: string;
                title: string;
                type: MimeTypes;
            }>;
            main: HtmlAttributes;
            map: HtmlAttributes<{
                name: string;
            }>;
            mark: HtmlAttributes;
            menu: HtmlAttributes;
            meta: HtmlAttributesNoEvents<{
                charset: string;
                content: string;
                httpEquiv: 'content-language' | 'content-type' | 'default-style' | 'refresh';
                name: 'application-name' | 'author' | 'description' | 'generator' | 'keywords' | 'viewport';
            }>;
            meter: HtmlAttributes<{
                form: string;
                high: number;
                low: number;
                max: number;
                min: number;
                optimum: number;
                value: number;
            }>;
            nav: HtmlAttributes;
            noscript: HtmlAttributesNoEvents;
            object: HtmlAttributes<{
                data: string;
                form: string;
                height: string;
                name: string;
                type: string;
                typemustmatch: boolean;
                usemap: string;
                width: string;
            }>;
            ol: HtmlAttributes<{
                reversed: boolean;
                start: number;
                type: '1' | 'a' | 'A' | 'i' | 'I';
            }>;
            optgroup: HtmlAttributes<{
                disabled: boolean;
                label: string;
            }>;
            option: HtmlAttributes<{
                disabled: boolean;
                label: string;
                selected: boolean;
                value: string;
            }>;
            output: HtmlAttributes<{
                for: string;
                form: string;
                name: string;
            }>;
            p: HtmlAttributes;
            param: HtmlAttributesNoEvents<{
                name: string;
                value: string;
            }>;
            picture: HtmlAttributes;
            pre: HtmlAttributes;
            progress: HtmlAttributes<{
                max: number;
                value: number;
            }>;
            q: HtmlAttributes<{
                cite: string;
            }>;
            rp: HtmlAttributes;
            rt: HtmlAttributes;
            ruby: HtmlAttributes;
            s: HtmlAttributes;
            samp: HtmlAttributes;
            script: HtmlAttributesNoEvents<{
                async: boolean;
                crossorigin: 'anonymous' | 'use-credentials';
                defer: boolean;
                integrity: string;
                nomodule: boolean;
                referrerpolicy: ReferrerPolicy;
                src: string;
                type: MimeTypes;
            }>;
            search: HtmlAttributes;
            section: HtmlAttributes;
            select: HtmlAttributes<{
                autofocus: boolean;
                disabled: boolean;
                form: string;
                multiple: boolean;
                name: string;
                required: boolean;
                size: number;
            }>;
            small: HtmlAttributes;
            source: HtmlAttributes<{
                media: string;
                sizes: string;
                src: string;
                srcset: string;
                type: MimeTypes;
            }>;
            span: HtmlAttributes;
            strong: HtmlAttributes;
            style: HtmlAttributes;
            sub: HtmlAttributes;
            summary: HtmlAttributes;
            sup: HtmlAttributes;
            // svg elements
            table: HtmlAttributes;
            tbody: HtmlAttributes;
            td: HtmlAttributes<{
                colspan: number;
                headers: string;
                rowspan: number;
            }>;
            template: HtmlAttributes;
            textarea: HtmlAttributes<{
                autofocus: boolean;
                cols: number;
                dirname: string;
                disabled: boolean;
                form: string;
                maxlength: number;
                name: string;
                placeholder: string;
                readonly: boolean;
                required: boolean;
                rows: number;
                wrap: 'hard' | 'soft';
            }>;
            tfoot: HtmlAttributes;
            th: HtmlAttributes<{
                abbr: string;
                colspan: number;
                headers: string;
                rowspan: number;
                scope: 'col' | 'row' | 'colgroup' | 'rowgroup';
            }>;
            thead: HtmlAttributes;
            time: HtmlAttributes<{
                datetime: string;
            }>;
            title: HtmlAttributesNoEvents;
            tr: HtmlAttributes;
            track: HtmlAttributes<{
                default: boolean;
                kind: 'captions' | 'chapters' | 'descriptions' | 'metadata' | 'subtitles';
                label: string;
                src: string;
                srclang: string;
            }>;
            u: HtmlAttributes;
            ul: HtmlAttributes;
            var: HtmlAttributes;
            video: HtmlAttributes<{
                autoplay: boolean;
                controls: boolean;
                height: string;
                loop: boolean;
                muted: boolean;
                poster: string;
                preload: 'auto' | 'metadata' | 'none';
                src: string;
                width: string;
            }>;
            wbr: HtmlAttributes;
            [elemName: string]: any;
        }
    }
}

export interface Props extends Record<string, any> {
    children?: Node | Node[];
}

interface Element {
    tag: string | Component;
    props: Props;
}

export type Node = string | State | WatchableList<any> | Element;
export type Component = (props: Props, context: Context) => Promise<Node | Node[]> | Node | Node[];

export function jsx(tag: string | Component, props: any): Element {
    return { tag, props };
}

export const Fragment: Component = (props) => props.children || [];
