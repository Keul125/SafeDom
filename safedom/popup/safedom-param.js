


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








async function initPopup() {
    console.log('initPopup()');

    document.addEventListener("click", (e) => {
        if(e.target.id === 'open_options_page') {
            browser.runtime.openOptionsPage();
        }
        
        if(e.target.id === 'add_domain') {
            let domain = document.getElementById('current_domain').value;
            
            
            console.log('AJOUT')
            if(!safedomInternalList.loaded) {
                alert('Liste interne non-chargée !');
            } else {
                console.log('AJOUTOK')
                safedomInternalList.list.push(''+domain);
                saveList();
            }
            console.log('ajout '+domain);
        }
        

        
    });

    // Display current URL in popup
    let tabs = await browser.tabs.query({active: true, currentWindow: true});
    if (tabs[0] && isSupportedProtocol(tabs[0].url)) {
        
        let domain = await getDomain(tabs[0].url);
        
        console.log(domain)
        
            
        await listBookmarkDomains();
        await loadSafedomConfig();
        await loadList();
        
        let inDomain = await checkIfInDomain(domain);

        console.log(inDomain);


        let inDomainHistory = await checkIfInDomainHistory(domain);
        let inDomainList = await checkIfInList(domain);


        document.getElementById('current_domain').value=domain;
        document.getElementById('current_domain_span').innerText=domain;


        document.getElementById('in_history').style.display=(inDomainHistory)?'':'none';
        if(inDomainHistory) {
            document.getElementById('in_history_visits').innerText=inDomainHistory;
        }

        
        document.getElementById('add_domain').disabled=inDomain;
        
        document.getElementById('in_bookmarks').style.display=(inDomain)?'':'none';
        document.getElementById('in_list').style.display=(inDomainList)?'':'none';
        
    } else {
        
        document.getElementById('in_list').style.display='none';
        document.getElementById('in_history').style.display='none';
        document.getElementById('in_bookmarks').style.display='none';
    }
    

    
}

initPopup();

