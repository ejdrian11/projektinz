angular.module('managmentController', [])

.controller('managmentCtrl', function(Auth, $scope){
	var app = this;

	app.loading = true;
	app.accessDenied = true;
	app.errorMsg = false;
	app.editAccess = false;
	app.deleteAccess = false;
	app.limit = undefined;
	function getUsers(){
		Auth.getUsers().then(function(data){
			if(data.data.success){
				if(data.data.permission === 'admin' || data.data.permission === 'moderator'){
					app.users = data.data.users;
					app.loading = false;
					app.accessDenied = false;
					if (data.data.permission === 'admin'){
						app.editAccess = true;
						app.deleteAccess = true;
					}else{
						app.editAccess = true;
					}
				}else{
					app.errorMsg = 'Brak uprawnień';
					app.loading = false;
				}

			}else{
				app.errorMsg = data.data.message;
			}
		});
	};

	getUsers();

	app.showMore = function(number){
		app.showMoreError = false;
		if(number>0){
			app.limit = number;
		}else{
			app.showMoreError = 'Wprowadź poprawną wartość'
		}

	};

	app.showAll = function(){
		app.limit = undefined;
		app.showMoreError = false;
		$scope.number = undefined;
	};

	app.deleteUser = function(email){
		Auth.deleteUser(email).then(function(data){
			if (data.data.success){
				getUsers();
			}else{
				app.showMoreError = data.data.message;
			}
		})
	};

})

.controller('editCtrl', function($scope, $routeParams, Auth, $timeout, $location){
	var app = this;
	$scope.daneTab = 'active';
	app.phase1 = true;
	Auth.getUserus($routeParams.id).then(function(data){
		if (data.data.success){
			$scope.newImie = data.data.user[0].imie;
			$scope.newEmail = data.data.user[0].email;
			$scope.newNazwisko = data.data.user[0].nazwisko;
			$scope.newPermission = data.data.user[0].permission;
			$scope.typkonta = data.data.typkonta;
			app.currentUser = data.data.user[0].id_user;
		}else{
			app.errorMsg = data.data.message;
		}
	});

	app.danePhase = function(){
		$scope.daneTab = 'active';
		$scope.permissionTab = 'default';
		app.phase1 = true;
		app.phase2 = false;
		app.errorMsg = false;
	}

	app.permissionPhase  = function(){
		$scope.daneTab = 'default';
		$scope.permissionTab = 'active';
		app.phase1 = false;
		app.phase2 = true;
		app.disabledUser = false;
		app.disableAdministrator = false;
		app.disabledAdmin = false;
		app.errorMsg = false;

		if ($scope.newPermission === 'user'){
			app.disabledUser = true;
		}else if ($scope.newPermission === 'moderator'){
			app.disableAdministrator = true;
		}else if ($scope.newPermission === 'instructor'){
			app.disabledInstructor = true;
		}
	}


	app.updateDane = function(newImie, newEmail, newNazwisko, valid) {
		app.errorMsg = false;
		app.disabled = true;
		var userObject = {};

		if (valid){
			userObject.id = app.currentUser;
			userObject.imie = $scope.newImie;
			userObject.nazwisko = $scope.newNazwisko;
			userObject.email = $scope.newEmail;

			Auth.editUser(userObject).then(function(data){
				if(data.data.success){
					app.successMsg = data.data.message;
					$timeout(function(){
						app.daneForm.imie.$setPristine();
						app.daneForm.imie.$setUntouched();
						app.successMsg = false;
						app.disabled = false;

					}, 2000);
				}else{
					app.errorMsg = data.data.message;
					app.disabled = false;
				}
			})

		}else{
			app.errorMsg = 'Upewnij się że poprawnie wypełniłeś formularz';
			app.disabled = false;
		}
	}


	app.updatePermissions = function(newPermission, valid) {
		app.errorMsg = false;
		app.disabledUser = true;
		app.disableAdministrator = true;
		app.disabledAdmin = true;
		var userObject = {};
		
			userObject.email = $scope.newEmail;
			userObject.permission = newPermission;
			Auth.editUser(userObject).then(function(data){
				if(data.data.success){
					app.successMsg = data.data.message;
					$timeout(function(){
						app.successMsg = false;

						if (newPermission === 'user'){
							$scope.newPermission = 'user';
							app.disabledUser = true;
							app.disabledInstructor = false;
							app.disableAdministrator = false;
						}else if (newPermission === 'instructor'){
							$scope.newPermission = 'instructor';
							app.disabledUser = false;
							app.disabledInstructor = true;
							app.disableAdministrator = false;
						}else if (newPermission === 'admin'){
							$scope.newPermission = 'admin';
							app.disabledUser = false;
							app.disabledInstructor = true;
							app.disableAdministrator = false;

						}
						$location.path('/managment');
					}, 2000);
				}else{
					app.errorMsg = data.data.message;
					app.disabled = false;
				}
			})

		
	}

});

