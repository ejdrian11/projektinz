angular.module('schedulerApp', [ ])

.directive('dhxScheduler', function() {
  return {
    restrict: 'A',
    scope: false,
    transclude: true,
    template:'<div class="dhx_cal_navline" ng-transclude></div><div class="dhx_cal_header"></div><div class="dhx_cal_data"></div>',

    link:function ($scope, $element, $attrs, $controller){
      //adjust size of a scheduler
      $scope.$watch(function() {
        return $element[0].offsetWidth + "." + $element[0].offsetHeight;
      }, function() {
        scheduler.setCurrentView();
      });

      //styling for dhtmlx scheduler
      $element.addClass("dhx_cal_container");

      //init scheduler
      scheduler.templates.xml_date = function(value){ return new Date(value); };
        scheduler.load("/api/kalendarz", "json");
        scheduler.config.xml_date="%Y-%m-%d %H:%i";
    scheduler.config.readonly = true;

scheduler.ignore_month = function(date){
      if (date.getDay() == 6 || date.getDay() == 0)
        return true;
    };
    
    scheduler.ignore_week = function(date){
      
      if (date.getDay() == 6 || date.getDay() == 0) //hides Saturdays and Sundays
      return true;
    };
    
    scheduler.ignore_day = function(date){
      if (date.getDay() == 6 || date.getDay() == 0) //hides Saturdays and Sundays
      return true;
    };
    scheduler.config.first_hour = 8;
    scheduler.config.last_hour = 16;


    
      scheduler.init($element[0], new Date(), "month");
    }
  }
});


