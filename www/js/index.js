// document.addEventListener('deviceready', initApp, false);
document.addEventListener('DOMContentLoaded', initApp, false);

document.querySelector('#search').addEventListener('click', manualSearch, false);

function initApp() {

    if(localStorage.getItem('currentCity')){

        let localStorageCurrentCity = JSON.parse(localStorage.getItem('currentCity'));
        HourlyForecasts(localStorageCurrentCity.locationID);
        getDailyData(localStorageCurrentCity.locationName, localStorageCurrentCity.locationID);

    }else{
        manualSearch();
    }

}

function manualSearch(){
    let locationSet = prompt("Podaj miasto");
    getLocationId(locationSet);
}

/*
* Api key
* Mon, 09/13/2021 - 09:48
* */
const apiKey = "REbrQWfyZSKqEjP5G5XcSaLj7RYdEqrk";
let locationKey = [];
let citySearchResult = [];

//id of localization
function getLocationId(locationName){

    //Clear search result
    locationKey = [];

    if(locationName != undefined && locationName.length > 0){

        let create_url = `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${locationName}`;

        fetch(create_url)
            .then(response =>{
                return response.json();
            })
            .then(data => {

                if(data.length != 0){
                    for(let x = 0; x<data.length; x++){
                        locationKey.push(data[x]);
                    }
                }else{
                    console.log(`Brak wyników dla miejscowości ${locationName}`);
                }

                createLocationList();

            });

    }else{
        return false;
    }

}

//list of result
function createLocationList(){

    let localization = [];

    document.querySelector('.result').innerHTML = "";

    for(let x = 0; x<locationKey.length; x++){
        localization['LocalizedName'] = locationKey[x].LocalizedName;
        localization['AdministrativeArea'] = locationKey[x].AdministrativeArea.LocalizedName;
        localization['LocalizedKey'] = locationKey[x].Key;

        let localization_list = document.createElement("li");
        let localization_dataInnerHtml = document.createTextNode(x+' - '+localization['LocalizedName']+' : '+localization['AdministrativeArea']);
        localization_list.appendChild(localization_dataInnerHtml);
        localization_list.setAttribute("class", 'single-localization');
        localization_list.setAttribute("onclick", `getDailyData('${localization['LocalizedName']}','${localization['LocalizedKey']}')`);
        document.querySelector('.result').appendChild(localization_list);

        //console.log(localization);
    }


}

//get 5 days data result
function getDailyData(locationName,locationID){

    HourlyForecasts(locationID);
    $('.result').html('');
    $('#app-result-city').html(locationName);

    let create_url = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationID}?apikey=${apiKey}`;

    fetch(create_url)
        .then(response =>{
            return response.json();
        })
        .then(data => {

            $('#app-weather-temp-min').html(`${temperatureConvert(data.DailyForecasts[0].Temperature.Minimum.Value)}°C`);
            $('#app-weather-temp-max').html(`${temperatureConvert(data.DailyForecasts[0].Temperature.Maximum.Value)}°C`);

            let DailyForecasts = [];

            for(let x = 0; x<data.DailyForecasts.length; x++){

                DailyForecasts['Date'] = data.DailyForecasts[x].Date;
                DailyForecasts['Day_Icon'] = data.DailyForecasts[x].Day.Icon;
                DailyForecasts['Day_IconPhrase'] = data.DailyForecasts[x].Day.IconPhrase;
                DailyForecasts['Day_HasPrecipitation'] = data.DailyForecasts[x].Day.HasPrecipitation;
                DailyForecasts['Night_Icon'] = data.DailyForecasts[x].Night.Icon;
                DailyForecasts['Night_IconPhrase'] = data.DailyForecasts[x].Night.IconPhrase;
                DailyForecasts['Night_HasPrecipitation'] = data.DailyForecasts[x].Night.HasPrecipitation;
                DailyForecasts['Temperature_Maximum'] = data.DailyForecasts[x].Temperature.Maximum.Value;
                DailyForecasts['Temperature_Minimum'] = data.DailyForecasts[x].Temperature.Minimum.Value
                //console.log(DailyForecasts);
            }

            let currentCityData = {

                "locationName"  : locationName,
                "locationID"    : locationID

            };

            localStorage.setItem('currentCity',JSON.stringify(currentCityData));

            //console.log('Zakończono');

        });

}

//12 Hours of Hourly Forecasts
function HourlyForecasts(locationID){

    let create_url = `http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${locationID}?apikey=${apiKey}`;
    let dailyWeather = '';

    fetch(create_url)
        .then(response =>{
            return response.json();
        })
        .then(data =>{

            console.log(data);

            if(data[0].IsDaylight){
                $('body').addClass('day-mode');
                $('body').removeClass('night-mode');
            }else{
                $('body').addClass('night-mode');
                $('body').removeClass('day-mode');
            }

            $('.app-weather-icon img').attr('src',`img/weather-icon/${data[0].WeatherIcon}.png`);
            $('#app-weather-degrees').html(`${temperatureConvert(data[0].Temperature.Value)}°C`);
            $('#app-result-date').html(`
            ${TranslateToMonth(ConvertUTC(data[0].EpochDateTime).getMonth())}
            ${ConvertUTC(data[0].EpochDateTime).getDate()},
            ${ConvertUTC(data[0].EpochDateTime).getFullYear()}
            `);

            for(let x=0; x<data.length; x++){

                console.log('12 hour loop')

                dailyWeather += `
                         <div class="app-wd-item">
                            <div class="app-wi-icon">
                                <img src="img/weather-icon/${data[x].WeatherIcon}.png">
                            </div>
                            <div class="app-wi-description">
                                <span class="app-wi-time">${(ConvertUTC(data[x].EpochDateTime).getHours()) < 10 ? `0`+ConvertUTC(data[x].EpochDateTime).getHours():ConvertUTC(data[x].EpochDateTime).getHours()}:00</span>
                                <span class="app-wi-degree">${temperatureConvert(data[x].Temperature.Value)}°C</span>
                            </div>
                        </div>                
                `;
            }

            $('.app-wd-slider').html(dailyWeather);

    });


}