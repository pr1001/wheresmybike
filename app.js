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
  
  // custom render
  WMB.theBike.saveView.render = function() {
    // var out = '<form>';
    // out += "<label for='title'>Title</label>";
    // out += "<input name='title' type='text' />";
    // out += "<label for='body'>Body</label>";
    // out += "<textarea name='body'>" + (this.model.escape('body') || '') + "</textarea>";
    // var submitText = this.model.isNew() ? 'Create' : 'Save';
    // out += "<button>" + submitText + "</button>";
    // out += "</form>";
    
    var colorsArr = ['black', 'blue', 'green', 'orange', 'red', 'silver', 'white', 'yellow'];
    // FIXME: Update library to support a two-way circular linked list
    WMB.colors = new CircularLinkedList();
    colorsArr.forEach(function (color) {
      var img = document.createElement('img');
      img.src = 'assets/bike_' + color + '.png';
      img.alt = color;
      WMB.colors.append(new SingleOneWayPointer(img));
    });
    
    var form = document.createElement('form');
    form.setAttribute('onsubmit', 'return false;');
    var model = this.model;
    _.each(_.keys(model.attributes), function(attr) {
      if (attr != 'color' && attr != 'id' && attr != 'cid') {
        var label = document.createElement('label');
        label.setAttribute('for', attr);
        label.appendChild(document.createTextNode(WMB.capitalize(attr)));
        form.appendChild(label);
        var input = document.createElement('input');
        input.setAttribute('name', attr);
        input.setAttribute('type', 'text');
        input.setAttribute('value', model.get(attr));
        form.appendChild(input);
      } else if (attr == 'color') {
        var label = document.createElement('label');
        label.setAttribute('for', attr);
        var colorDiv = document.createElement('div');
        // var img = document.createElement('img');
        // img.src = 'apple-touch-icon.png';
        // img.alt = '';
        // colorDiv.appendChild(img);
        // FIXME: Have it track current position so we don't need to increment like this
        for (var k = 0; k < WMB.colors.length; k++, WMB.colors.next()) {
          colorDiv.appendChild(WMB.colors.current().value);
        }
        // increment the linked list one more time to return to the beginning
        WMB.colors.next();
        label.appendChild(colorDiv); // document.createTextNode(WMB.capitalize(attr))
        form.appendChild(label);
        var input = document.createElement('input');
        input.setAttribute('name', attr);
        input.setAttribute('type', 'hidden');
        input.setAttribute('value', model.get(attr));
        form.appendChild(input);
      }
    });
    var submit = document.createElement('input');
    submit.setAttribute('type', 'submit');
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
  
  // WMB.theBike.saveView.el.style.display = "none";
  document.getElementById("register_view").appendChild(WMB.theBike.saveView.el);
  
  // don't show the first screen if already registered
  if (!WMB.theBike.isNew()) {
    // show the right color bike
    $('#home_bike').attr('src', 'assets/bike_' + WMB.theBike.get('color') + '.png');
    
    // if there are any incidents where the bike has not been found and the user has not given up, it's lost
    if (WMB.Incidents.any(function (incident) { return !incident.get('found') && !incident.get('givenUp'); })) {
      // broken heart
      $('#home_view').css('background-image', 'url(assets/brokenheart.png)');
    }
    // else the bike isn't stolen!
    else {
      $('#home_view').css('background-image', 'url(assets/heart.png)');
    }
    
    $('#first_register_view').toggleClass('selected');
    $('#home_view').toggleClass('selected');
  }
  
})
