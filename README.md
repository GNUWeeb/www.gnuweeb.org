# GNU/Weeb's Landing Page

GNU/Weeb's simple landing page.

## Project Structure

```
/ - index.html          (Main page)
  - style.css           (Tailwind CSS)
  - package.json        (Dev dependencies)
  - *package-lock.json  (npm lockfile)
  - static/             (Static files)
    - favicon.ico       (Favicon)
  - **dist/             (Build directory)
  - build.js            (Build script)
  - .gitignore          (Git ignore)

/** Legend:
  * (*)   => Only available after npm install
  * (**)  => Only available after npm build
  */

```

## Development

> You will need `nodejs` (minimum version: 16) and `npm` package to run the dev server locally

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
