angular.module('mainController', ['authServices'])



.controller('mainCtrl', function($location, $timeout, Auth, AuthToken, $rootScope, $scope, $window) {
	var app = this;
	app.loadme = false;
	$rootScope.$on('$routeChangeStart', function(){

		if(Auth.isLoggedIn()){
			app.isLoggedIn = true;
			Auth.getUser().then(function(data){
			$scope.actemail = data.data.email;
			app.email = data.data.email;
			app.imie = data.data.imie;
			Auth.getPermission().then(function(data){
				if(data.data.permission === 'admin'){
					app.authorized = true;
					app.loadme = true;
					app.confirmeduser = true;
					app.isuser = false;
					}
				else if(data.data.permission === 'user'){
					app.confirmeduser = true;
					app.isuser = true;
				}else if(data.data.permission === 'instructor'){
					app.confirmeduser = true;
					app.isuser = false;
					app.instr = true;
				}else{
					app.confirmeduser = false;
				}
			})
			app.loadme = true;
			if(data.data.success==false){
				Auth.logout();
			}
		});
		}else{
			app.isLoggedIn = false;
			app.email = '';
			app.imie = '';

			app.loadme = true;
		}

});

	
	this.doLogin = function(loginData){
		app.loading = true;
		app.errorMsg = false;
		Auth.login(app.loginData).then(function(data){
			if(data.data.success){
				app.loading = false;
				app.successMsg = data.data.message + '...Przekierowywanie';
				$timeout(function(){
					$location.path('/');
					app.loginData = {};
					app.successMsg = false;
				}, 2000);
			}else{
				app.loading = false;
				app.errorMsg = data.data.message;
			}
		})

	};

	this.logout = function(){
		Auth.logout();
		$location.path('/logout');
		$timeout(function(){
			$location.path('/');
		}, 1000);
	};
});




