#!/bin/bash
set -e

git config --global --add safe.directory /github/workspace

COMMIT_MSG=$(git rev-list --format=%B --max-count=1 HEAD)
echo "Commit Message: $COMMIT_MSG"
if ! grep -qE '^(MAJOR|MINOR|PATCH):' <<< "$COMMIT_MSG"; then
    echo -e "No version directive. Skipping release..."
    exit 0
fi

version_part() {
    IFS="." read -ra VERSION <<< "$1"
    echo "${VERSION[$2]}"
}

incr() {
    echo $(($1 + 1))
}

join_version() {
    echo "v${1}.${2}.${3}"
}

tag() {
    git tag "$1"
    echo "New tag $1"
}

git config user.name "$GITHUB_ACTOR"
git config user.email "<>"

LAST_TAG=$(git tag | sort -V | tail -1)
V_PATTERN="^v[0-9]{1,}.[0-9]{1,}.[0-9]{1,}$"

if [[ ! $LAST_TAG =~ $V_PATTERN ]]; then
    echo -e "The last tag ($LAST_TAG) does not match the expected pattern: $V_PATTERN"
    exit 1
fi

echo -e "Incrementing version $LAST_TAG"

BASE_TAG="${LAST_TAG//v/}"
if grep -qE "^PATCH:" <<< "$COMMIT_MSG"; then
    tag "$(join_version "$(version_part "$BASE_TAG" 0)" "$(version_part "$BASE_TAG" 1)" "$(incr "$(version_part "$BASE_TAG" 2)")")"
elif grep -qE "^MINOR:" <<< "$COMMIT_MSG"; then
    tag "$(join_version "$(version_part "$BASE_TAG" 0)" "$(incr "$(version_part "$BASE_TAG" 1)")" 0)"
elif grep -qE "^MAJOR:" <<< "$COMMIT_MSG"; then
    tag "$(join_version "$(incr "$(version_part "$BASE_TAG" 0)")" 0 0)"
fi

echo "::set-output name=CREATE_RELEASE::true"


git push --tags
echo -e "Done"