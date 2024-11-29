# AC6 Advanced Garage

AC6 Advanced Garage is a tool to create, analyze and optimize builds for the game Armored Core VI. Its main purpose is to replicate the look and feel of the in-game builder showing all its computed AC specs while also adding extra useful ones. 

* [Deployed site](https://matteosal.github.io/ac6-advanced-garage)
* [Changelog](https://github.com/matteosal/ac6-advanced-garage/blob/master/CHANGELOG.md)

## In-game specs

Barring possible errors in the part specs data, AC6 Advanced Garage correctly computes the in-game specs except currently for Speed/QBSpeed in case of overloading and Target Tracking in case of arms overload. I could look into adding their correct computation but these cases are not relevant for the game. Besides those, many specs can also differ from the in-game results by 1 on the last digit. These occasional differences exist because the reverse-engineering of spec computation starts from the values given by the game builder which are heavily rounded, so it contains small errors in its premise.

## Advanced specs

There are quite a lot more specs that can be computed out from the data given by the in-game builder, and AC6 Advanced Garage adds some of them. These advanced specs are labeled with an information icon that shows a descriptive tooltip when hovered, and are usually straightforward to compute. They currently appear on the AC specs panel to the right and the central part panel for units. More could be added.

# Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). Execute `npm install` to install the dependencies and `npm start` to run locally. Running `npm run local-deploy` builds the project and deploys it locally. Use `npm run local-deploy -- -l XXXX` to deploy on port `XXXX`.

## Deployment

Deployment to GitHub Pages is handled by `gh-pages` with some extra steps to keep track of version history. The steps to deploy a new version are:

* Bump the package version number in [package.json](https://github.com/matteosal/ac6-advanced-garage/blob/master/package.json) and [package-lock.json](https://github.com/matteosal/ac6-advanced-garage/blob/master/package-lock.json)
* Update the [Changelog](https://github.com/matteosal/ac6-advanced-garage/blob/master/CHANGELOG.md)
* Commit the above changes
* Create a tag on the current commit named vX.Y.Z where X, Y, Z match the new version number. Push the tag.
* Run `npm run deploy`. A script will check that a version tag is attached to the current commit, will build the project and deploy it. The tag name will be used by `gh-pages` to produce a commit message that mentions the deployment version.
