unity-profiles
==============

### Version 0.1

[![Build Status](https://travis-ci.org/NoxHarmonium/unity-profiles.png?branch=master)](https://travis-ci.org/NoxHarmonium/unity-profiles) [![Coverage Status](https://img.shields.io/coveralls/NoxHarmonium/unity-profiles.svg)](https://coveralls.io/r/NoxHarmonium/unity-profiles?branch=)

## Summary

A web application for setting up profiles that define the behavior of your Unity3D games. It aims to provide an easy interface to allow developers to enable designers and managers to do all the tweaking and to be able to share different settings between them.

The first version of the server side REST API is now complete with extensive unit tests. The current goal (version 0.2) is writing the first version of the browser front end. 

The API documentation can be found at this [Apiary page](http://docs.unityprofiles.apiary.io/)

## Description

In game development it is sometimes necessary to expose game variables in a way that enables designers, QA and project owners to tweak them while running the game on a device to find the optimum values. In Unity3D you can expose these variables by creating a temporary menu with the built in UI but it has several disadvantages:

- It covers part of the game playing area.
- It takes developer time to implement the menu especially if the variable is more complex than a boolean or a number.
- A menu on device can be fiddly and hard to adjust, especially if the input triggers the on screen keyboard.
- If the user finds different configurations they like and want to compare them there is no easy way to store configurations and compare them.

The main premise of Unity Profiles to allow a developer to simply add an [attribute](http://msdn.microsoft.com/en-us/library/z0w1kczw.aspx) to properties of a game object, and have them exposed in a separate web interface that can accessed on a separate computer or device. This web interface would allow the user to tweak the game properties in real time. The user can then play with different configurations, save them and quickly swap between them to compare. The could then share the configuration with other people who could then apply their own tweaks. Finally after a consensus is reached the configuration could then be downloaded and included with the project for deployment.

## Development 

The code style I've used for this project is documented [here](http://nodeguide.com/style.html). It is enforced with a jshint grunt task so the Travis build will fail if any of the code doesn't match this style.





