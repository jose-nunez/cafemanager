/**************************************
Definiciones de clases y herencia
*****************************************/
(function(){'use strict';}());


angular.module('cafeManagerApp').factory('ClassDefinitions',[function(){
	// COSNTRUCTOR
	/*
	permite herencias sucesivas y llamados a metodos padres
	*/
	function extendPrototype(childPrototype,parentPrototype){
		for(var k in childPrototype){ childPrototype[k] = {value:childPrototype[k],enumerable: true,configurable: true,writable: true}; }
		return Object.create(parentPrototype,childPrototype);
	}

	function createPrototype(constructor,newPrototype,parentClass){
		if(!parentClass) constructor.prototype = newPrototype;
		else constructor.prototype = extendPrototype(newPrototype,parentClass.prototype);
		constructor.prototype.constructor = constructor;
	}

	function clone(obj,flat){
		var clon = flat? {} : Object.create(obj);
		for (var attr in obj){
			if(!flat || !(obj[attr] instanceof Function))
				clon[attr] = obj[attr];
		}
		return clon;
	}


	/* GRAL CLASSES *********************/

	var Collectionable = function(data){
			for(var key in data){
				this[key] = data[key];
			}
		};
	createPrototype(Collectionable,
		{
			preNormalize: function(){
				// NADA POR ACA
			},
			normalize: function(map){
				var isMulti = map.source_collection instanceof MultiCollection;
				if(!map.source_collection)
					this.normalize_data_unit(map.sources_names,map.dest_class,map.dest_name);
				else if(typeof map.sources_names == 'string')
					this.normalize_unit(map.sources_names,map.source_collection,map.dest_name,map.type,map.dest_class);
				else
					this.normalize_unit_multi(map.sources_names,map.source_collection,map.dest_name,map.dest_class);
			},
			normalize_data_unit: function(source_name,dest_class,dest_name){
				var new_collection;
				if(!dest_name) dest_name = source_name;
				new_collection = dest_class? new dest_class() : new Collection();
				new_collection.addElements(this[source_name]);
				this[dest_name] = new_collection;
				if(dest_name!=source_name) delete(this[source_name]);
			},
			normalize_unit: function(source_name,source_collection,dest_name,type,dest_class){
				var new_collection;
				if(!dest_name) dest_name = source_name;
				new_collection = dest_class? new dest_class() : new Collection(); 
				new_collection.linkElements(this[source_name],source_collection,type);
				this[dest_name] = new_collection;
				if(dest_name!=source_name) delete(this[source_name]);
			},
			normalize_unit_multi: function(sources_names,source_collection,dest_name,dest_class){
				var new_collection,source_ids;
				new_collection = dest_class? new dest_class() : new MultiCollection({__elemClass__:source_collection.__elemClass__});

				for (var type in sources_names){
					source_ids = sources_names[type];
					new_collection.linkElements(this[source_ids],source_collection,type);
					delete(this[source_ids]);
				}
				this[dest_name] = new_collection;
			},
			reLinkReferenced: function(mytype,referenced){
				if(typeof referenced == 'string') referenced = [referenced];
				var referenced_i;
				for(var i in referenced){
					referenced_i = this[referenced[i]];
					
					if(referenced_i instanceof Collection) 
					for(var j in referenced_i.collection){
						if(referenced_i.collection[j].reLink) referenced_i.collection[j].reLink(mytype,this);
					}
					else if(referenced_i.relink) referenced_i.reLink(mytype,this);
				}
			},
			reLink: function(dest,newObj){
				if(this.dest instanceof Collection){
					this.dest.addElement(newObj);
				}
				else if(this.dest) this.dest = newObj;
			},
		}
	);

	var Collection = function(data){
			var JSON_data;
			this.collection = [];
			this.index = {};

			if(data){
				JSON_data = data.elements;
				delete data.elements;
				for(var key in data){
					this[key] = data[key];
				}
				if(JSON_data) this.addElements(JSON_data);
			}
		};
	createPrototype(Collection,
		{
			__elemClass__: Collectionable,
			addElements: function(JSON_data){
				var replaced = [];
				if(JSON_data){
					var data;
					if(typeof JSON_data=="string") data = JSON.parse(JSON_data);
					else data = JSON_data;
					var element_replaces;
					for(var i in data){
						element_replaces = this.addElement(data[i]);
						if(element_replaces instanceof this.__elemClass__) replaced.push(element_replaces);
					}
				}
				return replaced;
			},
			// Returns the new object if it has replaced a previous one
			addElement: function(data){
				var element,pos;
				if(data instanceof this.__elemClass__) element = data;
				else{ 
					element = new this.__elemClass__(data);
					// element.collector = this;
				}

				if(this.index[element.id]!=undefined){ //OJO CON LA POSICIÓN CERO!!!!
					pos = this.index[element.id];
					this.collection[pos] = element;
					return element;
				}
				else{
					pos = this.collection.push(element) - 1;
					this.index[element.id] = pos;
				}
			},
			linkElements: function(ids,source,source_type){
				if(source_type){ for(var i in ids){
					this.addElement(source.get(source_type,ids[i].id));
				}}
				else{ for(var i in ids){
					this.addElement(source.get(ids[i].id));
				}}
			},
			reLinkReferenced: function(ids){
				for(var i in ids){
					this.get(ids[i]).reLinkReferenced();
				}
			},
			getAll: function(){
				return this.collection;
			},
			get: function(ids){
				if(!ids) return undefined;
				else if(!(ids instanceof Array)){
					return this.index[ids]!=undefined? this.collection[this.index[ids]] : undefined;	
				}
				else{
					var result = [];
					for(var i in ids){
						if(this.index[ids[i]]!=undefined) result.push(this.collection[this.index[ids[i]]]);
					}
					return result;
				}
			},
			getByPos: function(pos){
				return this.collection[pos];
			},
			getIds: function(){
				var result = [];
				for(var id in this.index){
					result.push({id:id});
				}
				return result;
			},
			normalize: function(sources,ids){
				var collection = ids? ids : this.collection;
				var elem;
				for (var i in collection) {
					elem = this.get(collection[i].id);
					if(elem.preNormalize) elem.preNormalize(sources);
				}
			},
			unNormalize: function(){
				var arr = [];
				for (var id in this.index) {
					arr.push(this.collection[this.index[id]].unNormalize());
				}
				return arr;
			},
			count:function(){
				if(this.collection) return this.collection.length;
			},
		}
	);

	//PARA IDs COMPUESTOS!!!!!!!!!
	var MultiIdCollection = function(data){
			Collection.call(this,arguments);
		};
	createPrototype(MultiIdCollection,	
		{
			__elemClass__: Collectionable,
			getId: function(ids){
				var result='';
				for (var i=0;i<ids.length-1;i++) {
					result += ids[i]+'|';
				};
				result += ids[i];
				return result;
			},
			get: function(ids){
				if(!ids) return undefined;
				else if(!(ids instanceof Array)){
					return this.index[ids]!=undefined? this.collection[this.index[this.getId(ids)]] : undefined;	
				}
				else{
					var result = [];
					for(var i in ids){
						if(this.index[ids[i]]!=undefined) result.push(this.collection[this.index[this.getId(ids[i])]]);
					}
					return result;
				}
			},
		},
	Collection);


	var MultiCollection = function(data){
			var JSON_data;
			this.collection = [];
			this.index = {};
			if(data){
				JSON_data = data.elements;
				delete data.elements;
				for(var key in data){
					this[key] = data[key];
				}
			}
			
			for(var type in this.__elemClass__){
				this.index[type] = {};
			}
			if(JSON_data) this.addElements(JSON_data);
		};
	createPrototype(MultiCollection,
		{
			__elemClass__: {elem: Collectionable},
			addElements: function(type,JSON_data){
				var replaced = [];
				if(JSON_data){
					var data;
					if(typeof JSON_data=="string") data = JSON.parse(JSON_data);
					else data = JSON_data;
					var element_replaces;
					for(var i in data){
						element_replaces = this.addElement(type,data[i]);
						if(element_replaces instanceof this.__elemClass__[type]) replaced.push(element_replaces);
					}
				}
				return replaced;
			},
			addElement: function(type,data){
				var type = type || data.type;
				var element,pos;

				if(data instanceof this.__elemClass__[type]) element = data;
				else{
					element = new this.__elemClass__[type](data);
					// element.collector = this;
					element.type = type;
				}

				if(this.index[element.type][element.id]!=undefined){ //OJO CON LA POSICIÓN CERO!!!!
					pos = this.index[element.type][element.id];
					this.collection[pos] = element;
					return element;
				}
				else{
					pos = this.collection.push(element) - 1;
					this.index[element.type][element.id] = pos;
				}
			},
			linkElements: function(ids,source,type,source_type){
				if(source_type || source instanceof MultiCollection){
					if(!source_type) source_type = type;
					for(var i in ids){
						this.addElement(type,source.get(source_type,ids[i].id));
					}
				}
				else{
					for(var i in ids){
						this.addElement(type,source.get(ids[i].id));
					}
				}
			},
			reLinkReferenced: function(type,ids){
				for(var i in ids){
					this.get(type,ids[i]).reLinkReferenced();
				}
			},
			getAll: function(type){
				// if(!type) return Collection.prototype.getAll.call(this);
				if(!type) return this.collection;

				var result = [];
				for(var id in this.index[type]){
					result.push(this.collection[this.index[type][id]]);
				}
				return result;
			},
			count: function(type){
				// if(!type) return Collection.prototype.getAll.call(this).length;
				if(!type) return this.collection.length;
				else return Object.keys(this.index[type]).length;
			},
			get: function(type,ids){
				if(!ids) return undefined;
				else if(!(ids instanceof Array)){
					return this.index[type][ids]!=undefined? this.collection[this.index[type][ids]] : undefined;
				}
				else{
					var result = [];
					for(var i in ids){
						if(this.index[type][ids[i]]!=undefined) result.push(this.collection[this.index[type][ids[i]]]);
					}
					return result;
				}
			},
			getByPos: function(pos){
				return this.collection[pos];
			},
			getIds: function(type){
				var result = [];
				for(var id in this.index[type]){
					result.push({id:id});
				}
				return result;
			},
			normalize: function(sources,type,ids){
				var collection = ids? ids : this.collection;
				var elem;
				for (var i in collection){
					elem = this.get(type,collection[i].id);
					if(elem.preNormalize) elem.preNormalize(sources);
				}
			},
			unNormalize: function(type){
				var arr = [];
				for (var id in this.index[type]){
					arr.push(this.collection[this.index[type][id]].unNormalize());
				}
				return arr;
			},
		},
	Collection);


	/* SERIALIZER *********************/
	// PARA JSONEAR
	/*var serializer = function(key,value){
		if(value && value.unNormalize){
			return value.unNormalize();
		}
		else return value;
	}

	function randomNumber(min,max){
		if(!min) min = 0;
		if(!max) max = 100;
		return Math.floor(Math.random()*(max-min+1)+min);
	}

	function genUID(){
		var UID;
		while((UID=Math.random().toString(36).substr(2,16)).length<16){
			//itera
			;
		}
		return UID;
	}*/

	return {
		createPrototype:createPrototype,
		clone: clone,
		Collectionable: Collectionable,
		Collection: Collection,
		MultiIdCollection: MultiIdCollection,
		MultiCollection: MultiCollection,
	};

}]);

