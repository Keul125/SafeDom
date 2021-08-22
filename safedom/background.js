
let currentTab;
let lastWindow;

let themeStatus=0;
let tabsUrls=[];
let listBookmarkUrls = [];

let safedomConfig={
    'subdomainCkbox' : true, // chuck sub domains
    'inCkbox' : false,
    'outCkbox' : true,
    'inColor' : '#BBFFBB',
    'outColor' : '#FFBBBB',
}
let currentTheme={}

//utility function
function isSupportedProtocol(urlString) {
    let supportedProtocols = ["https:", "http:", "ftp:", "file:"];
    let url = document.createElement('a');
    url.href = urlString;
    return supportedProtocols.indexOf(url.protocol) !== -1;
}

async function getDomain(url) {
    let domain= (new URL(url)).hostname;
    if(domain.substring(0,4) === 'www.') {
        domain=domain.substring(4); //remove www.
    }
    return domain;
}

async function loadSafedomConfig() {
    // Load safedomConfig from localstorage if available
    let safedomConfigStorage = await browser.storage.local.get("safedomConfig");
    if (safedomConfigStorage.safedomConfig) {
        if(JSON.stringify(safedomConfigStorage.safedomConfig) !== JSON.stringify(safedomConfig)) {
            // Change in config: clear tabs cache and theme status
            tabsUrls=[];
            themeStatus=0;
        }
        safedomConfig = safedomConfigStorage.safedomConfig;
    }
}


async function checkIfInDomain(domain) {

    let inDomain = listBookmarkUrls.indexOf(domain) !== -1;

    // checking without subdomain
    if(!inDomain
        && domain.indexOf('.') !== -1
        && safedomConfig.subdomainCkbox
    ) {
        domain=domain.substring(domain.indexOf('.')+1);
        inDomain = listBookmarkUrls.indexOf(domain) !== -1;
    }
    return inDomain
}





async function initExtension() {

    // Load theme from storage
    let item = await browser.storage.local.get("safedomThemeBackup");
    if(item.safedomThemeBackup) {
        // console.log('DEBUG: THEME IN STORAGE')
        currentTheme = item.safedomThemeBackup;

    // If theme not in storage, save in it
    } else {
        // console.log('DEBUG: THEME NOT IN STORAGE')
        let currentWindow = await browser.windows.getLastFocused();
        currentTheme = await browser.theme.getCurrent(currentWindow.id);
        browser.storage.local.set({
            safedomThemeBackup:  currentTheme
        });
    }

    // BUG : browser.theme.update doesn't accept picture with moz-ext: urls
    // Fix by converting to dataurl
    let request = new XMLHttpRequest();
    request.open('GET', currentTheme.images.theme_frame, true);
    request.responseType = 'blob';
    request.onload = function() {
        let reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload =  function(e){
            currentTheme.images.theme_frame = e.target.result
        };
    };
    request.send();
    await listBookmarkDomains();
    await updateActiveTab();
}



// Store all domains from bookmarks in listBookmarkUrls
async function listBookmarkDomains() {
    let bookmarkItems = await browser.bookmarks.search({});
    for (item of bookmarkItems) {
        if (isSupportedProtocol(item.url)) {
            let domain = await getDomain(item.url);
            if (listBookmarkUrls.indexOf(domain) === -1) listBookmarkUrls.push(domain);
        }
    }
    // clear tabs cache and theme status
    tabsUrls=[];
    themeStatus=0;
}



async function updateActiveTab(tabs) {

    await loadSafedomConfig()

    tabs = await browser.tabs.query({active: true, currentWindow: true});

    if (tabs[0]) {
      currentTab = tabs[0];

      if (isSupportedProtocol(currentTab.url)) {

        let domain = await getDomain(currentTab.url);


        // If domain for current tab didn't change, don't waste time checking in bookmarks
        if (!tabsUrls[tabs[0]['windowId']])
            tabsUrls[tabs[0]['windowId']]=[];
        if (!tabsUrls[tabs[0]['windowId']][tabs[0]['id']])
            tabsUrls[tabs[0]['windowId']][tabs[0]['id']]=[];



        if (tabsUrls[tabs[0]['windowId']][tabs[0]['id']] &&
            tabsUrls[tabs[0]['windowId']][tabs[0]['id']][0] === domain) {

                await changeColor(tabsUrls[tabs[0]['windowId']][tabs[0]['id']][1]);
                return;
            }

        // Checking in bookmarks
        let inDomain = await checkIfInDomain(domain);

        // cache the checking
        tabsUrls[tabs[0]['windowId']][tabs[0]['id']] = [domain,inDomain];

        await changeColor(inDomain)

      } else {

        // unsupported urls (about:config... new empty tab...)
        if(lastWindow) {
            await changeColor(true, lastWindow);
        }
      }
    }
}





async function changeColor(inDomain, lastWindowParam) {

    // manage the windowId
    if (!lastWindowParam) {
        lastWindow = await browser.windows.getLastFocused();
    } else {
        lastWindow = lastWindowParam
    }


    // Load theme and custom colors
    inColorTheme = JSON.parse(JSON.stringify(currentTheme))
    outColorTheme = JSON.parse(JSON.stringify(currentTheme))
    if(safedomConfig.inCkbox) {
        inColorTheme.colors.toolbar_field = safedomConfig.inColor
    }
    if(safedomConfig.outCkbox) {
        outColorTheme.colors.toolbar_field = safedomConfig.outColor
    }



    // apply theme if a change is detected
    if (inDomain) {
        if(themeStatus!==2) {
            themeStatus = 2;
            browser.theme.update(lastWindow.id, inColorTheme );
        }
    } else {
        if(themeStatus!==1) {
            themeStatus = 1
            browser.theme.update(lastWindow.id, outColorTheme );
        }
    }
}




// listen for bookmarks changes
browser.bookmarks.onCreated.addListener(listBookmarkDomains);
browser.bookmarks.onChanged.addListener(listBookmarkDomains);
browser.bookmarks.onRemoved.addListener(listBookmarkDomains);

// listen to tab changes
browser.tabs.onUpdated.addListener(updateActiveTab);
browser.tabs.onActivated.addListener(updateActiveTab);
browser.windows.onFocusChanged.addListener(updateActiveTab);

// update when the extension loads initially
initExtension();