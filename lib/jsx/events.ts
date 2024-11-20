/**
 * Based on https://www.w3schools.com/TAGs/ref_eventattributes.asp
 * accessed at 2024-11-20
 */
export type GlobalEvents = WindowEventAttributes &
    FormEvents &
    MouseEvents &
    DragEvents &
    ClipboardEvents &
    MediaEvents &
    MiscEvents;

/**
 * Events triggered for the window object (applies to the &lt;body&gt; tag)
 */
export interface WindowEventAttributes {
    /** Script to be run after the document is printed */
    'on:afterprint': Function;
    /** Script to be run before the document is printed */
    'on:beforeprint': Function;
    /** Script to be run when the document is about to be unloaded */
    'on:beforeunload': Function;
    /** Script to be run when an error occurs */
    'on:error': Function;
    /** Script to be run when there has been changes to the anchor part of the a URL */
    'on:hashchange': Function;
    /** Fires after the page is finished loading */
    'on:load': Function;
    /** Script to be run when the message is triggered */
    'on:message': Function;
    /** Script to be run when the browser starts to work offline */
    'on:offline': Function;
    /** Script to be run when the browser starts to work online */
    'on:online': Function;
    /** Script to be run when a user navigates away from a page */
    'on:pagehide': Function;
    /** Script to be run when a user navigates to a page */
    'on:pageshow': Function;
    /** Script to be run when the window's history changes */
    'on:popstate': Function;
    /** Fires when the browser window is resized */
    'on:resize': Function;
    /** Script to be run when a Web Storage area is updated */
    'on:storage': Function;
    /** Fires once a page has unloaded (or the browser window has been closed) */
    'on:unload': Function;
}

/**
 * Events triggered by actions inside a HTML form (applies to almost all HTML elements, but is most used in form elements):
 */
export interface FormEvents {
    /** Fires the moment that the element loses focus */
    'on:blur': Function;
    /** Fires the moment when the value of the element is changed */
    'on:change': Function;
    /** Script to be run when a context menu is triggered */
    'on:contextmenu': Function;
    /** Fires the moment when the element gets focus */
    'on:focus': Function;
    /** Script to be run when an element gets user input */
    'on:input': Function;
    /** Script to be run when an element is invalid */
    'on:invalid': Function;
    /** Fires when the Reset button in a form is clicked */
    'on:reset': Function;
    /** Fires when the user writes something in a search field (for &lt;input="search"&gt;) */
    'on:search': Function;
    /** Fires after some text has been selected in an element */
    'on:select': Function;
    /** Fires when a form is submitted */
    'on:submit': Function;
    /** Fires when a user is pressing a key */
    'on:keydown': Function;
    /** Fires when a user presses a key */
    'on:keypress': Function;
    /** Fires when a user releases a key */
    'on:keyup': Function;
}

export interface MouseEvents {
    /** Fires on a mouse click on the element */
    'on:click': Function;
    /** Fires on a mouse double-click on the element */
    'on:dblclick': Function;
    /** Fires when a mouse button is pressed down on an element */
    'on:mousedown': Function;
    /** Fires when the mouse pointer is moving while it is over an element */
    'on:mousemove': Function;
    /** Fires when the mouse pointer moves out of an element */
    'on:mouseout': Function;
    /** Fires when the mouse pointer moves over an element */
    'on:mouseover': Function;
    /** Fires when a mouse button is released over an element */
    'on:mouseup': Function;
    /** Deprecated. Use the onwheel attribute instead */
    'on:mousewheel': Function;
    /** Fires when the mouse wheel rolls up or down over an element */
    'on:wheel': Function;
}

export interface DragEvents {
    /** Script to be run when an element is dragged */
    'on:drag': Function;
    /** Script to be run at the end of a drag operation */
    'on:dragend': Function;
    /** Script to be run when an element has been dragged to a valid drop target */
    'on:dragenter': Function;
    /** Script to be run when an element leaves a valid drop target */
    'on:dragleave': Function;
    /** Script to be run when an element is being dragged over a valid drop target */
    'on:dragover': Function;
    /** Script to be run at the start of a drag operation */
    'on:dragstart': Function;
    /** Script to be run when dragged element is being dropped */
    'on:drop': Function;
    /** Script to be run when an element's scrollbar is being scrolled */
    'on:scroll': Function;
}

export interface ClipboardEvents {
    /** Fires when the user copies the content of an element */
    'on:copy': Function;
    /** Fires when the user cuts the content of an element */
    'on:cut': Function;
    /** Fires when the user pastes some content in an element */
    'on:paste': Function;
}

/**
 * Events triggered by medias like videos, images and audio (applies to all HTML elements, but is most common in media elements, like &lt;audio&gt;, &lt;embed&gt;, &lt;img&gt;, &lt;object&gt;, and &lt;video&gt;).
 * Tip: Look at our HTML Audio and Video DOM Reference for more information.
 */
export interface MediaEvents {
    /** Script to be run on abort */
    'on:abort': Function;
    /** Script to be run when a file is ready to start playing (when it has buffered enough to begin) */
    'on:canplay': Function;
    /** Script to be run when a file can be played all the way to the end without pausing for buffering */
    'on:canplaythrough': Function;
    /** Script to be run when the cue changes in a &lt;track&gt; element */
    'on:cuechange': Function;
    /** Script to be run when the length of the media changes */
    'on:durationchange': Function;
    /** Script to be run when something bad happens and the file is suddenly unavailable (like unexpectedly disconnects) */
    'on:emptied': Function;
    /** Script to be run when the media has reach the end (a useful event for messages like "thanks for listening") */
    'on:ended': Function;
    /** Script to be run when an error occurs when the file is being loaded */
    'on:error': Function;
    /** Script to be run when media data is loaded */
    'on:loadeddata': Function;
    /** Script to be run when meta data (like dimensions and duration) are loaded */
    'on:loadedmetadata': Function;
    /** Script to be run just as the file begins to load before anything is actually loaded */
    'on:loadstart': Function;
    /** Script to be run when the media is paused either by the user or programmatically */
    'on:pause': Function;
    /** Script to be run when the media is ready to start playing */
    'on:play': Function;
    /** Script to be run when the media actually has started playing */
    'on:playing': Function;
    /** Script to be run when the browser is in the process of getting the media data */
    'on:progress': Function;
    /** Script to be run each time the playback rate changes (like when a user switches to a slow motion or fast forward mode) */
    'on:ratechange': Function;
    /** Script to be run when the seeking attribute is set to false indicating that seeking has ended */
    'on:seeked': Function;
    /** Script to be run when the seeking attribute is set to true indicating that seeking is active */
    'on:seeking': Function;
    /** Script to be run when the browser is unable to fetch the media data for whatever reason */
    'on:stalled': Function;
    /** Script to be run when fetching the media data is stopped before it is completely loaded for whatever reason */
    'on:suspend': Function;
    /** Script to be run when the playing position has changed (like when the user fast forwards to a different point in the media) */
    'on:timeupdate': Function;
    /** Script to be run each time the volume is changed which (includes setting the volume to "mute") */
    'on:volumechange': Function;
    /** Script to be run when the media has paused but is expected to resume (like when the media pauses to buffer more data) */
    'on:waiting': Function;
}

export interface MiscEvents {
    /** Fires when the user opens or closes the &lt;details&gt; element */
    'on:toggle': Function;
}
