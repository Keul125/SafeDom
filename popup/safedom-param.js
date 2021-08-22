

var currentsave={
    'sd_ckbox' : true,
    'in_ckbox' : false,
    'out_ckbox' : true,
    'in_color' : '#BBFFBB',
    'out_color' : '#FFBBBB',
    
}


async function getDomain(url) {
    var domain= (new URL(url)).hostname;
    //remove www.
    if(domain.substring(0,4) == 'www.') {
        domain=domain.substring(4);
    }
    return domain;
}
    




async function initPopup() {
    
    
    document.addEventListener("click", (e) => {
        if(e.target.id == 'openOptionsPage') {
            console.log('OPENENG openOptionsPage');
            browser.runtime.openOptionsPage();
        }
    });
        
    

    
    // Affiche l'adresse courante dans la popup
    tabs = await browser.tabs.query({active: true, currentWindow: true});
    if (tabs[0]) {
        var domain = await getDomain(tabs[0].url);
        
        document.getElementById('current_url').innerHTML=' Ajouter à la liste blanche: '+domain;
    }
    
}



initPopup();


