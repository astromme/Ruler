#!/bin/bash

cd "$(dirname $0)"

version=$1
filename="releases/Edge-${version}.zip"

echo "stashing changes since last commit"
git stash save "create_release.sh"

echo "tagging release ${version}"
git tag "${version}"

echo "zipping into ${filename}"
zip -r "${filename}" app

echo "restoring changes since last commit"
git stash pop