#!/bin/bash
#
# Automated Test Script
#
TIMEOUT=30000

mocha -b -t $TIMEOUT -R list tests/administration.js
mocha -b -t $TIMEOUT -R list tests/projectApi.test.js
