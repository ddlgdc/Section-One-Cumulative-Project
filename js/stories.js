"use strict";

let storyList;

function addStoryToPage(story, isUserLoggedIn) {
  const newStory = document.createElement('li');
  newStory.innerHTML = `
    <p><a href="${story.url}" target="_blank">${story.title}</a> (${story.getHostName()})
    <button class="favorite-button">${story.isFavorited ? 'Unfavorite' : 'Favorite'}</button></p>
    <small>Author: ${story.author}, Created by: ${story.username}</small>`;

  if (isUserLoggedIn) {
    const favoriteButton = newStory.querySelector('.favorite-button');
    favoriteButton.addEventListener('click', () => {
      story.isFavorited = !story.isFavorited;
      favoriteButton.innerText = story.isFavorited ? 'Unfavorite' : 'Favorite';

      updateLocalStorage(story);
    });

  }

  document.getElementById('all-stories-list').appendChild(newStory);
}

function updateLocalStorage(story) {
  const favorites = JSON.parse(localStorage.getItem('favorite')) || [];
  const index = favorites.findIndex((favorite) => favorite.storyId === story.storyId);

  if (story.isFavorited) {
    if (!favorites.includes(story.storyId)) {
      favorites.push(story.storyId);
    }
  } else {
    const index = favorites.indexOf(story.storyId);
    if (index !== -1) {
      favorites.splice(index, 1);
    }
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadFavoritesFromLocalStorage() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  for (let story of storyList.stories) {
    story.isFavorited = favorites.includes(story.storyId);
  }
}

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  loadFavoritesFromLocalStorage();
  putStoriesOnPage();
}

function generateStoryMarkup(story, isUserLoggedIn) {
  const hostName = story.getHostName();
  const $story = $(`
    <li id="${story.storyId}">
      <a href="${story.url}" target="_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);

  if (isUserLoggedIn) {
    $story.append('<button class="favorite-button">Favorite</button>');
    $story.append('<button class="remove-button">Remove</button>');
  }

  return $story;
}

function putStoriesOnPage() {
  $allStoriesList.empty();

  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story, true);
    $allStoriesList.append($story);
  }

  if (story.isFavorited) {
    $story.find('.remove-button').on('click', () => {
      removeStory(story);
    });
  }

  $allStoriesList.show();
}

function removeStory(story) {
  const index = storyList.stories.indexOf(story);
  if (index !== -1) {
    storyList.stories.splice(index, 1);
  }

  const $storyToRemove = $(`#${story.storyId}`);
  $storyToRemove.remove();

  updateLocalStorage(story);
}

async function submitNewStory(event) {
  event.preventDefault();

  const title = document.getElementById('story-title').value;
  const author = document.getElementById('story-author').value;
  const url = document.getElementById('story-url').value;

  let newStory = await storyList.addStory(currentUser, { title, author, url });
}

document.getElementById('new-story-form').addEventListener('submit', submitNewStory);