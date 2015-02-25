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
	$scope.lastroom = global.lastroom;

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