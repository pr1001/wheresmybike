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
      // this is crazy
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
})

/*
Person
- name
- address
- mobile number
- email address
*/

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

/*
Incident Report
- time
- address
- bike
- description
- photo
- procesverbaalnummer (police case number)
*/

/*
City Bike Parking
- name
- address
// http://www.amsterdam.nl/parkeren-verkeer/fiets/fietspuntstallingen/
// in additional to the guarded ones should also at least have Centraal Station
// info@ivv.amsterdam.nl
*/

/*
Bike Rental
- name
- address
- url
*/

/*
Engraving Times
- address // parse strings like "Javaplein, naast het Badhuis" and "Museumplein, naast de AH ingang" and "Haarlemmerstraat, op de Eenhoornsluis" and "Gulden Winckelplantsoen, bij de KFC"
- starttime
- endtime
*/
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

// http://www.fietsersbondamsterdam.nl/

/*
Work Flow:
- open app
- Check Incidents (if any), Report Incident, My Bike(s), Other
- Check Incidents will just show open Incidents, check if AFAC now knows about a missing bike, 
*/