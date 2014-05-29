angular.module('resources.sprints', ['mongoResource']);
angular.module('resources.sprints').factory('Sprints', ['mongoResource', function (mongoResource) {

  var Sprints = mongoResource('sprints');
  Sprints.forProject = function (projectId) {
    return Sprints.query({projectId:projectId});
  };
  return Sprints;
}]);