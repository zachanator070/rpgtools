#!/bin/bash

# This script checks if the version in package.json has been bumped compared to the latest git tag.

# Exit gracefully if PR is from dependabot
if [ "$GITHUB_ACTOR" == "dependabot[bot]" ]; then
  echo "PR is from dependabot. Skipping version check."
  exit 0
fi

# Get the version from package.json using jq
PACKAGE_VERSION=$(jq -r '.version' package.json)
if [ -z "$PACKAGE_VERSION" ]; then
  echo "Error: Unable to read version from package.json"
  exit 1
fi

# Get the latest git tag and strip leading 'v' if present
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
if [ -z "$LATEST_TAG" ]; then
  echo "No tags found in the repository. Assuming initial version bump."
  exit 0
fi
LATEST_TAG_STRIPPED=${LATEST_TAG#v}

# Compare the package version with the latest tag (ignore leading 'v')
if [ "$PACKAGE_VERSION" == "$LATEST_TAG_STRIPPED" ]; then
  echo "Version in package.json ($PACKAGE_VERSION) has not been bumped since the latest tag ($LATEST_TAG)."
  exit 1
fi

# Check the changelog for an entry corresponding to the new version
ESCAPED_VERSION=$(echo "$PACKAGE_VERSION" | sed 's/\./\\./g')
if ! grep -Eq "v?$ESCAPED_VERSION" CHANGELOG.md; then
  echo "No changelog entry found for version $PACKAGE_VERSION in CHANGELOG.md."
  exit 1
fi