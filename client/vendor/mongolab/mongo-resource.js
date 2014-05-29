angular.module('mongoResource', []).factory('mongoResource', ['MONGO_CONFIG','$http', '$q', function (MONGO_CONFIG, $http, $q) {

  function MongoResourceFactory(collectionName) {

    var url = MONGO_CONFIG.collectionUrl + collectionName;
    var defaultParams = {};
    
    var thenFactoryMethod = function (httpPromise, successcb, errorcb, isArray) {
      var scb = successcb || angular.noop;
      var ecb = errorcb || angular.noop;

      return httpPromise.then(function (response) {
        var result;
        if (isArray) {
          result = [];
          for (var i = 0; i < response.data.length; i++) {
            result.push(new Resource(response.data[i]));
          }
        } else {
          if (response.data === " null "){
            return $q.reject({
              code:'resource.notfound',
              collection:collectionName
            });
          } else {
            console.log('response', response);
            result = new Resource(response.data);
          }
        }
        scb(result, response.status, response.headers, response.config);
        return result;
      }, function (response) {
        ecb(undefined, response.status, response.headers, response.config);
        return undefined;
      });
    };

    var Resource = function (data) {
      angular.extend(this, data);
    };

    Resource.all = function (cb, errorcb) {
      return Resource.query({}, cb, errorcb);
    };

    Resource.query = function (queryJson, successcb, errorcb) {
      var params = angular.isObject(queryJson) ? {q:JSON.stringify(queryJson)} : {};
      var httpPromise = $http.get(url, {params:angular.extend({}, defaultParams, params)});
      return thenFactoryMethod(httpPromise, successcb, errorcb, true);
    };

    Resource.getById = function (id, successcb, errorcb) {
      var httpPromise = $http.get(url + '/' + id, {params:defaultParams});
      return thenFactoryMethod(httpPromise, successcb, errorcb);
    };

    Resource.getByIds = function (ids, successcb, errorcb) {
      return Resource.query({_id:{$in:ids}}, successcb, errorcb);
    };

    //instance methods

    Resource.prototype.$id = function () {
      return this._id;
    };

    Resource.prototype.$save = function (successcb, errorcb) {
      var httpPromise = $http.post(url, this, {params:defaultParams});
      return thenFactoryMethod(httpPromise, successcb, errorcb);
    };

    Resource.prototype.$update = function (successcb, errorcb) {
      var httpPromise = $http.put(url + "/" + this.$id(), angular.extend({}, this, {_id:undefined}), {params:defaultParams});
      return thenFactoryMethod(httpPromise, successcb, errorcb);
    };

    Resource.prototype.$remove = function (successcb, errorcb) {
      var httpPromise = $http['delete'](url + "/" + this.$id(), {params:defaultParams});
      return thenFactoryMethod(httpPromise, successcb, errorcb);
    };

    Resource.prototype.$saveOrUpdate = function (savecb, updatecb, errorSavecb, errorUpdatecb) {
      if (this.$id()) {
        return this.$update(updatecb, errorUpdatecb);
      } else {
        return this.$save(savecb, errorSavecb);
      }
    };

    return Resource;
  }
  return MongoResourceFactory;
}]);
