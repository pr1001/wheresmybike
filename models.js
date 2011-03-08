var WMB = WMB ? WMB : {};

// Load the application once the DOM is ready, using jQuery.ready:
$(function(){
  // Base Mode, with collection syncing
  WMB.BaseModel = Backbone.Model.extend({
    initialize: function() {
      var modelName = this.name.charAt(0).toLocaleUpperCase() + this.name.substring(1).toLocaleLowerCase();
      var pluralName = modelName + "s";
      this.collection = WMB[pluralName];
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
    }
  });
  WMB.BaseCollection = Backbone.Collection.extend({
    // Save all of the bike items under the "bikes" namespace.
    initialize: function() {
      this.localStorage = new Store(this.name);
    }
  });
  WMB.createModel = function createModel(name, modelObj, collectionObj) {
    // create the Model
    var modelName = name.charAt(0).toLocaleUpperCase() + name.substring(1).toLocaleLowerCase();
    modelObj = modelObj ? modelObj : {};
    modelObj.name = name;
    WMB[modelName] = WMB.BaseModel.extend(modelObj);
    // create the Collection of the Model
    var updated = collectionObj ? collectionObj : {};
    updated.model = WMB[modelName];
    updated.name = name + "s";
    var collectionName = modelName + "Collection";
    WMB[collectionName] = WMB.BaseCollection.extend(updated);
    // create an instanciation of the Collection
    var pluralName = modelName + "s";
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
      this.localStorage = new Store(this.name);
      var id = this.get("id");
      // synthetic property
      this.locks = function() {
        return WMB.Locks.filter(function(lock) {
          return lock.get("bike_id") === id;
        })
      };
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
    },
    address: function address() {
      return WMB.Addresses.get(this.get("address_id"));
    },
    'defaults': {
      'manufacturer': '',
      'model': '',
      'year': (new Date().getFullYear()),
      'color': '',
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
      'time': new Date(),
      'description': "",
      'case': ""
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
      'lastparked': new Date()
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
      'starttime': new Date(),
      'endtime': new Date(),
      'description': "",
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