//indexed db to store images nd video
let req=indexedDB.open("gallery",1);
let database;

req.addEventListener("success",function(){
  database=req.result;

});

req.addEventListener("upgradeneeded",function(){
    let db=req.result;
    //object ke andr choti choti json object bnte hai with unique id
    db.createObjectStore("media",{keyPath:"mId"});
});

req.addEventListener("error",function(){});

//function to save data ie url nd blob in js script of record nd capture
function saveMedia(media){
    if(!database) return;
    let data={
        mId:Date.now(),
        mediadata:media,
    };
    //media ko save krane ke liye dbms me ab uper data me media aa gyi usko save krane ko dbms me
    let tx=database.transaction("media","readwrite");
    //object store se media uthaya jisme data dalna hai
    let mediaobjectstore=tx.objectStore("media");
    mediaobjectstore.add(data);
}

//ye function ab meri gallery me sb kuch save kradega
function viewMedia(){
    if(!database) return;
    //isme data save hoga
    let gallerycontainer=document.querySelector(".gallery-container");

    //read krao sara data or gallery m daalo
    let tx=database.transaction("media","readonly");
    let mediaobjectstore=tx.objectStore("media");//jo usme media aai hogi video url sb pdhlo
    
    let req=mediaobjectstore.openCursor();//open kia cursor jisse hum jo bhi data hai media me vo sara pdh ske line by line or save kr ske
    req.addEventListener("success",function(){
        cursor=req.result;
        if(cursor){
            //div bnao or usme card bnao har ek ke liye or save krao
            let mediacard=document.createElement("div");
            mediacard.classList.add("media-card");
            //iss html me buttons bnenge download ke sbke or unki css yha access hogi gallery.css
            mediacard.innerHTML = `<div class="actual-media"></div>
            <div class="media-buttons">
                <button class="media-download">Download</button>
                <button data-mid="${cursor.value.mId}" class="media-delete">Delete</button>
            </div>`;

            //ab sb create ho gya usme vidoe img dalo
            let data=cursor.value.mediadata;
            let actualmediadiv=mediacard.querySelector(".actual-media");
            
            let downloadbtn=mediacard.querySelector(".media-download");
            let deletebtn=mediacard.querySelector(".media-delete");//selector of media card html made above

            deletebtn.addEventListener("click",function(e){
                //to delete in databse
                //here we get id as string change to no
                let mId=Number(e.currentTarget.getAttribute("data-mid"));
                deletemode(mId);


                //to delete on ui ie from gallery container
                e.currentTarget.parentElement.parentElement.remove();
                
            })
            let type=typeof data;
            if(type=="string"){
                //img
                let image=document.createElement("img");
                image.src=data;
                //download ho jae function call krdo
                downloadbtn.addEventListener("click",function(){
                  downloadMedia(data,"image");
                });

                actualmediadiv.append(image);
            }
            else if(type=="object"){
                //video
               
                let video=document.createElement("video");
                //convert obj to url
                let url=URL.createObjectURL(data);
                //call download function here
                downloadbtn.addEventListener("click",function(){
                    downloadMedia(url,"video");
                })
                
                video.src=url;
                video.autoplay=true
                video.loop=true
                video.controls=true
                video.muted=true

                actualmediadiv.append(video);
            }
            //finally add buttons nd actual media data photo and video in gallery
            gallerycontainer.append(mediacard);
            cursor.continue();
            //same process done for each video nd photo

        }
    })
}
//now when we click on download btn the image nd video gets downloaded
function downloadMedia(url,type){
    //make anchor tag nd put link
    //then download
    let anchor=document.createElement("a");
    anchor.href=url;
    if(type=="image"){
        anchor.download="image.png";

    }
    else{
        //video
        anchor.download="video.mp4";
    }
    anchor.click();
    anchor.remove();

}

//when we click on delete delete from ui nd database also this is done by transactn bcz any changes in dbms is done by transactn
function deletemode(mId){
    let tx=database.transaction("media","readwrite");
    let mediastore=tx.objectStore("media");
    //database me media pdh kr vha se selected ki mid htado vo khud ht jaega  ab jha jrurt hai vha usko call krdo
    mediastore.delete(mId);
}