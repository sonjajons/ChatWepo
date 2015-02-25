var ChatClient = angular.module('ChatClient', ['ngRoute']);

var global = {
	iskicked: false,
	isBanned: false,
	sendprivto: '',
	lastroom: ''
}

ChatClient.config(
	function ($routeProvider) {
		$routeProvider
			.when('/login', { templateUrl: 'Views/login.html', controller: 'LoginController' })
			.when('/rooms/:user/', { templateUrl: 'Views/rooms.html', controller: 'RoomsController' })
			.when('/room/:user/:room/', { templateUrl: 'Views/room.html', controller: 'RoomController' })
			.when('/privatemsg/:user/', { templateUrl: 'Views/privatemsg.html', controller: 'PrivateMsgController' })
			.otherwise({
	  			redirectTo: '/login'
			});
	}
);




