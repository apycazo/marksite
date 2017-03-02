// =============================================================================
/* MarkSite
@author Andres Picazo
TODO List:
    - Blocks inside other blocks (change array to json?)
    - Nested lists
    - Image linking
*/
// =============================================================================


// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

var config     = require('./config.js');
const fs       = require('fs');
// const walk     = require('walk');
const os       = require('os');
const bluebird = require('bluebird');
var fsp        = bluebird.promisifyAll(fs);

// -----------------------------------------------------------------------------
// Page parser
// -----------------------------------------------------------------------------

function mdParser (name, page)
{
    status = [];

    var isBlock = function (value) {
        if (typeof value === 'undefined') return status.length !== 0;
        else return status.length > 0 && status[0] === value;
    }
    var setBlock = function (value) { return status.unshift(value); }
    var unsetBlock = function () { return status.shift(); }
    var processLine = function (line)
    {
        return line
            // **bold**
            .replace(/(?:\*\*)([^!\*]+)?(?:\*\*)/g, '<strong>$1</strong>')
            // *italic*
            .replace(/(?:\*)([^!\*]+)?(?:\*)/g, '<i>$1</i>')
            // ~~strike through~~
            .replace(/(?:\~\~)([^!\~]+)?(?:\~\~)/g, '<strike>$1</strike>')
            // ``monospaced``
            .replace(/(?:\`\`)([^!\`]+)?(?:\`\`)/g, '<tt>$1</tt>')
            // `label`
            .replace(/(?:\`)([^!\`]+)?(?:\`)/g, '<span class="label label-danger">$1</span>')
            // ##### header 5
            .replace(/(?:\#####)([^\n]+)?/g, '<h5>$1</h5>')
            // #### header 4
            .replace(/(?:\####)([^\n]+)?/g, '<h4>$1</h4>')
            // ### header 3
            .replace(/(?:\###)([^\n]+)?/g, '<h3>$1</h3>')
            // ## header 2
            .replace(/(?:\##)([^\n]+)?/g, '<h2>$1</h2>')
            // # header 1
            .replace(/(?:\#)([^\n]+)?/g, '<h1>$1</h1>')
            // [text with](link)
            .replace(/(?:\[)([^\n]+)(?:\]\()([^\n]+)?(?:\))/g, '<a href="$2">$1</a>')
            // Add line break if required
            + (line.endsWith('  ') ? '<br>':'');
    }

    return `<div id="${name}">\n` + page
        .split('\n')
        .map(function (line, index, all) {
            // start/end highlight code
            if (line.indexOf('```') === 0) {
                if (isBlock('code')) {
                    unsetBlock();
                    return '</code></pre>';
                }
                else {
                    setBlock('code');
                    lang = line.substr(3);
                    return lang === '' ? '<pre><code>' : `<pre><code class="${lang}">`
                }
                status = 'code';
            }
            // inside a code block nothing shall be modified
            else if (isBlock('code')) {
                return line;
            }
            else if (line.startsWith('>')) {
                if (isBlock('quote')) return `<br>${processLine(line.substr(1))}`;
                else {
                    setBlock('quote')
                    return `<blockquote>${line.substr(1)}` ;
                }
            }
            else if (line.startsWith('* ') || line.startsWith('+ ')) {
                if (isBlock('list')) {
                    return `<li>${processLine(line.substr(2))}</li>`;
                }
                else {
                    setBlock('list');
                    return `<ul><li>${processLine(line.substr(2))}</li>`;
                }
            }
            else if (/^[0-9]+[\.](.+)?/.test(line)) {
                line = /^[0-9]+[\.](.+)?/.exec(line)[1];
                if (isBlock('ordered-list')) {
                    return `<li>${processLine(line)}</li>`;
                }
                else {
                    setBlock('ordered-list');
                    return `<ol><li>${processLine(line)}</li>`;
                }
            }
            // a line with only two spaces is a new paragraph
            else if (line === '  ' || line === '') {
                // unsets any current block
                closure = '';
                switch(unsetBlock() || '') {
                    case 'list':
                        closure = '</ul>';
                        break;
                    case 'ordered-list':
                        closure = '</ol>';
                        break;
                    case 'quote': // this one does not really work
                        closure = '</blockquote>';
                        break;
                    default:
                        closure = '';
                }
                return closure + '<br>';
            }
            // three dashes is an horizontal line
            else if (line === '---' || line === '===') {
                return '<hr>';
            }
            // process line
            else {
                return processLine(line);
            }
        })
        .join('\n') + '\n</div>';
}

// -----------------------------------------------------------------------------
// Site builder
// -----------------------------------------------------------------------------

function buildSite (config, index, pages)
{
    var template = fs.readFileSync('./template.html', 'utf8');
    var index = fs.readFileSync('./index.md', 'utf8');
    // --- config title
    site = template.replace('<!--:title-->', `\t<title>${config.title || 'Marksite!'}</title>`);
    // --- navbar brand
    site = template.replace('<!--:brand-->', config.brand || 'Marksite!');
    // --- add scripts
    (config.scripts || []).forEach(script => {
        site = site.replace('<!--:script-->', `\t<script src="${script}"></script>\n<!--:script-->`);
    });
    // --- add styles
    (config.styles || []).forEach(style => {
        site = site.replace('<!--:style-->', `\t<link rel="stylesheet" type="text/css" href="${style}"/>\n<!--:style-->`);
    });
    // --- replace index
    site = site.replace('<!--:index-->', mdParser('index.md', index));
    // log & save file
    // console.log(site);
    fs.writeFileSync(config.target, site, 'utf8');
}

// -----------------------------------------------------------------------------
// Build the pages
// -----------------------------------------------------------------------------

// simple way
var pages = {};
fsp
    .readdirAsync(config.source)
    .filter(file => file.endsWith('.md'))
    .map(function (filename) {
        pages[filename] = null;
        return fsp.readFileAsync(config.source + "/" + filename, "utf8");
    })
    .then(function (data) {
        Object.keys(pages).forEach(function (k,i) { pages[k] = data[i] });
        buildSite(config, pages);
    });
