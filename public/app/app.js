angular.module('userApp', ['appRoutes', 'userControllers', 'ngAnimate', 'mainController', 'authServices', 'passwordController', 'profileController', 'managmentController', 'calendarController', 'toggleController'])

.config(function($httpProvider) {
	$httpProvider.interceptors.push('AuthInterceptors');
});
