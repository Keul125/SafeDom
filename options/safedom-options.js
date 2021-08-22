

var currentsave={
    'sd_ckbox' : true,
    'in_ckbox' : false,
    'out_ckbox' : true,
    'in_color' : '#BBFFBB',
    'out_color' : '#FFBBBB',
    
}



async function initPopup() {
    
    document.addEventListener("change", (e) => {
        if(e.target.id == 'sd_ckbox') {
            currentsave.sd_ckbox=e.target.checked;
            saveobj();
        }
        
        if(e.target.id == 'in_ckbox') {
            currentsave.in_ckbox=e.target.checked;
            saveobj();
        }
        
        if(e.target.id == 'out_ckbox') {
            currentsave.out_ckbox=e.target.checked;
            saveobj();
        }

        if(e.target.id == 'in_color') {
            currentsave.in_color=e.target.value;
            saveobj();
        }

        if(e.target.id == 'out_color') {
            currentsave.out_color=e.target.value;
            saveobj();
        }
    });

    let gettingItem = browser.storage.local.get("safedom_config");
    gettingItem.then(onGot, onError);
    
    
}


async function onGot(item) {
	
	console.log('safedom optcfg')
	console.log(item)
	
	
    if(item.safedom_config.sd_ckbox) {
        currentsave=item.safedom_config;
        document.getElementById('sd_ckbox').checked=currentsave.sd_ckbox
        document.getElementById('in_ckbox').checked=currentsave.in_ckbox
        document.getElementById('out_ckbox').checked=currentsave.out_ckbox
        document.getElementById('in_color').value=currentsave.in_color
        document.getElementById('out_color').value=currentsave.out_color
    } 
}
async function onError(error) {
    console.log(`Error: ${error}`);
}


function saveobj() {
    browser.storage.local.set({
        safedom_config:  currentsave
    });
}



initPopup();


