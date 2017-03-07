// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

const fs       = require('fs');
const marked   = require('marked');

function expandName (name)
{
    name = name.split("/").pop();
    return (name.charAt(0).toUpperCase() + name.slice(1)).replace('-', ' ');
}

function createPageSelector (pages, chapterNumber, columns=2)
{
    var options = pages.map(function (page, index) {
        action = `$root.bookmark.chapter=${chapterNumber}; $root.bookmark.page=${index}`;
        return `<a href="#" ng-class="{'list-group-item':true, active:$root.bookmark.page==${index}}" ng-click="${action}">
                ${expandName(page).replace('.md','')}
            </a>`;
    }).join('\n');

    return `<div class="content-selector col-md-${columns}" ng-show="$root.bookmark.chapter==${chapterNumber}">
            <ul class="list-group">${options}</ul>
        </div>`;
}

(build = function () {
    cfg = JSON.parse(fs.readFileSync(process.argv[2] || './site.json', 'utf8'));
    // replace basics
    render = fs.readFileSync(cfg.template, 'utf8')
        .replace('<!--:favicon-->', cfg.favicon ? `<link rel="icon" href="${cfg.favicon}">` : '')
        .replace('<!--:title-->', `<title>${cfg.title || 'Marksite!'}</title>`)
        .replace('<!--:brand-->', `<a class="navbar-brand" href="${cfg.home}">${cfg.brand || "Marksite"}</a>`)
        .replace('<!--:script-->', cfg.scripts.map(script => `<script src="${script}"></script>`).join('\n'))
        .replace('<!--:style-->', cfg.styles.map(style => `<link rel="stylesheet" type="text/css" href="${style}"/>`).join('\n'))
        .replace('<!--:navbar-items-->', Object.keys(cfg.chapters).map((name,index) => {
            return `<li><a href="#" ng-click="$root.bookmark.chapter=${index};$root.bookmark.page=0">${name}</a></li>`;
        }).join('\n'))
        .replace('<!--:content-->', Object.keys(cfg.chapters).map((chapterName,chapterNumber) => {
            pages = cfg.chapters[chapterName];
            selector = pages.length > 1 ? createPageSelector(cfg.chapters[chapterName], chapterNumber): '';
            return selector + '\n' + pages.map((page, pageNumber) => {
                style = `class="content-viewport col-md-9 ${pages.length <= 1 ? 'col-md-offset-1': ''}"`;
                showIf = `$root.bookmark.chapter==${chapterNumber} && $root.bookmark.page==${pageNumber}`;
                return `<div ${style} ng-show="${showIf}">${marked(fs.readFileSync(page, 'utf8'))}</div>`;
            }).join('\n');
        }).join('\n'));
    fs.writeFileSync(cfg.target, render, 'utf8');
})();
