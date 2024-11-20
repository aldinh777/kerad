import type { State } from "@aldinh777/reactive";

/**
 * Based on https://www.w3schools.com/cssref/index.php
 * accessed at 2024-11-20
 */
export interface CSSProperties {
    /**
     * Specifies an accent color for user-interface controls
     */
    accentColor: string | State<string>;
    /**
     * Specifies the alignment between the lines inside a flexible container when the items do not use all available space
     */
    alignContent: string | State<string>;
    /**
     * Specifies the alignment for items inside a flexible container
     */
    alignItems: string | State<string>;
    /**
     * Specifies the alignment for selected items inside a flexible container
     */
    alignSelf: string | State<string>;
    /**
     * Resets all properties (except unicode-bidi and direction)
     */
    all: string | State<string>;
    /**
     * A shorthand property for all the animation-* properties
     */
    animation: string | State<string>;
    /**
     * Specifies a delay for the start of an animation
     */
    animationDelay: string | State<string>;
    /**
     * Specifies whether an animation should be played forward, backward or in alternate cycles
     */
    animationDirection: string | State<string>;
    /**
     * Specifies how long an animation should take to complete one cycle
     */
    animationDuration: string | State<string>;
    /**
     * Specifies a style for the element when the animation is not playing (before it starts, after it ends, or both)
     */
    animationFillMode: string | State<string>;
    /**
     * Specifies the number of times an animation should be played
     */
    animationIterationCount: string | State<string>;
    /**
     * Specifies a name for the @keyframes animation
     */
    animationName: string | State<string>;
    /**
     * Specifies whether the animation is running or paused
     */
    animationPlayState: string | State<string>;
    /**
     * Specifies the speed curve of an animation
     */
    animationTimingFunction: string | State<string>;
    /**
     * Specifies preferred aspect ratio of an element
     */
    aspectRatio: string | State<string>;
    /**
     * Defines a graphical effect to the area behind an element
     */
    backdropFilter: string | State<string>;
    /**
     * Defines whether or not the back face of an element should be visible when facing the user
     */
    backfaceVisibility: string | State<string>;
    /**
     * A shorthand property for all the background-* properties
     */
    background: string | State<string>;
    /**
     * Sets whether a background image scrolls with the rest of the page, or is fixed
     */
    backgroundAttachment: string | State<string>;
    /**
     * Specifies the blending mode of each background layer (color/image)
     */
    backgroundBlendMode: string | State<string>;
    /**
     * Defines how far the background (color or image) should extend within an element
     */
    backgroundClip: string | State<string>;
    /**
     * Specifies the background color of an element
     */
    backgroundColor: string | State<string>;
    /**
     * Specifies one or more background images for an element
     */
    backgroundImage: string | State<string>;
    /**
     * Specifies the origin position of a background image
     */
    backgroundOrigin: string | State<string>;
    /**
     * Specifies the position of a background image
     */
    backgroundPosition: string | State<string>;
    /**
     * Specifies the position of a background image on x-axis
     */
    backgroundPositionX: string | State<string>;
    /**
     * Specifies the position of a background image on y-axis
     */
    backgroundPositionY: string | State<string>;
    /**
     * Sets if/how a background image will be repeated
     */
    backgroundRepeat: string | State<string>;
    /**
     * Specifies the size of the background images
     */
    backgroundSize: string | State<string>;
    /**
     * Specifies the size of an element in block direction
     */
    blockSize: string | State<string>;
    /**
     * A shorthand property for border-width, border-style and border-color
     */
    border: string | State<string>;
    /**
     * A shorthand property for border-block-width, border-block-style and border-block-color
     */
    borderBlock: string | State<string>;
    /**
     * Sets the color of the borders at start and end in the block direction
     */
    borderBlockColor: string | State<string>;
    /**
     * A shorthand property for border-block-end-width, border-block-end-style and border-block-end-color
     */
    borderBlockEnd: string | State<string>;
    /**
     * Sets the color of the border at the end in the block direction
     */
    borderBlockEndColor: string | State<string>;
    /**
     * Sets the style of the border at the end in the block direction
     */
    borderBlockEndStyle: string | State<string>;
    /**
     * Sets the width of the border at the end in the block direction
     */
    borderBlockEndWidth: string | State<string>;
    /**
     * A shorthand property for border-block-start-width, border-block-start-style and border-block-start-color
     */
    borderBlockStart: string | State<string>;
    /**
     * Sets the color of the border at the start in the block direction
     */
    borderBlockStartColor: string | State<string>;
    /**
     * Sets the style of the border at the start in the block direction
     */
    borderBlockStartStyle: string | State<string>;
    /**
     * Sets the width of the border at the start in the block direction
     */
    borderBlockStartWidth: string | State<string>;
    /**
     * Sets the style of the borders at start and end in the block direction
     */
    borderBlockStyle: string | State<string>;
    /**
     * Sets the width of the borders at start and end in the block direction
     */
    borderBlockWidth: string | State<string>;
    /**
     * A shorthand property for border-bottom-width, border-bottom-style and border-bottom-color
     */
    borderBottom: string | State<string>;
    /**
     * Sets the color of the bottom border
     */
    borderBottomColor: string | State<string>;
    /**
     * Defines the radius of the border of the bottom-left corner
     */
    borderBottomLeftRadius: string | State<string>;
    /**
     * Defines the radius of the border of the bottom-right corner
     */
    borderBottomRightRadius: string | State<string>;
    /**
     * Sets the style of the bottom border
     */
    borderBottomStyle: string | State<string>;
    /**
     * Sets the width of the bottom border
     */
    borderBottomWidth: string | State<string>;
    /**
     * Sets whether table borders should collapse into a single border or be separated
     */
    borderCollapse: string | State<string>;
    /**
     * Sets the color of the four borders
     */
    borderColor: string | State<string>;
    /**
     * Sets the radius of the corner between the block-end and the inline-end sides of the element
     */
    borderEndEndRadius: string | State<string>;
    /**
     * Sets the radius of the corner between the block-end and the inline-start sides of the element
     */
    borderEndStartRadius: string | State<string>;
    /**
     * A shorthand property for all the border-image-* properties
     */
    borderImage: string | State<string>;
    /**
     * Specifies the amount by which the border image area extends beyond the border box
     */
    borderImageOutset: string | State<string>;
    /**
     * Specifies whether the border image should be repeated, rounded or stretched
     */
    borderImageRepeat: string | State<string>;
    /**
     * Specifies how to slice the border image
     */
    borderImageSlice: string | State<string>;
    /**
     * Specifies the path to the image to be used as a border
     */
    borderImageSource: string | State<string>;
    /**
     * Specifies the width of the border image
     */
    borderImageWidth: string | State<string>;
    /**
     * A shorthand property for border-inline-width, border-inline-style and border-inline-color
     */
    borderInline: string | State<string>;
    /**
     * Sets the color of the borders at start and end in the inline direction
     */
    borderInlineColor: string | State<string>;
    /**
     * A shorthand property for border-inline-end-width, border-inline-end-style and border-inline-end-color
     */
    borderInlineEnd: string | State<string>;
    /**
     * Sets the color of the border at the end in the inline direction
     */
    borderInlineEndColor: string | State<string>;
    /**
     * Sets the style of the border at the end in the inline direction
     */
    borderInlineEndStyle: string | State<string>;
    /**
     * Sets the width of the border at the end in the inline direction
     */
    borderInlineEndWidth: string | State<string>;
    /**
     * A shorthand property for border-inline-start-width, border-inline-start-style and border-inline-start-color
     */
    borderInlineStart: string | State<string>;
    /**
     * Sets the color of the border at the start in the inline direction
     */
    borderInlineStartColor: string | State<string>;
    /**
     * Sets the style of the border at the start in the inline direction
     */
    borderInlineStartStyle: string | State<string>;
    /**
     * Sets the width of the border at the start in the inline direction
     */
    borderInlineStartWidth: string | State<string>;
    /**
     * Sets the style of the borders at start and end in the inline direction
     */
    borderInlineStyle: string | State<string>;
    /**
     * Sets the width of the borders at start and end in the inline direction
     */
    borderInlineWidth: string | State<string>;
    /**
     * A shorthand property for all the border-left-* properties
     */
    borderLeft: string | State<string>;
    /**
     * Sets the color of the left border
     */
    borderLeftColor: string | State<string>;
    /**
     * Sets the style of the left border
     */
    borderLeftStyle: string | State<string>;
    /**
     * Sets the width of the left border
     */
    borderLeftWidth: string | State<string>;
    /**
     * A shorthand property for the four border-*-radius properties
     */
    borderRadius: string | State<string>;
    /**
     * A shorthand property for all the border-right-* properties
     */
    borderRight: string | State<string>;
    /**
     * Sets the color of the right border
     */
    borderRightColor: string | State<string>;
    /**
     * Sets the style of the right border
     */
    borderRightStyle: string | State<string>;
    /**
     * Sets the width of the right border
     */
    borderRightWidth: string | State<string>;
    /**
     * Sets the distance between the borders of adjacent cells
     */
    borderSpacing: string | State<string>;
    /**
     * Sets the radius of the corner between the block-start and the inline-end sides of the element
     */
    borderStartEndRadius: string | State<string>;
    /**
     * Sets the radius of the corner between the block-start and the inline-start sides of the element
     */
    borderStartStartRadius: string | State<string>;
    /**
     * Sets the style of the four borders
     */
    borderStyle: string | State<string>;
    /**
     * A shorthand property for border-top-width, border-top-style and border-top-color
     */
    borderTop: string | State<string>;
    /**
     * Sets the color of the top border
     */
    borderTopColor: string | State<string>;
    /**
     * Defines the radius of the border of the top-left corner
     */
    borderTopLeftRadius: string | State<string>;
    /**
     * Defines the radius of the border of the top-right corner
     */
    borderTopRightRadius: string | State<string>;
    /**
     * Sets the style of the top border
     */
    borderTopStyle: string | State<string>;
    /**
     * Sets the width of the top border
     */
    borderTopWidth: string | State<string>;
    /**
     * Sets the width of the four borders
     */
    borderWidth: string | State<string>;
    /**
     * Sets the elements position, from the bottom of its parent element
     */
    bottom: string | State<string>;
    /**
     * Sets the behavior of the background and border of an element at page-break, or, for in-line elements, at line-break.
     */
    boxDecorationBreak: string | State<string>;
    /**
     * The box-reflect property is used to create a reflection of an element.
     */
    boxReflect: string | State<string>;
    /**
     * Attaches one or more shadows to an element
     */
    boxShadow: string | State<string>;
    /**
     * Defines how the width and height of an element are calculated: should they include padding and borders, or not
     */
    boxSizing: string | State<string>;
    /**
     * Specifies whether or not a page-, column-, or region-break should occur after the specified element
     */
    breakAfter: string | State<string>;
    /**
     * Specifies whether or not a page-, column-, or region-break should occur before the specified element
     */
    breakBefore: string | State<string>;
    /**
     * Specifies whether or not a page-, column-, or region-break should occur inside the specified element
     */
    breakInside: string | State<string>;
    /**
     * Specifies the placement of a table caption
     */
    captionSide: string | State<string>;
    /**
     * Specifies the color of the cursor (caret) in inputs, textareas, or any element that is editable
     */
    caretColor: string | State<string>;
    /**
     * Specifies what should happen with the element that is next to a floating element
     */
    clear: string | State<string>;
    /**
     * Deprecated in favor of clip-path. Clips an absolutely positioned element
     */
    clip: string | State<string>;
    /**
     * Clips an element to a basic shape or to an SVG source
     */
    clipPath: string | State<string>;
    /**
     * Sets the color of text
     */
    color: string | State<string>;
    /**
     * Indicates which operating system color scheme an element should render with
     */
    colorScheme: string | State<string>;
    /**
     * Specifies the number of columns an element should be divided into
     */
    columnCount: string | State<string>;
    /**
     * Specifies how to fill columns, balanced or not
     */
    columnFill: string | State<string>;
    /**
     * Specifies the gap between the columns
     */
    columnGap: string | State<string>;
    /**
     * A shorthand property for all the column-rule-* properties
     */
    columnRule: string | State<string>;
    /**
     * Specifies the color of the rule between columns
     */
    columnRuleColor: string | State<string>;
    /**
     * Specifies the style of the rule between columns
     */
    columnRuleStyle: string | State<string>;
    /**
     * Specifies the width of the rule between columns
     */
    columnRuleWidth: string | State<string>;
    /**
     * Specifies how many columns an element should span across
     */
    columnSpan: string | State<string>;
    /**
     * Specifies the column width
     */
    columnWidth: string | State<string>;
    /**
     * A shorthand property for column-width and column-count
     */
    columns: string | State<string>;
    /**
     * Used with the :before and :after pseudo-elements, to insert generated content
     */
    content: string | State<string>;
    /**
     * Increases or decreases the value of one or more CSS counters
     */
    counterIncrement: string | State<string>;
    /**
     * Creates or resets one or more CSS counters
     */
    counterReset: string | State<string>;
    /**
     * Creates or sets one or more CSS counters
     */
    counterSet: string | State<string>;
    /**
     * Specifies the mouse cursor to be displayed when pointing over an element
     */
    cursor: string | State<string>;
    /**
     * Specifies the text direction/writing direction
     */
    direction: string | State<string>;
    /**
     * Specifies how a certain HTML element should be displayed
     */
    display: string | State<string>;
    /**
     * Specifies whether or not to display borders and background on empty cells in a table
     */
    emptyCells: string | State<string>;
    /**
     * Defines effects (e.g. blurring or color shifting) on an element before the element is displayed
     */
    filter: string | State<string>;
    /**
     * A shorthand property for the flex-grow, flex-shrink, and the flex-basis properties
     */
    flex: string | State<string>;
    /**
     * Specifies the initial length of a flexible item
     */
    flexBasis: string | State<string>;
    /**
     * Specifies the direction of the flexible items
     */
    flexDirection: string | State<string>;
    /**
     * A shorthand property for the flex-direction and the flex-wrap properties
     */
    flexFlow: string | State<string>;
    /**
     * Specifies how much the item will grow relative to the rest
     */
    flexGrow: string | State<string>;
    /**
     * Specifies how the item will shrink relative to the rest
     */
    flexShrink: string | State<string>;
    /**
     * Specifies whether the flexible items should wrap or not
     */
    flexWrap: string | State<string>;
    /**
     * Specifies whether an element should float to the left, right, or not at all
     */
    float: string | State<string>;
    /**
     * A shorthand property for the font-style, font-variant, font-weight, font-size/line-height, and the font-family properties
     */
    font: string | State<string>;
    /**
     * Specifies the font family for text
     */
    fontFamily: string | State<string>;
    /**
     * Allows control over advanced typographic features in OpenType fonts
     */
    fontFeatureSettings: string | State<string>;
    /**
     * Controls the usage of the kerning information (how letters are spaced)
     */
    fontKerning: string | State<string>;
    /**
     * Controls the usage of language-specific glyphs in a typeface
     */
    fontLanguageOverride: string | State<string>;
    /**
     * Specifies the font size of text
     */
    fontSize: string | State<string>;
    /**
     * Preserves the readability and size of text when fallback font occurs
     */
    fontSizeAdjust: string | State<string>;
    /**
     * Selects a normal, condensed, or expanded face from a font family
     */
    fontStretch: string | State<string>;
    /**
     * Specifies the font style for text
     */
    fontStyle: string | State<string>;
    /**
     * Controls which missing typefaces (bold or italic) may be synthesized by the browser
     */
    fontSynthesis: string | State<string>;
    /**
     * Specifies whether or not a text should be displayed in a small-caps font
     */
    fontVariant: string | State<string>;
    /**
     * Controls the usage of alternate glyphs associated to alternative names defined in @font-feature-values
     */
    fontVariantAlternates: string | State<string>;
    /**
     * Controls the usage of alternate glyphs for capital letters
     */
    fontVariantCaps: string | State<string>;
    /**
     * Controls the usage of alternate glyphs for East Asian scripts (e.g Japanese and Chinese)
     */
    fontVariantEastAsian: string | State<string>;
    /**
     * Controls which ligatures and contextual forms are used in textual content of the elements it applies to
     */
    fontVariantLigatures: string | State<string>;
    /**
     * Controls the usage of alternate glyphs for numbers, fractions, and ordinal markers
     */
    fontVariantNumeric: string | State<string>;
    /**
     * Controls the usage of alternate glyphs of smaller size positioned as superscript or subscript regarding the baseline of the font
     */
    fontVariantPosition: string | State<string>;
    /**
     * Specifies the weight of a font
     */
    fontWeight: string | State<string>;
    /**
     * A shorthand property for the row-gap and the column-gap properties
     */
    gap: string | State<string>;
    /**
     * A shorthand property for the grid-template-rows, grid-template-columns, grid-template-areas, grid-auto-rows, grid-auto-columns, and the grid-auto-flow properties
     */
    grid: string | State<string>;
    /**
     * Either specifies a name for the grid item, or this property is a shorthand property for the grid-row-start, grid-column-start, grid-row-end, and grid-column-end properties
     */
    gridArea: string | State<string>;
    /**
     * Specifies a default column size
     */
    gridAutoColumns: string | State<string>;
    /**
     * Specifies how auto-placed items are inserted in the grid
     */
    gridAutoFlow: string | State<string>;
    /**
     * Specifies a default row size
     */
    gridAutoRows: string | State<string>;
    /**
     * A shorthand property for the grid-column-start and the grid-column-end properties
     */
    gridColumn: string | State<string>;
    /**
     * Specifies where to end the grid item
     */
    gridColumnEnd: string | State<string>;
    /**
     * Specifies where to start the grid item
     */
    gridColumnStart: string | State<string>;
    /**
     * A shorthand property for the grid-row-start and the grid-row-end properties
     */
    gridRow: string | State<string>;
    /**
     * Specifies where to end the grid item
     */
    gridRowEnd: string | State<string>;
    /**
     * Specifies where to start the grid item
     */
    gridRowStart: string | State<string>;
    /**
     * A shorthand property for the grid-template-rows, grid-template-columns and grid-areas properties
     */
    gridTemplate: string | State<string>;
    /**
     * Specifies how to display columns and rows, using named grid items
     */
    gridTemplateAreas: string | State<string>;
    /**
     * Specifies the size of the columns, and how many columns in a grid layout
     */
    gridTemplateColumns: string | State<string>;
    /**
     * Specifies the size of the rows in a grid layout
     */
    gridTemplateRows: string | State<string>;
    /**
     * Specifies whether a punctuation character may be placed outside the line box
     */
    hangingPunctuation: string | State<string>;
    /**
     * Sets the height of an element
     */
    height: string | State<string>;
    /**
     * Sets how to split words to improve the layout of text
     */
    hyphens: string | State<string>;
    /**
     * Sets the character used at the end of line, before a hyphenation break
     */
    hypenateCharacter: string | State<string>;
    /**
     * Specifies the type of algorithm to use for image scaling
     */
    imageRendering: string | State<string>;
    /**
     * Specifies the size of the initial-letter and optionally the number of lines the initial letter should sink (down in the text)
     */
    initialLetter: string | State<string>;
    /**
     * Specifies the size of an element in the inline direction
     */
    inlineSize: string | State<string>;
    /**
     * Specifies the distance between an element and the parent element
     */
    inset: string | State<string>;
    /**
     * Specifies the distance between an element and the parent element in the block direction
     */
    insetBlock: string | State<string>;
    /**
     * Specifies the distance between the end of an element and the parent element in the block direction
     */
    insetBlockEnd: string | State<string>;
    /**
     * Specifies the distance between the start of an element and the parent element in the block direction
     */
    insetBlockStart: string | State<string>;
    /**
     * Specifies the distance between an element and the parent element in the inline direction
     */
    insetInline: string | State<string>;
    /**
     * Specifies the distance between the end of an element and the parent element in the inline direction
     */
    insetInlineEnd: string | State<string>;
    /**
     * Specifies the distance between the start of an element and the parent element in the inline direction
     */
    insetInlineStart: string | State<string>;
    /**
     * Defines whether an element must create a new stacking content
     */
    isolation: string | State<string>;
    /**
     * Specifies the alignment between the items inside a flexible container when the items do not use all available space
     */
    justifyContent: string | State<string>;
    /**
     * Is set on the grid container. Specifies the alignment of grid items in the inline direction
     */
    justifyItems: string | State<string>;
    /**
     * Is set on the grid item. Specifies the alignment of the grid item in the inline direction
     */
    justifySelf: string | State<string>;
    /**
     * Specifies the left position of a positioned element
     */
    left: string | State<string>;
    /**
     * Increases or decreases the space between characters in a text
     */
    letterSpacing: string | State<string>;
    /**
     * Specifies how/if to break lines
     */
    lineBreak: string | State<string>;
    /**
     * Sets the line height
     */
    lineHeight: string | State<string>;
    /**
     * Sets all the properties for a list in one declaration
     */
    listStyle: string | State<string>;
    /**
     * Specifies an image as the list-item marker
     */
    listStyleImage: string | State<string>;
    /**
     * Specifies the position of the list-item markers (bullet points)
     */
    listStylePosition: string | State<string>;
    /**
     * Specifies the type of list-item marker
     */
    listStyleType: string | State<string>;
    /**
     * Sets all the margin properties in one declaration
     */
    margin: string | State<string>;
    /**
     * Specifies the margin in the block direction
     */
    marginBlock: string | State<string>;
    /**
     * Specifies the margin at the end in the block direction
     */
    marginBlockEnd: string | State<string>;
    /**
     * Specifies the margin at the start in the block direction
     */
    marginBlockStart: string | State<string>;
    /**
     * Sets the bottom margin of an element
     */
    marginBottom: string | State<string>;
    /**
     * Specifies the margin in the inline direction
     */
    marginInline: string | State<string>;
    /**
     * Specifies the margin at the end in the inline direction
     */
    marginInlineEnd: string | State<string>;
    /**
     * Specifies the margin at the start in the inline direction
     */
    marginInlineStart: string | State<string>;
    /**
     * Sets the left margin of an element
     */
    marginLeft: string | State<string>;
    /**
     * Sets the right margin of an element
     */
    marginRight: string | State<string>;
    /**
     * Sets the top margin of an element
     */
    marginTop: string | State<string>;
    /**
     * Points to a marker that will be drawn on all vertices of an element's path (the first, middle, and last)
     */
    marker: string | State<string>;
    /**
     * Points to a marker that will be drawn on the last vertex of an element's path
     */
    markerEnd: string | State<string>;
    /**
     * Points to a marker that will be drawn on all the middle vertices of an element's path
     */
    markerMid: string | State<string>;
    /**
     * Points to a marker that will be drawn on the first vertex of an element's path
     */
    markerStart: string | State<string>;
    /**
     * A shorthand property for mask-image, mask-mode, mask-repeat, mask-position, mask-clip, mask-origin, mask-size and mask-composite
     */
    mask: string | State<string>;
    /**
     * Specifies which area is affected by a mask image
     */
    maskClip: string | State<string>;
    /**
     * Specifies a compositing operation used on the current mask layer with the mask layers below it
     */
    maskComposite: string | State<string>;
    /**
     * Specifies an image to be used as a mask layer for an element
     */
    maskImage: string | State<string>;
    /**
     * Specifies whether the mask layer image is treated as a luminance mask or as an alpha mask
     */
    maskMode: string | State<string>;
    /**
     * Specifies the origin position (the mask position area) of a mask layer image
     */
    maskOrigin: string | State<string>;
    /**
     * Sets the starting position of a mask layer image (relative to the mask position area)
     */
    maskPosition: string | State<string>;
    /**
     * Specifies how the mask layer image is repeated
     */
    maskRepeat: string | State<string>;
    /**
     * Specifies the size of a mask layer image
     */
    maskSize: string | State<string>;
    /**
     * Specifies whether an SVG <mask> element is treated as a luminance mask or as an alpha mask
     */
    maskType: string | State<string>;
    /**
     * Sets the maximum height of an element
     */
    maxHeight: string | State<string>;
    /**
     * Sets the maximum width of an element
     */
    maxWidth: string | State<string>;
    /**
     * Sets the maximum size of an element in the block direction
     */
    maxBlockSize: string | State<string>;
    /**
     * Sets the maximum size of an element in the inline direction
     */
    maxInlineSize: string | State<string>;
    /**
     * Sets the minimum size of an element in the block direction
     */
    minBlockSize: string | State<string>;
    /**
     * Sets the minimum size of an element in the inline direction
     */
    minInlineSize: string | State<string>;
    /**
     * Sets the minimum height of an element
     */
    minHeight: string | State<string>;
    /**
     * Sets the minimum width of an element
     */
    minWidth: string | State<string>;
    /**
     * Specifies how an element's content should blend with its direct parent background
     */
    mixBlendMode: string | State<string>;
    /**
     * Specifies how the contents of a replaced element should be fitted to the box established by its used height and width
     */
    objectFit: string | State<string>;
    /**
     * Specifies the alignment of the replaced element inside its box
     */
    objectPosition: string | State<string>;
    /**
     * A shorthand property for the offset-anchor, offset-distance, offset-path, offset-position, and the offset-rotate properties
     */
    offset: string | State<string>;
    /**
     * Specifies a point on an element that is fixed to the path it is animated along
     */
    offsetAnchor: string | State<string>;
    /**
     * Specifies the position along a path where an animated element is placed
     */
    offsetDistance: string | State<string>;
    /**
     * Specifies the path an element is animated along
     */
    offsetPath: string | State<string>;
    /**
     * Specifies the initial position of an element along a path
     */
    offsetPosition: string | State<string>;
    /**
     * Specifies rotation of an element as it is animated along a path
     */
    offsetRotate: string | State<string>;
    /**
     * Sets the opacity level for an element
     */
    opacity: string | State<string>;
    /**
     * Sets the order of the flexible item, relative to the rest
     */
    order: string | State<string>;
    /**
     * Sets the minimum number of lines that must be left at the bottom of a page or column
     */
    orphans: string | State<string>;
    /**
     * A shorthand property for the outline-width, outline-style, and the outline-color properties
     */
    outline: string | State<string>;
    /**
     * Sets the color of an outline
     */
    outlineColor: string | State<string>;
    /**
     * Offsets an outline, and draws it beyond the border edge
     */
    outlineOffset: string | State<string>;
    /**
     * Sets the style of an outline
     */
    outlineStyle: string | State<string>;
    /**
     * Sets the width of an outline
     */
    outlineWidth: string | State<string>;
    /**
     * Specifies what happens if content overflows an element's box
     */
    overflow: string | State<string>;
    /**
     * Specifies whether or not content in viewable area in a scrollable contianer should be pushed down when new content is loaded above
     */
    overflowAnchor: string | State<string>;
    /**
     * Specifies whether or not the browser can break lines with long words, if they overflow the container
     */
    overflowWrap: string | State<string>;
    /**
     * Specifies whether or not to clip the left/right edges of the content, if it overflows the element's content area
     */
    overflowX: string | State<string>;
    /**
     * Specifies whether or not to clip the top/bottom edges of the content, if it overflows the element's content area
     */
    overflowY: string | State<string>;
    /**
     * Specifies whether to have scroll chaining or overscroll affordance in x- and y-directions
     */
    overscrollBehavior: string | State<string>;
    /**
     * Specifies whether to have scroll chaining or overscroll affordance in the block direction
     */
    overscrollBehaviorBlock: string | State<string>;
    /**
     * Specifies whether to have scroll chaining or overscroll affordance in the inline direction
     */
    overscrollBehaviorInline: string | State<string>;
    /**
     * Specifies whether to have scroll chaining or overscroll affordance in x-direction
     */
    overscrollBehaviorX: string | State<string>;
    /**
     * Specifies whether to have scroll chaining or overscroll affordance in y-directions
     */
    overscrollBehaviorY: string | State<string>;
    /**
     * A shorthand property for all the padding-* properties
     */
    padding: string | State<string>;
    /**
     * Specifies the padding in the block direction
     */
    paddingBlock: string | State<string>;
    /**
     * Specifies the padding at the end in the block direction
     */
    paddingBlockEnd: string | State<string>;
    /**
     * Specifies the padding at the start in the block direction
     */
    paddingBlockStart: string | State<string>;
    /**
     * Sets the bottom padding of an element
     */
    paddingBottom: string | State<string>;
    /**
     * Specifies the padding in the inline direction
     */
    paddingInline: string | State<string>;
    /**
     * Specifies the padding at the end in the inline direction
     */
    paddingInlineEnd: string | State<string>;
    /**
     * Specifies the padding at the start in the inline direction
     */
    paddingInlineStart: string | State<string>;
    /**
     * Sets the left padding of an element
     */
    paddingLeft: string | State<string>;
    /**
     * Sets the right padding of an element
     */
    paddingRight: string | State<string>;
    /**
     * Sets the top padding of an element
     */
    paddingTop: string | State<string>;
    /**
     * Sets the page-break behavior after an element. Replaced by break-after property
     */
    pageBreakAfter: string | State<string>;
    /**
     * Sets the page-break behavior before an element. Replaced by break-before property
     */
    pageBreakBefore: string | State<string>;
    /**
     * Sets the page-break behavior inside an element. Replaced by break-inside property
     */
    pageBreakInside: string | State<string>;
    /**
     * Sets the order of how an SVG element or text is painted.
     */
    paintOrder: string | State<string>;
    /**
     * Gives a 3D-positioned element some perspective
     */
    perspective: string | State<string>;
    /**
     * Defines at which position the user is looking at the 3D-positioned element
     */
    perspectiveOrigin: string | State<string>;
    /**
     * Specifies align-content and justify-content property values for flexbox and grid layouts
     */
    placeContent: string | State<string>;
    /**
     * Specifies align-items and justify-items property values for grid layouts
     */
    placeItems: string | State<string>;
    /**
     * Specifies align-self and justify-self property values for grid layouts
     */
    placeSelf: string | State<string>;
    /**
     * Defines whether or not an element reacts to pointer events
     */
    pointerEvents: string | State<string>;
    /**
     * Specifies the type of positioning method used for an element (static, relative, absolute or fixed)
     */
    position: string | State<string>;
    /**
     * Sets the type of quotation marks for embedded quotations
     */
    quotes: string | State<string>;
    /**
     * Defines if (and how) an element is resizable by the user
     */
    resize: string | State<string>;
    /**
     * Specifies the right position of a positioned element
     */
    right: string | State<string>;
    /**
     * Specifies the rotation of an element
     */
    rotate: string | State<string>;
    /**
     * Specifies the gap between the grid rows
     */
    rowGap: string | State<string>;
    /**
     * Specifies the size of an element by scaling up or down
     */
    scale: string | State<string>;
    /**
     * Specifies whether to smoothly animate the scroll position in a scrollable box, instead of a straight jump
     */
    scrollBehavior: string | State<string>;
    /**
     * Specifies the margin between the snap position and the container
     */
    scrollMargin: string | State<string>;
    /**
     * Specifies the margin between the snap position and the container in the block direction
     */
    scrollMarginBlock: string | State<string>;
    /**
     * Specifies the end margin between the snap position and the container in the block direction
     */
    scrollMarginBlockEnd: string | State<string>;
    /**
     * Specifies the start margin between the snap position and the container in the block direction
     */
    scrollMarginBlockStart: string | State<string>;
    /**
     * Specifies the margin between the snap position on the bottom side and the container
     */
    scrollMarginBottom: string | State<string>;
    /**
     * Specifies the margin between the snap position and the container in the inline direction
     */
    scrollMarginInline: string | State<string>;
    /**
     * Specifies the end margin between the snap position and the container in the inline direction
     */
    scrollMarginInlineEnd: string | State<string>;
    /**
     * Specifies the start margin between the snap position and the container in the inline direction
     */
    scrollMarginInlineStart: string | State<string>;
    /**
     * Specifies the margin between the snap position on the left side and the container
     */
    scrollMarginLeft: string | State<string>;
    /**
     * Specifies the margin between the snap position on the right side and the container
     */
    scrollMarginRight: string | State<string>;
    /**
     * Specifies the margin between the snap position on the top side and the container
     */
    scrollMarginTop: string | State<string>;
    /**
     * Specifies the distance from the container to the snap position on the child elements
     */
    scrollPadding: string | State<string>;
    /**
     * Specifies the distance in block direction from the container to the snap position on the child elements
     */
    scrollPaddingBlock: string | State<string>;
    /**
     * Specifies the distance in block direction from the end of the container to the snap position on the child elements
     */
    scrollPaddingBlockEnd: string | State<string>;
    /**
     * Specifies the distance in block direction from the start of the container to the snap position on the child elements
     */
    scrollPaddingBlockStart: string | State<string>;
    /**
     * Specifies the distance from the bottom of the container to the snap position on the child elements
     */
    scrollPaddingBottom: string | State<string>;
    /**
     * Specifies the distance in inline direction from the container to the snap position on the child elements
     */
    scrollPaddingInline: string | State<string>;
    /**
     * Specifies the distance in inline direction from the end of the container to the snap position on the child elements
     */
    scrollPaddingInlineEnd: string | State<string>;
    /**
     * Specifies the distance in inline direction from the start of the container to the snap position on the child elements
     */
    scrollPaddingInlineStart: string | State<string>;
    /**
     * Specifies the distance from the left side of the container to the snap position on the child elements
     */
    scrollPaddingLeft: string | State<string>;
    /**
     * Specifies the distance from the right side of the container to the snap position on the child elements
     */
    scrollPaddingRight: string | State<string>;
    /**
     * Specifies the distance from the top of the container to the snap position on the child elements
     */
    scrollPaddingTop: string | State<string>;
    /**
     * Specifies where to position elements when the user stops scrolling
     */
    scrollSnapAlign: string | State<string>;
    /**
     * Specifies scroll behaviour after fast swipe on trackpad or touch screen
     */
    scrollSnapStop: string | State<string>;
    /**
     * Specifies how snap behaviour should be when scrolling
     */
    scrollSnapType: string | State<string>;
    /**
     * Specifies the color of the scrollbar of an element
     */
    scrollbarColor: string | State<string>;
    /**
     * Defines a shape for wrapping for the inline content
     */
    shapeOutside: string | State<string>;
    /**
     * Specifies the width of a tab character
     */
    tabSize: string | State<string>;
    /**
     * Defines the algorithm used to lay out table cells, rows, and columns
     */
    tableLayout: string | State<string>;
    /**
     * Specifies the horizontal alignment of text
     */
    textAlign: string | State<string>;
    /**
     * Describes how the last line of a block or a line right before a forced line break is aligned when text-align is "justify"
     */
    textAlignLast: string | State<string>;
    /**
     * Specifies the combination of multiple characters into the space of a single character
     */
    textCombineUpright: string | State<string>;
    /**
     * Specifies the decoration added to text
     */
    textDecoration: string | State<string>;
    /**
     * Specifies the color of the text-decoration
     */
    textDecorationColor: string | State<string>;
    /**
     * Specifies the type of line in a text-decoration
     */
    textDecorationLine: string | State<string>;
    /**
     * Specifies the style of the line in a text decoration
     */
    textDecorationStyle: string | State<string>;
    /**
     * Specifies the thickness of the decoration line
     */
    textDecorationThickness: string | State<string>;
    /**
     * A shorthand property for the text-emphasis-style and text-emphasis-color properties
     */
    textEmphasis: string | State<string>;
    /**
     * Specifies the color of emphasis marks
     */
    textEmphasisColor: string | State<string>;
    /**
     * Specifies the position of emphasis marks
     */
    textEmphasisPosition: string | State<string>;
    /**
     * Specifies the style of emphasis marks
     */
    textEmphasisStyle: string | State<string>;
    /**
     * Specifies the indentation of the first line in a text-block
     */
    textIndent: string | State<string>;
    /**
     * Specifies the justification method used when text-align is "justify"
     */
    textJustify: string | State<string>;
    /**
     * Defines the orientation of characters in a line
     */
    textOrientation: string | State<string>;
    /**
     * Specifies what should happen when text overflows the containing element
     */
    textOverflow: string | State<string>;
    /**
     * Adds shadow to text
     */
    textShadow: string | State<string>;
    /**
     * Controls the capitalization of text
     */
    textTransform: string | State<string>;
    /**
     * Specifies the offset distance of the underline text decoration
     */
    textUnderlineOffset: string | State<string>;
    /**
     * Specifies the position of the underline text decoration
     */
    textUnderlinePosition: string | State<string>;
    /**
     * Specifies the top position of a positioned element
     */
    top: string | State<string>;
    /**
     * Applies a 2D or 3D transformation to an element
     */
    transform: string | State<string>;
    /**
     * Allows you to change the position on transformed elements
     */
    transformOrigin: string | State<string>;
    /**
     * Specifies how nested elements are rendered in 3D space
     */
    transformStyle: string | State<string>;
    /**
     * A shorthand property for all the transition-* properties
     */
    transition: string | State<string>;
    /**
     * Specifies when the transition effect will start
     */
    transitionDelay: string | State<string>;
    /**
     * Specifies how many seconds or milliseconds a transition effect takes to complete
     */
    transitionDuration: string | State<string>;
    /**
     * Specifies the name of the CSS property the transition effect is for
     */
    transitionProperty: string | State<string>;
    /**
     * Specifies the speed curve of the transition effect
     */
    transitionTimingFunction: string | State<string>;
    /**
     * Specifies the position of an element
     */
    translate: string | State<string>;
    /**
     * Used together with the direction property to set or return whether the text should be overridden to support multiple languages in the same document
     */
    unicodeBidi: string | State<string>;
    /**
     * Specifies whether the text of an element can be selected
     */
    userSelect: string | State<string>;
    /**
     * Sets the vertical alignment of an element
     */
    verticalAlign: string | State<string>;
    /**
     * Specifies whether or not an element is visible
     */
    visibility: string | State<string>;
    /**
     * Specifies how white-space inside an element is handled
     */
    whiteSpace: string | State<string>;
    /**
     * Sets the minimum number of lines that must be left at the top of a page or column
     */
    widows: string | State<string>;
    /**
     * Sets the width of an element
     */
    width: string | State<string>;
    /**
     * Specifies how words should break when reaching the end of a line
     */
    wordBreak: string | State<string>;
    /**
     * Increases or decreases the space between words in a text
     */
    wordSpacing: string | State<string>;
    /**
     * Allows long, unbreakable words to be broken and wrap to the next line
     */
    wordWrap: string | State<string>;
    /**
     * Specifies whether lines of text are laid out horizontally or vertically
     */
    writingMode: string | State<string>;
    /**
     * Sets the stack order of a positioned element
     */
    zIndex: string | State<string>;
    /**
     * Specifies the zoom factor for an element. An element can be zoomed in and out
     */
    zoom: string | State<string>;
}
