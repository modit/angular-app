angular.module('resources.tasks', ['mongoResource']);
angular.module('resources.tasks').factory('Tasks', ['mongoResource', function (mongoResource) {

  var Tasks = mongoResource('tasks');

  Tasks.statesEnum = ['TODO', 'IN_DEV', 'BLOCKED', 'IN_TEST', 'DONE'];

  Tasks.forProductBacklogItem = function (productBacklogItemId) {
    return Tasks.query({productBacklogItemId:productBacklogItemId});
  };

  Tasks.forSprint = function (sprintId) {
    return Tasks.query({sprintId:sprintId});
  };

  Tasks.forUser = function (userId) {
    return Tasks.query({userId:userId});
  };

  Tasks.forProject = function (projectId) {
    return Tasks.query({projectId:projectId});
  };

  return Tasks;
}]);