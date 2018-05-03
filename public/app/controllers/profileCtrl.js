angular.module('profileController', ['mainController'])


.controller('showCtrl', function($scope, $routeParams, Auth, $timeout){
  $scope.daneTab = 'active';
  $scope.phase1 = true;
  $scope.phase2 = false;
  $scope.phase3 = false;

  $scope.danePhase = function(){
    $scope.daneTab = 'active';
    $scope.hasloTab = 'default';
    $scope.rezTab = 'default';
    $scope.phase1 = true;
    $scope.phase2 = false;
    $scope.phase3 = false;
  }

  $scope.hasloPhase = function(){
    $scope.daneTab = 'default';
    $scope.hasloTab = 'active';
    $scope.rezTab = 'default';
    $scope.phase1 = false;
    $scope.phase2 = true;
    $scope.phase3 = false;

  }
   $scope.rezPhase = function(){
    $scope.daneTab = 'default';
    $scope.hasloTab = 'default';
    $scope.rezTab = 'active';
    $scope.phase1 = false;
    $scope.phase2 = false;
    $scope.phase3 = true;
  }

})











.controller('profileCtrl', function($scope, $http, $window, $parse, $routeParams, $timeout, $location) {
  $http.get('/api/pokazuzytkownika').then(function (response) {
    $scope.email = response.data[0].email;
    $scope.imie = response.data[0].imie;
    $scope.nazwisko = response.data[0].nazwisko;
    $scope.telefon = response.data[0].telefon;
    $scope.password = response.data[0].password;
    });

$http.get('/api/getdane').then(function (response) {
      $scope.daneData = {newImie: response.data[0].imie, newNazwisko: response.data[0].nazwisko, newTelefon: response.data[0].telefon};
    });

$scope.submit2 = function(daneData, valid) {
  $scope.errorMsg = false;
    if(valid){
          $http.put('/api/changedane',this.daneData).then(function(data){
            if(data.data.success){
              $scope.errorMsg = false;
               $scope.successMsg = data.data.message;
              $timeout(function(){
                  location.reload();
              }, 2000);
             }else{
              $scope.errorMsg = data.data.message;
             }
          });
      };

    };


$http.get('/api/pokazrezerwacje').then(function(response2){
       $scope.rezerw = response2.data;
  });
    $http.get('/api/pokaz').then(function (response) {
       var najwieksza = 0;
       for (var i=0; i<response.data.length; i++){
          if(response.data[i].id_instructor>najwieksza){
            najwieksza=response.data[i].id_instructor;
          }
      }
      for (var j=1; j<=najwieksza; j++){
        $scope['tab'+j] = [];
        $scope['ile'+j] = 0;
      }
        // $scope['tab'+j][0]=0;
    for (var i=0; i<response.data.length; i++){
        for (var l=1; l<=najwieksza; l++){
          if(response.data[i].id_instructor == l){
            $scope['tab'+l][$scope['ile'+l]]=response.data[i];
            $scope['ile'+l]++;
            
          }
        }
    }
    for (var k=1; k<=najwieksza; k++){
       $scope['names'+k] = $scope['tab'+k];
    }


    });
  	$scope.ShowId = function(event)
	{
      var idev = event.target.parentNode.parentNode.childNodes[5].nextElementSibling.innerText;
   		$http.post('/api/usun',{idev: idev}).then(function(data){
   			if(data.data.success){
   			 	$window.location.reload();
   			}
   		});
	};
})

.controller('passwordCtrl', function($scope, $http, $window, $timeout, $location) {
 $scope.myVar = true;
  $scope.toggle = function() {
        $scope.myVar = !$scope.myVar;
    };
  $scope.submit = function(psswdData, valid) {
    $scope.errorMsg = false;
    if(valid){
          $http.post('/api/changepassword',this.psswdData).then(function(data){
            if(data.data.success){
              $scope.errorMsg = false;
               $scope.successMsg = data.data.message;
              $timeout(function(){
                  $location.path('/');
              }, 2000);
             }else{
              $scope.errorMsg = data.data.message;
             }
          });
      };
    };


});



