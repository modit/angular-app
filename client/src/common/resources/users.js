angular.module('resources.users', ['mongoResource']);
angular.module('resources.users').factory('Users', ['mongoResource', function (mongoResource) {

  var userResource = mongoResource('users');
  userResource.prototype.getFullName = function () {
    return this.lastName + " " + this.firstName + " (" + this.email + ")";
  };

  return userResource;
}]);
