/**************************************
CAFE MANAGER
Product Data Models
*****************************************/
(function(){'use strict';}());

angular.module('cafeManagerApp').factory('ProductDataModels',['ClassDefinitions',function(CD){

	/* ModifierExtraSingle *********************/
	var ModifierExtraSingleDM = CD.newClass(
		function(data){		
			CD.CollectionableDM.apply(this,arguments);
		},{
			preNormalize: function(sources){
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
				CD.CollectionableDM.prototype.reLinkReferenced.call(this,
					// No se sabe si los que yo referencio me referencian. Pero los mando igual y ellos verán
					'modifier_extra_single',['single','extra','modifier']);
			},
			reLink: function(type,newObj){
				switch (type){
					case 'single':if(this.single) this.single = newObj; break;
					case 'extra':if(this.extra) this.extra = newObj; break;
					case 'modifier':if(this.modifier) this.modifier = newObj; break;
					default:;
				}
			},
		},
	CD.CollectionableDM);

	/* ModifierExtraSingles *********************/
	var ModifierExtraSinglesDM = CD.newClass(
		function(data,JSON_data){
			CD.CollectionDM.apply(this,arguments);
		},{
			__elemClass__:ModifierExtraSingleDM,
		},
	CD.CollectionDM);


	/* PRECIO *********************/
	var PriceDM = CD.newClass(
		function(data){
			CD.CollectionableDM.apply(this,arguments);
			/*active,amount,created,deleted,description,id,name,pack_id,priority,single_id,type,units,updated,validity_end,validity_start*/
			//type -> 1:Costo|2:Venta|3:Oferta|4:Paquete|5:Personalizado(en el momento)
		},{
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
			preNormalize: function(sources){
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
				CD.CollectionableDM.prototype.reLinkReferenced.call(this,
					// No se sabe si los que yo referencio me referencian. Pero los mando igual y ellos verán
					'price',['single','pack']);
			},
			reLink: function(type,newObj){
				switch (type){
					case 'single':if(this.single) this.single = newObj; break;
					case 'pack':if(this.pack) this.pack = newObj; break;
					default:;
				}
			},
			isSelectable: function(productType){
				return !(productType=='pack' && this.type==4);
			},
		},
	CD.CollectionableDM);


	/* COLECCION DE PRECIOS *********************/
	var PricesDM = CD.newClass(
		function(data,JSON_data){
			CD.CollectionDM.apply(this,arguments);
		},{
			__elemClass__: PriceDM,
		},
	CD.CollectionDM);


	/* CATEGORIA *********************/
	var CategoryDM = CD.newClass(
		function(data){
			CD.CollectionableDM.apply(this,arguments);
			// id-> 1:all|2:sale|3:nocat|4:packs|5:nostock|6:disabled
			/*children,created,id,name,packs,parent,priority,singles,updated*/
		},{
			getClasses: function(selected,specialIds){
				return {bold: selected == this, special: specialIds.indexOf(this.id)!=-1};
			},
			preNormalize: function(sources){
				this.parent = sources.categories.get(this.parent);
				this.normalize({sources_names:'children',source_collection:sources.categories});
				this.normalize({sources_names:{single:'singles',pack:'packs'},source_collection:sources.products,dest_name:'products'});
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
				CD.CollectionableDM.prototype.reLinkReferenced.call(this,
					// No se sabe si los que yo referencio me referencian. Pero los mando igual y ellos verán
					'price',['single','pack']);
			},
			reLink: function(type,newObj){
				switch (type){
					case 'single':if(this.single) this.single = newObj; break;
					case 'pack':if(this.pack) this.pack = newObj; break;
					default:;
				}
			},
		},
	CD.CollectionableDM);


	/* COLECCION DE CATEGORÍAS *********************/
	var CategoriesDM = CD.newClass(
		function(data,JSON_data){
			CD.CollectionDM.apply(this,arguments);

			this.setSelected();
			this.specialIds = this.getSpecialIds();
		},{
			__elemClass__: CategoryDM,
			setSelected: function(category){
				if(!category) category=this.get(1);
				this.selected = category;
			},
			getSpecialIds: function(){
				return [1,2,3,4,5,6];
			},
		},
	CD.CollectionDM);


	/* EXTRA *********************/
	var ExtraDM = CD.newClass(
		function(data){
			CD.CollectionableDM.apply(this,arguments);
		},{
			getClasses: function(selected){
				return {selected: selected==this};
			},
		},
	CD.CollectionableDM);

	/* COLECCION DE EXTRAS *********************/
	var ExtrasDM = CD.newClass(
		function(data,JSON_data){
			CD.CollectionDM.apply(this,arguments);
			this.setSelected();
		},{
			__elemClass__: ExtraDM,
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
	CD.CollectionDM);


	/* PRODUCTO Unico *********************/
	/*categories,code,created,deleted,description,enabled_packs,enabled_single,id,image,name,packs,prices,recipe,stock,updated*/
	var SingleDM = CD.newClass(
		function(data){
			if(data){
				CD.CollectionableDM.apply(this,arguments);
				this.status = {priceable: true,selectable: true,expanded:false,overed:false,};
			}
		},{
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
			isEnabled: function(pack){
				return (pack&&this.enabled_packs)||this.enabled_single;
			},
			preNormalize: function(sources){
				this.normalize({sources_names:'categories',source_collection:sources.categories});
				this.normalize({sources_names:'prices',source_collection:sources.prices});
				if(this.type=='single'){
					this.normalize({sources_names:'packs',type:'pack',source_collection:sources.products});
					this.normalize({sources_names:'extras',source_collection:sources.extras});
					this.normalize({sources_names:'modifiers',source_collection:sources.modifiers});
					this.normalize({sources_names:'modifier_extra_singles',source_collection:sources.modifier_extra_singles});
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
				CD.CollectionableDM.prototype.reLinkReferenced.call(this,
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
	CD.CollectionableDM);


	/* PAQUETE *********************/
	var PackDM = CD.newClass(
		function(data){
			SingleDM.apply(this,arguments);
		},{
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
			preNormalize: function(sources){
				SingleDM.prototype.preNormalize.call(this,sources);
				this.updatePackPrice();
				this.normalize({sources_names:'singles',type:'single',source_collection:sources.products});
				this.updatePackStock();
			},
			unNormalize: function(){
				var my_clone = SingleDM.prototype.unNormalize.call(this);
				
				if(my_clone.singles) my_clone.singles = my_clone.singles.getIds(); 
				
				return my_clone;
			},
			updatePackPrice: function(){ //LLAMAR DESPUES DE NORMALIZAR!
				var amount = 0;
				for(var i in this.prices.collection){
					amount += this.prices.collection[i].amount;
				}
				var packPrice = new PriceDM({
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
	SingleDM);


	/* COLECCION DE PRODUCTOS *********************/
	var ProductsDM = CD.newClass(
		function(data,JSON_data){
			CD.MultiCollectionDM.apply(this,arguments);
			this.clearSelected();
		},{
			__elemClass__: {single:SingleDM,pack:PackDM},
			/*getFirstSelected: function(type){
				if(!type) type = 'single';
				for(var i in this.selected[type]) return this.selected[type][i];
				return undefined;
			},*/
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
	CD.MultiCollectionDM);


	return {
		ModifierExtraSingleDM: ModifierExtraSingleDM,
		ModifierExtraSinglesDM: ModifierExtraSinglesDM,
		PriceDM: PriceDM,
		PricesDM: PricesDM,
		CategoryDM: CategoryDM,
		CategoriesDM: CategoriesDM,
		ExtraDM: ExtraDM,
		ExtrasDM: ExtrasDM,
		SingleDM: SingleDM,
		PackDM: PackDM,
		ProductsDM: ProductsDM,
	};
}]);
