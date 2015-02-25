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
	global.lastroom = $scope.currentRoom;
	console.log("lastroom: " + global.lastroom);
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


	$scope.sendPrivateMessage = function (user) {
		console.log("sendprivate i room");
		console.log("sendprivto user " + user);
		global.sendprivto = user;
		$location.path('/privatemsg/' + $scope.currentUser);
	};


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
			$scope.msgHistory = message;
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

	$scope.kickass = function (user) {
		$scope.kickuser = user;
		console.log($scope.currentUser);
		console.log("kick: " + $scope.pers);
		console.log($scope.currentUsers);
		console.log("room: " + $scope.currentRoom);
		console.log("kick: " + $scope.pers);
		$scope.errorMessage = '';
		if($scope.kickuser == $scope.currentUser) {
			$scope.errorMessage = "You can't kick yourself out";
		}
		else {
			$scope.waskicked = $scope.kickuser
			kickMe = {
				user: $scope.kickuser,
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
		$scope.wasopped = uzer;
		showKicked();
	});	


	$scope.banish = function (buser) {
		$scope.banuser = buser;
		console.log("ban: " + $scope.pers);
		$scope.errorMessage = '';

		if($scope.banuser == $scope.currentUser) {
			$scope.errorMessage = "You can't ban yourself";
		}
		else {
			$scope.wasbanned = $scope.banuser;
			banMe = {
				user: $scope.banuser,
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
		$scope.wasopped = uzer;
		showBanned();
	});

	$scope.optimus = function (ouser) {
		$scope.opuser = ouser;
		console.log("OPTIMUS");
		console.log("opt: " + $scope.pers);
		$scope.errorMessage = '';
		if($scope.opuser == $scope.currentUser || ($scope.currentOps[$scope.opuser] != undefined)) {
			$scope.errorMessage = "This user has already been opped";
		}
		else {
			$scope.wasopped = $scope.opuser;
			opMe = {
				user: $scope.opuser,
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
		$scope.wasopped = uzer;
		showAlert();
		$scope.currentOps = uzer;
	});


	$scope.leave = function() {		
		socket.emit('partroom', $scope.currentRoom);	
		$location.path('/rooms/' + $scope.currentUser + '/');		
	};
	
	
	 
});