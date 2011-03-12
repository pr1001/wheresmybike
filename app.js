var WMB = WMB ? WMB : {};

// Load the application once the DOM is ready, using jQuery.ready:
$(function(){

  WMB.toRad = function toRad() {
    return this * Math.PI / 180;
  }

  WMB.Haversine = function Haversine(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = WMB.toRad(lat2 - lat1);
    var dLon = WMB.toRad(lon2 - lon1); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(WMB.toRad(lat1)) * Math.cos(WMB.toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
  }
  
  WMB.SphericalCos = function SphericalCos(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var d = Math.acos(Math.sin(lat1)*Math.sin(lat2) + Math.cos(lat1)*Math.cos(lat2) * Math.cos(lon2-lon1)) * R;
    return d;
  }
  
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /* Vincenty Inverse Solution of Geodesics on the Ellipsoid (c) Chris Veness 2002-2010             */
  /*                                                                                                */
  /* from: Vincenty inverse formula - T Vincenty, "Direct and Inverse Solutions of Geodesics on the */
  /*       Ellipsoid with application of nested equations", Survey Review, vol XXII no 176, 1975    */
  /*       http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf                                             */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /**
   * Calculates geodetic distance between two points specified by latitude/longitude using 
   * Vincenty inverse formula for ellipsoids
   *
   * @param   {Number} lat1, lon1: first point in decimal degrees
   * @param   {Number} lat2, lon2: second point in decimal degrees
   * @returns (Number} distance in metres between points
   */
  WMB.Vincenty = function Vincenty(lat1, lon1, lat2, lon2) {
    var a = 6378137, b = 6356752.314245,  f = 1/298.257223563;  // WGS-84 ellipsoid params
    var L = WMB.toRad(lon2 - lon1);
    var U1 = Math.atan((1-f) * Math.tan(WMB.toRad(lat1)));
    var U2 = Math.atan((1-f) * Math.tan(WMB.toRad(lat2)));
    var sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
    var sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);
    
    var lambda = L, lambdaP, iterLimit = 100;
    do {
      var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
      var sinSigma = Math.sqrt((cosU2*sinLambda) * (cosU2*sinLambda) + 
        (cosU1*sinU2-sinU1*cosU2*cosLambda) * (cosU1*sinU2-sinU1*cosU2*cosLambda));
      if (sinSigma==0) return 0;  // co-incident points
      var cosSigma = sinU1*sinU2 + cosU1*cosU2*cosLambda;
      var sigma = Math.atan2(sinSigma, cosSigma);
      var sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
      var cosSqAlpha = 1 - sinAlpha*sinAlpha;
      var cos2SigmaM = cosSigma - 2*sinU1*sinU2/cosSqAlpha;
      if (isNaN(cos2SigmaM)) cos2SigmaM = 0;  // equatorial line: cosSqAlpha=0 (§6)
      var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha));
      lambdaP = lambda;
      lambda = L + (1-C) * f * sinAlpha *
        (sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));
    } while (Math.abs(lambda-lambdaP) > 1e-12 && --iterLimit>0);
  
    if (iterLimit==0) return NaN  // formula failed to converge
  
    var uSq = cosSqAlpha * (a*a - b*b) / (b*b);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
    var deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-
      B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
    var s = b*A*(sigma-deltaSigma);
    
    s = s.toFixed(3); // round to 1mm precision
    return s;
    // note: to return initial/final bearings in addition to distance, use something like:
    // var fwdAz = Math.atan2(cosU2*sinLambda,  cosU1*sinU2-sinU1*cosU2*cosLambda);
    // var revAz = Math.atan2(cosU1*sinLambda, -sinU1*cosU2+cosU1*sinU2*cosLambda);
    // return { distance: s, initialBearing: fwdAz.toDeg(), finalBearing: revAz.toDeg() };
  }
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  
  // 52.36935,4.87057; 52.371918,4.871128
  
  var article = $('article')[0];
  if (WMB.Bikes.length == 0) {
    var firstBike = new WMB.Bike();
    article.appendChild(firstBike.saveView.el);
  } else {
    article.appendChild(WMB.Bikes.view.el);
  }
})
