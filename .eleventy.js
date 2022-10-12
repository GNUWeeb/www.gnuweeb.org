const glob = require('fast-glob');
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const markdownItAnchor = require('markdown-it-anchor');
const markdownItToc = require('markdown-it-toc-done-right');
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
module.exports = function(eleventyConfig) {

  /* --------------------------------------------------------------------------
  11ty plugins
  -------------------------------------------------------------------------- */
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  /* --------------------------------------------------------------------------
  filters
  -------------------------------------------------------------------------- */
  glob.sync(['_source/_filters/*.js']).forEach(file => {
    let filters = require('./' + file);
    Object.keys(filters).forEach(name => eleventyConfig.addFilter(name, filters[name]));
  });
  // To create excerpts
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_alias: 'post_excerpt',
    excerpt_separator: '<!-- excerpt -->'
  })

  // To create a filter to determine duration of post
  eleventyConfig.addFilter('readTime', (value) => {
    const content = value
    const textOnly = content.replace(/(<([^>]+)>)/gi, '')
    const readingSpeedPerMin = 450
    return Math.max(1, Math.floor(textOnly.length / readingSpeedPerMin))
  })

  // filter to format post date to year-month-day
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('yyyy-MM-dd');
  })

  // Enable us to iterate over all the tags, excluding posts and all
  eleventyConfig.addCollection('tagList', collection => {
    const tagsSet = new Set()
    collection.getAll().forEach(item => {
      if (!item.data.tags) return
      item.data.tags
        .filter(tag => !['posts', 'all'].includes(tag))
        .forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  })

  const md = markdownIt({ html: true, linkify: true })
  md.use(markdownItAnchor, { 
    level: [1, 2], 
    permalink: markdownItAnchor.permalink.headerLink({ 
      safariReaderFix: true,
      class: 'header-anchor',
    })
  })
  /* --------------------------------------------------------------------------
  BrowserSync settings
  -------------------------------------------------------------------------- */
  eleventyConfig.setBrowserSyncConfig({
    ui: false,
    logPrefix: false,
    files: [ // watch the files generated elsewhere
      'public/assets/*.css',
      'public/assets/*.js',
      'public/assets',
      '!public/assets/**/**.map'
    ],
    server: { // make URLs work without a .html extension
      baseDir: "public",
      serveStaticOptions: {
          extensions: ["html"]
      }
    },
    snippetOptions: {
      rule: { // put the snippet in the head for Turbo happiness
        match: /<\/head>/i,
        fn: function (snippet, match) {
          return snippet + match;
        }
      }
    },
  });

  /* --------------------------------------------------------------------------
  MarkdownIt settings
  -------------------------------------------------------------------------- */
  const markdownItOptions = {
    html: true, // allow HTML markup
    typographer: true // fancy quotes
  };
  const markdownLib = markdownIt(markdownItOptions);
  markdownLib.use(markdownItAnchor, { // add anchors to headings
    level: '2',
    permalink: 'true',
    permalinkClass: 'anchor',
    permalinkSymbol: '﹟',
    permalinkBefore: 'true'
  });
  markdownLib.use(markdownItToc, { // make a TOC with ${toc}
    level: '2',
    listType: 'ul'
  });

  /* --------------------------------------------------------------------------
  11ty settings
  -------------------------------------------------------------------------- */
  eleventyConfig.setLibrary('md', markdownLib);
  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.addPassthroughCopy({ '_source/_assets/fonts': 'assets/fonts' });
  eleventyConfig.addPassthroughCopy({ '_source/_assets/images': 'assets' });

  return {
    dir: {
      input: '_source',
      output: 'public',
      layouts: '_layouts',
      includes: '_includes'
    },
    templateFormats: ['html', 'md', 'liquid', 'njk'],
    htmlTemplateEngine: 'liquid'
  };
};