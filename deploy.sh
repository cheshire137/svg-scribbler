#!/bin/sh

gulp build
git add -A dist
git commit -m "Update dist/"
git subtree push --prefix dist origin gh-pages
