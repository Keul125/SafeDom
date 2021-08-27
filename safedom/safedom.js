

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
    // Load safedomStorageConfig from localstorage if available
    let safedomConfigStorage = await browser.storage.local.get("safedomStorageConfig");
    if (safedomConfigStorage.safedomStorageConfig) {
        console.log('DEBUG: CONFIG IN STORAGE')

        if(JSON.stringify(safedomConfigStorage.safedomStorageConfig) !== JSON.stringify(safedomConfig)) {
            // Change in config: clear tabs cache and theme status
            tabsUrls=[];
            themeStatus=0;
        }
        safedomConfig = safedomConfigStorage.safedomStorageConfig;
    } else {
        console.log('DEBUG: CONFIG NOT IN STORAGE')
        console.log(safedomConfig);
    }
}


async function loadTheme() {
    // Load theme from storage
    let item = await browser.storage.local.get("Storage");
    if(item.Storage) {
        // console.log('DEBUG: THEME IN STORAGE')
        currentTheme = item.Storage;

    // If theme not in storage, save in it
    } else {
        // console.log('DEBUG: THEME NOT IN STORAGE')
        let currentWindow = await browser.windows.getLastFocused();
        currentTheme = await browser.theme.getCurrent(currentWindow.id);

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
}



async function loadList() {
    // Load safedomConfig from localstorage if available
    let safedomConfigStorage = await browser.storage.local.get("safedomStorageInternalList");
    if (safedomConfigStorage.safedomStorageInternalList) {
        console.log('DEBUG: safedomStorageInternalList IN STORAGE')
        console.log(safedomConfigStorage.safedomStorageInternalList)
        console.log(safedomInternalList)

        
        if(JSON.stringify(safedomConfigStorage.safedomStorageInternalList) !== JSON.stringify(safedomInternalList)) {
            // Change in list: clear tabs cache and theme status
            tabsUrls=[];
            themeStatus=0;
            console.log('DEBUG: OK4 exit loadList')
        }
        
        console.log('DEBUG: OK2 exit loadList')
       safedomInternalList = safedomConfigStorage.safedomStorageInternalList;
        console.log('DEBUG: OK3 exit loadList')
    } else {
        safedomInternalList = {
            'loaded':true,
            'list':[]
        };
        console.log('DEBUG: safedomInternalList NOT IN STORAGE')
    }
        console.log('DEBUG: OK exit loadList')
    console.log(safedomInternalList);
}

async function saveList() {
    browser.storage.local.set({
        safedomStorageInternalList:  JSON.parse(JSON.stringify(safedomInternalList))
    });
}
function saveobj() {
    browser.storage.local.set({
        safedomStorageConfig:  JSON.parse(JSON.stringify(safedomConfig))
    });
}
function saveTheme() {
    browser.storage.local.set({
        safedomStorageThemeBackup:  JSON.parse(JSON.stringify(currentTheme))
    });
}





async function checkIfInList(domain) {

    console.log(safedomInternalList)


    let inDomain = safedomInternalList.list.indexOf(domain) !== -1;

    // checking without subdomain
    if(!inDomain
        && domain.indexOf('.') !== -1
        && safedomConfig.subdomainCkbox
    ) {
        domain=domain.substring(domain.indexOf('.')+1);
        inDomain = safedomInternalList.list.indexOf(domain) !== -1;
    }
    return inDomain
}


async function checkIfInDomain(domain) {

    let inDomain = listBookmarkUrls.indexOf(domain) !== -1;

    // checking without subdomain
    if(!inDomain
        && (domain.split(".").length - 1) > 1 // il doit y avoir plus d'un point dans le nom de domaine
        && safedomConfig.subdomainCkbox
    ) {
        domain=domain.substring(domain.indexOf('.')+1);
        inDomain = listBookmarkUrls.indexOf(domain) !== -1;
    }
    return inDomain
}



async function checkIfInDomainHistory(domain) {
    let occurences = 0

    let searching = await browser.history.search({
        text: '://'+domain,
        startTime: 0
    });
    console.log('searching')
    console.log(searching)
    //occurences +=  searching.length;
    occurences +=  searching.reduce((a, b) => a + b.visitCount, 0);

    // checking without subdomain
    if( (domain.split(".").length - 1) > 1 // il doit y avoir plus d'un point dans le nom de domaine
        && safedomConfig.subdomainCkbox
    ) {
        domain=domain.substring(domain.indexOf('.')+1);
        searching = await browser.history.search({
            text: '://'+domain,
            startTime: 0
        });
        console.log('searching2')
        console.log(searching)
        //occurences +=  searching.length;
        occurences +=  searching.reduce((a, b) => a + b.visitCount, 0);
    }
    return occurences
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
    if(!currentTheme) return;
    
    console.log('currentTheme?');
    console.log(JSON.stringify(currentTheme));
    console.log('lastWindow?');
    console.log(lastWindow);
    
    if(lastWindow) {
        console.log('lastWindow DETECTEDDDDD');
        console.log(lastWindow);
        
    }
    
    
    tabs = await browser.tabs.query({active: true, currentWindow: true});

    if (tabs[0]) {
      currentTab = tabs[0];

      if (isSupportedProtocol(currentTab.url)) {
          
        console.log('isSupportedProtocol')  
        console.log(isSupportedProtocol(currentTab.url))  
        console.log(currentTab.url)  
          

    
        await loadSafedomConfig()
        await loadList()
        let domain = await getDomain(currentTab.url);




        console.log('domain')  
        console.log(domain)  
        
        console.log('tabsUrls')  
        console.log(tabsUrls)  


          

        // If domain for current tab didn't change, don't waste time checking in bookmarks
        if (!tabsUrls[tabs[0]['windowId']])
            tabsUrls[tabs[0]['windowId']]=[];
        if (!tabsUrls[tabs[0]['windowId']][tabs[0]['id']])
            tabsUrls[tabs[0]['windowId']][tabs[0]['id']]=[];



        if (tabsUrls[tabs[0]['windowId']][tabs[0]['id']] &&
            tabsUrls[tabs[0]['windowId']][tabs[0]['id']][0] === domain) {


                        
                console.log('tabsUrls changeColor')  
                console.log(tabsUrls[tabs[0]['windowId']][tabs[0]['id']][1])  


                await changeColor(tabsUrls[tabs[0]['windowId']][tabs[0]['id']][1]);
                return;
            }



        // Checking in bookmarks
        let inDomain = await checkIfInDomain(domain);

        let inDomainHistory = await checkIfInDomainHistory(domain);
        
        let inList = await checkIfInList(domain);
        
        
        
        
        console.log('inDomain/hist/list')  
        console.log(inDomain)  
        console.log(inDomainHistory)  
        console.log(inList)  
        console.log(safedomInternalList)  



        
        
        // console.log('inDomainHistory');
        // console.log(safedomConfig.histoCkbox);
        // console.log(safedomConfig.histoNum);
        // console.log(inDomainHistory);
        
        
        // return;

        
        if(!inDomain
            && safedomConfig.histoCkbox
            && inDomainHistory >= safedomConfig.histoNum) {
            inDomain=true;
        }

        console.log('============inList')
        console.log(inList)

        if(!inDomain
            && inList) {
            inDomain=true;
        }

        // cache the checking
        tabsUrls[tabs[0]['windowId']][tabs[0]['id']] = [domain,inDomain];

        
        console.log('============changeColor inDomain')
        console.log(inDomain)


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
    //console.log(inDomain,lastWindowParam)

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









///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

