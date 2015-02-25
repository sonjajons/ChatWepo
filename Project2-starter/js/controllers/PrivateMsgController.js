ChatClient.controller('PrivateMsgController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentUser = $routeParams.user;
	$scope.privmsg = '';
	$scope.privHistory = [];
	$scope.sendto = global.sendprivto;

	$scope.sendpriv = function () {
		console.log($scope.privmsg);
		if($scope.privmsg === ''){
		}
		else {
			console.log("sendprivto: " + global.sendprivto);
			msgdata = {
				nick: $scope.sendto,
				message: $scope.privmsg
			};
			msgdata2 = {
				nick: $scope.currentUser,
				message: $scope.privmsg
			};
			socket.emit('privatemsg', msgdata, function (success){
				if(!success){
					console.log("FAIL PRIVATE");
				}
				else {
					console.log("----curr og user : " + $scope.currentUser + msgdata.nick);
					if($scope.currentUser != msgdata.nick){
						$scope.privHistory.push(msgdata2);
					}
					else {
						$scope.privHistory.push(msgdata);
					}
					console.log("GREAT PRIVATE SUCCESS");
				}
			});
			$scope.privmsg = '';
			$("#chatbox").animate({ scrollTop: $(document).height() }, "slow");
  				return false;
		}
	}

	socket.on('recv_privatemsg', function (user, message){
		console.log(user);
		privdata = {
			nick: user,
			message: message
		};
		console.dir(privdata);
		$scope.privHistory.push(privdata);
		//$scope.privHistory = msgdata;
	});
	console.log("last " + global.lastroom);

	$scope.leavePriv = function() {		
		$location.path('/rooms/'+ $scope.currentUser + '/');		
	};
});