#!/bin/bash
#
# Automated Test Script
#

mocha -b -t 30000 -R list tests/administration.js
