#!/bin/bash
if [[ -z "$TRAVIS" ]];
then
    export COVERALLS_SERVICE_NAME="Adhoc Test Machine";
    export COVERALLS_REPO_TOKEN="1DiClwfewqa0eVver6pMUQY8JnALfgqka";
    echo "Not on Travis CI? The the correct ENV vars have been set for you.";
else 
    echo "Coveralls info is already set. This should be so on Travis CI."
fi

FILES="tests/utils.test.js tests/controlValidation.test.js tests/userApi.test.js tests/projectApi.test.js tests/deviceApi.test.js tests/profileApi.test.js"
istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec -b $FILES && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage
