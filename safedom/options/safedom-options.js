
let safedomConfig={
    'subdomainCkbox' : true, // chuck sub domains
    'inCkbox' : false,
    'outCkbox' : true,
    'inColor' : '#BBFFBB',
    'outColor' : '#FFBBBB',
}

async function initPopup() {
    
    document.addEventListener("change", (e) => {
        if(e.target.id === 'sd_ckbox') {
            safedomConfig.subdomainCkbox=e.target.checked;
            saveobj();
        }
        if(e.target.id === 'in_ckbox') {
            safedomConfig.inCkbox=e.target.checked;
            saveobj();
        }
        if(e.target.id === 'out_ckbox') {
            safedomConfig.outCkbox=e.target.checked;
            saveobj();
        }
        if(e.target.id === 'in_color') {
            safedomConfig.inColor=e.target.value;
            saveobj();
        }
        if(e.target.id === 'out_color') {
            safedomConfig.outColor=e.target.value;
            saveobj();
        }
    });

    let safedomConfigStorage = await browser.storage.local.get("safedomConfig");
    if(safedomConfigStorage.safedomConfig) {
        safedomConfig=safedomConfigStorage.safedomConfig;
    }


    document.getElementById('sd_ckbox').checked=safedomConfig.subdomainCkbox
    document.getElementById('in_ckbox').checked=safedomConfig.inCkbox
    document.getElementById('out_ckbox').checked=safedomConfig.outCkbox
    document.getElementById('in_color').value=safedomConfig.inColor
    document.getElementById('out_color').value=safedomConfig.outColor
}




function saveobj() {
    browser.storage.local.set({
        safedomConfig:  safedomConfig
    });
}



initPopup();
