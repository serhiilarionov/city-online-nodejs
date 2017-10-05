angular.module('App')
    .service('Service', function ($http, $q) {

        this.get_statistigs = function (news) {
            var deferred = $q.defer();
            $http.post('/news/add', { title: news.title, text: news.text })
                .success(function (response) {
                    deferred.resolve(response);
                })
                .error(function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        };

        this.get_lang = function (lang) {
            var deferred = $q.defer();
            $http.get('/lang/' + lang + '.json')
                .success(function (response) {
                    deferred.resolve(response);
                })
                .error(function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        };



    });
