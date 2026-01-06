#!/bin/bash

# This script checks if the version in package.json has been bumped compared to the latest git tag.

# Get the version from package.json using jq
PACKAGE_VERSION=$(jq -r '.version' package.json)
if [ -z "$PACKAGE_VERSION" ]; then
  echo "Error: Unable to read version from package.json"
  exit 1
fi

# Get the latest git tag
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
if [ -z "$LATEST_TAG" ]; then
  echo "No tags found in the repository. Assuming initial version bump."
  exit 0
fi

# Compare the package version with the latest tag
if [ "$PACKAGE_VERSION" == "$LATEST_TAG" ]; then
  echo "Version in package.json ($PACKAGE_VERSION) has not been bumped since the latest tag ($LATEST_TAG)."
  exit 1
fi

# Check the changelog for an entry corresponding to the new version
CHANGELOG_ENTRY=$(grep -E "^(\d+\.\d+\.\d+)" CHANGELOG.md)
if [ -z "$CHANGELOG_ENTRY" ]; then
  echo "No changelog entry found for version $PACKAGE_VERSION in CHANGELOG.md."
  exit 1
fi

if [ "$CHANGELOG_ENTRY" == "$LATEST_TAG" ]; then
    echo "No changelog entry found for version $PACKAGE_VERSION in CHANGELOG.md."
    exit 1
fi