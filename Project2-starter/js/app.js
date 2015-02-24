var ChatClient = angular.module('ChatClient', ['ngRoute']);

var global = {
	iskicked: false,
	isBanned: false,
}

ChatClient.config(
	function ($routeProvider) {
		$routeProvider
			.when('/login', { templateUrl: 'Views/login.html', controller: 'LoginController' })
			.when('/rooms/:user/', { templateUrl: 'Views/rooms.html', controller: 'RoomsController' })
			.when('/room/:user/:room/', { templateUrl: 'Views/room.html', controller: 'RoomController' })
			.when('/rooms/:user/privatemsg/', { templateUrl: 'Views/privatemsg.html', controller: 'RoomController' })
			.otherwise({
	  			redirectTo: '/login'
			});
	}
);

ChatClient.controller('LoginController', function ($scope, $location, $rootScope, $routeParams, socket) {
	
	$scope.errorMessage = '';
	$scope.nickname = '';

	$scope.login = function() {			
		if ($scope.nickname === '') {
			$scope.errorMessage = 'Please choose a nick-name before entering!';
		} else {
			socket.emit('adduser', $scope.nickname, function (available) {
				if (available) {
					$location.path('/rooms/' + $scope.nickname);
				} else {
					$scope.errorMessage = 'This nick-name is already taken!';
				}
			});			
		}
	};
});

ChatClient.controller('RoomsController', function ($scope, $location, $rootScope, $routeParams, socket) {
	// √ TODO: Query chat server for active rooms
$(document).ready (function(){
    $("#warning-alert").hide();
    $("#danger-alert").hide();
 });

function showKicked() {
    $("#warning-alert").alert();
    $("#warning-alert").fadeTo(2500, 500).slideUp(1000, function(){ });   
}
function showBanned() {
    $("#danger-alert").alert();
    $("#danger-alert").fadeTo(2500, 500).slideUp(1000, function(){});   
}

	$scope.currentUser = $routeParams.user;
	$scope.currentRoom = $routeParams.room;
	$scope.rooms = [];
	$scope.errorMessage = '';
	$scope.errorMessageBan = '';
	$scope.chatName = '';
	var topicobj = {};
	
	// Active roomlist
	socket.emit('rooms', function (){});
	socket.on('roomlist', function (rooms){
		$scope.rooms = rooms;
	});

	if(global.iskicked){
		console.log("kickedy rooms");
		showKicked();
		global.iskicked = false;
	}

	if(global.isBanned){
		showBanned();
		global.isBanned = false;
	}

	// Creating a new room
	$scope.newCRoom = function () {
		if ($scope.chatName === '') {
			$scope.errorMessage = 'Please choose a name for chat room before continuing!';
		} else {
			socket.emit('joinroom', { room: $scope.chatName }, function (success, reason) {
				if(!success){
					$scope.errorMessage = reason;
				} else {
					topicobj = {
						room: $scope.chatName,
						topic: $scope.chatName
					};
					socket.emit('settopic', topicobj, function (available) {});
		    		$location.path('/room/' + $scope.currentUser + '/' + $scope.chatName);
				}
	    	});	
		}

	};
});

ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
$(document).ready (function(){
    $("#success-alert").hide();
    $("#warning-alert").hide();
    $("#danger-alert").hide();
 });

function showAlert() {
    $("#success-alert").alert();
    $("#success-alert").fadeTo(2500, 500).slideUp(1000, function(){});   
}

function showKicked() {
    $("#warning-alert").alert();
    $("#warning-alert").fadeTo(2500, 500).slideUp(1000, function(){});   
}

function showBanned() {
    $("#danger-alert").alert();
    $("#danger-alert").fadeTo(2500, 500).slideUp(1000, function(){});   
}


	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentOps = [];
	$scope.currentUsers = [];
	$scope.currentBans = [];
	$scope.errorMessage = '';
	$scope.errorMessageBan = '';
	$scope.txtmsg = '';
	$scope.pers = '';
	$scope.wasopped = '';
	$scope.waskicked = '';
	$scope.wasbanned = '';

	var kickMe = {};
	var banMe = {};
	var opMe = {};
	var msgdata = {};
	var pers = $scope.pers;



	// Send message
	$scope.sendmessage = function () {
		if($scope.txtmsg === ''){
		}
		else {
			msgdata = {
				roomName: $scope.currentRoom,
				msg: $scope.txtmsg
			};
			socket.emit('sendmsg', msgdata, function(){});
			$scope.txtmsg = '';
			$("#chatbox").animate({ scrollTop: $(document).height() }, "slow");
  				return false;
		}
	}
	
	// Update chat after message sent
	socket.on('updatechat', function (room, message){
		if($scope.currentRoom == room) {
			$scope.msgHistory = message
		}
	});

	socket.on('updateusers', function (roomName, users, ops) {
		if(roomName == $scope.currentRoom){
			$scope.currentUsers = users;
			$scope.currentOps = ops;
		}
	});

	socket.emit('joinroom', {room: $scope.currentRoom}, function (success, reason) {
		if (!success)
		{
			$scope.errorMessageBan = reason;
		}
	});

	$scope.kickass = function () {
		console.log($scope.currentUser);
		console.log("kick: " + $scope.pers);
		console.log($scope.currentUsers);
		console.log("room: " + $scope.currentRoom);
		console.log("kick: " + $scope.pers);
		$scope.errorMessage = '';
		if($scope.pers === '' || ($scope.currentUsers[$scope.pers] == undefined)){
			$scope.errorMessage = "Dat aint a valid username foo'";
		} 
		else if($scope.pers == $scope.currentUser) {
			$scope.errorMessage = "Can't kick yo self out";
		}
		else {
			$scope.waskicked = $scope.pers;
			kickMe = {
				user: $scope.pers,
				room: $scope.currentRoom
			};
			socket.emit('kick', kickMe, function (success){
				if(!success){
					$scope.errorMessage = "Failed to kick user";
				}
			});
		}
		$scope.pers = '';
	};

	socket.on('kicked', function (room, uzer, uzername) {
		if(uzer === $scope.currentUser) {
			iskicked = true;
			$location.path('/rooms/' + $scope.currentUser + '/');
		}
		showKicked();
	});	


	$scope.banish = function () {
		console.log("ban: " + $scope.pers);
		$scope.errorMessage = '';

		if($scope.pers === '' || ($scope.currentUsers[$scope.pers] == undefined)){
			$scope.errorMessage = "Dat aint a valid username foo'";
		} 
		else if($scope.pers == $scope.currentUser) {
			$scope.errorMessage = "I aint gonna let u ban yo self!";
		}
		else {
			$scope.wasbanned = $scope.pers;
			banMe = {
				user: $scope.pers,
				room: $scope.currentRoom
			}

			socket.emit('ban', banMe, function (success) {
				if(!success){
					$scope.errorMessage = "Failed to ban user";
				}
			});
		}

		$scope.pers = '';
	}

	socket.on('banned', function (room, uzer, uzername) {
		if(uzer === $scope.currentUser) {
			global.isBanned = true;
			$location.path('/rooms/' + $scope.currentUser + '/');
		}
		showBanned();
	});

	$scope.optimus = function () {
		console.log("OPTIMUS");
		console.log("opt: " + $scope.pers);
		$scope.errorMessage = '';
		if($scope.pers === '' || ($scope.currentUsers[$scope.pers] == undefined)){
			$scope.errorMessage = "Dat aint a valid username foo'";
		} 
		else if($scope.pers == $scope.currentUser || ($scope.currentOps[$scope.pers] != undefined)) {
			$scope.errorMessage = "This user has already been opped";
		}
		else {
			$scope.wasopped = $scope.pers;
			opMe = {
				user: $scope.pers,
				room: $scope.currentRoom
			}
			socket.emit('op', opMe, function (success) {
				if(!success){
					$scope.errorMessage = "Failed to upgrade user to operator";
				}
			});
		}
		console.log($scope.wasopped);
		$scope.pers = '';
	}

	socket.on('opped', function (room, uzer, uzername) {
		showAlert();
		$scope.currentOps = uzer;
	});


	$scope.leave = function() {		
		socket.emit('partroom', $scope.currentRoom);	
		$location.path('/rooms/' + $scope.currentUser);		
	};
	
	
	 
});