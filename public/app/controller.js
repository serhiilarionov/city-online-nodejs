'use strict';

function Ctrl($scope, $routeProvider , $localStorage, Service) {
    $scope.set_lang = angular.bind(this, this.set_lang);
    this.scope = $scope;
    $scope.lang = {};
    this.Service = Service;
    this.localStorage = $localStorage;
    if(!$localStorage.lang) {
        this.set_lang();
    };
    this.get_lang($localStorage.lang);
    if($routeProvider.$$path) {
        switch($routeProvider.$$path) {
            case '/ru':
                this.set_lang('ru');
                break;
            case '/ua':
                this.set_lang('ua');
                break;
            case '/en':
                this.set_lang('en');
                break;
        }
        window.location.href = "/";
    }
}

Ctrl.prototype = {
    get_statistigs: function() {
        var this_ = this;
        this_.newsService.add(this_.scope.formInfo)
            .then(function(res) {
                success(this_.translate, swal, [res.text, 'Success']);
                success(this_.pop, swal, [res.text, 'Success']);
                this_.scope.formInfo = {};
            })
            .catch(function(err) {
                error(this_.translate, swal, [err.text, 'Error']);
            });
    },
    get_lang: function() {
        var this_ = this;
        this_.Service.get_lang(this.localStorage.lang)
            .then(function(res) {
                this_.scope.lang = res;
                this_.scope.curLang = this_.localStorage.lang;
            })
            .catch(function(err) {
                console.log(err);
            });
    },
    set_lang: function(lang) {
        if(lang == 'en' || lang == 'ru' || lang == 'ua') {
            this.localStorage.lang = lang;
        } else this.localStorage.lang = 'ua';
        this.get_lang();

    },
    setOrder: function(order) {
        this.scope.order = order;
    }
};

angular.module('App')
    .controller('Ctrl', ['$scope', '$location' , '$localStorage', 'Service', Ctrl]);
