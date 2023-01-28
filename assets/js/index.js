// Display current date on Home screen
// setTimeout used as html page needs to load before javascript runs
function today() {
  const theDay = new Date();
  document.getElementById("timings").innerHTML = theDay.toDateString();
  setTimeout(function () {
    today()
  }, 500);
};