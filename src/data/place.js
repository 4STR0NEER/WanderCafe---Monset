// Everything about the place itself: photos, amenities, location, what's nearby.
// PLACEHOLDERS: photos are null until the owner sends them (drop files in public/place/ and set
// the path), and the amenities are assumed. Confirm both with the owner.

export const PHOTOS = {
  cafe: { src: null, label: "The cafe" },
  room: { src: null, label: "Your room" },
  morning: { src: null, label: "Morning coffee" },
  counter: { src: null, label: "The coffee bar" },
  seating: { src: null, label: "Cafe seating" },
  breakfast: { src: null, label: "Breakfast at Wander" },
  outside: { src: null, label: "Outside Wander" },
  bathroom: { src: null, label: "The bathroom" },
};

// ASSUMED AMENITIES: placeholders until the owner confirms.
export const AMENITIES = [
  { icon: "wifi", name: "Free Wi-Fi", note: "In the rooms and the cafe" },
  { icon: "snow", name: "Air-conditioned rooms", note: "Cool nights after a beach day" },
  { icon: "drop", name: "Hot & cold shower", note: "Private bathroom" },
  { icon: "coffee", name: "Breakfast at the cafe", note: "It's a B&B, after all" },
  { icon: "bed", name: "Fresh linens & towels", note: "Changed during longer stays" },
  { icon: "parking", name: "Free parking", note: "For cars and motorbikes" },
  { icon: "laptop", name: "Work-friendly cafe", note: "Tables, plugs and good coffee" },
  { icon: "waves", name: "Near the beach", note: "White Beach is just up the road" },
];

// The pin from the owner's Google Maps link (Saavedra, Moalboal, Cebu).
export const LOCATION = {
  lat: 9.9762108,
  lng: 123.3766666,
  area: "Saavedra, Moalboal, Cebu",
  mapsUrl:
    "https://www.google.com/maps/place/Mhera's+Store/@9.9762108,123.3766666,17z/data=!3m1!4b1!4m6!3m5!1s0x33abe62155535499:0x1a4d16d50b51453f!8m2!3d9.9762108!4d123.3766666!16s%2Fg%2F11js_24ghw",
};

// Coordinates from OpenStreetMap; distance is worked out from these (straight line, so roads are longer).
export const SPOTS = [
  { icon: "waves", name: "White Beach (Basdaku)", note: "Long white-sand beach up the road.", lat: 9.985907, lng: 123.368993 },
  { icon: "fish", name: "Panagsama Beach", note: "Moalboal's dive strip, home of the sardine run just off the shore.", lat: 9.944049, lng: 123.383912 },
  { icon: "pin", name: "Moalboal town", note: "Public market and the town centre.", lat: 9.937464, lng: 123.39337 },
  { icon: "fish", name: "Pescador Island", note: "Marine sanctuary, a short boat trip for snorkelling and diving.", lat: 9.92303, lng: 123.343459 },
  { icon: "drop", name: "Kawasan Falls, Badian", note: "Turquoise falls and canyoneering.", lat: 9.8031, lng: 123.3745 },
  { icon: "mountain", name: "Osmeña Peak", note: "Cebu's highest point, a classic sunrise hike.", lat: 9.82015, lng: 123.44235 },
];

// straight-line distance in km (haversine)
export function kmFrom(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
