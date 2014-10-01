#!/bin/bash

NODE_PATH="node"
PACKAGE_DIR="./node_modules"

GULP="$PACKAGE_DIR/gulp/bin/gulp.js"
BOWER="$PACKAGE_DIR/bower/bin/bower"

echo "Running bower to download client dependencies..."
$BOWER install

echo "Running gulp to compile css and js bundles..."
node $GULP compile