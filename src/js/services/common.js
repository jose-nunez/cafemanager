/**************************************
CAFE MANAGER
Common Services
*****************************************/
'use strict';

angular.module('cafeManagerApp').factory('Config',['$q','$http',function($q,$http){

	var SERVER_ADDR = 'http://localhost:3165/';
	// var SERVER_ADDR = 'http://cafemanager.josenunez.org/cmserver/';
	var CLIENT_PATH_LOCAL = 'app/';

	var update_config = function(loaded_config){
		var default_config = {	
			SERVER_ADDR: SERVER_ADDR,
			CLIENT_PATH_LOCAL: CLIENT_PATH_LOCAL,

			// REWRITABLE___________
			debug:true,
			server:false,
			'no-select-text':true,
			
			"responsive-grid-columns":true,
			"grid-columns-small":3,
			"grid-columns-medium":4,
			"grid-columns-large":6,
			"grid-columns-xlarge":7,
			"grid-columns-xxlarge":8,
			
			"products-per-page":20,
			"paginate-filters":false,
			"exclusive-filters":true, //true: cat y alfa borran query | false: cat y alfa conservan query. Siempre Query borra cat y alfa
			"refresh-selection":true,
			"show-more-than-two-images":false,
		};
		for(var i in loaded_config){
			default_config[i] = loaded_config[i];
		}
		return default_config;
	}

	var deferred = $q.defer();
	
	
	$http.get(SERVER_ADDR+'config').then(
		function(response){
			var config = update_config(response.data);
			
			deferred.resolve(config);
		},
		function(err){
			// deferred.reject(err);
			console.log('Error leyendo la configuracion',err);
		}
	);
	
	return deferred.promise;
}]);



angular.module('cafeManagerApp').factory('DataLoader',['ErrorHandler','Config',function(ErrorHandler,Config){
	
	var DataLoader = {
		controllers: [],
		lastUpdated: undefined,
		connected_once:false,
		registerCotroller: function(fn){
			if(this.controllers.indexOf(fn)==-1) this.controllers.push(fn);
		},
		get: function(element,reset){
			this.socket.emit('get',{type:element,date: reset? undefined : this.lastUpdated});
		},
		update: function(type,obj){// product|pack|price|category
			if(obj.getData) obj = obj.getData();
			this.socket.emit('update',{type:type,obj:obj});
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
	

	Config.then(function(config){
		
		DataLoader.socket = io(config.SERVER_ADDR);

		DataLoader.socket.on('datasent', function(data){
			log('Datos recibidos del servidor',data);
			DataLoader.lastUpdated = data.date;
			for(var fn in DataLoader.controllers){
				DataLoader.controllers[fn](data);
			}
		});

		DataLoader.socket.on('update_error',ErrorHandler.handle);

		DataLoader.socket.on('connect',function(){
			log('Conectado al servidor');
			// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			// ESTO DEBE HACERSE DESPUES DE HABER REGISTRADO TODOS LOS CONTROLADORES QUE RECIBEN DATOS
			DataLoader.get('all');
			// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		});

		DataLoader.socket.on('connect_error',function(){
			log('Cliente socket: connect_error');
		});
		DataLoader.socket.on('connect_timeout',function(){
			log('Cliente socket: connect_timeout');
		});
		DataLoader.socket.on('reconnect',function(){
			log('Cliente socket: reconnect');
		});
		DataLoader.socket.on('reconnect_attempt',function(){
			log('Cliente socket: reconnect_attempt');
		});
		DataLoader.socket.on('reconnecting',function(){
			log('Cliente socket: reconnecting');
		});
		DataLoader.socket.on('reconnect_error',function(){
			log('Cliente socket: reconnect_error');
		});
		DataLoader.socket.on('reconnect_failed',function(){
			log('Cliente socket: reconnect_failed');
		});

	});
	return DataLoader;
}]);

angular.module('cafeManagerApp').factory('ErrorHandler',[function(){
	return {
		handle:  function(err){
			log('Error en '+err.type,err.err);
		},
	}

}]);


angular.module('cafeManagerApp').factory('FrameSystem',[function(){
	
	var framesUrl = {
		topFrame: 		'views/layout/top_frame.tpl.html',
		productsFrame: 	'views/products/products_frame.tpl.html',
		productSelect: 	'views/products/product_select.tpl.html',
		productForm: 	'views/products/product_form.tpl.html',
		filters:  		'views/products/categories_tree.tpl.html',
		tableCount: 	'views/tables/table_count.tpl.html',
		tablesMap: 		'views/tables/table_select.tpl.html',
		openedTables: 	'views/tables/table_select.tpl.html', //°°°°°°°°°°°°°°°°°°°°°°°°°°°
		
	}
	var FrameSets = {};
	var FrameSetsMap = {};
	
	// var registerFrameSets = function(ctrl,frameSets,scope){
	var registerFrameSets = function(ctrl,frameSets){
		for(var i in frameSets){
			FrameSetsMap[i] = ctrl;
		}

		FrameSets[ctrl] = frameSets;
		// FrameSets[ctrl].scope = scope;
		// Inicializa el actual frameset con cualquier frameset que no herede de otro
		for(var i in frameSets){if(!frameSets[i].extends){ 
			FrameSets[ctrl].actual = angular.copy(frameSets[i].default);
			FrameSets[ctrl].actual.name = i;
			FrameSets[ctrl].actual.variation = 'default';
		break; }}
		return FrameSets[ctrl].actual;
	}

	var resolveVariation = function(frameSetName,variationName){
		var ctrl = FrameSetsMap[frameSetName];
		if(!variationName) variationName = 'default';
		if(variationName=='default' && !FrameSets[ctrl][frameSetName].extends){
			return FrameSets[ctrl][frameSetName][variationName];
		}
		else if(variationName=='default' && FrameSets[ctrl][frameSetName].extends){
			return angular.merge({},resolveVariation(FrameSets[ctrl][frameSetName].extends,'default'),FrameSets[ctrl][frameSetName].default);
		}
		else {
			if(FrameSets[ctrl][frameSetName][variationName] || FrameSets[ctrl][frameSetName][variationName] == false) return FrameSets[ctrl][frameSetName][variationName];
			else if(FrameSets[ctrl][frameSetName].extends) return resolveVariation(FrameSets[ctrl][frameSetName].extends,variationName);
		}
	}
	var setFrameSet = function(frameSetName,variationName,onoff,options){
		var ctrl = FrameSetsMap[frameSetName];
		if(!ctrl) return;
		var variation = resolveVariation(frameSetName,variationName);
		if(!variation) return;
		FrameSets[ctrl].actual.name = frameSetName;
		FrameSets[ctrl].actual.variation = (!variationName || !onoff)? 'default':variationName;
		setVariation(ctrl,variation,onoff?undefined:resolveVariation(frameSetName,'default'));
	}

	var isOnFrameSet = function(frameSetName,variationName){
		var ctrl = FrameSetsMap[frameSetName];
		if(!ctrl) return false;
		variationName = (!variationName || !onoff)? 'default':variationName;
		return FrameSets[ctrl].actual.name == frameSetName && FrameSets[ctrl].actual.variation == variationName;
	}

	var setVariation = function(ctrl,variation,_default){
		for(var i in variation){ if(i!='UIOptions'){// variation[i]: tamaño(small|medium|Large|etc) | frame(top|bottom|left|right|etc) |NO:UIOptions
			if(angular.isObject(variation[i])){
				if(!FrameSets[ctrl].actual[i] || !angular.isObject(FrameSets[ctrl].actual[i])) FrameSets[ctrl].actual[i] = {};
				for(var j in variation[i]){ // variation[tamaño][j]: frame(top|bottom|left|right|etc)
					if(_default && _default[i] && _default[i][j]){ 
						FrameSets[ctrl].actual[i][j] = _default[i][j];
					}
					else if(!_default){ 
						FrameSets[ctrl].actual[i][j] = variation[i][j];
					}
				}
			}
			else{
				if(_default && _default[i]){
				 	FrameSets[ctrl].actual[i] = _default[i];
				 }
				else if(!_default){ 
					FrameSets[ctrl].actual[i] = variation[i];
				}
			}
		}}

		// FrameSets[ctrl].scope.$apply();
		// 
	}

	/*
	var registerFrameSets = function(ctrl,frameSets,scope){
		if(!globalFrameSet[ctrl]){ 
			globalFrameSet[ctrl] = {};
			globalFrameSet[ctrl].scope = scope;
		}
		globalFrameSet[ctrl] = angular.copy(frameSets.default);
		for(var i in frameSets){
			globalFrameSet[ctrl][i] = frameSets[i];
			if(i!='default'){
				if(!globalFrameSetMap[i]) globalFrameSetMap[i] = [];
				globalFrameSetMap[i].push(ctrl);
			}
		}
		return globalFrameSet[ctrl];
	}


	var isFrameOn_aux = function(ctrl,frameSet){
		var newFrames;
		if(!frameSet) newFrames = globalFrameSet[ctrl].default;
		else newFrames = globalFrameSet[ctrl][frameSet];
		var isOn = true;
		for(var i in newFrames){
			if(angular.isObject(newFrames[i])) for(var j in newFrames[i]) isOn = isOn && frameSet[i][j] == newFrames[i][j];
			else  isOn = isOn && frameSet[i] == newFrames[i];
		}
		return isOn;
	}
	var setFrame_aux = function(ctrl,frameSet){
		if(!newFrames) newFrames = globalFrameSet[ctrl].default;
		for(var i in newFrames){
			if(angular.isObject(newFrames[i])) for(var j in newFrames[i]) frameSet[i][j] = newFrames[i][j];
			else frameSet[i] = newFrames[i];
		}
		frameSet.scope.$apply();
	}

	var isFrameOn = function(frameSet){
		if(!globalFrameSetMap[frameSet]) return;
		var ctrls = globalFrameSetMap[frameSet];
		var isOn = true;
		for(var i in ctrls){
			isOn = isOn && isFrameOn_aux(globalFrameSet[ctrls[i]],globalFrameSet[ctrls[i]][frameSet]);
		}
		return isOn;
	}
	var switchFrame = function(frameSet){
	}
	var setFrame = function(frameSet,onoff){
		if(!globalFrameSetMap[frameSet]) return;
		var ctrls = globalFrameSetMap[frameSet];
		var newFrames;
		for(var i in ctrls){
			if(onoff) setFrame_aux(globalFrameSet[ctrls[i]],globalFrameSet[ctrls[i]][frameSet]);
			else setFrame_aux(globalFrameSet[ctrls[i]]);
		}
		return isOn;
	}*/


	var service = {
		framesUrl: framesUrl,
		registerFrameSets:registerFrameSets,
		resolveVariation:resolveVariation,
		setFrameSet:setFrameSet,
		setVariation:setVariation,
		isOnFrameSet:isOnFrameSet,
		// TEMPORALES
		FrameSets:FrameSets,
		FrameSetsMap:FrameSetsMap,
	}

	service.registerFrameSetting = function(fnName,frameSet,onoffswitch){
		this[fnName] = function(){

		}
	}

	return service;

}]);