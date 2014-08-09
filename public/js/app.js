    // Configure loading modules from the lib directory,
    // except for 'app' ones, which are in a sibling
    // directory.
    requirejs.config({
        baseUrl: 'js/libs',
        paths: {
            app: '../app'
        },
        paths: {
            //    angular: 'libs/angular'
        }
    });

    // Start loading the main app file. Put all of
    // your application logic in there.
    //requirejs(['app/projects']);