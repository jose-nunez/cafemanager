/**************************************
CAFE MANAGER
Product Data Models
*****************************************/
(function(){'use strict';}());

angular.module('cafeManagerApp').factory('ProductDataModels',['ClassDefinitions',function(CD){

	function extractIds(idsObjs){
		var arr = [];
		for(var i in idsObjs){
			arr.push(idsObjs[i].id);
		}
		return arr;
	}

	var createPrototype = CD.createPrototype;

	/* ModifierExtraSingle *********************/
	var ModifierExtraSingle = function(data){		
			CD.Collectionable.apply(this,arguments);
		};
	createPrototype(ModifierExtraSingle,
		{
			normalize: function(sources){
				this.single = sources.products.get('single',this.single_id);
				this.extra = sources.extras.get(this.extra_id);
				this.modifier = sources.modifiers.get(this.modifier_id);
				delete(this.single_id);
				delete(this.extra_id);
				delete(this.modifier_id);
			},
			unNormalize: function(){
				var my_clone = CD.clone(this,true);
				// delete(my_clone.collector);
				delete(my_clone.$$hashKey);
				
				if(my_clone.single) my_clone.single_id = this.single.id;
				if(my_clone.extra) my_clone.extra_id = this.extra.id;
				if(my_clone.modifier) my_clone.modifier_id = this.modifier.id;
				delete(my_clone.single);
				delete(my_clone.extra);
				delete(my_clone.modifier);

				return my_clone;
			},
			reLinkReferenced: function(){					
				CD.Collectionable.prototype.reLinkReferenced.call(this,
					// No se sabe si los que yo referencio me referencian. Pero los mando igual y ellos verán
					'modifier_extra_single',['single','extra','modifier']);
			},
			reLink: function(type,newObj){
				switch (type){
					case 'single':
					case 'extra':
					case 'modifier':
						this[type] = newObj; break;
					default:;
				}
			},
		},
	CD.Collectionable);

	/* ModifierExtraSingles *********************/
	var ModifierExtraSingles = function(data){
			CD.Collection.apply(this,arguments);
		};
	createPrototype(ModifierExtraSingles,
		{
			__elemClass__:ModifierExtraSingle,
		},
	CD.Collection);


	/* PRECIO *********************/
	var Price = function(data){
			CD.Collectionable.apply(this,arguments);
			/*active,amount,created,deleted,description,id,name,pack_id,priority,single_id,type,units,updated,validity_end,validity_start*/
			//type -> 1:Costo|2:Venta|3:Oferta|4:Paquete|5:Personalizado(en el momento)
		};
	createPrototype(Price,
		{
			getName: function(productType){
				if(this.type==1) return 'cost';
				else if(this.type==2 && productType=='single') return 'normal';
				else if(this.type==2 && productType=='pack') return 'pack';
				else if(this.type==3) return this.name;
				else if(this.type==4 && productType=='pack') return this.single.name;
				else if(this.type==4 && productType=='single') return this.pack.name;
				else if(this.type==5) return 'special';
			},
			getClasses: function(is_selected,productType){
				return {selected: is_selected? true : false,/*selectable:this.isSelectable(productType)*/};
			},
			normalize: function(sources){
				this.single = sources.products.get('single',this.single_id);
				this.pack = sources.products.get('pack',this.pack_id);
				delete(this.single_id);
				delete(this.pack_id);
			},
			unNormalize: function(){
				var my_clone = CD.clone(this,true);

				delete(my_clone.$$hashKey);
				
				if(my_clone.single) my_clone.single_id = this.single.id;
				if(my_clone.pack) my_clone.single_id = this.pack.id;
				delete(my_clone.single);
				delete(my_clone.pack);

				return my_clone;
			},
			reLinkReferenced: function(){
				CD.Collectionable.prototype.reLinkReferenced.call(this,
					// No se sabe si los que yo referencio me referencian. Pero los mando igual y ellos verán
					'price',['single','pack']);
			},
			reLink: function(type,newObj){
				switch (type){
					case 'single': 
					case 'pack':
						this[type] = newObj;
						break;
					default:;
				}
			},
			isSelectable: function(productType){
				return !(productType=='pack' && this.type==4);
			},
		},
	CD.Collectionable);


	/* COLECCION DE PRECIOS *********************/
	var Prices = function(data){
			CD.Collection.apply(this,arguments);
		};
	createPrototype(Prices,
		{
			__elemClass__: Price,
		},
	CD.Collection);


	/* CATEGORIA *********************/
	var Category = function(data){
			CD.Collectionable.apply(this,arguments);
			// id-> 1:all|2:sale|3:nocat|4:packs|5:nostock|6:disabled
			/*children,created,id,name,packs,parent,priority,singles,updated*/
		};
	createPrototype(Category,
		{
			getClasses: function(selected,specialIds){
				return {bold: selected == this, special: specialIds.indexOf(this.id)!=-1};
			},
			normalize: function(sources){
				this.parent = sources.categories.get(this.parent);
				this.children = new CD.Collection({__elemClass__:Category,elements:sources.categories.get(extractIds(this.children))});
				
				this.products = new Products();
				this.products.addElements('single',sources.products.get('single',extractIds(this.singles)));
				this.products.addElements('pack',sources.products.get('pack',extractIds(this.packs)));
				delete this.singles;
				delete this.packs;
			},
			unNormalize: function(){
				var my_clone = CD.clone(this,true);
				// delete(my_clone.collector);
				delete(my_clone.$$hashKey);
				
				if(my_clone.parent) my_clone.parent = {id:this.parent.id};
				if(my_clone.children) my_clone.children = this.children.getIds();

				if(my_clone.products) my_clone.packs = my_clone.products.getIds('pack'); 
				if(my_clone.products) my_clone.singles = my_clone.products.getIds('single');
				delete(my_clone.products);
				return my_clone;
			},
			reLinkReferenced: function(){
				// No se sabe si los que yo referencio me referencian. Pero los mando igual y ellos verán
				CD.Collectionable.prototype.reLinkReferenced.call(this,
					'category',['products']);
				CD.Collectionable.prototype.reLinkReferenced.call(this,
					'parent','children');
				CD.Collectionable.prototype.reLinkReferenced.call(this,
					'child','parent');
			},
			reLink: function(type,newObj){
				switch (type){
					case 'parent': this.parent = newObj; break;
					case 'child': if(this.children) this.children.addElement(newObj); break;
					case 'single':
					case 'pack':
						if(this.products) this.products.addElement(type,newObj);
						break;
					default:;
				}
			},
			getProducts: function(incChildren,filter,type){
				var products = filter? this.products[filter]({type:type}) : this.products.getAll();
				if(incChildren!==false){
					var children = this.children.getAll();
					for(i in children){
						products = products.concat(children[i].getProducts(incChildren,filter));
					}
				}
				return products;
			},
			onSale: function(incChildren,type){
				return this.getProducts(incChildren,'onSale',type);
			},
			hasStock:function(incChildren,type){
				return this.getProducts(incChildren,'hasStock',type);
			},
			isEnabled:function(incChildren,type){
				return this.getProducts(incChildren,'isEnabled',type);
			},
		},
	CD.Collectionable);


	/* COLECCION DE CATEGORÍAS *********************/
	var Categories = function(data){
			CD.Collection.apply(this,arguments);

			this.setSelected();
			this.specialIds = this.getSpecialIds();
		};
	createPrototype(Categories,
		{
			__elemClass__: Category,
			setSelected: function(category){
				if(!category) category=this.get(1);
				this.selected = category;
			},
			getSpecialIds: function(){
				return [1,2,3,4,5,6];
			},
		},
	CD.Collection);


	/* EXTRA *********************/
	var Extra = function(data){
			CD.Collectionable.apply(this,arguments);
		};
	createPrototype(Extra,
		{
			getClasses: function(selected){
				return {selected: selected==this};
			},
		},
	CD.Collectionable);

	/* COLECCION DE EXTRAS *********************/
	var Extras = function(data){
			CD.Collection.apply(this,arguments);
			this.setSelected();
		};
	createPrototype(Extras,
		{
			__elemClass__: Extra,
			setSelected: function(extra){
				if(extra===false){
					this.selected = extra;
					return;
				}
				if(!extra) extra=this.get(1);
				this.selected = extra;
			},
			clearSelected: function(){
				this.selected = undefined;
			}
		},
	CD.Collection);


	/* PRODUCTO Unico *********************/
	/*categories,code,created,deleted,description,enabled_packs,enabled_single,id,image,name,packs,prices,recipe,stock,updated*/
	var Single = function(data){
			if(data){
				CD.Collectionable.apply(this,arguments);
				this.status = {priceable: true,selectable: true,expanded:false,overed:false,};
			}
		};
	createPrototype(Single,
		{
			getClasses: function(is_selected,options){
				return {
					expandable: this.status.priceable && options.allPriceable=='expand',
					overable: this.status.priceable && options.allPriceable=='over',
					expanded: this.status.expanded || (options.allExpanded && options.allPriceable=='expand'),
					overed: this.status.overed || (options.allOvered && options.allPriceable=='over'),
					selected: is_selected,
				};
			},
			getImg: function(){
				return this.image? [this.image] : [];
			},
			getPrices: function(){
				return this.prices;
			},
			getTopPrice: function(){
				var priority = 9999;
				var new_price = undefined;
				var price;
				for(var i in this.prices.collection){
					price = this.prices.collection[i];
					if(priority>price.priority && price.isSelectable(this.type)){
						priority = price.priority;
						new_price = price;
					}
				}
				return new_price;
			},
			hasCategory: function(category_id){return Boolean(this.hasCategories() && this.categories.get(category_id));},
			hasCategories:function(){return Boolean(this.categories && this.categories.count()>0)},
			isEnabled: function(enabled_packs){
				return (enabled_packs&&this.enabled_packs)||this.enabled_single;
			},
			onSale: function(){
				for(var key in this.prices.collection){
					if(this.prices.collection[key].type == 3) return true;
				}
				return false;
			},
			hasStock: function(){
				return Boolean(this.stock);
			},
			normalize: function(sources){
				this.categories = new Categories({elements:sources.categories.get(extractIds(this.categories))});
				this.prices = new Prices({elements:sources.prices.get(extractIds(this.prices))});

				if(this.type=='single'){
					this.packs = new CD.Collection({__elemClass__:Pack,elements:sources.products.get('pack',extractIds(this.packs))});
					this.extras = new CD.Collection({__elemClass__:Extra,elements:sources.extras.get(extractIds(this.extras))});
					this.modifiers = new CD.Collection({elements:sources.modifiers.get(extractIds(this.modifiers))});
					this.modifier_extra_singles = new CD.Collection({__elemClass__:ModifierExtraSingle,elements:sources.modifier_extra_singles.get(extractIds(this.modifier_extra_singles))});
				}
			},
			unNormalize: function(){
				var my_clone = CD.clone(this,true);
				// delete(my_clone.collector);
				delete(my_clone.$$hashKey);
				
				if(my_clone.categories) my_clone.categories = my_clone.categories.getIds(); 
				if(my_clone.prices) my_clone.prices = my_clone.prices.getIds();
				if(this.type=='single'){
					if(my_clone.packs) my_clone.packs = my_clone.packs.getIds();
					if(my_clone.extras) my_clone.extras = my_clone.extras.getIds();
					if(my_clone.modifiers) my_clone.modifiers = my_clone.modifiers.getIds();
					if(my_clone.modifier_extra_singles) my_clone.modifier_extra_singles = my_clone.modifier_extra_singles.getIds();
				}
				
				return my_clone;
			},
			reLinkReferenced: function(){
				CD.Collectionable.prototype.reLinkReferenced.call(this,
					// No se sabe si los que yo referencio me referencian. Pero los mando igual y ellos verán
					'single',['categories','prices','extras','modifier_extra_singles','modifiers','packs']);
			},
			reLink: function(type,newObj){
				switch (type){
					case 'category':if(this.categories) this.categories.addElement(newObj); break;
					case 'price':if(this.prices) this.prices.addElement(newObj); break;
					case 'pack':if(this.packs) this.packs.addElement(newObj); break;
					case 'extra':if(this.extras) this.extras.addElement(newObj); break;
					case 'modifier':if(this.modifiers) this.modifiers.addElement(newObj); break;
					case 'modifier_extra_single':if(this.modifier_extra_singles) this.modifier_extra_singles.addElement(newObj); break;
					default:;
				}
			},
		},
	CD.Collectionable);


	/* PAQUETE *********************/
	var Pack = function(data){
			Single.apply(this,arguments);
		};
	createPrototype(Pack,
		{
			getImg: function(){
				var result = [];
				for(var key in this.singles.collection){
					result = result.concat(this.singles.collection[key].getImg());
				}
				return result;
			},
			isEnabled: function(){
				return this.enabled;
			},
			onSale:function(){
				return false;
			},
			hasStock: function(){
				var hasStock = true;
				for(var key in this.singles.collection){
					hasStock = hasStock && this.singles.collection[key].hasStock();
				}
				return hasStock;
			},
			normalize: function(sources){
				Single.prototype.normalize.call(this,sources);
				this.updatePackPrice();
				this.singles = new CD.Collection({__elemClass__:Single,elements:sources.products.get('single',extractIds(this.singles))});
				this.updatePackStock();
			},
			unNormalize: function(){
				var my_clone = Single.prototype.unNormalize.call(this);
				
				if(my_clone.singles) my_clone.singles = my_clone.singles.getIds(); 
				
				return my_clone;
			},
			reLinkReferenced: function(){
				CD.Collectionable.prototype.reLinkReferenced.call(this,
					// No se sabe si los que yo referencio me referencian. Pero los mando igual y ellos verán
					'pack',['categories','prices','singles']);
			},
			reLink: function(type,newObj){
				switch (type){
					case 'category':if(this.categories) this.categories.addElement(newObj); break;
					case 'price':if(this.prices) this.prices.addElement(newObj); break;
					case 'single':if(this.singles) this.singles.addElement(newObj); break;
					default:;
				}
			},
			updatePackPrice: function(){ //LLAMAR DESPUES DE NORMALIZAR!
				var amount = 0;
				for(var i in this.prices.collection){
					amount += this.prices.collection[i].amount;
				}
				var packPrice = new Price({
					active:true,amount:amount,id:-1,name:this.name,type:2,units:1,priority:1
				});

				this.prices.addElement(packPrice);
			},
			updatePackStock: function(){ //LLAMAR DESPUES DE NORMALIZAR!
				var stock = true;
				for(var i in this.singles.collection){
					stock = stock && this.singles.collection[i].stock;
				}
				this.stock = stock;
			},
		},
	Single);


	/* COLECCION DE PRODUCTOS *********************/
	var Products = function(data){
			CD.MultiCollection.apply(this,arguments);
		};
	createPrototype(Products,
		{
			__elemClass__: {single:Single,pack:Pack},

			genFilter:function(opt){
				return function(product){
					var hasType =   (opt && opt.type     && product.type==opt.type) 			 || !opt || !opt.type;
					var hasCat  =   (opt && opt.category && product.hasCategory(opt.category))   || !opt || !opt.category;
					var hasStatus = (opt && opt.status   && product[opt.status]())               || !opt || !opt.status;
					return hasStatus && hasType && hasCat;
				};
			},
			onSale: function(opt){
				if(!opt) opt = {};
				opt.status = 'onSale';
				return this.getFiletered(this.genFilter(opt));
			},
			hasStock: function(opt){
				if(!opt) opt = {};
				opt.status = 'hasStock';
				return this.getFiletered(this.genFilter(opt));
			},
			isEnabled:function(opt){
				if(!opt) opt = {};
				opt.status = 'isEnabled';
				return this.getFiletered(this.genFilter(opt));
			},
			hasCategory:function(category_id){
				return this.getFiletered(this.genFilter({category:category_id}));
			},
			/*_getFiletered:function(status,opt){
				var product,hasType,hasCat;
				var filtered = [];
				for(var key in this.collection){
					product = this.collection[key];
					hasType = (opt && opt.type     && product.type==opt.type) || !opt || !opt.type;
					hasCat =  (opt && opt.category && product.categories.get(opt.category)) || !opt || !opt.category;
					
					if(product[status]() && hasType && hasCat){
						filtered.push(product);
					}
				}
				return filtered;
			},*/
		},
	CD.MultiCollection);


	var ProductsSelectable = function(data){
			Products.apply(this,arguments);
			this.clearSelected();
		};
	createPrototype(ProductsSelectable,
		{
			setSelected: function(product,price){
				var result=false; //Retorna verdadero si seleccionó o deseleccionó según los parámetros indicados
			
				// Deselecciona ____________________________________________
				if(price===false || this.options.allSelectable=="none" || !product.status.selectable){
					
					delete(this.selectedMultiple[product.type][product.id]);
					if(this.selectedSingle && this.selectedSingle.product == product) this.selectedSingle = undefined;
					if(this.selected && this.selected.product == product){
						var singles = this.selectedMultiple? Object.keys(this.selectedMultiple.single) : [];
						var packs = this.selectedMultiple? Object.keys(this.selectedMultiple.pack) : [];

						if(singles.length>0){ 
							this.selected = this.selectedMultiple.single[singles[0]];
							this.selectedSingle = this.selected;
						}
						else if(packs.length>0){ 
							this.selected = this.selectedMultiple.pack[packs[0]];
						}
						else this.selected = undefined;
					}

					if(price===false) return true;
				}

				// Selecciona ____________________________________________
				// Selecciones: 
				// selected, selectedSingle -> {product:product,price:price} 
				// selectedMultiple[product.type][product.id] -> {product:product,price:price} 
				else{
					if(!price || !price.isSelectable(product.type)){
						if(!this.selectedMultiple[product.type][product.id]) price = product.getTopPrice();
						else price = this.selectedMultiple[product.type][product.id].price;
					}

					if(price && price.isSelectable(product.type)){
						// Agrega el anterior
						if(this.selected && this.options.allSelectable=='multiple'){ 
							this.selectedMultiple[this.selected.product.type][this.selected.product.id] = this.selected;
						}

						this.selected = {product:product,price:price};
						
						if(product.type=="single") this.selectedSingle = this.selected;
						else if(this.options.allSelectable!='multiple') this.selectedSingle = undefined;

						if(this.options.allSelectable=='multiple'){ 
							this.selectedMultiple[product.type][product.id] = this.selected;
						}

						return true;
					}
				}
				return false;
			},
			setNextSelected: function(filteredProducts,is_single){
				if(filteredProducts.length>0){
					var new_selected,new_pos;
					var keepDoing = true;
					
					var init_pos = this.getSelectedFilteredPos(filteredProducts);
					if(init_pos == filteredProducts.length-1 || init_pos == -1){
						if(this.options.selectCarousel) new_pos = 0;
						else{ 
							new_pos = init_pos;
							keepDoing = false;
						}
					}
					else new_pos = init_pos + 1; // Avanza al siguiente producto
					
					if(!is_single) return this.setSelected(filteredProducts[new_pos]);
					else{
						if(init_pos==-1) init_pos = filteredProducts.length-1;
						
						while(filteredProducts[new_pos].type!='single' && keepDoing){
							if(new_pos == init_pos){ // Si ya dio la vuelta, aplica con o sin carrusel
								keepDoing = false;
							}
							else if(new_pos == filteredProducts.length-1){
								if(this.options.selectCarousel) new_pos = 0;
								else keepDoing = false;
							}
							else new_pos++;
						}
						if(filteredProducts[new_pos].type=='single') return this.setSelected(filteredProducts[new_pos]);
					}
				}
				return false;
			},
			setPrevSelected: function(filteredProducts,is_single){
				if(filteredProducts.length>0){
					var new_selected,new_pos;
					var keepDoing = true;
					
					var init_pos = this.getSelectedFilteredPos(filteredProducts);
					if(init_pos == 0 || init_pos == -1){
						if(this.options.selectCarousel) new_pos = filteredProducts.length-1;
						else{ 
							new_pos = init_pos;
							keepDoing = false;
						}
					}
					else new_pos = init_pos - 1; // Avanza al siguiente producto
					
					if(!is_single) return this.setSelected(filteredProducts[new_pos]);
					else{
						if(init_pos==-1) init_pos = 0;
						
						while(filteredProducts[new_pos].type!='single' && keepDoing){
							if(new_pos == init_pos){ // Si ya dio la vuelta, aplica con o sin carrusel
								keepDoing = false;
							}
							else if(new_pos == 0){
								if(this.options.selectCarousel) new_pos = filteredProducts.length-1;
								else keepDoing = false;
							}
							else new_pos--;
						}
						if(filteredProducts[new_pos].type=='single') return this.setSelected(filteredProducts[new_pos]);
					}
				}
				return false;
			},
			
			getSelectedFilteredPos: function(filteredProducts,is_single){
				var pos = -1;
				if(filteredProducts.length>0){
					if(!is_single && this.selected){
						pos = filteredProducts.indexOf(this.selected.product);
					}
					else if(is_single && this.selectedSingle){
						pos = filteredProducts.indexOf(this.selectedSingle.product);
					}
				}
				return pos;
			},
			switchSelected: function(product,price){
				if(this.isSelected(product,price)) return this.setSelected(product,false);
				else return this.setSelected(product,price);
			},
			isSelected: function(product,price){
				var is_selected = false;
				if(this.selected && this.selected.product==product){
					if(!price || (price && this.selected.price == price)) is_selected=true;
					else if(price && this.selected.price != price) is_selected=false;
				}
				else if(this.selectedMultiple[product.type][product.id]){
					var selected_price = this.selectedMultiple[product.type][product.id].price;
					if(!price || (price && selected_price == price)) is_selected=true;
					else if(price && selected_price != price) is_selected=false;
				}
				return is_selected;
			},
			clearSelected: function(multiple_only){
				this.selectedMultiple = {single:{},pack:{}};
				if(!multiple_only){
					this.selected = undefined;
					this.selectedSingle = undefined;
				}
			},
			updateSelected: function(productsArr){
				var new_selectedMultiple,new_selected,new_selectedSingle;
				new_selectedMultiple = {single:{},pack:{}};
				for(var i in productsArr){
					var product = productsArr[i];
					if(this.selected && this.selected.product == product) new_selected = this.selected;
					if(this.selectedSingle && this.selectedSingle.product == product) new_selectedSingle = this.selectedSingle;
					if(this.selectedMultiple[product.type][product.id]) new_selectedMultiple[product.type][product.id] = this.selectedMultiple[product.type][product.id];
				}

				this.selected = new_selected;
				this.selectedSingle = new_selectedSingle;
				this.selectedMultiple = new_selectedMultiple;
			},
		},
	Products);


	return {
		ModifierExtraSingle: ModifierExtraSingle,
		ModifierExtraSingles: ModifierExtraSingles,
		Price: Price,
		Prices: Prices,
		Category: Category,
		Categories: Categories,
		Extra: Extra,
		Extras: Extras,
		Single: Single,
		Pack: Pack,
		Products: Products,
		ProductsSelectable:ProductsSelectable,
	};
}]);
