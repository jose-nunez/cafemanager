/**************************************
CAFE MANAGER
DataSynchronizer
*****************************************/
(function(){'use strict';}());

angular.module('cafeManagerApp').factory('DataSynchronizer',['$q','ErrorHandler','Config','DataStorage',function($q,ErrorHandler,Config,dataStorage){


	/*
	Synchronizes data between client and server. 
	Supports created/edited dates, pagination/segmentation , client cache (storage), pushing updates/notifications, 
	loading status (future!)
	*/

	var creatingSocket = $q.defer();
	var the_socket;
	var clients = {};

	function getClientType(type_subType){
		if(clients[type_subType]!=undefined) return type_subType;
		else{
			for(var type in clients){
				if(clients[type].subTypes.indexOf(type_subType)!=-1) return type;
			}
		}
		return null;
	}
	
	var dataSynchronizer = {
		
		//Suscribes clients for pushing dat updates and notifications
		// Each client as its own type and subTypes. No duplicated objects across the app. Updating becomes a mess.
		suscribe: function(type,subTypes_callback,callback){

			var is_grouptype = typeof type ==="string" && subTypes_callback instanceof Array && callback instanceof Function;
			var is_singleType = typeof type ==="string" && subTypes_callback instanceof Function;
			
			if(is_grouptype){
				clients[type] = {subTypes:subTypes_callback,callback:callback,lastUpdated:undefined};
			}
			else if(is_singleType){
				clients[type] = {callback:subTypes_callback,lastUpdated:undefined};
			}
			
			this.get(type);
			return true; // Nothing special
		},
		get: function(type,resetDate){ //It can be groupType or getType
			log('Voy a pedir '+ type);
			// Socket enqueues requests while disconnected
			// Waits until it's created
			creatingSocket.promise.then(function(){
				the_socket.emit('get',{type:type,lastUpdated: resetDate? undefined : clients[getClientType(type)].lastUpdated});
			});
		},
		getAll: function(resetDate){
			for(var type in clients){
				this.get(type,resetDate);
			}
		},
		update: function(type,obj){
			creatingSocket.promise.then(function(){
				the_socket.emit('update',{type:type,obj:obj});
			});
		},
		/*update: function(type,obj){
			var self = this;
			
			var deferred = $q.defer();

			var options = {timeout:self.timeout,params:{type:type,obj:obj}};

			$http.get(Config.SERVER_ADDR+'update',options).then(function(response){
				log('Updated successfuly');
				log(response.data);
			});
			return deferred.promise;
		}*/
	};
	
	function resolveClientType(data){
		var reservedWords = ['lastUpdated','count'];
		for(var type in data){
			if(reservedWords.indexOf(type)==-1) break;
		}
		return getClientType(type);
	}

	function received(data){
		var type = resolveClientType(data);
		clients[type].callback(data);
		clients[type].lastUpdated = data.lastUpdated;
	}
	
	var socketConfig = {
		connect: function(){ log('Conectado al servidor'); },
		connect_error: function(){ log('Cliente socket: connect_error'); },
		connect_timeout: function(){ log('Cliente socket: connect_timeout'); },
		reconnect: function(){ log('Cliente socket: reconnect'); },
		reconnect_attempt: function(){ log('Cliente socket: reconnect_attempt'); },
		reconnecting: function(){ log('Cliente socket: reconnecting'); },
		reconnect_failed: function(){ log('Cliente socket: reconnect_failed'); },
		reconnect_error: function(){ log('Cliente socket: reconnect_error'); },
		
		disconnect: function(){ 
			log('Desconectado del servidor');
			// Ask for all the updates while disconnected
			dataSynchronizer.getAll();
		},
		datasent:function(data){
			log('Datos recibidos del servidor',data);
			received(data);
		},
	};

	Config.then(function(config){
		the_socket = io(config.SERVER_ADDR);
		creatingSocket.resolve();

		// Default events
		the_socket.on('connect',socketConfig.connect);
		the_socket.on('connect_error',socketConfig.connect_error);
		the_socket.on('connect_timeout',socketConfig.connect_timeout);
		the_socket.on('reconnect',socketConfig.reconnect);
		the_socket.on('reconnect_attempt',socketConfig.reconnect_attempt);
		the_socket.on('reconnecting',socketConfig.reconnecting);
		the_socket.on('reconnect_error',socketConfig.reconnect_error);
		the_socket.on('reconnect_failed',socketConfig.reconnect_failed);
		
		// Custom events
		the_socket.on('datasent',socketConfig.datasent);
		the_socket.on('disconnect',socketConfig.disconnect);
		the_socket.on('update_error',ErrorHandler.handle);
	});

	return dataSynchronizer;
}]);