var ChatClient = angular.module('ChatClient', ['ngRoute']);

ChatClient.config(
	function ($routeProvider) {
		$routeProvider
			.when('/login', { templateUrl: 'Views/login.html', controller: 'LoginController' })
			.when('/rooms/:user/', { templateUrl: 'Views/rooms.html', controller: 'RoomsController' })
			.when('/room/:user/:room/', { templateUrl: 'Views/room.html', controller: 'RoomController' })
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
			$scope.errorMessage = 'Please choose a nick-name before continuing!';
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
	$scope.currentUser = $routeParams.user;
	$scope.currentRoom = $routeParams.room;
	$scope.rooms = [];
	$scope.errorMessage = '';
	$scope.chatName = '';
	
	// Active roomlist
	socket.emit('rooms', function (){});
	socket.on('roomlist', function (rooms){
		$scope.rooms = rooms;
	});

	// Creating a new room
	$scope.newCRoom = function () {
		if ($scope.chatName === '') {
			$scope.errorMessage = 'Please choose a chat room name before continuing!';
			console.log("ncromm if");
		} else {
			socket.emit('joinroom', { room: $scope.chatName }, function (success, reason) {
    			var topicobj = {
    				room: $scope.chatName,
    				topic: $scope.chatName
    			};
    			socket.emit('settopic', topicobj, function (available) {});
        		$location.path('/room/' + $scope.currentUser + '/' + $scope.chatName);
	    	});	
		}

	};
});

ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentOps = [];
	$scope.currentUsers = [];
	$scope.currentBans = [];
	$scope.errorMessage = '';
	$scope.txtmsg = '';
	$scope.pers = '';

	var kickMe = {};
	var banMe = {};
	var opMe = {};
	var msgdata = {};
	var pers = $scope.pers;



	// Send message
	$scope.sendmessage = function () {
		msgdata = {
			roomName: $scope.currentRoom,
			msg: $scope.txtmsg
		};
		socket.emit('sendmsg', msgdata, function(){});
		$scope.txtmsg = '';
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
			$scope.errorMessage = reason;
		}
	});

	$scope.kickass = function () {
		console.log($scope.currentUser);
		console.log("kick: " + $scope.pers);
		console.log($scope.currentUsers);
		console.log("room: " + $scope.currentRoom);
		console.log("kick: " + $scope.pers);
		kickMe = {
			user: $scope.pers,
			room: $scope.currentRoom
		};
		socket.emit('kick', kickMe, function (success){
			if(!success){
				console.log("Failed to kick " + $scope.pers);
			}
		});
		$scope.pers = '';
	};

	socket.on('kicked', function (room, uzer, uzername) {
		if(uzer === $scope.currentUser) {
			$location.path('/rooms/' + $scope.currentUser + '/');
		}
	});	


	$scope.banish = function () {
		console.log("ban: " + $scope.pers);
		banMe = {
			user: $scope.pers,
			room: $scope.currentRoom
		}

		socket.emit('ban', banMe, function (success) {
			if(!success){
				console.log("Failed to ban " + $scope.pers);
			}
			else {
				$scope.currentBans = $scope.pers;
				console.log("Great ban-success" + $scope.currentBans);
			}
		});
		$scope.pers = '';
	}

	socket.on('banned', function (room, uzer, uzername) {
		if(uzer === $scope.currentUser) {
			$location.path('/rooms/' + $scope.currentUser + '/');
		}
	});

	$scope.optimus = function () {
		console.log("OPTIMUS");
		console.log("opt: " + $scope.pers);
		opMe = {
			user: $scope.pers,
			room: $scope.currentRoom
		}
		socket.emit('op', opMe, function (success) {
			if(!success) {
				console.log("Failed to op " + $scope.pers);
			}
			else {
				console.log("Successful op " + $scope.pers);
			}
		});
		$scope.pers = '';
	}

	socket.on('opped', function (room, uzer, uzername) {
		console.log(uzer);
		//if(uzer === $scope.currentUser) {
			//console.log("OPPED");
			console.log($scope.currentOps);
			$scope.currentOps += uzer;
			//$location.path('/room/' + $scope.currentUser + '/' + $scope.chatName);
			console.log($scope.currentOps);
		//}
	});


	$scope.leave = function() {		
		socket.emit('partroom', $scope.currentRoom);	
		$location.path('/rooms/' + $scope.currentUser);		
	};
	
	
	 
});