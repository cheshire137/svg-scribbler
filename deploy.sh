#!/bin/sh

gulp build
git add -A dist
git commit -m "Update dist/"
git push origin master
git subtree push --prefix dist origin gh-pages
