# GNU/Weeb's Landing Page

GNU/Weeb's landing page made with svelte/kit.

## Project Structure

```
/ - src/                (App source)
    - lib/              (App library)
    - routes/           (App routes)
      - components/     (App UI components)
    - app.css           (App CSS styles)
    - app.d.ts          (App types)
    - app.html          (App root HTML)
  - package.json        (Dev dependencies)
  - *package-lock.json  (npm lockfile)
  - static/             (Static files)
    - favicon.ico       (Favicon)
  - **dist/             (Build directory)
  - **.svelte-kit/      (Compiled svelte/kit directory)
  - .gitignore          (Git ignore)
  . .editorconfig       (IDE/Editor config file)
  - .eslintignore       (ES lint ignore file)
  - .eslintrc.cjs       (ES lint config file)
  - .prettierignore     (Prettier ignore file)
  - .prettierrc         (Prettier config file)
  - postcss.config.js   (PostCSS config file)
  - svelte.config.js    (Svelte config file)
  - tailwind.config.js  (Tailwind config file)
  - tsconfig.json       (TypeScript compiler config file)
  - vite.config.ts      (Vite config file)

/** Legend:
  * (*)   => Only available after npm install
  * (**)  => Only available after npm run build
  */

```

## Development

> You will need `nodejs` (minimum version: 16), `TypeScript` (minimum version: 5) and `npm` package to run the dev server locally.

### Installing dependencies

To install the dependencies, issue this command:

```bash
npm install
```

### Development Server

To run the dev server, issue this command:

```bash
npm run dev
```

## Building for Production

To build for production, issue this command:

```bash
npm run build
```

This will copy all the required files into the `dist` directory.

## License

BSD 3-Clause License.
