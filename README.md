
# 🎶🍻🍺 carouse 🍹🍷🍸🚬

***web component ui carousel***

## carouse usage

1. **stick the html markup onto your page**

    - **`<carouse-carousel>`** — carousel that contains 'panes'
      - use the `[hidden]` attribute to hide the component until it has loaded
      - *(coming soon #2)* attribute `[arrows]` enables arrow controls
      - *(coming soon #2)* attribute `[dots]` enables dot button controls
      - *(coming soon #5)* attribute `[loop]` enables last-to-first looping
      - *(coming soon #3)* attribute `[crossfade="800"]` animated transitions that take 800 milliseconds
      - *(coming soon #3)* attribute `[autoplay="5"]` hits next every 5 seconds

    ```html
    <carouse-carousel arrows dots hidden>
      <figure>
        <img src="https://picsum.photos/300/200?1" alt=""/>
        <figcaption>
          <p>hello</p>
        </figcaption>
      </figure>
      <figure>
        <img src="https://picsum.photos/300/200?2" alt=""/>
        <figcaption>
          <p>hola</p>
        </figcaption>
      </figure>
      <figure>
        <img src="https://picsum.photos/300/200?3" alt=""/>
        <figcaption>
          <p>hallo</p>
        </figcaption>
      </figure>
    </carouse-carousel>
    ```

2. **load some scripts**

    - import map
      - in the below snippet, we load up an import map which locates `carouse` and its dependencies
      - of course, for the import map, we're using guy bedford's awesome polyfill: [es-module-shims](https://github.com/guybedford/es-module-shims)
      - if you're from the future, you won't need the shims ;)
    - register the carouse component
      - we run `import "carouse"` to register the `<carouse-carousel>` component

    ```html
    <script type="importmap-shim">
      {
        "imports": {
          "lit-html/": "https://unpkg.com/lit-html@1.0.0/",
          "lit-html": "https://unpkg.com/lit-html@1.0.0/lit-html.js",
          "lit-element/": "https://unpkg.com/lit-element@2.1.0/",
          "lit-element": "https://unpkg.com/lit-element@2.1.0/lit-element.js",
          "carouse/": "https://unpkg.com/carouse@0.0.0-dev.4/",
          "carouse": "https://unpkg.com/carouse@0.0.0-dev.4/dist/register-all.js"
        }
      }
    </script>
    <script type="module-shim">
      import "carouse"
    </script>
    <script src="https://unpkg.com/es-module-shims@0.2.3/dist/es-module-shims.js"></script>
    ```

3. **load some styles**

    - you might want to link in `carouse.css`
      - it has some rules for children you might place into the carousel
      - for example, it has some rules for `figure` and `figcaption`
      - this stylesheet is optional so you can have more control
      - since the import map shim doesn't work on stylesheet links, you'll have to include a full url
    - now for your own stylesheet
      - carouse is expecting you to set a `* {margin: 0; padding:0;}` rule, if you don't, there will be funny looking padding
      - you'll probably want to set a `max-width` rule on `carouse-carousel`
      - the `margin: 0 auto` is just to center-align the demo
      - all of the custom properties are listed below with their defaults

    ```html
    <link rel="stylesheet" href="https://unpkg.com/carouse@0.0.0-dev.3/source/carouse.css"/>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        padding: 2em;
        background: #222;
      }
      
      carouse-carousel {
        max-width: 300px;
        margin: 0 auto;

        /* carouse custom css properties */
        --focus-outline: 2px solid #0ef;
        --carouse-slate-bg: rgba(255,255,255, 0.1);
        --carouse-arrow-size: 4em;
        --carouse-arrow-bg: rgba(60,60,60, 0.8);
        --carouse-dotbar-bg: rgba(0,0,0, 0.3);
        --carouse-dot-size: 0.8em;
        --carouse-dot-bg: white;
      }
    </style>
    ```
