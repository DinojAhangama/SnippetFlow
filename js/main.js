var languageSelect = document.getElementById('language');
var languageSelectForDelete = document.getElementById('delete-language-select');
var newLanguageInput = document.getElementById('new-language');
var addLanguageButton = document.getElementById('add-language');
var deleteLanguageButton = document.getElementById('delete-language');
var snippetText = document.getElementById('snippet-text');
var addSnippetButton = document.getElementById('add-snippet');
var snippetsList = document.getElementById('snippetsList');

loadLanguages();
loadSnippets();

addLanguageButton.addEventListener('click', function() {
  var newLanguage = newLanguageInput.value.trim();
  if (newLanguage !== '') {
    addLanguage(newLanguage);
    newLanguageInput.value = '';
  }
});

deleteLanguageButton.addEventListener('click', function() {
  var selectedLanguage = languageSelectForDelete.value;
  if (selectedLanguage !== '') {
    deleteLanguage(selectedLanguage);
  }
});

addSnippetButton.addEventListener('click', function() {
  var selectedLanguage = languageSelect.value;
  var snippet = snippetText.value.trim();
  if (selectedLanguage !== '' && snippet !== '') {
    addSnippet(selectedLanguage, snippet);
    snippetText.value = '';
  }
});

function loadLanguages() {
  chrome.storage.sync.get('languages', function(data) {
    var languages = data.languages || [];
    renderLanguages(languages);
  });
}

function loadSnippets() {
  chrome.storage.sync.get('snippets', function(data) {
    var snippets = data.snippets || {};
    renderSnippets(snippets);
  });
}

function addLanguage(language) {
  chrome.storage.sync.get('languages', function(data) {
    var languages = data.languages || [];
    languages.push(language);
    saveLanguages(languages);
    renderLanguages(languages);
  });
}

function deleteLanguage(language) {
  chrome.storage.sync.get(['languages', 'snippets'], function(data) {
    var languages = data.languages || [];
    var snippets = data.snippets || {};

    var index = languages.indexOf(language);
    if (index !== -1) {
      if (snippets[language] && snippets[language].length > 0) {
        var confirmMessage = "Deleting this language will also delete all associated snippets. Are you sure you want to proceed?";
        if (!window.confirm(confirmMessage)) {
          return;
        }
      }
      
      languages.splice(index, 1);
      delete snippets[language];
      saveLanguages(languages);
      saveSnippets(snippets);
      renderLanguages(languages);
      renderSnippets(snippets);
    }
  });
}

function addSnippet(language, snippet) {
  chrome.storage.sync.get('snippets', function(data) {
    var snippets = data.snippets || {};

    if (!snippets[language]) {
      snippets[language] = [];
    }
    
    snippets[language].push(snippet);
    saveSnippets(snippets);
    renderSnippets(snippets);
  });
}

function deleteSnippet(language, index) {
  chrome.storage.sync.get('snippets', function(data) {
    var snippets = data.snippets || {};

    if (snippets[language]) {
      snippets[language].splice(index, 1);
      saveSnippets(snippets);
      renderSnippets(snippets);
    }
  });
}

function saveLanguages(languages) {
  chrome.storage.sync.set({ 'languages': languages });
}

function saveSnippets(snippets) {
  chrome.storage.sync.set({ 'snippets': snippets });
}

function renderLanguages(languages) {
  languageSelect.innerHTML = '';
  languageSelectForDelete.innerHTML = '';
  
  var defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.textContent = 'Select language';
  languageSelect.appendChild(defaultOption);

  var defaultOptionForDelete = document.createElement('option');
  defaultOptionForDelete.value = '';
  defaultOptionForDelete.disabled = true;
  defaultOptionForDelete.selected = true;
  defaultOptionForDelete.textContent = 'Select language';
  languageSelectForDelete.appendChild(defaultOptionForDelete);

  languages.forEach(function(language) {
    var option = document.createElement('option');
    option.value = language;
    option.textContent = language;
    languageSelect.appendChild(option);
    languageSelectForDelete.appendChild(option.cloneNode(true));
  });
}

function renderSnippets(snippets) {
  snippetsList.innerHTML = '';

  for (var language in snippets) {
    if (snippets.hasOwnProperty(language)) {
      var languageHeading = document.createElement('h3');
      languageHeading.textContent = language;
      snippetsList.appendChild(languageHeading);

      var snippetList = document.createElement('ul');

      snippets[language].forEach(function(snippetText, index) {
        var snippetItem = document.createElement('li');
        snippetItem.textContent = snippetText;
        snippetItem.classList.add("snippet-item");

        var buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');

        var copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.classList.add('copy-button');
        copyButton.addEventListener('click', function(text) {
          return function() {
            copySnippetToClipboard(text);
          };
        }(snippetText));

        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', function(lang, idx) {
          return function() {
            deleteSnippet(lang, idx);
          };
        }(language, index));

        buttonGroup.appendChild(copyButton);
        buttonGroup.appendChild(deleteButton);

        snippetItem.appendChild(buttonGroup);
        snippetList.appendChild(snippetItem);
      });

      snippetsList.appendChild(snippetList);
    }
  }
}

function copySnippetToClipboard(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  alert('Snippet copied to clipboard!');
}