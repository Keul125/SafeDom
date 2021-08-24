

let currentTab;
let lastWindow;

let themeStatus=0;
let tabsUrls=[];
let listBookmarkUrls = [];

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
        console.log('DEBUG: CONFIG IN STORAGE')

        if(JSON.stringify(safedomConfigStorage.safedomConfig) !== JSON.stringify(safedomConfig)) {
            // Change in config: clear tabs cache and theme status
            tabsUrls=[];
            themeStatus=0;
        }

        safedomConfig = safedomConfigStorage.safedomConfig;
    } else {
        console.log('DEBUG: CONFIG NOT IN STORAGE')
        console.log(safedomConfig);
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




async function initPopup() {

    document.addEventListener("click", (e) => {
        if(e.target.id === 'openOptionsPage') {
            console.log('OPENING openOptionsPage');
            browser.runtime.openOptionsPage();
        }
    });

    // Display current URL in popup
    let tabs = await browser.tabs.query({active: true, currentWindow: true});
    if (tabs[0]) {
        let domain = await getDomain(tabs[0].url);

        await listBookmarkDomains()
        await loadSafedomConfig()

        let inDomain = await checkIfInDomain(domain);

        console.log(inDomain)


        let inDomainHistory = await checkIfInDomainHistory(domain);



        document.getElementById('current_url2').innerText=' Occurences en l\'historique: '+inDomainHistory;

        if (inDomain) {
            document.getElementById('current_url').innerText=' Déjà en marque-page: '+domain;
        } else {
            document.getElementById('current_url').innerText=' Pas en marque-page: '+domain;
        }

    }
    
}

initPopup();


