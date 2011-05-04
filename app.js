var WMB = WMB ? WMB : {};

// Load the application once the DOM is ready, using jQuery.ready:
$(document).ready(function() {
  // FB: http://www.facebook.com/connect/prompt_feed.php?&message=my%20awesome%20status to share a status message
  // Twitter: https://twitter.com/?status=Custom%20Message%20Here
  // 4sq: Marelle is pain
  // Google Calendar: http://www.google.com/calendar/event?action=TEMPLATE&text=Brunch at Java Cafe&dates=20060415T180000Z/20060415T190000Z&location=Java Cafe, San Francisco, CA&details=Try our Saturday brunch special:<br><br>French toast with fresh fruit<br><br>Yum!&trp=true&sprop= website:http://www.javacafebrunches.com&sprop=name:Jave Cafe (http://www.google.com/googlecalendar/event_publisher_guide_detail.html)
  
  var article = $('article')[0];
  // insert bike form
  if (WMB.Bikes.length == 0) {
    WMB.theBike = new WMB.Bike();
  } else {
    WMB.theBike = WMB.Bikes.at(0);
  }
  
  // custom save function
  WMB.theBike.saveView.save = function() {
    var self = WMB.theBike.saveView;
    var isNew = self.model.isNew();
    var msg = isNew ? 'Successfully created!' : "Saved!";      
    // get all the inputs into an array.
    var values = {};
    $('form input, form select', self.el).each(function(i, field) {
      values[field.name] = field.value;
    });
    self.model.save(values, {
        success: function(model, resp) {
          self.model = model;
          self.render();
          self.delegateEvents();
          // set the right heart and buttons
          if (WMB.theIncident) {
            WMB.showBrokenHeart();
          } else {
            WMB.showHeart();
          }
          // set the right bike
          $('#home_bike').attr('src', 'assets/bike_' + WMB.theBike.get('color') + '.png');
          // go to home view
          WMB.showView(WMB.theViews['home']);
        },
        error: function() {
          console.log("unable to save model");
        }
    });
    return false;
  }
  
  WMB.colorsArr = ['black', 'blue', 'green', 'orange', 'red', 'silver', 'white', 'yellow'];
  // set the current color in the picker to the saved bike color or default to black
  var pos = WMB.colorsArr.indexOf(WMB.theBike.get('color'))
  WMB.currentColor = pos > -1 ? pos : 0;
  WMB.colorDOMs = WMB.colorsArr.map(function (color) {
    var img = document.createElement('img');
    img.src = 'assets/bike_' + color + '.png';
    img.alt = color;
    $(img).addClass('bike');
    return img;
  });
  
  // custom render
  WMB.theBike.saveView.render = function() {
    var form = document.createElement('form');
    form.setAttribute('onsubmit', 'return false;');
    var model = this.model;
    
    // prep the main bike container
    var infoContainer = document.createElement('div');
    infoContainer.id = 'infoContainer';
    var infoTitle = document.createElement('h2');
    infoTitle.innerHTML = 'Register my bike';
    infoContainer.appendChild(infoTitle);
    var infoList = document.createElement('ul');
    $(infoList).addClass('listBubble');
    
    // prep the engraving container
    var engravingContainer = document.createElement('div');
    engravingContainer.id = 'engravingContainer';
    var engravingTitle = document.createElement('h2');
    
    engravingTitle.appendChild(document.createTextNode('Engraving '));
    var q = document.createElement('a');
    q.setAttribute('src', '#');
    q.addEventListener('click', function (event) {
      WMB.showView(WMB.theViews['engraving']);
    });
    q.innerHTML = '(?)';
    engravingTitle.appendChild(q);
    
    engravingContainer.appendChild(engravingTitle);
    var engravingList = document.createElement('ul');
    $(engravingList).addClass('listBubble');
    
    _.each(_.keys(model.attributes), function(attr) {
      // ignore frame, tag, and insurance numbers for now so that it fits into our form
      if (attr == 'manufacturer' || attr == 'model' /* || attr == 'frame' || attr == 'tag' || attr == 'insurance' */) {
        var li = document.createElement('li');
        
        var label = document.createElement('label');
        label.setAttribute('for', attr);
        label.innerHTML = WMB.capitalize(attr);
        li.appendChild(label);
        
        var input = document.createElement('input');
        input.setAttribute('name', attr);
        input.setAttribute('type', 'text');
        input.setAttribute('value', model.get(attr));
        li.appendChild(input);
        
        infoList.appendChild(li);
      }
      else if (attr == 'year') {
        var years = _.range(1970, (new Date().getFullYear() + 2)).reverse();
        
        var li = document.createElement('li');
        
        var label = document.createElement('label');
        label.setAttribute('for', attr);
        label.innerHTML = WMB.capitalize(attr);
        li.appendChild(label);
        
        var input = document.createElement('select');
        input.setAttribute('name', attr);
        var bikesYear = WMB.theBike.get('year');
        for (var k = 0; k < years.length; k++) {
          var year = years[k];
          var option = document.createElement('option');
          option.setAttribute('value', year);
          option.innerHTML = year;
          if (year == bikesYear) {
            // input.selectedIndex = k;
            option.setAttribute('selected', 'selected');
          }
          input.appendChild(option);
        }
        // years.forEach(function (year) {});
        li.appendChild(input);
        
        infoList.appendChild(li);
      }
      // else if color
      else if (attr == 'color') {
        var li = document.createElement('li');
        
        var colorContainer = document.createElement('div');
        colorContainer.id = 'bike_color_container';
        colorContainer.setAttribute('for', attr);
        var colorDiv = document.createElement('div');
        colorDiv.id = 'bike_color_picker';
        for (var k = 0; k < WMB.colorDOMs.length; k++) {
          colorDiv.appendChild(WMB.colorDOMs[k]);
        }
        colorContainer.appendChild(colorDiv); // document.createTextNode(WMB.capitalize(attr))
        li.appendChild(colorContainer);
        var input = document.createElement('input');
        input.id = 'bike_color_input';
        input.setAttribute('name', attr);
        input.setAttribute('type', 'hidden');
        input.setAttribute('value', model.get(attr));
        li.appendChild(input);
        
        infoList.appendChild(li);
      }
      // else if engraving
      else if (attr == 'engraving') {
        var li = document.createElement('li');
        
        var label = document.createElement('label');
        label.setAttribute('for', attr);
        label.innerHTML = WMB.capitalize(attr);
        li.appendChild(label);
        
        var input = document.createElement('input');
        input.setAttribute('name', attr);
        input.setAttribute('type', 'text');
        input.setAttribute('value', model.get(attr));
        li.appendChild(input);
        
        engravingList.appendChild(li);
      }
    });
    
    // now add the info container
    infoContainer.appendChild(infoList);
    form.appendChild(infoContainer);
    
    // now add the engraving container
    engravingContainer.appendChild(engravingList);
    form.appendChild(engravingContainer);
    
    var submit = document.createElement('input');
    submit.setAttribute('type', 'submit');
    submit.setAttribute('value', 'Save');
    // make sure our new save function gets called, not the old one
    submit.addEventListener('click', WMB.theBike.saveView.save);
    form.appendChild(submit);
    
    var oldForm = $('form', this.el)[0];
    if (this.el.children.length && oldForm){
      this.el.removeChild(oldForm);
      // this.el.replaceChild(oldForm, form);
    }
    this.el.appendChild(form);
    
    // $('#app').html(this.el);
    this.$('[name=title]').val(this.model.get('title')); // use val, for security reasons
  }
  
  WMB.theBike.saveView.render();
  
  WMB.showBikeColor = function showBikeColor(k) {
    if (k == 0) {
      $('#bike_color_picker').css('left', '60px');
    } else {
      $('#bike_color_picker').css('left',  (k * -168 + 60) + 'px');
    }
  }
  
  WMB.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  WMB.engravings = [
    {
      // subtract 1 from the normal months because the Date's months are zero-indexed
      'start': new Date(2011,05-1,04,10,30),
      'end': new Date(2011,05-1,04,15,30),
      'place': 'Koningsplein',
      'longitude': 4.889492690563202,
      'latitude': 52.36736862768112
    }, {
      'start': new Date(2011,05-1,11,10,30),
      'start': new Date(2011,05-1,11,15,30),
      'place': 'Museumplein',
      'longitude': 4.8798950761556625,
      'latitude': 52.35706886536736
    }, {
      'start': new Date(2011,05-1,18,10,30),
      'end': new Date(2011,05-1,18,15,30),
      'place': 'Osdorpplein',
      'longitude': 4.806998670101166,
      'latitude': 52.35969921225086
    }, {
      'start': new Date(2011,05-1,25,10,30),
      'end': new Date(2011,05-1,25,15,30),
      'place': 'Gulden Winckelplantsoen',
      'longitude': 4.847386032342911,
      'latitude': 52.3784523267057
    }, {
      'start': new Date(2011,06-1,01,10,30),
      'end': new Date(2011,06-1,01,15,30),
      'place': 'Zwanenburgwal',
      'longitude': 4.8989541828632355,
      'latitude': 52.36763148527381
    }, {
      'start': new Date(2011,06-1,08,10,30),
      'end': new Date(2011,06-1,08,15,30),
      'place': 'Javaplein',
      'longitude': 4.9398645758628845,
      'latitude': 52.36369992233441
    }, {
      'start': new Date(2011,06-1,15,10,30),
      'end': new Date(2011,06-1,15,15,30),
      'place': 'Heinekenplein',
      'longitude': 4.891131520271301,
      'latitude': 52.357052893609584
    }, {
      'start': new Date(2011,06-1,22,10,30),
      'end': new Date(2011,06-1,22,15,30),
      'place': 'Haarlemmerstraat',
      'longitude': 4.88929957151413,
      'latitude': 52.38142644728091
    }, {
      'start': new Date(2011,06-1,29,10,30),
      'end': new Date(2011,06-1,29,15,30),
      'place': 'Museumplein',
      'longitude': 4.8798950761556625,
      'latitude': 52.35706886536736
    }, {
      'start': new Date(2011,07-1,06,10,30),
      'end': new Date(2011,07-1,06,15,30),
      'place': 'Osdorpplein',
      'longitude': 4.806998670101166,
      'latitude': 52.35969921225086
    }
  ];
  
  WMB.theIncident = WMB.Incidents.filter(function (i) { return !i.get('found') && !i.get('givenUp'); })[0];
  
  WMB.showBrokenHeart = function showBrokenHeart() {
    $('#home_bike_container').css('background-image', 'url(assets/brokenheart.png)');
    $('#home_buttons_good').hide();
    $('#home_buttons_bad').show();
  }
  
  WMB.showHeart = function showHear() {
    $('#home_bike_container').css('background-image', 'url(assets/heart.png)');
    $('#home_buttons_bad').hide();
    $('#home_buttons_good').show();
  }
  
  // check AFAC
  WMB.theBike.checkAFAC = function checkAFAC() {
    var data = {id: 8, submit: 1, bikesearch_ref: 1};
    
    var tag = WMB.theBike.get('tag');
    var frameNumber = WMB.theBike.get('frame');
    var engraving = WMB.theBike.get('engraving');
    // get the police case number of the first open Incident, if it exists
    var policeNum = WMB.theIncident && !WMB.theIncident.get('found') && !WMB.theIncident.get('givenUp') ? WMB.theIncident.get('case') : null;
    // the police case number gets priority, then engraving, then frame, then tag
    if (policeNum) {
      data['invoer_nummer'] = policeNum;
      data['pvbnr'] = 1;
    } else if (engraving) {
      data['invoer_nummer'] = engraving;
      data['graveernr'] = 1;
    } else if (frameNumber) {
      data['invoer_nummer'] = frameNumber;
      data['framenr'] = 1;
    } else if (policeNum) {
      data['invoer_nummer'] = policeNum;
      data['pvbnr'] = 1;
    } else {
      // we don't have an ID to search with, so don't bother to try
      return false;
    }
    
    $.ajax({
      type: 'POST', // defaults to 'GET'
      // url: 'http://www.afac-amsterdam.nl/bikebase/page.php?category=item', // defaults to window.location
      url: 'http://labs.bubblefoundry.com/wheresmybike/ajax_proxy.php',
      data: data, // can be a string or object (objects are automatically serialized to JSON)
      dataType: 'json', // what response type you accept from the server ('json', 'xml', 'html', or 'text')
      success: function(successObj) {
        // not found
        if (!successObj || !successObj.success) {
          console.log("AFAC doesn't know about the bike.")
          $('#find_afac_indicator').html('<img src="assets/triangle.png" alt="Bike not found">');
          // $('#find_afac_indicator').html("&#x2717");
          // $('body').get(0).appendChild(document.createTextNode("AFAC doesn't know about the bike."))
        }
        // FOUND!
        else {
          console.log("AFAC has the bike!");
          $('#find_afac_indicator').html('<img src="assets/bike_found.png" alt="Bike found!">');
          // $('#find_afac_indicator').html("&#x2714");
          // $('body').get(0).appendChild(document.createTextNode("AFAC has the bike!"))
        }
      }, // body is a string (or if dataType is 'json', a parsed JSON object)
      error: function(xhr, type) {
        console.log('failure :-(')
        $('#find_afac_indicator').html("?");
      } // type is a string ('error' for HTTP errors, 'parsererror' for invalid JSON)
    })
  }
  
  // WMB.theBike.saveView.el.style.display = "none";
  document.getElementById("register_view").appendChild(WMB.theBike.saveView.el);
  
  // add listeners to the color picker
  WMB.picker = $('#bike_color_picker');
  WMB.bike_color_input = $('#bike_color_input');
  // throttle since we seem to get two at a time
  WMB.lastSwipeLeft = new Date;
  WMB.lastSwipeRight = new Date;
  WMB.swipeLeftFunc = function () {
    var now = new Date;
    // if the last swipe was more than 10 ms ago and it's not the end
    if (now - WMB.lastSwipeLeft > 10 && WMB.currentColor < WMB.colorsArr.length - 1) {
      WMB.currentColor += 1;
      WMB.bike_color_input.attr('value', WMB.colorsArr[WMB.currentColor]);
      WMB.showBikeColor(WMB.currentColor);
    }
    WMB.lastSwipeLeft = now;
  };
  WMB.picker.swipeLeft(WMB.swipeLeftFunc);
  WMB.swipeRightFunc = function () {
    var now = new Date;
    // if the last swipe was more than 10 ms ago and it's not the beginning
    if (now - WMB.lastSwipeRight > 10 && WMB.currentColor > 0) {
      WMB.currentColor -= 1;
      WMB.bike_color_input.attr('value', WMB.colorsArr[WMB.currentColor]);
      WMB.showBikeColor(WMB.currentColor);
    }
    WMB.lastSwipeRight = now;
  };
  WMB.picker.swipeRight(WMB.swipeRightFunc);
  
  WMB.previousView = null;
  // grab the DOM elements once
  WMB.theViews = {
    'first_register': $('#first_register_view'),
    'register': $('#register_view'),
    'home': $('#home_view'),
    'engraving': $('#engraving_view'),
    'find': $('#find_view'),
    'update_incident': $('#update_incident_view'),
    'police': $('#police_view')
  };
  // set edit button logic
  WMB.editButton = $('#edit_button');
  // set back button logic
  WMB.backButton = $('#back_button');
  // the magic happens here
  WMB.showView = function showView(view) {
    // since we're switching views, there's so reason to show the Add to Home image anymore
    $('footer img').hide();
    
    // make sure we're defaulting the color picker to the right color
    if (view.attr('id') == 'register_view') {
      var color = WMB.theBike.get('color');
      WMB.currentColor = WMB.colorsArr.indexOf(color);
      WMB.bike_color_input.attr('value', color);
      WMB.showBikeColor(WMB.currentColor);
      // add the listeners again because they seem to get lost somehow? Doesn't seem to work.
      // WMB.picker.swipeLeft(WMB.swipeLeftFunc);
      // WMB.picker.swipeRight(WMB.swipeRightFunc);
    }
    
    // hide previous view
    if (WMB.previousView) {
      WMB.previousView.toggleClass('selected');
    } else {
      // $('.page').toggleClass('selected');
      $('#first_register_view').toggleClass('selected');
    }
    view.toggleClass('selected');
    
    // show back and edit buttons if appropriate
    // if on edit view and already have a saved bike, show back button
    if (view.attr('id').indexOf('register') === 0 && !WMB.theBike.isNew()) {
      WMB.backButton.show();
      WMB.backButton.bind('click', function() {
        // save the bike
        WMB.theBike.saveView.save();
        // update home screen bike
        $('#home_bike').attr('src', 'assets/bike_' + WMB.theBike.get('color') + '.png');
        WMB.showView(WMB.theViews['home']);
      });
    }
    // else if on incident edit view 
    else if (view.attr('id').indexOf('update_incident') === 0) {
      WMB.backButton.show();
      WMB.backButton.bind('click', function() {
        WMB.showView(WMB.theViews['home']);
      });
    }
    // else if on engraving view 
    else if (view.attr('id').indexOf('engraving') === 0) {
      WMB.backButton.show();
      WMB.backButton.bind('click', function() {
        WMB.showView(WMB.theViews['register']);
      });
      // while I'm at it, add engraving times
      var now = new Date;
      var list = $('#engraving_times_list');
      // Work around iOS bug (yes, in-place filtering is a bug)
      var copy = WMB.engravings
      copy.filter(function (time) {
        return time.start >= now;
      });
      copy.sort(function (time1, time2) {
        if (time1 > time2) {
          return 1;
        }
        if (time1 > time2) {
          return -1;
        }
        return 0;
      });
      copy.forEach(function (time) {
        var item = document.createElement('li');
        
        var dateSpan = document.createElement('span');
        $(dateSpan).addClass('date');
        dateSpan.innerHTML = WMB.months[time.start.getMonth()] + ' ' + time.start.getDate();
        item.appendChild(dateSpan);
        
        var name = document.createElement('span');
        $(name).addClass('name');
        name.innerHTML = time.place;
        item.appendChild(name);
        
        var a = document.createElement('a');
        a.href = 'http://maps.google.com/?ll=' + time.latitude + ',' + time.longitude + '&q=' + time.latitude + ',' + time.longitude;
        var mapButton = document.createElement('button');
        $(mapButton).addClass('map');
        mapButton.innerHTML = 'Map';
        a.appendChild(mapButton);
        
        item.appendChild(a);
        list.append(item);
      });
    }
    // else if on police view 
    else if (view.attr('id').indexOf('police') === 0) {
      WMB.backButton.show();
      WMB.backButton.bind('click', function() {
        WMB.showView(WMB.theViews['find']);
      });
    }
    // else if on find view 
    else if (view.attr('id').indexOf('find') === 0) {
      // check AFAC
      WMB.theBike.checkAFAC();
      
      if (!WMB.theIncident) {
        // create new Incident
        WMB.theIncident = new WMB.Incident;
        WMB.theIncident.setBike(WMB.theBike);
        // NB setBike also saves the model so don't have to do it ourselves
        // broken heart
        WMB.showBrokenHeart();
      }
      
      WMB.backButton.show();
      WMB.backButton.bind('click', function() {
        WMB.showView(WMB.theViews['home']);
      });
    }
    else {
      WMB.backButton.hide();
    }
    
/*
    // if on home view, show edit button
    if (view.attr('id').indexOf('home') === 0) {
      WMB.editButton.show();
      WMB.editButton.bind('click', function() {
        WMB.showView(WMB.theViews['register']);
      });
    } else {
      // else hide
      WMB.editButton.hide();
    }
*/
    
    WMB.previousView = view;
    // make sure nothing happens
    return false;
  }
  
  WMB.bikeFound = function bikeFound() {
    WMB.theIncident.set({found: new Date});
    WMB.theIncident.save();
    // clear since no longer valid
    WMB.theIncident = null;
    WMB.showHeart();
    return false;
  }
  
  // don't show the first screen if already registered
  if (!WMB.theBike.isNew()) {
    // show the right color bike
    $('#home_bike').attr('src', 'assets/bike_' + WMB.theBike.get('color') + '.png');
    
    // if there are any incidents where the bike has not been found and the user has not given up, it's lost
    if (WMB.theIncident && !WMB.theIncident.get('found') && !WMB.theIncident.get('givenUp')) {
      // broken heart
      WMB.showBrokenHeart();
    }
    // else the bike isn't stolen!
    else {
      WMB.showHeart();
    }
    
    // $('#first_register_view').toggleClass('selected');
    WMB.showView(WMB.theViews['home']);
  }
  
  // WMB.theBike.checkAFAC();
  
})
