angular.module('passwordController', [])

.controller('passwdCtrl',function($http, $timeout, $location){
var app = this;

	this.mailDate = function(mailData){
		app.loading = true;
		app.errorMsg = false;
		$http.post('/api/wyslij',this.mailData).then(function(data){
			if(data.data.success){
				app.loading = false;
				app.successMsg = data.data.message + '...Przekierowywanie';
				$timeout(function(){
						$location.path('/login');
					}, 2000);
			}else{
				app.loading = false;
				app.errorMsg = data.data.message;
			}
			
		})

	};
});

