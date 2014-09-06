#!/bin/bash

cd "$(dirname $0)"

version=$1
filename="releases/Edge-${version}.zip"

if [ -z "${version}" ]; then
    echo "Usage: ${0} version_number"
    exit 1
fi

echo "stashing changes since last commit"
git stash save "create_release.sh"

echo "tagging release ${version}"
git tag "${version}"

echo "zipping into ${filename}"
zip -r "${filename}" app

echo "adding release zip to git"
git add "${filename"}
git commit -m "adding version ${version}"

echo "restoring changes since last commit"
git stash pop
