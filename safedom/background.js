

/*

 about:debugging#/runtime/this-firefox

*/



let currentTab;
let lastWindow;

let themeStatus=0;
let tabsUrls=[];
let listBookmarkUrls = [];

let safedomInternalList= {
    'loaded':false,
    'list':[]
};
let safedomConfig={
    'histoCkbox' : false,
    'histoNum' : 4,
    'subdomainCkbox' : true, // chuck sub domains
    'inCkbox' : false,
    'outCkbox' : true,
    'inColor' : '#BBFFBB',
    'outColor' : '#FFBBBB',
}
let currentTheme={}


async function initExtension() {
    await loadTheme();
    await listBookmarkDomains();
    await updateActiveTab();
}





// listen for bookmarks changes
browser.bookmarks.onCreated.addListener(listBookmarkDomains);
browser.bookmarks.onChanged.addListener(listBookmarkDomains);
browser.bookmarks.onRemoved.addListener(listBookmarkDomains);

// listen to tab changes
browser.tabs.onUpdated.addListener(updateActiveTab);

// update when the extension loads initially
initExtension();

