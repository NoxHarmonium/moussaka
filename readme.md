![Moussaka Logo](https://raw.githubusercontent.com/NoxHarmonium/unity-profiles/master/public/img/logo-with-text.png "Moussaka")
### Open Source Game Prototyping Framework

#### Version 0.1

[![Build Status](https://travis-ci.org/NoxHarmonium/moussaka.png?branch=master)](https://travis-ci.org/NoxHarmonium/moussaka) [![Coverage Status](https://img.shields.io/coveralls/NoxHarmonium/moussaka.svg)](https://coveralls.io/r/NoxHarmonium/moussaka?branch=)

## Summary

Moussaka is a web application with the goal of improving the prototyping and development of video games on mobile devices. It aims to provide an easy-to-use interface which designers and product owners can use to tweak game parameters in real-time. It will then allow them to then save different sets of parameters, easily switch between them for comparison and then even share them with others. When a set of parameters has been decided on, the developer can download the profile and drop it straight into the game for deployment.

The first version of the server side REST API is now complete with extensive unit tests. The current goal (version 0.2) is writing the first version of the browser front end which is coming along rapidly.

The API documentation can be found at this [Apiary page](http://docs.noxharmonium.apiary.io/)

## Description

In mobile game development it is sometimes necessary to expose game variables in a way that enables designers, QA and project owners to tweak them while running the game on a device to find the optimum values. In Unity3D you can expose these variables by creating a temporary menu with the built in UI but it has several disadvantages:

- It covers part of the game playing area.
- It takes developer time to implement the menu especially if the variable is more complex than a boolean or a number.
- A menu on device can be fiddly and hard to adjust, especially if the input triggers the on screen keyboard.
- If the user finds different configurations they like and want to compare them there is no easy way to store configurations and compare them.

It is also hard to share with other people when you find an optimum configuration. You may have to write down every value manually and might even lose it altogether if the game crashes.

The main premise of Moussaka is to allow a developer to simply add an [attribute](http://msdn.microsoft.com/en-us/library/z0w1kczw.aspx) to properties of a game object. When the game is loaded, a plugin will use reflection to find properties with these attributes and then send them to a server running Moussaka.

The user would then use the web application, select the relevant device and then get presented with javascript web controls that manipulate these properties in real-time. A particular configuration of these properties could be saved a profile which can be retrieved at a later date and shared with other people.

## Why is the project called Moussaka?
It is a very tasty dish and everyone knows that open source projects have very random names.
## Development
The backend is developed in [node.js](nodejs.org) and backed by [mongodb](mongodb.org).
The REST API is serviced by [express](expressjs.com) which also renders the website views and partial templates using [jade](jade-lang.com).
The frontend uses [angular.js](https://angularjs.org/) to do most of the work in presenting the webpage.
I have used [kube](http://imperavi.com/kube/) as the base responsive CSS framework that I build on and use [less](lesscss.org/) as a CSS preprocessor.
To prevent code duplication, code written for node.js can be used client side through the magic of [browserify](http://browserify.org/).
The API tests run on [mocha](visionmedia.github.io/mocha/) but I am still determining what will run the end-to-end tests on the frontend interface although it will most likely be [karma](karma-runner.github.io/) with [phantomjs](phantomjs.org).

The code style I've used for this project is documented [here](http://nodeguide.com/style.html). It is enforced with a jshint grunt task so the Travis build will fail if any of the code doesn't match this style.

## Running Moussaka

If you want to try it out (although there isn't alot to see yet) follow these instructions.

### Using Heroku
If you want to try it out in just a few clicks, get a [free Heroku acccount](https://www.heroku.com/pricing) and click the button below to automatically deploy Moussaka.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Make sure you specify a valid MongoDB URL. You can also create a free account with [MongoLab](https://mongolab.com/) which will give you a cloud hosted MongoDB instance with about 500 MB to work with.

### On Your Machine

1. Make sure you have node.js and npm installed.
2. Make sure you have mongodb installed.
3. Clone the repository locally.

```shell
# git clone git@github.com:NoxHarmonium/moussaka.git
```

4. Make sure you have gulp and bower installed globally.

```shell
# npm install -g gulp
# npm install -g bower
```

5. Install all the server dependencies.

```shell
# npm install
```

6. Install all the client dependencies.

```shell
# bower install
```

7. Compile all the client side javascript and CSS bundles.

```shell
# gulp compile
```

7. Run the unit tests to make sure everything is functioning correctly.

```shell
# gulp test
```







