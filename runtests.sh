#!/bin/bash
#
# Automated Test Script
#
TIMEOUT=30000

mocha -b -t $TIMEOUT -R list tests/userApi.test.js
mocha -b -t $TIMEOUT -R list tests/projectApi.test.js
