const mainSearch = document.querySelector('.main-input');
const responseBody = document.querySelector('.response-body');
const finalRepoList = document.querySelector('.final-repo-list');
const searchMessage = document.querySelector('.search-message');

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
    return singleItem;
}

function createRepoItem(item) {
    let repoItem = document.createElement('div');
    repoItem.classList.add('single-repo-item');
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

async function getSearchList(event) {
    searchMessage.classList.remove('show');
    let requestText = event.target.value;
    requestText = requestText.replace(/\s/g, '');
    if (requestText.length === 0) return;

    let response = await fetch(`https://api.github.com/search/repositories?q=${requestText}&per_page=5`);
    if (response.ok) {
        let repoList = await response.json();
        repoList = repoList.items;

        if (repoList.length === 0) {
            searchMessage.classList.add('show');
        }

        responseBody.innerHTML = '';
        finalRepoList.innerHTML = '';

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
responseBody.addEventListener('click', async function (event) {
    if (event.target.className === 'single-search-item') {
        finalRepoList.innerHTML = '';
        let reposName = event.target.textContent;
        let response = await fetch(`https://api.github.com/search/repositories?q=${reposName}&per_page=5`);
        let repoInfo = await response.json();
        repoInfo = repoInfo.items;
        addItems(repoInfo, createRepoItem, finalRepoList);
        mainSearch.value = '';
    }
})
