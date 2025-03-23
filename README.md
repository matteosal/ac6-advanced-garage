# AC6 Advanced Garage

AC6 Advanced Garage is a tool to create, analyze and optimize builds for the game Armored Core VI. Its main purpose is to replicate the look and feel of the in-game builder showing all its computed AC specs while also adding extra useful ones. 

* [Deployed site](https://matteosal.github.io/ac6-advanced-garage)
* [Changelog](https://github.com/matteosal/ac6-advanced-garage/blob/master/CHANGELOG.md)

## Features

## Advanced specs

Barring possible errors in the part specs data, AC6 Advanced Garage correctly computes (up to very minor errors) all the specs reported by the in-game builder. In addition it also computes/reports several others for individual weapon parts and for the entire AC. These extra specs are labeled with an information icon that shows a descriptive tooltip when hovered. Some of these specs can be computed from the ones given by the in-game builder while others are obtained via data mining of the game files and/or reverse engineering of the game mechanics.

## Additional sections

In addition to an AC builder, AC6 Advanced Garage also features a section to compare different builds against each other, dynamic tables for all the parts data and a section to compute ricochet distances.

# Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). Execute `npm install` to install the dependencies and `npm start` to run locally. Running `npm run local-deploy` builds the project and deploys it locally. Use `npm run local-deploy -- -l XXXX` to deploy on port `XXXX`.

## Deployment

Deployment to GitHub Pages is handled by `gh-pages` with some extra steps to keep track of version history. The steps to deploy a new version are:

* Bump the package version number in [package.json](https://github.com/matteosal/ac6-advanced-garage/blob/master/package.json) and [package-lock.json](https://github.com/matteosal/ac6-advanced-garage/blob/master/package-lock.json)
* Update the [Changelog](https://github.com/matteosal/ac6-advanced-garage/blob/master/CHANGELOG.md)
* Commit the above changes
* Create a tag on the current commit named vX.Y.Z where X, Y, Z match the new version number. Push the tag.
* Run `npm run deploy`. A script will check that a version tag is attached to the current commit, will build the project and deploy it. The tag name will be used by `gh-pages` to produce a commit message that mentions the deployment version.
