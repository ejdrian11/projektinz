var app = angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {
	
	$routeProvider

	.when('/', {
		templateUrl: 'app/views/pages/home.html'
	})

	.when('/register',{
		templateUrl: '/app/views/pages/users/register.html',
		controller: 'regCtrl',
		controllerAs: 'register',
		authenticated: false
	})

	.when('/login',{
		templateUrl: '/app/views/pages/users/login.html',
		authenticated: false
	})

	.when('/logout',{
		templateUrl: '/app/views/pages/users/logout.html',
		authenticated: true
	})

	.when('/profile',{
		templateUrl: '/app/views/pages/users/profile.html',
		authenticated: true

	})

	.when('/kontakt',{
		templateUrl: '/app/views/pages/users/kontakt.html'
	})

	.when('/kodeks',{
		templateUrl: '/app/views/pages/users/kodeks.html'
	})

	.when('/znaki',{
		templateUrl: '/app/views/pages/users/znaki.html'
	})

	.when('/cennik',{
		templateUrl: '/app/views/pages/users/cennik.html'

	})
	.when('/art1',{
		templateUrl: '/app/views/pages/art1.html'
	})
	.when('/art2',{
		templateUrl: '/app/views/pages/art2.html'
	})
	.when('/art3',{
		templateUrl: '/app/views/pages/art3.html'
	})

	.when('/managment',{
		templateUrl: '/app/views/pages/users/managment.html',
		controller: 'managmentCtrl',
		controllerAs: 'managment',
		authenticated: true,
		permission: ['admin']

	})

	.when('/edit/:id',{
		templateUrl: '/app/views/pages/users/edit.html',
		controller: 'editCtrl',
		controllerAs: 'edit',
		authenticated: true,
		permission: ['admin']

	})

	.when('/zarezerwuj',{
		templateUrl: '/app/views/pages/users/zarezerwuj.html',
		authenticated: true,
		controller: 'calCtrl',
		controllerAs: 'calendar',
		permission: ['user']

	})

	.when('/kalendarz',{
		templateUrl: '/app/views/pages/users/kalendarz.html',
		controller: 'calCtrl',
		controllerAs: 'calendar',
		authenticated: true,
		permission: ['user']

	})

	.when('/resetpassword',{
		templateUrl: '/app/views/pages/users/resetpassword.html',
		controller: 'passwdCtrl',
		controllerAs: 'passwd'

	})
	
	.otherwise({ redirectTo: '/'});

	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
});

app.run(['$rootScope', 'Auth', '$location', function($rootScope, Auth, $location){

	$rootScope.$on('$routeChangeStart', function(event, next, current){
	
	if(next.$$route !== undefined){

		if(next.$$route.authenticated == true){
			if(!Auth.isLoggedIn()){
				event.preventDefault();
				$location.path('/');
			}else if (next.$$route.permission){

				Auth.getPermission().then(function(data){
					if (next.$$route.permission[0] !== data.data.permission){
						if (next.$$route.permission[1] !== data.data.permission){
							if (next.$$route.permission[2] !== data.data.permission){
								event.preventDefault();
								$location.path('/');
							}
						}
					}
				});

			}
		}else if (next.$$route.authenticated == false){
			if(Auth.isLoggedIn()){
				event.preventDefault();
				$location.path('/');
			}
		}
	}
	});
}]);

