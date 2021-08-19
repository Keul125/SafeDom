

var currentTab;
var badColorTheme;
var goodColorTheme;
var themeStatus;



function isSupportedProtocol(urlString) {
    var supportedProtocols = ["https:", "http:", "ftp:", "file:"];
    var url = document.createElement('a');
    url.href = urlString;
    return supportedProtocols.indexOf(url.protocol) != -1;
}



function updateActiveTab(tabs) {
  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then(updateTab);
  
}


async function updateTab(tabs) {
        
    tabs = await browser.tabs.query({active: true, currentWindow: true});
        
        
    if (tabs[0]) {
      currentTab = tabs[0];
      if (isSupportedProtocol(currentTab.url)) {
          
        var domain = (new URL(currentTab.url)).hostname;
        
        let currentWindow = await browser.windows.getLastFocused();
          

        if (listBookmarkUrls.indexOf(domain) === -1) {
            
            if(themeStatus!=1) {
                themeStatus = 1;
                
                badColorTheme = JSON.parse(JSON.stringify(badColorTheme))
                console.log('badColorTheme')
                console.log(badColorTheme)
                browser.theme.update(currentWindow.id, badColorTheme );
                    
                
            }
            
        } else {
            if(themeStatus!=2) {
                themeStatus = 2;
                
                goodColorTheme = JSON.parse(JSON.stringify(goodColorTheme))
                console.log('goodColorTheme')
                console.log(goodColorTheme)
                browser.theme.update(currentWindow.id, goodColorTheme );
            }
            
        }
        
          
      } else {
	
	
		if(themeStatus!=2) {
			//themeStatus = 2;
			
			goodColorTheme = JSON.parse(JSON.stringify(goodColorTheme))
			console.log('goodColorTheme')
			console.log(goodColorTheme)
			browser.theme.update(currentWindow.id, goodColorTheme );
		}
		
		
		console.log(`URL unsupported: '${currentTab.url}'.`)
      }
    }
  }





var listBookmarkUrls = [];
function listBookmarkDomains() {

    function onFulfilled(bookmarkItems) {
        for (item of bookmarkItems) {
            if (isSupportedProtocol(item.url)) {
                var domain = (new URL(item.url)).hostname;
                if (listBookmarkUrls.indexOf(domain) === -1) listBookmarkUrls.push(domain);
            }
        }
    }

    function onRejected(error) {
        console.log(`An error: ${error}`);
    }

    var searching = browser.bookmarks.search({});
    searching.then(onFulfilled, onRejected);
    
    

}



async function onGot(item) {
    
    console.log('----------')
    console.log(item)
    console.log(item.themebackup)
    
    
    if(item.themebackup) {

        console.log('THEME IN STORAGE2:');
        themeLoaded(item.themebackup);

    } else {
        console.log('SAVING THEME2:');

        var currentWindow = await browser.windows.getLastFocused();
        var currentTheme = await browser.theme.getCurrent(currentWindow.id);

        browser.storage.local.set({
            themebackup:  currentTheme
        });
        themeLoaded(currentTheme);
    }
}

async function onError(error) {
    console.log(`Error: ${error}`);
}

async function initExtension() {
    let gettingItem = browser.storage.local.get("themebackup");
    gettingItem.then(onGot, onError);
}









async function themeLoaded(item) {
    badColorTheme = JSON.parse(JSON.stringify(item))
    goodColorTheme = JSON.parse(JSON.stringify(item))


    badColorTheme.colors.toolbar_field = "#FFBBBB"
    // goodColorTheme.colors.toolbar_field = "#BBFFBB"
    // goodColorTheme.colors.toolbar_field = "#D7D7D7"
    

    var request = new XMLHttpRequest();
    request.open('GET', item.images.theme_frame, true);
    request.responseType = 'blob';
    request.onload = function() {
        var reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload =  function(e){
            goodColorTheme.images.theme_frame = e.target.result
            badColorTheme.images.theme_frame = e.target.result
        };
    };
    request.send();

    listBookmarkDomains();
    updateActiveTab();
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