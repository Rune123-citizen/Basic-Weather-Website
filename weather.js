const cityInput=document.querySelector('.city-input')
const serachBtn=document.querySelector('.search-btn')
const weatherinfo=document.querySelector('.weather-info')
const notfound = document.querySelector('.not-found')
const searchcitysection=document.querySelector('.search-city')
const countrytxt=document.querySelector('.country-txt')
const temptxt=document.querySelector('.temp-text')
const conditiontxt=document.querySelector('.condition-text')
const humiditytxt= document.querySelector('.humidity-value-txt')
const windtxt=document.querySelector('.Wind-value-txt')
const weathersummaryimg=document.querySelector('.weather-summary-img')
const currentdatetxt=document.querySelector('.current-date-txt')
const forecastitemcontainer=document.querySelector('.forecast-items-container')
const sunriseTxt = document.getElementById('SRvalue');
const sunsetTxt = document.getElementById('SSvalue');
const uvIndexTxt = document.getElementById('UVvalue');
const unitToggle=document.querySelector('.unit-toggle');
let currentUnit='°C';
let map;
let marker;
const apiid='2ca3762eb60aede2ad3c2c25596e9aff'

  
document.getElementById("get-location-btn").addEventListener("click", () => {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
          initMap(position.coords.latitude, position.coords.longitude);
      });
  } else {
      alert("Geolocation is not supported by this browser.");
  }
});


function initMap(lat = 20, lon = 78) {
  map = new google.maps.Map(document.getElementById("map"), {
      center: { lat, lng: lon },
      zoom: 6
  });
  
  marker = new google.maps.Marker({
      position: { lat, lng: lon },
      map,
      draggable: true
  });
  
  google.maps.event.addListener(marker, 'dragend', function () {
      const position = marker.getPosition();
      updateWeatherInfo(position.lat(), position.lng());
  });
}


serachBtn.addEventListener('click',() => {
    if(cityInput.value.trim() != ''){
       updateWeatherinfo(cityInput.value)
         cityInput.value= ''
    cityInput.blur()
    }
})
cityInput.addEventListener('keydown' ,(event) =>{
    if (event.key == 'Enter' &&
        cityInput.value.trim() != ''
    ){
       updateWeatherinfo(cityInput.value)
         cityInput.value= ''
    cityInput.blur()
    }
})


unitToggle.addEventListener('change',() =>{
  currentUnit=unitToggle.value;
  updateTemperature();
})

function convert(temp,unit){
  return unit =='°F'?  (temp*9/5)+32:temp;
}

async function updateTemperature(){
   let TempCelsius=parseFloat(temptxt.dataset.celsius);
   let convertedtemp=convert(TempCelsius,currentUnit);
   temptxt.textContent=Math.round(convertedtemp)+`${currentUnit}`;
}

async function getFetchData(endPoint, city){
  const apiurl=`https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiid}&units=metric`
  const response = await fetch(apiurl)
  return response.json()
}


async function getUVIndex(lat,lon){
  const apiurl=`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiid}`;
  const response=await fetch(apiurl);
   return (await response.json()).value;
}
 function getweathericon(id,isNight){
      if(id <= 232) return isNight?'night_thunderstorm.svg':'thunderstorm.svg'
      if(id <= 321) return isNight?   'night_drizzle.png' :'drizzle.svg'
      if(id <= 531) return isNight? 'rainy_night_10961126':'rain.svg'
      if(id <= 622) return isNight? 'night_snow.png':'snow.svg'
      if(id <= 781) return isNight?'atmosphere_night.png':'atmosphere.svg'
      if(id <= 800) return isNight?'clear_moon.png':'clear.svg'
      else return isNight?'cloud_night.png':'clouds.svg'

    }

    function getcurrentdate(){
      const currentdate= new Date()
      const options={
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      }
      return  currentdate.toLocaleDateString('en-GB', options) 
       }
async function updateWeatherinfo(city){
   const weatherdata = await getFetchData('weather',city)

   if(weatherdata.cod != 200){
    showdisplaysection(notfound)
    return
   }
   console.log(weatherdata)

   const{
       name: country,
       main: {temp,humidity},
       weather: [{ id, main}],
       wind: { speed },
       sys:{sunrise,sunset},
       coord:{lat,lon}
   }= weatherdata

  const currentTime=Math.floor(new Date().getTime()/1000);
   const isNight=currentTime<=sunrise||currentTime>=sunset;
countrytxt.textContent = country 
temptxt.dataset.celsius=temp;
updateTemperature();
humiditytxt.textContent=humidity + '%'
conditiontxt.textContent= main
windtxt.textContent = speed + ' m/s'
currentdatetxt.textContent= getcurrentdate()
sunriseTxt.textContent = new Date(sunrise * 1000).toLocaleTimeString();
    sunsetTxt.textContent = new Date(sunset * 1000).toLocaleTimeString();
 uvIndexTxt.textContent=await getUVIndex(lat,lon);
 weathersummaryimg.src =`weather/images/${getweathericon(id,isNight)}`

 await updateforecastinfo(city)
   
   showdisplaysection(weatherinfo)
}

async function updateforecastinfo(city){
    const forecastdata= await getFetchData('forecast', city)
    const timetaken= '12:00:00'
    const todaydate= new Date().toISOString().split('T')[0]
    forecastitemcontainer.innerHTML= ''
    forecastdata.list.forEach(forecastweather =>{
      if(forecastweather.dt_txt.includes(timetaken) &&
       !forecastweather.dt_txt.includes(todaydate)){
               updateforecastitems(forecastweather)
      }
    })
}

function updateforecastitems(weatherdata){

  const {
     dt_txt: date,
    weather: [{id}],
    main: { temp}
  }=weatherdata


  const datetaken= new Date(date)
    const hour=datetaken.getHours();
    const isNight=hour>=18||hour<6;
  const dateoption= {
     day: '2-digit',
     month: 'short'
  }

  const dateresult= datetaken.toLocaleDateString('en-GB', dateoption)

  const forecastitem=`
     <div class="forecast-item">
            <h5 class="forecast-item-data">${dateresult}</h5>
            <img src="weather/images/${getweathericon(id,isNight)}" alt="" class="forecast-item-img">
            <h5 class="forecasst-item-temp">${Math.round(temp)} °C</h5>
      </div>
  `

  forecastitemcontainer.insertAdjacentHTML('beforeend',forecastitem)
}

function showdisplaysection(section){
[weatherinfo,searchcitysection,notfound]
.forEach(section => section.style.display = 'none')
section.style.display = 'flex'
}