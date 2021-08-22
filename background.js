
/*
Todo:
- optimisations: si le domaine de l'onglet ne change pas, ne pas faire de tests => réglé dans 1.1
- lors d'un changement de couleurs ou de bookmarks, vide le cache des tabs => réglé dans 1.2
- tester en retirant un sousdomaine si ça matche toujours un bookmark => réglé dans 1.2
- utiliser https://publicsuffix.org/ ?
- about:debugging#/runtime/this-firefox
- https://addons.mozilla.org/fr/developers/addons

*/


var currentTab;
var currentTheme;
var themeStatus;
var lastWindow;
var tabsurls=[];
var listBookmarkUrls = [];
var safedom_config={
    'sd_ckbox' : true,
    'in_ckbox' : false,
    'out_ckbox' : true,
    'in_color' : '#BBFFBB',
    'out_color' : '#FFBBBB',
    
}

//utility function
function isSupportedProtocol(urlString) {
    var supportedProtocols = ["https:", "http:", "ftp:", "file:"];
    var url = document.createElement('a');
    url.href = urlString;
    return supportedProtocols.indexOf(url.protocol) != -1;
}

async function getDomain(url) {
    var domain= (new URL(url)).hostname;
    //remove www.
    if(domain.substring(0,4) == 'www.') {
        domain=domain.substring(4);
    }
    return domain;
}
    



async function initExtension() {
    
    // Load theme from storage
    var item = await browser.storage.local.get("themebackup");
    if(item.themebackup) {
        currentTheme = item.themebackup;

    // If theme not in storage, save in it
    } else {
        var currentWindow = await browser.windows.getLastFocused();
        currentTheme = await browser.theme.getCurrent(currentWindow.id);
        browser.storage.local.set({
            themebackup:  currentTheme
        });
    }
    
    // BUG : browser.theme.update doesn't accept picture with moz-ext: urls
    // Fix by converting to dataurl
    var request = new XMLHttpRequest();
    request.open('GET', currentTheme.images.theme_frame, true);
    request.responseType = 'blob';
    request.onload = function() {
        var reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload =  function(e){
            currentTheme.images.theme_frame = e.target.result
        };
    };
    request.send();

    listBookmarkDomains();
    
    updateActiveTab();
}



// Store all domains from bookmarks in listBookmarkUrls
async function listBookmarkDomains() {
    var bookmarkItems = await browser.bookmarks.search({});
    for (item of bookmarkItems) {
        if (isSupportedProtocol(item.url)) {
            var domain = await getDomain(item.url);
            if (listBookmarkUrls.indexOf(domain) === -1) listBookmarkUrls.push(domain);
        }
    }
    
    // clear tabs cache and theme status
    tabsurls=[];
    themeStatus=0;
}


    
async function updateActiveTab(tabs) {
        
    tabs = await browser.tabs.query({active: true, currentWindow: true});
        
    if (tabs[0]) {
      currentTab = tabs[0];
      
      
      if (isSupportedProtocol(currentTab.url)) {
          
        var domain = await getDomain(currentTab.url);
        
      
        
        // If domain for current tab didn't change, don't waste time checking in bookmarks
        if (!tabsurls[tabs[0]['windowId']])
            tabsurls[tabs[0]['windowId']]=[];
        if (!tabsurls[tabs[0]['windowId']][tabs[0]['id']]) 
            tabsurls[tabs[0]['windowId']][tabs[0]['id']]=false;
        if (tabsurls[tabs[0]['windowId']][tabs[0]['id']] &&
            tabsurls[tabs[0]['windowId']][tabs[0]['id']][0] == domain) {
                changecolor(tabsurls[tabs[0]['windowId']][tabs[0]['id']][1]);
                return;
            }
        
        // Checking in bookmarks
        var indomain = listBookmarkUrls.indexOf(domain) !== -1;
        
        console.log(safedom_config)
        
        // ckecking without subdomain
        if(!indomain 
            && domain.indexOf('.') !== -1
            && safedom_config.sd_ckbox
            ) {
            domain=domain.substring(domain.indexOf('.')+1);
            var indomain = listBookmarkUrls.indexOf(domain) !== -1;
        }
        
        
        // cache the checking
        tabsurls[tabs[0]['windowId']][tabs[0]['id']] = [domain,indomain];
        
        changecolor(indomain)
          
      } else {

        // unsupported urls (about:config... new empty tab...)
        if(lastWindow) {
            changecolor(true, lastWindow);
        }
      }
    }
}




async function changecolor(indomain, lastWindowParam) {
 
    // manage the windowId
    if (!lastWindowParam) {
        let currentWindow = await browser.windows.getLastFocused();
        lastWindow = currentWindow
    } else {
        lastWindow = lastWindowParam
    }


    // Load safedom_config from localstorage if available
    var safedom_config_storage = await browser.storage.local.get("safedom_config");
    if (safedom_config_storage.safedom_config.sd_ckbox) {
        
        if(JSON.stringify(safedom_config_storage.safedom_config) != JSON.stringify(safedom_config)) {
            // Change in config: clear tabs cache and theme status
            tabsurls=[];
            themeStatus=0;
        }
        
        safedom_config = safedom_config_storage.safedom_config;
    }
    
    
    // Load theme and custom colors
    goodColorTheme = JSON.parse(JSON.stringify(currentTheme))
    badColorTheme = JSON.parse(JSON.stringify(currentTheme))
    if(safedom_config.in_ckbox) {
        goodColorTheme.colors.toolbar_field = safedom_config.in_color
    }
    if(safedom_config.out_ckbox) {
        badColorTheme.colors.toolbar_field = safedom_config.out_color
    }
    
    // apply theme if a change is detected
    if (indomain) {
        if(themeStatus!=2) {
            themeStatus = 2;
            browser.theme.update(lastWindow.id, goodColorTheme );
        }
    } else {
        if(themeStatus!=1) {
            themeStatus = 1;
            browser.theme.update(lastWindow.id, badColorTheme );
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