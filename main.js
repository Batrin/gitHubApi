const mainSearch = document.querySelector('.main-input');
const responseBody = document.querySelector('.response-body');
const finalRepoList = document.querySelector('.final-repo-list');
const searchMessage = document.querySelector('.search-message');
let resultArr = [];


function addItems(itemList, callback, parentNode) {
    const tempFragment = document.createDocumentFragment();

    for (const item of itemList) {
        let singleItem = callback(item);
        tempFragment.append(singleItem);
    }

    parentNode.append(tempFragment);
}

function createSearchItem(item) {
    let singleItem = document.createElement('a');
    singleItem.classList.add('single-search-item');
    singleItem.textContent = item.name;
    singleItem.setAttribute('data-repo-id', item.id);
    return singleItem;
}

function createRepoItem(item) {
    let repoItem = document.createElement('div');
    repoItem.classList.add('single-repo-item');

    let closeButton = document.createElement('button');
    closeButton.classList.add('single-repo-item__close-button');
    closeButton.innerHTML = 'Delete';

    repoItem.append(closeButton);

    let repoProperty = {
        name: item.name,
        owner: item.owner['login'],
        stars: item.stargazers_count
    }
    for (const repoPropertyKey in repoProperty) {
        let repoSingleInfo = document.createElement('p');
        repoSingleInfo.textContent = `${repoPropertyKey}: ${repoProperty[repoPropertyKey]}`;
        repoItem.append(repoSingleInfo);
    }
    return repoItem;
}

function clearSearchBody() {
    responseBody.innerHTML = '';
}

function clearResultBlock() {
    finalRepoList.innerHTML = '';
}

function clearSearchInput() {
    mainSearch.value = "";
}

async function getSearchList(event) {
    searchMessage.classList.remove('show');
    let requestText = event.target.value;
    requestText = requestText.replace(/\s/g, '');
    if (requestText.length === 0) return;

    let response = await fetch(`https://api.github.com/search/repositories?q=${requestText}&per_page=5`);
    if (response.ok) {
        let repoList = await response.json();
        repoList = repoList.items;
        resultArr = repoList;

        if (repoList.length === 0) {
            searchMessage.classList.add('show');
        }

        clearSearchBody();
        clearResultBlock();

        addItems(repoList, createSearchItem, responseBody)
    } else {
        console.log('error');
    }
}

const debounce = (fn, delay) => {
    let timeout;
    return function () {
        const fnCall = () => {
            fn.apply(this, arguments);
        }

        clearTimeout(timeout);

        timeout = setTimeout(fnCall, delay);
    }
}

getSearchList = debounce(getSearchList, 500);

mainSearch.addEventListener('keyup', getSearchList);
responseBody.addEventListener('click', async function addItem(event) {
    if (event.target.className === 'single-search-item') {
        let singleItemId = event.target.dataset.repoId;
        let finalArr = resultArr.filter(el => el.id == singleItemId);

        addItems(finalArr, createRepoItem, finalRepoList);

        clearSearchBody();

    }
})

finalRepoList.addEventListener('click', function removeItem(event) {
    if (event.target.className = 'single-repo-item__close-button') {

        clearSearchInput();
        clearResultBlock();

        event.target.removeEventListener('click', removeItem);
    }
})

