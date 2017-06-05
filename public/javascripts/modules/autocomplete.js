export default function autocomplete(addressInput, inputLat, inputLong) {
  if (!addressInput) { return }

  const dropdown = new google.maps.places.Autocomplete(addressInput)

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace()
    inputLat.value = place.geometry.location.lat()
    inputLong.value = place.geometry.location.lng()
  })

  addressInput.on('keydown', (e) => {
    if (e.keyCode === 13) e.preventDefault()
  })
}
