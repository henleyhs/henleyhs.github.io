const imageUrl = 'https://www.henleyhs.sa.edu.au/wp-content/uploads/2024/02/2024-Henley-High-School-Site-Map.png';
const imageBounds = [[0, 0], [1357, 1920]]; // height, width

const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -1,
  maxZoom: 3
});

const overlay = L.imageOverlay(imageUrl, imageBounds).addTo(map);
map.fitBounds(imageBounds);

let roomMarkers = [];

fetch('rooms.json')
  .then(res => res.json())
  .then(data => {
    const markerMap = {}; // Map of room name to marker
    roomMarkers = data.map(room => {
      // Assign color based on house
      const colorMap = {
        "florey": "blue",
        "mawson": "green",
        "oliphant": "yellow",
        "lowitja": "#7b6ca8",
        "mitchell": "red",
        "loft": "lime",
        "stairs": "#d048b2",
        "slc": "#fc907c"
      };
      const houseKey = room.house?.toLowerCase() || "";
      const fillColor = colorMap[houseKey] || "lightgray";

      // Create marker
      const marker = L.circleMarker([room.y, room.x], {
        radius: 6,
        color: 'black',
        fillColor,
        fillOpacity: 1,
        weight: 2
      })
      .addTo(map)
      .bindPopup(`<strong>${room.name}</strong><br>House: ${room.house}`);

      marker.house = room.house;
      marker.roomName = room.name;
      marker.linkedTo = room.linkedTo;
      markerMap[room.name] = marker;

      return marker;
    });

    // Now handle linking after all markers are created
    roomMarkers.forEach(marker => {
      if (marker.linkedTo && markerMap[marker.linkedTo]) {
        marker.on('click', () => {
          const target = markerMap[marker.linkedTo];
          map.setView(target.getLatLng(), 2);
          target.openPopup();
        });
      }
    });
  });


document.getElementById("houseSelect").addEventListener("change", filterMarkers);
document.getElementById("roomSearch").addEventListener("input", filterMarkers);

function filterMarkers() {
  const selectedHouse = document.getElementById("houseSelect").value.toLowerCase();
  const searchRoom = document.getElementById("roomSearch").value.toLowerCase();
  let firstMatch = null;

  roomMarkers.forEach(marker => {
    const matchHouse = !selectedHouse || marker.house.toLowerCase() === selectedHouse;
    const matchRoom = !searchRoom || marker.roomName.toLowerCase().includes(searchRoom);

    if (matchHouse && matchRoom) {
      marker.addTo(map);
      if (!firstMatch) firstMatch = marker; // capture first match
    } else {
      map.removeLayer(marker);
    }
  });

  if (firstMatch) {
    map.setView(firstMatch.getLatLng(), 2); // zoom to match
    firstMatch.openPopup(); // show popup
  }
}

// 🛠️ Mini coordinate tool
const coordDisplay = document.createElement('div');
coordDisplay.id = 'coordDisplay';
coordDisplay.style.position = 'absolute';
coordDisplay.style.bottom = '10px';
coordDisplay.style.right = '10px';
coordDisplay.style.background = 'rgba(0,0,0,0.7)';
coordDisplay.style.color = 'white';
coordDisplay.style.padding = '8px 12px';
coordDisplay.style.borderRadius = '6px';
coordDisplay.style.fontFamily = 'monospace';
coordDisplay.style.zIndex = 1000;
coordDisplay.innerText = 'X: -, Y: -';
document.body.appendChild(coordDisplay);

map.on('click', function (e) {
  const x = e.latlng.lng.toFixed(0);
  const y = e.latlng.lat.toFixed(0);
  coordDisplay.innerText = `X: ${x}, Y: ${y}`;
});

function closeWelcome() {
  document.getElementById('welcomePopup').style.display = 'none';
}
