#!/usr/bin/env node

const fs       = require('fs');
const marked   = require('marked');

var template = `<!DOCTYPE html>
<html>
<head>
<!--:favicon--><!--:title--><!--:style--><!--:script-->
<style>
    body { padding-top: 70px; padding-left: 20px; padding-right: 20px; }
    .content-selector { text-align: center; padding-top: 20px; }
    .marksite code { padding: 4px 4px; }
    .marksite pre { padding: 0px; }
    .marksite hr { border-top: 1px solid #ffffff; }
    .footer { background-color: #697075; min-height: 50px; line-height: 50px; text-align: center; margin-top:25px }
    th, td { padding: 5px; border:1px solid black; }
</style>
<script>
    hljs.initHighlightingOnLoad();
    angular.module("marksite",[]).controller("marksite-controller", ["$rootScope","$scope", function ($root, $scope) {
        $root.bookmark = { chapter: 0, page: 0 };
    }]);
</script>
</head>
<body ng-app="marksite" class="marksite">
    <div ng-controller="marksite-controller">
        <nav class="navbar navbar-default navbar-fixed-top navbar-inverse">
            <div class="container-fluid">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#marksite-navbar" aria-expanded="false">
                        <span class="sr-only">Toggle nav</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>
                    </button>
                    <!--:brand-->
                </div>
                <div class="collapse navbar-collapse" id="marksite-navbar"><ul class="nav navbar-nav"><!--:navbar-items--></ul></div>
            </div>
        </nav>
        <div class="row"><!--:content--></div>
        <div class="footer"><p>Built with <a href="https://github.com/apycazo/marksite">Marksite</a></p></div>
    </div>
</body>
</html>`;

function expandName (name)
{
    name = name.split("/").pop();
    return (name.charAt(0).toUpperCase() + name.slice(1)).split('-').join(' ');
}

function createPageSelector (pages, chapterNumber, columns=2)
{
    var options = pages.map(function (page, index) {
        action = `$root.bookmark.chapter=${chapterNumber}; $root.bookmark.page=${index}`;
        return `<a href="#" ng-class="{'list-group-item':true, active:$root.bookmark.page==${index}}" ng-click="${action}">
                ${expandName(page).replace('.md','')}</a>`;
    }).join('\n');

    return `<div class="content-selector col-md-${columns}" ng-show="$root.bookmark.chapter==${chapterNumber}">
            <ul class="list-group">${options}</ul></div>`;
}

(build = function () {
    cfg = JSON.parse(fs.readFileSync(process.argv[2] || './site.json', 'utf8'));
    // replace basics
    render = template
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
                console.log('Rendering page: ', (cfg.source || '') + page);
                return `<div ${style} ng-show="${showIf}">${marked(fs.readFileSync((cfg.source || '') + page, 'utf8'))}</div>`;
            }).join('\n');
        }).join('\n'));
    target = cfg.target || 'index.html';
    fs.writeFileSync(target, render, 'utf8');
    console.log('Generated site on: ', target);
})();
