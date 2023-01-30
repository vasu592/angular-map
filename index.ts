/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// This example adds hide() and show() methods to a custom overlay's prototype.
// These methods toggle the visibility of the container <div>.
// overlay to or from the map.

function initMap(): void {
  const map = new google.maps.Map(
    document.getElementById('map') as HTMLElement,
    {
      zoom: 19,
      center: { lat: 18.5314, lng: 73.870999 },
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      styles: [
        {
          featureType: 'all',
          elementType: 'labels',
          stylers: [
            {
              visibility: 'on',
            },
          ],
        },
      ],
    }
  );
  // new google.maps.Marker({
  //   position: { lat: 18.5314, lng: 73.870999 },
  //   map,
  //   title: 'Center',
  // });
  const bounds = new google.maps.LatLngBounds(
    //  new google.maps.LatLng(18.530800,73.870275),  //nw
    //  new google.maps.LatLng(18.531794,73.871769)  //sw
    //18.53080033434548, Lng: 73.87040607842121
    // Lat: 18.530779982443512, Lng: 73.8704110597512
    new google.maps.LatLng(18.53080033434548, 73.87040607842121),
    new google.maps.LatLng(18.5318033131496, 73.87135204793677) //nw
    //sw
  );

  // new google.maps.Marker({
  //   position: { lat: 18.531787282433953, lng: 73.87032416561956 },
  //   map,
  //   title: 'South West',
  // });
  new google.maps.Marker({
    position: { lat: 18.5318033131496, lng: 73.87135204793677 },
    map,
    title: 'North East',
  });
  new google.maps.Marker({
    position: { lat: 18.53080033434548, lng: 73.87040607842121 },
    map,
    title: 'South West',
  });
  // new google.maps.Marker({
  //   position: { lat: 18.53090481419091, lng: 73.87157357369628 },
  //   map,
  //   title: 'North East',
  // });

  new google.maps.Marker({
    position: { lat: 18.531564697349456, lng: 73.870564169134 },
    map,
    title: 'South West',
  });
  new google.maps.Marker({
    position: { lat: 18.530923826643022, lng: 73.87064731761212 },
    map,
    title: 'North East',
  });

  // The photograph is courtesy of the U.S. Geological Survey.
  let image = 'https://staging.viaviedge.net:9200/Pune1.png';

  /**
   * The custom USGSOverlay object contains the USGS image,
   * the bounds of the image, and a reference to the map.
   */
  class USGSOverlay extends google.maps.OverlayView {
    private bounds: google.maps.LatLngBounds;
    private image: string;
    private div?: HTMLElement;

    constructor(bounds: google.maps.LatLngBounds, image: string) {
      super();

      this.bounds = bounds;
      this.image = image;
    }

    /**
     * onAdd is called when the map's panes are ready and the overlay has been
     * added to the map.
     */
    onAdd() {
      this.div = document.createElement('div');
      // this.div.style.borderStyle = 'block';
      this.div.style.borderColor = 'red';
      this.div.style.borderWidth = '10px';
      this.div.style.position = 'absolute';

      // Create the img element and attach it to the div.
      const img = document.createElement('img');

      img.src = this.image;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.position = 'absolute';
      this.div.appendChild(img);

      // Add the element to the "overlayLayer" pane.
      const panes = this.getPanes()!;

      panes.overlayLayer.appendChild(this.div);
    }

    draw() {
      // We use the south-west and north-east
      // coordinates of the overlay to peg it to the correct position and size.
      // To do this, we need to retrieve the projection from the overlay.
      const overlayProjection = this.getProjection();

      // Retrieve the south-west and north-east coordinates of this overlay
      // in LatLngs and convert them to pixel coordinates.
      // We'll use these coordinates to resize the div.
      const sw = overlayProjection.fromLatLngToDivPixel(
        this.bounds.getSouthWest()
      )!;
      const ne = overlayProjection.fromLatLngToDivPixel(
        this.bounds.getNorthEast()
      )!;

      // Resize the image's div to fit the indicated dimensions.
      if (this.div) {
        this.div.style.left = sw.x + 'px';
        this.div.style.top = ne.y + 'px';
        this.div.style.width = ne.x - sw.x + 'px';
        this.div.style.height = sw.y - ne.y + 'px';
      }
    }

    /**
     * The onRemove() method will be called automatically from the API if
     * we ever set the overlay's map property to 'null'.
     */
    onRemove() {
      if (this.div) {
        (this.div.parentNode as HTMLElement).removeChild(this.div);
        delete this.div;
      }
    }

    /**
     *  Set the visibility to 'hidden' or 'visible'.
     */
    hide() {
      if (this.div) {
        this.div.style.visibility = 'hidden';
      }
    }

    show() {
      if (this.div) {
        this.div.style.visibility = 'visible';
      }
    }

    toggle() {
      if (this.div) {
        if (this.div.style.visibility === 'hidden') {
          this.show();
        } else {
          this.hide();
        }
      }
    }

    toggleDOM(map: google.maps.Map) {
      if (this.getMap()) {
        this.setMap(null);
      } else {
        this.setMap(map);
      }
    }
  }

  const overlay: USGSOverlay = new USGSOverlay(bounds, image);

  overlay.setMap(map);

  const toggleButton = document.createElement('button');

  toggleButton.textContent = 'Toggle';
  toggleButton.classList.add('custom-map-control-button');

  const toggleDOMButton = document.createElement('button');

  toggleDOMButton.textContent = 'Toggle DOM Attachment';
  toggleDOMButton.classList.add('custom-map-control-button');

  toggleButton.addEventListener('click', () => {
    overlay.toggle();
  });

  toggleDOMButton.addEventListener('click', () => {
    overlay.toggleDOM(map);
  });

  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleDOMButton);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleButton);

  google.maps.event.addListener(map, 'click', function (event) {
    console.log('x and y values', event);

    //   var data = [

    //     // { lat: 18.531288682179742, lng: 73.87084653318132 },

    //     { lat: 18.53129613595078, lng: 73.87088854244544 },

    //     { lat: 18.531314515575705, lng: 73.87099212954438 },

    //     { lat: 18.531370905269164, lng: 73.87106873727714 },

    //     { lat: 18.531534696996527, lng: 73.87100616753648 },

    //     { lat: 18.531507328857842, lng: 73.87084694552348 },

    //     { lat: 18.531489425097902, lng: 73.87066873236286 },

    //     { lat: 18.53160361800068, lng: 73.87087133432071 }

    //         ]
    //   for (var i = 0; i < data.length; i++) {

    //       new google.maps.Marker({
    //         icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    //         position: { lat: data[i].lat, lng: data[i].lng },
    //         map,

    //       });

    //   }
    var pixelLatLng1 = overlay
      .getProjection()
      .fromContainerPixelToLatLng(
        new google.maps.Point(event.pixel.x, event.pixel.y)
      );
    // if (pixelLatLng1) {
    //   new google.maps.Marker({
    //     position: { lat: pixelLatLng1.lat(), lng: pixelLatLng1.lng() },
    //     map,
    //     title: 'Hello World!',
    //   });
    // }
    var msg1 =
      ': Container setting marker at Lat: ' +
      pixelLatLng1.lat() +
      ', Lng: ' +
      pixelLatLng1.lng();
    console.log(msg1);
  });
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
export {};
