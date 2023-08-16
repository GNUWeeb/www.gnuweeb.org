const { minify } = require("html-minifier-terser");
const fs = require("fs");
const path = require("path");

const htmlMinifierOptions = {
  caseSensitive: true,
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
  html5: true,
  minifyJS: true,
  minifyCSS: true,
  removeComments: true,
};

const htmlMinify = (html) => minify(html, htmlMinifierOptions);

const htmlMinifyFile = (file) => {
  const filePath = path.join(__dirname, file);
  const html = fs.readFileSync(filePath, "utf8");
  const minifiedHtml = htmlMinify(html)
    .then((minifiedHtml) => {
      fs.writeFileSync(filePath, minifiedHtml);
    })
    .catch((err) => {
      console.log(`[ERROR] ${err}`);
    })
    .finally(() => {
      console.log(`[INFO] ${filePath} minified.`);
    });

  return () => minifiedHtml;
};

htmlMinifyFile("dist/index.html");

console.log("HTML minified.");
