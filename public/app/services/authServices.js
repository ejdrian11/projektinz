angular.module('authServices', [])

.factory('Auth', function($http, AuthToken){
	var authFactory = {};

	authFactory.login = function(loginData){
		return $http.post('/api/authenticate', loginData).then(function(data){
			AuthToken.setToken(data.data.token);
			return data;
		});
	};

	authFactory.isLoggedIn = function(){
		if(AuthToken.getToken()){
			return true;
		}else{
			return false;
		}
	};

	authFactory.getUser = function(){
		if(AuthToken.getToken()){
			return $http.post('/api/me');
		}else{
			$q.reject({ message: 'Użytkownik nie posiada tokena'});
		}
	};

	authFactory.logout = function(){
		AuthToken.setToken();
	};

	authFactory.getPermission = function(){
		return $http.get('/api/permission');
	};


	authFactory.getUsers = function(){
		return $http.get('/api/managment');
	};

	authFactory.getUserus = function(email){
		return $http.get('/api/edit/' +email);
	};

	authFactory.deleteUser = function(email){
		return $http.delete('/api/managment/' +email);
	};

	authFactory.editUser = function(email){
		return $http.put('/api/edit/', email);
	};



	return authFactory;
})

.factory('AuthToken', function($window){
	var authTokenFactory = {};

	authTokenFactory.setToken = function(token){
		if(token){
			$window.localStorage.setItem('token', token);
		}else{
			$window.localStorage.removeItem('token');
		}
	};

	authTokenFactory.getToken = function(){
		return $window.localStorage.getItem('token');
	};

	return authTokenFactory;
})

.factory('AuthInterceptors', function(AuthToken){
	var authInterceptorsFactory = {};

	authInterceptorsFactory.request = function(config){

		var token = AuthToken.getToken();

		if (token) config.headers['x-access-token'] = token;

		return config;
	};

	return authInterceptorsFactory;
});



