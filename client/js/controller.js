(function(){

  'use strict';

  angular
    .module('Replication')
    .controller('MainCtrl', function($scope,$http,Replication){
      $scope.now = moment();
      $scope.damageMonth = moment().format('MMMM');
      $scope.months = moment.months();
      $scope.damageDate = moment().format('DD');
      $scope.dates = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
      $scope.damageYear = moment().format('YYYY');
      $scope.type = ['Main','Service','Pipeline'];
      $scope.size = ['.50"','.75"','1"','1.25"','1.5"','1.75"','2"','3"','4"','6"','8"','12"','16"','18"','24"','36"'];
      $scope.material = ["Poly","Steel","Mill Wrap","Cast Iron","Coated Steel"];
      $scope.equipment = ["Shure-Lock","Vivax","Pipe Horn","Gas Tracker","Jameson Tool"];
      $scope.reason = ["Facility Issue","Technician Error"];

      $scope.replication = {
        damage: {
          month: null,
          date: null
        },
        address: null,
        town: null,
        facility: {
          type: null,
          size:null,
          material:null,
          condition: null
        },
        print:null,
        damagereport:null,
        technician: null,
        teamleader: null,
        dps:null,
        equipment: null,
        connection: null,
        connectionComments: null,
        consistency: null,
        currentReadingOne:null,
        currentReadingTwo:null,
        currentReadingThree:null,
        determination: null,
        determinationComment: null
      };

      $scope.sendEmail = function(
        dmg_month,
        dmg_date,
        address,
        town,
        facility_type,
        facility_size,
        facility_material,
        print,
        heath_report,
        technician_name,
        teamleader_name,
        dps_name,
        locate_equipment,
        condition,
        connection,
        connection_comments,
        consistency,
        reading_one,
        reading_two,
        reading_three,
        determination,
        determination_comments
      ){
        console.log('in method');
        var msg = {
          dmg_month: dmg_month,
          dmg_date: dmg_date,
          address: address,
          town: town,
          facility_type: facility_type,
          facility_size: facility_size,
          facility_material: facility_material,
          print: print,
          heath_report: heath_report,
          technician_name: technician_name,
          teamleader_name: teamleader_name,
          dps_name: dps_name,
          locate_equipment: locate_equipment,
          condition: condition,
          connection: connection,
          connection_comments: connection_comments,
          consistency: consistency,
          reading_one: reading_one,
          reading_two: reading_two,
          reading_three: reading_three,
          determination: determination,
          determination_comments: determination_comments
        };
        Replication.create({
          damage_month:dmg_month,
          damage_date: dmg_date,
          location: address,
          town: town,
          facility_type: facility_type,
          facility_size: facility_size,
          facility_material: facility_material,
          print: print,
          heath_report: heath_report,
          technician_name: technician_name,
          teamleader_name: teamleader_name,
          dps_name: dps_name,
          locate_equipment: locate_equipment,
          currently_locatable: condition,
          proper_connection: connection,
          connection_comments: connection_comments,
          consistent_readings: consistency,
          current_reading1: reading_one,
          current_reading2: reading_two,
          current_reading3: reading_three,
          determination: determination,
          determination_comments: determination_comments
        })
          .$promise
          .then(function(replication){
            console.log(replication);

            msg = replication;
            $http.post('api/Replications/send',msg)
          });
        //$http.post('api/Replications/send',{msg:msg})
      };
      $scope.test = function (
        dmg_month,
        dmg_date,
        address,
        town,
        facility_type,
        facility_size,
        facility_material,
        print,
        heath_report,
        technician_name,
        teamleader_name,
        dps_name,
        locate_equipment,
        condition,
        connection,
        connection_comments,
        consistency,
        reading_one,
        reading_two,
        reading_three,
        determination,
        determination_comments
      ){

        console.log("testing 123");
        Replication.create({
          damage_month:dmg_month,
          damage_date: dmg_date,
          location: address,
          town: town,
          facility_type: facility_type,
          facility_size: facility_size,
          facility_material: facility_material,
          print: print,
          heath_report: heath_report,
          technician_name: technician_name,
          teamleader_name: teamleader_name,
          dps_name: dps_name,
          locate_equipment: locate_equipment,
          currently_locatable: condition,
          proper_connection: connection,
          connection_comments: connection_comments,
          consistent_readings: consistency,
          current_reading1: reading_one,
          current_reading2: reading_two,
          current_reading3: reading_three,
          determination: determination,
          determination_comments: determination_comments
        })
          .$promise
          .then(function(replication){
            var msg = replication;
            $http({
              method: 'POST',
              url: 'api/Replications/send',
              data: msg

            })

          })

      };

      //code
    })
})();
