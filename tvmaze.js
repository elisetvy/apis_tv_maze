"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL = 'https://api.tvmaze.com/';
const SEARCH_END_POINT = 'search/shows?';
const MISSING_IMAGE_URL = 'https://tinyurl.com/tv-missing';
// const BASE_URL_EPISODES = `https://api.tvmaze.com/shows/${}/episodes`;


/** Given a search term, search for tv shows that match that query.
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const params = new URLSearchParams({ q: term });
  const response = await fetch(`${BASE_URL}${SEARCH_END_POINT}${params}`);

  const data = await response.json();
  return data.map(tvShowObj => tvShowObj = {
    id: tvShowObj.show.id,
    name: tvShowObj.show.name,
    summary: tvShowObj.show.summary,
    image: tvShowObj.show.image?.original || MISSING_IMAGE_URL
  });

  // return [
  //   {
  //     id: 1767,
  //     name: "The Bletchley Circle",
  //     summary:
  //       `<p><b>The Bletchley Circle</b> follows the journey of four ordinary
  //          women with extraordinary skills that helped to end World War II.</p>
  //        <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their
  //          normal lives, modestly setting aside the part they played in
  //          producing crucial intelligence, which helped the Allies to victory
  //          and shortened the war. When Susan discovers a hidden code behind an
  //          unsolved murder she is met by skepticism from the police. She
  //          quickly realises she can only begin to crack the murders and bring
  //          the culprit to justice with her former friends.</p>`,
  //     image:
  //       "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
  //   }
  // ];
}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);
    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

/** Submits form information  */
async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
}

$searchForm.on("submit", handleSearchForm);


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await fetch(`${BASE_URL}shows/${id}/episodes`);
  const data = await response.json();
  //console.log(data, "epi objs")
  return data.map(episodeObj => episodeObj = {
    id: episodeObj.id,
    name: episodeObj.name,
    season: episodeObj.season,
    number: episodeObj.number
  });
}
/**Controller function for getting episodes and displaying them */
async function getEpisodesAndDisplay(target) {
  // console.log(target, "target");
  const showID = $(target).closest('.Show').attr('data-show-id');
  // console.log("showid", showID);
  // parentElement.parentElement.parentElement.data('data-show-id');
  const episodes = await getEpisodesOfShow(showID);
  displayEpisodes(episodes);
}

/** */
function displayEpisodes(episodes) {
  $("#episodesList").empty();
  // console.log(episodes, "epi array")
  for (const episode of episodes) {
    // console.log(episode, "episode")
    // console.log($("#episodesList"))
    $("#episodesList").append(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
  }
  $episodesArea.show();
}

// add other functions that will be useful / match our structure & design

$showsList.on('click', '.Show-getEpisodes', async function (e) {
  e.preventDefault();
  // Call controller func
  await getEpisodesAndDisplay(e.target);
});
