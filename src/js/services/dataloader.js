/**************************************
CAFE MANAGER
DataLoader
*****************************************/
(function(){'use strict';}());

angular.module('cafeManagerApp').factory('DataLoader',['$q','ErrorHandler','Config',function($q,ErrorHandler,Config){

	var creatingSocket = $q.defer();
	/*onRespusta: connecting.resolve(data);
	onError: connecting.reject(err);*/
	
	var DataLoader = {
		socket: undefined,
		// Each client as its own getTypes. No duplicated objects across the app.
		clients:{},
		suscribe: function(groupType,getTypes,callback){
			this.clients[groupType] = {getTypes:getTypes,callback:callback,lastUpdated:undefined};
			this.get(groupType);
			return true; // Nothing special
		},
		getGroupType: function(getType){
			if(this.clients[getType]!=undefined) return getType;
			else{
				for(var groupType in this.clients){
					if(this.clients[groupType].getTypes.indexOf(getType)!=-1) return groupType;
				}
			}
			return null;
		},
		get: function(getType,resetDate){
			log('Voy a pedir '+getType);
			// Socket enqueues requests while disconnected
			// Waits until it's created
			var self = this;
			creatingSocket.promise.then(function(){
				self.socket.emit('get',{type:getType,date: resetDate? undefined : self.clients[self.getGroupType(getType)].lastUpdated});
			});
		},
		getAll: function(resetDate){
			for(var groupType in this.clients){
				this.get(groupType,resetDate);
			}
		},
		update: function(getType,obj){
			if(obj.getData) obj = obj.getData();
			var self = this;
			creatingSocket.promise.then(function(){
				self.socket.emit('update',{type:getType,obj:obj});
			});
		},
		got: function(data){
			var reservedWords = ['date','count'];
			for(var getType in data){ 
				if(reservedWords.indexOf(getType)==-1) break;
			}
			this.clients[this.getGroupType(getType)].callback(data);
			this.clients[this.getGroupType(getType)].lastUpdated = data.date;
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
	
	var MrSocket = {
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
			DataLoader.getAll();
		},
		datasent:function(data){
			log('Datos recibidos del servidor',data);
			/*DataLoader.lastUpdated = data.date;
			loadingData.resolve(data);*/
			DataLoader.got(data);
		},
	};

	Config.then(function(config){
		DataLoader.socket = io(config.SERVER_ADDR);
		creatingSocket.resolve();
		DataLoader.socket.on('connect',MrSocket.connect);
		DataLoader.socket.on('connect_error',MrSocket.connect_error);
		DataLoader.socket.on('connect_timeout',MrSocket.connect_timeout);
		DataLoader.socket.on('reconnect',MrSocket.reconnect);
		DataLoader.socket.on('reconnect_attempt',MrSocket.reconnect_attempt);
		DataLoader.socket.on('reconnecting',MrSocket.reconnecting);
		DataLoader.socket.on('reconnect_error',MrSocket.reconnect_error);
		DataLoader.socket.on('reconnect_failed',MrSocket.reconnect_failed);
		DataLoader.socket.on('datasent',MrSocket.datasent);
		DataLoader.socket.on('disconnect',MrSocket.disconnect);
		
		DataLoader.socket.on('update_error',ErrorHandler.handle);
	});

	return DataLoader;
}]);