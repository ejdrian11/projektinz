angular.module('calendarController', [])

.controller("calCtrl", function($http, $location, $timeout, $scope, $window, dateFilter, $parse){
   var whichcal = $window.localStorage.getItem('whichcal');
           
$scope.kalen = function(id){
        $window.localStorage.setItem('whichcal', id);
} 

$scope.kal = whichcal;

 	var min = new Date();
	var max = new Date();
	max.setDate(max.getDate() + 30);
	$scope.min = min;
	$scope.max = max;
	
    $http.post('/api/instructor',{id_instructor: $scope.kal}).then(function(data){
            var newEle = angular.element("<h1 class='textcenter'>"+data.data.imie+" "+data.data.nazwisko+"<button type='button' class='btn btn-info btn-lg' data-toggle='modal' data-target='#myModal'> Zarezerwuj</button></h1></h1>");
            var target = document.getElementById('target');
            angular.element(target).append(newEle);
        });




    $scope.data = function(){
        if($scope.calendar.calData.date != null){
            for (var b=8; b<=15; b++){
                $scope['p'+b] = { isDisabled: false };
            }
            var dzien = $scope.calendar.calData.date.getDay();
            if (dzien == 0 || dzien == 6){
                for (var c=0; c<=15; c++){
                    $scope['p'+c] = { isDisabled: true };
                }
                $window.alert('W weekendy nie pracujemy :)');
            }
            $http.post('/api/post',{rok: $scope.calendar.calData.date, instruktor: $scope.kal}).then(function(data){
                for (var i=0; i<data.data.length; i++){
                    for (var j=parseInt(data.data[i].poczatek, 0); j<parseInt(data.data[i].koniec, 0); j++){
                        $scope['p'+j] = { isDisabled: true };
                    }
                }
            });
        }
    };


    $scope.poczatek = function(){
        for (var a=0; a<=7; a++){
            $scope['p'+a] = { isDisabled: true };
        }
        $http.post('/api/post',{rok: $scope.calendar.calData.date,instruktor: $scope.kal}).then(function(data){
        var flag = 0;
            for (var p=(parseInt($scope.calendar.calData.start, 0)+1); p<=(parseInt($scope.calendar.calData.start, 0)+3); p++){
                if (data.data.length == 0){
                    for (var t=(parseInt($scope.calendar.calData.start, 0)+1); t<=(parseInt($scope.calendar.calData.start, 0)+3); t++){
                        var t2=t-9;
                        $scope['p'+t2] = { isDisabled: false };
                    }
                }else{
                for (var r=0; r<data.data.length; r++){
                    var p2=p-9;
                    if (p==parseInt(data.data[r].poczatek,0)){
                        $scope['p'+p2] = { isDisabled: false };
                        flag = 1;
                        break;
                    }else{
                        $scope['p'+p2] = { isDisabled: false };
                    }
                    
                }
            }
                if (flag == 1) break;
            }
        });
    };

var app = this;

	this.calDate = function(calData){
        this.calData.instruktor = $scope.kal;
		app.loading = true;
		app.errorMsg = false;
		$http.post('/api/data',this.calData).then(function(data){
			if(data.data.success){
				app.loading = false;
				app.successMsg = data.data.message + '...Przekierowanie';
				$timeout(function(){
                    $window.location.reload();
				}, 2000);
			}else{
				app.loading = false;
				app.errorMsg = data.data.message;
			}
		})

	};
    
})


.directive('dhxScheduler', function($http) {
  return {
    restrict: 'A',
    scope: false,
    transclude: true,
    template:'<div class="dhx_cal_navline" ng-transclude></div><div class="dhx_cal_header"></div><div class="dhx_cal_data"></div>',

    link:function ($scope, $element, $attrs, $controller){
        scheduler.clearAll();
      $scope.$watch(function() {
        return $element[0].offsetWidth + "." + $element[0].offsetHeight;
      }, function() {
        scheduler.setCurrentView();
      });

      $element.addClass("dhx_cal_container");
    
    scheduler.attachEvent("onTemplatesReady", function(){
         scheduler.templates.event_bar_date = function(start, end, ev){
            return scheduler.templates.event_date(start) + " - " + scheduler.templates.event_date(end) + " ";
         };
      });

        $http.post('/api/idkalendarz', {id: $scope.kal}).then(function(data){
            scheduler.load('/api/kalendarz', "json");
        });

      scheduler.templates.xml_date = function(value){ return new Date(value); };

    
        scheduler.config.xml_date="%Y-%m-%d %H:%i";
    scheduler.config.readonly = true;

scheduler.ignore_month = function(date){
      if (date.getDay() == 6 || date.getDay() == 0)
        return true;
    };
    
    scheduler.ignore_week = function(date){
      
      if (date.getDay() == 6 || date.getDay() == 0)
      return true;
    };
    
    scheduler.ignore_day = function(date){
      if (date.getDay() == 6 || date.getDay() == 0)
      return true;
    };
    scheduler.config.first_hour = 8;
    scheduler.config.last_hour = 16;


    
      scheduler.init($element[0], new Date(), "month");
    }
  }
});