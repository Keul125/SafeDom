



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



async function initOptions() {
    console.log('initOptions()');
    
    
    
    document.addEventListener("change", (e) => {
        if(e.target.id === 'hi_ckbox') {
            safedomConfig.histoCkbox=e.target.checked;
            saveobj();
        }
        if(e.target.id === 'hi_num') {
            safedomConfig.histoNum=e.target.value;
            saveobj();
        }
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
        
        
        
    document.addEventListener("click", (e) => {
        if(e.target.id === 'button_export') {
            console.log('EXPORT button')
            
            let obj=URL.createObjectURL(new File([document.getElementById('textarea_list').value],'Export safeDom.txt', { type: "text/plain",}));
            let downloading = browser.downloads.download(
                {
                    'url':obj,
                    'filename':'Export safeDom.txt'
                }
            )
            //window.URL.revokeObjectURL(obj);
            
        }
        if(e.target.id === 'button_save') {
            console.log('SAVE button')
            safedomInternalList.list=document.getElementById('textarea_list').value.trim().split("\n");
            saveList();
        }
    });

    await loadSafedomConfig();
    await loadList();
    
    
    document.getElementById('textarea_list').value=safedomInternalList.list.join("\n");


    document.getElementById('hi_ckbox').checked=safedomConfig.histoCkbox
    document.getElementById('hi_num').value=safedomConfig.histoNum
    document.getElementById('sd_ckbox').checked=safedomConfig.subdomainCkbox
    document.getElementById('in_ckbox').checked=safedomConfig.inCkbox
    document.getElementById('out_ckbox').checked=safedomConfig.outCkbox
    document.getElementById('in_color').value=safedomConfig.inColor
    document.getElementById('out_color').value=safedomConfig.outColor
}




initOptions();