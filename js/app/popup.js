var myApp = angular.module("my-app", ['ui.router']);

// configuring our routes 
// =============================================================================
myApp.config(function($stateProvider, $urlRouterProvider) {
    
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: '../views/home.html'
        })

        .state('home.login', {
            url: '/login',
            templateUrl: '../views/login.html'
        })

        .state('home.fetch-amazon-data', {
            url: '/fetch-amazon-data',
            templateUrl: '../views/fetch-amazon-data.html'
        })

        .state('home.dance-time', {
            url: '/dance-time',
            templateUrl: '../views/dance-time.html'
        })

        .state('home.fetching-complete', {
            url: '/fetching-complete',
            templateUrl: '../views/fetching-complete.html'
        });
       
    $urlRouterProvider.otherwise('/home/login');
})

myApp.controller("PopupCtrl", ['$scope', '$http', '$state', function($scope, $http, $state){
   console.log("Controller Initialized");

    // we will store all of our form data in this object
    $scope.client = {};
    $scope.formData = {};
    $scope.client_analytics_code = '';
    $scope.errorMessage = '';
    $scope.error = false;
    //change before deploying
    $scope.baseUrl = 'http://localhost:8000';

    $scope.loginViaExtension = function(formData) {
        console.log('ran $scope.loginViaExtension');
        chrome.runtime.sendMessage({type:"loginViaExtension", data: formData }, 
            function(response){
                console.log('this is the response from the background page',response);
                if(response.error){
                    let theErrorMessage = response.data.responseJSON.error;
                    console.log('theErrorMessage:',theErrorMessage);
                    $scope.errorMessage = theErrorMessage;
                    $scope.error = true;                   
                } else {
                    $scope.client = response;
                    $state.go('home.fetch-amazon-data');
                }
            }
        );
    };
  }
]);


myApp.controller("ScraperCtrl", ['$scope', '$http', '$state', function($scope, $http, $state){
   console.log("Scraper Controller Initialized");

    $scope.fetchAmazonData = function(user){
        $state.go('home.dance-time');
        chrome.runtime.sendMessage({type:"scrapeTime", user: user }, 
            function(response){
                console.log('this is the response from the content page for scrapeTime Event',response);
            }
        ); 
    }

    chrome.runtime.onMessage.addListener(
      function(message, sender, sendResponse) {
        switch(message.type) {
            case 'fetchingComplete':
                $state.go('home.fetching-complete');
                sendResponse('all good');
                return true;
                break;
        } 
      }
    );

  }
]);