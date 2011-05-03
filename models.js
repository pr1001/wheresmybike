var WMB = WMB ? WMB : {};

// Load the application once the DOM is ready, using jQuery.ready:
$(function(){
  // helper
  WMB.capitalize = function capitalize(str) {
    return str.charAt(0).toLocaleUpperCase() + str.substring(1).toLocaleLowerCase();
  }
  
  // Base Mode, with collection syncing
  WMB.BaseModel = Backbone.Model.extend({
    initialize: function() {
      var modelName = WMB.capitalize(this.name);
      var pluralName = modelName + "s";
      this.collection = WMB[pluralName];
      // make a view
      var rowViewName = modelName + 'Row';
      this.view = new WMB[rowViewName]({
        model: this,
        id: this.name + '-row-' + this.id
      });
      var saveViewName = modelName + 'Save';
      this.saveView = new WMB[saveViewName]({
        model: this,
        id: this.name + '-save-' + this.id
      });
    },
    // Remove this Bike from localStorage and delete its view.
    clear: function() {
      this.destroy();
      this.view.remove();
    },
    save: function(attributes, options) {
      Backbone.Model.prototype.save.call(this, attributes, options);
      // keep the collection up to date
      this.collection.fetch();
      // update its view if it has one
      if (this.view && typeof(this.view.render) == 'function') {
        this.view.render();
      }
    }
  });
  WMB.BaseCollection = Backbone.Collection.extend({
      initialize: function() {
        this.localStorage = new Store(this.name);
        var modelName = WMB.capitalize(this.name);
        var listViewName = modelName + 'List';
        this.view = new WMB[listViewName]({
          model: this,
          id: this.name + '-list-' + guid()
        });
      },
      fetch: function fetch(options) {
        Backbone.Collection.prototype.fetch.call(this, options);
        // if we have a view, add the Collection Models to it
        var view = this.view;
        if (view) {
          // update the view with the fetched data
          this.each(function (m) {
            if (m.view) {
              view.el.appendChild(m.view.el);
            }
          });
          view.render();
        }
      }
    });
    
  WMB.BaseViewRow = Backbone.View.extend({
    events: {
      "click .icon":          "open",
      "click .button.edit":   "openEditDialog",
      "click .button.delete": "destroy",
      "dblclick": "edit"
    },
    edit: function() {
      console.log("editing row because we double clicked")
    },
    initialize: function() {
      _.bindAll(this, "render");
      // make sure our view is rendered right away
      this.render();
    },
    render: function() {
      //  ...
      $(this.el).html(JSON.stringify(this.model.toJSON()));
      return this;
    }
  });
  WMB.BaseViewList = Backbone.View.extend({
    events: {
      "click .icon":          "open",
      "click .button.edit":   "openEditDialog",
      "click .button.delete": "destroy",
      "dblclick": "edit"
    },
    edit: function() {
      console.log("editing list because we double clicked")
    },
    initialize: function() {
      _.bindAll(this, "render");
      // make sure our view is rendered right away
      this.render();
    },
    render: function() {
      // update all the members
      this.model.each(function (m) {
        if (m.view){
          m.view.render();
        }
      });
      // $(this.el).html(str);
      return this;
    }
  });
  
  WMB.BaseViewSave = Backbone.View.extend({
    events: {
      "submit form": "save"
    },
    initialize: function() {
      _.bindAll(this, "render");
      this.render();
    },
    render: function() {
      // var out = '<form>';
      // out += "<label for='title'>Title</label>";
      // out += "<input name='title' type='text' />";
      // out += "<label for='body'>Body</label>";
      // out += "<textarea name='body'>" + (this.model.escape('body') || '') + "</textarea>";
      // var submitText = this.model.isNew() ? 'Create' : 'Save';
      // out += "<button>" + submitText + "</button>";
      // out += "</form>";
      
      var form = document.createElement('form');
      form.setAttribute('onsubmit', 'return false;');
      var model = this.model;
      _.each(_.keys(model.attributes), function(attr) {
        if (attr != 'id' && attr != 'cid') {
          var label = document.createElement('label');
          label.setAttribute('for', attr);
          label.appendChild(document.createTextNode(WMB.capitalize(attr)));
          form.appendChild(label);
          var input = document.createElement('input');
          input.setAttribute('name', attr);
          input.setAttribute('type', 'text');
          input.setAttribute('value', model.get(attr));
          form.appendChild(input);
        }
      });
      var submit = document.createElement('input');
      submit.setAttribute('type', 'submit');
      form.appendChild(submit);
      
      var oldForm = $('form', this.el)[0];
      if (this.el.children.length && oldForm){
        this.el.replaceChild(oldForm, form);
      } else {
        this.el.appendChild(form);
      }
      
      // $('#app').html(this.el);
      this.$('[name=title]').val(this.model.get('title')); // use val, for security reasons
    },
    save: function() {
      var self = this;
      var isNew = this.model.isNew();
      var msg = isNew ? 'Successfully created!' : "Saved!";      
      // get all the inputs into an array.
      var values = {};
      $('form input', this.el).each(function(i, field) {
        values[field.name] = field.value;
      });
      this.model.save(values, {
          success: function(model, resp) {
            console.log("model saved")
            self.model = model;
            self.render();
            self.delegateEvents();
            // Backbone.history.saveLocation('documents/' + model.id);
            
            // replace this.el with the RowView el?
            // if we just created a new
            // if (isNew && )
            // this.el
          },
          error: function() {
            console.log("unable to save model");
            // new App.Views.Error();
          }
      });
      return false;
    }
  });
  
  WMB.createModel = function createModel(name, modelObj, collectionObj, rowViewObj, listViewObj, saveViewObj) {
    var modelName = WMB.capitalize(name);
    
    // create the view first so the model's constructor can attach an instance to itself
    var rowViewName = modelName + 'Row';
    rowViewObj = rowViewObj ? rowViewObj : {};
    rowViewObj.name = name;
    rowViewObj.className = name + '-row';
    rowViewObj.tagName = rowViewObj.tagName ? rowViewObj.tagName : 'li';
    // rowViewObj.tagName = 'li';
    WMB[rowViewName] = WMB.BaseViewRow.extend(rowViewObj);
    
    // create the view first so the model's constructor can attach an instance to itself
    var saveViewName = modelName + 'Save';
    saveViewObj = saveViewObj ? saveViewObj : {};
    saveViewObj.name = name;
    saveViewObj.className = name + '-save';
    saveViewObj.tagName = saveViewObj.tagName ? saveViewObj.tagName : 'div';
    // rowViewObj.tagName = 'li';
    WMB[saveViewName] = WMB.BaseViewSave.extend(saveViewObj);
    
    // create the view first so the model's constructor can attach an instance to itself
    var listViewName = modelName + 'List';
    listViewObj = listViewObj ? listViewObj : {};
    listViewObj.name = name;
    listViewObj.className = name + '-list';
    listViewObj.tagName = listViewObj.tagName ? listViewObj.tagName : 'ul';
    // listViewObj.tagName = 'li';
    WMB[listViewName] = WMB.BaseViewList.extend(listViewObj);
    
    // create the Model
    modelObj = modelObj ? modelObj : {};
    modelObj.name = name;
    WMB[modelName] = WMB.BaseModel.extend(modelObj);
    // create the Collection of the Model
    var updated = collectionObj ? collectionObj : {};
    updated.model = WMB[modelName];
    updated.name = name; // name + "s"; // don't use plural names for the collection data store so that it can use the same as the Model
    var collectionName = modelName + "Collection";
    updated.collectionName = collectionName;
    var pluralName = modelName + "s";
    updated.pluralName = pluralName;
    WMB[collectionName] = WMB.BaseCollection.extend(updated);
    // create an instanciation of the Collection
    WMB[pluralName] = new WMB[collectionName];
    WMB[pluralName].fetch();
  }

  /*
  Address
  - lat
  - long
  - street
  - address
  - extra
  - city
  - country
  - postcode
  */
  WMB.createModel('address', {
    'defaults': {
      'lat': 0.0,
      'long': 0.0,
      'street': "",
      'address': "",
      'extra': "",
      'city': "",
      'country': "",
      'postcode': ""
    }
  });
  // make an alias with the correct plural form
  WMB.Addresses = WMB.Addresss;

  /*
  Person
  - name
  - address
  - mobile number
  - email address
  */
  WMB.createModel('person', {
    'defaults': {
      'name': "",
      'mobile': "",
      'email': ""
    },
    setAddress: function setAddress(address) {
      this.set({address_id: address.get("id")});
      this.save();
      WMB.Checkin.now(address);
    },
    address: function address() {
      return WMB.Addresses.get(this.get("address_id"));
    }
  });
  // make an alias with the correct plural form
  WMB.People = WMB.Persons;
  // and an alias for the user
  WMB.user = function user() {
    return WMB.People.at(0);
  };

  /*
  Lock
  - manufactuer
  - model
  - keyid
  - insuranceid
  */  
  WMB.createModel('lock', {
    setBike: function setBike(bike) {
      this.set({bike_id: bike.get("id")});
      this.save();
    },
    bike: function bike() {
      return WMB.Bikes.get(this.get("bike_id"));
    }
  });
  
  /*
  Bike
  - manufacturer
  - model
  - year
  - color
  - locks
  - frame "number" (really  a string)
  - engraving "number"
  - tag "number"
  - insurance number
  - photo? (could at least take a URL)
  */
  WMB.createModel('bike', {
    initialize: function() {
      // standard init stuff every model needs
      var modelName = WMB.capitalize(this.name);
      var pluralName = modelName + "s";
      this.collection = WMB[pluralName];
      
      var id = this.get("id");
      // synthetic property
      this.locks = function() {
        return WMB.Locks.filter(function(lock) {
          return lock.get("bike_id") === id;
        })
      };
      
      var rowViewName = modelName + 'Row';
      this.view = new WMB[rowViewName]({
        model: this,
        id: this.name + '-row-' + this.id
      });
      var saveViewName = modelName + 'Save';
      this.saveView = new WMB[saveViewName]({
        model: this,
        id: this.name + '-save-' + this.id
      });
    },
    setLock: function setLock(lock) {
      lock.set({bike_id: this.get("id")});
      lock.save();
    },
    locks: function locks() {
      var id = this.get("id");
      return WMB.Locks.filter(function(lock) {
        return lock.get("bike_id") == id;
      });
    },
    setAddress: function setAddress(address) {
      this.set({address_id: address.get("id")});
      this.save();
      WB.Checkin.now(address, this);
    },
    address: function address() {
      return WMB.Addresses.get(this.get("address_id"));
    },
    'defaults': {
      'manufacturer': '',
      'model': '',
      'year': (new Date().getFullYear()), // NB: This is only executed once, when the file is loaded.
      'color': 'black',
      // locks
      'frame': '',
      'engraving': '',
      'tag': '',
      'insurance': ''
       // photos
  }});
  
  /*
  Incident Report
  - time
  - address
  - bike
  - description
  - photo
  - procesverbaalnummer (police case number)
  */
  WMB.createModel('incident', {
    'defaults': {
      // 'time': new Date(),
      'description': "",
      'case': "",
      'found': null,
      'givenUp': false
    },
    initialize: function initialize() {
      var modelName = WMB.capitalize(this.name);
      var pluralName = modelName + "s";
      this.collection = WMB[pluralName];

      if (!this.get('time')) {
        this.set({time: new Date});
      }
    },
    setAddress: function setAddress(address) {
      this.set({address_id: address.get("id")});
      this.save();
    },
    address: function address() {
      return WMB.Addresses.get(this.get("address_id"));
    },
    setBike: function setBike(bike) {
      this.set({bike_id: bike.get("id")});
      this.save();
    },
    bike: function bike() {
      return WMB.Bikes.get(this.get("bike_id"));
    },
    parse: function parse(response) {
      // recreate the Date object
      response.time = new Date(response.time);
      if (response.found) {
        response.found = new Date(response.found);
      }
      return response;
    }
  }, {
    parse: function parse(response) {
      return _.map(response, function(incident) {
        return WMB.Incident.prototype.parse(incident);
      });
    }
  });

  /*
  City Bike Parking
  - name
  - address
  - url
  // http://www.amsterdam.nl/parkeren-verkeer/fiets/fietspuntstallingen/
  // in additional to the guarded ones should also at least have Centraal Station
  // info@ivv.amsterdam.nl
  */  
  WMB.createModel('parking', {
    'defaults': {
      'name': "",
      'description': "",
      'url': "",
      'totalplaces': 0,
      // 'lastparked': new Date()
    },
    initialize: function initialize() {
      var modelName = WMB.capitalize(this.name);
      var pluralName = modelName + "s";
      this.collection = WMB[pluralName];

      if (!this.get('lastparked')) {
        this.set({lastparked: new Date});
      }
    },
    setAddress: function setAddress(address) {
      this.set({address_id: address.get("id")});
      this.save();
    },
    address: function address() {
      return WMB.Addresses.get(this.get("address_id"));
    },
    setBike: function setBike(bike) {
      this.set({bike_id: bike.get("id")});
      this.save();
      WMB.Checkin.now(this.address(), bike);
    },
    bike: function bike() {
      return WMB.Bikes.get(this.get("bike_id"));
    },
    parse: function parse(response) {
      // recreate the Date object
      response.lastparked = new Date(response.lastparked);
      return response;
    }
  }, {
    parse: function parse(response) {
      return _.map(response, function(parking) {
        return WMB.Parking.prototype.parse(parking);
      });
    }
  });

  /*
  Bike Rental
  - name
  - address
  - url
  */  
  WMB.createModel('rental', {
    'defaults': {
      'name': "",
      'description': "",
      'url': "",
    },
    setAddress: function setAddress(address) {
      this.set({address_id: address.get("id")});
      this.save();
    },
    address: function address() {
      return WMB.Addresses.get(this.get("address_id"));
    }
  });
  
  /*
  Engraving Times
  - address // parse strings like "Javaplein, naast het Badhuis" and "Museumplein, naast de AH ingang" and "Haarlemmerstraat, op de Eenhoornsluis" and "Gulden Winckelplantsoen, bij de KFC"
  - starttime
  - endtime
  */
  WMB.createModel('engraving', {
    'defaults': {
      // 'starttime': new Date(),
      // 'endtime': new Date(),
      'description': "",
    },
    initialize: function initialize() {
      var modelName = WMB.capitalize(this.name);
      var pluralName = modelName + "s";
      this.collection = WMB[pluralName];
      
      if (!this.get('starttime')) {
        this.set({starttime: new Date});
      }
      if (!this.get('endtime')) {
        this.set({endtime: new Date});
      }
    },
    setAddress: function setAddress(address) {
      this.set({address_id: address.get("id")});
      this.save();
    },
    address: function address() {
      return WMB.Addresses.get(this.get("address_id"));
    },
    parse: function parse(response) {
      // recreate the Date object
      response.starttime = new Date(response.starttime);
      response.endtime = new Date(response.endtime);
      return response;
    }
    // function isNow(): Boolean
  }, {
    parse: function parse(response) {
      return _.map(response, function(engraving) {
        return WMB.Incident.prototype.parse(engraving);
      });
    }
  });
  
  WMB.createModel('checkin', {
    'defaults': {
      // 'time': new Date(),
      'description': ""
    },
    initialize: function initialize() {
      var modelName = WMB.capitalize(this.name);
      var pluralName = modelName + "s";
      this.collection = WMB[pluralName];
      
      if (!this.get('time')) {
        this.set({time: new Date});
      }
    },
    setAddress: function setAddress(address) {
      this.set({address_id: address.get("id")});
      this.save();
    },
    address: function address() {
      return WMB.Addresses.get(this.get("address_id"));
    },
    parse: function parse(response) {
      // recreate the Date object
      response.time = new Date(response.time);
      return response;
    }
    // function isNow(): Boolean
  }, {
    parse: function parse(response) {
      return _.map(response, function(checkin) {
        return WMB.Checkin.prototype.parse(checkin);
      });
    },
    comparator: function comparator(checkin) {
      // sort from newest to oldest
      return -checkin.get('time');
    }
  });
  // helper function
  WMB.Checkin.now = function now(address, bike, description) {
    // don't create a checkin if we don't have an address
    if (!address) {
      return;
    }
    var checkin = new WMB.Checkin;
    var vals = {};
    if (bike) {
      vals.bike_id = bike.get("id");
    }
    if (description) {
      vals.description = description;
    }
    checkin.set(vals);
    // don't need to save because setAddress already does
    checkin.setAddress(address);
    return checkin;
  }
})

// http://www.afac-amsterdam.nl/agenda/agenda.lhtml
// they're planned through the end of 2011 but there little benefit for having the information more than a week ahead
// maybe manually set the whole year and then only download the most recent week? but what if something is rescheduled?

//  Is je fiets weg? Bel de vol- gende dag het Fietsdepot op 020-3344522. Staat je fiets daar niet? Bel dan de politie op 0900-8844.
// Meer informatie Bel de gemeente op 14020 (vijfcijferig telefoonnummer) of kijk op www.amsterdam.nl/fiets

// http://www.politie.nl/Aangifte/ -> Amsterdam and Amsterdam Zuidoost are options
// https://aangifte.politie.nl/e-aangifte/internetaction.do?_flowId=internet-flow&pleegPlaats=AMSTERDAM
// continue
// Diefstal of inbraak
// Geen van beide (In of op een voer-/ vaartuig?)

// information on reporting a stolen bike: http://www.politie-amsterdam-amstelland.nl/get.cfm?id=5288
// register bike with the police: http://www.politie-amsterdam-amstelland.nl/get.cfm?id=491

// http://www.fietsersbondamsterdam.nl/

/*
Work Flow:
- open app
- Check Incidents (if any), Report Incident, My Bike(s), Other
- Check Incidents will just show open Incidents, check if AFAC now knows about a missing bike, 
*/