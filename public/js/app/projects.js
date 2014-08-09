var unityProfilesResources = angular.module('unity-profiles-resources', ['ngResource']);

unityProfilesResources.factory('Project', ['$resource',
    function($resource) {
        return $resource('/projects/', {}, {
            query: {
                method: 'GET',
                params: {},
                isArray: true
            }
        }, {
            stripTrailingSlashes: false
        });
    }
]);

var unityProfilesApp = angular.module('unity-profiles-app', ['unity-profiles-resources']);

unityProfilesApp.controller('ProjectsListController', ['$scope', 'Project',
    function($scope, Project) {
        $scope.projects = Project.query();
    }
]);