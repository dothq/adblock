# Dot Shield

> This project has been archived as we are in the process of moving adblock logic [in-tree](https://github.com/dothq/browser-desktop), eventually this repository will be unarchived to store our block lists.

## Abnormal system requirements

- `cargo install cargo-web`

## Development

Please make sure that you have the following installed on your system:

- `node`
- `yarn`
- The rust development tools
- `wasm-pack`

Then install all of the dependencies:

```sh
yarn
```

When developing run:

```sh
yarn dev
```

This will compile the addon into the `dist` folder. If you make a change to the code, it will recompile.

### File structure

All of the source code is contained in the `src` directory.

`frontend` contains all of the code for the UIs. Inside of front end there is `constants` containing all of the constants, `html` containing the html files for each ui (and a `pages.js` used by webpack), `icons` containing all of the icons and `ui`. `ui` contains the TS and CSS code for each UI. Inside the `ui` folder `assets` only contains fonts, `common` contains shared UI components and css files, `popup` contains the react and css code for the browser action, `settings` contains the react and css code for /settings.html, and `stats` contains the TS code for /stats.html.

`constants` contains the manifest file and some constants that need to be shared between the background threads and UI threads.

`backend` contains the code for the background script for blocking ads. The `constants` folder contains the links to our ad and tracker lists. `rust` contains rust code that will, in the future be used for performance critical functions. `background` is the main background script, `blacklist` is the manager for the blacklists, `permStore` is a wrapper around extension storage, `settings` is a file for storing settings, `tempPort` is for communication between uis and the backend and `types` is for some typescript types.
