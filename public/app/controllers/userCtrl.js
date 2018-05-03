angular.module('userControllers', [])

.controller('regCtrl', function($http, $location, $timeout){

	var app = this;

	this.regUser = function(regData, valid){
		app.loading = true;
		app.errorMsg = false;
		if(valid){
		$http.post('/api/users',this.regData).then(function(data){
			if(data.data.success){
				app.loading = false;
				app.successMsg = data.data.message + '...Przekierowywanie';
				$timeout(function(){
					$location.path('/');
				}, 2000);
			}else{
				app.loading = false;
				app.errorMsg = data.data.message;
			}
		});
		}else{
			app.loading = false;
			app.errorMsg = 'Upewnij się, że formularz jest poprawnie wypełniony';
		}

	};


	this.checkEmail = function(regData){
		app.checkingEmail = true;
		app.emailMsg = false;
		app.emailInvalid = false;

		$http.post('/api/checkemail',this.regData).then(function(data){
			if(data.data.success){
				app.checkingEmail = false;
				app.emailInvalid = false;
				app.emailMsg = data.data.message;
			}
			else{
				app.checkingEmail = false;
				app.emailInvalid = true;
				app.emailMsg = data.data.message;
			}
		});

	}




})

.directive('match', function(){
	return{
		restrict: 'A',
		controller: function($scope){
			$scope.confirmed = false;

			$scope.doConfirm = function(values){
				values.forEach(function(ele){
					if($scope.confirm == ele){
						$scope.confirmed = true;
					}else{
						$scope.confirmed = false;
					}
				});
			}
		},
	link: function(scope, element, attrs){
		attrs.$observe('match', function(){
			scope.matches = JSON.parse(attrs.match);
			scope.doConfirm(scope.matches);
		});
		scope.$watch('confirm', function(){
			scope.matches = JSON.parse(attrs.match);
			scope.doConfirm(scope.matches);
		});
	}
}
})